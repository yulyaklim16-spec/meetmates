// Доска вариантов третичной кнопки — concept/button-options.html.
//
// Третичная кнопка («Skip», «See people →», «Look at events →») заливкой
// совпадает с карточкой, а её линия даёт 1,18:1 на белом — то есть кнопку
// держит граница, которой почти нет. Доска показывает четыре выхода на одних
// и тех же экранах и в обеих темах: сравнивают глазами, а не по описанию.
//
// В продукт ничего из этого не внесено: принятый вариант уедет в tokens.css
// и components/ после выбора, остальные останутся здесь — так же, как
// кандидаты на доске тёмных обликов.
//
// Запуск: node scripts/build-button-options.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// ── варианты ──────────────────────────────────────────────────────────
// Хук выхода — стрелка вторым span внутри кнопки: своего класса у него нет,
// и это решение кита («выход — та же третичная кнопка»), а не недосмотр.
const EXIT = 'a.mm-btn:has(> span + span[aria-hidden])';
const TERTIARY = '.mm-btn:not(.mm-btn--primary):not(.mm-btn--quiet)';

const OPTIONS = [
  {
    id: 'now',
    name: 'Сейчас',
    idea: 'Заливка вровень с карточкой, линия вокруг кнопки — 1,18:1 на белом и 1,87:1 на тёмной '
      + 'карточке. Кнопку держит граница, которой почти нет.',
    css: '',
  },
  {
    id: 'ring',
    name: '1 · Обводка 3:1',
    idea: 'Заливка остаётся вровень с фоном — это и есть «белая с обводкой», — но линия у кнопки '
      + 'своя и заметная. 3,77:1 на белом, 3,37:1 на тёмной карточке: по WCAG 1.4.11 орган, '
      + 'который опознаётся границей, обязан держать 3:1.',
    css: `[data-opt="ring"] ${TERTIARY} { box-shadow: 0 0 0 1px var(--icon-muted); }`,
  },
  {
    id: 'fill',
    name: '2 · Своя заливка',
    idea: 'Третичная берёт сиреневую подложку в светлой и угольную ступень в тёмной, а вторичная '
      + 'уходит на ступень выше. Цвет различается, но в светлой теме между белым и сиреневым '
      + 'места нет: вторичная садится на цвет выбранной вкладки.',
    css: `[data-opt="fill"] ${TERTIARY} { background: #F2EDF6; }
[data-opt="fill"] .mm-btn--quiet { background: #E0D6EE; }
[data-theme="dark"] [data-opt="fill"] ${TERTIARY} { background: #1C1C21; }
[data-theme="dark"] [data-opt="fill"] .mm-btn--quiet { background: #44444F; }`,
  },
  {
    id: 'exit',
    name: '3 · Выход — вторичная',
    idea: 'Трогаем только дверь в соседний контур: она по §4 обязана быть видна всегда. '
      + '«Skip» остаётся третичной и сливаться не перестаёт — это цена самого дешёвого варианта.',
    css: `[data-opt="exit"] ${EXIT} { background: var(--bg-secondary); }`,
  },
];

// ── экран из готовой страницы концепта ────────────────────────────────
const screenOf = (file) => {
  const html = read(`concept/screens/${file}`);
  const open = html.indexOf('<div class="mm-screen">');
  if (open === -1) throw new Error(`в ${file} нет .mm-screen — разметка экрана изменилась`);
  let i = html.indexOf('>', open) + 1;
  let depth = 1;
  const start = i;
  while (depth && i < html.length) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) { depth += 1; i = nextOpen + 4; }
    else { depth -= 1; i = nextClose + 6; }
  }
  return html.slice(start, i - 6)
    .replace(/<div class="anns">[\s\S]*?<\/div>\s*<\/div>/, '')
    .replace(/<div class="anns">[\s\S]*?<\/div>\s*(?=<!--)/, '')
    .replace(/<p class="statusbar">[\s\S]*?<\/p>/g, '')
    .replace(/<p class="browserbar">[\s\S]*?<\/p>/g, '')
    .replace(/<div class="homebar">[\s\S]*?<\/div>/g, '')
    .replace(/<p class="fold">[\s\S]*?<\/p>/g, '')
    .replace(/(src|srcset)="\.\.\/img\//g, '$1="img/')
    .replace(/, \.\.\/img\//g, ', img/')
    // Ссылки экрана — на соседние экраны: «deck.html» значит «screens/deck.html»,
    // а «../../sections/x» — на уровень выше, чем нужно доске `D-90`.
    .replace(/href="(?!https?:|#|\/)([a-z0-9-]+\.html)"/g, 'href="screens/$1"')
    .replace(/href="\.\.\/\.\.\//g, 'href="../')
    .trim();
};

const SCREENS = [
  { file: 'chats.html', title: 'Список чатов — выход «See people»' },
  { file: 'deck.html', title: 'Колода — «Skip» и выход «Look at events»' },
];
const bodies = SCREENS.map((s) => ({ ...s, html: screenOf(s.file) }));

// ── страница ──────────────────────────────────────────────────────────
const column = (opt) => `    <section class="opt" data-opt="${opt.id}">
      <header class="opt-head">
        <h3>${opt.name}</h3>
        <p>${opt.idea}</p>
      </header>
${bodies.map((b) => `      <div class="mm mm-screen">
${b.html}
      </div>`).join('\n')}
    </section>`;

const block = (theme) => `  <section class="block"${theme === 'dark' ? ' data-theme="dark"' : ''}>
    <h2>${theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}</h2>
    <div class="board">
${OPTIONS.map(column).join('\n\n')}
    </div>
  </section>`;

const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Третичная кнопка — варианты · MeetMates</title>
<meta name="description" content="Четыре варианта третичной кнопки на одних и тех же экранах, в светлой и тёмной теме.">
<!--
  СГЕНЕРИРОВАНО scripts/build-button-options.mjs — руками не править.
  Доска для выбора: в продукт ни один вариант не внесён.
-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="../design-system/index.css">
<style>
  /* обвязка доски: к продукту не относится */
  body { margin: 0; padding: 32px; background: #15131A; color: #EDEAF2;
    font: 400 14px/1.55 "Figtree", -apple-system, sans-serif; }
  .top { max-width: 80ch; margin: 0 0 28px; }
  .top h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: -.03em; }
  .top p { margin: 0 0 6px; color: #ADA6BC; }
  .top code { font-family: ui-monospace, monospace; font-size: 12px; }
  .block { margin: 0 0 40px; }
  .block > h2 { margin: 0 0 16px; font-size: 18px; letter-spacing: -.02em; }
  .board { display: flex; gap: 24px; align-items: flex-start; overflow-x: auto; padding-bottom: 16px; }
  .opt { flex: none; width: 390px; }
  .opt-head { margin: 0 0 14px; }
  .opt-head h3 { margin: 0 0 6px; font-size: 16px; letter-spacing: -.01em; }
  .opt-head p { margin: 0; font-size: 12px; line-height: 1.5; color: #ADA6BC; }
  /* Экран стоит в рамке без мокапа телефона: сравниваются кнопки, а не корпус */
  .opt .mm-screen { margin-bottom: 16px; border-radius: 26px; box-shadow: 0 0 0 1px #332F3D, 0 10px 30px rgba(0, 0, 0, .45); }
  /* Светлый блок сам по себе светлый: экран в нём белый, и на тёмном листе
     доски его край должен быть виден */
  .block:not([data-theme]) .opt .mm-screen { box-shadow: 0 0 0 1px #4A4654, 0 10px 30px rgba(0, 0, 0, .45); }

${OPTIONS.map((o) => o.css).filter(Boolean).join('\n')}
</style>
</head>
<body>

<div class="top">
  <h1>Третичная кнопка — четыре варианта</h1>
  <p>«Skip», «See people →», «Look at events →» — одна и та же третичная кнопка.
  Её вид в ките записан как «белая с обводкой»: заливка вровень с фоном, работу делает линия.
  Линия при этом даёт <code>1,18:1</code> на белом и <code>1,87:1</code> на тёмной карточке —
  то есть кнопку держит граница, которой почти нет.</p>
  <p>Ниже один и тот же экран в четырёх вариантах и в обеих темах. Главная и вторичная кнопки
  не трогаются нигде: сравнивается только третья ступень.</p>
  <p><b>В продукт не внесён ни один вариант.</b> Принятый уедет в <code>tokens.css</code>
  и <code>components/</code>, остальные останутся здесь — как кандидаты на доске тёмных обликов.</p>
</div>

${block('light')}

${block('dark')}

</body>
</html>
`;

writeFileSync(join(ROOT, 'concept/button-options.html'), page, 'utf8');
console.log(`concept/button-options.html: ${OPTIONS.length} варианта × ${bodies.length} экрана × 2 темы`);
