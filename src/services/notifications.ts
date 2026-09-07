import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ScheduledReminder {
  id: string;
  routeBadge: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  triggerTime: string;
  minutesBefore: number;
  notificationId?: string;
}

// In-memory registry of active reminders
let activeReminders: ScheduledReminder[] = [];

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Bus Departure Alerts',
        description: 'Notifications for upcoming bus departures and schedule alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
      });
    } catch (e) {
      console.warn('Error setting Android notification channel:', e);
    }
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return true;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permissions:', e);
    return false;
  }
}

export async function scheduleBusNotification(
  params: {
    routeBadge: string;
    fromStop: string;
    toStop: string;
    departureTime: string;
    arrivalTime: string;
    departureMins: number; // minutes from midnight
    minutesBefore: number; // e.g. 30 or 15
  }
): Promise<ScheduledReminder | null> {
  const { routeBadge, fromStop, toStop, departureTime, arrivalTime, departureMins, minutesBefore } = params;

  await requestNotificationPermissions();

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  
  let targetMins = departureMins - minutesBefore;
  let targetDate = new Date();
  targetDate.setSeconds(0);
  targetDate.setMilliseconds(0);

  if (targetMins < currentMins) {
    // Bus is tomorrow
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const hours = Math.floor(((targetMins % 1440) + 1440) % 1440 / 60);
  const minutes = ((targetMins % 1440) + 1440) % 1440 % 60;
  targetDate.setHours(hours, minutes, 0, 0);

  const triggerSeconds = Math.max(1, Math.round((targetDate.getTime() - Date.now()) / 1000));
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const triggerTimeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

  let notifId: string | undefined;

  try {
    if (Platform.OS !== 'web') {
      notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚍 ${routeBadge} departing in ${minutesBefore} mins!`,
          body: `Board at ${fromStop} by ${departureTime}. Estimated arrival at ${toStop}: ${arrivalTime}.`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
        },
      });
    } else {
      // Web notification support
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification(`🚍 ${routeBadge} departing in ${minutesBefore} mins!`, {
            body: `Board at ${fromStop} by ${departureTime}. ETA at ${toStop}: ${arrivalTime}.`,
            icon: '/assets/images/icon.png',
          });
        }, Math.min(triggerSeconds * 1000, 10000)); // Cap for web demo
      }
    }
  } catch (err) {
    console.warn('Could not schedule native notification:', err);
  }

  const reminder: ScheduledReminder = {
    id: `rem_${Date.now()}_${minutesBefore}`,
    routeBadge,
    fromStop,
    toStop,
    departureTime,
    arrivalTime,
    triggerTime: triggerTimeString,
    minutesBefore,
    notificationId: notifId,
  };

  activeReminders.push(reminder);
  return reminder;
}

export function getActiveReminders(): ScheduledReminder[] {
  return [...activeReminders];
}

export async function cancelReminder(id: string): Promise<void> {
  const item = activeReminders.find(r => r.id === id);
  if (item && item.notificationId && Platform.OS !== 'web') {
    try {
      await Notifications.cancelScheduledNotificationAsync(item.notificationId);
    } catch (e) {
      console.warn('Error cancelling notification:', e);
    }
  }
  activeReminders = activeReminders.filter(r => r.id !== id);
}
