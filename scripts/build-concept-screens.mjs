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
// Стили — concept/screens/screens.css (устройство) + concept/components.css (компоненты,
// общие со стендом); значения — только из concept/tokens.css.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { rail } from './lib/chrome.mjs';
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

// фото события — по началу названия; проверены, список в concept/references.md
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?w=320&h=360&fit=crop&q=75&auto=format`;
const PHOTOS = [
  ['Board games', unsplash('1715860738421-b30b98f8614f')],          // настольные игры во дворе
  ['Morning run', unsplash('1739368732843-800f36a9b7d0')],          // бегуны на набережной
  ['Coffee and a walk', unsplash('1758525223193-1bd8fca96ef3')],    // две девушки с кофе на прогулке
];

// портреты — из concept/references.md, кадрируются по лицу
const face = (id, w = 720, h = 560) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=faces&q=75&auto=format`;
const FACES = {
  dasha: '1758599543111-36ce5c34fceb',   // «B, профиль» — женщина в очках, это я
  olena: '1662850886700-4ec19bd30d11',   // «A, профиль» — женщина с кудрявыми волосами
  andrii: '1525457136159-8878648a7ad0',  // «C, профиль» — мужчина в коричневой куртке
};
// чей экран — тот и на снимке; верификация показывает своё лицо в камере
const PORTRAIT_BY_SCREEN = [
  [/^my-profile/, FACES.dasha],
  [/^verify/, FACES.dasha],
  [/^(deck|profile|match)/, FACES.olena],
];
const portraitFor = (name) =>
  face((PORTRAIT_BY_SCREEN.find(([re]) => re.test(name)) || [null, FACES.dasha])[1]);

// маленький кружок рядом с именем: по имени в той же строке, иначе — по очереди
const AVATAR_BY_NAME = [
  [/Olena/, FACES.olena],
  [/Andrii/, FACES.andrii],
  [/Maryna|Olha|Dasha/, FACES.dasha],
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
  [/<form class="field" role="search">\s*<span class="ico[^"]*" aria-hidden="true"><\/span>/, 'magnifer'],
  [/<label class="field" for="msg">\s*<span class="ico[^"]*" aria-hidden="true"><\/span>/, 'chat-round-dots'],
  [/<span class="ico[^"]*" aria-hidden="true"><\/span>~/, 'map-point'],
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
  <p class="h">Концепт</p>
  <p class="t">Направление R «Сирень» · ${SCREENS.length} страниц</p>
  <ul>
${BRANCHES.map((b, bi) => `    <li class="grp">
      <p class="gt"><span class="gn">${bi + 1}</span>${b.title}</p>
      <ul>
${b.screens.map((scr) => `        <li class="scr${[scr, ...scr.pages].some((x) => x.file === current) ? ' now' : ''}">${link(scr.file, scr.title, current, 's')}${scr.pages.length ? `
          <ul>
${scr.pages.map((pg) => `            <li>${link(pg.file, pg.title, current)}</li>`).join('\n')}
          </ul>
        ` : ''}</li>`).join('\n')}
      </ul>
    </li>`).join('\n')}
  </ul>
  <p class="n">Экраны собираются из вайрфреймов скриптом build-concept-screens.mjs:
    текст и структура те же, добавлены фото, цвет, шрифт и иконки.</p>
</nav>`;

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
    const hit = PHOTOS.find(([k]) => t.startsWith(k));
    if (!hit) throw new Error(`${name}: нет фото для события «${t}»`);
    return li.replace('<span class="cover" aria-hidden="true"></span>',
      `<span class="cover" aria-hidden="true"><img src="${hit[1]}" alt="" loading="lazy"></span>`);
  });
  if (/<span class="cover"[^>]*><\/span>/.test(body)) throw new Error(`${name}: осталась пустая обложка`);

  // 4. иконки по подписи
  body = body.replace(/<span class="ico( lg| sm)?" aria-hidden="true"><\/span>([A-Za-z]+)/g, (m, size, label) => {
    const icon = ICON_BY_LABEL[label];
    if (!icon) throw new Error(`${name}: нет иконки для «${label}»`);
    return `<span class="ico${size || ''}" aria-hidden="true">${svg(icon)}</span>${label}`;
  });
  for (const [re, icon] of ICON_BY_PLACE) {
    body = body.replace(new RegExp(re.source, 'g'), (m) =>
      m.replace('</span>', `${svg(icon)}</span>`));
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

  // 3б. портрет в карточке профиля — на месте серой плашки .photo
  // обложка на карточке события — по названию события в заголовке экрана
  body = body.replace(/(<figure class="evcover">\s*)<p class="photo"[^>]*><\/p>/g, (m, head) => {
    const t = (src.match(/<h1[^>]*>([^<]*)<\/h1>/) || [])[1] || '';
    const hit = PHOTOS.find(([k]) => t.startsWith(k));
    if (!hit) throw new Error(`${name}: нет обложки для события «${t}»`);
    return `${head}<p class="photo"><img src="${hit[1].replace('w=320&h=360', 'w=780&h=440')}" alt="" loading="lazy"></p>`;
  });
  body = body.replace(/<p class="photo( blur)?"(?: aria-hidden="true")?><\/p>/g,
    (m, blur) => `<p class="photo${blur || ''}"><img src="${portraitFor(name)}" alt="" loading="lazy"></p>`);

  // кружки рядом с именем
  let avatarTurn = 0;
  body = body.replace(/<(span|p)([^>]*)class="([^"]*\bwho\b[^"]*)"([^>]*)>([\s\S]*?)<\/\1>/g, (block) =>
    block.replace(/<span class="avatar"( aria-hidden="true")?><\/span>/g, (av, hid) => {
      const hit = AVATAR_BY_NAME.find(([re]) => re.test(block));
      const id = hit ? hit[1] : Object.values(FACES)[avatarTurn++ % 3];
      return `<span class="avatar"${hid || ''}><img src="${face(id, 96, 96)}" alt="" loading="lazy"></span>`;
    }));
  body = body.replace(/<span class="avatar"( aria-hidden="true")?><\/span>/g, (av, hid) => {
    const id = Object.values(FACES)[avatarTurn++ % 3];
    return `<span class="avatar"${hid || ''}><img src="${face(id, 96, 96)}" alt="" loading="lazy"></span>`;
  });

  // 4б. кнопки шапки — только иконка: подпись остаётся в разметке, но скрыта для глаз
  body = body.replace(/<header>[\s\S]*?<\/header>/, (h) =>
    h.replace(/(<\/svg><\/span>)([^<]+)(<\/button>)/g, '$1<span class="label">$2</span>$3'));

  // 5. отметка Verified — одинаковая в каждой строке
  body = body.replace(/(<span class="who">[^<]*?)Verified(<\/span>)/g,
    (m, a, b) => `${a}<span class="verified">${svg('verified-check')}Verified</span>${b}`);

  // 6. иконка состояния: ошибка — опасность, пусто — событие
  body = body.replace(/<article class="state"( role="alert")?>/g, (m, alert) =>
    `${m}\n        <span class="state-ico" aria-hidden="true">${svg(alert ? 'danger-circle' : 'ticket')}</span>`);

  // 7. ссылки: внутри концепта — как есть, остальное — в вайрфреймы
  body = body.replace(/href="([a-z0-9-]+\.html)(#[^"]*)?"/g, (m, file, hash = '') =>
    SCREENS.includes(file.replace('.html', '')) ? m : `href="../../wireframes/${file}${hash}"`);

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
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="screens.css">
</head>
<body class="mm-ui">
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
