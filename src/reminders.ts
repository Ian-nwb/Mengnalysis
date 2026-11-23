import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const MESSAGES = [
  'Your daily dose is ready ☕',
  "5 minutes today, analyst tomorrow. Let's go!",
  "Your streak misses you 🔥",
  "Today's lesson is a quick one. You've got this.",
  'Data puzzle time! 🧩',
  'Tiny steps, big skills. Ready?',
  'Future analyst, reporting for duty? 📊',
];

/** Schedules the next 14 days of reminders, each with a different message. */
export async function scheduleReminders(hour: number, minute: number, skipToday: boolean) {
  try {
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily', {
        name: 'Daily reminder',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = new Date();
    for (let d = skipToday ? 1 : 0; d < 14; d++) {
      const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hour, minute);
      if (when <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Tori', body: MESSAGES[when.getDate() % MESSAGES.length] },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: 'daily' },
      });
    }
    return true;
  } catch {
    return false;
  }
}

export const REMINDER_TIMES = [
  { label: 'Morning · 8:00', hour: 8, minute: 0 },
  { label: 'Lunch · 12:30', hour: 12, minute: 30 },
  { label: 'Evening · 7:00', hour: 19, minute: 0 },
  { label: 'Night · 9:00', hour: 21, minute: 0 },
];
