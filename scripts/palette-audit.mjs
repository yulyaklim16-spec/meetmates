// Различимость палитры: считает ΔE2000 между цветами ролей и валит сборку,
// если две роли, которые обязаны отличаться, различаются слабее порога.
//
// Зачем. Контраст (contrast.mjs) отвечает на вопрос «читается ли текст на фоне».
// Он ничего не говорит о другом: отличает ли глаз сам фон от соседнего. Так в ките
// появилась лестница сиреневых, где ступень между «выбранным» и «под курсором»
// была 1,94 ΔE2000 — в меню выбранный пункт и пункт под курсором выглядели одинаково.
//
// Чем меряем. ΔE2000 — принятая мера «насколько два цвета различны для глаза»:
//   < 1     разницы нет даже при сравнении вплотную
//   1 – 2   видно, только если положить образцы рядом
//   2 – 3,5 видно на экране, но читается как случайность
//   > 3,5   видно сразу, читается как решение
// Порог ступени — 3,5: ниже него разница есть в коде и нет в глазу.
//
// Что проверяется:
//   1. ПАРЫ — роли, которые встречаются в одном органе или в одном списке
//      и обязаны отличаться. Ступень ниже порога — ошибка.
//   2. СОВПАДЕНИЯ — одно значение под двумя именами. Разрешены только те,
//      что перечислены в ALLOWED с причиной; любое новое — ошибка.
//
// Запуск: node scripts/palette-audit.mjs — после правки цвета в tokens/tokens.css

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const css = readFileSync(join(ROOT, 'tokens/tokens.css'), 'utf8');

// цвета-роли: объявления вида `--имя: #RRGGBB;`. Стопы градиента внутри
// значения --bg-wash сюда не попадают — они не роли, а точки рампы
const COLORS = new Map();
for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})\s*;/gm)) {
  COLORS.set(m[1].slice(2), m[2].toUpperCase());
}

// ── ΔE2000 ────────────────────────────────────────────────────────────
const lab = (hex) => {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = v.map(f);
  const X = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  const Y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const Z = (r * 0.0193339 + g * 0.119192 + b * 0.9503041) / 1.08883;
  const k = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [k(X), k(Y), k(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

function dE2000(hexA, hexB) {
  const [L1, a1, b1] = lab(hexA);
  const [L2, a2, b2] = lab(hexB);
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7 || 1)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h1p = (deg(Math.atan2(b1, a1p)) + 360) % 360;
  const h2p = (deg(Math.atan2(b2, a2p)) + 360) % 360;
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
    else dhp = h2p - h1p > 180 ? h2p - h1p - 360 : h2p - h1p + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp) / 2);
  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbp = (h1p + h2p) / 2;
    else hbp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  }
  const T = 1 - 0.17 * Math.cos(rad(hbp - 30)) + 0.24 * Math.cos(rad(2 * hbp))
    + 0.32 * Math.cos(rad(3 * hbp + 6)) - 0.2 * Math.cos(rad(4 * hbp - 63));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp;
  const Sh = 1 + 0.015 * Cbp * T;
  const Rt = Cbp
    ? -2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) * Math.sin(rad(60 * Math.exp(-(((hbp - 275) / 25) ** 2))))
    : 0;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

// ── 1. ступени, которые обязаны быть видны ────────────────────────────
const STEP = 3.5;
const PAIRS = [
  ['Вложенная поверхность против наведения', 'surface-2', 'hover'],
  ['Наведение против выбранного', 'hover', 'selected'],
  ['Вложенная поверхность против выбранного', 'surface-2', 'selected'],
  ['Граница на белой карточке', 'line', 'surface'],
  ['Граница на фоне экрана', 'line', 'bg'],
  ['Главная кнопка против своего наведения', 'action', 'action-hover'],
  ['Заливка опасного против слова опасного', 'danger', 'danger-ink'],
];

// ── 2. совпадения, разрешённые с причиной ─────────────────────────────
const ALLOWED = new Map([
  ['bg|surface', 'экран и карточка: в тёмной теме разойдутся'],
  ['bg|ink-on-action', 'фон экрана и текст на тёмной кнопке: роли разные, в тёмной теме разойдутся'],
  ['ink-on-action|surface', 'текст на кнопке и поверхность карточки: то же'],
  ['focus|ink-400', 'кольцо фокуса и контурная иконка: роли разные, значение пока одно'],
]);

const rows = [];
const tooClose = [];
for (const [title, a, b] of PAIRS) {
  const va = COLORS.get(a);
  const vb = COLORS.get(b);
  if (!va || !vb) throw new Error(`нет токена --${va ? b : a}`);
  const d = dE2000(va, vb);
  rows.push({ title, a, va, b, vb, d });
  if (d < STEP) tooClose.push({ title, a, b, d });
}

const dupes = [];
const names = [...COLORS.keys()].sort();
for (let i = 0; i < names.length; i += 1) {
  for (let j = i + 1; j < names.length; j += 1) {
    if (COLORS.get(names[i]) !== COLORS.get(names[j])) continue;
    const key = `${names[i]}|${names[j]}`;
    if (!ALLOWED.has(key)) dupes.push({ key, value: COLORS.get(names[i]) });
  }
}

// ── вывод ─────────────────────────────────────────────────────────────
const f = (n) => n.toFixed(2).replace('.', ',');
console.log(`# Различимость палитры\n`);
console.log(`Цветов-ролей: ${COLORS.size}. Порог ступени — ${STEP} ΔE2000.\n`);
console.log('| Пара | Что с чем | ΔE2000 | Порог | Видно |');
console.log('|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.title} | \`--${r.a}\` ${r.va} / \`--${r.b}\` ${r.vb} | **${f(r.d)}** | ${STEP} | ${r.d >= STEP ? 'да' : '**нет**'} |`);
}

console.log(`\n## Одно значение под двумя именами\n`);
if (!dupes.length && ALLOWED.size) {
  console.log('Незаписанных совпадений нет. Разрешённые:\n');
  for (const [key, why] of ALLOWED) console.log(`- \`--${key.split('|').join('\` = \`--')}\` — ${why}`);
}
for (const d of dupes) console.log(`- **${d.key.split('|').map((n) => `--${n}`).join(' = ')}** ${d.value} — причина не записана`);

const bad = tooClose.length + dupes.length;
if (bad) {
  console.log(`\n**Не прошло проверок: ${bad}**`);
  for (const t of tooClose) console.log(`- ступень «${t.title}» — ${f(t.d)} ΔE2000, глаз её не возьмёт`);
  process.exit(1);
}
console.log('\nВсе ступени видны, совпадения записаны.');
