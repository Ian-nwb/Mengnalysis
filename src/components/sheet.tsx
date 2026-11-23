import React, { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Step } from '../content/types';
import { columnLetter, evalFormula, FormulaError, formatValue, functionsIn, gridFrom, sameValue, Scalar } from '../sheet/formula';
import { useApp } from '../state';
import { radius, space, type } from '../theme';
import { Chip } from './sql';
import { BigButton, Card, Feedback, Kicker, ListenButton, Txt, useAutoRead } from './ui';

const BASE_FUNCS = ['SUM(', 'AVERAGE(', 'COUNT(', 'MIN(', 'MAX(', 'IF('];
const SYMBOLS = ['=', '(', ')', ',', ':', '"', '>', '<', '*', '/', '+', '-', '&'];

/** The practice table, shown one row per card (no wide grids). */
export function SheetTable({ table }: { table: (string | number)[][] }) {
  const { colors } = useApp();
  const headers = table[0];
  return (
    <Card tone="inset">
      <Kicker icon="sheet">Your spreadsheet</Kicker>
      <Txt v="small" color={colors.textMuted}>
        Row 1 has the headers: {headers.map((h, i) => `${columnLetter(i)} = ${h}`).join(' · ')}
      </Txt>
      {table.slice(1).map((row, ri) => (
        <View
          key={ri}
          accessible
          accessibilityLabel={`Row ${ri + 2}: ` + row.map((v, ci) => `${columnLetter(ci)}${ri + 2}, ${headers[ci]}: ${v}`).join('. ')}
          style={{ borderLeftWidth: 4, borderLeftColor: colors.brand, paddingLeft: 12, gap: 2 }}
        >
          <Txt v="small" bold color={colors.accent}>Row {ri + 2}</Txt>
          {row.map((v, ci) => (
            <Txt key={ci}>
              <Txt bold>{columnLetter(ci)}{ri + 2}</Txt> {headers[ci]}: {String(v)}
            </Txt>
          ))}
        </View>
      ))}
    </Card>
  );
}

type Status = 'idle' | 'wrong' | 'right' | 'revealed';

export function SheetStep({
  step,
  onAnswer,
  onContinue,
}: {
  step: Extract<Step, { kind: 'sheet' }>;
  onAnswer: (ok: boolean) => void;
  onContinue: () => void;
}) {
  const { colors, state } = useApp();
  const grid = useMemo(() => gridFrom(step.table), [step.table]);
  const expected = useMemo(() => evalFormula(step.formula, grid), [step.formula, grid]);
  const [f, setF] = useState('=');
  const [sel, setSel] = useState({ start: 1, end: 1 });
  const [result, setResult] = useState<Scalar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [hint, setHint] = useState(false);
  useAutoRead(step.prompt);

  const rows = step.table.length;
  const cols = step.table[0].length;
  const ranges = Array.from({ length: cols }, (_, c) => `${columnLetter(c)}2:${columnLetter(c)}${rows}`);
  const funcs = Array.from(new Set([...(step.mustUse ?? []).map((x) => `${x}(`), ...functionsIn(step.formula).map((x) => `${x}(`), ...BASE_FUNCS]));

  const insert = (w: string) => {
    const before = f.slice(0, sel.start);
    const after = f.slice(sel.end);
    const next = before + w + after;
    const pos = before.length + w.length;
    setF(next);
    setSel({ start: pos, end: pos });
  };
  const backspace = () => {
    const t = f.replace(/([A-Z]+\(|\$?[A-Z]+\$?\d+(:\$?[A-Z]+\$?\d+)?|.)$/i, '');
    const v = t || '=';
    setF(v);
    setSel({ start: v.length, end: v.length });
  };

  const check = (formula = f, reveal = false) => {
    try {
      const v = evalFormula(formula, grid);
      setResult(v);
      setError(null);
      if (status === 'right' || status === 'revealed') return;
      if (reveal) {
        setStatus('revealed');
        onAnswer(false);
        return;
      }
      if (!/\$?[A-Z]{1,2}\$?\d/i.test(formula.replace(/"[^"]*"/g, ''))) {
        setStatus('wrong');
        setError('Use cell references like C2 or C2:C6, not typed-in numbers, so the formula updates when the data changes.');
        return;
      }
      const used = functionsIn(formula);
      const missing = (step.mustUse ?? []).filter((m) => !used.includes(m.toUpperCase()));
      if (sameValue(v, expected) && !missing.length) {
        setStatus('right');
        onAnswer(true);
      } else {
        setStatus('wrong');
        if (sameValue(v, expected) && missing.length) setError(`Right number! But try it with ${missing.join(' / ')}.`);
      }
    } catch (e) {
      setResult(null);
      setError(e instanceof FormulaError ? `${e.code} ${e.message}` : 'Something went wrong with that formula.');
    }
  };

  const size = type.h2 * state.settings.textScale;
  const done = status === 'right' || status === 'revealed';
  return (
    <View style={{ gap: space.md }}>
      <Txt v="h2">{step.prompt}</Txt>
      <ListenButton text={step.prompt} />
      <SheetTable table={step.table} />
      <TextInput
        value={f}
        onChangeText={(t) => setF(t.startsWith('=') ? t : '=' + t)}
        selection={sel}
        onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
        autoCapitalize="characters"
        autoCorrect={false}
        spellCheck={false}
        editable={!done}
        accessibilityLabel="Formula"
        style={{
          minHeight: 70,
          fontSize: size,
          fontFamily: 'monospace',
          color: colors.text,
          backgroundColor: colors.surface,
          borderColor: colors.accent,
          borderWidth: 3,
          borderRadius: radius,
          padding: 14,
        }}
      />
      {!done ? (
        <>
          <BigButton label="Check formula" icon="play" variant="primary" onPress={() => check()} />
          {!hint ? <BigButton label="Hint" icon="bulb" onPress={() => setHint(true)} /> : null}
          {status === 'wrong' ? (
            <BigButton
              label="Show me the answer"
              icon="eye"
              onPress={() => {
                setF(step.formula);
                check(step.formula, true);
              }}
            />
          ) : null}
          <Txt v="small" color={colors.textMuted}>Tap to add</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {funcs.map((x) => (
              <Chip key={x} label={x} onPress={() => insert(x)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ranges.map((x) => (
              <Chip key={x} label={x} onPress={() => insert(x)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SYMBOLS.map((x) => (
              <Chip key={x} label={x} onPress={() => insert(x)} />
            ))}
          </View>
          <BigButton label="Delete last piece" icon="erase" onPress={backspace} />
        </>
      ) : null}
      {hint && !done ? (
        <Card>
          <Kicker icon="bulb">Hint</Kicker>
          <Txt>{step.hint}</Txt>
        </Card>
      ) : null}
      {error ? (
        <Card style={{ borderColor: colors.bad, borderWidth: 3 }}>
          <Txt bold color={colors.bad}>{error}</Txt>
        </Card>
      ) : null}
      {result !== null && !done ? (
        <Card style={{ borderColor: status === 'wrong' ? colors.bad : colors.border, borderWidth: 2 }}>
          <Kicker icon="next">Your formula gives</Kicker>
          <Txt v="h2">{formatValue(result)}</Txt>
          {status === 'wrong' ? <Txt>Not quite the answer yet. Tweak it and check again!</Txt> : null}
        </Card>
      ) : null}
      {done ? (
        <Feedback
          correct={status === 'right'}
          detail={
            status === 'right'
              ? `${step.why} (Result: ${formatValue(expected)})`
              : `One way to write it: ${step.formula} → ${formatValue(expected)}. ${step.why}`
          }
          onContinue={onContinue}
        />
      ) : null}
    </View>
  );
}
