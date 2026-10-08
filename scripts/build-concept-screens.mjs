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
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'concept/screens');
const ICONS = join(ROOT, 'concept/icons/solar-bold');

// какие экраны собираем; ссылки между ними остаются внутри концепта
const SCREENS = ['feed', 'feed-empty', 'feed-error', 'feed-loading'];

// фото события — по началу названия; проверены, список в concept/references.md
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?w=320&h=360&fit=crop&q=75&auto=format`;
const PHOTOS = [
  ['Board games', unsplash('1715860738421-b30b98f8614f')],          // настольные игры во дворе
  ['Morning run', unsplash('1739368732843-800f36a9b7d0')],          // бегуны на набережной
  ['Coffee and a walk', unsplash('1758525223193-1bd8fca96ef3')],    // две девушки с кофе на прогулке
];

// иконка — по подписи, которая стоит сразу после пустой .ico
const ICON_BY_LABEL = {
  Filters: 'tuning-2',
  Post: 'add',
  People: 'users-group-rounded',
  Events: 'ticket',
  Search: 'magnifer',
  Chats: 'chat-round-dots',
  Profile: 'user-rounded',
};

const svg = (name) =>
  readFileSync(join(ICONS, `${name}.svg`), 'utf8').trim()
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ');


// ── дерево экранов концепта: та же служебная навигация, что у вайрфреймов ──
// Рядом с полосой разделов: из экрана видно весь набор и то, где ты в нём.
const TITLES = {
  'feed': 'рабочий вид',
  'feed-empty': 'пусто',
  'feed-error': 'ошибка',
  'feed-loading': 'загрузка',
};
const tree = (current) => `<nav class="wfnav" aria-label="Экраны концепта">
  <p class="h">Концепт</p>
  <p class="t">Направление D «Стекло» · ${SCREENS.length} из ${SCREENS.length}</p>
  <ul>
    <li class="grp">
      <p class="gt"><span class="gn">1</span>Лента событий</p>
      <ul>
        <li class="scr${current === SCREENS[0] ? ' now' : ''}">${current === SCREENS[0]
          ? `<b class="s" aria-current="page">Лента событий</b>`
          : `<a class="s" href="${SCREENS[0]}.html">Лента событий</a>`}
          <ul>
${SCREENS.slice(1).map((n) => `            <li>${n === current
    ? `<b aria-current="page">${TITLES[n]}</b>`
    : `<a href="${n}.html">${TITLES[n]}</a>`}</li>`).join('\n')}
          </ul>
        </li>
      </ul>
    </li>
  </ul>
  <p class="n">Экраны собираются из вайрфреймов скриптом build-concept-screens.mjs:
    текст и структура те же, добавлены фото, цвет, шрифт и иконки.</p>
</nav>`;

mkdirSync(OUT, { recursive: true });

for (const name of SCREENS) {
  const src = readFileSync(join(ROOT, 'wireframes', `${name}.html`), 'utf8');

  const title = src.match(/<title>([^<]*)<\/title>/)[1].replace('MeetMates wireframe', 'MeetMates · концепт D');
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
  body = body.replace(/<span class="ico( lg)?" aria-hidden="true"><\/span>([A-Za-z]+)/g, (m, lg, label) => {
    const icon = ICON_BY_LABEL[label];
    if (!icon) throw new Error(`${name}: нет иконки для «${label}»`);
    return `<span class="ico${lg || ''}" aria-hidden="true">${svg(icon)}</span>${label}`;
  });
  if (/<span class="ico[^"]*" aria-hidden="true"><\/span>/.test(body)) throw new Error(`${name}: осталась пустая иконка`);

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
