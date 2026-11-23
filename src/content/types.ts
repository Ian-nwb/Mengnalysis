export type Example =
  | { kind: 'record'; title: string; fields: [string, string][] }
  | { kind: 'list'; title?: string; items: string[] }
  // A formula shown big, with what it gives back
  | { kind: 'formula'; formula: string; result: string; note?: string }
  // How to do the same thing in each app
  | { kind: 'compare'; sheets: string; excel: string }
  // A code snippet (Python etc.), optionally with its printed output
  | { kind: 'code'; code: string; output?: string }
  // A big, directly-labeled chart. `highlight` marks one label (shown with ★ too, not just color)
  | { kind: 'chart'; type: 'bar' | 'line'; title: string; data: [string, number][]; unit?: string; highlight?: string };

export type Step =
  | { kind: 'explain'; title?: string; text: string; example?: Example }
  | { kind: 'choice'; prompt: string; options: string[]; answer: number; why: string; example?: Example }
  // prompt contains "___" where the missing word goes
  | { kind: 'blank'; prompt: string; options: string[]; answer: number; why: string; example?: Example }
  // items are listed in the CORRECT order; the app shuffles them
  | { kind: 'order'; prompt: string; items: string[]; why: string }
  // Write a real SQL query; checked by comparing results with `answer`'s results
  // Free-text "explain it like I'm your boss" box; `sample` is shown after she submits
  | { kind: 'reflect'; prompt: string; sample: string }
  // Spreadsheet sandbox: type a real formula; checked against `formula`'s result
  | { kind: 'sheet'; prompt: string; table: (string | number)[][]; formula: string; hint: string; why: string; mustUse?: string[] }
  | { kind: 'sql'; prompt: string; dataset: 'coffee' | 'shop' | 'music' | 'app'; answer: string; hint: string; why: string; starter?: string };

export type ReviewCard = { id: string; front: string; options: string[]; answer: number };

export type Lesson = {
  id: string;
  stage: number;
  title: string;
  minutes: number;
  steps: Step[];
  review: ReviewCard[];
};

export type Stage = { n: number; title: string; blurb: string };
