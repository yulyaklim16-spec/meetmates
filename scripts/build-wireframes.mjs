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
  const rows = [...screensMd.matchAll(/^\| \*\*([IVX]+\.\d+)\*\* ([^|]+?) \| `([a-z-]+)` \| (.+?) \|\s*$/gm)];
  if (rows.length < 8) throw new Error(`в _screens.md найдено ${rows.length} экранов, ожидалось не меньше восьми`);
  // экраны с ожиданием — отдельная таблица D-42
  const waitBlock = screensMd.slice(screensMd.indexOf('### Пятое состояние'), screensMd.indexOf('### Почему так'));
  const waits = new Set([...waitBlock.matchAll(/\*\*([IVX]+\.\d+)\*\*/g)].map((m) => m[1]));

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
    const label = `<span class="c">${esc(s.code)}</span> ${esc(s.name)}`;
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
  return `<nav class="wfstates" aria-label="Состояния экрана ${esc(s.code)} ${esc(s.name)}">
  <p class="t">${esc(s.code)} ${esc(s.name)} · состояния этого экрана</p>
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
    const head = `<a class="s${base.stub ? ' todo' : ''}" href="../wireframes/${base.file}"><span class="c">${esc(s.code)}</span> ${esc(s.name)}</a>`;
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
    <p class="stub-t">${esc(s.code)} ${esc(s.name)}</p>
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
  <p><b>${esc(s.code)} ${esc(s.name)} · ${esc(p.title)}</b> — заглушка, макет не нарисован.</p>
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
const aside = asideSrc
  .replace(cur, (m, attrs, head) => `<a class="mat current"${attrs}href="wireframes.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${sideTree()}`)
  .replace('</nav>', `</nav>

    <nav class="anchors" aria-label="На этой странице">
      <a href="#nav">Макеты</a>
      <a href="#view">Текущий макет</a>
      <a href="#rules">Правила</a>
    </nav>`);

const extraCss = `
/* ── Раздел 04: навигация по макетам и просмотр ────────────── */
.wf { list-style: none; padding: 0; display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); align-items: start; margin: 0 0 var(--s-6); }
.wf > li { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); padding: var(--s-3) var(--s-4); }
.wf .sh { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2) var(--s-3); margin-bottom: var(--s-2); }
.wf .sh .code { font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.06em; color: var(--ink-600); }
.wf .sh b { font-size: var(--t-body-sm); }
.wf .sh .n { margin-left: auto; font-size: var(--t-micro); color: var(--ink-600); }
.wf ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1px; max-width: none; }
.wf ul li { margin: 0; border-top: 1px solid var(--line); padding: 5px 0; font-size: var(--t-caption); display: flex; gap: var(--s-3); align-items: baseline; }
.wf ul li:first-child { border-top: 0; }
.wf ul li span { margin-left: auto; color: var(--ink-600); font-size: var(--t-micro); }
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
.wftree .s .c { color: var(--ink-400); font-weight: var(--fw-regular); }
/* уровень 3 — состояния, вдоль вертикальной линии */
.wftree .scr > ul { margin: 1px 0 var(--s-2) var(--s-3); padding-left: var(--s-2); border-left: 1px solid var(--line); }
.wftree .todo > a, .wftree a.todo { color: var(--ink-400); }

/* фрейм должен быть шире 760px: у самого макета там брейкпоинт, ниже которого
   служебные подписи возвращаются в поток и ломают колонку 390 */
.viewer { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface-2); padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-4); margin: 0 0 var(--s-5); }
.viewer iframe { width: 100%; height: 1320px; border: 0; background: var(--surface); border-radius: var(--r-md); }
.viewer .cap { font-size: var(--t-caption); color: var(--ink-600); max-width: 70ch; }
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
    let next = html.slice(0, a) + '<!-- nav:start -->\n' + panel(p.file) + '\n' + html.slice(b);
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
        <p class="sh"><span class="code">${esc(s.code)}</span><b>${esc(s.name)}</b><span class="n">${ready} из ${s.pages.length}</span></p>
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

    <section id="nav">
      <h2>Макеты</h2>
      <p class="intro">Восемь экранов главного потока и три за вкладками — со всеми состояниями из таблицы. Состояния, которого в таблице нет, нет и в наборе: страницу под него не придумывают. Список собирается сборкой из <a href="../wireframes/_screens.md">_screens.md</a>, готовность считается по файлам — отмечать руками не нужно.</p>
      <ol class="wf">
${navHtml}
      </ol>
    </section>

    <section id="view">
      <h2>Текущий макет</h2>
      <p class="intro"><b>${esc(currentScreen.code)} ${esc(currentScreen.name)}</b> — ${esc(current.title)}. Экран, с которого Даша начинает главный job: колода после онбординга, первый шаг основного пути <code class="dcode">D-37</code>. Слева внутри макета — дерево всех страниц, сверху — состояния этого экрана, справа от мокапа — подписи зон и их главные действия, под ним — служебный блок с источниками. Ничего из этого в прототип не едет.</p>
      <div class="viewer">
        <iframe src="../wireframes/${current.file}" title="Вайрфрейм: ${esc(currentScreen.name)}" loading="lazy"></iframe>
        <p class="cap">Мокап показывает, что из 844px экрана продукту принадлежит 713: остальное забирают системная строка, панель браузера Safari и индикатор жеста. <a href="../wireframes/${current.file}">Открыть страницу отдельно</a></p>
      </div>
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
          <tr><td><b>Текст настоящий</b></td><td><code>3 common interests</code>, <code>6 meetups attended</code>, <code>~2 km away</code> — и те же запреты копирайта, что в продукте</td></tr>
          <tr><td><b>Семантическая разметка</b></td><td><code>header</code>, <code>main</code>, <code>nav</code>, <code>article</code>, <code>button</code>; <code>div</code> — только корпус и экран телефона</td></tr>
        </tbody>
      </table></div>
    </section>

    <footer>
      <p>Раздел 4 из 12 · Прототипирование и вайрфрейминг. Источники — <a href="../wireframes/_screens.md">_screens.md</a>, <a href="../wireframes/_conventions.md">_conventions.md</a>; экраны и состояния — <a href="../sitemap.md">sitemap.md</a>.</p>
      <nav class="section-nav"><a href="ia.html">← Раздел 3 · Информационная архитектура</a></nav>
    </footer>
  </main>
</div>

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/wireframes.html'), page, 'utf8');
console.log(
  `вайрфреймы: ${drawn.length} нарисовано из ${total}; заглушек создано ${written}, панель обновлена в ${injected}
` +
  `sections/wireframes.html: ${list.length} экранов`
);
