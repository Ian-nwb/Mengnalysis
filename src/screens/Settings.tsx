import type { Voice } from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, Share, TextInput, View } from 'react-native';
import { BigButton, Card, Kicker, Screen, TopBar, Txt } from '../components/ui';
import { doneToday } from '../engine';
import { GUIDES } from '../guides';
import { Go } from '../nav';
import { REMINDER_TIMES, scheduleReminders } from '../reminders';
import { AppState, defaultState, Settings, useApp } from '../state';
import { radius, space, TEXT_SCALES, type } from '../theme';
import { isMale, setVoiceSetting, speak, voiceChoices } from '../voice';

export function TextSizePicker() {
  const { state, setState, colors } = useApp();
  const idx = Math.max(0, TEXT_SCALES.indexOf(state.settings.textScale));
  const set = (i: number) =>
    setState((s) => ({ ...s, settings: { ...s.settings, textScale: TEXT_SCALES[Math.max(0, Math.min(TEXT_SCALES.length - 1, i))] } }));
  return (
    <Card>
      <Kicker icon="text">Text size</Kicker>
      <Txt color={colors.textMuted}>This is how lessons will look.</Txt>
      <View style={{ gap: space.sm }}>
        <BigButton label="Bigger" icon="plus" disabled={idx >= TEXT_SCALES.length - 1} onPress={() => set(idx + 1)} />
        <BigButton label="Smaller" icon="minus" disabled={idx <= 0} onPress={() => set(idx - 1)} />
      </View>
      <Txt v="small" color={colors.textMuted}>Size {idx + 1} of {TEXT_SCALES.length}</Txt>
    </Card>
  );
}

export function ReminderPicker() {
  const { state, setState, colors } = useApp();
  const pick = (hour: number, minute: number) => {
    setState((s) => ({ ...s, settings: { ...s.settings, reminderHour: hour, reminderMinute: minute } }));
    scheduleReminders(hour, minute, doneToday(state));
  };
  return (
    <Card>
      <Kicker icon="bell">Daily reminder</Kicker>
      <Txt color={colors.textMuted}>When should Meng nudge you?</Txt>
      {REMINDER_TIMES.map((t) => {
        const on = t.hour === state.settings.reminderHour && t.minute === state.settings.reminderMinute;
        return (
          <BigButton
            key={t.label}
            label={t.label}
            icon={on ? 'check' : 'clock'}
            state={on ? 'selected' : 'normal'}
            a11y={`${t.label}${on ? ', selected' : ''}`}
            onPress={() => pick(t.hour, t.minute)}
          />
        );
      })}
    </Card>
  );
}

function Toggle<K extends keyof Settings>({
  title,
  icon,
  k,
  options,
}: {
  title: string;
  icon: Parameters<typeof Kicker>[0]['icon'];
  k: K;
  options: { label: string; value: Settings[K] }[];
}) {
  const { state, setState } = useApp();
  return (
    <Card>
      <Kicker icon={icon}>{title}</Kicker>
      {options.map((o) => {
        const on = state.settings[k] === o.value;
        return (
          <BigButton
            key={o.label}
            label={o.label}
            icon={on ? 'check' : undefined}
            state={on ? 'selected' : 'normal'}
            a11y={`${o.label}${on ? ', selected' : ''}`}
            onPress={() => setState((s) => ({ ...s, settings: { ...s.settings, [k]: o.value } }))}
          />
        );
      })}
    </Card>
  );
}

const SAMPLE = 'Hi Tori! Ready to learn some data today?';

function VoicePicker() {
  const { state, setState, colors } = useApp();
  const [voices, setVoices] = useState<Voice[]>([]);
  useEffect(() => {
    voiceChoices(6).then(setVoices);
  }, []);
  const pick = (id: string) => {
    setState((s) => ({ ...s, settings: { ...s.settings, voiceId: id } }));
    setVoiceSetting(id);
    speak(SAMPLE, { rate: state.settings.speechRate });
  };
  const cur = state.settings.voiceId;
  return (
    <Card>
      <Kicker icon="speaker">Voice</Kicker>
      <Txt color={colors.textMuted}>Tap a voice to hear it.</Txt>
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

function HelpCard({ go }: { go: Go }) {
  return (
    <Card>
      <Kicker icon="help">How to use Tori</Kicker>
      <BigButton label="Replay the tour" sub="Meng shows you around again" icon="play" variant="primary" onPress={() => go({ name: 'tour' })} />
      {GUIDES.map((g) => (
        <BigButton key={g.id} label={g.title} icon={g.icon} onPress={() => go({ name: 'guide', id: g.id })} />
      ))}
    </Card>
  );
}

export function SettingsScreen({ go }: { go: Go }) {
  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'home' })} />
      <Txt v="h1">Settings & help</Txt>
      <HelpCard go={go} />
      <TextSizePicker />
      <Toggle
        title="Theme"
        icon="palette"
        k="theme"
        options={[
          { label: 'Cozy dark', value: 'dark' },
          { label: 'Warm light', value: 'light' },
        ]}
      />
      <VoicePicker />
      <Toggle
        title="Read lessons aloud automatically"
        icon="speaker"
        k="autoRead"
        options={[
          { label: 'Off (tap Listen when I want)', value: false },
          { label: 'On', value: true },
        ]}
      />
      <Toggle
        title="Reading speed"
        icon="clock"
        k="speechRate"
        options={[
          { label: 'Relaxed', value: 0.8 },
          { label: 'Normal', value: 0.95 },
          { label: 'Quick', value: 1.15 },
        ]}
      />
      <Toggle
        title="Sound effects"
        icon="bell"
        k="sounds"
        options={[
          { label: 'On', value: true },
          { label: 'Off', value: false },
        ]}
      />
      <ReminderPicker />
      <BackupCard />
    </Screen>
  );
}

const PREFIX = 'TORI-BACKUP:';

/** Save progress as a text code (to Drive, email, notes...) and restore it on a new phone. */
function BackupCard() {
  const { state, setState, colors } = useApp();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const size = type.body * state.settings.textScale;

  const backup = () => {
    Share.share({ message: PREFIX + JSON.stringify(state), title: 'Tori backup' }).catch(() => {});
  };
  const restore = () => {
    const raw = code.trim();
    if (!raw.startsWith(PREFIX)) {
      setMsg("That doesn't look like a Tori backup code. It should start with TORI-BACKUP:");
      return;
    }
    let saved: AppState;
    try {
      saved = JSON.parse(raw.slice(PREFIX.length));
    } catch {
      setMsg('That backup code seems incomplete. Try copying all of it again.');
      return;
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

  return (
    <Card>
      <Kicker icon="shield">Back up your progress</Kicker>
      <Txt color={colors.textMuted}>
        Save a backup code somewhere safe (like Google Drive or an email to yourself). On a new phone, paste it here to get everything back.
      </Txt>
      <BigButton label="Save a backup" icon="save" onPress={backup} />
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Paste a backup code to restore"
        placeholderTextColor={colors.textMuted}
        multiline
        accessibilityLabel="Backup code"
        style={{
          minHeight: 80,
          fontSize: size,
          color: colors.text,
          backgroundColor: colors.surfaceHi,
          borderColor: colors.border,
          borderWidth: 2,
          borderRadius: radius,
          padding: 12,
          textAlignVertical: 'top',
        }}
      />
      <BigButton label="Restore from code" icon="refresh" onPress={restore} disabled={!code.trim()} />
      {msg ? <Txt bold>{msg}</Txt> : null}
    </Card>
  );
}
