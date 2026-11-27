import Constants from 'expo-constants';
import type { Voice } from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Share, TextInput, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { GroupTitle, NavRow, RowGroup, Sheet, ToggleRow } from '../components/kit';
import { Mascot } from '../components/Mascot';
import { BigButton, Card, Kicker, ProgressBar, Screen, Txt } from '../components/ui';
import { levelFor } from '../engine';
import { CATS, currentCat, unlockedCats } from '../cats';
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
        <Kicker icon={icon}>{title}</Kicker>
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
          sub={`${v.language}${v.identifier.includes('network') ? ' (needs internet)' : ''}`}
          icon={cur === v.identifier ? 'check' : undefined}
          state={cur === v.identifier ? 'selected' : 'normal'}
          onPress={() => pick(v.identifier)}
        />
      ))}
      {voices.length === 0 ? <Txt v="small" color={colors.textMuted}>Loading voices…</Txt> : null}
    </Card>
  );
}

const WHATS_NEW = [
  'A cozier look: your cat peeks over Today\'s dose, warm apricot for treats and streaks, calmer labels',
  'Tori 2.0: all the cats got a cuter makeover, with big shiny eyes, blushing cheeks, toe-bean paws and soft shading',
  'A matching new app icon and splash screen',
  'A new app icon: all five cats together',
  'Cats: tap the paw in the cat corner to unlock Tuxedo, Orangina, Whitey and Dost as you learn, and pick who keeps you company',
  'A fresh Today screen: your daily dose up top, quick stats, and colorful practice tiles',
  'A fresh Me & settings page: profile, tidy groups and on/off switches',
  'A new Learn hub: search everything, pick up where you left off, colorful sections',
  "Real toy play in Meng's home: fling the yarn ball, wave the feather, chase the mouse, scratch the box",
  'Meng comes alive: her tail swishes, ears twitch, she kneads when purring, chases butterflies, dozes off and dances after a big meal',
  'New games: Sort into groups, Find the bug, Odd one out and Tap the chart, plus a Game arcade on Today',
  '24 new lessons (309 in total) and 11 new glossary terms',
  "A cleaner Meng's home: one status band on top, no overlapping buttons",
  'New games in lessons: Match the pairs, Build it from word tiles, and True or false',
  'A term-matching game in warm-ups, practice and Learn → Glossary',
  'New stage: Real-World Projects (5 case studies), plus 15 new skill lessons',
  "Meng's home: a Living room, Kitchen and Bedroom with everything on one screen",
  'Meng watches your snack, opens her mouth for food, squishes when poked, yawns, stretches, gets dizzy and giggles',
  "Meng's corner is now a real little pet: rub her to pet her, drag snacks and toys onto her",
  'Meng blinks, breathes, purrs, chews and shows hearts',
  'Softer Rainy café music',
  'Notes from Meng, with smart reminders, a streak saver and days off',
  'A winding path with practice stars, boss crowns and cheat-sheet chests',
  'Bottom tabs: Today, Path, Library, Meng and Me',
  'The Library: re-read finished lessons and look up 200 analyst terms',
  'A cozy loading screen',
  'Background music: three original study tracks',
  'Learn tab: study guides, quick reference, glossary and free resources',
  'Lots of new settings: name, daily goal, any reminder time, sounds, outlines and more',
];

function ProfileHeader({ onEdit }: { onEdit: () => void }) {
  const { state, colors } = useApp();
  const lvl = levelFor(state.xp);
  const stats: [IconName, string, string][] = [
    ['book', `${state.completed.length}`, state.completed.length === 1 ? 'lesson' : 'lessons'],
    ['star', `Level ${lvl.level}`, `${state.xp} XP`],
    ['flame', `${state.bestStreak}`, 'best streak'],
    ['fish', `${state.pet.treats}`, 'treats'],
  ];
  return (
    <Card tone="hero">
      <View style={{ alignItems: 'center' }}>
        <Mascot mood="wave" size={120} />
      </View>
      <Txt v="h1" center>{state.settings.name || 'Tori'}</Txt>
      <Txt center color={colors.textMuted}>{lvl.title}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {stats.map(([icon, v, l]) => (
          <View
            key={l + v}
            accessible
            accessibilityLabel={`${v} ${l}`}
            style={{ flexGrow: 1, flexBasis: 120, backgroundColor: colors.surface, borderRadius: 16, padding: space.sm, alignItems: 'center', gap: 2 }}
          >
            <Icon name={icon} size={26} color={colors.accent} />
            <Txt bold center>{v}</Txt>
            <Txt v="small" center color={colors.textMuted}>{l}</Txt>
          </View>
        ))}
      </View>
      <BigButton label="Edit my name" icon="pencil" variant="ghost" onPress={onEdit} />
    </Card>
  );
}

function NamePanel() {
  const { state, colors } = useApp();
  const set = useSetting();
  const size = type.body * state.settings.textScale;
  return (
    <>
      <Txt color={colors.textMuted}>Meng uses this name in greetings and notes.</Txt>
      <TextInput
        value={state.settings.name}
        onChangeText={(t) => set('name', t.slice(0, 24))}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Your name"
        style={{ fontSize: size, color: colors.text, backgroundColor: colors.surface, borderColor: colors.brand, borderWidth: 2, borderRadius: radius, padding: 14 }}
      />
    </>
  );
}

function RemindersPanel() {
  const { state, colors } = useApp();
  const set = useSetting();
  const [sent, setSent] = useState(false);
  const st = state.settings;
  return (
    <>
      <ReminderPicker />
      <RowGroup>
        <ToggleRow title="Second reminder" sub={`A gentle extra nudge at ${fmtTime(st.secondHour, 0)}`} value={st.secondReminder} onChange={(v) => set('secondReminder', v)} />
        <ToggleRow title="Evening streak saver" sub="A note at 8:30 PM if today is not done yet" value={st.streakSaver} onChange={(v) => set('streakSaver', v)} />
      </RowGroup>
      {st.secondReminder ? (
        <Choice title="Second reminder time" icon="clock" k="secondHour" options={[9, 12, 15, 17].map((x) => ({ label: fmtTime(x, 0), value: x }))} />
      ) : null}
      <DaysOff />
      <BigButton
        label={sent ? 'Sent! It arrives in a few seconds' : 'Send a test notification'}
        icon="bell"
        onPress={() => testNotification(st.name || 'Tori').then((ok) => setSent(ok))}
      />
      {sent ? <Txt v="small" color={colors.textMuted}>Check your notification shade.</Txt> : null}
    </>
  );
}

const PREFIX = 'TORI-BACKUP:';

function BackupPanel() {
  const { state, setState, colors } = useApp();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const size = type.body * state.settings.textScale;
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
          setState(() => ({ ...defaultState, ...saved, pet: { ...defaultState.pet, ...saved.pet }, settings: { ...defaultState.settings, ...saved.settings } }));
          setCode('');
          setMsg('Progress restored!');
        },
      },
    ]);
  };
  return (
    <>
      <Txt color={colors.textMuted}>Save a backup code somewhere safe (Google Drive, or an email to yourself). On a new phone, paste it below.</Txt>
      <BigButton label="Save a backup" icon="save" variant="primary" onPress={() => Share.share({ message: PREFIX + JSON.stringify(state), title: 'Tori backup' }).catch(() => {})} />
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Paste a backup code to restore"
        placeholderTextColor={colors.textMuted}
        multiline
        accessibilityLabel="Backup code"
        style={{ minHeight: 90, fontSize: size, color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 2, borderRadius: radius, padding: 12, textAlignVertical: 'top' }}
      />
      <BigButton label="Restore from code" icon="refresh" onPress={restore} disabled={!code.trim()} />
      {msg ? <Txt bold>{msg}</Txt> : null}
    </>
  );
}

type Panel = 'name' | 'goal' | 'mastery' | 'reminders' | 'track' | 'volume' | 'voice' | 'speed' | 'text' | 'theme' | 'backup' | 'guides' | 'news';
const PANEL_TITLES: Record<Panel, string> = {
  name: 'Your name',
  goal: 'Daily goal',
  mastery: 'Practice before moving on',
  reminders: 'Reminders',
  track: 'Music track',
  volume: 'Music volume',
  voice: 'Voice',
  speed: 'Reading speed',
  text: 'Text size',
  theme: 'Theme',
  backup: 'Back up or restore',
  guides: 'How-to guides',
  news: "What's new",
};

export function SettingsScreen({ go }: { go: Go }) {
  const { state, setState, colors } = useApp();
  const set = useSetting();
  const [panel, setPanel] = useState<Panel | null>(null);
  const st = state.settings;
  const version = Constants.expoConfig?.version ?? '';
  const track = TRACKS.find((t) => t.id === st.musicTrack)?.name ?? TRACKS[0].name;
  const sizeIdx = Math.max(0, TEXT_SCALES.indexOf(st.textScale));
  const themeName = st.theme === 'dark' ? 'Cozy dark' : st.theme === 'light' ? 'Warm light' : 'Follows my phone';
  const speedName = st.speechRate <= 0.85 ? 'Relaxed' : st.speechRate >= 1.1 ? 'Quick' : 'Normal';

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
    <Screen>
      <ProfileHeader onEdit={() => setPanel('name')} />

      <GroupTitle>Your cat</GroupTitle>
      <RowGroup>
        <NavRow icon="paw" title="Cats" value={`${currentCat(state).name}, ${unlockedCats(state).length} of ${CATS.length} unlocked`} onPress={() => go({ name: 'cats' })} />
      </RowGroup>

      <GroupTitle>Learning</GroupTitle>
      <RowGroup>
        <NavRow icon="star" title="Daily goal" value={`${st.dailyGoal} new ${st.dailyGoal === 1 ? 'lesson' : 'lessons'} a day`} onPress={() => setPanel('goal')} />
        <NavRow icon="refresh" title="Practice before moving on" value={st.mastery === 'gentle' ? 'Gentle' : 'Standard'} onPress={() => setPanel('mastery')} />
      </RowGroup>

      <GroupTitle>Notifications</GroupTitle>
      <RowGroup>
        <ToggleRow title="Notes from Meng" sub="Daily reminders in her voice" value={st.notifications} onChange={(v) => set('notifications', v)} />
        {st.notifications ? (
          <NavRow
            icon="bell"
            title="Reminder times and days off"
            value={`${fmtTime(st.reminderHour, st.reminderMinute)}${st.secondReminder ? ` and ${fmtTime(st.secondHour, 0)}` : ''}${st.daysOff.length ? `, ${st.daysOff.length} ${st.daysOff.length === 1 ? 'day' : 'days'} off` : ''}`}
            onPress={() => setPanel('reminders')}
          />
        ) : null}
      </RowGroup>

      <GroupTitle>Music and sound</GroupTitle>
      <RowGroup>
        <ToggleRow title="Background music" sub={st.music ? `Playing: ${track}` : 'Off'} value={st.music} onChange={(v) => set('music', v)} />
        <NavRow icon="music" title="Track" value={track} onPress={() => setPanel('track')} />
        <NavRow icon="speaker" title="Music volume" value={`${Math.round(st.musicVolume * 100)}%`} onPress={() => setPanel('volume')} />
        <ToggleRow title="Sound effects" value={st.sounds} onChange={(v) => set('sounds', v)} />
        <ToggleRow title="Meng's meows and purrs" value={st.meows} onChange={(v) => set('meows', v)} />
        <ToggleRow title="Vibration" value={st.haptics} onChange={(v) => set('haptics', v)} />
      </RowGroup>

      <GroupTitle>Reading and voice</GroupTitle>
      <RowGroup>
        <NavRow icon="speaker" title="Voice" value={st.voiceId === 'auto' ? 'Automatic (male when available)' : 'Chosen voice'} onPress={() => setPanel('voice')} />
        <NavRow icon="clock" title="Reading speed" value={speedName} onPress={() => setPanel('speed')} />
        <ToggleRow title="Read lessons aloud automatically" value={st.autoRead} onChange={(v) => set('autoRead', v)} />
      </RowGroup>

      <GroupTitle>Display</GroupTitle>
      <RowGroup>
        <NavRow icon="text" title="Text size" value={`Size ${sizeIdx + 1} of ${TEXT_SCALES.length}`} onPress={() => setPanel('text')} />
        <NavRow icon="palette" title="Theme" value={themeName} onPress={() => setPanel('theme')} />
        <ToggleRow title="Bolder outlines" value={st.boldOutlines} onChange={(v) => set('boldOutlines', v)} />
        <ToggleRow title="Animations" value={st.animations} onChange={(v) => set('animations', v)} />
      </RowGroup>

      <GroupTitle>Your data</GroupTitle>
      <RowGroup>
        <NavRow icon="shield" title="Back up or restore" value="Save a code to Drive or email" onPress={() => setPanel('backup')} />
        <NavRow icon="sheet" title="Export my summaries" value="Your boss-level answers" onPress={exportReflections} />
        <NavRow icon="bug" title="Clear the Bug Book" onPress={resetBugs} />
        <NavRow icon="refresh" title="Reset all progress" value="Asks twice first" danger onPress={resetAll} />
      </RowGroup>

      <GroupTitle>Help and about</GroupTitle>
      <RowGroup>
        <NavRow icon="play" title="Replay the tour" value="Meng shows you around again" onPress={() => go({ name: 'tour' })} />
        <NavRow icon="help" title="How-to guides" value={`${GUIDES.length} topics`} onPress={() => setPanel('guides')} />
        <NavRow icon="sparkle" title="What's new" value={`Version ${version}`} onPress={() => setPanel('news')} />
      </RowGroup>

      <View style={{ alignItems: 'center', gap: 2, paddingVertical: space.md }}>
        <Txt bold center>Tori, version {version}</Txt>
        <Txt v="small" center color={colors.textMuted}>Made with love for Tori 💜🐾</Txt>
        <Txt v="small" center color={colors.textMuted}>Works offline. Your progress stays on this phone.</Txt>
      </View>

      <Sheet visible={panel !== null} title={panel ? PANEL_TITLES[panel] : ''} onClose={() => setPanel(null)}>
        {panel === 'name' ? <NamePanel /> : null}
        {panel === 'goal' ? (
          <Choice
            title="New lessons per day"
            icon="star"
            k="dailyGoal"
            options={[
              { label: '1 new lesson a day', value: 1, sub: 'Relaxed' },
              { label: '2 new lessons a day', value: 2, sub: 'Steady (recommended)' },
              { label: '3 new lessons a day', value: 3, sub: 'Ambitious' },
            ]}
          />
        ) : null}
        {panel === 'mastery' ? (
          <Choice
            title="When to practice a lesson again"
            icon="refresh"
            k="mastery"
            options={[
              { label: 'Standard', value: 'standard', sub: 'Retry if more than 30% were missed' },
              { label: 'Gentle', value: 'gentle', sub: 'Retry if more than 45% were missed' },
            ]}
          />
        ) : null}
        {panel === 'reminders' ? <RemindersPanel /> : null}
        {panel === 'track' ? <Choice title="Pick a track" icon="music" k="musicTrack" options={TRACKS.map((t) => ({ label: t.name, value: t.id, sub: t.sub }))} /> : null}
        {panel === 'volume' ? <MusicVolume /> : null}
        {panel === 'voice' ? <VoicePicker /> : null}
        {panel === 'speed' ? <Choice title="How fast Listen reads" icon="clock" k="speechRate" options={[{ label: 'Relaxed', value: 0.8 }, { label: 'Normal', value: 0.95 }, { label: 'Quick', value: 1.15 }]} /> : null}
        {panel === 'text' ? <TextSizePicker /> : null}
        {panel === 'theme' ? (
          <Choice title="Theme" icon="palette" k="theme" options={[{ label: 'Cozy dark', value: 'dark' }, { label: 'Warm light', value: 'light' }, { label: 'Follow my phone', value: 'system' }]} />
        ) : null}
        {panel === 'backup' ? <BackupPanel /> : null}
        {panel === 'guides'
          ? GUIDES.map((g) => (
              <BigButton
                key={g.id}
                label={g.title}
                icon={g.icon}
                onPress={() => {
                  setPanel(null);
                  go({ name: 'guide', id: g.id });
                }}
              />
            ))
          : null}
        {panel === 'news' ? (
          <Card>
            <Kicker icon="sparkle">New in Tori</Kicker>
            {WHATS_NEW.map((x) => (
              <Txt key={x}>• {x}</Txt>
            ))}
          </Card>
        ) : null}
      </Sheet>
    </Screen>
  );
}
