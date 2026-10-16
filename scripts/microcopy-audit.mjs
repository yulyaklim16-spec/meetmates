// Перепись против макетов: сверка microcopy.md с тем, что стоит на экранах.
//
// Перепись объявлена источником правды (CLAUDE.md, §8.1): если строка
// изменилась на экране, она меняется и там. Глазами это не держится —
// на 49 страницах около пятисот строк, и пропажа видна только при сверке
// подряд. Скрытые заголовки, aria-label и подписи для скринридера входят
// в перепись на тех же правах, что видимый текст, поэтому собираются вместе.
//
// Сверка идёт в обе стороны и по своей таблице каждого экрана — код экрана
// берётся из комментария в начале макета («Экран: I.2 …») и ищется среди
// заголовков раздела 3:
//
//   нет в переписи — строка стоит на экране, в таблице её нет;
//   нет на экране  — строка в таблице, а на страницах экрана её не осталось.
//
// Что в счёт не идёт — леса страницы макета, а не продукт: полоса разделов,
// дерево макетов, полоса состояний, подписи зон справа, служебный блок под
// мокапом, системная строка телефона, панель браузера и метка сгиба.
// Их перечисляет сам microcopy.md, раздел 1.
//
// Запуск: node scripts/microcopy-audit.mjs

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// запускается из корня репозитория, как и остальные скрипты
const ROOT = process.cwd();
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// ── сущности: в переписи строки стоят готовыми знаками ────────────────
const ENT = {
  '&middot;': '·', '&mdash;': '—', '&ndash;': '–', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”', '&larr;': '←', '&rarr;': '→', '&times;': '×',
  '&hellip;': '…', '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
  '&quot;': '"', '&plus;': '+', '&deg;': '°', '&eacute;': 'é',
};
const decode = (s) => s.replace(/&[a-z]+;/g, (m) => (m in ENT ? ENT[m] : m));
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim();

// ── вырезаем леса ─────────────────────────────────────────────────────
function screen(html) {
  const from = html.indexOf('<div class="device">');
  if (from < 0) throw new Error('нет мокапа');
  const to = html.indexOf('<!-- служебное');
  let s = html.slice(from, to < 0 ? html.length : to);
  // подписи зон справа от телефона — служебные
  s = s.replace(/<div class="anns">[\s\S]*?<\/div>/g, '');
  // чужие зоны: системная строка, панель браузера, индикатор жеста, сгиб
  s = s.replace(/<p class="(statusbar|browserbar|homebar|fold)"[\s\S]*?<\/p>/g, '');
  return s.replace(/<!--[\s\S]*?-->/g, '');
}

const KIND = [
  ['aria-label', /aria-label="([^"]+)"/g],
  ['подпись поля', /placeholder="([^"]+)"/g],
  ['alt', /\balt="([^"]+)"/g],
  // значение поля — текст пользователя: в поиске в нём стоит сам запрос
  ['текст пользователя', /\bvalue="([^"]+)"/g],
];

// строки экрана: по одной на элемент, плюс значения подписей для скринридера
function strings(s) {
  const out = [];
  const add = (kind, text) => {
    const t = norm(text);
    if (t && !/^[·—–→←×+]$/.test(t)) out.push({ kind, t });
  };
  for (const [kind, re] of KIND) for (const m of s.matchAll(re)) add(kind, m[1]);
  const flat = s.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n');
  for (const line of flat.split('\n')) add('текст', line);
  const seen = new Set();
  return out.filter(({ kind, t }) => !seen.has(kind + t) && seen.add(kind + t));
}

// весь текст экрана одной строкой: так находятся строки переписи, собранные
// из нескольких элементов подряд — «Board games Sat 18:00» в одной ссылке
function haystack(s) {
  const attrs = KIND.flatMap(([, re]) => [...s.matchAll(re)].map((m) => m[1]));
  return norm(s.replace(/<[^>]+>/g, ' ')) + ' \u0000 ' + attrs.map(norm).join(' \u0000 ');
}

// ── перепись: раздел 3 по экранам ─────────────────────────────────────
const census = read('microcopy.md');
const sections = new Map();
for (const m of census.matchAll(/\n### ([IVX]+\.\d+) [^\n]*\n([\s\S]*?)(?=\n### |\n## )/g)) {
  sections.set(m[1], m[2]);
}
// Раздел 2: таб-бар, стрелка назад и Report стоят на каждом экране,
// и в таблицах экранов их нет нарочно
const common = norm(census.slice(census.indexOf('## 2. Общее'), census.indexOf('## 3. Инвентарь')));

// ── сверка ────────────────────────────────────────────────────────────
const files = readdirSync(join(ROOT, 'wireframes'))
  .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
  .sort();

const byCode = new Map();   // код экрана → его страницы
for (const f of files) {
  const src = read(join('wireframes', f));
  const m = src.match(/Экран:\s+([IVX]+\.\d+)/);
  if (!m) throw new Error(`${f}: в начале страницы нет кода экрана`);
  if (!byCode.has(m[1])) byCode.set(m[1], []);
  byCode.get(m[1]).push({ file: f.replace('.html', ''), body: screen(src) });
}

const noCensus = [];   // строка на экране, в переписи нет
const noScreen = [];   // строка в переписи, на экране нет

for (const [code, pages] of byCode) {
  const table = sections.get(code);
  if (table === undefined) throw new Error(`microcopy.md: нет таблицы экрана ${code}`);
  const rows = norm(table);
  const hay = pages.map((p) => haystack(p.body)).join(' \u0000 ');

  for (const { file, body } of pages) {
    for (const { kind, t } of strings(body)) {
      if (rows.includes(t) || common.includes(t)) continue;
      noCensus.push(`${file} · ${kind} · «${t}»`);
    }
  }
  for (const m of table.matchAll(/^\|[^|]*\|[^|]*\|\s*`([^`]+)`\s*\|/gm)) {
    const t = norm(m[1]);
    if (!hay.includes(t)) noScreen.push(`${code} · «${t}»`);
  }
}

// ── отчёт ─────────────────────────────────────────────────────────────
const report = (title, list) => {
  console.log(`\n## ${title}\n`);
  console.log(list.length ? list.map((l) => `  ${l}`).join('\n') : '  нет');
  return list.length;
};

console.log(`\nПерепись против макетов: ${files.length} страниц, ${byCode.size} экранов`);
const bad = report('Нет в переписи — строка стоит на экране', noCensus)
  + report('Нет на экране — строка осталась в переписи', noScreen);
console.log(bad ? `\nРасхождений: ${bad}\n` : '\nВсе проверки проходят.\n');
if (bad) process.exitCode = 1;
