import React, { useState } from 'react';
import { View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { MascotSays, MASCOT_NAME, Mood } from '../components/Mascot';
import { ChoiceQuestion } from '../components/questions';
import { BigButton, Card, ListenButton, ProgressBar, Screen, Txt } from '../components/ui';
import { STAGES } from '../content';
import { useApp } from '../state';
import { space } from '../theme';
import { ReminderPicker, TextSizePicker } from './Settings';

const TOUR: { icon: IconName; title: string; text: string }[] = [
  { icon: 'home', title: 'Five tabs', text: 'At the bottom: Today (your daily dose), Path (your journey), Library (lesson notes and a glossary of every term), Meng (my corner) and Me (settings and help).' },
  { icon: 'coffee', title: "Today's dose", text: 'Each day: a quick warm-up, then one new lesson. About 5 minutes. Tap Start on Home.' },
  { icon: 'flame', title: 'Your streak', text: 'Come back every day to grow your flame. Miss one day? Your weekly streak freeze has your back.' },
  { icon: 'bolt', title: 'Lite days', text: 'Busy or tired? A 2-minute review still keeps your streak alive.' },
  { icon: 'map', title: 'Your path', text: 'A winding trail with practice stars, boss crowns and treasure chests. 14 stages, from your very first spreadsheet to landing the job. Tap any finished lesson to replay it.' },
  { icon: 'bug', title: 'Bug Book', text: "Mistakes aren't failures, they're bugs to squash! They come back a week later so they really stick." },
  { icon: 'sheet', title: 'Cheat sheets', text: "Beat a stage's boss level to unlock a one-page cheat sheet you can save as a PDF." },
  { icon: 'sheet', title: 'Real formulas', text: 'In spreadsheet lessons you type real formulas. Tap the buttons to build them, then press Check formula.' },
  { icon: 'fish', title: "Meng's corner", text: 'Every lesson earns treats. Share snacks and toys with me in Meng\'s corner. Tap me anytime to say hi!' },
  { icon: 'speaker', title: 'Listen anytime', text: 'Tap Listen on any screen and I\'ll read it to you. Charts too!' },
];

export function OnboardingScreen({ first = false, onDone }: { first?: boolean; onDone: () => void }) {
  const { state, setState, colors } = useApp();
  const [page, setPage] = useState(0);
  const [answered, setAnswered] = useState(false);

  // intro, journey, try-it, reward, tour..., [text size, reminder], finale
  const tourStart = 4;
  const setupStart = tourStart + TOUR.length;
  const finale = first ? setupStart + 2 : setupStart;
  const total = finale + 1;
  const next = () => setPage((p) => p + 1);

  const shell = (mood: Mood, body: React.ReactNode, actions: React.ReactNode, listen?: string) => (
    <Screen key={page}>
      <ProgressBar value={page / (total - 1)} label={`Step ${page + 1} of ${total}`} height={10} />
      <MascotSays mood={mood} size={150}>
        {body}
      </MascotSays>
      {listen ? <ListenButton text={listen} /> : null}
      <View style={{ gap: space.sm }}>
        {actions}
        {page > 0 && page !== 2 ? <BigButton label="Back" icon="back" variant="ghost" onPress={() => setPage((p) => p - 1)} /> : null}
      </View>
    </Screen>
  );

  if (page === 0) {
    const t = `Hi Tori! I'm ${MASCOT_NAME}, your data buddy. I'll be with you every step of the way, from your very first spreadsheet to your first analyst job.`;
    return shell(
      'wave',
      <>
        <Txt v="h1">Hi Tori!</Txt>
        <Txt>I'm <Txt bold>{MASCOT_NAME}</Txt>, your data buddy. I'll be with you every step of the way, from your very first spreadsheet to your first analyst job.</Txt>
      </>,
      <BigButton label={first ? "Nice to meet you!" : 'Start the tour'} icon="next" variant="primary" onPress={next} />,
      t,
    );
  }

  if (page === 1) {
    return shell(
      'think',
      <>
        <Txt v="h2">Your journey</Txt>
        <Txt>{STAGES.length} stages, a few minutes a day:</Txt>
        {STAGES.map((s) => (
          <View key={s.n} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
              <Txt v="small" bold color={colors.onBrand}>{s.n}</Txt>
            </View>
            <Txt style={{ flexShrink: 1 }}>{s.title}</Txt>
          </View>
        ))}
      </>,
      <BigButton label="Let's try one!" icon="play" variant="primary" onPress={next} />,
      `Your journey: ${STAGES.map((s) => s.title).join(', ')}.`,
    );
  }

  if (page === 2) {
    return (
      <Screen key="try">
        <ProgressBar value={page / (total - 1)} label="Tour progress" height={10} />
        <Card tone="hero">
          <Txt v="small" bold color={colors.accent}>Practice question</Txt>
          <Txt>Here's how questions work. Pick an answer!</Txt>
        </Card>
        <ChoiceQuestion
          prompt="What does a data analyst mostly do?"
          options={['Turn data into answers that help people decide', 'Fix broken printers', 'Design logos']}
          answer={0}
          why="Analysts are question-answerers. That's going to be you!"
          onAnswer={() => setAnswered(true)}
          onContinue={next}
        />
        {!answered ? <Txt v="small" color={colors.textMuted}>Tip: there's no penalty here, so just try.</Txt> : null}
      </Screen>
    );
  }

  if (page === 3) {
    return shell(
      'cheer',
      <>
        <Txt v="h1">That's it!</Txt>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="sparkle" size={30} color={colors.brand} />
          <Txt bold>Every right answer earns XP.</Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="flame" size={30} color={colors.brand} />
          <Txt bold>Every day you learn grows your streak.</Txt>
        </View>
        <Txt>Now let me show you around.</Txt>
      </>,
      <BigButton label="Show me around" icon="next" variant="primary" onPress={next} />,
    );
  }

  if (page < setupStart) {
    const t = TOUR[page - tourStart];
    return shell(
      'happy',
      <>
        <View style={{ alignItems: 'center', gap: space.sm }}>
          <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.brandSoft, borderWidth: 2, borderColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={t.icon} size={40} color={colors.accent} />
          </View>
          <Txt v="h2" center>{t.title}</Txt>
        </View>
        <Txt>{t.text}</Txt>
        <Txt v="small" color={colors.textMuted} center>{page - tourStart + 1} of {TOUR.length}</Txt>
      </>,
      <BigButton label="Next" icon="next" variant="primary" onPress={next} />,
      `${t.title}. ${t.text}`,
    );
  }

  if (first && page === setupStart) {
    return (
      <Screen key="size">
        <ProgressBar value={page / (total - 1)} label="Setup progress" height={10} />
        <Txt v="h1">Make it comfy</Txt>
        <TextSizePicker />
        <BigButton label="Next" icon="next" variant="primary" onPress={next} />
      </Screen>
    );
  }
  if (first && page === setupStart + 1) {
    return (
      <Screen key="time">
        <ProgressBar value={page / (total - 1)} label="Setup progress" height={10} />
        <Txt v="h1">Pick your time</Txt>
        <ReminderPicker />
        <BigButton label="Next" icon="next" variant="primary" onPress={next} />
      </Screen>
    );
  }

  return shell(
    'cheer',
    <>
      <Txt v="h1" center>{first ? 'Your adventure begins!' : "That's the tour!"}</Txt>
      <Txt center>{first ? "Your first lesson is waiting on your path. I'm so excited for you!" : 'You can replay it any time from Settings.'}</Txt>
    </>,
    <BigButton
      label={first ? "Let's go!" : 'Done'}
      icon="play"
      variant="primary"
      onPress={() => {
        if (first) {
          setState((s) => ({ ...s, onboarded: true }));
        }
        onDone();
      }}
    />,
  );
}
