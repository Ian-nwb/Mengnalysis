import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Step } from '../content/types';
import { shuffle } from '../engine';
import { buzz } from '../haptics';
import { playSfx } from '../sfx';
import { useApp } from '../state';
import { space } from '../theme';
import { Chip } from './sql';
import { BigButton, BtnState, Card, Feedback, Kicker, ListenButton, Txt, useAutoRead } from './ui';

type Answered = (ok: boolean) => void;

/** Duolingo-style matching: tap a term, then its partner. */
export function MatchStep({ step, onAnswer, onContinue }: { step: Extract<Step, { kind: 'match' }>; onAnswer: Answered; onContinue: () => void }) {
  const { state, colors } = useApp();
  const lefts = useMemo(() => shuffle(step.pairs.map((_, i) => i)), [step.pairs]);
  const rights = useMemo(() => shuffle(step.pairs.map((_, i) => i)), [step.pairs]);
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<{ l: number; r: number } | null>(null);
  const [slips, setSlips] = useState(0);
  const finished = done.length === step.pairs.length;
  const reported = useRef(false);
  useAutoRead(`${step.prompt}. ` + step.pairs.map(([a]) => a).join(', '));

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onAnswer(slips <= 1);
    }
  }, [finished, slips, onAnswer]);

  const tryPair = (l: number | null, r: number | null) => {
    if (l === null || r === null) return;
    if (l === r) {
      setDone((d) => [...d, l]);
      playSfx('tap');
      buzz('light');
    } else {
      setSlips((x) => x + 1);
      setWrong({ l, r });
      buzz('warning');
      setTimeout(() => setWrong(null), 650);
    }
    setSelL(null);
    setSelR(null);
  };
  const st = (side: 'l' | 'r', i: number): BtnState => {
    if (done.includes(i)) return 'correct';
    if (wrong && (side === 'l' ? wrong.l === i : wrong.r === i)) return 'wrong';
    if ((side === 'l' ? selL : selR) === i) return 'selected';
    return 'normal';
  };
  const side = state.settings.textScale <= 1.15; // two columns at normal sizes, stacked when text is big
  const col = (which: 'l' | 'r') => (
    <View style={{ flex: side ? 1 : undefined, gap: space.sm }}>
      {(which === 'l' ? lefts : rights).map((i) => (
        <BigButton
          key={`${which}${i}`}
          label={step.pairs[i][which === 'l' ? 0 : 1]}
          state={st(which, i)}
          disabled={done.includes(i) || finished}
          a11y={`${which === 'l' ? 'Term' : 'Match'}: ${step.pairs[i][which === 'l' ? 0 : 1]}${done.includes(i) ? ', matched' : ''}`}
          onPress={() => {
            if (which === 'l') {
              setSelL(i);
              tryPair(i, selR);
            } else {
              setSelR(i);
              tryPair(selL, i);
            }
          }}
        />
      ))}
    </View>
  );
  return (
    <View style={{ gap: space.md }}>
      <Kicker icon="link">Match the pairs</Kicker>
      <Txt v="h2">{step.prompt}</Txt>
      <Txt v="small" color={colors.textMuted}>Tap one on each side. Matched pairs turn green.</Txt>
      <ListenButton text={`${step.prompt}. ` + step.pairs.map(([a, b]) => `${a}`).join(', ') + '. Options: ' + rights.map((i) => step.pairs[i][1]).join(', ')} />
      {side ? (
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {col('l')}
          {col('r')}
        </View>
      ) : (
        <>
          {col('l')}
          <Txt v="small" bold color={colors.accent}>…and their matches</Txt>
          {col('r')}
        </>
      )}
      {finished ? (
        <Feedback
          correct={slips <= 1}
          detail={`${slips === 0 ? 'Perfect matching!' : `Matched with ${slips} ${slips === 1 ? 'slip' : 'slips'}.`} ${step.why}`}
          onContinue={onContinue}
        />
      ) : null}
    </View>
  );
}

/** Build the answer from word tiles (with decoys). Tap a placed tile to send it back. */
export function BuildStep({ step, onAnswer, onContinue }: { step: Extract<Step, { kind: 'build' }>; onAnswer: Answered; onContinue: () => void }) {
  const { colors } = useApp();
  const tiles = useMemo(() => shuffle([...step.answer, ...step.extras].map((t, i) => ({ t, i }))), [step.answer, step.extras]);
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  useAutoRead(step.prompt);
  const built = picked.map((i) => tiles.find((x) => x.i === i)!.t);
  const check = () => {
    const ok = built.join(' ') === step.answer.join(' ');
    setResult(ok);
    onAnswer(ok);
  };
  return (
    <View style={{ gap: space.md }}>
      <Kicker icon="pencil">Build it</Kicker>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={`${step.prompt}. Tiles: ${tiles.map((x) => x.t).join(', ')}`} />
      <Card style={{ minHeight: 90, borderColor: result === null ? colors.brand : result ? colors.good : colors.bad, borderWidth: 3 }}>
        <Txt v="small" color={colors.textMuted}>Your answer</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {picked.length === 0 ? <Txt color={colors.textMuted}>Tap tiles below</Txt> : null}
          {picked.map((i) => (
            <Chip key={i} label={tiles.find((x) => x.i === i)!.t} onPress={() => result === null && setPicked(picked.filter((p) => p !== i))} />
          ))}
        </View>
      </Card>
      {result === null ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {tiles
              .filter((x) => !picked.includes(x.i))
              .map((x) => (
                <Chip key={x.i} label={x.t} onPress={() => setPicked([...picked, x.i])} />
              ))}
          </View>
          <BigButton label="Check" icon="check" variant="primary" disabled={!picked.length} onPress={check} />
        </>
      ) : (
        <Feedback correct={result} detail={result ? step.why : `The answer: ${step.answer.join(' ')}. ${step.why}`} onContinue={onContinue} />
      )}
    </View>
  );
}

/** A quick round of true/false statements, checked together. */
export function TrueFalseStep({ step, onAnswer, onContinue }: { step: Extract<Step, { kind: 'tf' }>; onAnswer: Answered; onContinue: () => void }) {
  const { colors } = useApp();
  const [ans, setAns] = useState<(boolean | null)[]>(() => step.statements.map(() => null));
  const [checked, setChecked] = useState(false);
  useAutoRead(`${step.prompt}. ` + step.statements.map(([s]) => s).join('. '));
  const right = step.statements.filter(([, v], i) => ans[i] === v).length;
  return (
    <View style={{ gap: space.md }}>
      <Kicker icon="check">True or false?</Kicker>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={step.statements.map(([s], i) => `Statement ${i + 1}: ${s}`).join('. ')} />
      {step.statements.map(([s, v], i) => {
        const mine = ans[i];
        const good = checked && mine === v;
        return (
          <Card key={i} style={checked ? { borderWidth: 3, borderColor: good ? colors.good : colors.bad } : undefined}>
            <Txt bold>{s}</Txt>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              {[true, false].map((b) => (
                <BigButton
                  key={String(b)}
                  label={b ? 'True' : 'False'}
                  style={{ flex: 1 }}
                  disabled={checked}
                  state={checked ? (b === v ? 'correct' : mine === b ? 'wrong' : 'dim') : mine === b ? 'selected' : 'normal'}
                  a11y={`Statement ${i + 1}: ${b ? 'True' : 'False'}${mine === b ? ', selected' : ''}`}
                  onPress={() => setAns(ans.map((x, j) => (j === i ? b : x)))}
                />
              ))}
            </View>
          </Card>
        );
      })}
      {!checked ? (
        <BigButton
          label={ans.some((x) => x === null) ? `Answer all ${step.statements.length}` : 'Check'}
          icon="check"
          variant="primary"
          disabled={ans.some((x) => x === null)}
          onPress={() => {
            setChecked(true);
            onAnswer(right === step.statements.length);
          }}
        />
      ) : (
        <Feedback correct={right === step.statements.length} detail={`${right} of ${step.statements.length} right. ${step.why}`} onContinue={onContinue} />
      )}
    </View>
  );
}

/** Sort each item into the right group, then check them all together. */
export function SortStep({ step, onAnswer, onContinue }: { step: Extract<Step, { kind: 'sort' }>; onAnswer: Answered; onContinue: () => void }) {
  const { colors } = useApp();
  const order = useMemo(() => shuffle(step.items.map((_, i) => i)), [step.items]);
  const [pick, setPick] = useState<(number | null)[]>(() => step.items.map(() => null));
  const [checked, setChecked] = useState(false);
  useAutoRead(`${step.prompt}. Groups: ${step.buckets.join(', ')}.`);
  const right = step.items.filter(([, b], i) => pick[i] === b).length;
  return (
    <View style={{ gap: space.md }}>
      <Kicker icon="box">Sort into groups</Kicker>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={`${step.prompt}. Groups: ${step.buckets.join(', ')}. Items: ${order.map((i) => step.items[i][0]).join(', ')}`} />
      {order.map((i) => {
        const [text, b] = step.items[i];
        const mine = pick[i];
        return (
          <Card key={i} style={checked ? { borderWidth: 3, borderColor: mine === b ? colors.good : colors.bad } : undefined}>
            <Txt bold>{text}</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {step.buckets.map((name, bi) => (
                <BigButton
                  key={name}
                  label={name}
                  style={{ flexGrow: 1, flexBasis: 120 }}
                  disabled={checked}
                  state={checked ? (bi === b ? 'correct' : mine === bi ? 'wrong' : 'dim') : mine === bi ? 'selected' : 'normal'}
                  a11y={`${text}: ${name}${mine === bi ? ', selected' : ''}`}
                  onPress={() => setPick(pick.map((x, j) => (j === i ? bi : x)))}
                />
              ))}
            </View>
          </Card>
        );
      })}
      {!checked ? (
        <BigButton
          label={pick.some((x) => x === null) ? `Sort all ${step.items.length}` : 'Check'}
          icon="check"
          variant="primary"
          disabled={pick.some((x) => x === null)}
          onPress={() => {
            setChecked(true);
            onAnswer(right === step.items.length);
          }}
        />
      ) : (
        <Feedback correct={right === step.items.length} detail={`${right} of ${step.items.length} sorted right. ${step.why}`} onContinue={onContinue} />
      )}
    </View>
  );
}

/** Find the bug: tap the piece of the formula or query that's wrong. */
export function SpotStep({ step, onAnswer, onContinue }: { step: Extract<Step, { kind: 'spot' }>; onAnswer: Answered; onContinue: () => void }) {
  const { colors, state } = useApp();
  const [picked, setPicked] = useState<number | null>(null);
  useAutoRead(`${step.prompt}. ${step.tokens.join(' ')}`);
  const fixed = step.tokens.map((t, i) => (i === step.bug ? step.fix : t)).join(' ');
  const size = Math.round(20 * state.settings.textScale);
  return (
    <View style={{ gap: space.md }}>
      <Kicker icon="bug">Find the bug</Kicker>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={`${step.prompt}. ${step.tokens.join(' ')}`} />
      <Card tone="inset">
        <Txt v="small" color={colors.textMuted}>Tap the part that's wrong</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {step.tokens.map((t, i) => {
            const isBug = i === step.bug;
            const done = picked !== null;
            return (
              <BigButton
                key={i}
                label={t}
                disabled={done}
                state={done ? (isBug ? 'correct' : picked === i ? 'wrong' : 'dim') : 'normal'}
                a11y={`Part ${i + 1}: ${t}`}
                style={{ minWidth: size * 2 }}
                onPress={() => {
                  setPicked(i);
                  onAnswer(i === step.bug);
                }}
              />
            );
          })}
        </View>
      </Card>
      {picked !== null ? (
        <>
          <Card>
            <Kicker icon="check">Fixed version</Kicker>
            <Txt bold color={colors.good} style={{ fontFamily: 'monospace' }}>{fixed}</Txt>
          </Card>
          <Feedback
            correct={picked === step.bug}
            detail={picked === step.bug ? `Bug squashed! ${step.why}` : `The bug was "${step.tokens[step.bug]}" → it should be "${step.fix}". ${step.why}`}
            onContinue={onContinue}
          />
        </>
      ) : null}
    </View>
  );
}

/** Odd one out: four tiles, one doesn't belong. */
export function OddStep({ step, onAnswer, onContinue }: { step: Extract<Step, { kind: 'odd' }>; onAnswer: Answered; onContinue: () => void }) {
  const order = useMemo(() => shuffle(step.items.map((_, i) => i)), [step.items]);
  const [picked, setPicked] = useState<number | null>(null);
  useAutoRead(`${step.prompt}. ${order.map((i) => step.items[i]).join(', ')}`);
  return (
    <View style={{ gap: space.md }}>
      <Kicker icon="sparkle">Odd one out</Kicker>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={`${step.prompt}. ${order.map((i) => step.items[i]).join(', ')}`} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {order.map((i) => (
          <BigButton
            key={i}
            label={step.items[i]}
            style={{ flexGrow: 1, flexBasis: 140, minHeight: 90 }}
            disabled={picked !== null}
            state={picked === null ? 'normal' : i === step.answer ? 'correct' : picked === i ? 'wrong' : 'dim'}
            onPress={() => {
              setPicked(i);
              onAnswer(i === step.answer);
            }}
          />
        ))}
      </View>
      {picked !== null ? (
        <Feedback
          correct={picked === step.answer}
          detail={picked === step.answer ? step.why : `The odd one out is "${step.items[step.answer]}". ${step.why}`}
          onContinue={onContinue}
        />
      ) : null}
    </View>
  );
}

/** Tap the chart: every bar is a button. */
export function ChartPickStep({ step, onAnswer, onContinue }: { step: Extract<Step, { kind: 'chartpick' }>; onAnswer: Answered; onContinue: () => void }) {
  const { colors } = useApp();
  const [picked, setPicked] = useState<string | null>(null);
  const max = Math.max(...step.data.map(([, v]) => v), 1);
  const fmt = (v: number) => `${step.unit ?? ''}${v.toLocaleString()}`;
  useAutoRead(`${step.prompt}. ${step.title}. ` + step.data.map(([k, v]) => `${k}: ${fmt(v)}`).join('. '));
  return (
    <View style={{ gap: space.md }}>
      <Kicker icon="chart">Tap the chart</Kicker>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={`${step.title}. ` + step.data.map(([k, v]) => `${k}: ${fmt(v)}`).join('. ')} />
      <Card tone="inset">
        <Kicker icon="chart">{step.title}</Kicker>
        {step.data.map(([label, v]) => {
          const isAns = label === step.answer;
          const state: BtnState = picked === null ? 'normal' : isAns ? 'correct' : picked === label ? 'wrong' : 'dim';
          const barColor = state === 'correct' ? colors.good : state === 'wrong' ? colors.bad : colors.brand;
          return (
            <View key={label} style={{ gap: 4 }}>
              <BigButton
                label={`${label}: ${fmt(v)}`}
                disabled={picked !== null}
                state={state}
                a11y={`${label}, ${fmt(v)}`}
                onPress={() => {
                  setPicked(label);
                  onAnswer(isAns);
                }}
              />
              <View style={{ height: 22, width: `${Math.max(4, (v / max) * 100)}%`, borderRadius: 8, backgroundColor: barColor }} />
            </View>
          );
        })}
      </Card>
      {picked !== null ? (
        <Feedback correct={picked === step.answer} detail={picked === step.answer ? step.why : `It was ${step.answer}. ${step.why}`} onContinue={onContinue} />
      ) : null}
    </View>
  );
}
