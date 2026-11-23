import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Palette, palettes, ThemeName } from './theme';

export type Settings = {
  theme: ThemeName;
  textScale: number;
  autoRead: boolean;
  speechRate: number;
  reminderHour: number;
  reminderMinute: number;
  voiceId: string; // 'auto' = male voice if available
  sounds: boolean;
};

/** A question she got wrong, kept in the Bug Book and resurfaced ~a week later. */
export type Bug = { lessonId: string; step: number; day: string; due: string; misses: number };

/** Meng's corner: treats earned by learning, spent on food and toys. Never punishing. */
export type Pet = { treats: number; fullness: number; happiness: number; day: string; fedTotal: number };

export type AppState = {
  onboarded: boolean;
  xp: number;
  streak: number;
  bestStreak: number;
  lastDoneDay: string | null;
  daysDone: string[];
  freezes: number;
  freezeWeek: string;
  completed: string[];
  newToday: { day: string; count: number };
  reviews: Record<string, { box: number; due: string }>;
  bugs: Record<string, Bug>;
  hintsSeen: string[];
  reflections: Record<string, string>;
  /** Accuracy per lesson (lesson questions + its review cards), for adaptive review. */
  stats: Record<string, { seen: number; right: number }>;
  pet: Pet;
  settings: Settings;
};

export const defaultState: AppState = {
  onboarded: false,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  lastDoneDay: null,
  daysDone: [],
  freezes: 1,
  freezeWeek: '',
  completed: [],
  newToday: { day: '', count: 0 },
  reviews: {},
  bugs: {},
  hintsSeen: [],
  reflections: {},
  stats: {},
  pet: { treats: 3, fullness: 60, happiness: 60, day: '', fedTotal: 0 },
  settings: {
    theme: 'dark',
    textScale: 1,
    autoRead: false,
    speechRate: 0.95,
    reminderHour: 19,
    reminderMinute: 0,
    voiceId: 'auto',
    sounds: true,
  },
};

const KEY = 'tori.state.v1';

type Ctx = {
  state: AppState;
  ready: boolean;
  setState: (fn: (s: AppState) => AppState) => void;
  colors: Palette;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, set] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const saved = JSON.parse(raw);
          set({ ...defaultState, ...saved, settings: { ...defaultState.settings, ...saved.settings } });
        } catch {}
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const setState = useCallback((fn: (s: AppState) => AppState) => set(fn), []);

  return (
    <AppCtx.Provider value={{ state, ready, setState, colors: palettes[state.settings.theme] }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside AppProvider');
  return c;
}
