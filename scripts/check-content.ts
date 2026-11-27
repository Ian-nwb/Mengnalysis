// Content checker: `npm run check`. Fails (exit 1) on any problem.
// - lesson & review-card ids unique, stages in order, one boss per stage with a reflect step + cheat sheet
// - no duplicate answer options
// - every spreadsheet step's reference formula evaluates (and uses its mustUse functions)
// - every SQL step's answer runs against the sandbox datasets (Node's built-in sqlite)
import { DatabaseSync } from 'node:sqlite';
import { LESSONS, STAGES, lessonsInStage } from '../src/content';
import { SHEETS } from '../src/content/cheatsheets';
import { GLOSSARY } from '../src/content/glossary';
import { STUDY_GUIDES } from '../src/content/studyguides';
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
  if (!STUDY_GUIDES.find((x) => x.stage === s.n)) problems.push(`stage ${s.n} has no study guide`);
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
    if (st.kind === 'match') {
      if (st.pairs.length < 3) problems.push(`${where}: match needs at least 3 pairs`);
      if (new Set(st.pairs.map((p) => p[0])).size !== st.pairs.length || new Set(st.pairs.map((p) => p[1])).size !== st.pairs.length) problems.push(`${where}: match labels must be unique`);
    }
    if (st.kind === 'build' && st.extras.some((e) => st.answer.includes(e))) problems.push(`${where}: build decoy repeats an answer tile`);
    if (st.kind === 'tf' && st.statements.length < 2) problems.push(`${where}: true/false needs 2+ statements`);
    if (st.kind === 'sort') {
      if (st.items.some(([, b]) => b < 0 || b >= st.buckets.length)) problems.push(`${where}: sort item points to a missing bucket`);
      if (new Set(st.items.map(([t]) => t)).size !== st.items.length) problems.push(`${where}: sort items must be unique`);
      if (st.buckets.some((_, bi) => !st.items.some(([, b]) => b === bi))) problems.push(`${where}: every sort bucket needs at least one item`);
    }
    if (st.kind === 'spot' && (st.bug < 0 || st.bug >= st.tokens.length || st.tokens[st.bug] === st.fix)) problems.push(`${where}: spot bug index/fix is wrong`);
    if (st.kind === 'odd' && (st.items.length < 3 || new Set(st.items).size !== st.items.length)) problems.push(`${where}: odd needs 3+ unique items`);
    if (st.kind === 'chartpick' && !st.data.some(([l]) => l === st.answer)) problems.push(`${where}: chartpick answer is not a bar`);
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

const termNames = GLOSSARY.map((t) => t.term.toLowerCase());
if (dup(termNames).length) problems.push(`duplicate glossary terms: ${dup(termNames)}`);
GLOSSARY.forEach((t) => {
  if (!STAGES.find((s) => s.n === t.stage)) problems.push(`glossary term ${t.term} has unknown stage ${t.stage}`);
});

console.log(`${GLOSSARY.length} glossary terms · ${LESSONS.length} lessons · ${STAGES.length} stages · ${sheetCount} formula steps · ${sqlCount} SQL steps`);
for (const s of STAGES) console.log(`  ${s.n} ${s.title}: ${lessonsInStage(s.n).length}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ` + problems.join('\n- '));
  process.exit(1);
}
console.log('All content checks passed.');
