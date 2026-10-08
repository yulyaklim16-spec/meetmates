// Контраст текста с фоном по WCAG 2.1 — из токенов, а не на глаз.
//
// Читает значения из tokens/tokens.css, считает коэффициент для каждой пары
// «текст на фоне», которая реально встречается в продукте, и:
//   1. печатает таблицу в консоль;
//   2. пишет её в concept/contrast.md;
//   3. вставляет HTML-таблицу в concept/concept.html между метками
//      <!-- contrast:start --> и <!-- contrast:end -->.
//
// Порог: обычный текст 4.5:1 (AA); иконки и неактивные элементы — 3:1 (AA, non-text).
// Стекло — только нижнее меню над фоном экрана: считается слоем --glass поверх --bg.
// Код выхода 1, если хоть одна пара не проходит.
//
// Запуск: node scripts/contrast.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const css = readFileSync(join(ROOT, 'tokens/tokens.css'), 'utf8');

// --имя: значение;  → словарь
const tokens = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()])
);
const tok = (name) => {
  const v = tokens[name];
  if (!v) throw new Error(`нет токена --${name}`);
  return v;
};

// цвет → [r, g, b, a]
function parse(c) {
  c = c.trim();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat(1);
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`не цвет: ${c}`);
  const [r, g, b, a = '1'] = m[1].split(',').map((s) => s.trim());
  return [+r, +g, +b, +a];
}
// полупрозрачный слой поверх непрозрачного фона
const over = (top, under) => {
  const [r, g, b, a] = parse(top);
  const [R, G, B] = parse(under);
  return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
};
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();

// меню лежит в потоке над фоном экрана: стекло поверх --bg
const glassOverBg = over(tok('glass'), tok('bg'));
const glassStrongOverBg = over(tok('glass-strong'), tok('bg'));

// [что, токен текста, фон (токен или готовый цвет), порог]
const PAIRS = [
  ['Основной текст на фоне экрана', 'ink-900', 'bg', 4.5],
  ['Основной текст на карточке', 'ink-900', 'surface', 4.5],
  ['Вторичный текст на фоне экрана', 'ink-600', 'bg', 4.5],
  ['Вторичный текст на карточке', 'ink-600', 'surface', 4.5],
  ['Вторичный текст в поле / чипе', 'ink-600', 'surface-2', 4.5],
  ['Текст на кнопке действия', 'ink-on-action', 'action', 4.5],
  ['Галочка Verified на карточке', 'verified', 'surface', 4.5],
  ['Ошибка, Report на фоне экрана', 'danger', 'bg', 4.5],
  ['Ошибка под полем на карточке', 'danger', 'surface', 4.5],
  ['Успех на фоне экрана', 'success', 'bg', 4.5],
  ['Успех под полем на карточке', 'success', 'surface', 4.5],
  ['Предупреждение на фоне экрана', 'warn', 'bg', 4.5],
  // экраны концепта (concept/screens): новые сочетания
  ['Текст на тёмной кнопке шапки, выбранный чип', 'surface', 'ink-900', 4.5],
  ['Сегмент Mine на дорожке переключателя', 'ink-900', 'line', 4.5],
  ['Подпись вкладки на стекле меню', 'ink-600', glassOverBg, 4.5],
  ['Подпись выбранной вкладки', 'ink-900', glassStrongOverBg, 4.5],
  ['Системные панели: адрес, сгиб', 'ink-600', 'surface-2', 4.5],
  ['Иконка, неактивная вкладка (не текст)', 'ink-400', 'bg', 3],
  ['Иконка на карточке (не текст)', 'ink-400', 'surface', 3],
];

const rows = PAIRS.map(([what, fg, bg, min]) => {
  const fgc = parse(tok(fg));
  const bgc = Array.isArray(bg) ? bg : parse(tok(bg));
  const r = ratio(fgc, bgc);
  return {
    what,
    fg: `--${fg}`, fgHex: hex(fgc),
    bg: Array.isArray(bg) ? 'стекло (расчёт)' : `--${bg}`, bgHex: hex(bgc),
    r, min, ok: r >= min,
  };
});

const fmt = (r) => r.toFixed(2).replace(/\.?0+$/, '') + ':1';
const md = [
  '# Контраст текста — WCAG 2.1 AA',
  '',
  '> Сгенерировано `node scripts/contrast.mjs` из `tokens/tokens.css`. Руками не править.',
  '> Порог: текст 4.5:1, иконки 3:1. Стекло — только меню: слой `--glass` поверх `--bg`.',
  '',
  '| Где | Текст | Фон | Коэффициент | Порог | Проходит |',
  '|---|---|---|---|---|---|',
  ...rows.map((x) => `| ${x.what} | \`${x.fg}\` ${x.fgHex} | \`${x.bg}\` ${x.bgHex} | **${fmt(x.r)}** | ${x.min}:1 | ${x.ok ? 'да' : '**нет**'} |`),
  '',
].join('\n');
writeFileSync(join(ROOT, 'concept/contrast.md'), md);

const html = [
  '<table class="contrast">',
  '<thead><tr><th>Где</th><th>Текст</th><th>Фон</th><th>Коэффициент</th><th>Порог</th><th>Проходит</th></tr></thead>',
  '<tbody>',
  ...rows.map((x) =>
    `<tr><td>${x.what}</td><td><span class="chip" style="background:${x.fgHex}"></span><code>${x.fg}</code> ${x.fgHex}</td>` +
    `<td><span class="chip" style="background:${x.bgHex}"></span><code>${x.bg}</code> ${x.bgHex}</td>` +
    `<td><b>${fmt(x.r)}</b></td><td>${x.min}:1</td><td class="${x.ok ? 'ok' : 'no'}">${x.ok ? 'да' : 'нет'}</td></tr>`),
  '</tbody></table>',
].join('\n');
const page = join(ROOT, 'concept/concept.html');
if (existsSync(page)) {
  const s = readFileSync(page, 'utf8');
  const re = /(<!-- contrast:start -->)[\s\S]*?(<!-- contrast:end -->)/;
  if (re.test(s)) writeFileSync(page, s.replace(re, `$1\n${html}\n$2`));
}

console.log(md);
const bad = rows.filter((x) => !x.ok);
if (bad.length) {
  console.error(`Не проходят: ${bad.length}`);
  process.exit(1);
}
console.log(`Все ${rows.length} пар проходят.`);
