import Constants from 'expo-constants';
import type { Voice } from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Share, TextInput, View } from 'react-native';
import { IconName } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { BigButton, Card, Kicker, ProgressBar, Screen, Txt } from '../components/ui';
import { GUIDES } from '../guides';
import { Go } from '../nav';
import { TRACKS } from '../music';
import { REMINDER_TIMES, testNotification } from '../reminders';
import { AppState, defaultState, Settings, useApp } from '../state';
import { radius, space, TEXT_SCALES, type } from '../theme';
import { isMale, setVoiceSetting, speak, voiceChoices } from '../voice';

const fmtTime = (h: number, m: number) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function useSetting() {
  const { setState } = useApp();
  return <K extends keyof Settings>(k: K, v: Settings[K]) => setState((s) => ({ ...s, settings: { ...s.settings, [k]: v } }));
}

function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <View style={{ gap: space.sm, marginTop: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 2, borderBottomColor: colors.brand, paddingBottom: 6 }}>
        <Kicker icon={icon}>{title.toUpperCase()}</Kicker>
      </View>
      {children}
    </View>
  );
}

/** A group of big choice buttons for one setting. */
function Choice<K extends keyof Settings>({
  title,
  icon,
  k,
  options,
  note,
}: {
  title: string;
  icon: IconName;
  k: K;
  options: { label: string; value: Settings[K]; sub?: string }[];
  note?: string;
}) {
  const { state } = useApp();
  const set = useSetting();
  return (
    <Card>
      <Kicker icon={icon}>{title}</Kicker>
      {note ? <Txt v="small">{note}</Txt> : null}
      {options.map((o) => {
        const on = JSON.stringify(state.settings[k]) === JSON.stringify(o.value);
        return (
          <BigButton
            key={o.label}
            label={o.label}
            sub={o.sub}
            icon={on ? 'check' : undefined}
            state={on ? 'selected' : 'normal'}
            a11y={`${o.label}${on ? ', selected' : ''}`}
            onPress={() => set(k, o.value)}
          />
        );
      })}
    </Card>
  );
}

const onOff = (on: string, off: string) => [
  { label: on, value: true },
  { label: off, value: false },
];

export function TextSizePicker() {
  const { state, colors } = useApp();
  const set = useSetting();
  const idx = Math.max(0, TEXT_SCALES.indexOf(state.settings.textScale));
  const to = (i: number) => set('textScale', TEXT_SCALES[Math.max(0, Math.min(TEXT_SCALES.length - 1, i))]);
  return (
    <Card>
      <Kicker icon="text">Text size</Kicker>
      <Txt color={colors.textMuted}>This is how lessons will look.</Txt>
      <BigButton label="Bigger" icon="plus" disabled={idx >= TEXT_SCALES.length - 1} onPress={() => to(idx + 1)} />
      <BigButton label="Smaller" icon="minus" disabled={idx <= 0} onPress={() => to(idx - 1)} />
      <Txt v="small" color={colors.textMuted}>Size {idx + 1} of {TEXT_SCALES.length}</Txt>
    </Card>
  );
}

/** Any time of day: big presets plus hour / 15-minute steps. */
export function ReminderPicker() {
  const { state, setState, colors } = useApp();
  const { reminderHour: h, reminderMinute: m } = state.settings;
  const setTime = (hour: number, minute: number) =>
    setState((s) => ({ ...s, settings: { ...s.settings, reminderHour: (hour + 24) % 24, reminderMinute: minute } }));
  const stepMin = (d: number) => {
    const total = (h * 60 + m + d + 1440) % 1440;
    setTime(Math.floor(total / 60), total % 60);
  };
  return (
    <Card>
      <Kicker icon="bell">Daily reminder from Meng</Kicker>
      <Txt v="h1" center color={colors.accent}>{fmtTime(h, m)}</Txt>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <BigButton label="Earlier" icon="minus" style={{ flex: 1 }} a11y="15 minutes earlier" onPress={() => stepMin(-15)} />
        <BigButton label="Later" icon="plus" style={{ flex: 1 }} a11y="15 minutes later" onPress={() => stepMin(15)} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <BigButton label="−1 hour" style={{ flex: 1 }} onPress={() => stepMin(-60)} />
        <BigButton label="+1 hour" style={{ flex: 1 }} onPress={() => stepMin(60)} />
      </View>
      <Txt v="small" color={colors.textMuted}>Quick picks</Txt>
      {REMINDER_TIMES.map((t) => {
        const on = t.hour === h && t.minute === m;
        return (
          <BigButton key={t.label} label={t.label} icon={on ? 'check' : 'clock'} state={on ? 'selected' : 'normal'} onPress={() => setTime(t.hour, t.minute)} />
        );
      })}
    </Card>
  );
}

/** Music volume in 10% steps, with a level bar and a quick mute. */
function MusicVolume() {
  const { state, setState, colors } = useApp();
  const v = Math.round(state.settings.musicVolume * 100);
  const set = (pct: number) => {
    const p = Math.max(0, Math.min(100, pct));
    setState((s) => ({ ...s, settings: { ...s.settings, musicVolume: p / 100, music: p > 0 ? true : s.settings.music } }));
  };
  const word = v === 0 ? 'Muted' : v <= 15 ? 'Whisper' : v <= 35 ? 'Soft' : v <= 60 ? 'Medium' : 'Loud';
  return (
    <Card>
      <Kicker icon="music">Music volume</Kicker>
      <Txt v="h1" center color={colors.accent}>{v}%</Txt>
      <Txt center color={colors.textMuted}>{word}</Txt>
      <ProgressBar value={v / 100} height={16} label={`Music volume ${v} percent`} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <BigButton label="Quieter" icon="minus" style={{ flex: 1 }} disabled={v <= 0} a11y={`Quieter, music volume ${v} percent`} onPress={() => set(v - 10)} />
        <BigButton label="Louder" icon="plus" style={{ flex: 1 }} disabled={v >= 100} a11y={`Louder, music volume ${v} percent`} onPress={() => set(v + 10)} />
      </View>
      <BigButton label={v === 0 ? 'Unmute (back to Soft)' : 'Mute music'} icon={v === 0 ? 'music' : 'x'} onPress={() => set(v === 0 ? 30 : 0)} />
    </Card>
  );
}

function DaysOff() {
  const { state, colors } = useApp();
  const set = useSetting();
  const off = state.settings.daysOff;
  return (
    <Card>
      <Kicker icon="moon">Days off</Kicker>
      <Txt v="small" color={colors.textMuted}>Meng stays quiet on these days.</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DAYS.map((d, i) => {
          const on = off.includes(i);
          return (
            <Pressable
              key={d}
              onPress={() => set('daysOff', on ? off.filter((x) => x !== i) : [...off, i])}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${d}${on ? ', day off' : ''}`}
              style={{
                minWidth: 64,
                minHeight: 56,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderWidth: on ? 3 : 2,
                borderColor: on ? colors.accent : colors.border,
                backgroundColor: on ? colors.brandSoft : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Txt bold={on}>{d.slice(0, 3)}</Txt>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

function VoicePicker() {
  const { state, colors } = useApp();
  const set = useSetting();
  const [voices, setVoices] = useState<Voice[]>([]);
  useEffect(() => {
    voiceChoices(6).then(setVoices);
  }, []);
  const pick = (id: string) => {
    set('voiceId', id);
    setVoiceSetting(id);
    speak(`Hi ${state.settings.name || 'Tori'}! Ready to learn some data today?`, { rate: state.settings.speechRate });
  };
  const cur = state.settings.voiceId;
  return (
    <Card>
      <Kicker icon="speaker">Voice</Kicker>
      <Txt v="small" color={colors.textMuted}>Tap a voice to hear it.</Txt>
      <BigButton label="Automatic" sub="A male voice when your phone has one" icon={cur === 'auto' ? 'check' : undefined} state={cur === 'auto' ? 'selected' : 'normal'} onPress={() => pick('auto')} />
      {voices.map((v, i) => (
        <BigButton
          key={v.identifier}
          label={`Voice ${i + 1}${isMale(v) ? ' (male)' : ''}`}
          sub={`${v.language}${v.identifier.includes('network') ? ' · needs internet' : ''}`}
          icon={cur === v.identifier ? 'check' : undefined}
          state={cur === v.identifier ? 'selected' : 'normal'}
          onPress={() => pick(v.identifier)}
        />
      ))}
      {voices.length === 0 ? <Txt v="small" color={colors.textMuted}>Loading voices…</Txt> : null}
    </Card>
  );
}

function ProfileCard() {
  const { state, colors } = useApp();
  const set = useSetting();
  const size = type.body * state.settings.textScale;
  const lessons = state.completed.length;
  return (
    <Card tone="hero">
      <View style={{ alignItems: 'center' }}>
        <Mascot mood="happy" size={110} />
      </View>
      <Txt v="h2" center>{state.settings.name || 'Tori'}</Txt>
      <Txt v="small" center color={colors.textMuted}>
        {lessons} lessons · {state.xp} XP · best streak {state.bestStreak} {state.bestStreak === 1 ? 'day' : 'days'}
      </Txt>
      <Kicker icon="pencil">Your name</Kicker>
      <TextInput
        value={state.settings.name}
        onChangeText={(t) => set('name', t.slice(0, 24))}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Your name"
        style={{ fontSize: size, color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 2, borderRadius: radius, padding: 14 }}
      />
    </Card>
  );
}

function NotificationCards() {
  const { state, colors } = useApp();
  const [sent, setSent] = useState(false);
  const st = state.settings;
  return (
    <>
      <Choice title="Notifications from Meng" icon="bell" k="notifications" options={onOff('On', 'Off')} />
      {st.notifications ? (
        <>
          <ReminderPicker />
          <Choice
            title="Second reminder"
            icon="clock"
            k="secondReminder"
            options={[
              { label: 'Off', value: false },
              { label: 'On', value: true, sub: `A gentle extra nudge at ${fmtTime(st.secondHour, 0)}` },
            ]}
          />
          {st.secondReminder ? (
            <Choice
              title="Second reminder time"
              icon="clock"
              k="secondHour"
              options={[9, 12, 15, 17].map((x) => ({ label: fmtTime(x, 0), value: x }))}
            />
          ) : null}
          <Choice
            title="Evening streak saver"
            icon="flame"
            k="streakSaver"
            options={[
              { label: 'On', value: true, sub: 'A note at 8:30 PM if today is not done yet' },
              { label: 'Off', value: false },
            ]}
          />
          <DaysOff />
          <BigButton
            label={sent ? 'Sent! Check your notifications' : 'Send a test notification'}
            icon="bell"
            onPress={() => testNotification(st.name || 'Tori').then((ok) => setSent(ok))}
          />
          {!sent ? null : <Txt v="small" color={colors.textMuted}>It arrives in a few seconds.</Txt>}
        </>
      ) : null}
    </>
  );
}

function DataCards() {
  const { state, setState, colors } = useApp();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const size = type.body * state.settings.textScale;
  const PREFIX = 'TORI-BACKUP:';

  const restore = () => {
    const raw = code.trim();
    if (!raw.startsWith(PREFIX)) return setMsg("That doesn't look like a Tori backup code. It should start with TORI-BACKUP:");
    let saved: AppState;
    try {
      saved = JSON.parse(raw.slice(PREFIX.length));
    } catch {
      return setMsg('That backup code seems incomplete. Try copying all of it again.');
    }
    Alert.alert('Restore this backup?', 'Your current progress on this phone will be replaced.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        onPress: () => {
          setState(() => ({ ...defaultState, ...saved, settings: { ...defaultState.settings, ...saved.settings } }));
          setCode('');
          setMsg('Progress restored!');
        },
      },
    ]);
  };
  const exportReflections = () => {
    const entries = Object.entries(state.reflections);
    const text = entries.length
      ? 'My boss-level summaries (Tori)\n\n' + entries.map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n')
      : 'No summaries yet. They appear after boss levels.';
    Share.share({ message: text, title: 'My Tori summaries' }).catch(() => {});
  };
  const resetBugs = () =>
    Alert.alert('Clear the Bug Book?', 'All saved mistakes will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setState((s) => ({ ...s, bugs: {} })) },
    ]);
  const resetAll = () =>
    Alert.alert('Reset all progress?', 'Lessons, XP, streaks, Bug Book and treats will start over. Settings stay.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Are you completely sure?', 'This cannot be undone. Maybe save a backup first?', [
            { text: 'Keep my progress', style: 'cancel' },
            { text: 'Reset everything', style: 'destructive', onPress: () => setState((s) => ({ ...defaultState, onboarded: true, settings: s.settings })) },
          ]),
      },
    ]);

  return (
    <>
      <Card>
        <Kicker icon="shield">Back up your progress</Kicker>
        <Txt color={colors.textMuted}>Save a backup code somewhere safe (Google Drive, email to yourself). On a new phone, paste it below.</Txt>
        <BigButton label="Save a backup" icon="save" variant="primary" onPress={() => Share.share({ message: PREFIX + JSON.stringify(state), title: 'Tori backup' }).catch(() => {})} />
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="Paste a backup code to restore"
          placeholderTextColor={colors.textMuted}
          multiline
          accessibilityLabel="Backup code"
          style={{ minHeight: 80, fontSize: size, color: colors.text, backgroundColor: colors.surfaceHi, borderColor: colors.border, borderWidth: 2, borderRadius: radius, padding: 12, textAlignVertical: 'top' }}
        />
        <BigButton label="Restore from code" icon="refresh" onPress={restore} disabled={!code.trim()} />
        {msg ? <Txt bold>{msg}</Txt> : null}
      </Card>
      <BigButton label="Export my summaries" sub="Your 'Explain it like I'm your boss' answers" icon="sheet" onPress={exportReflections} />
      <BigButton label="Clear the Bug Book" icon="bug" onPress={resetBugs} />
      <BigButton label="Reset all progress" sub="Asks twice before doing anything" icon="refresh" onPress={resetAll} />
    </>
  );
}

const WHATS_NEW = [
  'Notes from Meng, with smart reminders, a streak saver and days off',
  'A winding path with practice stars, boss crowns and cheat-sheet chests',
  'Bottom tabs: Today, Path, Library, Meng and Me',
  'The Library: re-read finished lessons and look up 200 analyst terms',
  'A cozy loading screen',
  'Background music: three original study tracks',
  'Learn tab: study guides, quick reference, glossary and free resources',
  'Lots of new settings: name, daily goal, any reminder time, sounds, outlines and more',
];

export function SettingsScreen({ go }: { go: Go }) {
  const { colors } = useApp();
  const [news, setNews] = useState(false);
  const version = Constants.expoConfig?.version ?? '';
  return (
    <Screen>
      <Txt v="h1">Me & settings</Txt>
      <ProfileCard />

      <Section icon="coffee" title="Learning">
        <Choice
          title="Daily goal"
          icon="star"
          k="dailyGoal"
          options={[
            { label: '1 new lesson a day', value: 1, sub: 'Relaxed' },
            { label: '2 new lessons a day', value: 2, sub: 'Steady (recommended)' },
            { label: '3 new lessons a day', value: 3, sub: 'Ambitious' },
          ]}
        />
        <Choice
          title="Practice before moving on"
          icon="refresh"
          k="mastery"
          options={[
            { label: 'Standard', value: 'standard', sub: 'Retry if more than 30% were missed' },
            { label: 'Gentle', value: 'gentle', sub: 'Retry if more than 45% were missed' },
          ]}
        />
      </Section>

      <Section icon="bell" title="Notifications">
        <NotificationCards />
      </Section>

      <Section icon="music" title="Music">
        <Choice title="Background music" icon="music" k="music" options={onOff('On', 'Off')} note="Original study tunes. They get quieter while lessons are read aloud." />
        <Choice title="Track" icon="music" k="musicTrack" options={TRACKS.map((t) => ({ label: t.name, value: t.id, sub: t.sub }))} />
        <MusicVolume />
      </Section>

      <Section icon="speaker" title="Sound & voice">
        <Choice title="Sound effects" icon="bell" k="sounds" options={onOff('On', 'Off')} />
        <Choice title="Meng's meows" icon="paw" k="meows" options={onOff('On', 'Off')} />
        <VoicePicker />
        <Choice title="Reading speed" icon="clock" k="speechRate" options={[{ label: 'Relaxed', value: 0.8 }, { label: 'Normal', value: 0.95 }, { label: 'Quick', value: 1.15 }]} />
        <Choice title="Read lessons aloud automatically" icon="speaker" k="autoRead" options={[{ label: 'Off (tap Listen when I want)', value: false }, { label: 'On', value: true }]} />
      </Section>

      <Section icon="palette" title="Display">
        <TextSizePicker />
        <Choice title="Theme" icon="palette" k="theme" options={[{ label: 'Cozy dark', value: 'dark' }, { label: 'Warm light', value: 'light' }, { label: 'Follow my phone', value: 'system' }]} />
        <Choice title="Bolder outlines" icon="pencil" k="boldOutlines" options={onOff('On', 'Off')} />
        <Choice title="Animations" icon="sparkle" k="animations" options={onOff('On', 'Off')} />
        <Choice title="Vibration" icon="bolt" k="haptics" options={onOff('On', 'Off')} />
      </Section>

      <Section icon="shield" title="Data">
        <DataCards />
      </Section>

      <Section icon="help" title="Help & about">
        <BigButton label="Replay the tour" sub="Meng shows you around again" icon="play" variant="primary" onPress={() => go({ name: 'tour' })} />
        {GUIDES.map((g) => (
          <BigButton key={g.id} label={g.title} icon={g.icon} onPress={() => go({ name: 'guide', id: g.id })} />
        ))}
        <BigButton label="What's new" icon="sparkle" onPress={() => setNews(!news)} />
        {news ? (
          <Card>
            <Kicker icon="sparkle">New in version {version}</Kicker>
            {WHATS_NEW.map((x) => (
              <Txt key={x}>• {x}</Txt>
            ))}
          </Card>
        ) : null}
        <Card tone="inset" style={{ alignItems: 'center' }}>
          <Txt bold center>Tori · version {version}</Txt>
          <Txt v="small" center color={colors.textMuted}>Made with love for Tori 💜🐾</Txt>
          <Txt v="small" center color={colors.textMuted}>Works offline. Your progress stays on this phone.</Txt>
        </Card>
      </Section>
    </Screen>
  );
}
