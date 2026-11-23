import { cardById, lessonById, lessonOfCard, LESSONS, lessonsInStage } from './content';
import { Lesson, ReviewCard, Step } from './content/types';
import { AppState } from './state';

// ---------- Dates (local calendar days, "YYYY-MM-DD") ----------
export function dayStr(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}
const parse = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return { y, m, d };
};
export function addDays(day: string, n: number) {
  const { y, m, d } = parse(day);
  return dayStr(new Date(y, m - 1, d + n));
}
/** b - a in days */
export function diffDays(a: string, b: string) {
  const A = parse(a);
  const B = parse(b);
  return Math.round((Date.UTC(B.y, B.m - 1, B.d) - Date.UTC(A.y, A.m - 1, A.d)) / 86400000);
}
export function weekStart(day: string) {
  const { y, m, d } = parse(day);
  const wd = (new Date(y, m - 1, d).getDay() + 6) % 7; // Monday = 0
  return addDays(day, -wd);
}

// ---------- Streaks ----------
/** One free streak freeze every week. */
export function refreshFreezes(s: AppState): AppState {
  const wk = weekStart(dayStr());
  return s.freezeWeek === wk ? s : { ...s, freezes: 1, freezeWeek: wk };
}

export function currentStreak(s: AppState) {
  if (!s.lastDoneDay) return 0;
  const gap = diffDays(s.lastDoneDay, dayStr());
  if (gap <= 1) return s.streak;
  return gap - 1 <= s.freezes ? s.streak : 0;
}

export const doneToday = (s: AppState) => s.lastDoneDay === dayStr();

export function markDayDone(s: AppState): { state: AppState; usedFreeze: boolean; newDay: boolean } {
  const t = dayStr();
  if (s.lastDoneDay === t) return { state: s, usedFreeze: false, newDay: false };
  let streak = 1;
  let freezes = s.freezes;
  let usedFreeze = false;
  if (s.lastDoneDay) {
    const gap = diffDays(s.lastDoneDay, t);
    if (gap === 1) streak = s.streak + 1;
    else if (gap - 1 <= freezes) {
      freezes -= gap - 1;
      usedFreeze = true;
      streak = s.streak + 1;
    }
  }
  const daysDone = [...s.daysDone.filter((d) => diffDays(d, t) < 14), t];
  return {
    state: { ...s, streak, bestStreak: Math.max(s.bestStreak, streak), lastDoneDay: t, freezes, daysDone },
    usedFreeze,
    newDay: true,
  };
}

// ---------- Levels ----------
export const LEVELS = [
  { xp: 0, title: 'Data Curious' },
  { xp: 150, title: 'Spreadsheet Sorcerer' },
  { xp: 400, title: 'Stats Sleuth' },
  { xp: 800, title: 'Query Queen' },
  { xp: 1400, title: 'Chart Charmer' },
  { xp: 2200, title: 'Pandas Pro' },
  { xp: 3200, title: 'Dashboard Diva' },
  { xp: 4500, title: 'Analyst' },
];

export function levelFor(xp: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const next = LEVELS[i + 1];
  return { level: i + 1, title: LEVELS[i].title, base: LEVELS[i].xp, next: next ? next.xp : null };
}

export const XP = { correct: 10, review: 5, lesson: 20 };

// ---------- Spaced review (Leitner boxes) ----------
const INTERVALS = [1, 2, 4, 8, 16, 32];

export function addLessonCards(s: AppState, lesson: Lesson): AppState {
  const reviews = { ...s.reviews };
  const due = addDays(dayStr(), 1);
  lesson.review.forEach((c) => {
    if (!reviews[c.id]) reviews[c.id] = { box: 0, due };
  });
  return { ...s, reviews };
}

export function gradeCard(s: AppState, id: string, correct: boolean): AppState {
  const cur = s.reviews[id] ?? { box: 0, due: dayStr() };
  const box = correct ? Math.min(cur.box + 1, INTERVALS.length - 1) : 0;
  return { ...s, reviews: { ...s.reviews, [id]: { box, due: addDays(dayStr(), INTERVALS[box]) } } };
}

export function dueCards(s: AppState, limit = 3): ReviewCard[] {
  const t = dayStr();
  return Object.entries(s.reviews)
    .filter(([, v]) => v.due <= t)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .slice(0, limit)
    .map(([id]) => cardById(id))
    .filter((c): c is ReviewCard => !!c);
}

/** Random practice cards from everything learned so far. */
export function practiceCards(s: AppState, limit = 5): ReviewCard[] {
  const ids = Object.keys(s.reviews).sort(() => Math.random() - 0.5);
  return ids
    .slice(0, limit)
    .map((id) => cardById(id))
    .filter((c): c is ReviewCard => !!c);
}

/** New lessons per day. Keeps the course a long, steady habit instead of a binge. */
export const DAILY_NEW_LIMIT = 2;
export const newLessonsToday = (s: AppState) => (s.newToday.day === dayStr() ? s.newToday.count : 0);
export const dailyLimit = (s: AppState) => s.settings.dailyGoal || DAILY_NEW_LIMIT;
export const canStartNew = (s: AppState) => newLessonsToday(s) < dailyLimit(s);

export const nextLesson = (s: AppState) => LESSONS.find((l) => !s.completed.includes(l.id)) ?? null;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Mastery ----------
/** Share of questions she may miss and still pass a lesson. */
export const MAX_MISS_RATE = 0.3;
export const missRate = (s: AppState) => (s.settings.mastery === 'gentle' ? 0.45 : MAX_MISS_RATE);
export const isQuestion = (st: Step) => st.kind !== 'explain' && st.kind !== 'reflect';

// ---------- Bug Book ----------
export const bugKey = (lessonId: string, step: number) => `${lessonId}#${step}`;
export const cardBugKey = (cardId: string) => `card#${cardId}`;

export function addBugs(s: AppState, keys: { lessonId: string; step: number }[]): AppState {
  if (!keys.length) return s;
  const bugs = { ...s.bugs };
  const t = dayStr();
  keys.forEach(({ lessonId, step }) => {
    const k = bugKey(lessonId, step);
    const prev = bugs[k];
    bugs[k] = { lessonId, step, day: t, due: addDays(t, 7), misses: (prev?.misses ?? 0) + 1 };
  });
  return { ...s, bugs };
}

export function addCardBug(s: AppState, cardId: string): AppState {
  const k = cardBugKey(cardId);
  const t = dayStr();
  const prev = s.bugs[k];
  return { ...s, bugs: { ...s.bugs, [k]: { lessonId: 'card', step: -1, day: t, due: addDays(t, 7), misses: (prev?.misses ?? 0) + 1 } } };
}

export function resolveBug(s: AppState, key: string, correct: boolean): AppState {
  const b = s.bugs[key];
  if (!b) return s;
  const bugs = { ...s.bugs };
  if (correct) delete bugs[key];
  else bugs[key] = { ...b, due: addDays(dayStr(), 3), misses: b.misses + 1 };
  return { ...s, bugs };
}

/** Item shown in warm-ups / practice: a review card or a past mistake. */
export type ReviewItem =
  | { kind: 'card'; card: ReviewCard; key: string }
  | { kind: 'bug'; key: string; lessonId: string; step: number; cardId?: string };

export function bugItem(key: string, s: AppState): ReviewItem | null {
  const b = s.bugs[key];
  if (!b) return null;
  if (b.lessonId === 'card') {
    const c = cardById(key.slice('card#'.length));
    return c ? { kind: 'card', card: c, key } : null;
  }
  const l = lessonById(b.lessonId);
  if (!l || !l.steps[b.step]) return null;
  return { kind: 'bug', key, lessonId: b.lessonId, step: b.step };
}

export function dueBugs(s: AppState, limit: number): ReviewItem[] {
  const t = dayStr();
  return Object.entries(s.bugs)
    .filter(([, b]) => b.due <= t)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([k]) => bugItem(k, s))
    .filter((x): x is ReviewItem => !!x)
    .slice(0, limit);
}

export function allBugs(s: AppState): ReviewItem[] {
  return Object.keys(s.bugs)
    .map((k) => bugItem(k, s))
    .filter((x): x is ReviewItem => !!x);
}

const asItems = (cards: ReviewCard[]): ReviewItem[] => cards.map((c) => ({ kind: 'card', card: c, key: c.id }));

/** Warm-up: up to 2 due mistakes, spaced-review cards, plus one card from her weakest topic. */
export function warmupItems(s: AppState, total = 3): ReviewItem[] {
  const bugs = dueBugs(s, 2);
  const items = [...bugs, ...asItems(dueCards(s, total - bugs.length))];
  const weak = weakLessons(s, 1)[0];
  if (weak) {
    const extra = weak.review.find((c) => !items.some((it) => it.kind === 'card' && it.card.id === c.id));
    if (extra) items.push({ kind: 'card', card: extra, key: extra.id });
  }
  return items;
}

export const practiceItems = (s: AppState, n = 5) => asItems(practiceCards(s, n));

/** Lite day: a 2-minute review that still counts for the streak. */
export function liteItems(s: AppState): ReviewItem[] {
  const w = warmupItems(s, 3);
  return w.length ? w : asItems(practiceCards(s, 3));
}

// ---------- Stage bosses & cheat sheets ----------
export const bossOf = (stage: number) => lessonsInStage(stage).find((l) => /boss/i.test(l.title));
export const stageBeaten = (s: AppState, stage: number) => {
  const b = bossOf(stage);
  return !!b && s.completed.includes(b.id);
};

// ---------- Adaptive review ----------
export function recordStat(s: AppState, lessonId: string | undefined, ok: boolean): AppState {
  if (!lessonId) return s;
  const cur = s.stats[lessonId] ?? { seen: 0, right: 0 };
  return { ...s, stats: { ...s.stats, [lessonId]: { seen: cur.seen + 1, right: cur.right + (ok ? 1 : 0) } } };
}
export const statLessonForCard = (cardId: string) => lessonOfCard(cardId);

/** Lessons she finds hardest: seen at least 3 questions, under 75% right. */
export function weakLessons(s: AppState, n = 3): Lesson[] {
  return Object.entries(s.stats)
    .filter(([id, st]) => st.seen >= 3 && st.right / st.seen < 0.75 && s.completed.includes(id))
    .sort((a, b) => a[1].right / a[1].seen - b[1].right / b[1].seen)
    .slice(0, n)
    .map(([id]) => lessonById(id))
    .filter((l): l is Lesson => !!l);
}
export const accuracy = (s: AppState, lessonId: string) => {
  const st = s.stats[lessonId];
  return st && st.seen ? st.right / st.seen : null;
};

/** Focus practice for one lesson: its review cards + any of its Bug Book items. */
export function focusItems(s: AppState, lessonId: string): ReviewItem[] {
  const l = lessonById(lessonId);
  if (!l) return [];
  const bugs = Object.entries(s.bugs)
    .filter(([, b]) => b.lessonId === lessonId)
    .map(([k]) => bugItem(k, s))
    .filter((x): x is ReviewItem => !!x);
  return [...bugs, ...asItems(l.review)].slice(0, 6);
}

// ---------- Meng's corner ----------
/** Gentle daily change: Meng gets a little peckish and a little bored, never below 10. */
export function tickPet(s: AppState): AppState {
  const t = dayStr();
  const p = s.pet;
  if (!p.day) return { ...s, pet: { ...p, day: t } };
  const days = diffDays(p.day, t);
  if (days <= 0) return s;
  return {
    ...s,
    pet: { ...p, day: t, fullness: Math.max(10, p.fullness - 12 * days), happiness: Math.max(10, p.happiness - 8 * days) },
  };
}
export const addTreats = (s: AppState, n: number): AppState => (n ? { ...s, pet: { ...s.pet, treats: s.pet.treats + n } } : s);
