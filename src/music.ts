import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import { AppState as RNAppState } from 'react-native';

// Background study music: original loops (assets/music). Quiet by default,
// dips while Listen mode is reading, pauses when the app is in the background.
export const TRACKS = [
  { id: 'cozy', name: 'Cozy study', sub: 'Mellow lo-fi beats', src: require('../assets/music/cozy.mp3') },
  { id: 'rain', name: 'Rainy café', sub: 'Soft chords and gentle rain', src: require('../assets/music/rain.mp3') },
  { id: 'sunny', name: 'Sunny morning', sub: 'Bright, light and cheerful', src: require('../assets/music/sunny.mp3') },
] as const;
export type TrackId = (typeof TRACKS)[number]['id'];

let player: AudioPlayer | null = null;
let current = '';
let volume = 0.3;
let on = false;
let ducked = false;
let foreground = true;

function applyVolume() {
  if (player) player.volume = ducked ? volume * 0.25 : volume;
}

function sync() {
  try {
    if (!on || !foreground) {
      player?.pause();
      return;
    }
    if (player) {
      applyVolume();
      player.play();
    }
  } catch {}
}

export function setMusic(enabled: boolean, track: string, vol: number) {
  on = enabled;
  volume = vol;
  try {
    if (enabled && track !== current) {
      player?.remove();
      const t = TRACKS.find((x) => x.id === track) ?? TRACKS[0];
      player = createAudioPlayer(t.src);
      player.loop = true;
      current = t.id;
    }
  } catch {}
  sync();
}

export function duckMusic(v: boolean) {
  ducked = v;
  applyVolume();
}

RNAppState.addEventListener('change', (s) => {
  foreground = s === 'active';
  sync();
});
