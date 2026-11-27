import React, { useEffect, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Example, Step } from '../content/types';
import { shuffle } from '../engine';
import { useApp } from '../state';
import { radius, space, type } from '../theme';
import { MascotSays } from './Mascot';
import { BuildStep, ChartPickStep, MatchStep, OddStep, SortStep, SpotStep, TrueFalseStep } from './games';
import { SheetStep } from './sheet';
import { SqlStep } from './sql';
import { BigButton, BtnState, Card, ExampleView, exampleSpeech, Feedback, ListenButton, Txt, useAutoRead } from './ui';

type Answered = (correct: boolean) => void;

export function ChoiceQuestion({
  prompt,
  options,
  answer,
  why,
  example,
  onAnswer,
  onContinue,
}: {
  prompt: string;
  options: string[];
  answer: number;
  why?: string;
  example?: Example;
  onAnswer: Answered;
  onContinue: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  // Options are shuffled so the right answer isn't always in the same spot.
  const order = useMemo(() => shuffle(options.map((_, i) => i)), [options]);
  const speech = `${prompt.replace('___', 'blank')}. ` + order.map((o, i) => `Option ${i + 1}: ${options[o]}.`).join(' ');
  useAutoRead(speech);

  const stateFor = (i: number): BtnState => {
    if (picked === null) return 'normal';
    if (i === answer) return 'correct';
    if (i === picked) return 'wrong';
    return 'dim';
  };
  const ok = picked === answer;
  const detail = ok ? why ?? 'You got it.' : `The answer is "${options[answer]}". ${why ?? ''}`;

  return (
    <View style={{ gap: space.md }}>
      <Txt v="h2">{prompt.replace('___', '_____')}</Txt>
      {example ? <ExampleView ex={example} /> : null}
      <ListenButton text={speech} />
      <View style={{ gap: space.sm }}>
        {order.map((i, pos) => (
          <BigButton
            key={options[i]}
            label={options[i]}
            state={stateFor(i)}
            disabled={picked !== null}
            a11y={`Option ${pos + 1}: ${options[i]}`}
            onPress={() => {
              setPicked(i);
              onAnswer(i === answer);
            }}
          />
        ))}
      </View>
      {picked !== null ? <Feedback correct={ok} detail={detail} onContinue={onContinue} /> : null}
    </View>
  );
}

function OrderQuestion({
  prompt,
  items,
  why,
  onAnswer,
  onContinue,
}: {
  prompt: string;
  items: string[];
  why: string;
  onAnswer: Answered;
  onContinue: () => void;
}) {
  const { colors } = useApp();
  const pool = useMemo(() => {
    let s = shuffle(items);
    if (s.every((x, i) => x === items[i])) s = [...items].reverse();
    return s;
  }, [items]);
  const [picked, setPicked] = useState<string[]>([]);
  const done = picked.length === items.length;
  const ok = done && picked.every((x, i) => x === items[i]);
  useAutoRead(`${prompt}. Steps: ${pool.join(', ')}.`);
  useEffect(() => {
    if (done) onAnswer(ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <View style={{ gap: space.md }}>
      <Txt v="h2">{prompt}</Txt>
      <ListenButton text={`${prompt}. Steps: ${pool.join(', ')}.`} />
      <Card>
        <Txt v="small" color={colors.textMuted}>Your order</Txt>
        {picked.length === 0 ? <Txt color={colors.textMuted}>Nothing yet</Txt> : null}
        {picked.map((x, i) => (
          <Txt key={x} bold color={done ? (x === items[i] ? colors.good : colors.bad) : colors.text}>
            {i + 1}. {x} {done ? (x === items[i] ? '✓' : '✗') : ''}
          </Txt>
        ))}
      </Card>
      {!done ? (
        <View style={{ gap: space.sm }}>
          {pool
            .filter((x) => !picked.includes(x))
            .map((x) => (
              <BigButton key={x} label={x} onPress={() => setPicked([...picked, x])} />
            ))}
          {picked.length > 0 ? <BigButton label="Undo last" icon="↩" onPress={() => setPicked(picked.slice(0, -1))} /> : null}
        </View>
      ) : (
        <Feedback correct={ok} detail={ok ? why : `The right order: ${items.join(' → ')}. ${why}`} onContinue={onContinue} />
      )}
    </View>
  );
}

function ExplainStep({ step, onContinue }: { step: Extract<Step, { kind: 'explain' }>; onContinue: () => void }) {
  const speech = `${step.title ?? ''}. ${step.text} ${exampleSpeech(step.example)}`;
  useAutoRead(speech);
  return (
    <View style={{ gap: space.md }}>
      {step.title ? <Txt v="h1">{step.title}</Txt> : null}
      <Txt>{step.text}</Txt>
      {step.example ? <ExampleView ex={step.example} /> : null}
      <ListenButton text={speech} />
      <BigButton label="Continue" variant="primary" onPress={onContinue} />
    </View>
  );
}

export function StepView({ step, onAnswer, onContinue }: { step: Step; onAnswer: Answered; onContinue: () => void }) {
  switch (step.kind) {
    case 'explain':
      return <ExplainStep step={step} onContinue={onContinue} />;
    case 'choice':
    case 'blank':
      return <ChoiceQuestion {...step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'order':
      return <OrderQuestion {...step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'reflect':
      return <ReflectStep step={step} onContinue={onContinue} />;
    case 'match':
      return <MatchStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'build':
      return <BuildStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'tf':
      return <TrueFalseStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'sort':
      return <SortStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'spot':
      return <SpotStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'odd':
      return <OddStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'chartpick':
      return <ChartPickStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'sheet':
      return <SheetStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
    case 'sql':
      return <SqlStep step={step} onAnswer={onAnswer} onContinue={onContinue} />;
  }
}

/** "Explain it like I'm your boss": plain-language summary, then a sample to compare. */
function ReflectStep({ step, onContinue }: { step: Extract<Step, { kind: 'reflect' }>; onContinue: () => void }) {
  const { colors, state, setState } = useApp();
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  useAutoRead(step.prompt);
  const size = type.body * state.settings.textScale;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <View style={{ gap: space.md }}>
      <MascotSays mood="think">
        <Txt v="h2">Explain it like I'm your boss</Txt>
        <Txt>{step.prompt}</Txt>
        <Txt v="small" color={colors.textMuted}>2–3 plain sentences. No jargon allowed! Tip: the microphone on your keyboard works too.</Txt>
      </MascotSays>
      <ListenButton text={step.prompt} />
      <TextInput
        value={text}
        onChangeText={setText}
        editable={!done}
        multiline
        placeholder="In plain words, what did we find?"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Your summary"
        style={{
          minHeight: 150,
          fontSize: size,
          lineHeight: Math.round(size * 1.4),
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.brand,
          borderWidth: 2,
          borderRadius: radius,
          padding: 14,
          textAlignVertical: 'top',
        }}
      />
      {!done ? (
        <BigButton
          label={words < 8 ? `Write a bit more (${words} words)` : 'Done, show me an example'}
          icon="check"
          variant="primary"
          disabled={words < 8}
          onPress={() => {
            setDone(true);
            setState((s) => ({ ...s, reflections: { ...s.reflections, [step.prompt]: text.trim() } }));
          }}
        />
      ) : (
        <>
          <Card tone="hero">
            <Txt bold color={colors.accent}>One great answer</Txt>
            <Txt>{step.sample}</Txt>
            <Txt v="small" color={colors.textMuted}>Did yours say what happened, why it matters, and what to do? Then you nailed it.</Txt>
          </Card>
          <ListenButton text={step.sample} />
          <BigButton label="Continue" variant="primary" onPress={onContinue} />
        </>
      )}
    </View>
  );
}
