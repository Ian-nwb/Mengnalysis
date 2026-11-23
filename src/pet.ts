import { IconName } from './components/Icon';

// Things Tori can share with Meng. Cooked, cat-friendly treats only (no milk, no chocolate!).
export type PetItem = { id: string; name: string; kind: 'food' | 'toy'; cost: number; full: number; happy: number; icon: IconName; line: string };

export const PET_ITEMS: PetItem[] = [
  { id: 'kibble', name: 'Crunchy kibble', kind: 'food', cost: 1, full: 15, happy: 2, icon: 'bowl', line: 'Crunch crunch! Thank you!' },
  { id: 'fish', name: 'Fish treat', kind: 'food', cost: 2, full: 20, happy: 6, icon: 'fish', line: 'A fishy treat! My favorite kind of data point.' },
  { id: 'chicken', name: 'Chicken bites', kind: 'food', cost: 3, full: 30, happy: 8, icon: 'bowl', line: 'Mmm, chicken! You spoil me.' },
  { id: 'tuna', name: 'Tuna can', kind: 'food', cost: 3, full: 35, happy: 6, icon: 'can', line: 'TUNA! Best. Day. Ever.' },
  { id: 'salmon', name: 'Salmon feast', kind: 'food', cost: 5, full: 55, happy: 15, icon: 'fish', line: 'A whole salmon feast? I feel like a VIP customer!' },
  { id: 'yarn', name: 'Yarn ball', kind: 'toy', cost: 3, full: 0, happy: 25, icon: 'yarn', line: 'Bat, bat, pounce! This is great.' },
  { id: 'mouse', name: 'Catnip mouse', kind: 'toy', cost: 4, full: 0, happy: 35, icon: 'mouse', line: 'Catnip!! Wheee!' },
  { id: 'feather', name: 'Feather wand', kind: 'toy', cost: 4, full: 0, happy: 35, icon: 'feather', line: 'I almost caught it! Again, again!' },
  { id: 'box', name: 'Cardboard box', kind: 'toy', cost: 6, full: 0, happy: 50, icon: 'box', line: 'A box! The finest furniture known to cats.' },
];

export const fullnessWord = (f: number) => (f >= 80 ? 'Full and happy' : f >= 50 ? 'Content' : f >= 30 ? 'A little peckish' : 'Snack time!');
export const happinessWord = (h: number) => (h >= 80 ? 'Over the moon' : h >= 50 ? 'Cheerful' : h >= 30 ? 'A bit bored' : 'Wants to play');
