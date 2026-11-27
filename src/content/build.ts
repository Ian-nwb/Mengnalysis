import { Example, Lesson, ReviewCard, Step } from './types';

// Compact helpers for writing lessons. In mc/bl/rc the CORRECT option is
// always written FIRST; the app shuffles options when showing them.

export const ex = (title: string, text: string, example?: Example): Step => ({ kind: 'explain', title, text, example });

export const mc = (prompt: string, options: string[], why: string, example?: Example): Step => ({
  kind: 'choice',
  prompt,
  options,
  answer: 0,
  why,
  example,
});

export const bl = (prompt: string, options: string[], why: string): Step => ({ kind: 'blank', prompt, options, answer: 0, why });

export const ord = (prompt: string, items: string[], why: string): Step => ({ kind: 'order', prompt, items, why });

export const sql = (
  prompt: string,
  dataset: 'coffee' | 'shop' | 'music' | 'app',
  answer: string,
  hint: string,
  why: string,
): Step => ({ kind: 'sql', prompt, dataset, answer, hint, why });

export const sheet = (
  prompt: string,
  table: (string | number)[][],
  formula: string,
  hint: string,
  why: string,
  mustUse?: string[],
): Step => ({ kind: 'sheet', prompt, table, formula, hint, why, mustUse });

/** Match the pairs: [left, right] in correct pairing; the app shuffles the right side. */
export const match = (prompt: string, pairs: [string, string][], why: string): Step => ({ kind: 'match', prompt, pairs, why });
/** Build the answer from word tiles: `answer` in order, `extras` are decoy tiles. */
export const build = (prompt: string, answer: string[], extras: string[], why: string): Step => ({ kind: 'build', prompt, answer, extras, why });
/** Quick true/false round. */
export const tf = (prompt: string, statements: [string, boolean][], why: string): Step => ({ kind: 'tf', prompt, statements, why });

export const reflect = (prompt: string, sample: string): Step => ({ kind: 'reflect', prompt, sample });

export const rc = (front: string, options: string[]): Omit<ReviewCard, 'id'> => ({ front, options, answer: 0 });

export const L = (
  id: string,
  stage: number,
  title: string,
  minutes: number,
  steps: Step[],
  review: Omit<ReviewCard, 'id'>[],
): Lesson => ({ id, stage, title, minutes, steps, review: review.map((r, i) => ({ ...r, id: `${id}c${i + 1}` })) });

// Example shorthands
export const list = (items: string[], title?: string): Example => ({ kind: 'list', items, title });
export const fx = (formula: string, result: string, note?: string): Example => ({ kind: 'formula', formula, result, note });
export const code = (c: string, output?: string): Example => ({ kind: 'code', code: c, output });
export const both = (sheets: string, excel: string): Example => ({ kind: 'compare', sheets, excel });
export const rec = (title: string, fields: [string, string][]): Example => ({ kind: 'record', title, fields });
export const bar = (title: string, data: [string, number][], highlight?: string, unit?: string): Example => ({
  kind: 'chart',
  type: 'bar',
  title,
  data,
  highlight,
  unit,
});
export const line = (title: string, data: [string, number][], unit?: string): Example => ({
  kind: 'chart',
  type: 'line',
  title,
  data,
  unit,
});
