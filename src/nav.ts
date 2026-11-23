import { ReviewItem } from './engine';

export type ReviewMode = 'warmup' | 'practice' | 'lite' | 'bugs' | 'focus';

export type Route =
  | { name: 'home' }
  | { name: 'review'; items: ReviewItem[]; then: string | null; mode: ReviewMode }
  | { name: 'lesson'; id: string; xpSoFar: number }
  | {
      name: 'reward';
      xp: number;
      title: string;
      newDay: boolean;
      usedFreeze: boolean;
      streak: number;
      levelUp: string | null;
      sheet: number | null;
      retried: boolean;
      treats: number;
    }
  | { name: 'path' }
  | { name: 'settings' }
  | { name: 'playground' }
  | { name: 'bugbook' }
  | { name: 'vault' }
  | { name: 'sheet'; stage: number }
  | { name: 'tour' }
  | { name: 'guide'; id: string }
  | { name: 'meng' }
  | { name: 'library' }
  | { name: 'reader'; id: string }
  | { name: 'study'; stage: number };

export type Go = (r: Route) => void;
/** missed = lesson step indexes answered wrong on the first try. */
export type Finish = (lessonId: string | null, xp: number, missed?: number[], retried?: boolean) => void;
