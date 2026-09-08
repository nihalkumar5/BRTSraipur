import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
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
        lightColor: '#18258F',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    } catch (e) {
      console.warn('Error setting Android notification channel:', e);
    }
  }

  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView?.postMessage) {
    try {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'REQUEST_NOTIFICATION_PERMISSION' })
      );
    } catch (e) {}
  }

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch (e) {
        return false;
      }
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

  let targetDate = new Date();
  targetDate.setSeconds(0);
  targetDate.setMilliseconds(0);

  // If departureMins is earlier than currentMins, the bus is departing tomorrow (e.g. next morning)
  const isTomorrow = departureMins < currentMins;
  if (isTomorrow) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const targetMins = departureMins - minutesBefore;
  const hours = Math.floor(((targetMins % 1440) + 1440) % 1440 / 60);
  const minutes = ((targetMins % 1440) + 1440) % 1440 % 60;
  targetDate.setHours(hours, minutes, 0, 0);

  let triggerSeconds = Math.round((targetDate.getTime() - Date.now()) / 1000);
  if (!isTomorrow && triggerSeconds <= 0) {
    // If bus is today but the reminder threshold is right now or already passed:
    // Alert immediately in 3 seconds!
    triggerSeconds = 3;
  } else {
    triggerSeconds = Math.max(1, triggerSeconds);
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const triggerTimeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

  let notifId: string | undefined;

  try {
    // 1. If running inside React Native Android/iOS WebView host (The Mobile App)
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView?.postMessage) {
      try {
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'SCHEDULE_BUS_NOTIFICATION',
            payload: {
              routeBadge,
              fromStop,
              toStop,
              departureTime,
              arrivalTime,
              triggerSeconds,
              minutesBefore,
            },
          })
        );
      } catch (e) {
        console.warn('Could not postMessage to ReactNativeWebView:', e);
      }
    }

    // 2. Pure native React Native environment
    if (Platform.OS !== 'web') {
      notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚍 ${routeBadge} departing in ${minutesBefore} mins!`,
          body: `Board at ${fromStop} by ${departureTime}. Estimated arrival at ${toStop}: ${arrivalTime}.`,
          sound: 'default',
          color: '#18258F',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
          channelId: 'default',
        },
      });
    }

    // 3. Pure Desktop/Mobile Web browser (PWA)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !(window as any).ReactNativeWebView?.postMessage) {
      if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          try {
            new Notification(`🚍 ${routeBadge} departing in ${minutesBefore} mins!`, {
              body: `Board at ${fromStop} by ${departureTime}. ETA at ${toStop}: ${arrivalTime}.`,
              icon: '/assets/images/icon.png',
            });
          } catch (e) {}
        }, Math.min(triggerSeconds * 1000, 10000));
      }
    }
  } catch (err) {
    console.warn('Could not schedule notification:', err);
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
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView?.postMessage) {
    try {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'CANCEL_NOTIFICATION',
          payload: { id, notificationId: item?.notificationId },
        })
      );
    } catch (e) {}
  }
  activeReminders = activeReminders.filter(r => r.id !== id);
}
