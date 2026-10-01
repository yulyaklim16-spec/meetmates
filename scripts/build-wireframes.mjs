// Сборка вайрфреймов и раздела 04 «Прототипирование и вайрфрейминг».
//
// Делает три вещи, все из одних данных — wireframes/_screens.md и sitemap.md:
//   1. панель навигации (раздел → экран → состояния) и вставляет её в каждую
//      страницу между метками <!-- nav:start --> и <!-- nav:end -->, а над мокапом —
//      полосу состояний этого экрана между <!-- states:start --> и <!-- states:end -->;
//      метки полосы дописываются сами, если их в странице нет;
//   2. страницы-заглушки для всего, что ещё не нарисовано, — чтобы из панели
//      можно было перейти куда угодно, а не упереться в 404;
//   3. sections/wireframes.html — раздел сайта, где заглушки считаются отдельно
//      от нарисованного, иначе раздел бы врал про готовность.
//
// Запуск: node scripts/build-wireframes.mjs — после любой правки макетов или _screens.md.
// Оболочка раздела (стили, боковая колонка) берётся из sections/index.html, как у раздела 3.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const screensMd = read('wireframes/_screens.md');
const sitemapMd = read('sitemap.md');
const shell = read('sections/index.html');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// markdown → текст: для комментариев и подписей внутри страниц
const plain = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`]/g, '').replace(/\\\|/g, '|').replace(/\s+/g, ' ').trim();

// ── экраны из таблицы состояний ────────────────────────────────────────
// | **II.1** Колода | `deck` | ✓ | ✓ | ✓ | — |
const STATES = [
  { key: 'empty', suffix: '-empty', title: 'пусто' },
  { key: 'error', suffix: '-error', title: 'ошибка' },
  { key: 'loading', suffix: '-loading', title: 'загрузка' },
  { key: 'success', suffix: '-success', title: 'успех' },
];

function screens() {
  // две таблицы одного формата: восемь экранов главного потока и экраны за вкладками D-43
  // строки ниже таблицы «Состояния сверх четвёрки» — не экраны, а состояния
  const tablesOnly = screensMd.slice(0, screensMd.indexOf('### Состояния сверх четвёрки'));
  const rows = [...tablesOnly.matchAll(/^\| \*\*([IVX]+\.\d+)\*\* ([^|]+?) \| `([a-z-]+)` \| (.+?) \|\s*$/gm)];
  if (rows.length < 8) throw new Error(`в _screens.md найдено ${rows.length} экранов, ожидалось не меньше восьми`);
  // экраны с ожиданием — отдельная таблица D-42
  const waitBlock = screensMd.slice(screensMd.indexOf('### Пятое состояние'), screensMd.indexOf('### Почему так'));
  const waits = new Set([...waitBlock.matchAll(/\*\*([IVX]+\.\d+)\*\*/g)].map((m) => m[1]));
  const extraBlock = screensMd.slice(screensMd.indexOf('### Состояния сверх четвёрки'), screensMd.indexOf('### Почему так'));
  const extra = [...extraBlock.matchAll(/^\| \*\*([IVX]+\.\d+)\*\* [^|]+\| `([a-z-]+)` \| (.+?) \|\s*$/gm)]
    .map((m) => [m[1], m[2], plain(m[3])]);

  return rows.map(([, code, name, file, tail]) => {
    const flags = tail.split('|').map((c) => c.trim());
    const has = Object.fromEntries(STATES.map((s, i) => [s.key, flags[i] === '✓']));
    const onlySuccess = has.success && !has.empty && !has.error && !has.loading;
    const pages = [{ file: `${file}.html`, title: onlySuccess ? 'успех — он же рабочий вид' : 'рабочий вид' }];
    for (const s of STATES) {
      if (!has[s.key]) continue;
      if (s.key === 'success' && onlySuccess) continue;   // успех совпал с базовым видом
      pages.push({ file: `${file}${s.suffix}.html`, title: s.title });
    }
    if (waits.has(code)) pages.push({ file: `${file}-waiting.html`, title: 'ожидание чужого решения · D-42' });
    // состояния сверх четвёрки перечислены поимённо — таблица «Состояния сверх четвёрки»
    for (const [, f, title] of extra) if (f.startsWith(file + '-')) pages.push({ file: `${f}.html`, title });
    return { code, name: name.trim(), file, pages };
  });
}

// ── job и место в потоке: из первой таблицы _screens.md ────────────────
function meta() {
  const rows = [...screensMd.matchAll(/^\| \*\*([IVX]+\.\d+)\*\* \| \*\*([^*]+)\*\* \| (.+?) \| (.+?) \|\s*$/gm)];
  if (rows.length !== 8) throw new Error(`в _screens.md найдено ${rows.length} строк с job вместо восьми`);
  return Object.fromEntries(rows.map(([, code, , job, flow]) => [code, { job: plain(job), flow: plain(flow) }]));
}

// ── ветка дерева («раздел»), к которой относится экран — из sitemap.md ──
function branches() {
  const t0 = sitemapMd.indexOf('```\nMeetMates');
  const tree = sitemapMd.slice(t0, sitemapMd.indexOf('```', t0 + 5));
  const map = {};
  let branch = null;
  for (const line of tree.split('\n')) {
    const b = line.match(/^[├└]── (.+)$/);
    if (b) { branch = b[1].trim().replace(/\s+D-\d+$/, '').replace(/\s+—.*$/, ''); continue; }
    const s = line.match(/^[│ ]   [├└]── (?:= )?([IVX]+\.\d+) /);
    if (s && branch && !map[s[1]]) map[s[1]] = branch;
  }
  return map;
}

// ── что из этого уже нарисовано ────────────────────────────────────────
const list = screens();
const META = meta();
const BRANCH = branches();
for (const s of list) {
  s.branch = BRANCH[s.code] || '—';
  // у экранов за вкладками D-43 своей строки с job нет: берём теги дерева
  s.meta = META[s.code] || { job: `теги дерева sitemap.md`, flow: 'в потоках flows.md пока нет — D-43 принят после того, как они нарисованы' };
  for (const p of s.pages) {
    const abs = join(ROOT, 'wireframes', p.file);
    p.exists = existsSync(abs);
    // заглушка помечает себя сама — так раздел отличает её от нарисованного
    p.stub = p.exists && read(`wireframes/${p.file}`).includes('<!-- stub -->');
  }
}
const drawn = list.flatMap((s) => s.pages).filter((p) => p.exists && !p.stub);
const total = list.flatMap((s) => s.pages).length;
if (!drawn.length) throw new Error('в wireframes/ нет ни одного нарисованного макета');

// показываем первый нарисованный макет; его экран — первый в навигации
const current = drawn[0];
const currentScreen = list.find((s) => s.pages.includes(current));

// ── панель навигации внутри макетов ────────────────────────────────────
// Дерево: раздел → экран → состояния. Текущая страница отмечена aria-current.
function panel(activeFile) {
  const groups = [];
  for (const s of list) {
    const g = groups.find((x) => x.title === s.branch) || (groups.push({ title: s.branch, screens: [] }), groups.at(-1));
    g.screens.push(s);
  }
  // узел состояния: ссылка на свою страницу, текущее — не ссылка
  const node = (p, active, extra) => {
    const cls = [active ? 'now' : '', p.stub ? 'stub' : '', extra || ''].filter(Boolean).join(' ');
    const label = esc(p.title);
    return `<li${cls ? ` class="${cls}"` : ''}>` +
      (active ? `<b aria-current="page">${label}</b>` : `<a href="${p.file}">${label}</a>`) + `</li>`;
  };
  const rows = groups.map((g) => `    <li class="grp">
      <p class="gt">${esc(g.title)}</p>
      <ul>
${g.screens.map((s) => {
    const [base, ...states] = s.pages;                    // рабочий вид — сам экран
    const here = s.pages.some((p) => p.file === activeFile);
    const baseCur = base.file === activeFile;
    const cls = ['scr', here ? 'open' : '', baseCur ? 'now' : '', base.stub ? 'stub' : ''].filter(Boolean).join(' ');
    const label = esc(s.name);
    const head = baseCur
      ? `<b class="s" aria-current="page">${label}</b>`
      : `<a class="s" href="${base.file}">${label}</a>`;
    if (!states.length) return `        <li class="${cls}">${head}</li>`;
    return `        <li class="${cls}">${head}
          <ul>
${states.map((p) => `            ${node(p, p.file === activeFile)}`).join('\n')}
          </ul>
        </li>`;
  }).join('\n')}
      </ul>
    </li>`).join('\n');
  return `<nav class="wfnav" aria-label="Все макеты">
  <p class="h">Вайрфреймы</p>
  <p class="t">Главный поток · мобильный веб · ${drawn.length} из ${total}</p>
  <ul>
${rows}
  </ul>
  <p class="n">Дерево: раздел → экран → его состояния. Экран ведёт на рабочий вид,
    серым — заглушка: страница есть, макет не нарисован. Панель собирается
    из _screens.md и sitemap.md скриптом build-wireframes.mjs.</p>
</nav>`;
}

// ── полоса разделов проекта на странице макета ─────────────────────────
// Та же навигация, что на сайте, но сжатая до номеров: рядом стоит дерево
// макетов, и два полных дерева подряд человек уже не читает.
function rail() {
  const items = [
    ['01', '../research/research.html', 'Ресерч и бенчмарк'],
    ['02', '../research/persones.html', 'Персоны и JTBD'],
    ['03', '../sections/ia.html', 'Информационная архитектура'],
    ['04', '../sections/wireframes.html#wireframes', 'Прототипирование и вайрфрейминг'],
  ];
  const last = items.length - 1;
  return `<nav class="wfrail" aria-label="Разделы проекта">
  <a class="home" href="../sections/index.html" aria-label="MeetMates — все разделы">MM</a>
${items.map(([n, href, title], i) =>
    `  <a${i === last ? ' class="now" aria-current="page"' : ''} href="${href}" aria-label="Раздел ${n} — ${title}" title="${title}">${n}</a>`).join('\n')}
</nav>`;
}

// ── полоса состояний экрана: над мокапом ───────────────────────────────
// Панель слева ведёт по всем макетам, полоса — по состояниям одного экрана.
// Состояния сравнивают друг с другом, и открыть соседнее должно быть дёшево.
function strip(s, activeFile) {
  const items = s.pages.map((p) => {
    const cur = p.file === activeFile;
    const cls = [cur ? 'now' : '', p.stub ? 'stub' : ''].filter(Boolean).join(' ');
    const label = esc(p.title);
    return `    <li${cls ? ` class="${cls}"` : ''}>` +
      (cur ? `<b aria-current="page">${label}</b>` : `<a href="${p.file}">${label}</a>`) + `</li>`;
  }).join('\n');
  return `<nav class="wfstates" aria-label="Состояния экрана ${esc(s.name)}">
  <p class="t">${esc(s.name)} · состояния этого экрана</p>
  <ul>
${items}
  </ul>
</nav>`;
}

// ── то же дерево для боковой колонки раздела 4 ─────────────────────────
// Ссылки ведут из sections/ в wireframes/, текущей страницы здесь нет:
// мы стоим на разделе, а не внутри макета.
function sideTree() {
  const groups = [];
  for (const s of list) {
    const g = groups.find((x) => x.title === s.branch) || (groups.push({ title: s.branch, screens: [] }), groups.at(-1));
    g.screens.push(s);
  }
  const rows = groups.map((g) => `          <li class="grp">
            <p class="gt">${esc(g.title)}</p>
            <ul>
${g.screens.map((s) => {
    const [base, ...states] = s.pages;
    const head = `<a class="s${base.stub ? ' todo' : ''}" href="../wireframes/${base.file}">${esc(s.name)}</a>`;
    if (!states.length) return `              <li class="scr">${head}</li>`;
    return `              <li class="scr">${head}
                <ul>
${states.map((p) => `                  <li${p.stub ? ' class="todo"' : ''}><a href="../wireframes/${p.file}">${esc(p.title)}</a></li>`).join('\n')}
                </ul>
              </li>`;
  }).join('\n')}
            </ul>
          </li>`).join('\n');
  return `
      <div class="wftree">
        <p class="h">Вайрфреймы</p>
        <p class="sub">Главный поток · мобильный веб · ${drawn.length} из ${total}</p>
        <ul>
${rows}
        </ul>
      </div>`;
}

// ── страница-заглушка ──────────────────────────────────────────────────
function stubPage(s, p) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.name)} · ${esc(p.title)} · MeetMates wireframe</title>
<!-- stub -->
<!--
  Страница-заглушка: создана скриптом build-wireframes.mjs, макет не нарисован.
  Экран:  ${s.code} ${s.name} — sitemap.md, ветка «${s.branch}»
  Job:    ${s.meta.job}
  Поток:  ${s.meta.flow}
  Состояние: ${p.title}
  Рисовать по правилам _conventions.md: мокап телефона, семантическая разметка,
  настоящий текст, серый без цвета. Заменить содержимое .app целиком.
-->
<link rel="stylesheet" href="_wire.css">
</head>
<body>

<!-- nav:start -->
<!-- nav:end -->

<!-- states:start -->
<!-- states:end -->

<div class="device">
 <div class="screen">
  <p class="statusbar"><span>09:41</span><span>Wi-Fi · 100%</span></p>

  <main class="app empty">
    <p class="stub-t">${esc(s.name)}</p>
    <p class="stub-s">${esc(p.title)}</p>
    <p class="stub-n">Макет не нарисован</p>
  </main>

  <p class="fold"><span>сгиб — ниже не наше</span></p>
  <p class="browserbar">meetmates.app</p>
  <p class="homebar" aria-hidden="true"></p>
 </div>
</div>

<!-- служебное: на прототип не едет -->
<footer class="meta">
  <p><b>${esc(s.name)} · ${esc(p.title)}</b> — заглушка, макет не нарисован.</p>
  <p><b>Job:</b> ${esc(s.meta.job)}</p>
  <p><b>Место в потоке:</b> ${esc(s.meta.flow)}</p>
  <p>Правила — _conventions.md · что рисуем — _screens.md · экраны и состояния — sitemap.md.</p>
</footer>

</body>
</html>
`;
}

// ── страница раздела ───────────────────────────────────────────────────
const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Прототипирование и вайрфрейминг · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Вайрфреймы главного потока: макеты в мокапе телефона, по странице на состояние. Навигация по экранам и текущий макет.">');

const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
// пункт 04 становится текущим, и сразу под ним раскрывается дерево макетов
const cur = /<a class="mat"([^>]*)href="wireframes\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html не найден пункт 04 — боковая колонка изменилась');
// Разделы остаются списком разделов: дерево макетов — своя колонка рядом,
// и показывается оно только на вкладке «Вайрфреймы».
const subtabs = `
        <nav class="subtabs" aria-label="Что показывать в разделе">
          <a href="#info" data-tab="info" aria-current="true">Информация</a>
          <a href="#wireframes" data-tab="wf">Вайрфреймы</a>
        </nav>`;
const aside = asideSrc
  .replace(cur, (m, attrs, head) => `<a class="mat current"${attrs}href="wireframes.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);
const wfAside = `  <aside class="wfside" aria-label="Все макеты">${sideTree()}
  </aside>`;

const extraCss = `
/* ── Раздел 04: навигация по макетам и просмотр ────────────── */
.wf { list-style: none; padding: 0; display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); align-items: start; margin: 0 0 var(--s-6); }
.wf > li { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); padding: var(--s-3) var(--s-4); }
.wf .sh { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2) var(--s-3); margin-bottom: var(--s-2); }
.wf .sh b { font-size: var(--t-body-sm); }
.wf .sh .n { margin-left: auto; font-size: var(--t-micro); color: var(--ink-600); }
.wf ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1px; max-width: none; }
.wf ul li { margin: 0; border-top: 1px solid var(--line); padding: 5px 0; font-size: var(--t-caption); display: flex; gap: var(--s-3); align-items: baseline; }
.wf ul li:first-child { border-top: 0; }
.wf ul li span { margin-left: auto; color: var(--ink-600); font-size: var(--t-micro); }

/* ── Что показывать в разделе: подпункты 04 в самом дереве ───
   Выбор раздела и выбор того, что внутри раздела, стоят в одном месте */
.subtabs { display: flex; flex-direction: column; gap: 1px; margin: var(--s-2) 0 var(--s-4) 30px; padding-left: var(--s-3); border-left: 1px solid var(--line); }
.subtabs a { padding: var(--s-2) var(--s-3); border-radius: var(--r-sm); font-size: var(--t-caption); color: var(--ink-600); text-decoration: none; transition: background var(--dur-fast) var(--ease-out); }
.subtabs a:hover { background: var(--surface-2); color: var(--ink-900); }
.subtabs a:focus-visible { outline: 2px solid var(--brand-a); outline-offset: -2px; }
.subtabs a[aria-current="true"] { background: var(--surface-2); color: var(--ink-900); font-weight: var(--fw-medium); }

/* Дерево макетов — вторая колонка слева, рядом с разделами проекта.
   Пока вкладка не открыта, его нет: список макетов в содержимом даёт то же самое */
.wfside { display: none; position: sticky; top: 0; max-height: 100vh; overflow-y: auto; padding: var(--s-6) var(--s-4) var(--s-6) 0; border-right: 1px solid var(--line); }
.wfside .wftree { margin: 0; padding: 0; border-top: 0; }
.shell[data-tab="wf"] { grid-template-columns: 56px 228px minmax(0, 1fr); gap: var(--s-5); }
.shell[data-tab="wf"] .wfside { display: block; }
/* разделы сжимаются до номеров: два дерева подряд не читаются */
.shell[data-tab="wf"] .side .stage,
.shell[data-tab="wf"] .side .lbl,
.shell[data-tab="wf"] .side .brand b,
.shell[data-tab="wf"] .side .mat .t,
.shell[data-tab="wf"] .side .subtabs { display: none; }
.shell[data-tab="wf"] .side .brand { justify-content: center; margin-bottom: var(--s-5); }
.shell[data-tab="wf"] .side .mat { justify-content: center; padding: var(--s-3) 0; }
.shell[data-tab="wf"] .side .mat .n { font-size: var(--t-caption); min-width: 0; }
.shell[data-tab="wf"] .side .mat.current .n { color: var(--ink-900); font-weight: var(--fw-medium); }
@media (max-width: 900px) {
  .shell[data-tab="wf"] { grid-template-columns: minmax(0, 1fr); }
  .wfside { display: none !important; }
}
.wf a { text-decoration: none; }
.wf a:hover, .wf a:focus-visible { text-decoration: underline; }
.wf .todo { color: var(--ink-400); }
/* раздел дерева — строка во всю ширину сетки, а не карточка среди экранов */
.wf .branch { grid-column: 1 / -1; border: 0; background: none; padding: var(--s-3) 0 0; }
.wf .branch h3 { margin: 0; font-size: var(--t-micro); letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-600); }
.wf .branch:first-child { padding-top: 0; }
.wf .todo span { color: var(--ink-400); }

/* дерево макетов в боковой колонке: раздел → экран → состояния.
   Вложенность держат отступ и вертикальная линия, как в самих макетах. */
.wftree { margin: var(--s-4) 0 var(--s-3); padding: var(--s-4) 0 0 30px; border-top: 1px solid var(--line); }
.wftree .h { margin: 0; font-size: var(--t-body-sm); font-weight: var(--fw-bold); letter-spacing: -0.01em; }
.wftree .sub { margin: 0 0 var(--s-4); font-size: var(--t-micro); color: var(--ink-600); }
.wftree ul { list-style: none; margin: 0; padding: 0; max-width: none; }
.wftree li { margin: 0; }
/* разделы отбиты линией — уровень 1 читается как группа, а не как ещё один пункт */
.wftree .grp { padding-bottom: var(--s-3); }
.wftree .grp + .grp { border-top: 1px solid var(--line); padding-top: var(--s-3); }
.wftree .gt {
  margin: 0 0 var(--s-2);
  padding: 3px var(--s-2);
  font-size: var(--t-micro); letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink-900); font-weight: var(--fw-medium);
}
.wftree a {
  display: block;
  padding: 4px var(--s-2);
  border-radius: var(--r-sm);
  text-decoration: none;
  font-size: var(--t-micro); line-height: 1.4;
  color: var(--ink-600);
}
.wftree a:hover, .wftree a:focus-visible { color: var(--ink-900); background: var(--surface-2); }
/* уровень 2 — экран */
.wftree .s { color: var(--ink-900); font-size: var(--t-caption); font-weight: var(--fw-medium); }
/* уровень 3 — состояния, вдоль вертикальной линии */
.wftree .scr > ul { margin: 1px 0 var(--s-2) var(--s-3); padding-left: var(--s-2); border-left: 1px solid var(--line); }
.wftree .todo > a, .wftree a.todo { color: var(--ink-400); }

`;

// ── 1–2. заглушки и панель в каждой странице ──────────────────────────
let written = 0;
for (const s of list) {
  for (const p of s.pages) {
    if (!p.exists) {
      writeFileSync(join(ROOT, 'wireframes', p.file), stubPage(s, p), 'utf8');
      p.exists = true; p.stub = true; written++;
    }
  }
}
let injected = 0;
for (const s of list) {
  for (const p of s.pages) {
    const rel = `wireframes/${p.file}`;
    const html = read(rel);
    const a = html.indexOf('<!-- nav:start -->');
    const b = html.indexOf('<!-- nav:end -->');
    if (a === -1 || b === -1) throw new Error(`в ${p.file} нет меток <!-- nav:start --> / <!-- nav:end -->`);
    let next = html.slice(0, a) + '<!-- nav:start -->\n' + rail() + '\n' + panel(p.file) + '\n' + html.slice(b);
    // метки полосы состояний дописываются сами: страницу, нарисованную руками,
    // не должно заботить, какие служебные блоки в неё вставляются
    if (!next.includes('<!-- states:start -->')) {
      next = next.replace('<div class="device">', '<!-- states:start -->\n<!-- states:end -->\n\n<div class="device">');
    }
    const c = next.indexOf('<!-- states:start -->');
    const d = next.indexOf('<!-- states:end -->');
    if (c === -1 || d === -1) throw new Error(`в ${p.file} не удалось поставить метки <!-- states:* -->`);
    next = next.slice(0, c) + '<!-- states:start -->\n' + strip(s, p.file) + '\n' + next.slice(d);
    if (next !== html) { writeFileSync(join(ROOT, rel), next, 'utf8'); injected++; }
  }
}

const navGroups = [];
for (const s of list) {
  const g = navGroups.find((x) => x.title === s.branch) || (navGroups.push({ title: s.branch, screens: [] }), navGroups.at(-1));
  g.screens.push(s);
}
const navHtml = navGroups.map((g) => `      <li class="branch"><h3>${esc(g.title)}</h3></li>
` + g.screens.map((s) => {
  const ready = s.pages.filter((p) => !p.stub).length;
  return `      <li>
        <p class="sh"><b>${esc(s.name)}</b><span class="n">${ready} из ${s.pages.length}</span></p>
        <ul>
${s.pages.map((p) => p.stub
    ? `          <li class="todo"><a href="../wireframes/${p.file}">${p.file}</a><span>${esc(p.title)} — заглушка</span></li>`
    : `          <li><a href="../wireframes/${p.file}">${p.file}</a><span>${esc(p.title)}</span></li>`).join('\n')}
        </ul>
      </li>`;
}).join('\n')).join('\n');

const page = `${head}${extraCss}</style>
</head>
<body>

<a class="skip" href="#content">Перейти к материалу</a>

<div class="shell">

  ${aside}

${wfAside}

  <main id="content">
    <div class="masthead">
      <h1>Прототипирование и вайрфрейминг</h1>
      <p class="lede">Низкодетализированные экраны в сером: структура, иерархия и зоны — до того как в них вложат визуал. Каждый макет стоит в мокапе телефона, потому что продукт владеет не всем экраном, и каждое состояние — отдельная страница. Правила — <a href="../wireframes/_conventions.md">_conventions.md</a>, что рисуем — <a href="../wireframes/_screens.md">_screens.md</a>.</p>
      <div class="chips">
        <span><b>${drawn.length}</b> из ${total} макетов</span>
        <span><b>${list.length}</b> экранов: 8 главного потока и 3 за вкладками</span>
        <span><b>713</b> px продукту из 844</span>
      </div>
      <!--PUBLIC-NOTE-->
    </div>

    <div class="tabpanel" id="info">
      <section id="page">
        <h2>Как устроена страница макета</h2>
        <p class="intro">Макет открывается отдельной страницей, во всю ширину окна. Слева — номера разделов проекта и рядом с ними дерево всех макетов; над мокапом — состояния этого экрана, справа от него — подписи зон и их главные действия, под ним — служебный блок с источниками. Ничего из этого в прототип не едет: мокап показывает, что из 844px экрана продукту принадлежит 713, остальное забирают системная строка, панель браузера Safari и индикатор жеста.</p>
      </section>

      <section id="rules">
        <h2>Правила, по которым это нарисовано</h2>
        <p class="intro">Полностью — <a href="../wireframes/_conventions.md">_conventions.md</a>. Здесь то, что видно на макете.</p>
        <div class="tw"><table>
          <thead><tr><th>Правило</th><th>Как это видно</th></tr></thead>
          <tbody>
            <tr><td><b>Мокап телефона обязателен</b></td><td>Продукту принадлежит 713px из 844; системные зоны нарисованы и подписаны. Не поместилось — находка, а не повод растянуть рамку</td></tr>
            <tr><td><b>Серый ничего не кодирует</b></td><td>Состояние объясняется текстом. Непонятно в сером — непонятно и в цвете, просто выяснится позже и дороже</td></tr>
            <tr><td><b>Одно состояние — одна страница</b></td><td>Структура одинаковая, содержимое разное: видно, что это тот же экран. Пятое состояние — ожидание чужого решения <code class="dcode">D-42</code></td></tr>
            <tr><td><b>Текст настоящий</b></td><td><code>3 common interests</code>, <code>6 meetups attended</code>, <code>~2 km</code> — и те же запреты копирайта, что в продукте</td></tr>
            <tr><td><b>Семантическая разметка</b></td><td><code>header</code>, <code>main</code>, <code>nav</code>, <code>article</code>, <code>button</code>; <code>div</code> — только корпус и экран телефона</td></tr>
          </tbody>
        </table></div>
      </section>
    </div>

    <div class="tabpanel" id="wireframes">
      <section id="nav">
        <h2>Макеты</h2>
        <p class="intro">Восемь экранов главного потока и три за вкладками — со всеми состояниями из таблицы. Состояния, которого в таблице нет, нет и в наборе: страницу под него не придумывают. Список собирается сборкой из <a href="../wireframes/_screens.md">_screens.md</a>, готовность считается по файлам — отмечать руками не нужно.</p>
        <ol class="wf">
${navHtml}
        </ol>
      </section>
    </div>

    <footer>
      <p>Раздел 4 из 12 · Прототипирование и вайрфрейминг. Источники — <a href="../wireframes/_screens.md">_screens.md</a>, <a href="../wireframes/_conventions.md">_conventions.md</a>; экраны и состояния — <a href="../sitemap.md">sitemap.md</a>.</p>
      <nav class="section-nav"><a href="ia.html">← Раздел 3 · Информационная архитектура</a></nav>
    </footer>
  </main>
</div>

<script>
// Что показывать в разделе — два подпункта 04 в дереве. Без скрипта это
// обычные якоря: видны оба блока, ссылки ведут к своим заголовкам.
(function () {
  var shell = document.querySelector('.shell');
  var subtabs = document.querySelector('.subtabs');
  if (!shell || !subtabs) return;
  var panels = { info: document.getElementById('info'), wf: document.getElementById('wireframes') };
  var links = subtabs.querySelectorAll('a[data-tab]');

  function show(name, push) {
    shell.setAttribute('data-tab', name);
    for (var k in panels) panels[k].hidden = (k !== name);
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-tab') === name) links[i].setAttribute('aria-current', 'true');
      else links[i].removeAttribute('aria-current');
    }
    if (push) history.replaceState(null, '', name === 'wf' ? '#wireframes' : '#info');
  }

  subtabs.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-tab]');
    if (!a) return;
    e.preventDefault();
    show(a.getAttribute('data-tab'), true);
  });

  // в сжатом виде подпунктов не видно: назад ведёт сам номер раздела
  var cur = document.querySelector('.side .mat.current');
  if (cur) cur.addEventListener('click', function (e) {
    if (shell.getAttribute('data-tab') === 'wf') { e.preventDefault(); show('info', true); }
  });

  show(location.hash === '#wireframes' ? 'wf' : 'info', false);
})();
</script>

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/wireframes.html'), page, 'utf8');
console.log(
  `вайрфреймы: ${drawn.length} нарисовано из ${total}; заглушек создано ${written}, панель обновлена в ${injected}
` +
  `sections/wireframes.html: ${list.length} экранов`
);
