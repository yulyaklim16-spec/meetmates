// Макеты против задания и карты: четыре проверки из CLAUDE.md §6.
//
// Бриф обещает, что каждый экран это выдерживает «проверяется скриптами,
// а не глазами», — а скрипта не было. Здесь он:
//
//   1. Ни одного тупика — у каждого состояния есть выход в содержимом,
//      а не только нижнее меню, которое стоит на всех страницах подряд
//      (правило 10: пустая колода ведёт в запросы, пустая лента — в радиус
//      и создание своего).
//   2. Видно главное действие — на экране есть залитая кнопка, выход
//      наружу, строка списка, которая и есть действие, или поле ввода.
//   3. Состояния закрыты — страницы ровно те, что отмечены в _screens.md:
//      четвёрка «пусто · ошибка · загрузка · успех», четыре ожидания
//      чужого решения (D-42) и перечисленные поимённо состояния сверх неё.
//   4. Экран есть на карте — код и имя из комментария в начале страницы
//      стоят в дереве sitemap.md дословно.
//   5. Страница не одевается сама — ни своего блока стилей, ни инлайнового
//      в мокапе, и подключён общий файл. На этом держится вся геометрия,
//      объявленная в DESIGN.md: поля 16px, высоты, ритм отступов заданы
//      токенами, а не страницей.
//
// Что скрипт не проверяет: «одно действие — одно имя» (§6, п. 5) — это
// microcopy-audit.mjs и словарь voice.md.
//
// Запуск: node scripts/screens-audit.mjs

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// ── страницы ──────────────────────────────────────────────────────────
const files = readdirSync(join(ROOT, 'wireframes'))
  .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
  .map((f) => f.replace('.html', ''))
  .sort();

// мокап без лесов: сам телефон, без панели страниц и служебного блока
function screen(html) {
  const from = html.indexOf('<div class="device">');
  const to = html.indexOf('<!-- служебное');
  return html.slice(from, to < 0 ? html.length : to)
    .replace(/<div class="anns">[\s\S]*?<\/div>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

// содержимое экрана без нижнего меню: выход обязан быть здесь
const content = (s) => s.replace(/<nav aria-label="Main navigation">[\s\S]*?<\/nav>/g, '');

const pages = new Map();
for (const name of files) {
  const src = read(join('wireframes', `${name}.html`));
  const body = screen(src);
  const m = src.match(/Экран:\s+([IVX]+\.\d+)([^\n—]*)/);
  if (!m) throw new Error(`${name}: в начале страницы нет кода экрана`);
  pages.set(name, { src, body, main: content(body), code: m[1], title: norm(m[1] + m[2]) });
}

// ── 1. тупики ─────────────────────────────────────────────────────────
// Выход — ссылка на другую страницу или кнопка действия в содержимом.
// Кнопка без адреса засчитывается: экрана, куда она ведёт, может не быть
// в наборе (записанный долг _screens.md), но тупиком страница от этого
// не становится — действие на ней есть.
const noExit = [];
for (const [name, p] of pages) {
  const links = [...p.main.matchAll(/href="([^"#]+\.html)"/g)].map((m) => m[1].replace('.html', ''));
  const outside = links.filter((l) => l !== name);
  const buttons = /<button[^>]*>/.test(p.main);
  if (!outside.length && !buttons) noExit.push(name);
}

// ── 2. главное действие ───────────────────────────────────────────────
const noAction = [];
for (const [name, p] of pages) {
  const has = /class="[^"]*\bprimary\b/.test(p.main)       // залитая кнопка
    || /class="exit"/.test(p.main)                          // выход наружу
    || /<a class="(item|top)\b/.test(p.main)                // строка списка
    || /<(input|textarea)\b/.test(p.main);                  // поле ввода
  if (!has) noAction.push(name);
}

// ── 3. состояния закрыты ──────────────────────────────────────────────
const task = read(join('wireframes', '_screens.md'));
const COLS = ['empty', 'error', 'loading', 'success'];
const expected = new Set();
const screens = new Map();   // файл → имя экрана из задания

// таблицы «Экран | Файл | Пустой | Ошибка | Загрузка | Успех»
for (const m of task.matchAll(/^\|\s*\*\*([IVX]+\.\d+)\*\*([^|]*)\|\s*`([a-z-]+)`\s*\|([^\n]*)\|\s*$/gm)) {
  const [, code, title, file, rest] = m;
  const cells = rest.split('|').map((c) => c.trim());
  if (cells.length < 4) continue;
  screens.set(file, norm(`${code} ${title}`));
  expected.add(file);
  // «✓ сам экран» — состояние есть, отдельной страницы у него нет:
  // базовый вид и есть это состояние (_screens.md, §2)
  COLS.forEach((state, i) => {
    if (cells[i].startsWith('✓') && !/сам экран/.test(cells[i])) expected.add(`${file}-${state}`);
  });
}

// ожидание чужого решения: таблица D-42, по экрану в строке
const waitBlock = task.slice(task.indexOf('### Пятое состояние'), task.indexOf('### Состояния сверх'));
for (const m of waitBlock.matchAll(/^\|\s*\*\*([IVX]+\.\d+)\*\*\s*([^|]+)\|/gm)) {
  const code = m[1];
  const file = [...screens].find(([, t]) => t.startsWith(code));
  if (!file) throw new Error(`_screens.md: ожидание у экрана ${code}, которого нет в таблицах состояний`);
  expected.add(`${file[0]}-waiting`);
}

// состояния сверх четвёрки: имя файла названо прямо в таблице
const extraBlock = task.slice(task.indexOf('### Состояния сверх'), task.indexOf('## 3.'));
for (const m of extraBlock.matchAll(/\|\s*`([a-z-]+)`\s*\|/g)) expected.add(m[1]);

const actual = new Set(files);
const noPage = [...expected].filter((e) => !actual.has(e)).sort();
const noTask = [...actual].filter((a) => !expected.has(a)).sort();

// ── 4. экран есть на карте ────────────────────────────────────────────
const tree = read('sitemap.md');
const offMap = [];
for (const [name, p] of pages) {
  if (!tree.includes(p.title)) offMap.push(`${name} · «${p.title}»`);
}

// ── 5. геометрия держится стилем, а не страницей ──────────────────────
// Поля экрана, высоты и ритм заданы токенами в ките (--mm-s-4 и соседи)
// и в _wire.css. Держится это тем, что страница своих стилей не имеет:
// один инлайновый padding — и «16px одинаково на всех экранах» перестаёт
// быть правдой, а мерить каждую страницу браузером скрипту нечем.
const WEARS = [
  ['wireframes', '_wire.css'],
  ['concept/screens', 'screens.css'],
];
const ownStyle = [];
for (const [dir, sheet] of WEARS) {
  for (const f of readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.html'))) {
    const src = read(join(dir, f));
    const body = screen(src);
    if (/<style[\s>]/.test(src)) ownStyle.push(`${dir}/${f} · свой блок стилей`);
    if (/\sstyle="/.test(body)) ownStyle.push(`${dir}/${f} · инлайновый стиль в мокапе`);
    if (!src.includes(sheet)) ownStyle.push(`${dir}/${f} · не подключён ${sheet}`);
  }
}

// ── отчёт ─────────────────────────────────────────────────────────────
const report = (title, list, how = (x) => x) => {
  console.log(`\n## ${title}\n`);
  console.log(list.length ? list.map((l) => `  ${how(l)}`).join('\n') : '  нет');
  return list.length;
};

console.log(`\nМакеты против задания и карты: ${files.length} страниц, ${screens.size} экранов`);
const bad = report('Тупик — в содержимом нет ни выхода, ни действия', noExit)
  + report('Не видно главного действия', noAction)
  + report('Состояние отмечено в _screens.md, страницы нет', noPage)
  + report('Страница есть, в задании состояние не отмечено', noTask)
  + report('Экрана нет в дереве sitemap.md — имя разошлось', offMap)
  + report('Страница одевается сама, мимо кита и _wire.css', ownStyle);
console.log(bad ? `\nРасхождений: ${bad}\n` : '\nВсе проверки проходят.\n');
if (bad) process.exitCode = 1;
