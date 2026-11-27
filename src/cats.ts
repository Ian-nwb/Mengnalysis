import { LESSONS, STAGES } from './content';
import { stageBeaten } from './engine';
import { AppState } from './state';

// Unlockable cats. Meng is the original; the others unlock by learning.
export type CatId = 'meng' | 'tuxedo' | 'orangina' | 'whitey' | 'dost';

export type CatLook = {
  fur: string; // head + body base
  earL: string; // her right ear (viewer's left)
  earR: string;
  innerEar: string;
  tail: string;
  feet: string; // paws and arms
  patches: 'calico' | 'tuxedo' | 'orange' | 'none';
  collar: string | null;
  iris: string;
  nose: string;
  line: string; // outline (lighter on dark cats so they stand out on the plum background)
  ink: string; // mouth
  lid: string; // closed eyes
  whisker: string;
};

const PLUM = '#1B1420';
const WHITE = '#FFFDF9';
const ORANGE = '#F2A65A';
const BLACK = '#2B2230';
const DARK = '#26212B';
const PINK = '#F5A9C0';
const SOFT = '#EDE6F2';

export type Cat = { id: CatId; name: string; blurb: string; look: CatLook; unlock: { label: string; progress: (s: AppState) => [number, number] } | null };

const lessonsDone = (s: AppState) => s.completed.filter((id) => LESSONS.some((l) => l.id === id)).length;
const bossesBeaten = (s: AppState) => STAGES.filter((st) => stageBeaten(s, st.n)).length;

export const CATS: Cat[] = [
  {
    id: 'meng',
    name: 'Meng',
    blurb: 'The original calico: white blaze, black forehead spot, golden eyes.',
    unlock: null,
    look: { fur: WHITE, earL: BLACK, earR: ORANGE, innerEar: WHITE, tail: BLACK, feet: WHITE, patches: 'calico', collar: '#E5A2F2', iris: '#D9B44A', nose: PINK, line: PLUM, ink: PLUM, lid: PLUM, whisker: PLUM },
  },
  {
    id: 'tuxedo',
    name: 'Tuxedo',
    blurb: 'A dapper tuxedo cat with white mittens and a blue collar.',
    unlock: { label: 'Finish 10 lessons', progress: (s) => [lessonsDone(s), 10] },
    look: { fur: DARK, earL: DARK, earR: DARK, innerEar: PINK, tail: DARK, feet: WHITE, patches: 'tuxedo', collar: '#4A90E2', iris: '#B8D86A', nose: PINK, line: '#8C7F99', ink: PLUM, lid: SOFT, whisker: SOFT },
  },
  {
    id: 'orangina',
    name: 'Orangina',
    blurb: 'A sunny orange cat with a white mouth and white shoulder. No collar, free spirit.',
    unlock: { label: 'Reach a 7-day streak', progress: (s) => [s.bestStreak, 7] },
    look: { fur: ORANGE, earL: ORANGE, earR: ORANGE, innerEar: PINK, tail: ORANGE, feet: ORANGE, patches: 'orange', collar: null, iris: '#8FCB5A', nose: PINK, line: PLUM, ink: PLUM, lid: PLUM, whisker: PLUM },
  },
  {
    id: 'whitey',
    name: 'Whitey',
    blurb: 'A fluffy white cat with blue eyes and a yellow collar.',
    unlock: { label: 'Beat 2 boss levels', progress: (s) => [bossesBeaten(s), 2] },
    look: { fur: WHITE, earL: WHITE, earR: WHITE, innerEar: PINK, tail: WHITE, feet: WHITE, patches: 'none', collar: '#F6CF3E', iris: '#7FB7FF', nose: PINK, line: PLUM, ink: PLUM, lid: PLUM, whisker: PLUM },
  },
  {
    id: 'dost',
    name: 'Dost',
    blurb: 'A sleek black cat with glowing golden eyes.',
    unlock: { label: 'Finish 30 lessons', progress: (s) => [lessonsDone(s), 30] },
    look: { fur: DARK, earL: DARK, earR: DARK, innerEar: '#6E4A5C', tail: DARK, feet: DARK, patches: 'none', collar: null, iris: '#F2D14B', nose: '#9A6276', line: '#8C7F99', ink: SOFT, lid: SOFT, whisker: SOFT },
  },
];

export const catById = (id: string | undefined) => CATS.find((c) => c.id === id) ?? CATS[0];
export const isUnlocked = (s: AppState, c: Cat) => !c.unlock || c.unlock.progress(s)[0] >= c.unlock.progress(s)[1];
export const unlockedCats = (s: AppState) => CATS.filter((c) => isUnlocked(s, c)).map((c) => c.id);
/** The cat currently shown everywhere (falls back to Meng if the choice isn't unlocked). */
export const currentCat = (s: AppState) => {
  const c = catById(s.settings.cat);
  return isUnlocked(s, c) ? c : CATS[0];
};
