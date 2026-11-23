import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { canStartNew, dayStr, doneToday, dueBugs, nextLesson } from './engine';
import { AppState } from './state';

// Every notification comes from Meng. Warm, playful, never guilt-tripping.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAILY = [
  'Mrrp! Your daily dose is ready ☕',
  'I saved you a spot on the path 🐾',
  'Five cozy minutes of data? I\'ll bring the purrs.',
  'Lesson time! I already warmed up the spreadsheet 📊',
  'A tiny lesson a day keeps the confusion away 🐾',
  'Your future analyst self says hi! (So do I.)',
  'Today\'s lesson is a quick one. You\'ve got this 💜',
  'Ready to learn something new? I\'m stretching already.',
  'Data puzzle time! 🧩 Come solve it with me.',
  'Lessons earn treats… just saying 🐟',
  'Pssst. Your path misses you. So do I.',
  'Let\'s turn some numbers into answers today!',
  'Meow-ning check-in: one lesson, then cuddles?',
  'Your streak is purring. One lesson keeps it warm 🔥',
  'Tiny steps, big skills. Ready when you are.',
];
const SECOND = [
  'Little reminder from your favorite cat 🐾',
  'Whenever you\'re ready, your lesson is waiting!',
  'Quick dose before the day runs off? ☕',
  'I\'m napping on your lesson. Come wake me up!',
];
const SAVER = [
  'Your streak is curled up waiting for today\'s lesson 🔥',
  'Just one quick review keeps your streak warm tonight 🐾',
  'Busy day? A 2-minute Lite day still counts!',
  'Evening snack idea: one tiny lesson 🐟',
];
const COMEBACK = [
  'No pressure! I\'ll be here whenever you\'re ready 💜',
  'I kept your spot warm on the path 🐾',
  'Missed you! A Lite day is a gentle way back.',
  'Your progress is safe with me. Come say hi anytime.',
];
const pick = (arr: string[], seed: number) => arr[Math.abs(seed) % arr.length];

export const REMINDER_TIMES = [
  { label: 'Morning · 8:00', hour: 8, minute: 0 },
  { label: 'Lunch · 12:30', hour: 12, minute: 30 },
  { label: 'Evening · 7:00', hour: 19, minute: 0 },
  { label: 'Night · 9:00', hour: 21, minute: 0 },
];

async function ready() {
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meng', {
      name: 'Meng',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#E5A2F2',
      vibrationPattern: [0, 120, 80, 120],
    });
  }
  return true;
}

async function at(date: Date, body: string, screen: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Meng 🐾', body, data: { screen }, color: '#E5A2F2' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: 'meng' },
  });
}

/**
 * Re-plans the next 14 days of Meng's notes from the current progress and settings.
 * Called on launch, after each session and when settings change. Notes for the
 * coming days only fire if she hasn't opened the app since, so day 2+ use "comeback" wording.
 */
export async function syncReminders(s: AppState) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const st = s.settings;
    if (!st.notifications || !s.onboarded) return true;
    if (!(await ready())) return false;
    const now = new Date();
    const done = doneToday(s);
    const capped = done && !!nextLesson(s) && !canStartNew(s);
    const bugsSoon = dueBugs(s, 1).length > 0;
    for (let d = 0; d < 14; d++) {
      const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      if (st.daysOff.includes(base.getDay())) continue;
      const seed = base.getDate() + d;
      const time = (h: number, m: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
      const future = (dt: Date) => dt > now;
      if (d === 0 && done) continue; // today's dose is done: no nudges today
      const away = d >= 2;
      let body = away ? pick(COMEBACK, seed) : pick(DAILY, seed);
      let screen = 'home';
      if (d === 1 && capped) body = 'Your next lesson unlocked overnight! Ready? 🌙→☀️';
      else if (d === 1 && bugsSoon && seed % 2 === 0) {
        body = 'A couple of old bugs are ready to be squashed 🐞 Quick warm-up?';
        screen = 'bugbook';
      }
      const main = time(st.reminderHour, st.reminderMinute);
      if (future(main)) await at(main, body, screen);
      if (st.secondReminder && !away) {
        const second = time(st.secondHour, 0);
        if (future(second) && second.getTime() !== main.getTime()) await at(second, pick(SECOND, seed), 'home');
      }
      if (st.streakSaver && !away && st.reminderHour < 20) {
        const saver = time(20, 30);
        if (future(saver)) await at(saver, pick(SAVER, seed), 'home');
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function testNotification(name: string) {
  if (!(await ready())) return false;
  await at(new Date(Date.now() + 4000), `Hi ${name}! This is how my notes will look 🐾`, 'meng');
  return true;
}

export const todayKey = dayStr;
