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
  // органы поля контурные: поле ничего не утверждает, оно ждёт ввода
  clear: svg('close-circle', LINEAR),
  eye: svg('eye', LINEAR),
  'eye-off': svg('eye-closed', LINEAR),
  chevron: svg('alt-arrow-down', LINEAR),
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
        <button class="mm-head-btn mm-head-btn--danger" type="button">${ico('report')}Report</button>
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
  /* ── Голый вид: адрес с #bare ───────────────────────────────────
     Та же причина, что на витрине: встроенной странице вторая полоса
     разделов не нужна, слева уже стоит дерево сайта. */
  body:has(#bare:target) .wfrail { display: none; }
  body:has(#bare:target) { padding-left: 32px; }
</style>
</head>
<body class="mm">
<i id="bare" hidden></i>
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

// ── витрина: матрица состояний ────────────────────────────────────────
// У каждого компонента нарисовано каждое состояние, которое у него есть,
// и у каждого есть имя: вариант-состояние, а где нужно — и вид содержимого
// («Primary-Default-Only icon»). Состояний, которых в ките нет, на витрине
// не появляется: придуманное состояние — это обещание, которого экран не держит.

// клетка матрицы: образец и его имя
const cell = (label, html, cls = '') => `      <figure class="kit-cell${cls ? ' ' + cls : ''}">
        <div class="kit-stage">${html}</div>
        <figcaption>${label}</figcaption>
      </figure>`;

// компонент: имя, классы и матрица его состояний
const comp = (name, cls, cells, note = '') => `  <section class="kit-case">
    <p class="kit-h"><b>${name}</b><code>${cls}</code></p>
    <div class="kit-matrix">
${cells.join('\n')}
    </div>${note ? `\n    <p class="kit-note">${note}</p>` : ''}
  </section>`;

const grp = (n, title, lead, cases) => `<section class="kit-grp" id="g${n}">
  <h2 class="kit-grp-h"><span class="kit-n">${n}</span>${title}</h2>
  <p class="kit-lead">${lead}</p>
${cases.join('\n')}
</section>`;

// ── заготовки, которые нужны в нескольких клетках ─────────────────────
const btn = (mod, state, text) => `<a class="mm-btn${mod}${state}" href="#">${text}</a>`;

const evCard = (acts, pic = 'games', head = 'Board games', when = '<b>26 Sep</b> &middot; 18:00', where = 'Kyiv Games Club &middot; Podil', spots = '2 going &middot; 1 spot left') =>
  `<ul class="mm-list">
          <li class="mm-event${acts.cardState || ''}">
            <span class="mm-cover">${cover(pic)}<span class="mm-cardtop"><span class="mm-chip">${ico('pin')}~3 km</span></span></span>
            <span class="mm-event-body">
              <a class="mm-event-head" href="#"><b>${head}</b><span class="mm-meta">${when}</span></a>
              <span class="mm-facts">${where}</span>
              <span class="mm-facts">${spots}</span>
            </span>
            <span class="mm-event-acts">${acts.html}</span>
          </li>
        </ul>`;

const person = (mod = '') => `<article class="mm-person">
          <figure>
            <p class="mm-photo${mod}"><img src="img/olena-720.jpg" alt="" loading="lazy"></p>
            <figcaption class="mm-vh">Photo 1 of 4</figcaption>
            <p class="mm-pager" aria-hidden="true"><span class="is-current"></span><span></span><span></span><span></span></p>
            <p class="mm-cardtop"><span class="mm-verified">${I.verified}Verified</span><span class="mm-chip">${ico('pin')}~2 km</span></p>
          </figure>
          <section class="mm-person-body" aria-label="Olena, 26">
            <p class="mm-common">3 common interests</p>
            <ul class="mm-tags"><li>Hiking</li><li>Board games</li><li>Coffee</li></ul>
            <h3 class="mm-subhead">Olena, 26</h3>
            <ul class="mm-signals">
              <li>6 meetups attended</li>
              <li>Replies quickly</li>
            </ul>
          </section>
          <a class="mm-cardlink" href="#" aria-label="Olena, 26 — open profile"></a>
        </article>`;

const screenState = (icon, h, p, acts, alert) => `<div class="kit-tall">
          <article class="mm-state${alert ? ' mm-state--alert' : ''}"${alert ? ' role="alert"' : ''}>
            ${ico(icon, 'mm-state-ico')}
            <h3>${h}</h3>
            <p>${p}</p>
          </article>
${acts ? `          <p class="mm-actions kit-after">${acts}</p>\n` : ''}        </div>`;

// Поле: вид задаёт содержимое, состояние — класс. Один помощник на все
// шесть видов, иначе матрица разошлась бы в шести местах.
let fid = 0;
const fld = ({ state = '', err = false, lead = '', tail = '', input, label, note = '', extra = '' }) => {
  const id = `f${++fid}`;
  return `<div class="kit-block">
          ${label ? `<label class="mm-label" for="${id}">${label}</label>` : ''}
          <div class="mm-field${extra}${err ? ' mm-field--error' : ''}${state}">${lead}${input(id)}${tail}</div>
          ${note}
        </div>`;
};

const noteOk = (t) => `<span class="mm-field-note">${t}</span>`;
const noteErr = (t) => `<span class="mm-field-note mm-field-note--error">${t}</span>`;

// однострочное: text, email, password — разметка одна, меняется type
const line = (type, ph, value = '', dis = false) => (id) =>
  `<input id="${id}" type="${type}" placeholder="${ph}"${value ? ` value="${value}"` : ''}${dis ? ' disabled' : ''}>`;

const area = (ph, value = '', dis = false) => (id) =>
  `<textarea id="${id}" placeholder="${ph}"${dis ? ' disabled' : ''}>${value}</textarea>`;

const eyeBtn = (off = false, dis = false) =>
  `<button class="mm-field-btn" type="button"${dis ? ' disabled' : ''}>${ico(off ? 'eye-off' : 'eye')}<span class="mm-vh">${off ? 'Hide' : 'Show'} password</span></button>`;

// дата рождения: три поля в ряд, состояние у всех трёх одно
const dob = (state = '', err = false, d = '', m = '', y = '', dis = false, note = '') => {
  const one = (ph, v) => {
    const id = `f${++fid}`;
    return `<div class="mm-field${err ? ' mm-field--error' : ''}${state}"><input id="${id}" type="text" inputmode="numeric" placeholder="${ph}"${v ? ` value="${v}"` : ''}${dis ? ' disabled' : ''}><label class="mm-vh" for="${id}">${ph}</label></div>`;
  };
  return `<div class="kit-block">
          <span class="mm-label">Date of birth</span>
          <div class="mm-dates">${one('DD', d)}${one('MM', m)}${one('YYYY', y)}</div>
          ${note}
        </div>`;
};

// выпадающий список: то же поле, справа стрелка
const sel = (state = '', value = 'Anyone', menu = '', note = '') => `<div class="kit-block${menu ? ' kit-drop' : ''}">
          <span class="mm-label">Who can join</span>
          <div class="mm-field mm-select${state}"><span class="mm-select-value">${value}</span>${ico('chevron')}${menu}</div>
          ${note}
        </div>`;

const GROUPS = [
  grp(1, 'Кнопки', 'Три ступени иерархии — <b>главная</b>, <b>вторичная</b>, <b>третичная</b> — и у каждой четыре состояния: рабочее, наведение, нажатие и отключённая. Отключённая — та же кнопка в половину силы: роль остаётся видна, видно и то, что нажимать нечего. Опасное действие ступенью не считается: это та же третья сила, но своим цветом, и стоит оно рядом. Кнопка только с иконкой — та же кнопка, поэтому стоит второй строкой под своей ролью, а не отдельной группой: <code>Primary-Default-Only icon</code> идёт под <code>Primary-Default</code>. Отдельно стоит лишь то, у чего роли нет вовсе, — возврат. Растянутая на всю ширину — тоже та же кнопка, и отдельной клетки ей не нужно. Своего компонента нет и у строки действий <code>.mm-actions</code>: это раскладка, одна-две кнопки в ряд поровну, вида у неё никакого — её видно там, где она работает, в пустых состояниях и на плашке итога. Фокуса в матрице нет: он приходит от клавиатуры, а не от мыши, и рядом с наведением его не разглядывают — <code>:focus-visible</code> при этом остаётся в ките и обязателен.', [
    comp('Главная', '.mm-btn--primary · .mm-head-btn--primary', [
      cell('Primary-Default', btn(' mm-btn--primary', '', 'Ask to join')),
      cell('Primary-Hover', btn(' mm-btn--primary', ' is-hover', 'Ask to join')),
      cell('Primary-Pressed', btn(' mm-btn--primary', ' is-pressed', 'Ask to join')),
      cell('Primary-Disabled', '<button class="mm-btn mm-btn--primary" type="button" disabled>Verify to send</button>'),
      cell('Primary-Default-Only icon', `<button class="mm-head-btn mm-head-btn--primary" type="button" aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>`, 'kit-cell--nl'),
      cell('Primary-Hover-Only icon', `<button class="mm-head-btn mm-head-btn--primary is-hover" type="button" aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>`),
      cell('Primary-Pressed-Only icon', `<button class="mm-head-btn mm-head-btn--primary is-pressed" type="button" aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>`),
      cell('Primary-Disabled-Only icon', `<button class="mm-head-btn mm-head-btn--primary" type="button" disabled aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>`),
    ], 'Главная на экране одна. Отключённая — та же кнопка в половину силы: роль видно по-прежнему, видно и то, что она сейчас не работает. Надпись при этом говорит, что сделать: <code>Verify to send</code> — это гейт §7.3, и она называет условие. Вторая строка — та же роль в шапке, где места на слово нет: заливка та же, круг вместо пилюли, подпись уходит в <code>aria-label</code>. Состояния у неё те же четыре и стоят в тех же колонках.'),

    comp('Вторичная', '.mm-btn--quiet', [
      cell('Secondary-Default', btn(' mm-btn--quiet', '', 'Invite together')),
      cell('Secondary-Hover', btn(' mm-btn--quiet', ' is-hover', 'Invite together')),
      cell('Secondary-Pressed', btn(' mm-btn--quiet', ' is-pressed', 'Invite together')),
      cell('Secondary-Disabled', '<button class="mm-btn mm-btn--quiet" type="button" disabled>Invite together</button>'),
    ], 'Сиреневая подложка без обводки. Отключённая остаётся сиреневой — приглушается, но роли не теряет. Строки «только иконка» у неё нет: в шапке вторичная не встречается ни на одном экране.'),

    comp('Третичная', '.mm-btn · .mm-head-btn', [
      cell('Tertiary-Default', btn('', '', 'Skip')),
      cell('Tertiary-Hover', btn('', ' is-hover', 'Skip')),
      cell('Tertiary-Pressed', btn('', ' is-pressed', 'Skip')),
      cell('Tertiary-Disabled', '<button class="mm-btn" type="button" disabled>Skip</button>'),
      cell('Tertiary-Default-Only icon', `<button class="mm-head-btn" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>`, 'kit-cell--nl'),
      cell('Tertiary-Hover-Only icon', `<button class="mm-head-btn is-hover" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>`),
      cell('Tertiary-Pressed-Only icon', `<button class="mm-head-btn is-pressed" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>`),
      cell('Tertiary-Disabled-Only icon', `<button class="mm-head-btn" type="button" disabled>${ico('filters')}<span class="mm-vh">Filters</span></button>`),
    ], 'Ровная белая: это <code>Skip</code> рядом с залитым <code>Like</code>. Третья ступень иерархии — заливки нет, есть обводка и тень. Вторая строка — та же роль в шапке: белый кружок с тенью, подпись скрыта для скринридера, смысл берётся из места. Третья — подсказка в пустом чате: заливка, обводка и наведение те же, своё только выравнивание и вес, и по ним видно, что это предложенная фраза, а не кнопка рядом с главной. Отключённой подсказка не бывает: её либо предлагают, либо не показывают вовсе. Ширина состоянием не считается — на экране такая строка идёт во всю ширину, и площадка здесь показана широкой только затем, чтобы левый край надписи было видно.'),

    comp('Опасное действие', '.mm-danger-link · .mm-head-btn--danger', [
      cell('Danger-Default', `<button class="mm-danger-link" type="button">${ico('report')}Report or block</button>`),
      cell('Danger-Hover', `<button class="mm-danger-link is-hover" type="button">${ico('report')}Report or block</button>`),
      cell('Danger-Pressed', `<button class="mm-danger-link is-pressed" type="button">${ico('report')}Report or block</button>`),
      cell('Danger-Default-In header', `<button class="mm-head-btn mm-head-btn--danger" type="button">${ico('report')}Report</button>`, 'kit-cell--nl'),
      cell('Danger-Hover-In header', `<button class="mm-head-btn mm-head-btn--danger is-hover" type="button">${ico('report')}Report</button>`),
      cell('Danger-Pressed-In header', `<button class="mm-head-btn mm-head-btn--danger is-pressed" type="button">${ico('report')}Report</button>`),
    ], 'Названа по роли, а не по экрану: это не «кнопка Report», а опасное действие — туда же встанут <code>Block</code> и удаление, когда понадобятся. Не заливка, а строка с иконкой: <code>--mm-danger</code> в продукте носит только опасное. Вторая строка — она же в шапке: мельче и со словом, потому что флажок сам по себе не читается, а угадывать действие безопасности нельзя. Отключённой она не бывает нигде: пожаловаться можно всегда.'),

    comp('Без заливки', '.mm-head-btn--back', [
      cell('No filling-Default-Only icon', '<a class="mm-head-btn mm-head-btn--back" href="#" aria-label="Back to events"><span aria-hidden="true">&larr;</span></a>'),
      cell('No filling-Hover-Only icon', '<a class="mm-head-btn mm-head-btn--back is-hover" href="#" aria-label="Back to events"><span aria-hidden="true">&larr;</span></a>'),
      cell('No filling-Pressed-Only icon', '<a class="mm-head-btn mm-head-btn--back is-pressed" href="#" aria-label="Back to events"><span aria-hidden="true">&larr;</span></a>'),
    ], 'Возврат: стрелка без круга и без заливки. Роли взяться не из чего, поэтому на её месте в имени стоит <code>No filling</code>. Направление обязано читаться без цвета — отсюда и голая стрелка. Отключённой она не бывает: уйти с экрана можно всегда.'),
  ]),

  grp(2, 'Поля', 'Шесть видов, и состояний у каждого шесть: рабочее, наведение, ввод, заполненное, недоступное и «не приняло». Разметка у всех одна — <code>.mm-field</code> плюс то, что внутри; вид задаёт содержимое, а не отдельный компонент. Ввод здесь не кольцо от клавиатуры, а место, где стоит каретка: его видит каждый, кто печатает, поэтому из всех элементов фокус остался только у поля.', [
    comp('Текстовое', '.mm-field', [
      cell('Field-Default', fld({ label: 'Email', input: line('email', 'name@example.com') }), 'kit-cell--wide kit-cell--nl'),
      cell('Field-Hover', fld({ state: ' is-hover', label: 'Email', input: line('email', 'name@example.com') }), 'kit-cell--wide'),
      cell('Field-Focus', fld({ state: ' is-focus', label: 'Email', input: line('email', 'name@example.com') }), 'kit-cell--wide kit-cell--nl'),
      cell('Field-Filled', fld({ label: 'Email', input: line('email', 'name@example.com', 'dasha@example.com') }), 'kit-cell--wide'),
      cell('Field-Disabled', fld({ label: 'Email', input: line('email', 'name@example.com', '', true) }), 'kit-cell--wide kit-cell--nl'),
      cell('Field-Error', fld({ err: true, label: 'Email', input: line('email', 'name@example.com', 'dasha.example.com'), note: noteErr('This address is missing an @') }), 'kit-cell--wide'),
    ], 'Подпись видимая: в анкете человек заполняет несколько полей подряд, и по заполненному полю должно быть видно, что в нём лежит. Отказ не стирает введённое и называет причину — <code>This address is missing an @</code>, а не «неверный формат».'),

    comp('Поиск', '.mm-field', [
      cell('Search-Default', fld({ lead: ico('search'), input: line('search', 'Search people and events') }), 'kit-cell--wide kit-cell--nl'),
      cell('Search-Hover', fld({ state: ' is-hover', lead: ico('search'), input: line('search', 'Search people and events') }), 'kit-cell--wide'),
      cell('Search-Focus', fld({ state: ' is-focus', lead: ico('search'), input: line('search', 'Search people and events') }), 'kit-cell--wide kit-cell--nl'),
      cell('Search-Filled', fld({ lead: ico('search'), input: line('search', 'Search people and events', 'board games'), tail: `<button class="mm-field-btn" type="button">${ico('clear')}<span class="mm-vh">Clear</span></button>` }), 'kit-cell--wide'),
      cell('Search-Disabled', fld({ lead: ico('search'), input: line('search', 'Search people and events', '', true) }), 'kit-cell--wide kit-cell--nl'),
      cell('Search-Error', fld({ err: true, lead: ico('search'), input: line('search', 'Search people and events', 'board games'), note: noteErr('Couldn&rsquo;t search just now. Tap to try again') }), 'kit-cell--wide'),
    ], 'Подпись скрыта: поле стоит в шапке вкладки <code>Search</code>, и смысл берётся из места. Крестик появляется только с набранным — у пустого поля стирать нечего. Отказ здесь не про ввод, а про связь, поэтому строка под полем зовёт повторить.'),

    comp('Пароль', '.mm-field', [
      cell('Pass-Default', fld({ label: 'Password', input: line('password', 'At least 8 characters'), tail: eyeBtn() }), 'kit-cell--wide kit-cell--nl'),
      cell('Pass-Hover', fld({ state: ' is-hover', label: 'Password', input: line('password', 'At least 8 characters'), tail: eyeBtn() }), 'kit-cell--wide'),
      cell('Pass-Focus', fld({ state: ' is-focus', label: 'Password', input: line('password', 'At least 8 characters'), tail: eyeBtn() }), 'kit-cell--wide kit-cell--nl'),
      cell('Pass-Filled-Shown', fld({ label: 'Password', input: line('text', 'At least 8 characters', 'board games 2026'), tail: eyeBtn(true) }), 'kit-cell--wide'),
      cell('Pass-Disabled', fld({ label: 'Password', input: line('password', 'At least 8 characters', '', true), tail: eyeBtn(false, true) }), 'kit-cell--wide kit-cell--nl'),
      cell('Pass-Error', fld({ err: true, label: 'Password', input: line('password', 'At least 8 characters', 'board'), tail: eyeBtn(), note: noteErr('Use at least 8 characters') }), 'kit-cell--wide'),
    ], 'Требование стоит подсказкой поля до ввода, а не выскакивает отказом после: <code>At least 8 characters</code>. Глаз показывает набранное — вслепую пароль набирают с ошибкой чаще, чем его подглядывают. Шкалы силы в наборе нет: правила к паролю ещё не выбраны (§12), а полоса «weak / strong» без правила — обещание, которого экран не держит.'),

    comp('Многострочное', '.mm-field--multi', [
      cell('Multi-Default', fld({ extra: ' mm-field--multi', label: 'About you', input: area('What you&rsquo;d like to do with people here') }), 'kit-cell--wide kit-cell--nl'),
      cell('Multi-Hover', fld({ state: ' is-hover', extra: ' mm-field--multi', label: 'About you', input: area('What you&rsquo;d like to do with people here') }), 'kit-cell--wide'),
      cell('Multi-Focus', fld({ state: ' is-focus', extra: ' mm-field--multi', label: 'About you', input: area('What you&rsquo;d like to do with people here') }), 'kit-cell--wide kit-cell--nl'),
      cell('Multi-Filled', fld({ extra: ' mm-field--multi', label: 'About you', input: area('What you&rsquo;d like to do with people here', 'Moved to Kyiv in March. Board games, long walks on Podil and coffee at the end of it.'), note: noteOk('65 characters left') }), 'kit-cell--wide'),
      cell('Multi-Disabled', fld({ extra: ' mm-field--multi', label: 'About you', input: area('What you&rsquo;d like to do with people here', '', true) }), 'kit-cell--wide kit-cell--nl'),
      cell('Multi-Error', fld({ err: true, extra: ' mm-field--multi', label: 'About you', input: area('What you&rsquo;d like to do with people here', 'Moved to Kyiv in March. Board games, long walks on Podil and anything with a decent coffee at the end of it, which is most evenings honestly.'), note: noteErr('12 characters over the limit') }), 'kit-cell--wide'),
    ], 'Коробка, а не пилюля: в неё пишут абзац, и форма об этом говорит. Видно четыре строки, дальше прокрутка. Счётчик остатка — та же строка под полем, что несёт и отказ: иначе при переборе прыгала бы высота (§5.1, био до 150 символов).'),

    comp('Дата рождения', '.mm-dates', [
      cell('Date-Default', dob(), 'kit-cell--wide kit-cell--nl'),
      cell('Date-Hover', dob(' is-hover'), 'kit-cell--wide'),
      cell('Date-Focus', dob(' is-focus'), 'kit-cell--wide kit-cell--nl'),
      cell('Date-Filled', dob('', false, '14', '03', '1998'), 'kit-cell--wide'),
      cell('Date-Disabled', dob('', false, '', '', '', true), 'kit-cell--wide kit-cell--nl'),
      cell('Date-Error', dob('', true, '14', '03', '2012', false, noteErr('You need to be 18 or older')), 'kit-cell--wide'),
    ], 'Три поля, а не одно с маской: маску не видно, пока в неё не попал, а здесь сразу видно, что и куда. Возраст спрашивается один раз и здесь — гейт 18+ стоит на настройке профиля, отдельного экрана ему не нужно (<code>D-38</code>). Отказ говорит правило, а не «неверная дата».'),

    comp('Выпадающий список', '.mm-select · .mm-menu', [
      cell('Select-Default', sel(), 'kit-cell--wide kit-cell--nl'),
      cell('Select-Hover', sel(' is-hover'), 'kit-cell--wide'),
      cell('Select-Focus', sel(' is-focus'), 'kit-cell--wide kit-cell--nl'),
      cell('Select-Filled', sel('', 'Women only'), 'kit-cell--wide'),
      cell('Select-Disabled', sel(' is-disabled', 'Anyone', '', noteOk('Add your gender in the profile to limit who can join')), 'kit-cell--wide kit-cell--nl'),
      cell('Select-Open', sel(' is-focus', 'Anyone', '<ul class="mm-menu"><li><a class="is-current" href="#">Anyone</a></li><li><a href="#">Women only</a></li><li><a class="is-hover" href="#">Men only</a></li></ul>'), 'kit-cell--wide'),
    ], 'Три значения — ограничение отклика на своём запросе (<code>D-25</code>). Открытый список — состояние поля, а не второй компонент. Недоступным он бывает ровно в одном случае: пол не указан, и ограничение поставить не из чего; строка под полем говорит, что сделать. Состояния «не приняло» у него нет — выбрано всегда одно из трёх, пустым он не бывает.'),
  ]),

  grp(3, 'Навигация и переключатели', 'Чем переходят с экрана на экран: нижнее меню и срез вкладки. У обоих ровно два состояния — выбран или нет, промежуточных не бывает, выбор всегда один. Двери в соседний контур здесь нет: <code>Look at events</code> и <code>See people</code> — это третичная кнопка со стрелкой в надписи, своего компонента ей не нужно (§1 «Чего компонентом не считается»).', [
    comp('Вкладка нижнего меню', '.mm-tab', [
      cell('Tab-Default', `<nav class="mm-tabs kit-one"><a class="mm-tab" href="#">${ico('tab-events')}Events</a></nav>`),
      cell('Tab-Current', `<nav class="mm-tabs kit-one"><a class="mm-tab is-current" href="#" aria-current="page">${ico('tab-events-bold')}Events</a></nav>`),
    ], 'Активная — на сиренево-серой пилюле, иконка залитая и тёмная; неактивные контурные, цвета <code>--mm-ink-400</code>. Форма у обоих наборов одна, меняется только вес.'),

    comp('Срез вкладки', '.mm-segmented', [
      cell('Segment-Default', '<p class="mm-segmented kit-one"><a class="mm-btn" href="#">Mine</a></p>'),
      cell('Segment-Current', '<p class="mm-segmented kit-one"><a class="mm-btn is-current" href="#">Nearby</a></p>'),
      cell('Segment-Current-Whole control', '<p class="mm-segmented"><a class="mm-btn is-current" href="#">Nearby</a><a class="mm-btn" href="#">Mine</a></p>', 'kit-cell--wide kit-cell--nl'),
    ], 'Сначала сама клавиша: выбранная — чисто белая, с тенью и полужирным; обычная — та же клавиша, но серая, потому что своей заливки у неё нет и сквозь неё видна дорожка. Потом орган целиком: клавиши стоят вплотную, это один переключатель, а не две кнопки рядом. Наведения у сегмента нет вовсе — правило гасит заливку от <code>.mm-btn</code>, иначе невыбранный читался бы выбранным; клетки ему поэтому не нужно.'),

  ]),

  grp(4, 'Карточки и списки', 'Карточка события, строка списка, карточка человека и обложка с полосами по числу фотографий. У каждой — рабочий вид, наведение и те состояния содержимого, что бывают в данных: нет даты, нет мест, фото ещё не пришло. Плитка (<code>.mm-list--grid</code>) своей клеткой не стоит: две колонки — это раскладка выдачи поиска, а не вид карточки, и в ней меняются только высота обложки и отступы.', [
    comp('Карточка события', '.mm-event', [
      cell('Event-Default', evCard({ html: btn(' mm-btn--primary', '', 'Ask to join') }), 'kit-cell--wide'),
      cell('Event-Hover', evCard({ html: btn(' mm-btn--primary', '', 'Ask to join'), cardState: ' is-hover' }), 'kit-cell--wide'),
      cell('Event-Default-Two actions', evCard({ html: btn(' mm-btn--primary', '', 'Ask to join') + btn(' mm-btn--quiet', '', 'Invite') }, 'run', 'Morning run along the embankment', 'No date yet', 'Podil &middot; ~1 km', '1 going &middot; 2 spots left'), 'kit-cell--wide'),
      cell('Event-Default-Compact', evCard({ html: '' }).replace('mm-event"', 'mm-event mm-event--compact"'), 'kit-cell--card'),
      cell('Event-Default-No spots', evCard({ html: '<button class="mm-btn mm-btn--primary" type="button" disabled>No spots left</button>' }, 'coffee', 'Coffee and a walk in Podil', 'Sun 11:00', 'Podil &middot; ~2 km', 'No spots left &middot; Women only'), 'kit-cell--wide'),
    ], 'Три уровня чтения (<code>D-55</code>…<code>D-58</code>): что и когда · где · сколько мест. Обложка идёт во всю ширину сверху — прежняя полоса в 104px слева снимок обозначала, а не показывала. На снимке один знак — округлённое расстояние: отметка проверки на снимок события не ставится (<code>D-66</code>), её место там, где виден человек. В тексте под снимком остаются занятие с датой, площадка и счётчик. Дата стоит рядом с временем и тяжелее его: по ней решают. Где мест два и больше, появляется второе действие — <code>Invite</code>. Заполненное событие пишется словом, а не нулём (<code>D-60</code>).'),

    comp('Строка списка', '.mm-row', [
      cell('Row-Default', `<ul class="mm-list"><li><a class="mm-row" href="#"><span class="mm-row-head"><b>Olena</b><span class="mm-meta">19:08 &middot; 1 new</span></span><span class="mm-facts"><span class="mm-avatar" aria-hidden="true">${face('olena')}</span>Let&rsquo;s go then. Which day works for you?</span></a></li></ul>`, 'kit-cell--wide'),
      cell('Row-Hover', `<ul class="mm-list"><li><a class="mm-row is-hover" href="#"><span class="mm-row-head"><b>Olena</b><span class="mm-meta">19:08 &middot; 1 new</span></span><span class="mm-facts"><span class="mm-avatar" aria-hidden="true">${face('olena')}</span>Let&rsquo;s go then. Which day works for you?</span></a></li></ul>`, 'kit-cell--wide'),
      cell('Row-Default-No link', '<ul class="mm-list"><li class="mm-row"><span class="mm-row-head"><b>Location</b><span class="mm-meta">On &middot; rounded</span></span></li></ul>', 'kit-cell--wide'),
      cell('Row-Default-One line', '<ul class="mm-list"><li><a class="mm-row" href="#"><span class="mm-row-head"><b>My events</b><span class="mm-meta">1 request</span></span></a></li></ul>', 'kit-cell--wide'),
    ], 'Одна и та же строка несёт чат, событие и строку глубокого слоя. Строка-ссылка со снимком на наведении приближает обложку; строка без снимка и строка без ссылки не отзываются вовсе. Человека эта строка больше не несёт: в выдаче поиска он стоит карточкой, равной по весу карточке события (<code>D-64</code>).'),

    comp('Карточка человека', '.mm-person', [
      cell('Person-Default', person(), 'kit-cell--card'),
      cell('Person-Loading-Photo', person(' mm-photo--blur'), 'kit-cell--card'),
      cell('Person-Default-Compact', person().replace('mm-person"', 'mm-person mm-person--compact"'), 'kit-cell--card'),
    ], 'Порядок чтения задан и не произволен (<code>D-13</code>): общие интересы → имя и возраст → сигналы доверия → расстояние. Справа — фото дошло не целиком: показывается заблюренным и становится чётким по мере прихода (<code>D-51</code>); экран при этом рабочий, <code>Skip</code> и <code>Like</code> живые. Короткий вид — тот же компонент ростом с карточку события: он стоит в выдаче поиска, где две группы должны быть равными по весу и где карточки идут по две в ряд (обложка там ниже — 120px). Кнопки на нём нет, и у соседней карточки события в выдаче её тоже нет: там не решают, а смотрят (<code>D-67</code>). Знаки на снимке остаются в том же углу, что на большой карточке, и только лейба сжимается до галочки — слово не помещается на кадр 154×120, но из разметки не уходит (<code>D-69</code>). Решают при этом не в выдаче, а в колоде и в профиле, поэтому кнопки на нём нет.'),

    comp('Кружки по числу фотографий', '.mm-pager', [
      cell('Pager-Default', `<div class="kit-block"><figure class="mm-evcover"><p class="mm-photo">${cover('run')}</p><p class="mm-pager" aria-hidden="true"><span class="is-current"></span><span></span><span></span><span></span></p></figure></div>`, 'kit-cell--wide'),
    ], 'Столько кружков, сколько фотографий, закрашенный — открытая. Кружки лежат на самом снимке, внизу по центру: полосы под фотографией отнимали у карточки строку и читались разделителем между снимком и текстом. Открытая фотография — залитый белый кружок, остальные — его же обводка: заливка в полсилы читалась «тоже активная, только бледнее». Под обоими мягкая тень — иначе на светлом кадре обводка пропадает. Счёт нужен и на слух, поэтому рядом стоит скрытая подпись <code>Photo 1 of 4</code>.'),

    comp('Обложка на карточке события', '.mm-evcover', [
      cell('Cover-Default', `<div class="kit-block"><figure class="mm-evcover"><p class="mm-photo">${cover('games')}</p><p class="mm-pager" aria-hidden="true"><span class="is-current"></span><span></span><span></span></p></figure></div>`, 'kit-cell--wide'),
    ], 'На карточке события обложка идёт первой и во всю ширину; в превью ленты тот же снимок стоит слева во всю высоту строки, 104px. Это один снимок в двух местах, а не два компонента.'),
  ]),

  grp(5, 'Отметки и факты', 'Всё, чем карточка подтверждает себя: проверка, расстояние, интересы, сигналы доверия. Состояний у них нет — есть присутствие и отсутствие: нет данных, нет и строки.', [
    comp('Отметка проверки', '.mm-verified', [
      cell('Verified-Default', `<span class="mm-verified">${I.verified}Verified</span>`),
      cell('Verified-Default-Compact', `<span class="mm-verified mm-verified--compact">${I.verified}<span class="mm-vh">Verified</span></span>`),
    ], 'Одна на весь продукт: слово с галочкой на лаймовой лейбе. Стоит и сама по себе — в превью события от автора остаётся один <code>Verified</code> (<code>D-57</code>), — и первой строкой в сигналах доверия, поэтому у неё своя клетка. Пустой <code>--mm-label</code> выключает подложку, и слово возвращается к цвету текста.'),

    comp('Сигналы доверия', '.mm-signals', [
      cell('Signals-Full', `<ul class="mm-signals"><li><span class="mm-verified">${I.verified}Verified</span></li><li>12 meetups attended</li><li>Replies quickly</li></ul>`, 'kit-cell--wide'),
      cell('Signals-No meetups', `<ul class="mm-signals"><li><span class="mm-verified">${I.verified}Verified</span></li><li>Usually replies within a day</li></ul>`, 'kit-cell--wide'),
      cell('Signals-Verified only', `<ul class="mm-signals"><li><span class="mm-verified">${I.verified}Verified</span></li></ul>`, 'kit-cell--wide'),
      cell('Signals-Counting', `<ul class="mm-signals"><li><span class="mm-verified">${I.verified}Verified</span></li><li aria-hidden="true"><span class="mm-skel mm-skel--line"></span></li><li>Replies quickly</li></ul>`, 'kit-cell--wide'),
    ], 'Нуля в продукте не бывает (<code>D-60</code>): у кого встреч нет, строка не показывается вовсе — то же правило, что у отзывчивости. Третий случай — первые недели: встреч нет ни у кого, отзывчивости ещё нет, и на карточке остаётся один <code>Verified</code> (цена <code>D-49</code>). Четвёртый — свой профиль, пока сервер пересчитывает число встреч: строка остаётся на месте, заглушка стоит у одного факта, и остальные читаются как есть.'),

    comp('Чип расстояния', '.mm-chip', [
      cell('Chip-Default', `<span class="mm-chip">${ico('pin')}~2 km</span> <span class="mm-chip">${ico('pin')}Nearby</span>`, 'kit-cell--wide'),
    ], 'Расстояние округлённое и без слова <code>away</code> (<code>D-60</code>); меньше километра — <code>Nearby</code>. Точки на карте нет нигде и никогда (правило 5).'),

    comp('Теги интересов', '.mm-tags', [
      cell('Tags-Default', '<ul class="mm-tags"><li>Hiking</li><li>Board games</li><li>Coffee</li><li>Running</li></ul>', 'kit-cell--wide'),
    ], 'Перечисление под числом общих интересов (<code>D-13</code>). Выбранного состояния у тега нет: в колоде он не фильтр, а факт.'),

    comp('Аватар', '.mm-avatar', [
      cell('Avatar-Default', `<span class="mm-avatar" aria-hidden="true">${face('andrii')}</span>`),
    ], 'У каждого имени своё лицо: три одинаковых кружка в одной строке читаются как ошибка данных. Размер один — 24px, подпись рядом с именем; крупный портрет в 56px жил в строке человека в выдаче поиска, а с тех пор как человек стал там карточкой (<code>D-64</code>), его нет ни на одном экране, и правило снято из кита.'),

    comp('Строки фактов', '.mm-facts · .mm-meta · .mm-note', [
      cell('Facts-Default', '<p class="mm-facts">Kyiv Games Club &middot; Podil &middot; ~3 km</p>', 'kit-cell--wide'),
      cell('Meta-Default', '<p class="kit-stack"><span class="mm-meta">Sat 18:00</span><br><span class="mm-meta">No date yet</span></p>', 'kit-cell--wide'),
      cell('Note-Counter', '<p class="kit-stack"><output class="mm-note">2 going &middot; 1 spot left &middot; Still going? comes the day before</output><br><span class="mm-note">1 confirmed &middot; 1 spot left</span><br><span class="mm-note">No spots left</span></p>', 'kit-cell--wide'),
    ], 'Счётчик двухфазный (<code>D-16</code>): <code>going</code> → <code>confirmed</code>. Слово рядом с числом несёт честность — в каждой фазе показано ровно то, что известно.'),
  ]),

  grp(6, 'Состояния экрана', 'Четыре состояния, и ни одно из них не экран: пусто, сбой, итог и ожидание — состояния одного и того же экрана. Ожидание чужого решения загрузкой не считается (<code>D-42</code>): ждать можно днями, и спиннер здесь врёт.', [
    comp('Пусто и сбой', '.mm-state · .mm-state--alert', [
      cell('State-Empty', screenState('state-empty', 'No events within 5 km yet', 'Events here are posted by people like you &mdash; and yours would be the first one nearby.', '<a class="mm-btn mm-btn--quiet" href="#">Show events further out</a>', false), 'kit-cell--tall'),
      cell('State-Error', screenState('state-alert', 'Couldn&rsquo;t load events nearby', 'The connection dropped. Your own events and requests are safe.', btn(' mm-btn--primary', '', 'Try again'), true), 'kit-cell--tall'),
    ], 'Ни одно пустое состояние не выглядит пустым (§2.1, п. 1): у каждого есть ослабление условий и выход в соседний контур. Сбой — тот же блок, разница в <code>role="alert"</code> и в цвете иконки; текст называет причину и говорит, что данные целы.'),

    comp('Плашка итога', '.mm-banner', [
      cell('Banner-Success', '<article class="mm-banner"><b>It&rsquo;s an event</b><p>Board games at Kyiv Games Club &middot; Saturday, 18:00 &middot; the two of you.</p><p class="mm-actions"><a class="mm-btn mm-btn--primary" href="#">Open the event</a></p></article>', 'kit-cell--wide'),
      cell('Banner-Waiting', '<article class="mm-banner"><b>Waiting for Andrii</b><p>Your request is with Andrii. It stays open until Saturday &mdash; events without a date keep requests for 14 days.</p></article>', 'kit-cell--wide'),
    ], 'Карточка, а не абзац: день назначен — это новый объект, а не ещё одна реплика (<code>D-39</code>). В ожидании названы тот, кто должен ответить, и срок (<code>D-42</code>).'),
  ]),

  grp(7, 'Загрузка', 'Заглушки держат раскладку и показывают, что именно грузится. Спиннер не делает ни того, ни другого. При <code>prefers-reduced-motion</code> полоса стоит на месте.', [
    comp('Заглушка', '.mm-skel', [
      cell('Skel-Line', '<p class="kit-block"><span class="mm-skel mm-skel--line mm-skel--w-l"></span><span class="mm-skel mm-skel--line mm-skel--w-m"></span><span class="mm-skel mm-skel--line mm-skel--w-s"></span></p>', 'kit-cell--wide'),
      cell('Skel-Pill', '<span class="mm-skel mm-skel--pill mm-skel--w-s"></span>', 'kit-cell--wide'),
      cell('Skel-Button', '<span class="mm-skel mm-skel--btn mm-skel--w-l"></span>', 'kit-cell--wide'),
      cell('Skel-Thumb', '<p class="mm-skelrow kit-block"><span class="mm-skel mm-skel--thumb"></span><span class="mm-skel mm-skel--thumb"></span><span class="mm-skel mm-skel--thumb"></span></p>', 'kit-cell--wide'),
    ], 'Четыре формы, и это все: полоса текста, пилюля на месте чипа, пилюля ростом с кнопку на месте кнопки, миниатюра на месте фотографии. Пилюля и кнопка разведены нарочно: чип вдвое ниже кнопки, и одной формой на обе высота строки действий не держится. Заглушки той же длины и в том же порядке, что в пришедшей карточке, — приход данных ничего не сдвинет. Отдельной заглушки у строки списка и у карточки нет: внутрь кладутся те же три формы, меняется только контейнер.'),
  ]),

  grp(8, 'Чат', 'По порогу «два экрана» переписка разовая: она стоит только на экране Диалог. В кит входит потому, что без пузыря чат нечем собрать, а экран этот — основная дорога к встрече (<code>D-37</code>).', [
    comp('Реплика', '.mm-bubble', [
      cell('Bubble-Other', '<div class="mm-msgs"><p class="mm-bubble">Hi! Saw you&rsquo;re into board games too<span class="mm-bubble-time">Olena &middot; 19:04</span></p></div>', 'kit-cell--wide'),
      cell('Bubble-Mine', '<div class="mm-msgs"><p class="mm-bubble mm-bubble--mine">Yes &mdash; there&rsquo;s a game caf&eacute; on Podil I keep meaning to try<span class="mm-bubble-time">19:06 &middot; Read</span></p></div>', 'kit-cell--wide'),
      cell('Bubble-Mine-Failed', `<div class="mm-msgs"><a class="mm-bubble mm-bubble--failed" href="#" role="alert" aria-label="Message not sent. Tap to try again">Saturday works &mdash; the caf&eacute; opens at six<span class="mm-bubble-retry" aria-hidden="true">${I.retry}</span><span class="mm-bubble-time">Not sent &middot; tap to try again</span></a></div>`, 'kit-cell--wide'),
    ], 'Своя реплика — не действие, поэтому и не цвет действия: сиреневый тон, отличают её сторона и отсутствие обводки. Не ушло — состояние реплики, а не экрана (<code>D-52</code>): помечен сам пузырь, нажатие повторяет отправку.'),
  ]),

  grp(9, 'Оболочка', 'Экран целиком: шапка, содержимое, нижнее меню. Разметка — <code>ui/shell.html</code>, оттуда её берёт экран, у которого ещё нет каркаса.', [
    comp('Экран', '.mm-screen · .mm-head · .mm-app · .mm-tabs', [
      cell('Screen-Feed', `<div class="mm-screen">
        ${headPlain}
        <main class="mm-app">
          <div class="mm-pane">
            <p class="mm-segmented">
              <a class="mm-btn is-current" href="#">Nearby</a>
              <a class="mm-btn" href="#">Mine</a>
            </p>
            ${evCard({ html: btn(' mm-btn--primary', '', 'Ask to join') })}
            <a class="mm-btn" href="#">See people <span aria-hidden="true">&rarr;</span></a>
          </div>
        </main>
        ${tabs('Events')}
      </div>`, 'kit-cell--screen'),
      cell('Screen-Search', `<div class="mm-screen">
        ${headStack}
        <main class="mm-app">
          <div class="mm-pane">
            <h2 class="mm-h2">Events</h2>
            ${evCard({ html: btn(' mm-btn--primary', '', 'Ask to join') }, 'coffee', 'Coffee and a walk in Podil', 'Sun 11:00', 'Podil &middot; ~2 km', '1 spot left &middot; Women only')}
          </div>
        </main>
        ${tabs('Search')}
      </div>`, 'kit-cell--screen'),
      cell('Screen-Dialog', `<div class="mm-screen">
        ${headBack}
        <main class="mm-app">
          <div class="mm-pane">
            <section class="mm-scrolly">
              <h2 class="mm-vh">Chat with Olena</h2>
              <div class="mm-msgs">
                <p class="mm-bubble">Hi! Saw you&rsquo;re into board games too<span class="mm-bubble-time">Olena &middot; 19:04</span></p>
                <p class="mm-bubble mm-bubble--mine">Yes &mdash; there&rsquo;s a game caf&eacute; on Podil I keep meaning to try<span class="mm-bubble-time">19:06 &middot; Read</span></p>
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
      </div>`, 'kit-cell--screen'),
      cell('Screen-Deck', `<div class="mm-screen">
        <header class="mm-head">
          <h1 class="mm-head-title">People nearby</h1>
          <button class="mm-head-btn" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>
        </header>
        <main class="mm-app">
          <div class="mm-pane">
            <section class="mm-stretch">${person()}</section>
            <p class="mm-actions">
              <a class="mm-btn" href="#">Skip</a>
              <a class="mm-btn mm-btn--primary" href="#">Like</a>
            </p>
            <a class="mm-btn" href="#">Look at events <span aria-hidden="true">&rarr;</span></a>
          </div>
        </main>
        ${tabs('People')}
      </div>`, 'kit-cell--screen'),
    ], 'Горизонтальные поля задаёт <code>.mm-app</code>: закреплённая полоса и секции своих не имеют, иначе они встают на 32px от края вместо 16px. Третий экран показывает прокручиваемую секцию и закреплённую полосу, четвёртый — <code>.mm-stretch</code>: он отдаёт карточке весь остаток высоты.'),
  ]),

  grp(10, 'Онбординг и слои', 'Четыре компонента с экранов входа: обещание и радар на онбординге, слой совпадения поверх колоды, подпись на снимке в видоискателе. Все разовые — каждый стоит на одном экране, — но без них эти экраны не собрать.', [
    comp('Обещание', '.mm-promise', [
      cell('Promise-Default', '<p class="mm-promise">Meet <mark>mates</mark><br>Enjoy the <mark>events</mark></p>', 'kit-cell--wide'),
    ], 'Лаймом залит контейнер, а не буквы: лаймовый текст на светлом фоне даёт 1,2:1, тёмный на лайме — 15:1.'),

    comp('Радар', '.mm-radar · .mm-rings · .mm-pins · .mm-scan', [
      cell('Radar-Default', `<div class="kit-radar">
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
      </div>`, 'kit-cell--screen'),
      cell('Dot-Sizes', `<span class="mm-dot mm-dot--sm" aria-hidden="true">${cover('games')}</span> <span class="mm-dot" aria-hidden="true">${face('olena', 112)}</span> <span class="mm-dot mm-dot--lg" aria-hidden="true">${face('dasha', 112)}</span>`, 'kit-cell--wide'),
    ], 'Кольца подписаны и стоят на месте; из центра идёт волна — это и есть «радар работает». На кольцах не точки, а те же лица и обложки, что в колоде и ленте. Данные иллюстративные (<code>D-47</code>). При <code>prefers-reduced-motion</code> волна снимается, найденные видны сразу.'),

    comp('Слой поверх экрана', '.mm-layer', [
      cell('Layer-Match', `<div class="kit-layer">
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
      </div>`, 'kit-cell--screen'),
    ], 'Совпадение — не экран, а слой поверх колоды, поэтому <code>dialog</code>. У него <code>position: static</code>: браузер ставит <code>absolute</code>, и слой выходит из потока, переставая слушаться полей экрана.'),

    comp('Подпись на снимке', '.mm-photo-cap', [
      cell('Viewfinder-Default', `<div class="kit-shot">
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
      </div>`, 'kit-cell--card'),
    ], 'Видоискатель верификации — та же карточка человека, что в колоде: вместо снимка кадр камеры, вместо фактов подсказка позы. Подпись лежит на самом снимке.'),
  ]),
];

const kit = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Витрина компонентов · MeetMates UI kit</title>
<!--
  ВИТРИНА. У каждого компонента нарисовано каждое состояние, которое у него есть,
  и у каждого состояния есть имя: вариант-состояние, а где нужно — и вид
  содержимого («Primary-Default-Only icon»).

  Правило отбора двойное. Первое: рисуем то, что в ките описано, и ничего сверх —
  придуманное состояние это обещание, которого экран не держит. Поэтому у поля нет
  ошибки, а у тега нет выбранного вида: таких экранов в наборе ещё нет.
  Второе: в матрице стоит то, что меняет вид или поведение. Растянутая кнопка,
  другой индекс полосы, другая ширина заглушки, другой размер кружка — тот же
  компонент, и ему место в одной клетке, а не в пяти.

  Наведение и нажатие живут в браузере и рядом не ставятся — их рисуют классы
  .is-hover и .is-pressed. Это не копия правил: в ui/kit.css они перечислены через
  запятую с псевдоклассами, описание одно на двоих.

  Фокуса на витрине нет: он приходит от клавиатуры, его не разглядывают рядом
  с наведением. В ui/kit.css :focus-visible остаётся — без него тот, кто ходит
  табом, не видит, где стоит (WCAG 2.4.7, уровень AA).

  Текст везде настоящий, из интерфейса: компонент проверяется на той строке,
  которую он понесёт, а не на «Lorem ipsum».

  Сгенерировано scripts/build-kit-pages.mjs — руками не править.
  Порядок групп — роли из ui/inventory.md.
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
  .kit-case { margin: 0 0 28px; }
  .kit-h { display: flex; align-items: baseline; gap: 10px; margin: 0 0 10px; font-size: 14px; }
  .kit-h code { font: 12px/1 ui-monospace, monospace; padding: 4px 8px; border-radius: 999px;
    background: #fff; box-shadow: 0 0 0 1px var(--edge); color: var(--dim); }
  .kit-note { margin: 10px 0 0; max-width: 90ch; font-size: 12px; line-height: 1.5; color: var(--dim); }

  /* Матрица состояний: клетка — образец и его имя. Фон площадки тот же, что
     у экрана: белая карточка проверяется на том, на чём лежит. */
  .kit-matrix { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); max-width: 1100px; }
  .kit-cell { margin: 0; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .kit-stage {
    display: flex; align-items: center; justify-content: center;
    padding: 16px; border-radius: 18px;
    background-color: #fff; background-image: var(--mm-bg-wash); background-size: 100% 844px;
    box-shadow: 0 0 0 1px var(--edge);
  }
  .kit-stage > * { max-width: 100%; }
  .kit-cell figcaption { font: 12px/1.3 ui-monospace, monospace; color: var(--dim); }
  /* перенос строки внутри матрицы: иконочная кнопка начинает новый ряд
     с первой колонки, чтобы стоять под своей текстовой ролью */
  .kit-cell--nl { grid-column-start: 1; }
  .kit-cell--wide { grid-column: span 2; }
  .kit-cell--wide .kit-stage { justify-content: flex-start; }
  .kit-cell--tall { grid-column: span 2; }
  .kit-cell--tall .kit-stage { align-items: stretch; }
  .kit-cell--card { grid-column: span 2; }
  .kit-cell--card .kit-stage > * { width: 100%; height: 400px; }
  /* образец во всю ширину площадки: нужен там, где вид держится на выравнивании
     внутри — у пилюли, обжатой по тексту, левого края не видно */
  .kit-cell--screen { grid-column: 1 / -1; }
  .kit-cell--screen .kit-stage { padding: 0; background: none; box-shadow: none; justify-content: flex-start; gap: 24px; overflow-x: auto; }
  .kit-cell--screen .mm-screen { flex: none; border-radius: 26px; box-shadow: 0 0 0 1px var(--edge), 0 8px 28px rgba(17, 17, 17, .1); }
  @media (max-width: 760px) {
    .kit-matrix { grid-template-columns: 1fr; }
    .kit-cell--wide, .kit-cell--tall, .kit-cell--card { grid-column: span 1; }
  }

  /* высоту растягивающимся компонентам задаёт витрина, а не компонент */
  .kit-tall { height: 300px; display: flex; flex-direction: column; width: 100%; }
  .kit-radar { height: 460px; width: 390px; display: flex; }
  .kit-layer { height: 420px; width: 390px; display: flex; flex-direction: column; }
  .kit-shot { height: 360px; display: flex; flex-direction: column; width: 100%; }
  .kit-shot .mm-person { height: auto; flex: 1; }
  .kit-after { margin-top: 12px; }
  .kit-one { width: 120px; }
  /* одиночный сегмент показывается клавишей: дорожка ужата до неё самой,
     и видно то, ради чего клетка стоит — белая клавиша против серой */
  .mm-segmented.kit-one { width: auto; padding: 0; }
  .mm-segmented.kit-one > * { flex: none; min-width: 112px; }
  .kit-block { width: 100%; }
  /* место под раскрытый список: он лежит слоем, высоту клетке он не задаёт */
  .kit-drop { padding-bottom: 128px; }
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
  /* ── Голый вид: адрес с #bare ───────────────────────────────────
     Страница встроена в раздел 07, а там слева уже стоит дерево сайта:
     вторая такая же полоса рядом не нужна. Переключает :target,
     скрипта на странице нет — тот же приём, что у экранов концепта. */
  body:has(#bare:target) .wfrail { display: none; }
  body:has(#bare:target) .kit-top,
  body:has(#bare:target) .kit-grp { padding-left: 32px; }
</style>
</head>
<body class="mm">
<i id="bare" hidden></i>
${rail({ prefix: '../', current: '07' })}

<div class="kit-top">
  <h1>Витрина компонентов</h1>
  <p>Один файл стилей — <code>ui/kit.css</code>: переменные в <code>:root</code> и классы
  компонентов, без второго уровня токенов. Оболочка как разметка — <code>ui/shell.html</code>.
  Состав и порог «два экрана» — <code>ui/inventory.md</code>, вид — <code>DESIGN.md</code>.</p>
  <p>У каждого компонента нарисовано каждое состояние, которое у него есть, и у каждого
  есть имя: вариант-состояние, а где нужно — и вид содержимого. Состояний, которых
  в ките нет, здесь не появляется. Ширина, размер и порядковый номер состоянием
  не считаются: это тот же компонент, и он стоит в одной клетке.</p>
  <ul class="kit-toc">
    <li><a href="#g1">1 · Кнопки</a></li>
    <li><a href="#g2">2 · Поля</a></li>
    <li><a href="#g3">3 · Вкладки и переключатели</a></li>
    <li><a href="#g4">4 · Карточки и списки</a></li>
    <li><a href="#g5">5 · Отметки и факты</a></li>
    <li><a href="#g6">6 · Состояния экрана</a></li>
    <li><a href="#g7">7 · Загрузка</a></li>
    <li><a href="#g8">8 · Чат</a></li>
    <li><a href="#g9">9 · Оболочка</a></li>
    <li><a href="#g10">10 · Онбординг и слои</a></li>
  </ul>
</div>

${GROUPS.join('\n\n')}

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
