import React, { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { MascotSays } from '../components/Mascot';
import { SheetTable } from '../components/sheet';
import { BigButton, Card, ExampleView, exampleSpeech, Kicker, ListenButton, Screen, TopBar, Txt } from '../components/ui';
import { lessonById, lessonsInStage, STAGES } from '../content';
import { glossarySorted } from '../content/glossary';
import { REFERENCE } from '../content/reference';
import { RESOURCES } from '../content/resources';
import { STUDY_GUIDES } from '../content/studyguides';
import { Lesson, Step } from '../content/types';
import { focusItems, termMatchItem } from '../engine';
import { Go } from '../nav';
import { useApp } from '../state';
import { radius, space, type } from '../theme';

type Section = 'notes' | 'guides' | 'reference' | 'glossary' | 'resources';
const SECTIONS: { id: Section; label: string; icon: IconName }[] = [
  { id: 'notes', label: 'Lesson notes', icon: 'book' },
  { id: 'guides', label: 'Study guides', icon: 'bulb' },
  { id: 'reference', label: 'Quick reference', icon: 'code' },
  { id: 'glossary', label: 'Glossary', icon: 'text' },
  { id: 'resources', label: 'Free resources', icon: 'link' },
];

function GuideList({ go }: { go: Go }) {
  const { state, colors } = useApp();
  return (
    <>
      <MascotSays mood="happy" size={110}>
        <Txt>A calm read for each stage: the big ideas in one place. Great before a boss level, or just to refresh.</Txt>
      </MascotSays>
      {STUDY_GUIDES.map((g) => {
        const st = STAGES.find((s) => s.n === g.stage);
        const reached = lessonsInStage(g.stage).some((l) => state.completed.includes(l.id));
        return (
          <BigButton
            key={g.stage}
            label={g.title}
            sub={`Stage ${g.stage} · ${st?.title}${reached ? '' : ' · a sneak peek'}`}
            icon="bulb"
            onPress={() => go({ name: 'study', stage: g.stage })}
          />
        );
      })}
      <Txt v="small" color={colors.textMuted}>Tip: tap Listen on any guide to hear it while you relax.</Txt>
    </>
  );
}

function ReferenceList() {
  const { colors } = useApp();
  const [open, setOpen] = useState<string | null>('sheets');
  return (
    <>
      {REFERENCE.map((g) => {
        const isOpen = open === g.id;
        return (
          <Card key={g.id}>
            <Pressable
              onPress={() => setOpen(isOpen ? null : g.id)}
              accessibilityRole="button"
              accessibilityLabel={`${g.title}. ${g.items.length} entries. ${isOpen ? 'Hide' : 'Show'}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}
            >
              <Icon name={g.icon} size={30} color={colors.accent} />
              <View style={{ flexGrow: 1, flexShrink: 1 }}>
                <Txt v="h2">{g.title}</Txt>
                <Txt v="small" color={colors.textMuted}>{g.items.length} entries</Txt>
              </View>
              <Icon name={isOpen ? 'up' : 'down'} size={26} color={colors.accent} />
            </Pressable>
            {isOpen
              ? g.items.map((it) => (
                  <View key={it.name} style={{ borderLeftWidth: 4, borderLeftColor: colors.brand, paddingLeft: 12, gap: 2, marginTop: space.xs }}>
                    <Txt bold color={colors.accent}>{it.name}</Txt>
                    <Txt bold style={{ fontFamily: 'monospace' }}>{it.syntax}</Txt>
                    <Txt>{it.does}</Txt>
                    {it.example ? <Txt v="small" color={colors.textMuted} style={{ fontFamily: 'monospace' }}>e.g. {it.example}</Txt> : null}
                  </View>
                ))
              : null}
            {isOpen ? <ListenButton text={`${g.title}. ` + g.items.map((it) => `${it.name}: ${it.does}`).join('. ')} /> : null}
          </Card>
        );
      })}
    </>
  );
}

function ResourceList() {
  const { colors } = useApp();
  const topics = Array.from(new Set(RESOURCES.map((r) => r.topic)));
  return (
    <>
      <MascotSays mood="wave" size={110}>
        <Txt>Free, trusted places to practice more. They open in your browser.</Txt>
      </MascotSays>
      {topics.map((t) => (
        <View key={t} style={{ gap: space.sm }}>
          <Txt v="h2" color={colors.accent}>{t}</Txt>
          {RESOURCES.filter((r) => r.topic === t).map((r) => (
            <BigButton key={r.url} label={r.title} sub={r.what} icon="link" a11y={`${r.title}. ${r.what}. Opens in your browser`} onPress={() => Linking.openURL(r.url).catch(() => {})} />
          ))}
        </View>
      ))}
    </>
  );
}

/** A stage study guide as a calm reading page. */
export function StudyScreen({ stage, go }: { stage: number; go: Go }) {
  const { colors } = useApp();
  const g = STUDY_GUIDES.find((x) => x.stage === stage)!;
  const st = STAGES.find((s) => s.n === stage);
  const speech = `${g.title}. ${g.intro} ` + g.sections.map((s) => `${s.heading}. ${s.body.join(' ')}`).join(' ') + ` Key takeaways: ${g.takeaways.join('. ')}.`;
  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'library' })} backLabel="Learn" />
      <Card tone="hero">
        <Kicker icon="bulb">Study guide · Stage {stage} · {st?.title}</Kicker>
        <Txt v="h1">{g.title}</Txt>
        <Txt>{g.intro}</Txt>
      </Card>
      <ListenButton text={speech} />
      {g.sections.map((s) => (
        <View key={s.heading} style={{ gap: space.sm }}>
          <Txt v="h2" color={colors.accent}>{s.heading}</Txt>
          {s.body.map((p) => (
            <Txt key={p}>{p}</Txt>
          ))}
        </View>
      ))}
      <Card>
        <Kicker icon="star">Key takeaways</Kicker>
        {g.takeaways.map((t) => (
          <View key={t} style={{ flexDirection: 'row', gap: 10 }}>
            <Icon name="check" size={24} color={colors.good} />
            <Txt style={{ flexShrink: 1 }}>{t}</Txt>
          </View>
        ))}
      </Card>
      <BigButton label="Back to Learn" icon="back" variant="primary" onPress={() => go({ name: 'library' })} />
    </Screen>
  );
}

export function LibraryScreen({ go }: { go: Go }) {
  const { state, colors } = useApp();
  const [tab, setTab] = useState<Section>('notes');
  const [open, setOpen] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [stage, setStage] = useState<number | null>(null);
  const [limit, setLimit] = useState(25);
  const size = type.body * state.settings.textScale;
  const doneCount = state.completed.length;

  const terms = glossarySorted().filter(
    (t) =>
      (stage === null || t.stage === stage) &&
      (!q.trim() || `${t.term} ${t.def}`.toLowerCase().includes(q.trim().toLowerCase())),
  );

  return (
    <Screen>
      <Txt v="h1">Learn</Txt>
      <Txt color={colors.textMuted}>Your study corner: notes, guides, quick reference, a glossary and free resources.</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {SECTIONS.map((x) => (
          <BigButton
            key={x.id}
            label={x.label}
            icon={x.icon}
            style={{ flexGrow: 1, flexBasis: 150 }}
            state={tab === x.id ? 'selected' : 'normal'}
            a11y={`${x.label}${tab === x.id ? ', selected' : ''}`}
            onPress={() => setTab(x.id)}
          />
        ))}
      </View>
      {tab === 'notes' ? (
        <>
          <MascotSays mood="think" size={110}>
            <Txt>
              {doneCount
                ? 'Every lesson you finish becomes a page here. Read it again anytime, or tap Listen.'
                : 'Finish your first lesson and its notes will appear here to read anytime.'}
            </Txt>
          </MascotSays>
          {STAGES.map((st) => {
            const lessons = lessonsInStage(st.n).filter((l) => state.completed.includes(l.id));
            if (!lessons.length) return null;
            const isOpen = open === st.n;
            return (
              <Card key={st.n}>
                <Pressable
                  onPress={() => setOpen(isOpen ? null : st.n)}
                  accessibilityRole="button"
                  accessibilityLabel={`Stage ${st.n}: ${st.title}. ${lessons.length} lessons to read. ${isOpen ? 'Hide' : 'Show'}`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}
                >
                  <View style={{ flexShrink: 1, flexGrow: 1 }}>
                    <Txt v="small" bold color={colors.accent}>STAGE {st.n}</Txt>
                    <Txt v="h2">{st.title}</Txt>
                    <Txt v="small" color={colors.textMuted}>{lessons.length} {lessons.length === 1 ? 'page' : 'pages'}</Txt>
                  </View>
                  <Icon name={isOpen ? 'up' : 'down'} size={26} color={colors.accent} />
                </Pressable>
                {isOpen
                  ? lessons.map((l) => <BigButton key={l.id} label={l.title} icon="book" onPress={() => go({ name: 'reader', id: l.id })} />)
                  : null}
              </Card>
            );
          })}
        </>
      ) : tab === 'glossary' ? (
        <>
          <BigButton
            label="Play term match"
            sub="Match 4 terms to their meanings"
            icon="link"
            variant="primary"
            onPress={() => {
              const m = termMatchItem({ ...state, completed: state.completed.length ? state.completed : [] }, 4);
              if (m) go({ name: 'review', items: [m], then: null, mode: 'practice' });
            }}
          />
          <TextInput
            value={q}
            onChangeText={(t) => {
              setQ(t);
              setLimit(25);
            }}
            placeholder="Search terms, like JOIN or churn"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Search the glossary"
            autoCorrect={false}
            style={{ fontSize: size, color: colors.text, backgroundColor: colors.surface, borderColor: colors.brand, borderWidth: 2, borderRadius: radius, padding: 14 }}
          />
          <Txt v="small" color={colors.textMuted}>Filter by stage</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[null, ...STAGES.map((s) => s.n)].map((n) => {
              const on = stage === n;
              return (
                <Pressable
                  key={String(n)}
                  onPress={() => {
                    setStage(n);
                    setLimit(25);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={n === null ? 'All stages' : `Stage ${n}: ${STAGES.find((s) => s.n === n)?.title}`}
                  style={{
                    minWidth: 56,
                    minHeight: 52,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: on ? 3 : 2,
                    borderColor: on ? colors.accent : colors.border,
                    backgroundColor: on ? colors.brandSoft : colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Txt bold={on}>{n === null ? 'All' : n}</Txt>
                </Pressable>
              );
            })}
          </View>
          {stage !== null ? <Txt bold color={colors.accent}>{STAGES.find((s) => s.n === stage)?.title}</Txt> : null}
          <Txt v="small" color={colors.textMuted}>{terms.length} {terms.length === 1 ? 'term' : 'terms'}</Txt>
          {terms.slice(0, limit).map((t) => (
            <Card key={t.term}>
              <Txt v="h2" color={colors.accent}>{t.term}</Txt>
              <Txt>{t.def}</Txt>
              {t.example ? (
                <Txt bold style={{ fontFamily: 'monospace' }}>
                  {t.example}
                </Txt>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <Txt v="small" color={colors.textMuted}>Stage {t.stage} · {STAGES.find((s) => s.n === t.stage)?.title}</Txt>
              </View>
              <ListenButton text={`${t.term}. ${t.def}${t.example ? ` For example: ${t.example}` : ''}`} />
            </Card>
          ))}
          {terms.length > limit ? <BigButton label={`Show more (${terms.length - limit} left)`} icon="down" onPress={() => setLimit(limit + 25)} /> : null}
          {!terms.length ? <Txt>No terms match. Try a shorter word.</Txt> : null}
        </>
      ) : tab === 'guides' ? (
        <GuideList go={go} />
      ) : tab === 'reference' ? (
        <ReferenceList />
      ) : (
        <ResourceList />
      )}
    </Screen>
  );
}

function stepText(st: Step): string {
  switch (st.kind) {
    case 'explain':
      return `${st.title ?? ''}. ${st.text} ${exampleSpeech(st.example)}`;
    case 'choice':
    case 'blank':
      return `Quick check: ${st.prompt.replace('___', 'blank')} Answer: ${st.options[st.answer]}. ${st.why}`;
    case 'order':
      return `${st.prompt} The order is: ${st.items.join(', ')}. ${st.why}`;
    case 'sql':
      return `Practice: ${st.prompt} One answer: ${st.answer}. ${st.why}`;
    case 'sheet':
      return `Practice: ${st.prompt} Formula: ${st.formula}. ${st.why}`;
    case 'reflect':
      return `Summary: ${st.prompt} Example: ${st.sample}`;
    case 'match':
      return `Match: ${st.pairs.map(([a, b]) => `${a} goes with ${b}`).join('. ')}. ${st.why}`;
    case 'build':
      return `Build: ${st.prompt} Answer: ${st.answer.join(' ')}. ${st.why}`;
    case 'tf':
      return `True or false: ${st.statements.map(([s, v]) => `${s} ${v ? 'True' : 'False'}`).join('. ')}. ${st.why}`;
    case 'sort':
      return `Sort: ${st.items.map(([t, b]) => `${t}: ${st.buckets[b]}`).join('. ')}. ${st.why}`;
    case 'spot':
      return `Find the bug: ${st.tokens.join(' ')}. The bug is ${st.tokens[st.bug]}, it should be ${st.fix}. ${st.why}`;
    case 'odd':
      return `Odd one out: ${st.items[st.answer]}. ${st.why}`;
    case 'chartpick':
      return `${st.prompt} Answer: ${st.answer}. ${st.why}`;
  }
}

/** A finished lesson as a readable page: explanations plus the answers to every check. */
export function ReaderScreen({ id, go }: { id: string; go: Go }) {
  const { state, colors } = useApp();
  const l = lessonById(id) as Lesson;
  const stage = STAGES.find((s) => s.n === l.stage);
  const all = `${l.title}. ` + l.steps.map(stepText).join(' ') + ' Remember: ' + l.review.map((c) => `${c.front} ${c.options[c.answer]}`).join('. ');
  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'library' })} backLabel="Library" />
      <Card tone="hero">
        <Kicker icon="book">Stage {l.stage} · {stage?.title}</Kicker>
        <Txt v="h1">{l.title}</Txt>
      </Card>
      <ListenButton text={all} />
      {l.steps.map((st, i) => {
        if (st.kind === 'explain')
          return (
            <View key={i} style={{ gap: space.sm }}>
              {st.title ? <Txt v="h2">{st.title}</Txt> : null}
              <Txt>{st.text}</Txt>
              {st.example ? <ExampleView ex={st.example} /> : null}
            </View>
          );
        if (st.kind === 'choice' || st.kind === 'blank')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="help">Quick check</Kicker>
              <Txt bold>{st.prompt.replace('___', '_____')}</Txt>
              {st.example ? <ExampleView ex={st.example} /> : null}
              <View style={{ borderLeftWidth: 4, borderLeftColor: colors.good, paddingLeft: 12 }}>
                <Txt bold color={colors.good}>{st.options[st.answer]}</Txt>
                <Txt>{st.why}</Txt>
              </View>
            </Card>
          );
        if (st.kind === 'order')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="help">In order</Kicker>
              <Txt bold>{st.prompt}</Txt>
              {st.items.map((it, j) => (
                <Txt key={it}>{j + 1}. {it}</Txt>
              ))}
              <Txt color={colors.textMuted}>{st.why}</Txt>
            </Card>
          );
        if (st.kind === 'sql')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="database">SQL practice</Kicker>
              <Txt bold>{st.prompt}</Txt>
              <Txt bold color={colors.accent} style={{ fontFamily: 'monospace' }}>{st.answer}</Txt>
              <Txt>{st.why}</Txt>
            </Card>
          );
        if (st.kind === 'sheet')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="sheet">Formula practice</Kicker>
              <Txt bold>{st.prompt}</Txt>
              <SheetTable table={st.table} />
              <Txt bold color={colors.accent} style={{ fontFamily: 'monospace' }}>{st.formula}</Txt>
              <Txt>{st.why}</Txt>
            </Card>
          );
        if (st.kind === 'match')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="link">Pairs</Kicker>
              <Txt bold>{st.prompt}</Txt>
              {st.pairs.map(([a, b]) => (
                <Txt key={a}>
                  <Txt bold>{a}</Txt> → {b}
                </Txt>
              ))}
            </Card>
          );
        if (st.kind === 'build')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="pencil">Build it</Kicker>
              <Txt bold>{st.prompt}</Txt>
              <Txt bold color={colors.accent} style={{ fontFamily: 'monospace' }}>{st.answer.join(' ')}</Txt>
              <Txt>{st.why}</Txt>
            </Card>
          );
        if (st.kind === 'sort')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="box">Sorted</Kicker>
              <Txt bold>{st.prompt}</Txt>
              {st.buckets.map((b, bi) => (
                <Txt key={b}>
                  <Txt bold color={colors.accent}>{b}:</Txt> {st.items.filter(([, x]) => x === bi).map(([t]) => t).join(' · ')}
                </Txt>
              ))}
            </Card>
          );
        if (st.kind === 'spot')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="bug">Find the bug</Kicker>
              <Txt bold>{st.prompt}</Txt>
              <Txt style={{ fontFamily: 'monospace' }}>{st.tokens.join(' ')}</Txt>
              <Txt bold color={colors.good} style={{ fontFamily: 'monospace' }}>{st.tokens.map((t, j) => (j === st.bug ? st.fix : t)).join(' ')}</Txt>
              <Txt>{st.why}</Txt>
            </Card>
          );
        if (st.kind === 'odd' || st.kind === 'chartpick')
          return (
            <Card key={i} tone="inset">
              <Kicker icon={st.kind === 'odd' ? 'sparkle' : 'chart'}>{st.kind === 'odd' ? 'Odd one out' : 'Read the chart'}</Kicker>
              <Txt bold>{st.prompt}</Txt>
              <Txt bold color={colors.good}>{st.kind === 'odd' ? st.items[st.answer] : st.answer}</Txt>
              <Txt>{st.why}</Txt>
            </Card>
          );
        if (st.kind === 'tf')
          return (
            <Card key={i} tone="inset">
              <Kicker icon="check">True or false</Kicker>
              {st.statements.map(([s, v]) => (
                <Txt key={s}>
                  <Txt bold color={v ? colors.good : colors.bad}>{v ? 'True' : 'False'}</Txt> · {s}
                </Txt>
              ))}
            </Card>
          );
        return (
          <Card key={i} tone="inset">
            <Kicker icon="pencil">Explain it like I'm your boss</Kicker>
            <Txt bold>{st.prompt}</Txt>
            {state.reflections[st.prompt] ? (
              <>
                <Txt v="small" color={colors.textMuted}>You wrote</Txt>
                <Txt>{state.reflections[st.prompt]}</Txt>
              </>
            ) : null}
            <Txt v="small" color={colors.textMuted}>Example answer</Txt>
            <Txt>{st.sample}</Txt>
          </Card>
        );
      })}
      <Card>
        <Kicker icon="bulb">Remember</Kicker>
        {l.review.map((c) => (
          <View key={c.id} style={{ gap: 2 }}>
            <Txt>{c.front}</Txt>
            <Txt bold color={colors.good}>→ {c.options[c.answer]}</Txt>
          </View>
        ))}
      </Card>
      <BigButton label="Practice this lesson" icon="refresh" variant="primary" onPress={() => go({ name: 'review', items: focusItems(state, l.id), then: null, mode: 'focus' })} />
      <BigButton label="Replay the lesson" icon="play" onPress={() => go({ name: 'lesson', id: l.id, xpSoFar: 0 })} />
    </Screen>
  );
}
