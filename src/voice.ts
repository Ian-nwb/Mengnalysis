import * as Speech from 'expo-speech';

// Listen mode voice. Default: a male English voice if the phone has one.
// Google TTS male voice ids contain these codes (e.g. "en-us-x-iom-local").
const MALE_HINTS = ['iom', 'iol', 'tpd', 'gbd', 'gbb', 'rjs', 'aub', 'end', 'male'];

let voicesCache: Speech.Voice[] | null = null;
let setting = 'auto';
let resolved: string | null = null;

export async function englishVoices(): Promise<Speech.Voice[]> {
  if (!voicesCache) {
    try {
      voicesCache = (await Speech.getAvailableVoicesAsync()).filter((v) => v.language?.toLowerCase().startsWith('en'));
    } catch {
      voicesCache = [];
    }
  }
  return voicesCache;
}

export function isMale(v: Speech.Voice) {
  const id = `${v.identifier} ${v.name}`.toLowerCase();
  if (id.includes('female')) return false;
  return MALE_HINTS.some((h) => id.includes(h));
}

/** Male voices first, local (offline) voices before network ones. */
export async function voiceChoices(limit = 6) {
  const vs = await englishVoices();
  const score = (v: Speech.Voice) =>
    (isMale(v) ? 0 : 10) + (v.identifier.includes('network') ? 1 : 0) + (v.language.toLowerCase().includes('us') ? 0 : 0.5);
  return [...vs].sort((a, b) => score(a) - score(b)).slice(0, limit);
}

export function setVoiceSetting(id: string) {
  setting = id;
  resolved = null;
}

async function currentVoice(): Promise<string> {
  if (setting !== 'auto') return setting;
  if (resolved !== null) return resolved;
  const [best] = await voiceChoices(1);
  resolved = best && isMale(best) ? best.identifier : '';
  return resolved;
}

export async function speak(text: string, opts: Speech.SpeechOptions = {}) {
  const voice = await currentVoice();
  // No male voice installed? A slightly lower pitch on the default voice.
  Speech.speak(text, { ...opts, voice: voice || undefined, pitch: voice ? 1 : 0.8 });
}

export const stopSpeaking = () => {
  Speech.stop();
};
