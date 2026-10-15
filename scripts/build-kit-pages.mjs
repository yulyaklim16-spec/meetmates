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

const evCard = (acts, pic = 'games', head = 'Board games', when = 'Sat 18:00', where = 'Kyiv Games Club &middot; Podil &middot; ~3 km', spots = '2 going &middot; 1 spot left') =>
  `<ul class="mm-list">
          <li class="mm-event">
            <span class="mm-cover" aria-hidden="true">${cover(pic)}</span>
            <span class="mm-event-body">
              <a class="mm-event-head${acts.headState || ''}" href="#"><b>${head}</b><span class="mm-meta">${when}</span></a>
              <span class="mm-facts">${where}</span>
              <span class="mm-facts">${spots} &middot; <span class="mm-verified">${I.verified}Verified</span></span>
            </span>
            <span class="mm-event-acts">${acts.html}</span>
          </li>
        </ul>`;

const person = (mod = '') => `<article class="mm-person">
          <figure>
            <p class="mm-photo${mod}"><img src="img/olena-720.jpg" alt="" loading="lazy"></p>
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

const screenState = (icon, h, p, acts, alert) => `<div class="kit-tall">
          <article class="mm-state${alert ? ' mm-state--alert' : ''}"${alert ? ' role="alert"' : ''}>
            ${ico(icon, 'mm-state-ico')}
            <h3>${h}</h3>
            <p>${p}</p>
          </article>
${acts ? `          <p class="mm-actions kit-after">${acts}</p>\n` : ''}        </div>`;

const GROUPS = [
  grp(1, 'Кнопки', 'Три роли, и у каждой четыре состояния: рабочее, наведение, нажатие и отключённая. Отключённая — та же кнопка в половину силы: роль остаётся видна, видно и то, что нажимать нечего. Кнопка только с иконкой — та же кнопка, поэтому стоит здесь, а не отдельной группой; растянутая на всю ширину — тоже она, и отдельной клетки ей не нужно. Фокуса в матрице нет: он приходит от клавиатуры, а не от мыши, и рядом с наведением его не разглядывают — <code>:focus-visible</code> при этом остаётся в ките и обязателен.', [
    comp('Главная', '.mm-btn--primary', [
      cell('Primary-Default', btn(' mm-btn--primary', '', 'Ask to join')),
      cell('Primary-Hover', btn(' mm-btn--primary', ' is-hover', 'Ask to join')),
      cell('Primary-Pressed', btn(' mm-btn--primary', ' is-pressed', 'Ask to join')),
      cell('Primary-Disabled', '<button class="mm-btn mm-btn--primary" type="button" disabled>Verify to send</button>'),
    ], 'Главная на экране одна. Отключённая — та же кнопка в половину силы: роль видно по-прежнему, видно и то, что она сейчас не работает. Надпись при этом говорит, что сделать: <code>Verify to send</code> — это гейт §7.3, и она называет условие.'),

    comp('Вторичная', '.mm-btn--quiet', [
      cell('Secondary-Default', btn(' mm-btn--quiet', '', 'Invite together')),
      cell('Secondary-Hover', btn(' mm-btn--quiet', ' is-hover', 'Invite together')),
      cell('Secondary-Pressed', btn(' mm-btn--quiet', ' is-pressed', 'Invite together')),
      cell('Secondary-Disabled', '<button class="mm-btn mm-btn--quiet" type="button" disabled>Invite together</button>'),
    ], 'Сиреневая подложка без обводки. Отключённая остаётся сиреневой — приглушается, но роли не теряет.'),

    comp('Без роли', '.mm-btn', [
      cell('Plain-Default', btn('', '', 'Skip')),
      cell('Plain-Hover', btn('', ' is-hover', 'Skip')),
      cell('Plain-Pressed', btn('', ' is-pressed', 'Skip')),
      cell('Plain-Disabled', '<button class="mm-btn" type="button" disabled>Skip</button>'),
    ], 'Ровная белая: это <code>Skip</code> рядом с залитым <code>Like</code>. Роли у неё нет, и залитой она не бывает.'),

    comp('Только иконка', '.mm-head-btn', [
      cell('Icon-Default', `<button class="mm-head-btn" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>`),
      cell('Icon-Hover', `<button class="mm-head-btn is-hover" type="button">${ico('filters')}<span class="mm-vh">Filters</span></button>`),
      cell('Primary-Default-Only icon', `<button class="mm-head-btn mm-head-btn--primary" type="button" aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>`),
      cell('Primary-Hover-Only icon', `<button class="mm-head-btn mm-head-btn--primary is-hover" type="button" aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>`),
      cell('Back-Default', '<a class="mm-head-btn mm-head-btn--back" href="#" aria-label="Back to events"><span aria-hidden="true">&larr;</span></a>'),
      cell('Back-Hover', '<a class="mm-head-btn mm-head-btn--back is-hover" href="#" aria-label="Back to events"><span aria-hidden="true">&larr;</span></a>'),
      cell('Report-Default', `<button class="mm-head-btn mm-head-btn--report" type="button">${ico('report')}Report</button>`),
      cell('Report-Hover', `<button class="mm-head-btn mm-head-btn--report is-hover" type="button">${ico('report')}Report</button>`),
      cell('Icon-Disabled', `<button class="mm-head-btn" type="button" disabled>${ico('filters')}<span class="mm-vh">Filters</span></button>`),
      cell('Primary-Disabled-Only icon', `<button class="mm-head-btn mm-head-btn--primary" type="button" disabled aria-label="Post an event">${ico('post')}<span class="mm-vh">Post</span></button>`),
    ], 'Подпись у иконки скрыта для скринридера — смысл берётся из места. Исключение одно: у <code>Report</code> слово стоит видимым, флажок сам по себе не читается, а угадывать действие безопасности нельзя. Возврат — стрелка без круга: направление должно читаться без цвета.'),

    comp('Опасное действие', '.mm-danger-link', [
      cell('Danger-Default', `<button class="mm-danger-link" type="button">${ico('report')}Report this person</button>`),
    ], 'Не заливка, а строка с иконкой: <code>--mm-danger</code> в продукте носят только <code>Report</code> и <code>Block</code>. Состояния наведения у неё нет — это ссылка, а не кнопка.'),

    comp('Подсказка в чате', '.mm-hints > .mm-btn', [
      cell('Hint-Default', '<p class="mm-hints"><a class="mm-btn" href="#">Free this weekend?</a></p>'),
      cell('Hint-Hover', '<p class="mm-hints"><a class="mm-btn is-hover" href="#">Free this weekend?</a></p>'),
    ], 'Предложенная фраза, а не второе действие: текст слева, вес обычный. Рядом с главной кнопкой не спорит.'),

    comp('Строка действий', '.mm-actions', [
      cell('Actions-Default', `<p class="mm-actions">${btn(' mm-btn--primary', '', 'Expand search')}${btn(' mm-btn--quiet', '', 'Reset filters')}</p>`, 'kit-cell--wide'),
    ], 'Одна-две кнопки в ряд, поровну. Одна растягивается на всю ширину сама — это та же кнопка, а не другой её вид. Больше двух в наборе не встречается ни на одном экране.'),
  ]),

  grp(2, 'Поля', 'Поле в наборе одно и стоит в двух местах: поиск в шапке и ввод реплики в диалоге. Состояния ошибки у него нет — экранов, где поле что-то проверяет, в вайрфреймах ещё нет, и выдумывать его не стали.', [
    comp('Поле с иконкой', '.mm-field', [
      cell('Field-Empty', `<form class="mm-field" role="search">${ico('search')}<label class="mm-vh" for="q1">Search people and events</label><input id="q1" type="search" placeholder="Search people and events"></form>`, 'kit-cell--wide'),
      cell('Field-Filled', `<label class="mm-field" for="m1">${ico('message')}<span class="mm-vh">Message</span><input id="m1" type="text" value="Saturday works"></label>`, 'kit-cell--wide'),
    ], 'Компонент один, иконка меняется по месту: лупа в поиске, реплика в диалоге. Иконка контурная — поле ничего не утверждает, оно ждёт ввода. Подпись скрытая, это такой же копирайт, он входит в перепись.'),
  ]),

  grp(3, 'Вкладки и переключатели', 'Три органа, и у каждого ровно два состояния: выбран или нет. Промежуточных нет — выбор всегда один.', [
    comp('Вкладка нижнего меню', '.mm-tab', [
      cell('Tab-Default', `<nav class="mm-tabs kit-one"><a class="mm-tab" href="#">${ico('tab-events')}Events</a></nav>`),
      cell('Tab-Current', `<nav class="mm-tabs kit-one"><a class="mm-tab is-current" href="#" aria-current="page">${ico('tab-events-bold')}Events</a></nav>`),
    ], 'Активная — на сиренево-серой пилюле, иконка залитая и тёмная; неактивные контурные, цвета <code>--mm-ink-400</code>. Форма у обоих наборов одна, меняется только вес.'),

    comp('Срез вкладки', '.mm-segmented', [
      cell('Segment-Current', '<p class="mm-segmented"><a class="mm-btn is-current" href="#">Nearby</a><a class="mm-btn" href="#">Mine</a></p>', 'kit-cell--wide'),
      cell('Segment-Hover', '<p class="mm-segmented"><a class="mm-btn is-current" href="#">Nearby</a><a class="mm-btn is-hover" href="#">Mine</a></p>', 'kit-cell--wide'),
    ], 'Сегменты стоят вплотную на дорожке: это один орган, а не две главные кнопки рядом. Наведение на невыбранный сегмент ничего не заливает — иначе он читался бы как выбранный.'),

    comp('Полосы по числу фотографий', '.mm-pager', [
      cell('Pager-Default', '<p class="mm-pager kit-one" aria-hidden="true"><span class="is-current"></span><span></span><span></span><span></span></p>', 'kit-cell--wide'),
    ], 'Столько полос, сколько фотографий, закрашенная — открытая. Счёт нужен и на слух, поэтому рядом стоит скрытый <code>figcaption</code>: «Photo 1 of 4».'),

    comp('Выход в соседний контур', '.mm-exit', [
      cell('Exit-Default', '<a class="mm-exit" href="#"><span>Look at events</span><span aria-hidden="true">&rarr;</span></a>', 'kit-cell--wide'),
      cell('Exit-Hover', '<a class="mm-exit is-hover" href="#"><span>See people</span><span aria-hidden="true">&rarr;</span></a>', 'kit-cell--wide'),
    ], 'Два имени, и других нет: <code>nearby</code> в кнопке не пишется (правило 6). Это не решение по экрану, поэтому карточка со стрелкой, а не кнопка.'),
  ]),

  grp(4, 'Карточки и списки', 'Карточка события, строка списка и карточка человека. У каждой — рабочий вид, наведение и те состояния содержимого, что бывают в данных: нет даты, нет мест, фото ещё не пришло.', [
    comp('Карточка события', '.mm-event', [
      cell('Event-Default', evCard({ html: btn(' mm-btn--primary', '', 'Ask to join') }), 'kit-cell--wide'),
      cell('Event-Hover-Title', evCard({ html: btn(' mm-btn--primary', '', 'Ask to join'), headState: ' is-hover' }), 'kit-cell--wide'),
      cell('Event-Default-Two actions', evCard({ html: btn(' mm-btn--primary', '', 'Ask to join') + btn(' mm-btn--quiet', '', 'Invite') }, 'run', 'Morning run along the embankment', 'No date yet', 'Podil &middot; ~1 km', '1 going &middot; 2 spots left'), 'kit-cell--wide'),
      cell('Event-Default-No spots', evCard({ html: '<button class="mm-btn mm-btn--primary" type="button" disabled>No spots left</button>' }, 'coffee', 'Coffee and a walk in Podil', 'Sun 11:00', 'Podil &middot; ~2 km', 'No spots left &middot; Women only'), 'kit-cell--wide'),
    ], 'Три уровня чтения (<code>D-55</code>…<code>D-58</code>): что и когда · где и далеко ли · сколько мест и <code>Verified</code>. Где мест два и больше, появляется второе действие — <code>Invite</code>. Заполненное событие пишется словом, а не нулём (<code>D-60</code>).'),

    comp('Строка списка', '.mm-row', [
      cell('Row-Default', `<ul class="mm-list"><li><a class="mm-row" href="#"><span class="mm-row-head"><b>Olena</b><span class="mm-meta">19:08 &middot; 1 new</span></span><span class="mm-facts"><span class="mm-avatar" aria-hidden="true">${face('olena')}</span>Let&rsquo;s go then. Which day works for you?</span></a></li></ul>`, 'kit-cell--wide'),
      cell('Row-Hover', `<ul class="mm-list"><li><a class="mm-row is-hover" href="#"><span class="mm-row-head"><b>Olena</b><span class="mm-meta">19:08 &middot; 1 new</span></span><span class="mm-facts"><span class="mm-avatar" aria-hidden="true">${face('olena')}</span>Let&rsquo;s go then. Which day works for you?</span></a></li></ul>`, 'kit-cell--wide'),
      cell('Row-Default-No link', '<ul class="mm-list"><li class="mm-row"><span class="mm-row-head"><b>Location</b><span class="mm-meta">On &middot; rounded</span></span></li></ul>', 'kit-cell--wide'),
      cell('Row-Default-One line', '<ul class="mm-list"><li><a class="mm-row" href="#"><span class="mm-row-head"><b>My events</b><span class="mm-meta">1 request</span></span></a></li></ul>', 'kit-cell--wide'),
    ], 'Одна и та же строка несёт чат, событие и строку глубокого слоя. Строка-ссылка подчёркивает заголовок на наведении; строка без ссылки — та, за которой экрана ещё нет, и подчёркивания у неё нет.'),

    comp('Карточка человека', '.mm-person', [
      cell('Person-Default', person(), 'kit-cell--card'),
      cell('Person-Loading-Photo', person(' mm-photo--blur'), 'kit-cell--card'),
    ], 'Порядок чтения задан и не произволен (<code>D-13</code>): общие интересы → имя и возраст → сигналы доверия → расстояние. Справа — фото дошло не целиком: показывается заблюренным и становится чётким по мере прихода (<code>D-51</code>); экран при этом рабочий, <code>Skip</code> и <code>Like</code> живые.'),

    comp('Обложка на карточке события', '.mm-evcover', [
      cell('Cover-Default', `<div class="kit-block"><figure class="mm-evcover"><p class="mm-photo">${cover('games')}</p><p class="mm-pager" aria-hidden="true"><span class="is-current"></span><span></span><span></span></p></figure></div>`, 'kit-cell--wide'),
    ], 'На карточке события обложка идёт первой и во всю ширину; в превью ленты тот же снимок стоит слева во всю высоту строки, 104px. Это один снимок в двух местах, а не два компонента.'),
  ]),

  grp(5, 'Отметки и факты', 'Всё, чем карточка подтверждает себя: проверка, расстояние, интересы, сигналы доверия. Состояний у них нет — есть присутствие и отсутствие: нет данных, нет и строки.', [
    comp('Отметка проверки', '.mm-verified', [
      cell('Verified-Default', `<span class="mm-verified">${I.verified}Verified</span>`),
    ], 'Одна на весь продукт: слово с галочкой на лаймовой лейбе. Пустой <code>--mm-label</code> выключает подложку, и слово возвращается к цвету текста.'),

    comp('Сигналы доверия', '.mm-signals', [
      cell('Signals-Full', `<ul class="mm-signals"><li><span class="mm-verified">${I.verified}Verified</span></li><li>12 meetups attended</li><li>Replies quickly</li></ul>`, 'kit-cell--wide'),
      cell('Signals-No meetups', `<ul class="mm-signals"><li><span class="mm-verified">${I.verified}Verified</span></li><li>Usually replies within a day</li></ul>`, 'kit-cell--wide'),
      cell('Signals-Verified only', `<ul class="mm-signals"><li><span class="mm-verified">${I.verified}Verified</span></li></ul>`, 'kit-cell--wide'),
    ], 'Нуля в продукте не бывает (<code>D-60</code>): у кого встреч нет, строка не показывается вовсе — то же правило, что у отзывчивости. Третий случай — первые недели: встреч нет ни у кого, отзывчивости ещё нет, и на карточке остаётся один <code>Verified</code> (цена <code>D-49</code>).'),

    comp('Чип расстояния', '.mm-chip', [
      cell('Chip-Default', `<span class="mm-chip">${ico('pin')}~2 km</span> <span class="mm-chip">${ico('pin')}Nearby</span>`, 'kit-cell--wide'),
    ], 'Расстояние округлённое и без слова <code>away</code> (<code>D-60</code>); меньше километра — <code>Nearby</code>. Точки на карте нет нигде и никогда (правило 5).'),

    comp('Теги интересов', '.mm-tags', [
      cell('Tags-Default', '<ul class="mm-tags"><li>Hiking</li><li>Board games</li><li>Coffee</li><li>Running</li></ul>', 'kit-cell--wide'),
    ], 'Перечисление под числом общих интересов (<code>D-13</code>). Выбранного состояния у тега нет: в колоде он не фильтр, а факт.'),

    comp('Аватар', '.mm-avatar', [
      cell('Avatar-Sizes', `<span class="mm-avatar" aria-hidden="true">${face('andrii')}</span> <span class="mm-avatar mm-avatar--lg" aria-hidden="true">${face('dasha', 112)}</span>`, 'kit-cell--wide'),
    ], 'У каждого имени своё лицо: три одинаковых кружка в одной строке читаются как ошибка данных. В ряду заглушек кружок крупнее — это место под фотографию, а не подпись рядом с именем.'),

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
      cell('Skel-Thumb', '<p class="mm-skelrow"><span class="mm-skel mm-skel--thumb"></span><span class="mm-skel mm-skel--thumb"></span><span class="mm-skel mm-skel--thumb"></span></p>', 'kit-cell--wide'),
      cell('Skel-Row', '<ul class="mm-list"><li class="mm-row" aria-hidden="true"><span class="mm-skel mm-skel--line mm-skel--w-l"></span><span class="mm-skel mm-skel--line mm-skel--w-m"></span><span class="mm-skel mm-skel--line mm-skel--w-s"></span></li></ul>', 'kit-cell--wide'),
    ], 'Заглушки той же длины и в том же порядке, что в пришедшей карточке: приход данных ничего не сдвинет. Миниатюра — место под фотографию профиля, пока она грузится.'),
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
            <a class="mm-exit" href="#"><span>See people</span><span aria-hidden="true">&rarr;</span></a>
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
            <a class="mm-exit" href="#"><span>Look at events</span><span aria-hidden="true">&rarr;</span></a>
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
  .kit-cell--wide { grid-column: span 2; }
  .kit-cell--wide .kit-stage { justify-content: flex-start; }
  .kit-cell--tall { grid-column: span 2; }
  .kit-cell--tall .kit-stage { align-items: stretch; }
  .kit-cell--card { grid-column: span 2; }
  .kit-cell--card .kit-stage > * { width: 100%; height: 400px; }
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
  .kit-block { width: 100%; }
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
</style>
</head>
<body class="mm">
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
