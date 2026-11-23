// A small spreadsheet formula engine for the practice sandbox.
// Supports cell refs (A1, $B$2), ranges (A2:A6), numbers, "text", TRUE/FALSE,
// + - * / ^ & = <> < > <= >=, and the common analyst functions listed in FUNCS.

export type Scalar = number | string | boolean;
export type Val = Scalar | Scalar[][];
export type Grid = Record<string, Scalar>;

export class FormulaError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}
const err = (code: string, msg: string) => new FormulaError(code, msg);

// ---------- tokenizer ----------
type Tok =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'ref'; v: string }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '"' || c === '“' || c === '”') {
      let j = i + 1;
      let s = '';
      while (j < src.length && !['"', '“', '”'].includes(src[j])) s += src[j++];
      if (j >= src.length) throw err('#ERROR!', 'A text value is missing its closing quote ".');
      out.push({ t: 'str', v: s });
      i = j + 1;
      continue;
    }
    const num = /^\d+(\.\d+)?|^\.\d+/.exec(src.slice(i));
    if (num) {
      out.push({ t: 'num', v: parseFloat(num[0]) });
      i += num[0].length;
      continue;
    }
    const ref = /^\$?([A-Za-z]{1,2})\$?(\d+)(?![A-Za-z0-9_(])/.exec(src.slice(i));
    if (ref) {
      out.push({ t: 'ref', v: ref[1].toUpperCase() + ref[2] });
      i += ref[0].length;
      continue;
    }
    const id = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(src.slice(i));
    if (id) {
      out.push({ t: 'id', v: id[0].toUpperCase() });
      i += id[0].length;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (['<=', '>=', '<>'].includes(two)) {
      out.push({ t: 'op', v: two });
      i += 2;
      continue;
    }
    if ('+-*/^&=<>(),:;%'.includes(c)) {
      out.push({ t: 'op', v: c === ';' ? ',' : c });
      i++;
      continue;
    }
    throw err('#ERROR!', `I don't understand the character "${c}".`);
  }
  return out;
}

// ---------- parser → AST ----------
type Node =
  | { k: 'lit'; v: Scalar }
  | { k: 'ref'; v: string }
  | { k: 'range'; a: string; b: string }
  | { k: 'call'; name: string; args: Node[] }
  | { k: 'un'; op: string; x: Node }
  | { k: 'bin'; op: string; a: Node; b: Node };

function parse(toks: Tok[]): Node {
  let p = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v;
  const expect = (v: string) => {
    if (!isOp(v)) throw err('#ERROR!', v === ')' ? 'A closing bracket ) is missing.' : `Expected "${v}".`);
    p++;
  };
  const binLevel = (ops: string[], next: () => Node) => (): Node => {
    let a = next();
    while (peek()?.t === 'op' && ops.includes(String(peek()!.v))) {
      const op = (toks[p++] as { v: string }).v;
      a = { k: 'bin', op, a, b: next() };
    }
    return a;
  };
  const primary = (): Node => {
    const t = toks[p++];
    if (!t) throw err('#ERROR!', 'The formula ends too early.');
    if (t.t === 'num') return { k: 'lit', v: t.v };
    if (t.t === 'str') return { k: 'lit', v: t.v };
    if (t.t === 'ref') {
      if (isOp(':')) {
        p++;
        const b = toks[p++];
        if (!b || b.t !== 'ref') throw err('#REF!', 'A range needs a cell on both sides of ":", like A2:A6.');
        return { k: 'range', a: t.v, b: b.v };
      }
      return { k: 'ref', v: t.v };
    }
    if (t.t === 'id') {
      if (t.v === 'TRUE' || t.v === 'FALSE') {
        if (isOp('(')) {
          p++;
          expect(')');
        }
        return { k: 'lit', v: t.v === 'TRUE' };
      }
      if (!isOp('(')) throw err('#NAME?', `"${t.v}" isn't a function or cell. Did you forget the ( after it?`);
      p++;
      const args: Node[] = [];
      if (!isOp(')')) {
        args.push(expr());
        while (isOp(',')) {
          p++;
          args.push(expr());
        }
      }
      expect(')');
      return { k: 'call', name: t.v, args };
    }
    if (t.v === '(') {
      const e = expr();
      expect(')');
      return e;
    }
    if (t.v === '-' || t.v === '+') return { k: 'un', op: t.v, x: unary() };
    throw err('#ERROR!', `Unexpected "${t.v}".`);
  };
  const percent = (): Node => {
    let x = primary();
    while (isOp('%')) {
      p++;
      x = { k: 'bin', op: '/', a: x, b: { k: 'lit', v: 100 } };
    }
    return x;
  };
  const unary = (): Node => {
    if (isOp('-') || isOp('+')) {
      const op = (toks[p++] as { v: string }).v;
      return { k: 'un', op, x: unary() };
    }
    return percent();
  };
  const power = binLevel(['^'], unary);
  const mul = binLevel(['*', '/'], power);
  const add = binLevel(['+', '-'], mul);
  const concat = binLevel(['&'], add);
  const cmp = binLevel(['=', '<>', '<', '>', '<=', '>='], concat);
  const expr = cmp;
  const n = expr();
  if (p < toks.length) throw err('#ERROR!', `Something extra is at the end: "${(toks[p] as { v: unknown }).v}". Check your brackets and commas.`);
  return n;
}

// ---------- helpers ----------
const colNum = (c: string) => c.split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
const colName = (n: number) => {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};
const splitRef = (r: string) => {
  const m = /^([A-Z]+)(\d+)$/.exec(r)!;
  return { c: colNum(m[1]), r: parseInt(m[2], 10) };
};

function rangeVals(g: Grid, a: string, b: string): Scalar[][] {
  const A = splitRef(a);
  const B = splitRef(b);
  const rows: Scalar[][] = [];
  for (let r = Math.min(A.r, B.r); r <= Math.max(A.r, B.r); r++) {
    const row: Scalar[] = [];
    for (let c = Math.min(A.c, B.c); c <= Math.max(A.c, B.c); c++) row.push(g[colName(c) + r] ?? '');
    rows.push(row);
  }
  return rows;
}

const flat = (v: Val): Scalar[] => (Array.isArray(v) ? v.flat() : [v]);
const isBlank = (v: Scalar) => v === '';

function num(v: Val): number {
  if (Array.isArray(v)) return num(v[0]?.[0] ?? 0);
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === '') return 0;
  const n = Number(v.replace(/[$,]/g, ''));
  if (Number.isNaN(n)) throw err('#VALUE!', `"${v}" is text, so it can't be used in math.`);
  return n;
}
const str = (v: Val): string => {
  if (Array.isArray(v)) return str(v[0]?.[0] ?? '');
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  return String(v);
};
const bool = (v: Val): boolean => {
  if (Array.isArray(v)) return bool(v[0]?.[0] ?? false);
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (v.toUpperCase() === 'TRUE') return true;
  if (v.toUpperCase() === 'FALSE' || v === '') return false;
  throw err('#VALUE!', `"${v}" isn't TRUE or FALSE.`);
};
const scalar = (v: Val): Scalar => (Array.isArray(v) ? v[0]?.[0] ?? '' : v);
const numbersIn = (vals: Val[]) => vals.flatMap(flat).filter((x): x is number => typeof x === 'number');

function compare(a: Scalar, b: Scalar): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}
const same = (a: Scalar, b: Scalar) => {
  if (typeof a === 'number' || typeof b === 'number') {
    const na = typeof a === 'number' ? a : Number(a);
    const nb = typeof b === 'number' ? b : Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb) && a !== '' && b !== '') return na === nb;
  }
  return String(a).toLowerCase() === String(b).toLowerCase();
};

/** COUNTIF-style criteria: 5, "Latte", ">10", "<>Tea", "La*". */
function matcher(crit: Scalar): (v: Scalar) => boolean {
  if (typeof crit !== 'string') return (v) => same(v, crit);
  const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(crit)!;
  const op = m[1] ?? '=';
  const rhsRaw = m[2];
  const rhsNum = rhsRaw !== '' && !Number.isNaN(Number(rhsRaw)) ? Number(rhsRaw) : null;
  const wild = /[*?]/.test(rhsRaw)
    ? new RegExp('^' + rhsRaw.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i')
    : null;
  return (v: Scalar) => {
    if (op === '=' || op === '<>') {
      const eq = wild ? wild.test(String(v)) : rhsNum !== null && typeof v === 'number' ? v === rhsNum : same(v, rhsRaw);
      return op === '=' ? eq : !eq;
    }
    if (rhsNum === null || typeof v !== 'number') return false;
    if (op === '>') return v > rhsNum;
    if (op === '<') return v < rhsNum;
    if (op === '>=') return v >= rhsNum;
    return v <= rhsNum;
  };
}

function ifsPairs(args: Val[], start: number) {
  const pairs: { range: Scalar[]; test: (v: Scalar) => boolean }[] = [];
  for (let i = start; i + 1 < args.length; i += 2) pairs.push({ range: flat(args[i]), test: matcher(scalar(args[i + 1])) });
  return pairs;
}

const round = (x: number, d: number) => {
  const f = Math.pow(10, d);
  return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f;
};

type Fn = (args: (() => Val)[]) => Val;
const ev = (args: (() => Val)[]) => args.map((a) => a());

const FUNCS: Record<string, Fn> = {
  SUM: (a) => numbersIn(ev(a)).reduce((s, x) => s + x, 0),
  AVERAGE: (a) => {
    const n = numbersIn(ev(a));
    if (!n.length) throw err('#DIV/0!', 'There are no numbers to average.');
    return n.reduce((s, x) => s + x, 0) / n.length;
  },
  COUNT: (a) => numbersIn(ev(a)).length,
  COUNTA: (a) => ev(a).flatMap(flat).filter((x) => !isBlank(x)).length,
  COUNTBLANK: (a) => ev(a).flatMap(flat).filter(isBlank).length,
  MIN: (a) => Math.min(...numbersIn(ev(a))),
  MAX: (a) => Math.max(...numbersIn(ev(a))),
  MEDIAN: (a) => {
    const n = numbersIn(ev(a)).sort((x, y) => x - y);
    if (!n.length) throw err('#NUM!', 'No numbers to find the median of.');
    const m = Math.floor(n.length / 2);
    return n.length % 2 ? n[m] : (n[m - 1] + n[m]) / 2;
  },
  ROUND: (a) => {
    const [x, d] = ev(a);
    return round(num(x), d === undefined ? 0 : num(d));
  },
  ABS: (a) => Math.abs(num(a[0]())),
  SUMPRODUCT: (a) => {
    const arrs = ev(a).map(flat);
    const n = arrs[0]?.length ?? 0;
    if (arrs.some((x) => x.length !== n)) throw err('#VALUE!', 'SUMPRODUCT ranges must be the same size.');
    let s = 0;
    for (let i = 0; i < n; i++) s += arrs.reduce((p, x) => p * (typeof x[i] === 'number' ? (x[i] as number) : 0), 1);
    return s;
  },
  IF: (a) => (bool(a[0]()) ? a[1]() : a[2] ? a[2]() : false),
  IFS: (a) => {
    for (let i = 0; i + 1 < a.length; i += 2) if (bool(a[i]())) return a[i + 1]();
    throw err('#N/A', 'None of the IFS conditions were true. Tip: end with TRUE, "something".');
  },
  IFERROR: (a) => {
    try {
      const v = a[0]();
      return v;
    } catch (e) {
      if (e instanceof FormulaError) return a[1]();
      throw e;
    }
  },
  AND: (a) => ev(a).flatMap(flat).every((x) => bool(x)),
  OR: (a) => ev(a).flatMap(flat).some((x) => bool(x)),
  NOT: (a) => !bool(a[0]()),
  SUMIF: (a) => {
    const [r, c, s] = ev(a);
    const range = flat(r);
    const sums = s === undefined ? range : flat(s);
    const t = matcher(scalar(c));
    return range.reduce<number>((acc, v, i) => (t(v) && typeof sums[i] === 'number' ? acc + (sums[i] as number) : acc), 0);
  },
  COUNTIF: (a) => {
    const [r, c] = ev(a);
    const t = matcher(scalar(c));
    return flat(r).filter((v) => t(v)).length;
  },
  AVERAGEIF: (a) => {
    const [r, c, s] = ev(a);
    const range = flat(r);
    const vals = s === undefined ? range : flat(s);
    const t = matcher(scalar(c));
    const picked = range.map((v, i) => (t(v) ? vals[i] : null)).filter((x): x is number => typeof x === 'number');
    if (!picked.length) throw err('#DIV/0!', 'No rows matched, so there is nothing to average.');
    return picked.reduce((x, y) => x + y, 0) / picked.length;
  },
  SUMIFS: (a) => {
    const args = ev(a);
    const sums = flat(args[0]);
    const pairs = ifsPairs(args, 1);
    return sums.reduce<number>((acc, v, i) => (pairs.every((p) => p.test(p.range[i])) && typeof v === 'number' ? acc + v : acc), 0);
  },
  COUNTIFS: (a) => {
    const args = ev(a);
    const pairs = ifsPairs(args, 0);
    const n = pairs[0]?.range.length ?? 0;
    let c = 0;
    for (let i = 0; i < n; i++) if (pairs.every((p) => p.test(p.range[i]))) c++;
    return c;
  },
  XLOOKUP: (a) => {
    const [v, look, ret] = [a[0](), a[1](), a[2]()];
    const L = flat(look);
    const R = flat(ret);
    const i = L.findIndex((x) => same(x, scalar(v)));
    if (i < 0) {
      if (a[3]) return a[3]();
      throw err('#N/A', `"${str(v)}" wasn't found. Check spelling and extra spaces.`);
    }
    return R[i] ?? '';
  },
  VLOOKUP: (a) => {
    const [v, table, col] = [a[0](), a[1](), a[2]()];
    const rows = Array.isArray(table) ? table : [[table]];
    const c = num(col);
    const row = rows.find((r) => same(r[0], scalar(v)));
    if (!row) throw err('#N/A', `"${str(v)}" wasn't found in the first column.`);
    if (c < 1 || c > row.length) throw err('#REF!', `Column ${c} is outside the table.`);
    return row[c - 1];
  },
  INDEX: (a) => {
    const [r, row, col] = ev(a);
    const rows = Array.isArray(r) ? r : [[r]];
    const ri = num(row);
    const ci = col === undefined ? 1 : num(col);
    if (rows.length === 1 && col === undefined) return rows[0][ri - 1] ?? '';
    const v = rows[ri - 1]?.[ci - 1];
    if (v === undefined) throw err('#REF!', 'That position is outside the range.');
    return v;
  },
  MATCH: (a) => {
    const [v, r] = ev(a);
    const i = flat(r).findIndex((x) => same(x, scalar(v)));
    if (i < 0) throw err('#N/A', `"${str(v)}" wasn't found.`);
    return i + 1;
  },
  LEFT: (a) => {
    const [s, n] = ev(a);
    return str(s).slice(0, n === undefined ? 1 : num(n));
  },
  RIGHT: (a) => {
    const [s, n] = ev(a);
    const t = str(s);
    const k = n === undefined ? 1 : num(n);
    return k <= 0 ? '' : t.slice(-k);
  },
  MID: (a) => {
    const [s, st, n] = ev(a);
    return str(s).substr(num(st) - 1, num(n));
  },
  LEN: (a) => str(a[0]()).length,
  UPPER: (a) => str(a[0]()).toUpperCase(),
  LOWER: (a) => str(a[0]()).toLowerCase(),
  PROPER: (a) => str(a[0]()).toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, p, c) => p + c.toUpperCase()),
  TRIM: (a) => str(a[0]()).trim().replace(/\s+/g, ' '),
  CONCAT: (a) => ev(a).flatMap(flat).map((x) => str(x)).join(''),
  CONCATENATE: (a) => ev(a).flatMap(flat).map((x) => str(x)).join(''),
  TEXTJOIN: (a) => {
    const [d, skip, ...rest] = ev(a);
    return rest
      .flatMap(flat)
      .filter((x) => !(bool(skip) && isBlank(x)))
      .map((x) => str(x))
      .join(str(d));
  },
};

export const SUPPORTED_FUNCTIONS = Object.keys(FUNCS);

function evaluate(n: Node, g: Grid): Val {
  switch (n.k) {
    case 'lit':
      return n.v;
    case 'ref':
      return g[n.v] ?? '';
    case 'range':
      return rangeVals(g, n.a, n.b);
    case 'un': {
      const x = num(evaluate(n.x, g));
      return n.op === '-' ? -x : x;
    }
    case 'bin': {
      const a = evaluate(n.a, g);
      const b = evaluate(n.b, g);
      switch (n.op) {
        case '+':
          return num(a) + num(b);
        case '-':
          return num(a) - num(b);
        case '*':
          return num(a) * num(b);
        case '/': {
          const d = num(b);
          if (d === 0) throw err('#DIV/0!', 'You divided by zero (or by an empty cell).');
          return num(a) / d;
        }
        case '^':
          return Math.pow(num(a), num(b));
        case '&':
          return str(a) + str(b);
        default: {
          const c = compare(scalar(a), scalar(b));
          if (n.op === '=') return same(scalar(a), scalar(b));
          if (n.op === '<>') return !same(scalar(a), scalar(b));
          if (n.op === '<') return c < 0;
          if (n.op === '>') return c > 0;
          if (n.op === '<=') return c <= 0;
          return c >= 0;
        }
      }
    }
    case 'call': {
      const f = FUNCS[n.name];
      if (!f) throw err('#NAME?', `"${n.name}" isn't a function I know. Check the spelling.`);
      return f(n.args.map((x) => () => evaluate(x, g)));
    }
  }
}

/** Evaluate a formula like "=SUM(B2:B6)". Throws FormulaError with a friendly message. */
export function evalFormula(formula: string, grid: Grid): Scalar {
  const src = formula.trim().replace(/^=/, '');
  if (!src) throw err('#ERROR!', 'Type a formula first. It starts with =');
  const v = evaluate(parse(tokenize(src)), grid);
  if (Array.isArray(v)) {
    if (v.length === 1 && v[0].length === 1) return v[0][0];
    throw err('#VALUE!', 'That gives a whole range. Wrap it in a function like SUM( ).');
  }
  return v;
}

/** Functions used in a formula (for "must use XLOOKUP" style checks). */
export const functionsIn = (formula: string) =>
  Array.from(new Set((formula.toUpperCase().match(/[A-Z][A-Z0-9.]*(?=\s*\()/g) ?? []).filter((f) => f in FUNCS)));

export function formatValue(v: Scalar): string {
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(round(v, 4));
  return v === '' ? '(empty)' : v;
}

export function sameValue(a: Scalar, b: Scalar) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 0.005;
  return formatValue(a).toLowerCase() === formatValue(b).toLowerCase();
}

/** Builds a grid from rows of values. Row 1 = headers. Numeric strings become numbers. */
export function gridFrom(rows: (string | number)[][]): Grid {
  const g: Grid = {};
  rows.forEach((row, r) =>
    row.forEach((v, c) => {
      const key = colName(c + 1) + (r + 1);
      g[key] = typeof v === 'number' ? v : v !== '' && !Number.isNaN(Number(v)) && r > 0 ? Number(v) : v;
    }),
  );
  return g;
}
export const columnLetter = (i: number) => colName(i + 1);
