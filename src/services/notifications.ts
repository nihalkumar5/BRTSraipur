import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';

// Configure high-priority notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
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

export interface SmartTripAlert {
  id: string;
  routeBadge: string;
  routeName?: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  departureMins: number; // minutes from midnight
  arrivalMins: number;   // minutes from midnight
  minutesBeforeDeparture: number | null; // e.g. 5, 10, 15, 30 or null if disabled
  wakeUpAlarmEnabled: boolean;           // true if 1-stop-before wake-up alarm is enabled
  departureTriggerTime?: string;
  wakeUpTriggerTime?: string;
  departureNotifId?: string;
  wakeUpNotifId?: string;
  createdAt: number;
}

// In-memory active reminders
let activeReminders: ScheduledReminder[] = [];
let currentActiveAlert: SmartTripAlert | null = null;
const STORAGE_KEY = 'tatpar_active_trip_alert_v1';

/**
 * Multi-layer tactile vibration trigger.
 * Works seamlessly on:
 * 1. Native Android / iOS (via React Native Vibration)
 * 2. Web / Mobile Browsers (via Navigator.vibrate)
 * 3. React Native Android WebView host (via postMessage)
 */
export function triggerTactileVibration(pattern: number[] = [0, 400, 150, 400]): void {
  // 1. React Native Vibration (Native Android / iOS)
  try {
    Vibration.vibrate(pattern);
  } catch (e) {}

  // 2. Web Browser Vibration API (Mobile Chrome / PWA)
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const webPattern = pattern.slice(1);
      navigator.vibrate(webPattern.length > 0 ? webPattern : [400, 150, 400]);
    } catch (e) {}
  }

  // 3. React Native WebView Host bridge
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView?.postMessage) {
    try {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'TRIGGER_VIBRATION',
          payload: { pattern },
        })
      );
    } catch (e) {}
  }
}

/**
 * Synthesizes a pleasant transit 2-tone chime ("ding-dong") via Web Audio API
 */
export function playAlertChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Tone 1: D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // Tone 2: A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {}
}

/**
 * Configure Android notification channels with strong vibration patterns.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      // Channel 1: Standard bus departure reminders
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Bus Departure Alerts',
        description: 'Notifications for upcoming bus departures and schedule alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#18258F',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Channel 2: High-priority destination wake-up alarm (stronger buzz pattern)
      await Notifications.setNotificationChannelAsync('stop_wake_alarm', {
        name: 'Destination Wake-up Stop Alarms',
        description: 'Loud vibration alarm before reaching your destination stop',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 800, 250, 800, 250, 800],
        lightColor: '#EA580C',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    } catch (e) {
      console.warn('Error setting Android notification channels:', e);
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

/**
 * Reads the active trip alert from persistent storage (localStorage) or memory.
 * Clears expired alerts (> 3 hours after creation).
 */
export function getActiveTripAlert(): SmartTripAlert | null {
  if (currentActiveAlert) {
    // Check if expired (> 3.5 hours old)
    if (Date.now() - currentActiveAlert.createdAt > 3.5 * 60 * 60 * 1000) {
      cancelSmartTripAlert();
      return null;
    }
    return currentActiveAlert;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SmartTripAlert = JSON.parse(stored);
        if (parsed && parsed.createdAt) {
          if (Date.now() - parsed.createdAt > 3.5 * 60 * 60 * 1000) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
          }
          currentActiveAlert = parsed;
          return parsed;
        }
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Saves the active trip alert to localStorage and in-memory cache.
 */
export function saveActiveTripAlert(alert: SmartTripAlert | null): void {
  currentActiveAlert = alert;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (alert) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alert));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  }
}

function formatTimeString(targetMins: number): string {
  const normalized = ((targetMins % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Schedules a comprehensive Smart Trip Alert:
 * - Departure reminder (optional: 5m, 10m, 15m, 30m)
 * - Wake-up Stop Alarm (optional: ~4m before arrival at destination)
 */
export async function scheduleSmartTripAlert(params: {
  routeBadge: string;
  routeName?: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  departureMins: number;
  arrivalMins: number;
  minutesBeforeDeparture: number | null;
  wakeUpAlarmEnabled: boolean;
}): Promise<SmartTripAlert> {
  const {
    routeBadge,
    routeName,
    fromStop,
    toStop,
    departureTime,
    arrivalTime,
    departureMins,
    arrivalMins,
    minutesBeforeDeparture,
    wakeUpAlarmEnabled,
  } = params;

  await requestNotificationPermissions();

  // Cancel any previous alert first
  await cancelSmartTripAlert();

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  let departureNotifId: string | undefined;
  let departureTriggerTime: string | undefined;

  // 1. DEPARTURE REMINDER
  if (minutesBeforeDeparture !== null && minutesBeforeDeparture > 0) {
    const isTomorrow = departureMins < currentMins;
    const targetMins = departureMins - minutesBeforeDeparture;
    departureTriggerTime = formatTimeString(targetMins);

    let targetDate = new Date();
    targetDate.setSeconds(0);
    targetDate.setMilliseconds(0);
    if (isTomorrow) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const h = Math.floor(((targetMins % 1440) + 1440) % 1440 / 60);
    const m = ((targetMins % 1440) + 1440) % 1440 % 60;
    targetDate.setHours(h, m, 0, 0);

    let triggerSeconds = Math.round((targetDate.getTime() - Date.now()) / 1000);
    if (!isTomorrow && triggerSeconds <= 0) {
      triggerSeconds = 3; // alert immediately
    } else {
      triggerSeconds = Math.max(1, triggerSeconds);
    }

    try {
      // WebView message
      if (typeof window !== 'undefined' && (window as any).ReactNativeWebView?.postMessage) {
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
              minutesBefore: minutesBeforeDeparture,
              isWakeUpAlarm: false,
            },
          })
        );
      }

      // Native React Native
      if (Platform.OS !== 'web') {
        departureNotifId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🚍 ${routeBadge} departs in ${minutesBeforeDeparture} mins!`,
            body: `Board at ${fromStop} by ${departureTime}. Estimated arrival at ${toStop}: ${arrivalTime}.`,
            sound: 'default',
            color: '#18258F',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: triggerSeconds,
            channelId: 'default',
          },
        });
      }

      // Web Notification fallback
      if (Platform.OS === 'web' && typeof window !== 'undefined' && !(window as any).ReactNativeWebView?.postMessage) {
        if ('Notification' in window && Notification.permission === 'granted') {
          setTimeout(() => {
            try {
              new Notification(`🚍 ${routeBadge} departs in ${minutesBeforeDeparture} mins!`, {
                body: `Board at ${fromStop} by ${departureTime}. ETA at ${toStop}: ${arrivalTime}.`,
                icon: '/assets/images/icon.png',
              });
              triggerTactileVibration([0, 500, 200, 500]);
              playAlertChime();
            } catch (e) {}
          }, Math.min(triggerSeconds * 1000, 10000));
        }
      }
    } catch (e) {
      console.warn('Error scheduling departure alert:', e);
    }
  }

  // 2. DESTINATION WAKE-UP STOP ALARM
  let wakeUpNotifId: string | undefined;
  let wakeUpTriggerTime: string | undefined;

  if (wakeUpAlarmEnabled) {
    // Alert ~4 mins before arrival (or 1 stop prior)
    const wakeBufferMins = 4;
    const isTomorrow = arrivalMins < currentMins;
    const targetMins = arrivalMins - wakeBufferMins;
    wakeUpTriggerTime = formatTimeString(targetMins);

    let targetDate = new Date();
    targetDate.setSeconds(0);
    targetDate.setMilliseconds(0);
    if (isTomorrow) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const h = Math.floor(((targetMins % 1440) + 1440) % 1440 / 60);
    const m = ((targetMins % 1440) + 1440) % 1440 % 60;
    targetDate.setHours(h, m, 0, 0);

    let triggerSeconds = Math.round((targetDate.getTime() - Date.now()) / 1000);
    if (!isTomorrow && triggerSeconds <= 0) {
      triggerSeconds = 3;
    } else {
      triggerSeconds = Math.max(1, triggerSeconds);
    }

    try {
      // WebView message
      if (typeof window !== 'undefined' && (window as any).ReactNativeWebView?.postMessage) {
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
              minutesBefore: wakeBufferMins,
              isWakeUpAlarm: true,
            },
          })
        );
      }

      // Native React Native
      if (Platform.OS !== 'web') {
        wakeUpNotifId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🔔 WAKE UP: Next stop is ${toStop}!`,
            body: `Arriving in ~4 mins (${arrivalTime}). Please prepare to de-board!`,
            sound: 'default',
            color: '#EA580C',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: triggerSeconds,
            channelId: 'stop_wake_alarm',
          },
        });
      }

      // Web Notification fallback
      if (Platform.OS === 'web' && typeof window !== 'undefined' && !(window as any).ReactNativeWebView?.postMessage) {
        if ('Notification' in window && Notification.permission === 'granted') {
          setTimeout(() => {
            try {
              new Notification(`🔔 WAKE UP: Next stop is ${toStop}!`, {
                body: `Arriving in ~4 mins (${arrivalTime}). Please prepare to de-board!`,
                icon: '/assets/images/icon.png',
              });
              triggerTactileVibration([0, 800, 250, 800, 250, 800]);
              playAlertChime();
            } catch (e) {}
          }, Math.min(triggerSeconds * 1000, 15000));
        }
      }
    } catch (e) {
      console.warn('Error scheduling wake-up stop alarm:', e);
    }
  }

  // Tactile confirmation buzz when arming alerts
  triggerTactileVibration([0, 180, 100, 180]);
  playAlertChime();

  const newAlert: SmartTripAlert = {
    id: `smart_${Date.now()}`,
    routeBadge,
    routeName,
    fromStop,
    toStop,
    departureTime,
    arrivalTime,
    departureMins,
    arrivalMins,
    minutesBeforeDeparture,
    wakeUpAlarmEnabled,
    departureTriggerTime,
    wakeUpTriggerTime,
    departureNotifId,
    wakeUpNotifId,
    createdAt: Date.now(),
  };

  saveActiveTripAlert(newAlert);
  return newAlert;
}

/**
 * Cancels all active trip alerts and removes them from storage.
 */
export async function cancelSmartTripAlert(): Promise<void> {
  const alert = getActiveTripAlert();
  if (alert) {
    if (Platform.OS !== 'web') {
      try {
        if (alert.departureNotifId) {
          await Notifications.cancelScheduledNotificationAsync(alert.departureNotifId);
        }
        if (alert.wakeUpNotifId) {
          await Notifications.cancelScheduledNotificationAsync(alert.wakeUpNotifId);
        }
      } catch (e) {}
    }

    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView?.postMessage) {
      try {
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'CANCEL_NOTIFICATION',
            payload: {
              departureNotifId: alert.departureNotifId,
              wakeUpNotifId: alert.wakeUpNotifId,
            },
          })
        );
      } catch (e) {}
    }
  }

  saveActiveTripAlert(null);
  activeReminders = [];
  triggerTactileVibration([0, 100]); // Short cancel tap
}

// -------------------------------------------------------------
// LEGACY COMPATIBILITY HELPERS (Pre-existing caller support)
// -------------------------------------------------------------
export async function scheduleBusNotification(params: {
  routeBadge: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  departureMins: number;
  minutesBefore: number;
}): Promise<ScheduledReminder | null> {
  const alert = await scheduleSmartTripAlert({
    routeBadge: params.routeBadge,
    fromStop: params.fromStop,
    toStop: params.toStop,
    departureTime: params.departureTime,
    arrivalTime: params.arrivalTime,
    departureMins: params.departureMins,
    arrivalMins: params.departureMins + 40,
    minutesBeforeDeparture: params.minutesBefore,
    wakeUpAlarmEnabled: true,
  });

  const legacyRem: ScheduledReminder = {
    id: alert.id,
    routeBadge: alert.routeBadge,
    fromStop: alert.fromStop,
    toStop: alert.toStop,
    departureTime: alert.departureTime,
    arrivalTime: alert.arrivalTime,
    triggerTime: alert.departureTriggerTime || params.departureTime,
    minutesBefore: params.minutesBefore,
    notificationId: alert.departureNotifId,
  };

  activeReminders = [legacyRem];
  return legacyRem;
}

export function getActiveReminders(): ScheduledReminder[] {
  const current = getActiveTripAlert();
  if (!current) return [];
  return [
    {
      id: current.id,
      routeBadge: current.routeBadge,
      fromStop: current.fromStop,
      toStop: current.toStop,
      departureTime: current.departureTime,
      arrivalTime: current.arrivalTime,
      triggerTime: current.departureTriggerTime || current.departureTime,
      minutesBefore: current.minutesBeforeDeparture || 15,
      notificationId: current.departureNotifId,
    },
  ];
}

export async function cancelReminder(id: string): Promise<void> {
  await cancelSmartTripAlert();
}
