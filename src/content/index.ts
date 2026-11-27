import { Lesson, ReviewCard, Stage, Step } from './types';
import { stage1 } from './stage1';
import { stage2 } from './stage2';
import { stage3 } from './stage3';
import { stage4 } from './stage4';
import { stage5 } from './stage5';
import { stage6 } from './stage6';
import { stage7 } from './stage7';
import { stage8 } from './stage8';
import { stage1x, stage2x, stage3x, stage4x, stage5x, stage6x, stage7x, stage8x } from './extra';
import { stage0 } from './extra/s0';
import { stage1y, stage2y } from './extra/s12b';
import { stage3y, stage4y, stage5y, stage6y, stage8y, stage11y } from './extra/s3to11b';
import { stage10, stage7m, stage9 } from './extra/s7910';
import { stage11 } from './extra/s11';
import { stage12 } from './extra/s12d';
import { stage2w } from './extra/s2w';
import { stage4z, stage8z } from './extra/s4z8z';
import { GAMES } from './extra/games';
import { stage13, stage1z, stage2v, stage3z, stage4p, stage5z, stage6z } from './extra/s13';

export const STAGES: Stage[] = [
  { n: 0, title: 'Data Foundations', blurb: 'Files, keys and how data is stored' },
  { n: 1, title: 'Thinking in Data', blurb: 'How analysts think' },
  { n: 2, title: 'Google Sheets & Excel', blurb: 'Formulas, pivots, Apps Script' },
  { n: 3, title: 'Statistics', blurb: 'Averages, spread, experiments' },
  { n: 4, title: 'SQL', blurb: 'Talk to databases, even messy ones' },
  { n: 5, title: 'Charts & Stories', blurb: 'Show what the data says' },
  { n: 6, title: 'Python', blurb: 'pandas and beyond' },
  { n: 7, title: 'Modern Data Stack', blurb: 'Warehouses, dbt, pipelines' },
  { n: 8, title: 'Dashboards & BI', blurb: 'Power BI, Looker Studio, Tableau' },
  { n: 9, title: 'AI-Assisted Analytics', blurb: 'Work faster, verify everything' },
  { n: 10, title: 'Business Analytics', blurb: 'Funnels, CAC, LTV, root causes' },
  { n: 11, title: 'Industry Workflows', blurb: 'Git, lineage, events, DuckDB' },
  { n: 12, title: 'Industry Packs', blurb: 'Marketing, finance, SaaS, ops & more' },
  { n: 13, title: 'Real-World Projects', blurb: 'End-to-end case studies' },
  { n: 14, title: 'Career', blurb: 'Portfolio and interviews' },
];

/** Puts extra lessons right before the stage's boss level. */
function withExtras(base: Lesson[], extra: Lesson[]) {
  const boss = base.findIndex((l) => /boss/i.test(l.title));
  if (boss < 0) return [...base, ...extra];
  return [...base.slice(0, boss), ...extra, ...base.slice(boss)];
}

// "Explain it like I'm your boss" boxes for the original boss levels.
const BOSS_REFLECT: Record<string, [string, string]> = {
  s1l8: [
    'Explain your plan to the coffee shop owner.',
    "We'll compare sales before and after 3pm over the last three months, after removing duplicate sales. Afternoon orders are fewer but bigger, so we'll look at money earned, not just the number of orders, before deciding to close early.",
  ],
  s2l15: [
    'Tell the owner which drink made the most money in June, and how you know.',
    'After fixing spelling differences and removing duplicate sales, I totaled June sales by drink. Iced Latte earned the most, and the sorted bar chart shows it clearly ahead, so it\'s worth keeping it stocked and promoted.',
  ],
  s3l10: [
    'Tell the owner whether the new menu worked.',
    "Orders went up after the new menu, but tourist season started at the same time and a few huge catering orders inflate the average. So we can't be sure the menu caused it yet. Let's test it fairly for a few weeks.",
  ],
  s4l11: [
    "Share this listener's Year in Review highlights with the product team.",
    'Their top artist is Lo & Behold, with the most total plays. Their favorite Pop songs are Golden Hour and Sunflower Fields, and Rock songs tend to be the longest. That would make a fun, personal year-in-review screen.',
  ],
  s5l9: [
    'Give the owner your 30-second summary.',
    'Afternoon cold drink sales have more than tripled since March. Instead of closing early, we should stay open in the afternoons and run a cold-drink special, then check the numbers after a month.',
  ],
  s6l10: [
    "Explain to your manager what your teammate's code found.",
    'The code removes duplicate songs, keeps only Pop music, and adds up plays for each artist. It shows the three Pop artists people listen to most, which tells us who to feature in playlists.',
  ],
  s7l7: [
    'Pitch your dashboard plan to the plant shop owner.',
    "I'll build a free dashboard connected to your Google Sheet that updates by itself. The top shows revenue, orders and average order value, then a trend line, then your best-selling plants, so you can see how the shop is doing at a glance.",
  ],
  s8l7: [
    "Tell someone you love what you've learned on this journey.",
    "I learned how to turn messy data into clear answers: cleaning spreadsheets, writing SQL, testing ideas with statistics, and telling the story with charts and dashboards. I'm ready to build my portfolio and start applying for analyst jobs.",
  ],
};

function addReflections(lessons: Lesson[]): Lesson[] {
  return lessons.map((l) => {
    const r = BOSS_REFLECT[l.id];
    if (!r || l.steps.some((s) => s.kind === 'reflect')) return l;
    const step: Step = { kind: 'reflect', prompt: r[0], sample: r[1] };
    const steps = [...l.steps];
    const last = steps[steps.length - 1];
    // Keep a closing "congratulations" explain step last.
    if (last.kind === 'explain') steps.splice(steps.length - 1, 0, step);
    else steps.push(step);
    return { ...l, steps };
  });
}

/** Mixes Duolingo-style games (match, build, true/false) into lessons, before the closing step. */
function addGames(lessons: Lesson[]): Lesson[] {
  return lessons.map((l) => {
    const g = GAMES[l.id];
    if (!g) return l;
    const steps = [...l.steps];
    const reflectAt = steps.findIndex((s) => s.kind === 'reflect');
    const at = reflectAt >= 0 ? reflectAt : steps[steps.length - 1].kind === 'explain' ? steps.length - 1 : steps.length;
    steps.splice(at, 0, ...g);
    return { ...l, steps };
  });
}

// Lesson ids must never change (progress is saved by id). Stage numbers may.
export const LESSONS: Lesson[] = addGames(addReflections([
  ...stage0,
  ...withExtras(stage1, [...stage1x, ...stage1y, ...stage1z]),
  ...withExtras(stage2, [...stage2x, ...stage2w, ...stage2v, ...stage2y]),
  ...withExtras(stage3, [...stage3x, ...stage3y, ...stage3z]),
  ...withExtras(stage4, [...stage4x, ...stage4y, ...stage4z, ...stage4p]),
  ...withExtras(stage5, [...stage5x, ...stage5y, ...stage5z]),
  ...withExtras(stage6, [...stage6x, ...stage6y, ...stage6z]),
  ...stage7m,
  ...withExtras(stage7, [...stage7x, ...stage8y, ...stage8z]),
  ...stage9,
  ...stage10,
  ...stage11,
  ...stage12,
  ...stage13,
  ...withExtras(stage8, [...stage8x, ...stage11y]),
]));

const cardMap = new Map<string, ReviewCard>();
const cardLesson = new Map<string, string>();
LESSONS.forEach((l) =>
  l.review.forEach((c) => {
    cardMap.set(c.id, c);
    cardLesson.set(c.id, l.id);
  }),
);

export const lessonById = (id: string) => LESSONS.find((l) => l.id === id);
export const cardById = (id: string) => cardMap.get(id);
export const lessonOfCard = (id: string) => cardLesson.get(id);
export const lessonsInStage = (n: number) => LESSONS.filter((l) => l.stage === n);
