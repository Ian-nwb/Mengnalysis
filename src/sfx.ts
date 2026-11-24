import { AudioPlayer, createAudioPlayer } from 'expo-audio';

// Short original sound effects (generated, see assets/sfx). Toggle in Settings.
const SOURCES = {
  tap: require('../assets/sfx/tap.wav'),
  correct: require('../assets/sfx/correct.wav'),
  wrong: require('../assets/sfx/wrong.wav'),
  complete: require('../assets/sfx/complete.wav'),
  levelup: require('../assets/sfx/levelup.wav'),
  meow: require('../assets/sfx/meow.wav'),
  purr: require('../assets/sfx/purr.wav'),
  chomp: require('../assets/sfx/chomp.wav'),
  boing: require('../assets/sfx/boing.wav'),
};
export type Sfx = keyof typeof SOURCES;

let enabled = true;
let meows = true;
export function setMeowsEnabled(v: boolean) {
  meows = v;
}
const players: Partial<Record<Sfx, AudioPlayer>> = {};

export function setSfxEnabled(v: boolean) {
  enabled = v;
}

export function playSfx(name: Sfx, delayMs = 0) {
  if (!enabled || ((name === 'meow' || name === 'purr') && !meows)) return;
  const go = () => {
    try {
      const p = players[name] ?? (players[name] = createAudioPlayer(SOURCES[name]));
      p.seekTo(0);
      p.play();
    } catch {}
  };
  if (delayMs) setTimeout(go, delayMs);
  else go();
}

/** Load the sound files early (during the loading screen) so the first tap isn't silent. */
export function preloadSfx() {
  (Object.keys(SOURCES) as Sfx[]).forEach((k) => {
    try {
      if (!players[k]) players[k] = createAudioPlayer(SOURCES[k]);
    } catch {}
  });
}
