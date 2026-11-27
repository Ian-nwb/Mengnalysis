import { stopSpeaking } from '../voice';
import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Step } from '../content/types';
import { DATASETS, DatasetId } from '../sql/datasets';
import { Row, runQuery, sameResult } from '../sql/db';
import { useApp } from '../state';
import { radius, space, type } from '../theme';
import { BigButton, Card, Feedback, ListenButton, Txt, useAutoRead } from './ui';

const KEYWORDS = [
  'SELECT', '*', 'FROM', 'WHERE', '=', '>', '<', ',', "'", 'AND', 'OR',
  'ORDER BY', 'DESC', 'LIMIT', 'COUNT(*)', 'SUM(', 'AVG(', 'MAX(', 'MIN(', ')',
  'GROUP BY', 'HAVING', 'AS', 'JOIN', 'ON', 'DISTINCT',
];

export function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Insert ${label}`}
      style={({ pressed }) => ({
        minHeight: 52,
        minWidth: 52,
        paddingHorizontal: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: pressed ? colors.surfaceHi : colors.surface,
      })}
    >
      <Txt bold style={{ fontFamily: 'monospace' }}>{label}</Txt>
    </Pressable>
  );
}

const fmt = (v: Row[string]) =>
  v === null ? '(empty)' : typeof v === 'number' ? String(Math.round(v * 100) / 100) : String(v);

/** Results shown one row at a time as big cards (no wide tables). */
export function ResultsView({ rows }: { rows: Row[] }) {
  const { colors } = useApp();
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [rows]);
  if (rows.length === 0) return <Card><Txt>No rows matched.</Txt></Card>;
  const row = rows[Math.min(i, rows.length - 1)];
  const speech = Object.entries(row).map(([k, v]) => `${k}: ${fmt(v)}`).join('. ');
  return (
    <Card style={{ backgroundColor: colors.surfaceHi }}>
      <Txt bold color={colors.accent}>
        {rows.length} {rows.length === 1 ? 'row' : 'rows'}{rows.length > 1 ? `, showing row ${i + 1}` : ''}
      </Txt>
      {Object.entries(row).map(([k, v]) => (
        <View key={k} accessible accessibilityLabel={`${k}: ${v}`}>
          <Txt v="small" color={colors.textMuted}>{k}</Txt>
          <Txt bold>{fmt(v)}</Txt>
        </View>
      ))}
      {rows.length > 1 ? (
        <View style={{ gap: space.sm }}>
          <BigButton label="Next row" icon="↓" disabled={i >= rows.length - 1} onPress={() => setI(i + 1)} />
          <BigButton label="Previous row" icon="↑" disabled={i === 0} onPress={() => setI(i - 1)} />
        </View>
      ) : null}
      <ListenButton text={speech} />
    </Card>
  );
}

export function TablesCard({ dataset }: { dataset: DatasetId }) {
  const { colors } = useApp();
  const d = DATASETS[dataset];
  return (
    <Card>
      <Txt v="small" color={colors.textMuted}>{d.title}</Txt>
      {d.tables.map((t) => (
        <View key={t.name}>
          <Txt bold color={colors.accent}>Table: {t.name}</Txt>
          <Txt>Columns: {t.columns.join(', ')}</Txt>
        </View>
      ))}
    </Card>
  );
}

/** Big query box + tap-to-insert keywords, table and column names. */
export function SqlEditor({
  dataset,
  query,
  setQuery,
  onRun,
  extraButtons,
}: {
  dataset: DatasetId;
  query: string;
  setQuery: (q: string) => void;
  onRun: () => void;
  extraButtons?: React.ReactNode;
}) {
  const { colors, state } = useApp();
  const [sel, setSel] = useState({ start: query.length, end: query.length });
  const names = DATASETS[dataset].tables.flatMap((t) => [t.name, ...t.columns]);
  const uniqueNames = names.filter((n, i) => names.indexOf(n) === i);

  const insert = (word: string) => {
    const before = query.slice(0, sel.start);
    const after = query.slice(sel.end);
    const glue = before && !/[\s(]$/.test(before) && !/^[,)]/.test(word) ? ' ' : '';
    const text = glue + word + (/[('.]$/.test(word) ? '' : ' ');
    const next = before + text + after;
    const pos = before.length + text.length;
    setQuery(next);
    setSel({ start: pos, end: pos });
  };
  const deleteWord = () => {
    const trimmed = query.replace(/\s*\S+\s*$/, '');
    setQuery(trimmed ? trimmed + ' ' : '');
    setSel({ start: trimmed.length + 1, end: trimmed.length + 1 });
  };

  const size = type.body * state.settings.textScale;
  return (
    <View style={{ gap: space.sm }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        selection={sel}
        onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        placeholder="Type or tap below…"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="SQL query"
        style={{
          minHeight: 120,
          fontSize: size,
          lineHeight: Math.round(size * 1.4),
          fontFamily: 'monospace',
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.accent,
          borderWidth: 2,
          borderRadius: radius,
          padding: 14,
          textAlignVertical: 'top',
        }}
      />
      <BigButton label="Run query" icon="▶" variant="primary" onPress={onRun} />
      {extraButtons}
      <Txt v="small" color={colors.textMuted}>Tap to add</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {uniqueNames.map((n) => (
          <Chip key={'n' + n} label={n} onPress={() => insert(n)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {KEYWORDS.map((k) => (
          <Chip key={k} label={k} onPress={() => insert(k)} />
        ))}
      </View>
      <View style={{ gap: space.sm }}>
        <BigButton label="Delete last word" icon="⌫" onPress={deleteWord} />
        <BigButton label="Clear" icon="✕" onPress={() => { setQuery(''); setSel({ start: 0, end: 0 }); }} />
      </View>
    </View>
  );
}

type Status = 'idle' | 'wrong' | 'right' | 'revealed';

export function SqlStep({
  step,
  onAnswer,
  onContinue,
}: {
  step: Extract<Step, { kind: 'sql' }>;
  onAnswer: (ok: boolean) => void;
  onContinue: () => void;
}) {
  const { colors } = useApp();
  const [query, setQuery] = useState(step.starter ?? '');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [showHint, setShowHint] = useState(false);
  useAutoRead(step.prompt);

  const run = async (q = query, reveal = false) => {
    stopSpeaking();
    const res = await runQuery(q, step.dataset);
    if (!res.ok) {
      setError(res.error);
      setRows(null);
      return;
    }
    setError(null);
    setRows(res.rows);
    if (status === 'right' || status === 'revealed') return;
    if (reveal) {
      setStatus('revealed');
      onAnswer(false);
      return;
    }
    const exp = await runQuery(step.answer, step.dataset);
    if (exp.ok && sameResult(res.rows, exp.rows, /order\s+by/i.test(step.answer))) {
      setStatus('right');
      onAnswer(true);
    } else setStatus('wrong');
  };

  const done = status === 'right' || status === 'revealed';
  return (
    <View style={{ gap: space.md }}>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={step.prompt} />
      <TablesCard dataset={step.dataset} />
      <SqlEditor
        dataset={step.dataset}
        query={query}
        setQuery={setQuery}
        onRun={() => run()}
        extraButtons={
          !done ? (
            <View style={{ gap: space.sm }}>
              {!showHint ? <BigButton label="Hint" icon="💡" onPress={() => setShowHint(true)} /> : null}
              {status === 'wrong' ? (
                <BigButton
                  label="Show me the answer"
                  icon="👀"
                  onPress={() => {
                    setQuery(step.answer);
                    run(step.answer, true);
                  }}
                />
              ) : null}
            </View>
          ) : null
        }
      />
      {showHint ? (
        <Card>
          <Txt bold color={colors.accent}>💡 Hint</Txt>
          <Txt>{step.hint}</Txt>
        </Card>
      ) : null}
      {error ? (
        <Card style={{ borderColor: colors.bad, borderWidth: 3 }}>
          <Txt bold color={colors.bad}>✗ Error</Txt>
          <Txt>{error}</Txt>
        </Card>
      ) : null}
      {status === 'wrong' && rows ? (
        <Card style={{ borderColor: colors.bad, borderWidth: 3 }}>
          <Txt bold color={colors.bad}>✗ It ran, but that's not quite the answer</Txt>
          <Txt>Look at your results below, tweak the query, and run it again.</Txt>
        </Card>
      ) : null}
      {rows ? <ResultsView rows={rows} /> : null}
      {done ? (
        <Feedback
          correct={status === 'right'}
          detail={status === 'right' ? step.why : `Here's one way to write it: ${step.answer}. ${step.why}`}
          onContinue={onContinue}
        />
      ) : null}
    </View>
  );
}

/** Free-play SQL on any dataset, no right or wrong answers. */
export function SqlPlayground() {
  const [dataset, setDataset] = useState<DatasetId>('coffee');
  const [query, setQuery] = useState('SELECT * FROM sales');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useApp();
  const first: Record<DatasetId, string> = { coffee: 'sales', shop: 'customers', music: 'songs', app: 'users' };
  const run = async () => {
    const res = await runQuery(query, dataset);
    if (res.ok) {
      setRows(res.rows);
      setError(null);
    } else {
      setError(res.error);
      setRows(null);
    }
  };
  return (
    <View style={{ gap: space.md }}>
      <Txt bold>Pick a dataset</Txt>
      {(Object.keys(DATASETS) as DatasetId[]).map((id) => (
        <BigButton
          key={id}
          label={DATASETS[id].title}
          icon={id === dataset ? '●' : '○'}
          state={id === dataset ? 'selected' : 'normal'}
          onPress={() => {
            setDataset(id);
            setQuery(`SELECT * FROM ${first[id]}`);
            setRows(null);
            setError(null);
          }}
        />
      ))}
      <TablesCard dataset={dataset} />
      <SqlEditor dataset={dataset} query={query} setQuery={setQuery} onRun={run} />
      {error ? (
        <Card style={{ borderColor: colors.bad, borderWidth: 3 }}>
          <Txt bold color={colors.bad}>✗ Error</Txt>
          <Txt>{error}</Txt>
        </Card>
      ) : null}
      {rows ? <ResultsView rows={rows} /> : null}
    </View>
  );
}
