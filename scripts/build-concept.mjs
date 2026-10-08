// Сборка раздела 06 «Концепт» — sections/concept.html.
//
// Источник текста — concept/concept.md: вкус, атрибуты, выбранное направление
// и те, что не выбраны. Страница собирается из него целиком; правим документ.
//
// Вторая вкладка — список самих страниц концепта: стенд стиля, сравнение
// с палитрой брифа, экраны ленты в стиле D и оба раунда направлений. Они
// нарисованы токенами продукта и открываются своими страницами, во всю ширину:
// фрейм внутри раздела заставлял бы скроллить дважды (так же решено у раздела 04).
//
// Запуск: node scripts/build-concept.mjs — после правки concept/concept.md.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline, md } from './lib/markdown.mjs';
import { subtabsHtml, TABS_CSS, tabsJs } from './lib/tabs.mjs';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const concept = read('concept/concept.md');
const shell = read('sections/index.html');

// ── страницы концепта ─────────────────────────────────────────────────
// Группы — по тому, зачем человек открывает страницу, а не по папкам.
const GROUPS = [
  {
    title: 'Стиль',
    note: 'Направление в собранном виде: на стенде видно каждое решение разом, в сравнении — почему ушла прежняя палитра брифа.',
    items: [
      { file: 'concept/concept.html', title: 'Стенд стиля D «Стекло»', note: 'Палитра, типографика, компоненты, иконки, проверка контраста — 19 пар' },
      { file: 'concept/d-compare.html', title: 'D против палитры брифа', note: 'Прежний градиент рядом с D: три токена ниже контраста, тема угадывается' },
    ],
  },
  {
    title: 'Экраны в стиле D',
    note: 'Лента событий во всех состояниях. Руками не правятся: разметку берёт из вайрфреймов <code>build-concept-screens.mjs</code> — поправили вайрфрейм, пересобрали экран.',
    items: [
      { file: 'concept/screens/feed.html', title: 'Лента событий', note: 'рабочий вид' },
      { file: 'concept/screens/feed-empty.html', title: 'Лента событий', note: 'пусто' },
      { file: 'concept/screens/feed-error.html', title: 'Лента событий', note: 'ошибка' },
      { file: 'concept/screens/feed-loading.html', title: 'Лента событий', note: 'загрузка' },
    ],
  },
  {
    title: 'Направления, которые не выбраны',
    note: 'Лежат целиком — к ним возвращаются по условию, записанному в концепте, а не рисуют заново.',
    items: [
      { file: 'concept/directions-2.html', title: 'Раунд 2: E «Ночная лента» и F «Кобальт»', note: 'ближе к вкусу «Instagram / Apple», тот же каркас карточки' },
      { file: 'concept/directions.html', title: 'Раунд 1: A «Смальта», B «Корешок», C «Линия»', note: 'отклонён целиком — «выглядит не современно»' },
    ],
  },
];

for (const g of GROUPS) {
  for (const it of g.items) {
    if (!existsSync(join(ROOT, it.file))) throw new Error(`в концепте нет страницы ${it.file} — список раздела отстал`);
  }
}

const pagesCount = GROUPS.reduce((n, g) => n + g.items.length, 0);

const cardsHtml = GROUPS.map((g) => `      <section class="grp">
        <h3>${esc(g.title)}</h3>
        <p class="intro">${g.note}</p>
        <ul class="cards">
${g.items.map((it) => `          <li><a href="../${it.file}"><b>${esc(it.title)}</b><span>${esc(it.note)}</span></a></li>`).join('\n')}
        </ul>
      </section>`).join('\n\n');

// ── разбор документа на разделы `## ` ─────────────────────────────────
function blocks(text) {
  const body = text.replace(/\r/g, '').replace(/^#[^#][^\n]*\n/, '');
  const out = [];
  const re = /^## (.+)$/gm;
  let m, prev = null, lastIndex = 0;
  while ((m = re.exec(body))) {
    if (prev) out.push({ title: prev, text: body.slice(lastIndex, m.index).trim() });
    else if (body.slice(0, m.index).trim()) out.push({ title: null, text: body.slice(0, m.index).trim() });
    prev = m[1];
    lastIndex = m.index + m[0].length;
  }
  if (prev) out.push({ title: prev, text: body.slice(lastIndex).trim() });
  return out;
}

const slugify = (s) => s.toLowerCase().replace(/[`*]/g, '').replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '');

// ссылки concept.md ведут от папки concept/, страница лежит в sections/
const infoHtml = blocks(concept).map((b) => {
  const html = md(b.text).replace(/href="\.\.\/(?!\.)/g, 'href="../concept/');
  return b.title
    ? `      <section id="${slugify(b.title)}">\n        <h2>${inline(b.title)}</h2>\n${html}\n      </section>`
    : html;
}).join('\n\n');

// ── боковая колонка ───────────────────────────────────────────────────
const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
const cur = /<a class="mat"([^>]*)href="concept\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html нет пункта 06 со ссылкой на concept.html — боковая колонка изменилась');
const subtabs = subtabsHtml([
  { id: 'info', title: 'Информация' },
  { id: 'screens', title: 'Экраны' },
]);
const aside = asideSrc.replace(cur, (m, attrs, head) =>
  `<a class="mat current"${attrs}href="concept.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);

// ── страница ──────────────────────────────────────────────────────────
const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Концепт · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Визуальное направление D «Стекло»: вкус, атрибуты, выбор и цена. Стенд стиля, экраны ленты и направления, которые не выбраны.">');

const extraCss = `
/* ── Раздел 06: концепт ─────────────────────────────────────── */
${TABS_CSS}

.grp { margin: 0 0 var(--s-6); }
.grp h3 { margin: 0 0 var(--s-2); }
.cards { list-style: none; margin: var(--s-3) 0 0; padding: 0; display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); }
.cards a {
  display: block; height: 100%;
  border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface);
  padding: var(--s-3) var(--s-4); text-decoration: none; color: var(--ink-900);
  transition: border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.cards a:hover, .cards a:focus-visible { border-color: var(--ink-400); background: var(--surface-2); }
.cards b { display: block; font-size: var(--t-body-sm); margin-bottom: 2px; }
.cards span { font-size: var(--t-caption); color: var(--ink-600); }

#info blockquote { margin: 0 0 var(--s-5); padding-left: var(--s-4); border-left: 2px solid var(--line); color: var(--ink-600); }
`;

const page = `${head}${extraCss}</style>
</head>
<body>

<a class="skip" href="#content">Перейти к материалу</a>

<div class="shell">

  ${aside}

  <main id="content">
    <div class="tabpanel" id="info">
    <div class="masthead">
      <h1>Концепт</h1>
      <p class="lede">Как продукт выглядит и ощущается — этап между структурой и дизайн-системой. Направление выбрано: <b>D «Стекло»</b> (<code class="dcode">D-61</code>) — светло-серый фон, белые карточки, одно оранжевое действие на экран, стекло только под меню, живые фото. Собрано из <a href="../concept/concept.md">concept.md</a>; страница пересобирается скриптом, руками не правится.</p>
      <div class="chips">
        <span><b>6</b> направлений в двух раундах</span>
        <span><b>1</b> выбрано — D</span>
        <span><b>${pagesCount}</b> страниц концепта</span>
        <span><b>19</b> пар цвета проверены</span>
      </div>
      <!--PUBLIC-NOTE-->
    </div>

${infoHtml}
    </div>

    <div class="tabpanel" id="screens">
      <h1 class="vh">Концепт: страницы</h1>
      <section id="pages">
        <h2>Страницы концепта</h2>
        <p class="intro">Открываются своими страницами, во всю ширину окна: они нарисованы токенами продукта, а не этого сайта, и фрейм внутри раздела заставлял бы скроллить дважды.</p>

${cardsHtml}
      </section>
    </div>

    <footer>
      <p>Раздел 6 из 12 · Концепт. Источник — <a href="../concept/concept.md">concept.md</a>; направление и палитра — <a href="../CLAUDE.md">CLAUDE.md</a> §8, решение — <a href="../DECISIONS.md">DECISIONS.md</a> <code class="dcode">D-61</code>.</p>
      <nav class="section-nav"><a href="voice.html">← Раздел 5 · Tone of voice и микрокопи</a></nav>
    </footer>
  </main>
</div>
${tabsJs(['info', 'screens'])}

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/concept.html'), page, 'utf8');
console.log(`sections/concept.html: ${pagesCount} страниц концепта`);
