// Сборка экранов концепта (направление D) из вайрфреймов.
//
// Вайрфреймы остаются серыми — это их этап (wireframes/README.md). Экран концепта
// берёт разметку мокапа из wireframes/<экран>.html как есть: текст и структура
// не меняются. Скрипт только:
//   1. меняет шапку документа: стили концепта вместо _wire.css, шрифт Geist;
//   2. убирает навигацию сайта (она живёт в разделе 04), полосу состояний оставляет;
//   3. ставит фото события в серую обложку `.cover` — по названию события;
//   4. кладёт иконку Solar Bold в каждую пустую `.ico` — по подписи рядом;
//   5. оборачивает слово Verified в отметку `.verified` с галочкой;
//      кнопки шапки показывают только иконку — подпись скрыта для глаз, не для скринридера;
//   6. добавляет иконку в состояния «пусто» и «ошибка»;
//   7. ссылки на экраны, которых в концепте ещё нет, ведёт в вайрфреймы.
// Если чего-то не хватает (фото, иконки) — падает, а не оставляет серую заглушку.
//
// Запуск: node scripts/build-concept-screens.mjs — после правки вайрфрейма или стилей.
// Стили — concept/screens/screens.css (устройство) + ui/kit.css (компоненты);
// значения — только из concept/tokens.css. От concept/components.css экраны
// отцеплены 2026-10-16: он одевал их до кита и остался только под стенд стиля.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { rail } from './lib/chrome.mjs';
import { kindBar } from './lib/screenbar.mjs';
import { wireframeOrder, flatPages } from './lib/wfnav.mjs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'concept/screens');
const ICONS = join(ROOT, 'concept/icons/solar-bold');
const ICONS_LINEAR = join(ROOT, 'concept/icons/solar-linear');

// Какие экраны собираем и в каком порядке — ровно как в дереве вайрфреймов:
// порядок читается из него же, своего списка у концепта нет (см. lib/wfnav.mjs).
const BRANCHES = wireframeOrder(ROOT);
const SCREENS = flatPages(BRANCHES);

// Снимки лежат в репозитории, в concept/img: те же кадры, что и были, но взятые
// файлами. Прототип не должен гаснуть оттого, что Unsplash недоступен или что
// страницу открыли без сети. Происхождение каждого кадра — concept/references.md.
const img = (file) => `../img/${file}`;

// обложка события — по началу названия. Порядок важен: более длинное название
// стоит первым, иначе «Board games evening at home» ушло бы в «Board games»
const PHOTOS = [
  ['Board games evening', 'ev-home'],   // настолка крупным планом
  ['Board games', 'ev-games'],          // настольные игры во дворе
  ['Morning run', 'ev-run'],            // бегуны на набережной
  ['Coffee and a walk', 'ev-coffee'],   // две девушки с кофе на прогулке
];

// портреты — из concept/references.md, кадрированы по лицу при скачивании.
// Два размера: 720 на карточку во всю площадь, 96 на кружок рядом с именем
const face = (slug, big = false) => img(`${slug}-${big ? 720 : 96}.jpg`);
const FACES = {
  dasha: 'dasha',    // «B, профиль» — женщина в очках, это я
  olena: 'olena',    // «A, профиль» — женщина с кудрявыми волосами
  andrii: 'andrii',  // «C, профиль» — мужчина в коричневой куртке
};
// чей экран — тот и на снимке; верификация показывает своё лицо в камере
const PORTRAIT_BY_SCREEN = [
  [/^my-profile/, FACES.dasha],
  [/^verify/, FACES.dasha],
  [/^(deck|profile|match)/, FACES.olena],
];
const portraitFor = (name) =>
  face((PORTRAIT_BY_SCREEN.find(([re]) => re.test(name)) || [null, FACES.dasha])[1], true);

// маленький кружок рядом с именем: по имени в той же строке, иначе — по очереди
// Радар: свой набор, все снимки разные — сверены в concept/references.md.
// Семь портретов и пять обложек ровно по числу мест на радаре.
const RADAR_FACES = ['r-face-1', 'r-face-2', 'r-face-3', 'r-face-4',
  'r-face-5', 'r-face-6', 'r-face-7'];
// На радаре снимок живёт в кружке 40–72px: он должен читаться с одного взгляда.
// Вечер дома (карты и фишки на зелёном сукне) в таком кружке превращается
// в зелёное пятно, поэтому там стоит пикник — у него видно людей.
const RADAR_EVENTS = ['ev-games', 'ev-run', 'ev-coffee', 'ev-picnic', 'ev-park'];

// У каждого имени своё лицо: в одной строке их бывает несколько,
// и три одинаковых кружка читаются как ошибка данных.
const AVATAR_BY_NAME = [
  ['Olena', FACES.olena],
  ['Andrii', FACES.andrii],
  ['Dasha', FACES.dasha],
  ['Maryna', 'maryna'],
  ['Olha', 'olha'],
  ['Ihor', 'ihor'],
];

// иконка — по подписи, которая стоит сразу после пустой .ico
const ICON_BY_LABEL = {
  Edit: 'pen-new-square',
  Filters: 'tuning-2',
  Post: 'add',
  People: 'users-group-rounded',
  Events: 'ticket',
  Search: 'magnifer',
  Chats: 'chat-round-dots',
  Profile: 'user-rounded',
  Verified: 'verified-check',
  Report: 'flag',
};

// иконки без подписи рядом: смысл берётся из места, а не из слова (D-62)
const ICON_BY_PLACE = [
  // в поле иконка контурная: поле ничего не утверждает, оно ждёт ввода
  [/<form class="field" role="search">\s*<span class="ico[^"]*" aria-hidden="true"><\/span>/, 'magnifer', ICONS_LINEAR],
  [/<label class="field" for="msg">\s*<span class="ico[^"]*" aria-hidden="true"><\/span>/, 'chat-round-dots', ICONS_LINEAR],
  [/<span class="ico[^"]*" aria-hidden="true"><\/span>~/, 'map-point'],
  [/<span class="retry ico[^"]*" aria-hidden="true"><\/span>/, 'danger-circle'],
];

const svg = (name, dir = ICONS) =>
  readFileSync(join(dir, `${name}.svg`), 'utf8').trim()
    .replace('width="1em" height="1em" ', '')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');


// ── дерево экранов концепта: ветки и порядок те же, что у вайрфреймов ──
// Рядом с полосой разделов: из экрана видно весь набор и то, где ты в нём.
const link = (file, title, current, cls = '') => (file === current
  ? `<b${cls ? ` class="${cls}"` : ''} aria-current="page">${title}</b>`
  : `<a${cls ? ` class="${cls}"` : ''} href="${file}.html">${title}</a>`);

const tree = (current) => `<nav class="wfnav" aria-label="Экраны концепта">
  <p class="h">Экраны</p>
  <ul>
${BRANCHES.map((b, bi) => {
  const hereGroup = b.screens.some((scr) => [scr, ...scr.pages].some((x) => x.file === current));
  return `    <li class="grp${hereGroup ? ' now' : ''}">
      <p class="gt"><span class="gn">${bi + 1}</span>${b.title}</p>
      <ul>
${b.screens.map((scr) => {
    const here = [scr, ...scr.pages].some((x) => x.file === current);
    return `        <li class="scr${here ? ' now' : ''}">${scr.file === current
      ? `<b class="s" aria-current="page">${scr.title}</b>`
      : `<a class="s" href="${scr.file}.html"${here ? ' aria-current="true"' : ''}>${scr.title}</a>`}</li>`;
  }).join('\n')}
      </ul>
    </li>`;
}).join('\n')}
  </ul>
  <p class="n">Дерево: ветка → экран. Состояния экрана — полосой над мокапом.
    Экраны собираются из вайрфреймов скриптом build-concept-screens.mjs:
    текст и структура те же, добавлены фото, цвет, шрифт и иконки.</p>
</nav>`;

// ── Экран, одетый в кит ───────────────────────────────────────────────
// Структура и текст остаются из вайрфрейма — меняются только имена классов,
// и ровно там, где у кита есть компонент. Класс, которому перевода нет,
// валит сборку: молча оставить чужое имя значит оставить экран без стиля.
//
// Список рос по группам, и теперь в нём все 49 страниц: второй путь —
// сборка на concept/components.css — больше ни одним экраном не используется.
// Развилку не убираем: она держит правило «класс без перевода валит сборку»
// и понадобится новому экрану, пока его классы не переведены.
const KIT = new Set([
  // образцы, на которых проверено, что вид не изменился
  'feed', 'my-profile', 'my-profile-loading',
  // 1. Вход в продукт
  'radar',
  // 2. Колода и совпадение
  'deck', 'deck-empty', 'deck-error', 'deck-loading', 'match',
  // 3. Человек
  'profile', 'profile-empty', 'profile-loading',
  'verify', 'verify-error', 'verify-loading', 'verify-success', 'verify-waiting', 'verify-success-signup',
  // 4. Чат
  'chats', 'chats-empty', 'chats-error', 'chats-loading',
  'dialog', 'dialog-empty', 'dialog-error', 'dialog-loading', 'dialog-success', 'dialog-waiting',
  'invite', 'invite-empty', 'invite-error', 'invite-success', 'invite-waiting',
  // 5. Запрос на компанию
  'feed-empty', 'feed-error', 'feed-loading',
  'my-events', 'my-events-empty', 'my-events-error', 'my-events-loading',
  'plan', 'plan-error', 'plan-loading', 'plan-success', 'plan-waiting',
  // 6. Поиск
  'search', 'search-empty', 'search-error', 'search-loading',
]);

// имена, которые переводятся один в один
const CLASS_MAP = {
  app: 'mm-app', pane: 'mm-pane', scrolly: 'mm-scrolly', stretch: 'mm-stretch', pin: 'mm-pin',
  rows: 'mm-list', exit: 'mm-btn', who: 'mm-facts', when: 'mm-meta', note: 'mm-note',
  common: 'mm-common', distance: 'mm-distance', signals: 'mm-signals', verified: 'mm-verified',
  photo: 'mm-photo', pager: 'mm-pager', cardtop: 'mm-cardtop', chip: 'mm-chip', tags: 'mm-tags',
  cardlink: 'mm-cardlink', avatar: 'mm-avatar', evcover: 'mm-evcover', msgs: 'mm-msgs',
  field: 'mm-field', banner: 'mm-banner', skelrow: 'mm-skelrow', vh: 'mm-vh', screen: 'mm-screen',
  'state-ico': 'mm-state-ico', promise: 'mm-promise', radar: 'mm-radar', rings: 'mm-rings',
  pins: 'mm-pins', band: 'mm-band', scan: 'mm-scan', ico: 'mm-ico',
  // размер иконки задаёт место, где она стоит, а не её собственный класс
  sm: null, lg: null,
};

// мокап телефона и подписи зон — обвязка страницы макета, а не продукт
const CHROME = new Set(['device', 'statusbar', 'browserbar', 'homebar', 'fold', 'anns', 'ann',
  'wfstates', 'wfbar', 'wfdev', 'wfkind', 'meta', 'now', 't', 'bare']);
// кольца радара и места снимков на них — часть компонента, имена те же
const RADAR_PARTS = new Set(['near', 'mid', 'far', 'in', 'r5', 'r3', 'r1',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']);

function dressInKit(body, name) {
  // Комментарии прячем на время перевода: в них цитируется разметка
  // («конвенции §2 — <dialog open>»), и замены правили цитату, а не экран.
  const notes = [];
  let s = body.replace(/<!--[\s\S]*?-->/g, (m) => {
    notes.push(m);
    return `\u0000${notes.length - 1}\u0000`;
  });

  // 1. шапка: заголовок, кнопки, возврат
  s = s.replace(/<header([^>]*)>([\s\S]*?)<\/header>/, (m, attrs, inner) => {
    const stack = /\bstack\b/.test(attrs);
    let h = inner;
    h = h.replace(/<h1([^>]*)>/, (t, a) => (/class="/.test(a)
      ? `<h1${a.replace(/class="([^"]*)"/, 'class="$1 mm-head-title"')}>`
      : `<h1 class="mm-head-title"${a}>`));
    h = h.replace(/<div class="row">/, '<div class="mm-head-line">');
    // жалоба: слово остаётся видимым — флажок без подписи не читается
    h = h.replace(/<button type="button" class="report">([\s\S]*?)<\/button>/,
      (b, inner2) => `<button type="button" class="mm-head-btn mm-head-btn--danger">${inner2.replace(/<span class="label">([^<]*)<\/span>/, '$1')}</button>`);
    h = h.replace(/<button type="button" class="primary"([^>]*)>/, '<button type="button" class="mm-head-btn mm-head-btn--primary"$1>');
    h = h.replace(/<button type="button"((?:(?!class=)[^>])*)>/g, '<button type="button" class="mm-head-btn"$1>');
    h = h.replace(/<a class="back"/, '<a class="mm-head-btn mm-head-btn--back"');
    h = h.replace(/<span class="label">/g, '<span class="mm-vh">');
    return `<header class="mm-head${stack ? ' mm-head--stack' : ''}">${h}</header>`;
  });

  // 2. нижнее меню: активная вкладка одна
  s = s.replace(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/, (m, inner) =>
    `<nav class="mm-tabs" aria-label="Main navigation">${inner.replace(/<a ([^>]*)>/g, (a, attrs) =>
      `<a class="mm-tab${/aria-current/.test(attrs) ? ' is-current' : ''}" ${attrs}>`)}</nav>`);

  // 3. карточка события
  s = s.replace(/<li class="item ev">([\s\S]*?)<\/li>/g, (li, inner) =>
    `<li class="mm-event">${inner
      .replace(/<span class="cover"/, '<span class="mm-cover"')
      .replace(/<span class="body">/, '<span class="mm-event-body">')
      .replace(/<(a|span) class="top"/, '<$1 class="mm-event-head"')
      .replace(/<span class="acts">/, '<span class="mm-event-acts">')}</li>`);

  // 4. строка списка
  s = s.replace(/class="item"/g, 'class="mm-row"');
  s = s.replace(/<span class="top">/g, '<span class="mm-row-head">');
  s = s.replace(/<a class="top"/g, '<a class="mm-event-head"');

  // 5. карточка человека, видоискатель верификации и снимки на радаре
  s = s.replace(/<article class="card"/g, '<article class="mm-person"');
  s = s.replace(/<section class="body skeleton"/g, '<section class="mm-person-body"');
  s = s.replace(/<section class="body"/g, '<section class="mm-person-body"');
  s = s.replace(/<p class="photo blur"/g, '<p class="mm-photo mm-photo--blur"');
  s = s.replace(/<figcaption>([^<]*)<\/figcaption>/g, '<figcaption class="mm-photo-cap">$1</figcaption>');
  s = s.replace(/<span class="thumb blur"><\/span>/g, '<span class="mm-skel mm-skel--thumb"></span>');
  s = s.replace(/(<section class="mm-person-body"[^>]*>[\s\S]*?)<h3>/g, '$1<h3 class="mm-subhead">');
  s = s.replace(/<span class="dot sm"/g, '<span class="mm-dot mm-dot--sm"');
  s = s.replace(/<span class="dot lg"/g, '<span class="mm-dot mm-dot--lg"');
  s = s.replace(/<span class="dot"/g, '<span class="mm-dot"');

  // 6. кнопки, строки действий, срез вкладки, подсказки в чате
  // Подсказки в пустом чате идут первыми: в разметке у них тот же класс, что
  // у тихой кнопки, и различает их только место — столбик p.rows. Переведём
  // позже — и они уедут в тихие, сиреневые, вперемешку с главным действием.
  // Своего вида у подсказки нет: это третичная кнопка с другим текстом,
  // а столбик задаёт раскладка .mm-list.
  s = s.replace(/<p class="rows">([\s\S]*?)<\/p>/g, (m, inner) =>
    `<p class="mm-list">${inner.replace(/class="btn quiet"/g, 'class="mm-btn"')}</p>`);
  s = s.replace(/class="btn primary"/g, 'class="mm-btn mm-btn--primary"');
  s = s.replace(/class="btn quiet"/g, 'class="mm-btn mm-btn--quiet"');
  s = s.replace(/class="btn"/g, 'class="mm-btn"');
  // кнопка в содержимом: шапку уже перевели выше, значит это она
  s = s.replace(/<button([^>]*)class="primary"/g, '<button$1class="mm-btn mm-btn--primary"');
  s = s.replace(/<button([^>]*)class="quiet"/g, '<button$1class="mm-btn mm-btn--quiet"');
  s = s.replace(/(<section aria-labelledby="seg-h">[\s\S]*?)<p class="row">([\s\S]*?)<\/p>/,
    (m, head, inner) => `${head}<p class="mm-segmented">${inner
      .replace(/class="mm-btn mm-btn--primary"/, 'class="mm-btn is-current"')
      .replace(/class="mm-btn mm-btn--quiet"/, 'class="mm-btn"')}</p>`);
  s = s.replace(/<p class="row">/g, '<p class="mm-actions">');

  // 7. пусто и сбой
  s = s.replace(/<article class="state" role="alert">/g, '<article class="mm-state mm-state--alert" role="alert">');
  s = s.replace(/<article class="state">/g, '<article class="mm-state">');

  // 8. заглушки: skel line w-l → mm-skel mm-skel--line mm-skel--w-l
  s = s.replace(/class="skel(?![a-z])([^"]*)"/g, (m, rest) =>
    `class="mm-skel${rest.trim().split(/\s+/).filter(Boolean).map((t) => ` mm-skel--${t}`).join('')}"`);

  // 9. переписка
  s = s.replace(/class="bubble me failed"/g, 'class="mm-bubble mm-bubble--failed"');
  s = s.replace(/class="bubble me"/g, 'class="mm-bubble mm-bubble--mine"');
  s = s.replace(/class="bubble"/g, 'class="mm-bubble"');
  s = s.replace(/<span class="t">/g, '<span class="mm-bubble-time">');
  s = s.replace(/class="retry ico( sm)?"/g, 'class="mm-bubble-retry"');

  // 10. полосы по числу фотографий: закрашенная — открытая
  s = s.replace(/(<p class="pager"[^>]*>)([\s\S]*?)(<\/p>)/g,
    (m, open, inner, close) => open + inner.replace(/<span class="on">/g, '<span class="is-current">') + close);

  // 11. слой совпадения поверх колоды
  s = s.replace(/<dialog open([^>]*)>/, '<dialog open class="mm-layer"$1>');

  // 12. отметка проверки: в ките это одна лейба, а не первый пункт строки сигналов
  s = s.replace(/<li><span class="ico sm" aria-hidden="true">(<svg[\s\S]*?<\/svg>)<\/span>Verified<\/li>/g,
    '<li><span class="mm-verified">$1Verified</span></li>');

  // 13. всё остальное — по карте имён; чужое имя валит сборку
  s = s.replace(/class="([^"]*)"/g, (m, value) => {
    const out = [];
    for (const t of value.split(/\s+/).filter(Boolean)) {
      if (t.startsWith('mm-') || t === 'is-current' || CHROME.has(t) || RADAR_PARTS.has(t)) { out.push(t); continue; }
      if (!(t in CLASS_MAP)) throw new Error(`${name}: класс «${t}» не переведён в кит — экран остался бы без стиля`);
      if (CLASS_MAP[t]) out.push(CLASS_MAP[t]);
    }
    return `class="${out.join(' ')}"`;
  });

  // 14. заголовки содержимого: имя человека 22px, заголовок блока 18px.
  // Внутри состояния заголовок ведёт сам блок — его не трогаем.
  //
  // Имя `.mm-subhead` на «Мои события» становится узким: там тем же
  // шагом 22px набран заголовок группы строк («Requests to confirm»), а не имя
  // человека. Класс оставлен как есть — вид от него не меняется, — но роли
  // у 22px в ките две, и имя у неё одно, по содержимому. Решать, свести ли
  // их под одно имя по роли или опустить заголовок группы до 18px (`.mm-h2`,
  // «Title» в DESIGN.md — там 22px в иерархии вообще нет), должен дизайнер.
  s = s.replace(/<article class="mm-state[^"]*"[^>]*>[\s\S]*?<\/article>/g,
    (m) => m.replace(/<h([123])>/g, '<h$1 data-in-state>'));
  s = s.replace(/<h2(?![^>]*(?:class=|hidden|data-in-state))([^>]*)>/g, '<h2 class="mm-h2"$1>');
  s = s.replace(/<h3(?![^>]*(?:class=|data-in-state))([^>]*)>/g, '<h3 class="mm-subhead"$1>');
  s = s.replace(/ data-in-state/g, '');

  // 15. секция экрана: шаг между блоками
  s = s.replace(/<section(?![^>]*class=)([^>]*)>/g, '<section class="mm-section"$1>');

  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => notes[Number(i)]);
}

mkdirSync(OUT, { recursive: true });

for (const name of SCREENS) {
  const src = readFileSync(join(ROOT, 'wireframes', `${name}.html`), 'utf8');

  const title = src.match(/<title>([^<]*)<\/title>/)[1].replace('MeetMates wireframe', 'MeetMates · концепт R');
  const docComment = (src.match(/<!--[\s\S]*?-->/) || [''])[0];
  const from = src.indexOf('<!-- states:start -->');
  const to = src.lastIndexOf('</body>');
  if (from < 0 || to < 0) throw new Error(`${name}: нет меток states:start или </body>`);
  let body = src.slice(from, to);

  // 3. фото в обложки
  body = body.replace(/<li class="item ev">([\s\S]*?)<\/li>/g, (li, inner) => {
    const t = (inner.match(/<b>([^<]*)<\/b>/) || [])[1] || '';
    // карточка-заглушка: названия нет, потому что данные ещё не пришли —
    // обложка остаётся серым прямоугольником, местом под фотографию
    if (!t && /class="skel/.test(inner)) return li;
    const hit = PHOTOS.find(([k]) => t.startsWith(k));
    if (!hit) throw new Error(`${name}: нет фото для события «${t}»`);
    // снимок встаёт первым внутрь обложки: поверх него могут уже лежать
    // отметка проверки и расстояние, и они должны остаться выше фотографии
    return li.replace(/<span class="cover"([^>]*)>/,
      `<span class="cover"$1><img src="${img(hit[1] + '.jpg')}" alt="" loading="lazy">`);
  });
  // В заглушке обложка пустая нарочно: фотографии ещё нет, и серый
  // прямоугольник .mm-cover — это и есть место под неё. Проверка смотрит
  // только на рабочие карточки, не на списки с aria-hidden.
  const liveCovers = body.replace(/<ul class="rows" aria-hidden="true">[\s\S]*?<\/ul>/g, '');
  // обложка без снимка: внутри может лежать что угодно, но <img> обязан быть
  for (const m of liveCovers.matchAll(/<span class="(?:mm-)?cover"[^>]*>([\s\S]*?)<\/span>\s*<span class="(?:mm-)?(?:event-)?body"/g)) {
    if (!/<img/.test(m[1])) throw new Error(`${name}: осталась пустая обложка`);
  }

  // 4. иконки по подписи
  body = body.replace(/<span class="ico( lg| sm)?" aria-hidden="true"><\/span>([A-Za-z]+)/g, (m, size, label) => {
    const icon = ICON_BY_LABEL[label];
    if (!icon) throw new Error(`${name}: нет иконки для «${label}»`);
    return `<span class="ico${size || ''}" aria-hidden="true">${svg(icon)}</span>${label}`;
  });
  for (const [re, icon, dir] of ICON_BY_PLACE) {
    body = body.replace(new RegExp(re.source, 'g'), (m) =>
      m.replace('</span>', `${svg(icon, dir || ICONS)}</span>`));
  }
  if (/<span class="ico[^"]*" aria-hidden="true"><\/span>/.test(body)) throw new Error(`${name}: осталась пустая иконка`);

  // 4а. нижнее меню: активной вкладке — залитая иконка, остальным контурная (D-62)
  body = body.replace(/<nav aria-label="Main navigation">[\s\S]*?<\/nav>/, (nav) =>
    nav.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, (a) => {
      if (a.includes('aria-current="page"')) return a;
      const label = (a.match(/<\/span>([A-Za-z]+)<\/a>/) || [])[1];
      const icon = ICON_BY_LABEL[label];
      if (!icon) throw new Error(`${name}: нет контурной иконки для вкладки «${label}»`);
      return a.replace(/<svg\b[\s\S]*?<\/svg>/, svg(icon, ICONS_LINEAR));
    }));

  // 3а. обещание на радаре: mates и events — заглавными на лаймовой подложке.
  // Лаймовым текстом нельзя: #D9F56F на светлом фоне даёт 1,2:1 (нужно 4,5).
  body = body.replace(/(<h1[^>]*class="promise"[^>]*>)([\s\S]*?)(<\/h1>)/, (m, open, inner, close) =>
    open + inner.replace(/(mates|events)/g, '<mark>$1</mark>') + close);

  // 3в. радар: точки заменяются лицами и обложками, подпись уходит к скринридеру.
  // Снимки — те же, что везде: портреты и обложки событий из references.md.
  {
    let ev = 0, fa = 0;
    // портрет кадрируется по лицу, обложка — по центру: у стола с настолкой лица нет
    const take = (list, i, what) => {
      if (i >= list.length) throw new Error(`${name}: на радаре мест больше, чем сверенных снимков (${what})`);
      return img(`${list[i]}.jpg`);
    };
    body = body.replace(/<li class="([a-g])"><span class="dot( sm| lg)?" aria-hidden="true"><\/span>(Event|Person)<\/li>/g,
      (m, pos, size, kind) => {
        const src = kind === 'Event' ? take(RADAR_EVENTS, ev++, 'обложки') : take(RADAR_FACES, fa++, 'портреты');
        return `<li class="${pos}"><span class="dot${size || ''}" aria-hidden="true">`
          + `<img src="${src}" alt="" loading="lazy"></span><span class="vh">${kind}</span></li>`;
      });
    // волна поиска: отдельный круг, кольца расстояний остаются на месте
    body = body.replace('<p class="rings"', '<span class="scan" aria-hidden="true"></span><p class="rings"');
    // колец больше: подписаны по-прежнему три, остальные — только рисунок
    body = body.replace('<span class="mid"></span><span class="in"></span>',
      '<span class="r5"></span><span class="mid"></span><span class="r3"></span>'
      + '<span class="in"></span><span class="r1"></span>');
    // найденных больше: шесть снимков по кругу вдобавок к семи из вайрфрейма
    body = body.replace('</ul>\n      </figure>', ['h', 'i', 'j', 'k', 'l'].map((pos, n) => {
      const kind = n % 2 ? 'Event' : 'Person';
      const src = kind === 'Event' ? take(RADAR_EVENTS, ev++, 'обложки') : take(RADAR_FACES, fa++, 'портреты');
      const size = n % 3 === 0 ? ' sm' : (n % 3 === 1 ? '' : ' lg');
      return `<li class="${pos}"><span class="dot${size}" aria-hidden="true">`
        + `<img src="${src}" alt="" loading="lazy"></span><span class="vh">${kind}</span></li>`;
    }).join('') + '</ul>\n      </figure>');
  }

  // 3б. портрет в карточке профиля — на месте серой плашки .photo
  // обложка на карточке события — по названию события в заголовке экрана
  body = body.replace(/(<figure class="evcover">\s*)<p class="photo"[^>]*><\/p>/g, (m, head) => {
    const t = (src.match(/<h1[^>]*>([^<]*)<\/h1>/) || [])[1] || '';
    const hit = PHOTOS.find(([k]) => t.startsWith(k));
    if (!hit) throw new Error(`${name}: нет обложки для события «${t}»`);
    // на карточке события снимок идёт во всю ширину — берём широкий кадр
    return `${head}<p class="photo"><img src="${img(hit[1] + '-wide.jpg')}" alt="" loading="lazy"></p>`;
  });
  body = body.replace(/<p class="photo( blur)?"(?: aria-hidden="true")?><\/p>/g,
    (m, blur) => `<p class="photo${blur || ''}"><img src="${portraitFor(name)}" alt="" loading="lazy"></p>`);

  // кружки рядом с именем
  let avatarTurn = 0;
  body = body.replace(/<(span|p)([^>]*)class="([^"]*\bwho\b[^"]*)"([^>]*)>([\s\S]*?)<\/\1>/g, (block) => {
    // имена берём в том порядке, в каком они стоят в строке, и раздаём кружкам по одному
    const named = AVATAR_BY_NAME
      .map(([name, id]) => [block.indexOf(name), id])
      .filter(([at]) => at >= 0)
      .sort((a, b) => a[0] - b[0])
      .map(([, id]) => id);
    let i = 0;
    return block.replace(/<span class="avatar"( aria-hidden="true")?><\/span>/g, (av, hid) => {
      const id = named[i] || Object.values(FACES)[avatarTurn++ % 3];
      i += 1;
      return `<span class="avatar"${hid || ''}><img src="${face(id)}" alt="" loading="lazy"></span>`;
    });
  });
  body = body.replace(/<span class="avatar"( aria-hidden="true")?><\/span>/g, (av, hid) => {
    const id = Object.values(FACES)[avatarTurn++ % 3];
    return `<span class="avatar"${hid || ''}><img src="${face(id)}" alt="" loading="lazy"></span>`;
  });

  // 4б. кнопки шапки — только иконка: подпись остаётся в разметке, но скрыта для глаз
  body = body.replace(/<header[^>]*>[\s\S]*?<\/header>/, (h) =>
    h.replace(/(<\/svg><\/span>)([^<]+)(<\/button>)/g, '$1<span class="label">$2</span>$3')
      // жалобу подписываем словом: флажок без подписи не читается (решение дизайнера)
      .replace(/<button type="button">(?=(?:(?!<\/button>)[\s\S])*<span class="label">Report<)/,
        '<button type="button" class="report">'));

  // 5. отметка Verified — одинаковая в каждой строке (D-57, правило 12).
  // Строка бывает и span, и p, и начинается с аватара — у автора запроса
  // и у человека в выдаче поиска. Прежнее правило требовало, чтобы до слова
  // не было ни одного тега, и эти две строки оставались словом без лейбы.
  // Строку-значение в глубоком слое (Verification | Verified) это не трогает:
  // там класс не who, и это состояние в списке, а не отметка о человеке.
  body = body.replace(
    /(<(?:span|p) class="who">(?:<span class="avatar"[^>]*>[\s\S]*?<\/span>)?[^<]*?)Verified/g,
    (m, head) => `${head}<span class="verified">${svg('verified-check')}Verified</span>`);

  // 5б. скрытые заголовки зон: атрибут hidden убирает их из дерева доступности
  // целиком — aria-labelledby ещё работает, а самого заголовка скринридер
  // не слышит, и между h1 и h3 структуры нет. В ките для этого есть .mm-vh:
  // он прячет от глаз и оставляет в дереве (§8.1 — скрытый заголовок такой же
  // копирайт). Класс добавляем, не трогая id, на который ссылаются секции.
  body = body.replace(/<(h[1-6])([^>]*?)\shidden(\s[^>]*)?>/g,
    (m, tag, before, after) => `<${tag}${before}${after || ''} class="vh">`);

  // 6. иконка состояния: ошибка — опасность, пусто — событие
  body = body.replace(/<article class="state"( role="alert")?>/g, (m, alert) =>
    `${m}\n        <span class="state-ico" aria-hidden="true">${svg(alert ? 'danger-circle' : 'ticket')}</span>`);

  // 6б. переключатель набора: страница пришла из вайрфрейма, активен там другой
  body = body.replace(/<nav class="wfkind"[\s\S]*?<\/nav>/, kindBar('design', name));

  // 7. ссылки: внутри концепта — как есть, остальное — в вайрфреймы
  body = body.replace(/href="([a-z0-9-]+\.html)(#[^"]*)?"/g, (m, file, hash = '') =>
    SCREENS.includes(file.replace('.html', '')) ? m : `href="../../wireframes/${file}${hash}"`);

  // 8. вид: одетый в кит экран берёт его из ui/kit.css, остальные — по-старому
  const kit = KIT.has(name);
  if (kit) body = dressInKit(body, name);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<!-- Сгенерировано scripts/build-concept-screens.mjs из wireframes/${name}.html — руками не править. -->
${docComment}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Шрифт тот же, что в tokens.css: Figtree. Экраны грузили Geist, а токен
     называл Figtree — значит ни один экран не рисовался тем, что утверждено,
     и все они показывали системный запасной шрифт. -->
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="screens.css">
${kit ? '<link rel="stylesheet" href="../../ui/kit.css">\n' : ''}</head>
<body class="${kit ? 'kit' : 'mm-ui'}">
<i id="bare" hidden></i>
${rail({ prefix: '../../', current: '06' })}
${tree(name)}
${body.trim()}
</body>
</html>
`;
  writeFileSync(join(OUT, `${name}.html`), html);
}

console.log(`концепт: ${SCREENS.length} экранов → concept/screens/ (${SCREENS.join(', ')})`);
