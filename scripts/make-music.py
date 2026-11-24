"""Generates Tori's original study-music loops (assets/music/*.mp3).

Usage: python3 scripts/make-music.py [track ...]   (tracks: cozy rain sunny; default all)
Needs numpy and ffmpeg. Every loop wraps seamlessly (reverb tails and notes wrap to the start).
"""
import numpy as np, wave, sys, subprocess, os, tempfile

SR = 32000
NOTE = {'C': -9, 'C#': -8, 'D': -7, 'Eb': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'Ab': -1, 'A': 0, 'Bb': 1, 'B': 2}
N = lambda name: 440.0 * 2 ** ((NOTE[name[:-1]] + 12 * (int(name[-1]) - 4)) / 12)


def lowpass(x, cutoff, width=400):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * np.clip(1 - (f - cutoff) / width, 0, 1), len(x))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * ((f > lo) & (f < hi)), len(x))


def reverb(x, rng, secs=2.2, mix=0.25):
    n = int(SR * secs); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-3.2 * t / secs); ir = lowpass(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n; y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)
    out = x * (1 - mix) + y[:len(x)] * mix * 0.8
    tail = y[len(x):] * mix * 0.8; out[:len(tail)] += tail[:len(out)]
    return out


def env(n, a=0.01, d=0.3, s=0.6, r=0.4):
    t = np.arange(n) / SR; T = n / SR
    e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / d))
    return e * np.clip((T - t) / r, 0, 1)


def epiano(f, dur, vel=0.5):
    n = int(SR * dur); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3) + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t * 5)
    return vel * y * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t)) * env(n, 0.005, 0.8, 0.25, 0.3)


def pad(f, dur, vel=0.3):
    n = int(SR * dur); t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * (1 + d) * t + p) for d, p in [(0, 0), (0.004, 1.1), (-0.004, 2.3)]) / 3
    return vel * (y + 0.25 * np.sin(4 * np.pi * f * t)) * env(n, 1.2, 2, 0.9, 1.5)


def bass(f, dur, vel=0.5):
    n = int(SR * dur); t = np.arange(n) / SR
    return vel * (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * env(n, 0.01, 0.5, 0.5, 0.15)


def pluck(f, dur, vel=0.4):
    n = int(SR * dur); t = np.arange(n) / SR
    return vel * (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) * np.exp(-t * 8)) * np.exp(-t * 4.5) * np.minimum(1, t / 0.003)


def kick(vel=0.6):
    n = int(SR * 0.35); t = np.arange(n) / SR; f = 55 + 70 * np.exp(-t * 25)
    return vel * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat(rng, vel=0.08):
    n = int(SR * 0.06); return vel * bandpass(rng.standard_normal(n), 6000, 12000) * np.exp(-np.arange(n) / SR * 60)


def snare(rng, vel=0.12):
    n = int(SR * 0.2); t = np.arange(n) / SR
    return vel * (bandpass(rng.standard_normal(n), 1200, 6000) * np.exp(-t * 18) + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25))


def drip(f, vel):
    n = int(SR * 0.25); t = np.arange(n) / SR
    fr = f * (1 + 0.3 * np.exp(-t * 40))  # tiny pitch drop, like a water drop
    return vel * np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 22) * np.minimum(1, t / 0.002)


def soft_rain(rng, L):
    # Brown noise (much warmer than white noise), low-passed, with slow gentle swells.
    b = np.cumsum(rng.standard_normal(L)); b -= lowpass(b, 20, 20)  # remove drift
    b = lowpass(b, 1100, 600); b /= np.max(np.abs(b)) + 1e-9
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * np.arange(L) / L * 3)  # whole cycles → loops cleanly
    return b * swell


def place(buf, sig, start):
    i = int(start * SR) % len(buf); j = min(len(buf), i + len(sig)); buf[i:j] += sig[:j - i]
    rest = sig[j - i:]
    if len(rest): buf[:len(rest)] += rest


def track(rng, bpm, chords, bars_per_chord, melody, style):
    beat = 60 / bpm; bar = 4 * beat
    L = int(SR * bar * len(chords) * bars_per_chord * 2)
    mus = np.zeros(L); drums = np.zeros(L); amb = np.zeros(L)
    for rep in range(2):
        for ci, ch in enumerate(chords):
            notes = [N(x) for x in ch]
            for b in range(bars_per_chord):
                tb = ((rep * len(chords) + ci) * bars_per_chord + b) * bar
                if style == 'cozy':
                    for k, f in enumerate(notes[1:]): place(mus, epiano(f, bar * 0.95, 0.16), tb + k * 0.025)
                    place(mus, epiano(notes[1] * 2, beat * 1.2, 0.07), tb + 2.5 * beat)
                    place(mus, bass(notes[0], beat * 1.8, 0.33), tb); place(mus, bass(notes[0], beat * 0.9, 0.25), tb + 2.5 * beat)
                    for q in range(4):
                        if q in (0, 2): place(drums, kick(0.45 if q == 0 else 0.3), tb + q * beat)
                        if q in (1, 3): place(drums, snare(rng, 0.09), tb + q * beat)
                        place(drums, hat(rng, 0.04), tb + q * beat + 0.5 * beat + (0.06 * beat if q % 2 else 0))
                elif style == 'rain':
                    for f in notes[1:]: place(mus, pad(f, bar * 1.05, 0.1), tb)
                    place(mus, pad(notes[0], bar * 1.05, 0.12), tb)
                    place(mus, epiano(notes[2] * 2, beat * 2, 0.05), tb + beat)  # soft café piano
                else:
                    arp = notes[1:] + [notes[2] * 2]
                    for q in range(8): place(mus, pluck(arp[q % len(arp)], beat * 0.9, 0.13), tb + q * beat / 2)
                    place(mus, bass(notes[0], beat * 1.6, 0.28), tb); place(mus, bass(notes[0] * 1.5, beat * 0.8, 0.2), tb + 2 * beat)
                    for q in range(8): place(drums, hat(rng, 0.03 if q % 2 else 0.02), tb + q * beat / 2)
                    if b % 2 == 0: place(drums, kick(0.3), tb)
    for pos, name, dur in melody:
        place(mus, (pluck if style == 'sunny' else epiano)(N(name), dur * beat, 0.11 if style != 'rain' else 0.08), pos * beat)
    if style == 'rain':
        amb = soft_rain(rng, L) * 0.05
        for _ in range(int(L / SR * 1.2)):  # occasional soft drips, not static
            place(amb, drip(rng.uniform(1400, 2600), rng.uniform(0.008, 0.02)), rng.uniform(0, L / SR))
    if style == 'cozy':  # very soft, warm vinyl dust
        for _ in range(int(L / SR * 1.5)): place(amb, lowpass(hat(rng, rng.uniform(0.006, 0.012)), 3500, 800), rng.uniform(0, L / SR))
    x = reverb(mus, rng, 2.4, 0.3) + drums * 0.9 + amb
    x = lowpass(x, {'cozy': 6500, 'rain': 6000, 'sunny': 10000}[style], 1500)
    x = x / np.max(np.abs(x)) * 0.6
    return x


SPECS = {
    'cozy': (72, [['F2', 'A3', 'C4', 'E4'], ['E2', 'G3', 'B3', 'D4'], ['D2', 'F3', 'A3', 'C4'], ['C2', 'E3', 'G3', 'B3']], 1,
             [(2, 'C5', 1), (3, 'A4', 1), (6, 'G4', 2), (10, 'E5', 1), (11, 'D5', 1), (12, 'C5', 2), (18, 'A4', 1), (19, 'G4', 1), (22, 'E4', 2), (26, 'G4', 1), (28, 'A4', 3)]),
    'rain': (60, [['A2', 'C4', 'E4', 'G4'], ['F2', 'A3', 'C4', 'E4'], ['C2', 'E3', 'G3', 'B3'], ['G2', 'B3', 'D4', 'E4']], 2,
             [(3, 'E5', 2), (9, 'D5', 2), (14, 'C5', 3), (19, 'B4', 2), (24, 'A4', 3), (30, 'G4', 2), (37, 'E5', 2), (44, 'C5', 3), (52, 'A4', 3), (58, 'G4', 2)]),
    'sunny': (88, [['C2', 'E3', 'G3', 'B3'], ['G2', 'B3', 'D4', 'G4'], ['A2', 'C4', 'E4', 'A4'], ['F2', 'A3', 'C4', 'E4']], 1,
              [(0, 'E5', 1), (1, 'G5', 1), (2, 'A5', 2), (4, 'G5', 1), (5, 'E5', 1), (6, 'D5', 2), (8, 'C5', 1), (9, 'D5', 1), (10, 'E5', 2), (12, 'G5', 1), (13, 'E5', 1), (14, 'D5', 2)]),
}

if __name__ == '__main__':
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'assets', 'music')
    for name in sys.argv[1:] or list(SPECS):
        rng = np.random.default_rng({'cozy': 7, 'rain': 11, 'sunny': 5}[name])
        x = track(rng, *SPECS[name], name)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            with wave.open(tmp.name, 'w') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype('<i2').tobytes())
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp.name, '-c:a', 'libmp3lame', '-b:a', '96k', os.path.join(out_dir, f'{name}.mp3')], check=True)
        os.unlink(tmp.name)
        print(name, round(len(x) / SR, 1), 's')
