import React, { useRef, useState } from 'react';
import { ScrollViewInstance, View } from 'react-native';
import { MascotSays } from '../components/Mascot';
import { ChoiceQuestion, StepView } from '../components/questions';
import { BigButton, Card, ProgressBar, Screen, TopBar, Txt } from '../components/ui';
import { lessonById } from '../content';
import { Step } from '../content/types';
import { addCardBug, gradeCard, isQuestion, missRate, recordStat, resolveBug, ReviewItem, statLessonForCard, XP } from '../engine';
import { Finish, Go, ReviewMode } from '../nav';
import { useApp } from '../state';
import { space } from '../theme';
import { stopSpeaking } from '../voice';

function useScrollHelpers() {
  const ref = useRef<ScrollViewInstance | null>(null);
  return {
    ref,
    toTop: () => ref.current?.scrollTo({ y: 0, animated: false }),
    toEnd: () => setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 80),
  };
}

// One-time tips the first time she meets a new kind of step.
const HINTS: Record<string, string> = {
  sql: "This is a real SQL editor! Type, or tap the word buttons to build your query, then press Run. You can't break anything, so experiment!",
  order: 'Tap the items in the right order. Made a slip? Use "Undo last".',
  chart: 'Every chart has its own Listen button that reads all the values. A ★ marks the bar that matters most.',
  code: 'Code cards show a little program. Read it line by line, top to bottom, like a recipe.',
};
function hintFor(step: Step): string | null {
  if (step.kind === 'sql') return 'sql';
  if (step.kind === 'order') return 'order';
  const ex = 'example' in step ? step.example : undefined;
  if (ex?.kind === 'chart') return 'chart';
  if (ex?.kind === 'code') return 'code';
  return null;
}
function Hint({ id }: { id: string }) {
  const { state, setState } = useApp();
  if (state.hintsSeen.includes(id)) return null;
  return (
    <MascotSays mood="wave" size={100}>
      <Txt bold>New thing!</Txt>
      <Txt>{HINTS[id]}</Txt>
      <BigButton label="Got it" icon="check" onPress={() => setState((s) => ({ ...s, hintsSeen: [...s.hintsSeen, id] }))} />
    </MascotSays>
  );
}

export function LessonScreen({ id, xpSoFar, go, finish }: { id: string; xpSoFar: number; go: Go; finish: Finish }) {
  const { state, setState } = useApp();
  const lesson = lessonById(id)!;
  const steps = lesson.steps;
  const n = steps.length;
  const qCount = steps.filter(isQuestion).length;
  const [phase, setPhase] = useState<'main' | 'retryIntro' | 'retry'>('main');
  const [i, setI] = useState(0);
  const [xp, setXp] = useState(xpSoFar);
  const [missed, setMissed] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const lastOk = useRef(true);
  const scroll = useScrollHelpers();

  const nextMain = () => {
    stopSpeaking();
    if (i + 1 < n) {
      setI(i + 1);
      scroll.toTop();
      return;
    }
    if (qCount > 0 && missed.length / qCount > missRate(state)) {
      setQueue(missed);
      setPhase('retryIntro');
      scroll.toTop();
    } else finish(lesson.id, xp, missed, false);
  };

  const nextRetry = () => {
    stopSpeaking();
    const [cur, ...rest] = queue;
    const q = lastOk.current ? rest : [...rest, cur];
    if (!q.length) finish(lesson.id, xp, missed, true);
    else {
      setQueue(q);
      setRound((r) => r + 1);
      scroll.toTop();
    }
  };

  if (phase === 'retryIntro') {
    return (
      <Screen scrollRef={scroll.ref}>
        <TopBar onBack={() => go({ name: 'home' })} />
        <MascotSays mood="encourage">
          <Txt v="h2">Let's lock this in!</Txt>
          <Txt>
            A few of these were tricky ({missed.length} of {qCount}). That's totally normal. Let's practice those once more before we move on.
            Get each one right and the lesson is yours.
          </Txt>
        </MascotSays>
        <BigButton label="Practice the tricky ones" icon="refresh" variant="primary" onPress={() => setPhase('retry')} />
      </Screen>
    );
  }

  const stepIndex = phase === 'retry' ? queue[0] : i;
  const step = steps[stepIndex];
  const hint = hintFor(step);
  return (
    <Screen scrollRef={scroll.ref}>
      <TopBar
        onBack={() => go({ name: 'home' })}
        right={phase === 'retry' ? `Practice, ${queue.length} left` : `Step ${i + 1} of ${n}`}
      />
      <ProgressBar value={phase === 'retry' ? 1 - queue.length / Math.max(1, missed.length + 1) : i / n} label="Lesson progress" />
      <Txt v="small" bold color={undefined}>{lesson.title}</Txt>
      {hint ? <Hint id={hint} /> : null}
      <StepView
        key={`${phase}-${stepIndex}-${round}`}
        step={step}
        onAnswer={(ok) => {
          setState((s) => recordStat(s, lesson.id, ok));
          if (phase === 'main') {
            if (ok) setXp((x) => x + XP.correct);
            else setMissed((m) => (m.includes(i) ? m : [...m, i]));
          } else lastOk.current = ok;
          scroll.toEnd();
        }}
        onContinue={phase === 'retry' ? nextRetry : nextMain}
      />
    </Screen>
  );
}

const MODE_TEXT: Record<ReviewMode, { title: string; body: (n: number) => string }> = {
  warmup: { title: 'Warm-up', body: (n) => `${n} quick ${n === 1 ? 'question' : 'questions'} from earlier, then today's new lesson.` },
  practice: { title: 'Practice round', body: (n) => `${n} questions from everything you've learned. Keeps it fresh!` },
  lite: { title: 'Lite day', body: (n) => `Busy day? Just ${n} quick ${n === 1 ? 'question' : 'questions'}. Your streak stays safe.` },
  bugs: { title: 'Bug Book practice', body: (n) => `${n} questions that tripped you up before. Let's squash them!` },
  arcade: { title: 'Game arcade', body: (n) => `${n} quick games from lessons you've finished: matching, sorting, bug hunts and more!` },
  focus: { title: 'Focus practice', body: (n) => `${n} questions on a topic that's been tricky. A little extra practice makes it click!` },
};

export function ReviewScreen({
  items,
  then,
  mode,
  go,
  finish,
}: {
  items: ReviewItem[];
  then: string | null;
  mode: ReviewMode;
  go: Go;
  finish: Finish;
}) {
  const { setState, colors } = useApp();
  const [i, setI] = useState(-1); // -1 = intro
  const [xp, setXp] = useState(0);
  const scroll = useScrollHelpers();
  const text = MODE_TEXT[mode];

  const next = () => {
    stopSpeaking();
    if (i + 1 < items.length) {
      setI(i + 1);
      scroll.toTop();
    } else if (then) go({ name: 'lesson', id: then, xpSoFar: xp });
    else finish(null, xp);
  };

  if (i === -1) {
    return (
      <Screen>
        <TopBar onBack={() => go({ name: 'home' })} />
        <MascotSays mood={mode === 'bugs' ? 'think' : 'wave'}>
          <Txt v="h1">{text.title}</Txt>
          <Txt>{text.body(items.length)}</Txt>
        </MascotSays>
        <BigButton label="Let's go" icon="play" variant="primary" onPress={next} />
      </Screen>
    );
  }

  const item = items[i];
  const answered = (ok: boolean) => {
    setState((s) => {
      if (item.kind === 'step') return s;
      let out = recordStat(s, item.kind === 'card' ? statLessonForCard(item.card.id) : item.lessonId, ok);
      if (item.kind === 'card') {
        out = gradeCard(out, item.card.id, ok);
        if (item.key.startsWith('card#')) out = resolveBug(out, item.key, ok);
        else if (!ok) out = addCardBug(out, item.card.id);
      } else out = resolveBug(out, item.key, ok);
      return out;
    });
    if (ok) setXp((x) => x + XP.review);
    scroll.toEnd();
  };

  return (
    <Screen scrollRef={scroll.ref}>
      <TopBar onBack={() => go({ name: 'home' })} right={`${i + 1} of ${items.length}`} />
      <ProgressBar value={i / items.length} label={`Question ${i + 1} of ${items.length}`} />
      <View style={{ gap: space.xs }}>
        <Txt v="small" bold color={colors.accent}>
          {item.kind === 'step' ? 'Game time' : item.kind === 'bug' || item.key.startsWith('card#') ? 'From your Bug Book' : text.title}
        </Txt>
      </View>
      {item.kind === 'card' ? (
        <ChoiceQuestion
          key={item.key}
          prompt={item.card.front}
          options={item.card.options}
          answer={item.card.answer}
          onAnswer={answered}
          onContinue={next}
        />
      ) : item.kind === 'step' ? (
        <StepView key={item.key} step={item.step} onAnswer={answered} onContinue={next} />
      ) : (
        <StepView key={item.key} step={lessonById(item.lessonId)!.steps[item.step]} onAnswer={answered} onContinue={next} />
      )}
      {items.length === 0 ? (
        <Card>
          <Txt>Nothing to review right now.</Txt>
        </Card>
      ) : null}
    </Screen>
  );
}
