import { AudioPlayer, createAudioPlayer } from 'expo-audio';

// Short original sound effects (generated, see assets/sfx). Toggle in Settings.
const SOURCES = {
  tap: require('../assets/sfx/tap.wav'),
  correct: require('../assets/sfx/correct.wav'),
  wrong: require('../assets/sfx/wrong.wav'),
  complete: require('../assets/sfx/complete.wav'),
  levelup: require('../assets/sfx/levelup.wav'),
  meow: require('../assets/sfx/meow.wav'),
};
export type Sfx = keyof typeof SOURCES;

let enabled = true;
const players: Partial<Record<Sfx, AudioPlayer>> = {};

export function setSfxEnabled(v: boolean) {
  enabled = v;
}

export function playSfx(name: Sfx, delayMs = 0) {
  if (!enabled) return;
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
