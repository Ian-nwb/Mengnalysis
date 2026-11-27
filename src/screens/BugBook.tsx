import React from 'react';
import { View } from 'react-native';
import { MascotSays } from '../components/Mascot';
import { BigButton, Card, Kicker, Screen, TopBar, Txt } from '../components/ui';
import { lessonById } from '../content';
import { allBugs, dayStr, diffDays, ReviewItem } from '../engine';
import { Go } from '../nav';
import { useApp } from '../state';

function describe(item: ReviewItem): { prompt: string; answer: string; from: string } {
  if (item.kind === 'step') return { prompt: '', answer: '', from: 'Game' };
  if (item.kind === 'card') {
    return { prompt: item.card.front, answer: item.card.options[item.card.answer], from: 'Review card' };
  }
  const l = lessonById(item.lessonId)!;
  const st = l.steps[item.step];
  let prompt = '';
  let answer = '';
  if (st.kind === 'choice' || st.kind === 'blank') {
    prompt = st.prompt;
    answer = st.options[st.answer];
  } else if (st.kind === 'order') {
    prompt = st.prompt;
    answer = st.items.join(' → ');
  } else if (st.kind === 'match') {
    prompt = st.prompt;
    answer = st.pairs.map(([a, b]) => `${a} → ${b}`).join(' · ');
  } else if (st.kind === 'build') {
    prompt = st.prompt;
    answer = st.answer.join(' ');
  } else if (st.kind === 'sort') {
    prompt = st.prompt;
    answer = st.items.map(([t, b]) => `${t} → ${st.buckets[b]}`).join(' · ');
  } else if (st.kind === 'spot') {
    prompt = `${st.prompt} (${st.tokens.join(' ')})`;
    answer = `${st.tokens[st.bug]} → ${st.fix}`;
  } else if (st.kind === 'odd') {
    prompt = st.prompt;
    answer = st.items[st.answer];
  } else if (st.kind === 'chartpick') {
    prompt = st.prompt;
    answer = st.answer;
  } else if (st.kind === 'tf') {
    prompt = st.prompt;
    answer = st.statements.map(([s, v]) => `${v ? 'True' : 'False'}: ${s}`).join(' · ');
  } else if (st.kind === 'sheet') {
    prompt = st.prompt;
    answer = st.formula;
  } else if (st.kind === 'sql') {
    prompt = st.prompt;
    answer = st.answer;
  }
  return { prompt, answer, from: l.title };
}

export function BugBookScreen({ go }: { go: Go }) {
  const { state, colors } = useApp();
  const items = allBugs(state);
  const t = dayStr();
  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'home' })} />
      <MascotSays mood={items.length ? 'think' : 'cheer'}>
        <Txt v="h1">Bug Book</Txt>
        <Txt>
          {items.length
            ? "Every slip lands here. I'll bring each one back in your warm-ups about a week later. Answer it right and it's squashed!"
            : 'No bugs right now. Mistakes you make will show up here so you can squash them later.'}
        </Txt>
      </MascotSays>
      {items.length ? (
        <BigButton
          label={`Practice all ${items.length} now`}
          icon="bug"
          variant="primary"
          onPress={() => go({ name: 'review', items: items.slice(0, 10), then: null, mode: 'bugs' })}
        />
      ) : null}
      {items.map((it) => {
        const d = describe(it);
        const bug = state.bugs[it.key];
        const days = bug ? diffDays(t, bug.due) : 0;
        return (
          <Card key={it.key}>
            <Kicker icon="bug">{d.from}</Kicker>
            <Txt bold>{d.prompt}</Txt>
            <View style={{ borderLeftWidth: 4, borderLeftColor: colors.good, paddingLeft: 12 }}>
              <Txt v="small" color={colors.textMuted}>Right answer</Txt>
              <Txt bold color={colors.good}>{d.answer}</Txt>
            </View>
            <Txt v="small" color={colors.textMuted}>
              {days > 0 ? `Comes back in ${days} ${days === 1 ? 'day' : 'days'}` : 'Comes back in your next warm-up'}
              {bug && bug.misses > 1 ? `, a tricky one (${bug.misses} slips)` : ''}
            </Txt>
          </Card>
        );
      })}
    </Screen>
  );
}
