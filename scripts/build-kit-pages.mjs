// Страницы кита: ui/kit.html (витрина) и ui/shell.html (оболочка).
//
// Иконки берутся из того же набора, что и экраны, — concept/icons/solar-*.
// Руками они не копируются: поменялся файл иконки, пересобрали страницы,
// и в ките та же. Залитая там, где иконка что-то утверждает (активная вкладка,
// Verified, кнопка), контурная там, где элемент ждёт ввода или не выбран.
//
// Разметка компонентов живёт здесь: это единственное место, где она описана
// под именами кита (.mm-*), а не под именами вайрфреймов.
//
// Запуск: node scripts/build-kit-pages.mjs — после правки ui/kit.css.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rail } from './lib/chrome.mjs';

const ROOT = process.cwd();
const OUT = join(ROOT, 'ui');
const BOLD = join(ROOT, 'concept/icons/solar-bold');
const LINEAR = join(ROOT, 'concept/icons/solar-linear');

// иконка без собственных размеров: их задаёт класс, а не разметка
const svg = (name, dir = BOLD) =>
  readFileSync(join(dir, `${name}.svg`), 'utf8').trim()
    .replace('width="1em" height="1em" ', '')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
    .replace(/\s(width|height)="\d+"/g, '');

const I = {
  'tab-people': svg('users-group-rounded', LINEAR),
  'tab-people-bold': svg('users-group-rounded'),
  'tab-events': svg('ticket', LINEAR),
  'tab-events-bold': svg('ticket'),
  'tab-search': svg('magnifer', LINEAR),
  'tab-chats': svg('chat-round-dots', LINEAR),
  'tab-chats-bold': svg('chat-round-dots'),
  'tab-profile': svg('user-rounded', LINEAR),
  filters: svg('tuning-2'),
  post: svg('add'),
  verified: svg('verified-check'),
  pin: svg('map-point'),
  // в поле иконка контурная: поле ничего не утверждает, оно ждёт ввода
  search: svg('magnifer', LINEAR),
  message: svg('chat-round-dots', LINEAR),
  retry: svg('danger-circle'),
  report: svg('flag'),
  // пусто — событие, сбой — опасность: так же выбирает их экран
  'state-empty': svg('ticket'),
  'state-alert': svg('danger-circle'),
  'state-chats': svg('ticket'),
};

const ico = (n, cls = 'mm-ico') => `<span class="${cls}" aria-hidden="true">${I[n]}</span>`;

const FONT = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">`;

// Снимки лежат рядом, в ui/img: те же кадры, что на экранах концепта, но взятые
// файлами. Кит не должен гаснуть оттого, что Unsplash недоступен или что страницу
// открыли там, куда чужие картинки не пускают.
const face = (who, px = 48) => `<img src="img/${who}-${px}.jpg" alt="" loading="lazy">`;
const cover = (what) => `<img src="img/ev-${what}.jpg" alt="" loading="lazy">`;

// ── нижнее меню: пять вкладок, активную задаёт аргумент ──────────
const TABS = [
  ['People', 'tab-people', 'tab-people-bold'],
  ['Events', 'tab-events', 'tab-events-bold'],
  ['Search', 'tab-search', 'tab-search'],
  ['Chats', 'tab-chats', 'tab-chats-bold'],
  ['Profile', 'tab-profile', 'tab-profile'],
];
const tabs = (current) => `<nav class="mm-tabs" aria-label="Main navigation">
${TABS.map(([label, linear, bold]) => {
  const on = label === current;
  return `        <a class="mm-tab${on ? ' is-current' : ''}" href="#"${on ? ' aria-current="page"' : ''}>${ico(on ? bold : linear)}${label}</a>`;
}).join('\n')}
      </nav>`;

// ── шапка: одна строка, два уровня, возврат ─────────────────────
const headPlain = `<header class="mm-head">
        <h1 class="mm-head-title">Events nearby</h1>
        <button class="mm-head-btn" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>
        <button class="mm-head-btn mm-head-btn--primary" type="button" aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>
      </header>`;

const headStack = `<header class="mm-head mm-head--stack">
        <h1 class="mm-head-title">Search</h1>
        <div class="mm-head-line">
          <form class="mm-field" role="search">
            ${ico('search')}
            <label class="mm-vh" for="q">Search people and events</label>
            <input id="q" type="search" value="board games">
          </form>
          <button class="mm-head-btn" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>
        </div>
      </header>`;

const headBack = `<header class="mm-head">
        <a class="mm-head-btn mm-head-btn--back" href="#" aria-label="Back to events"><span aria-hidden="true">&larr;</span></a>
        <h1 class="mm-head-title">Olena, 26</h1>
        <button class="mm-head-btn mm-head-btn--report" type="button">${ico('report')}Report</button>
      </header>`;

// ═══════════════════════════ shell.html ═══════════════════════════

const shellPage = (head, current, note) => `  <figure class="shelf">
    <div class="mm-screen">
      ${head}
      <main class="mm-app">
        <div class="mm-pane">
          <section class="mm-section"><p class="slot">содержимое экрана<br><small>.mm-pane &gt; .mm-section</small></p></section>
        </div>
      </main>
      ${tabs(current)}
    </div>
    <figcaption>${note}</figcaption>
  </figure>`;

const shell = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Оболочка экрана · MeetMates UI kit</title>
<!--
  ОБОЛОЧКА КАК РАЗМЕТКА. Отсюда её берёт экран, которому нужен каркас:
  копируется .mm-screen целиком, внутрь .mm-pane кладётся содержимое.

  Что держит оболочка:
  - .mm-screen — 390 × 844, цветное размытие вверху, белый с 57 % высоты;
  - .mm-head — шапка; её горизонтальные поля свои, 16px;
  - .mm-app — содержимое; поля экрана заданы здесь и только здесь,
    у секций внутри своих горизонтальных полей нет;
  - .mm-tabs — нижнее меню, пять вкладок (D-43), активная одна.

  Чего в ней нет: мокапа телефона. Системная строка, панель браузера
  и индикатор жеста — чужие зоны, продукт ими не владеет; их рисует
  страница макета, а не оболочка.

  Вид — ui/kit.css. В этом файле ни одного стиля продукта, только обвязка
  самой страницы (классы без префикса mm-).
-->
${FONT}
<link rel="stylesheet" href="kit.css">
<style>
  /* обвязка этой страницы: к продукту не относится */
  body { margin: 0; padding: 32px 32px 32px 80px; background: #EFEFF2; }
  h1.t { margin: 0 0 4px; font-size: 22px; letter-spacing: -.02em; }
  p.lead { margin: 0 0 28px; max-width: 70ch; color: #4C3F59; font-size: 14px; line-height: 1.55; }
  .shelves { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
  .shelf { margin: 0; }
  .shelf figcaption { max-width: 390px; margin-top: 10px; font-size: 12px; line-height: 1.45; color: #4C3F59; }
  .shelf .mm-screen { border-radius: 26px; box-shadow: 0 0 0 1px #DCD6E4, 0 8px 28px rgba(17, 17, 17, .1); }
  .slot { flex: 1; display: grid; place-content: center; margin: 0; border-radius: 26px;
    background: rgba(255, 255, 255, .55); box-shadow: inset 0 0 0 1px #DCD6E4; text-align: center;
    font-size: 12px; color: #4C3F59; }
  .slot small { color: #8C7E9B; }
  code { font-family: ui-monospace, monospace; font-size: 12px; }
  /* полоса разделов проекта: та же, что на макетах и экранах концепта */
  .wfrail { position: fixed; top: 32px; left: 16px; display: flex; flex-direction: column; align-items: center;
    gap: 2px; font: 12px/1.4 var(--mm-font); }
  .wfrail a { display: block; min-width: 32px; padding: 6px 8px; border-radius: 14px; color: #4C3F59;
    text-decoration: none; text-align: center; font-variant-numeric: tabular-nums; }
  .wfrail a:hover { background: #E8E1F1; color: #1A1026; }
  .wfrail .home { margin-bottom: 16px; font-weight: 700; letter-spacing: .04em; color: #1A1026; }
  .wfrail .now { background: #E8E1F1; color: #1A1026; font-weight: 700; }
  @media (max-width: 1000px) {
    .wfrail { position: static; flex-direction: row; flex-wrap: wrap; margin: 0 0 16px; }
    body { padding: 32px; }
  }
</style>
</head>
<body class="mm">
${rail({ prefix: '../', current: '07' })}
<h1 class="t">Оболочка экрана</h1>
<p class="lead">Три шапки на выбор и одно нижнее меню. Серый экран берёт отсюда каркас:
копируется <code>.mm-screen</code>, внутрь <code>.mm-pane</code> кладётся содержимое.
Поля экрана задаёт <code>.mm-app</code>.</p>
<div class="shelves">
${shellPage(headPlain, 'Events', 'Шапка в одну строку: заголовок, <code>Filters</code>, тёмный <code>Post</code>. Порядок на экране обратен разметке — тёмная кнопка стоит левее (<code>order</code>).')}
${shellPage(headStack, 'Search', 'Двухуровневая шапка: заголовок строкой, под ним поле и фильтры. Второй уровень — <code>.mm-head-line</code>.')}
${shellPage(headBack, 'People', 'Шапка экрана, куда пришли с другого: стрелка возврата слева, <code>Report</code> справа — единственная кнопка шапки со словом.')}
</div>
</body>
</html>
`;

writeFileSync(join(OUT, 'shell.html'), shell, 'utf8');

// ═══════════════════════════ kit.html ═══════════════════════════

const cs = (name, cls, body, note = '', screens = false) => `  <section class="kit-case">
    <p class="kit-h"><b>${name}</b><code>${cls}</code></p>
    <div class="kit-live${screens ? ' kit-live--screens' : ''}">
${body}
    </div>${note ? `\n    <p class="kit-note">${note}</p>` : ''}
  </section>`;

const grp = (n, title, lead, cases) => `<section class="kit-grp" id="g${n}">
  <h2 class="kit-grp-h"><span class="kit-n">${n}</span>${title}</h2>
  <p class="kit-lead">${lead}</p>
${cases.join('\n')}
</section>`;

const evCard = (title, when, where, spots, acts, pic = 'games') => `        <ul class="mm-list">
          <li class="mm-event">
            <span class="mm-cover" aria-hidden="true">${cover(pic)}</span>
            <span class="mm-event-body">
              <a class="mm-event-head" href="#"><b>${title}</b><span class="mm-meta">${when}</span></a>
              <span class="mm-facts">${where}</span>
              <span class="mm-facts">${spots} &middot; <span class="mm-verified">${I.verified}Verified</span></span>
            </span>
            <span class="mm-event-acts">${acts}</span>
          </li>
        </ul>`;

const person = (blur) => `      <article class="mm-person">
        <figure>
          <p class="mm-photo${blur ? ' mm-photo--blur' : ''}"><img src="img/olena-720.jpg" alt="" loading="lazy"></p>
          <figcaption class="mm-vh">Photo 1 of 4</figcaption>
          <p class="mm-pager" aria-hidden="true"><span class="is-current"></span><span></span><span></span><span></span></p>
          <p class="mm-cardtop"><span class="mm-chip">${ico('pin')}~2 km</span></p>
        </figure>
        <section class="mm-person-body" aria-label="Olena, 26">
          <p class="mm-common">3 common interests</p>
          <ul class="mm-tags"><li>Hiking</li><li>Board games</li><li>Coffee</li></ul>
          <h3 class="mm-person-name">Olena, 26</h3>
          <ul class="mm-signals">
            <li><span class="mm-verified">${I.verified}Verified</span></li>
            <li>6 meetups attended</li>
            <li>Replies quickly</li>
          </ul>
        </section>
        <a class="mm-cardlink" href="#" aria-label="Olena, 26 — open profile"></a>
      </article>`;

const state = (icon, h, p, acts, alert) => `      <div class="kit-tall">
        <article class="mm-state${alert ? ' mm-state--alert' : ''}"${alert ? ' role="alert"' : ''}>
          ${ico(icon, 'mm-state-ico')}
          <h3>${h}</h3>
          <p>${p}</p>
        </article>
${acts ? `        <p class="mm-actions kit-after">${acts}</p>\n` : ''}      </div>`;

const kit = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Витрина компонентов · MeetMates UI kit</title>
<!--
  ВИТРИНА. Каждый компонент из ui/inventory.md — живой, со своими состояниями.
  Текст везде настоящий, из интерфейса: компонент проверяется на той строке,
  которую он понесёт, а не на «Lorem ipsum».

  Чего здесь нет: каркаса вайрфреймов (.wf-*, рамка .device, полоса состояний)
  и ни одного инлайнового стиля. Обвязка самой витрины — классы .kit-*,
  они к продукту не относятся и в ui/kit.css их нет.

  Сгенерировано scripts/build-kit-pages.mjs — руками не править.
  Порядок разделов — роли из ui/inventory.md.
-->
${FONT}
<link rel="stylesheet" href="kit.css">
<style>
  /* обвязка витрины: к продукту не относится */
  :root { --page: #EFEFF2; --edge: #DCD6E4; --dim: #4C3F59; }
  body { margin: 0; background: var(--page); }
  .kit-top { padding: 40px 32px 28px 80px; }
  .kit-top h1 { margin: 0 0 6px; font-size: 28px; letter-spacing: -.03em; }
  .kit-top p { margin: 0 0 6px; max-width: 76ch; font-size: 14px; line-height: 1.55; color: var(--dim); }
  .kit-toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 0; padding: 0; list-style: none; }
  .kit-toc a { padding: 6px 12px; border-radius: 999px; background: #fff; box-shadow: 0 0 0 1px var(--edge);
    font-size: 12px; font-weight: 600; text-decoration: none; color: #1A1026; }
  .kit-grp { padding: 28px 32px 8px 80px; }
  .kit-grp-h { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-size: 20px; letter-spacing: -.02em; }
  .kit-n { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 999px;
    background: #1A1026; color: #fff; font-size: 12px; font-weight: 700; }
  .kit-lead { margin: 0 0 20px; max-width: 76ch; font-size: 14px; line-height: 1.55; color: var(--dim); }
  .kit-case { margin: 0 0 20px; }
  .kit-h { display: flex; align-items: baseline; gap: 10px; margin: 0 0 8px; font-size: 14px; }
  .kit-h code { font: 12px/1 ui-monospace, monospace; padding: 4px 8px; border-radius: 999px;
    background: #fff; box-shadow: 0 0 0 1px var(--edge); color: var(--dim); }
  .kit-note { margin: 8px 0 0; max-width: 90ch; font-size: 12px; line-height: 1.5; color: var(--dim); }
  /* площадка: фон тот же, что у экрана, — белая карточка видна так, как лежит */
  .kit-live { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start;
    max-width: 844px; padding: 16px; border-radius: 26px;
    background-color: #fff; background-image: var(--mm-bg-wash); background-size: 100% 844px;
    box-shadow: 0 0 0 1px var(--edge); }
  .kit-live > * { flex: 1 1 358px; min-width: 0; max-width: 390px; }
  .kit-live--screens { display: flex; gap: 32px; padding: 0; background: none; box-shadow: none; }
  .kit-live--screens > * { flex: none; max-width: none; }
  .kit-live--screens .mm-screen { border-radius: 26px; box-shadow: 0 0 0 1px var(--edge), 0 8px 28px rgba(17, 17, 17, .1); }
  /* высоту растягивающимся компонентам задаёт витрина, а не компонент */
  .kit-tall { height: 320px; display: flex; flex-direction: column; }
  .kit-card { height: 400px; }
  .kit-radar { height: 460px; display: flex; }
  .kit-layer { height: 420px; display: flex; flex-direction: column; }
  .kit-shot { height: 360px; display: flex; flex-direction: column; }
  .kit-shot .mm-person { height: auto; flex: 1; }
  .kit-row { flex: none; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .kit-narrow { flex: none; width: 200px; }
  .kit-shell { flex: none; width: 390px; }
  .kit-after { margin-top: 12px; }
  .kit-stack > * + * { margin-top: 12px; }
  code { font-family: ui-monospace, monospace; font-size: 12px; }
  /* полоса разделов проекта: та же, что на макетах и экранах концепта */
  .wfrail { position: fixed; top: 32px; left: 16px; display: flex; flex-direction: column; align-items: center;
    gap: 2px; font: 12px/1.4 var(--mm-font); }
  .wfrail a { display: block; min-width: 32px; padding: 6px 8px; border-radius: 14px; color: #4C3F59;
    text-decoration: none; text-align: center; font-variant-numeric: tabular-nums; }
  .wfrail a:hover { background: #E8E1F1; color: #1A1026; }
  .wfrail .home { margin-bottom: 16px; font-weight: 700; letter-spacing: .04em; color: #1A1026; }
  .wfrail .now { background: #E8E1F1; color: #1A1026; font-weight: 700; }
  @media (max-width: 1000px) {
    .wfrail { position: static; flex-direction: row; flex-wrap: wrap; margin: 0 0 16px; }
    .kit-top, .kit-grp { padding-left: 32px; }
  }
  /* на телефоне: поля экрана 16px, а ряд мокапов едет вбок внутри себя,
     а не тянет вбок всю страницу — мокап шириной 390px иначе не помещается */
  @media (max-width: 560px) {
    .kit-top, .kit-grp { padding-left: 16px; padding-right: 16px; }
    .kit-live { padding: 12px; }
    .kit-live > * { flex: 1 1 100%; max-width: 100%; }
    .kit-live--screens { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 8px; }
    .kit-shell, .kit-narrow { width: 100%; }
  }
</style>
</head>
<body class="mm">
${rail({ prefix: '../', current: '07' })}

<div class="kit-top">
  <h1>Витрина компонентов</h1>
  <p>Один файл стилей — <code>ui/kit.css</code>: переменные в <code>:root</code> и классы
  компонентов, без второго уровня токенов. Оболочка как разметка — <code>ui/shell.html</code>.
  Состав и порог «два экрана» — <code>ui/inventory.md</code>, вид — <code>DESIGN.md</code>.</p>
  <p>Текст у каждого компонента настоящий, из интерфейса. Фон площадки — тот же,
  что у экрана: белая карточка проверяется на том, на чём лежит.</p>
  <ul class="kit-toc">
    <li><a href="#g1">1 · Оболочка</a></li>
    <li><a href="#g2">2 · Навигация</a></li>
    <li><a href="#g3">3 · Карточки и списки</a></li>
    <li><a href="#g4">4 · Формы</a></li>
    <li><a href="#g5">5 · Обратная связь</a></li>
    <li><a href="#g6">6 · Чат</a></li>
    <li><a href="#g7">7 · Онбординг</a></li>
  </ul>
</div>

${grp(1, 'Оболочка', 'Экран целиком: шапка, содержимое, нижнее меню. Разметка — <code>ui/shell.html</code>, оттуда её берёт экран, у которого ещё нет каркаса.', [
  cs('Экран', '.mm-screen · .mm-head · .mm-app · .mm-tabs', `      <div class="mm-screen">
        ${headPlain}
        <main class="mm-app">
          <div class="mm-pane">
            <p class="mm-segmented">
              <a class="mm-btn is-current" href="#">Nearby</a>
              <a class="mm-btn" href="#">Mine</a>
            </p>
${evCard('Board games', 'Sat 18:00', 'Kyiv Games Club &middot; Podil &middot; ~3 km', '2 going &middot; 1 spot left', '<a class="mm-btn mm-btn--primary" href="#">Ask to join</a>')}
            <a class="mm-exit" href="#"><span>See people</span><span aria-hidden="true">&rarr;</span></a>
          </div>
        </main>
        ${tabs('Events')}
      </div>
      <div class="mm-screen">
        ${headStack}
        <main class="mm-app">
          <div class="mm-pane">
            <h2 class="mm-h2">Events</h2>
${evCard('Coffee and a walk in Podil', 'Sun 11:00', 'Podil &middot; ~2 km', '1 spot left &middot; Women only', '<a class="mm-btn mm-btn--primary" href="#">Ask to join</a>', 'coffee')}
            <h2 class="mm-h2">People</h2>
            <ul class="mm-list">
              <li><a class="mm-row" href="#">
                <span class="mm-row-head"><b>Olena, 26</b><span class="mm-meta">~2 km</span></span>
                <span class="mm-facts">3 common interests &middot; Board games</span>
              </a></li>
            </ul>
          </div>
        </main>
        ${tabs('Search')}
      </div>
      <div class="mm-screen">
        ${headBack}
        <main class="mm-app">
          <div class="mm-pane">
            <section class="mm-scrolly">
              <h2 class="mm-vh">Chat with Olena</h2>
              <div class="mm-msgs">
                <p class="mm-bubble">Hi! Saw you&rsquo;re into board games too<span class="mm-bubble-time">Olena &middot; 19:04</span></p>
                <p class="mm-bubble mm-bubble--mine">Yes &mdash; there&rsquo;s a game caf&eacute; on Podil I keep meaning to try<span class="mm-bubble-time">19:06 &middot; Read</span></p>
                <p class="mm-bubble">Let&rsquo;s go then. Which day works for you?<span class="mm-bubble-time">Olena &middot; 19:08</span></p>
              </div>
            </section>
            <p class="mm-actions">
              <a class="mm-btn mm-btn--primary" href="#">Suggest a day</a>
              <a class="mm-btn mm-btn--quiet" href="#">Invite together</a>
            </p>
          </div>
          <section class="mm-pin">
            <h2 class="mm-vh">Message</h2>
            <label class="mm-field" for="msg0">
              ${ico('message')}
              <span class="mm-vh">Message</span>
              <input id="msg0" type="text" placeholder="Write a message">
            </label>
          </section>
        </main>
        ${tabs('Chats')}
      </div>
      <div class="mm-screen">
        <header class="mm-head">
          <h1 class="mm-head-title">People nearby</h1>
          <button class="mm-head-btn" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>
        </header>
        <main class="mm-app">
          <div class="mm-pane">
            <section class="mm-stretch">
${person(false)}
            </section>
            <p class="mm-actions">
              <a class="mm-btn" href="#">Skip</a>
              <a class="mm-btn mm-btn--primary" href="#">Like</a>
            </p>
            <a class="mm-exit" href="#"><span>Look at events</span><span aria-hidden="true">&rarr;</span></a>
          </div>
        </main>
        ${tabs('People')}
      </div>`, 'Активная вкладка одна, на сиренево-серой пилюле, иконка залитая и тёмная; неактивные — контурные, цвета <code>--mm-ink-400</code>. Горизонтальные поля задаёт <code>.mm-app</code>: закреплённая полоса и секции своих не имеют, иначе они встают на 32px от края вместо 16px. Третий экран показывает две вещи, которых не видно на остальных: прокручиваемую секцию <code>.mm-scrolly</code> (реплики едут, кнопки и поле стоят) и закреплённую полосу <code>.mm-pin</code> — она лежит внутри <code>.mm-app</code>, но вне <code>.mm-pane</code>, поэтому прокрутка её не трогает. Четвёртый — колода: <code>.mm-stretch</code> отдаёт карточке человека весь остаток высоты, поэтому решение <code>Skip</code> / <code>Like</code> и выход всегда стоят на своих местах, какой бы длины ни оказалась подпись.', true),
])}

${grp(2, 'Навигация', 'Шапка, кнопки в ней, нижнее меню и выход в соседний контур. Выход — то, чем закрывается тупик (правило 10): он стоит на десяти экранах из тринадцати, а не только в пустом состоянии.', [
  cs('Кнопка в шапке', '.mm-head-btn', `      <p class="kit-row">
        <button class="mm-head-btn" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>
        <button class="mm-head-btn mm-head-btn--primary" type="button" aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>
        <a class="mm-head-btn mm-head-btn--back" href="#" aria-label="Back to events"><span aria-hidden="true">&larr;</span></a>
        <button class="mm-head-btn mm-head-btn--report" type="button">${ico('report')}Report</button>
      </p>`, 'Четыре назначения: <code>Filters</code>, <code>Post</code>, возврат, <code>Report</code>. У первых трёх подпись скрыта для скринридера — смысл берётся из места. У <code>Report</code> слово стоит: флажок сам по себе не читается, а угадывать действие безопасности нельзя. Полное имя <code>Post an event</code> живёт в <code>aria-label</code> (<code>D-60</code>).'),
  cs('Нижнее меню', '.mm-tabs · .mm-tab.is-current', `      <div class="kit-shell">${tabs('Chats')}</div>`, 'Пять вкладок на 390px — по 78px на каждую: подписи короткие, иконка обязательна. Панель показана в полную ширину экрана: её поля (16px по краям) — часть компонента, панель не на всю ширину экрана, а на ширину содержимого.'),
  cs('Выход в соседний контур', '.mm-exit', `      <a class="mm-exit" href="#"><span>Look at events</span><span aria-hidden="true">&rarr;</span></a>
      <a class="mm-exit" href="#"><span>See people</span><span aria-hidden="true">&rarr;</span></a>`, 'Два имени, и других нет: <code>nearby</code> в кнопке не пишется — расстояние решения не принимает, а выборку называет заголовок экрана (правило 6). Это не решение по экрану, поэтому карточка со стрелкой, а не кнопка.'),
  cs('Срез вкладки', '.mm-segmented', `      <p class="mm-segmented">
        <a class="mm-btn is-current" href="#">Nearby</a>
        <a class="mm-btn" href="#">Mine</a>
      </p>`, 'Сегменты стоят вплотную на дорожке: это один орган, а не две главные кнопки рядом. Срез местный, не с сервера, — поэтому он есть во всех состояниях экрана, включая загрузку: появись он после неё, сдвинул бы всё под пальцем.'),
])}

${grp(3, 'Карточки и списки', 'Карточка события, строка списка, карточка человека, аватар и строки фактов. Фотография у события обязательна (<code>D-56</code>): без неё карточки не существует, поэтому состояния «карточка без обложки» в ките нет.', [
  cs('Карточка события', '.mm-event', `      <div>
${evCard('Board games', 'Sat 18:00', 'Kyiv Games Club &middot; Podil &middot; ~3 km', '2 going &middot; 1 spot left', '<a class="mm-btn mm-btn--primary" href="#">Ask to join</a>')}
      </div>
      <div>
${evCard('Morning run along the embankment', 'No date yet', 'Podil &middot; ~1 km', '1 going &middot; 2 spots left', '<a class="mm-btn mm-btn--primary" href="#">Ask to join</a><a class="mm-btn mm-btn--quiet" href="#">Invite</a>', 'run')}
      </div>`, 'Три уровня чтения (<code>D-55</code>…<code>D-58</code>): что и когда · где и далеко ли · сколько мест и <code>Verified</code>. Действие стоит на самой карточке — открывать событие ради того же действия не нужно (<code>D-54</code>). Где мест два и больше, появляется второе: <code>Invite</code> — так сокращается <code>Invite together</code>, когда полное имя не помещается (<code>D-60</code>). Фото и имени автора в превью нет: строка про занятие. Датированные и бессрочные — в одной ленте.'),
  cs('Строка списка', '.mm-row', `      <ul class="mm-list">
        <li><a class="mm-row" href="#">
          <span class="mm-row-head"><b>Olena</b><span class="mm-meta">19:08 &middot; 1 new</span></span>
          <span class="mm-facts"><span class="mm-avatar" aria-hidden="true">${face('olena')}</span>Let&rsquo;s go then. Which day works for you?</span>
        </a></li>
        <li><a class="mm-row" href="#">
          <span class="mm-row-head"><b>Board games</b><span class="mm-meta">Mon</span></span>
          <span class="mm-facts">Event chat &middot; 3 people &middot; Andrii: see you at six</span>
        </a></li>
        <li><a class="mm-row" href="#">
          <span class="mm-row-head"><b>Maryna</b><span class="mm-meta">12 Jun</span></span>
          <span class="mm-facts"><span class="mm-avatar" aria-hidden="true">${face('dasha')}</span>You both said yes &mdash; no messages yet</span>
        </a></li>
      </ul>
      <ul class="mm-list">
        <li><a class="mm-row" href="#"><span class="mm-row-head"><b>My events</b><span class="mm-meta">1 request</span></span></a></li>
        <li><a class="mm-row" href="#"><span class="mm-row-head"><b>My matches</b><span class="mm-meta">3 new</span></span></a></li>
        <li><a class="mm-row" href="#"><span class="mm-row-head"><b>Verification</b><span class="mm-meta">Verified</span></span></a></li>
        <li class="mm-row"><span class="mm-row-head"><b>Location</b><span class="mm-meta">On &middot; rounded</span></span></li>
        <li class="mm-row"><span class="mm-row-head"><b>Blocked people</b><span class="mm-meta">None</span></span></li>
      </ul>`, 'Одна и та же строка несёт чат, событие и строку глубокого слоя. Строка-ссылка подчёркивает заголовок на наведении; строка без ссылки — та, за которой экрана ещё нет, и подчёркивания у неё нет. Время, счётчик непрочитанных и состояние настройки — один и тот же <code>.mm-meta</code> справа.'),
  cs('Карточка человека', '.mm-person', `      <div class="kit-card">${person(false)}</div>
      <div class="kit-card">${person(true)}</div>`, 'Порядок чтения задан и не произволен (<code>D-13</code>): общие интересы → имя и возраст → сигналы доверия → расстояние. Свайп в дружбе делается по совпадению, а не по внешности, поэтому число общих идёт первой строкой. Расстояние — единственное, что лежит поверх фотографии (§7.1). Справа: фото дошло не целиком — заблюренное, становится чётким по мере прихода (<code>D-51</code>); экран при этом рабочий, <code>Skip</code> и <code>Like</code> живые.'),
  cs('Отметка проверки и сигналы доверия', '.mm-verified · .mm-signals', `      <div class="kit-stack">
        <ul class="mm-signals">
          <li><span class="mm-verified">${I.verified}Verified</span></li>
          <li>12 meetups attended</li>
          <li>Replies quickly</li>
        </ul>
        <ul class="mm-signals">
          <li><span class="mm-verified">${I.verified}Verified</span></li>
          <li>Usually replies within a day</li>
        </ul>
        <p class="mm-facts">Andrii &middot; <span class="mm-verified">${I.verified}Verified</span> &middot; 12 meetups attended</p>
      </div>`, 'Нуля в продукте не бывает (<code>D-60</code>): у кого встреч нет, строка не показывается вовсе — то же правило, что у отзывчивости («нет данных — нет бейджа»). Второй пример — человек без подтверждённых встреч. Ступеней профиля не существует (<code>D-49</code>), бейджа присутствия не делаем нигде (<code>D-06</code>). Лейба одна и та же в строке сигналов и в строке фактов — это и был сведённый дрейф.'),
  cs('Аватар, чип расстояния, теги', '.mm-avatar · .mm-chip · .mm-tags', `      <p class="kit-row">
        <span class="mm-avatar" aria-hidden="true">${face('andrii')}</span>
        <span class="mm-avatar" aria-hidden="true">${face('olena')}</span>
        <span class="mm-avatar mm-avatar--lg" aria-hidden="true">${face('dasha', 112)}</span>
        <span class="mm-chip">${ico('pin')}~2 km</span>
        <span class="mm-chip">${ico('pin')}Nearby</span>
      </p>
      <ul class="mm-tags">
        <li>Hiking</li><li>Board games</li><li>Coffee</li><li>Running</li>
      </ul>`, 'У каждого имени своё лицо: три одинаковых кружка в одной строке читаются как ошибка данных. Расстояние округлённое и без слова <code>away</code> (<code>D-60</code>), меньше километра — <code>Nearby</code>; точки на карте нет нигде и никогда (правило 5).'),
  cs('Обложка на карточке события', '.mm-evcover', `      <figure class="mm-evcover">
        <p class="mm-photo">${cover('games')}</p>
        <p class="mm-pager" aria-hidden="true"><span class="is-current"></span><span></span><span></span></p>
      </figure>
      <div class="kit-stack">
        <p class="mm-distance">Kyiv &middot; distance is always rounded for others</p>
        <p class="mm-facts"><span class="mm-avatar" aria-hidden="true">${face('andrii')}</span>Andrii &middot; 12 meetups attended &middot; Replies quickly</p>
        <p class="mm-note">Bringing Codenames and Wingspan. Anyone who knows the rules or wants to learn.</p>
      </div>`, 'На карточке события обложка идёт первой и во всю ширину, с полосами по числу фотографий; в превью ленты она же стоит слева во всю высоту строки, 104px. Это один снимок в двух местах, а не два компонента. Справа — строки, которые ходят с ней рядом: город без точных координат (§7.1), автор целиком и описание от первого лица.'),
  cs('Полосы по числу фотографий', '.mm-pager', `      <div class="kit-narrow kit-stack">
        <p class="mm-pager" aria-hidden="true"><span class="is-current"></span><span></span><span></span><span></span></p>
        <p class="mm-pager" aria-hidden="true"><span></span><span class="is-current"></span><span></span></p>
      </div>`, 'Столько полос, сколько фотографий, закрашенная — открытая. Счёт нужен и на слух, поэтому рядом стоит скрытый <code>figcaption</code>: «Photo 1 of 4».'),
])}

${grp(4, 'Формы', 'Кнопки, строка действий, поле. Полей ввода в наборе ровно два вида на двух экранах — поиск и реплика: экраны создания, фильтров и редактирования в вайрфреймы ещё не вошли, а вместе с ними не вошли и формы.', [
  cs('Кнопка', '.mm-btn', `      <p class="kit-row">
        <a class="mm-btn mm-btn--primary" href="#">Ask to join</a>
        <a class="mm-btn mm-btn--quiet" href="#">Invite together</a>
        <a class="mm-btn" href="#">Skip</a>
        <button class="mm-btn" type="button" disabled>Verify to send</button>
      </p>`, 'Главная на экране одна, тёмно-фиолетовая. Тихая — сиреневая. Без роли — ровная белая: это <code>Skip</code> рядом с залитым <code>Like</code>. Недоступная говорит, что сделать (гейт §7.3), а не «disabled». Имя кнопки — глагол, из которого виден результат: <code>Join</code>, <code>Explore</code>, <code>Create</code> не пишем.'),
  cs('Строка действий', '.mm-actions', `      <div class="kit-stack">
        <p class="mm-actions">
          <a class="mm-btn mm-btn--primary" href="#">Expand search</a>
          <a class="mm-btn mm-btn--quiet" href="#">Reset filters</a>
        </p>
        <p class="mm-actions">
          <a class="mm-btn mm-btn--primary mm-btn--block" href="#">Try again</a>
        </p>
      </div>`, 'Одна-две кнопки в ряд, поровну. Больше двух в наборе не встречается ни на одном экране.'),
  cs('Поле с иконкой', '.mm-field', `      <div class="kit-stack">
        <form class="mm-field" role="search">
          ${ico('search')}
          <label class="mm-vh" for="q2">Search people and events</label>
          <input id="q2" type="search" value="board games">
        </form>
        <label class="mm-field" for="msg">
          ${ico('message')}
          <span class="mm-vh">Message</span>
          <input id="msg" type="text" placeholder="Write a message">
        </label>
      </div>`, 'Иконка в поле контурная: поле ничего не утверждает, оно ждёт ввода. Подпись у обоих скрытая — <code>Search people and events</code> и <code>Message</code>: это такой же копирайт, он входит в перепись. На фокусе — обводка цветом действия.'),
  cs('Опасное действие', '.mm-danger-link', `      <p class="kit-row">
        <button class="mm-danger-link" type="button">${ico('report')}Report this person</button>
      </p>`, 'Не заливка, а строка с иконкой, отбитая от остального: <code>--mm-danger</code> в продукте носят только <code>Report</code> и <code>Block</code>. С любого экрана, где виден другой человек, до них один тап (правило 4).'),
])}

${grp(5, 'Обратная связь', 'Четыре состояния, и ни одно из них не экран: пусто, сбой, итог и загрузка — состояния одного и того же экрана. Ожидание чужого решения загрузкой не считается (<code>D-42</code>): ждать можно днями, и спиннер здесь врёт.', [
  cs('Пусто', '.mm-state', `${state('state-empty', 'No events within 5 km yet', 'Events here are posted by people like you &mdash; and yours would be the first one nearby.', '<a class="mm-btn mm-btn--quiet" href="#">Show events further out</a>', false)}
${state('state-empty', 'You are all caught up', 'That&rsquo;s everyone within 5 km who matches your filters.', '<a class="mm-btn mm-btn--primary" href="#">Expand search</a><a class="mm-btn mm-btn--quiet" href="#">Reset filters</a>', false)}`, 'Ни одно пустое состояние не выглядит пустым (§2.1, п. 1): у каждого есть ослабление условий и выход в соседний контур. Про одиночество не говорим — правило 13: кончился список, а не «ты одна». Блок занимает ту же площадь, что не пришедшее содержимое: это тот же экран.'),
  cs('Сбой и пустой чат', '.mm-state--alert', `${state('state-alert', 'Couldn&rsquo;t load events nearby', 'The connection dropped. Your own events and requests are safe.', '<a class="mm-btn mm-btn--primary" href="#">Try again</a>', true)}
${state('state-chats', 'No chats yet', 'Chats open when you and someone both say yes &mdash; or when you ask to join an event and the person confirms you.', '<a class="mm-btn mm-btn--primary" href="#">See people</a><a class="mm-btn mm-btn--quiet" href="#">Look at events</a>', false)}`, 'Тот же блок, что «пусто», — разница в <code>role="alert"</code> и в цвете иконки. Текст называет причину и говорит, что данные целы: «something went wrong» не пишем. Красным здесь только иконка — один признак на одну роль.'),
  cs('Плашка итога', '.mm-banner', `      <article class="mm-banner">
        <b>It&rsquo;s an event</b>
        <p>Board games at Kyiv Games Club &middot; Saturday, 18:00 &middot; the two of you.</p>
        <p class="mm-actions"><a class="mm-btn mm-btn--primary" href="#">Open the event</a></p>
      </article>
      <div class="kit-stack">
        <article class="mm-banner">
          <b>Waiting for Andrii</b>
          <p>Your request is with Andrii. It stays open until Saturday &mdash; events without a date keep requests for 14 days.</p>
        </article>
        <article class="mm-banner">
          <b>You&rsquo;re going</b>
          <p>Andrii confirmed you. The chat is open and the exact address is now visible.</p>
        </article>
      </div>`, 'Карточка, а не абзац: день назначен — это новый объект, а не ещё одна реплика (<code>D-39</code>). Справа — ожидание чужого решения: названы тот, кто должен ответить, и срок, а третье («что можно сделать вместо») стоит кнопками под плашкой (<code>D-42</code>).'),
  cs('Скелет загрузки', '.mm-skel', `      <ul class="mm-list">
        <li class="mm-row" aria-hidden="true">
          <span class="mm-skel mm-skel--line mm-skel--w-l"></span>
          <span class="mm-skel mm-skel--line mm-skel--w-m"></span>
          <span class="mm-skel mm-skel--line mm-skel--w-s"></span>
        </li>
        <li class="mm-row" aria-hidden="true">
          <span class="mm-skel mm-skel--line mm-skel--w-m"></span>
          <span class="mm-skel mm-skel--line mm-skel--w-s"></span>
          <span class="mm-skel mm-skel--line mm-skel--w-m"></span>
        </li>
      </ul>
      <div class="kit-stack">
        <p class="mm-note" role="status">Looking for events near you</p>
        <p class="mm-skelrow">
          <span class="mm-avatar mm-avatar--lg mm-skel"></span>
          <span class="mm-skel mm-skel--pill mm-skel--w-s"></span>
          <span class="mm-skel mm-skel--pill mm-skel--w-m"></span>
        </p>
      </div>`, 'Заглушки той же длины и в том же порядке, что в пришедшей карточке: приход данных ничего не сдвинет. Спиннер не держит раскладку и не говорит, что грузится. При <code>prefers-reduced-motion</code> полоса стоит на месте. Рядом — строка <code>role="status"</code>: что именно ищем.'),
  cs('Примечание и счётчик', '.mm-note', `      <div class="kit-stack">
        <output class="mm-note">2 going &middot; 1 spot left &middot; Still going? comes the day before</output>
        <p class="mm-note">1 confirmed &middot; 1 spot left</p>
        <p class="mm-note">No spots left</p>
        <p class="mm-note">2 going &middot; 1 spot left &middot; your request doesn&rsquo;t take a spot yet</p>
      </div>`, 'Счётчик двухфазный (<code>D-16</code>): <code>going</code> → <code>confirmed</code>. Слово рядом с числом несёт честность — в каждой фазе показано ровно то, что известно. Заполненное событие пишется словом, а не нулём (<code>D-60</code>). Мест не прибавляется: уменьшить <code>spots left</code> может только явное <code>Can&rsquo;t make it</code>.'),
])}

${grp(6, 'Чат', 'По порогу «два экрана» переписка — разовое: она стоит только на экране Диалог, пусть и на пяти его состояниях. В кит она всё же входит: без пузыря чат нечем собрать, а экран этот — основная дорога к встрече (<code>D-37</code>).', [
  cs('Реплики', '.mm-bubble', `      <div class="mm-msgs">
        <p class="mm-bubble">Hi! Saw you&rsquo;re into board games too<span class="mm-bubble-time">Olena &middot; 19:04</span></p>
        <p class="mm-bubble mm-bubble--mine">Yes &mdash; there&rsquo;s a game caf&eacute; on Podil I keep meaning to try<span class="mm-bubble-time">19:06 &middot; Read</span></p>
        <p class="mm-bubble">Let&rsquo;s go then. Which day works for you?<span class="mm-bubble-time">Olena &middot; 19:08</span></p>
        <a class="mm-bubble mm-bubble--failed" href="#" role="alert" aria-label="Message not sent. Tap to try again">Saturday works &mdash; the caf&eacute; opens at six<span class="mm-bubble-retry" aria-hidden="true">${I.retry}</span><span class="mm-bubble-time">Not sent &middot; tap to try again</span></a>
      </div>`, 'Своя реплика — не действие, поэтому и не цвет действия: сиреневый тон, а отличают её сторона и отсутствие обводки. Не ушло — состояние реплики, а не экрана (<code>D-52</code>): помечен сам пузырь, нажатие повторяет отправку, отдельного блока об ошибке в диалоге нет. Подчёркивания нет — подчёркнутый текст читался бы как ошибка вёрстки; подпись и иконка чернилами, красное несёт подложка.'),
  cs('Подсказки в пустом чате', '.mm-hints', `      <p class="mm-hints">
        <a class="mm-btn" href="#">What got you into board games?</a>
        <a class="mm-btn" href="#">Know a good spot on Podil?</a>
        <a class="mm-btn" href="#">Free this weekend?</a>
      </p>`, 'Это предложенные фразы, а не второе действие: столбиком, белые, текст слева, вес обычный. Рядом с главной кнопкой они не спорят.'),
])}

${grp(7, 'Онбординг и слои', 'Четыре компонента с экранов входа: обещание и радар на онбординге, слой совпадения поверх колоды, подпись на снимке в видоискателе. Все разовые — каждый стоит на одном экране, — но без них эти экраны не собрать.', [
  cs('Обещание', '.mm-promise', `      <p class="mm-promise">Meet <mark>mates</mark><br>Enjoy the <mark>events</mark></p>`, 'Лаймом залит контейнер, а не буквы: лаймовый текст на светлом фоне даёт 1,2:1, тёмный на лайме — 15:1. Строки идут просторнее обычного заголовка, иначе подложки двух слов сходятся краями. Белого текста на размытии нет нигде — там он даёт 1,8:1.'),
  cs('Радар', '.mm-radar · .mm-rings · .mm-pins · .mm-scan', `      <div class="kit-radar">
        <figure class="mm-radar">
          <span class="mm-scan" aria-hidden="true"></span>
          <p class="mm-rings" aria-hidden="true"><span class="r5"></span><span class="mid"></span><span class="r3"></span><span class="in"></span><span class="r1"></span></p>
          <p class="mm-band far">~5 km</p>
          <p class="mm-band mid">~2 km</p>
          <p class="mm-band near">Nearby</p>
          <ul class="mm-pins">
            <li class="a"><span class="mm-dot" aria-hidden="true">${face('olena', 112)}</span><span class="mm-vh">Person</span></li>
            <li class="d"><span class="mm-dot mm-dot--sm" aria-hidden="true">${cover('games')}</span><span class="mm-vh">Event</span></li>
            <li class="g"><span class="mm-dot" aria-hidden="true">${face('andrii', 112)}</span><span class="mm-vh">Person</span></li>
            <li class="j"><span class="mm-dot mm-dot--lg" aria-hidden="true">${face('dasha', 112)}</span><span class="mm-vh">Person</span></li>
            <li class="l"><span class="mm-dot mm-dot--sm" aria-hidden="true">${cover('run')}</span><span class="mm-vh">Event</span></li>
          </ul>
        </figure>
      </div>`, 'Кольца расстояний подписаны и стоят на месте; из центра идёт волна — это и есть «радар работает». На кольцах не точки, а те же лица и обложки, что в колоде и ленте: кто рядом — видно по снимку, а не по слову. Данные иллюстративные, живых людей экран не показывает (<code>D-47</code>). При <code>prefers-reduced-motion</code> волна снимается, найденные видны сразу.'),
  cs('Слой поверх экрана', '.mm-layer', `      <div class="kit-layer">
        <dialog open class="mm-layer">
          <section class="mm-stretch">
            <article class="mm-state">
              <p class="mm-skelrow" aria-hidden="true">
                <span class="mm-avatar" aria-hidden="true">${face('dasha')}</span>
                <span class="mm-avatar" aria-hidden="true">${face('olena')}</span>
              </p>
              <h1>You and Olena both said yes</h1>
              <p>You have 3 interests in common. The chat is open &mdash; Olena can write to you too.</p>
            </article>
          </section>
          <p class="mm-actions">
            <a class="mm-btn mm-btn--primary" href="#">Say hi</a>
            <a class="mm-btn mm-btn--quiet" href="#">See people</a>
          </p>
        </dialog>
      </div>`, 'Совпадение — не экран, а слой поверх колоды, поэтому <code>dialog</code>. У него <code>position: static</code>: браузер ставит <code>absolute</code>, и слой выходит из потока, переставая слушаться полей экрана. Два кружка рядом — в ряду заглушек они крупнее, чем подпись у имени.'),
  cs('Подпись на снимке', '.mm-photo-cap · .mm-skel--thumb', `      <div class="kit-shot">
        <article class="mm-person">
          <figure>
            <p class="mm-photo"><img src="img/dasha-112.jpg" alt="" loading="lazy"></p>
            <figcaption class="mm-photo-cap">Camera</figcaption>
          </figure>
          <section class="mm-person-body">
            <p class="mm-common">Turn your head slightly to the left</p>
            <p class="mm-distance">Face the light, no sunglasses, no filters.</p>
          </section>
        </article>
      </div>
      <p class="mm-skelrow">
        <span class="mm-skel mm-skel--thumb"></span>
        <span class="mm-skel mm-skel--thumb"></span>
        <span class="mm-skel mm-skel--thumb"></span>
      </p>`, 'Видоискатель верификации — та же карточка человека, что в колоде: вместо снимка кадр камеры, вместо фактов подсказка позы. Подпись лежит на самом снимке. Справа — миниатюры, которых ещё нет: место под фотографии профиля, пока они грузятся.'),
])}

<div class="kit-top">
  <p>Источники: окрашенные экраны <code>concept/screens/*.html</code> ·
  <code>DESIGN.md</code> · <code>ui/inventory.md</code> · <code>concept/concept.md</code> ·
  <code>microcopy.md</code> · <code>tokens/tokens.css</code>.</p>
</div>

</body>
</html>
`;

writeFileSync(join(OUT, 'kit.html'), kit, 'utf8');
console.log(`ui/kit.html: ${(kit.match(/class="kit-case"/g) || []).length} компонентов · ui/shell.html: три шапки и меню`);
