// Content checker: `npm run check`. Fails (exit 1) on any problem.
// - lesson & review-card ids unique, stages in order, one boss per stage with a reflect step + cheat sheet
// - no duplicate answer options
// - every spreadsheet step's reference formula evaluates (and uses its mustUse functions)
// - every SQL step's answer runs against the sandbox datasets (Node's built-in sqlite)
import { DatabaseSync } from 'node:sqlite';
import { LESSONS, STAGES, lessonsInStage } from '../src/content';
import { SHEETS } from '../src/content/cheatsheets';
import { DATASETS } from '../src/sql/datasets';
import { evalFormula, formatValue, functionsIn, gridFrom } from '../src/sheet/formula';

const problems: string[] = [];
const dup = (a: string[]) => a.filter((x, i) => a.indexOf(x) !== i);

const ids = LESSONS.map((l) => l.id);
const cards = LESSONS.flatMap((l) => l.review.map((c) => c.id));
if (dup(ids).length) problems.push(`duplicate lesson ids: ${dup(ids)}`);
if (dup(cards).length) problems.push(`duplicate card ids: ${dup(cards)}`);
if (!LESSONS.every((l, i) => i === 0 || LESSONS[i - 1].stage <= l.stage)) problems.push('lessons are not in stage order');

for (const s of STAGES) {
  const ls = lessonsInStage(s.n);
  const bosses = ls.filter((l) => /boss/i.test(l.title));
  if (!ls.length) problems.push(`stage ${s.n} has no lessons`);
  if (bosses.length !== 1) problems.push(`stage ${s.n} has ${bosses.length} boss lessons`);
  if (bosses[0] && !bosses[0].steps.some((st) => st.kind === 'reflect')) problems.push(`boss ${bosses[0].id} has no reflect step`);
  if (!SHEETS.find((x) => x.stage === s.n)) problems.push(`stage ${s.n} has no cheat sheet`);
}

const db = new DatabaseSync(':memory:');
for (const d of Object.values(DATASETS)) db.exec(d.sql);

let sheetCount = 0;
let sqlCount = 0;
for (const l of LESSONS) {
  l.steps.forEach((st, i) => {
    const where = `${l.id} step ${i + 1}`;
    if ((st.kind === 'choice' || st.kind === 'blank') && new Set(st.options).size !== st.options.length) problems.push(`${where}: duplicate options`);
    if ((st.kind === 'choice' || st.kind === 'blank') && !(st.answer >= 0 && st.answer < st.options.length)) problems.push(`${where}: answer out of range`);
    if (st.kind === 'sheet') {
      sheetCount++;
      try {
        const v = evalFormula(st.formula, gridFrom(st.table));
        const used = functionsIn(st.formula);
        const missing = (st.mustUse ?? []).filter((m) => !used.includes(m.toUpperCase()));
        if (missing.length) problems.push(`${where}: reference formula doesn't use ${missing}`);
        if (process.argv.includes('-v')) console.log(`  ${where}: ${st.formula} → ${formatValue(v)}`);
      } catch (e) {
        problems.push(`${where}: formula ${st.formula} fails: ${(e as Error).message}`);
      }
    }
    if (st.kind === 'sql') {
      sqlCount++;
      try {
        const rows = db.prepare(st.answer).all();
        if (process.argv.includes('-v')) console.log(`  ${where}: ${rows.length} rows`);
      } catch (e) {
        problems.push(`${where}: SQL fails: ${(e as Error).message}`);
      }
    }
  });
  l.review.forEach((c) => {
    if (new Set(c.options).size !== c.options.length) problems.push(`card ${c.id}: duplicate options`);
  });
}

console.log(`${LESSONS.length} lessons · ${STAGES.length} stages · ${sheetCount} formula steps · ${sqlCount} SQL steps`);
for (const s of STAGES) console.log(`  ${s.n} ${s.title}: ${lessonsInStage(s.n).length}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ` + problems.join('\n- '));
  process.exit(1);
}
console.log('All content checks passed.');
