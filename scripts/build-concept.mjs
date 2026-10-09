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
const contrast = read('concept/contrast.md');
const tokensCss = read('tokens/tokens.css');
const shell = read('sections/index.html');

// ── палитра и шкала — из самих токенов ────────────────────────────────
// Значения не переписываются в страницу руками: поменяли tokens.css —
// пересобрали раздел, и образцы поменялись вместе с продуктом.
const TOKENS = new Map();
for (const m of tokensCss.matchAll(/^\s*(--[\w-]+):\s*([^;]+);(?:\s*\/\*\s*(.*?)\s*\*\/)?/gm)) {
  TOKENS.set(m[1], { value: m[2].trim(), note: (m[3] || '').trim() });
}
const tok = (name) => {
  const t = TOKENS.get(name);
  if (!t) throw new Error(`в tokens/tokens.css нет ${name} — палитра раздела отстала`);
  return t;
};

const PALETTE = [
  { title: 'Действие — один цвет на экран', names: ['--action', '--ink-on-action'] },
  { title: 'Статусы', names: ['--verified', '--success', '--warn', '--danger'] },
  { title: 'Текст', names: ['--ink-900', '--ink-600', '--ink-400'] },
  { title: 'Поверхности', names: ['--bg', '--surface', '--surface-2', '--line'] },
];

const paletteHtml = PALETTE.map((g) => `        <div class="pal">
          <h3>${esc(g.title)}</h3>
          <ul class="sw">
${g.names.map((n) => {
    const t = tok(n);
    return `            <li><i style="background:${t.value}"></i><b>${esc(n)}</b><code>${esc(t.value)}</code><span>${esc(t.note)}</span></li>`;
  }).join('\n')}
          </ul>
        </div>`).join('\n');

const SCALE = ['--t-display', '--t-h1', '--t-h2', '--t-h3', '--t-body', '--t-body-sm', '--t-caption', '--t-micro'];
const scaleHtml = SCALE.map((n) => {
  const t = tok(n);
  const heading = /display|h1|h2/.test(n);
  return `          <li>
            <span class="sample" style="font-size:${t.value};font-weight:${heading ? 700 : 500};letter-spacing:${heading ? tok('--tr-display').value : 'normal'};line-height:1.2">Meet mates</span>
            <b>${esc(n)}</b><code>${esc(t.value)}</code><span>${esc(t.note)}</span>
          </li>`;
}).join('\n');

// ── страницы концепта ─────────────────────────────────────────────────
// Группы — по тому, зачем человек открывает страницу, а не по папкам.
const GROUPS = [
  {
    title: 'Открытый вопрос: облик',
    note: 'Структура экранов не меняется — меняются только значения токенов. Доска держит одну и ту же разметку в нескольких наборах, чтобы сравнивать цвет, форму и шрифт, а не раскладку.',
    items: [
      { file: 'concept/skins.html', title: 'Облик: пять наборов на одном экране', note: 'D «Стекло», N «Кинозал», O «Чернила», P «Ночь», R «Сирень» — лента и профиль в каждом' },
    ],
  },
  {
    title: 'Стиль',
    note: 'Направление в собранном виде: на стенде видно каждое решение разом, в сравнении — почему ушла прежняя палитра брифа.',
    items: [
      { file: 'concept/concept.html', title: 'Стенд стиля D «Стекло»', note: 'Палитра, типографика, компоненты, иконки, проверка контраста — 19 пар' },
      { file: 'concept/d-compare.html', title: 'D против палитры брифа', note: 'Прежний градиент рядом с D: три токена ниже контраста, тема угадывается' },
    ],
  },
  {
    title: 'Направления, которые не выбраны',
    note: 'Лежат целиком — к ним возвращаются по условию, записанному в концепте, а не рисуют заново.',
    items: [
      { file: 'concept/directions-3.html', title: 'Раунд 3: G «Афиша», H «Полоса», I «Табло»', note: 'после D: что именно мешает — мелкие фото, пустой экран или ровный тон' },
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

// счёт в шапке — все страницы концепта: и доски, и экраны

const cardsHtml = GROUPS.map((g) => `      <section class="grp">
        <h3>${esc(g.title)}</h3>
        <p class="intro">${g.note}</p>
        <ul class="cards">
${g.items.map((it) => `          <li><a href="../${it.file}"><b>${esc(it.title)}</b><span>${esc(it.note)}</span></a></li>`).join('\n')}
        </ul>
      </section>`).join('\n\n');


// ── экраны: сами макеты в стиле D, по мокапу на состояние ─────────────
// Открываются в голом виде (`#bare`): без полосы состояний и служебного блока —
// в превью они не читаются. Клик открывает страницу целиком.
const SCREENS = [
  {
    title: 'Лента событий',
    items: [
      { file: 'concept/screens/feed.html', state: 'рабочий вид' },
      { file: 'concept/screens/feed-empty.html', state: 'пусто' },
      { file: 'concept/screens/feed-error.html', state: 'ошибка' },
      { file: 'concept/screens/feed-loading.html', state: 'загрузка' },
    ],
  },
  {
    title: 'Мой профиль',
    items: [
      { file: 'concept/screens/my-profile.html', state: 'рабочий вид' },
      { file: 'concept/screens/my-profile-loading.html', state: 'загрузка' },
    ],
  },
];
const SCREENS_NOTE = 'Руками не правятся: разметку берёт из вайрфреймов <code>build-concept-screens.mjs</code> — поправили вайрфрейм, пересобрали экран. Текст и структура те же, что в сером наборе; добавлены фото, цвет, шрифт и иконки.';
for (const g of SCREENS) {
  for (const it of g.items) {
    if (!existsSync(join(ROOT, it.file))) throw new Error(`в концепте нет экрана ${it.file} — галерея раздела отстала`);
  }
}

const pagesCount = GROUPS.reduce((n, g) => n + g.items.length, 0) + SCREENS.reduce((n, g) => n + g.items.length, 0);

const galleryHtml = SCREENS.map((g, gi) => `      <section class="gbranch">
        <h3><span class="gn">${gi + 1}</span>${esc(g.title)}</h3>
        <ul class="gal">
${g.items.map((it) => `          <li>
            <a href="../${it.file}" title="${esc(g.title)} — ${esc(it.state)}">
              <span class="shot"><iframe src="../${it.file}#bare" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true" title="${esc(g.title)} — ${esc(it.state)}"></iframe></span>
              <span class="cap">${esc(it.state)}</span>
            </a>
          </li>`).join('\n')}
        </ul>
      </section>`).join('\n');

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
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Визуальное направление D «Стекло»: вкус, атрибуты, выбор и цена. Стенд стиля, экраны ленты и направления, которые не выбраны.">')
  // образцы шкалы набраны шрифтом продукта, а не сайта: иначе шкала показывала бы чужой Inter
  .replace('<link rel="stylesheet" href="../tokens/site.css">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap">\n<link rel="stylesheet" href="../tokens/site.css">');

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

/* Галерея: мокап 390x844 ужат до превью; клик идёт по ссылке, не по фрейму.
   Ширина превью фиксирована — масштаб это число, из резиновой колонки его не вывести */
.gbranch { margin: 0 0 var(--s-6); }
.gbranch h3 { margin: 0 0 var(--s-3); }
.gn { display: inline-block; min-width: 1.4em; color: var(--ink-400); font-variant-numeric: tabular-nums; font-weight: var(--fw-regular); }
.gal { list-style: none; margin: var(--s-4) 0; padding: 0; display: grid; gap: var(--s-4); grid-template-columns: repeat(auto-fill, 176px); max-width: none; }
.gal a { display: block; text-decoration: none; color: var(--ink-600); }
.gal .shot {
  display: block; position: relative; overflow: hidden;
  width: 176px; height: 381px;
  border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface);
}
.gal iframe {
  position: absolute; top: 0; left: 0;
  width: 390px; height: 844px; border: 0;
  transform: scale(0.4513); transform-origin: 0 0; pointer-events: none;
}
.gal .cap { display: block; margin-top: var(--s-2); font-size: var(--t-micro); }
.gal a:hover .shot, .gal a:focus-visible .shot { border-color: var(--ink-400); }
.gal a:hover .cap { color: var(--ink-900); }

#info blockquote { margin: 0 0 var(--s-5); padding-left: var(--s-4); border-left: 2px solid var(--line); color: var(--ink-600); }

/* Палитра и шкала: образцы набраны значениями продукта, подписи — шрифтом сайта */
.pal { margin: 0 0 var(--s-5); }
.pal h3 { margin: 0 0 var(--s-3); }
.sw, .scale { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-2); max-width: none; }
.sw { grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr)); }
.sw li, .scale li {
  display: flex; align-items: center; flex-wrap: wrap; gap: var(--s-2) var(--s-3);
  border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface);
  padding: var(--s-3); font-size: var(--t-caption);
}
/* имя токена и значение не переносятся: --ink-on-action в две строки не читается */
.sw b, .sw code, .scale b, .scale code { white-space: nowrap; }
.sw i { width: 28px; height: 28px; flex: none; border-radius: var(--r-sm); border: 1px solid var(--line); }
.sw b, .scale b { font-size: var(--t-micro); font-weight: var(--fw-medium); }
.sw code, .scale code { font-size: var(--t-micro); color: var(--ink-600); }
.sw span, .scale span { flex: 1 1 100%; color: var(--ink-600); font-size: var(--t-micro); }
.scale li { flex-wrap: wrap; }
.scale .sample { font-family: "Geist", var(--font); color: var(--ink-900); flex: none; min-width: 7.5em; }
details.src { margin: 0 0 var(--s-5); }
details.src summary { cursor: pointer; font-size: var(--t-caption); color: var(--ink-600); }
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

      <section id="palette">
        <h2>Палитра и шрифт</h2>
        <p class="intro">Значения читаются из <a href="../tokens/tokens.css">tokens/tokens.css</a> при сборке страницы — здесь нет ни одного цвета, вписанного руками. Поменяли токен — образец поменялся вместе с продуктом. Как это выглядит в деле — <a href="../concept/concept.html">стенд стиля</a>.</p>

${paletteHtml}

        <div class="pal">
          <h3>Шрифт и шкала — ${esc(tok('--font').value.split(',')[0].replace(/"/g, ''))}</h3>
          <p class="intro">Заголовки 600–700 с трекингом ${esc(tok('--tr-display').value)}, текст 400–500. Образцы набраны тем же шрифтом, что продукт.</p>
          <ul class="scale">
${scaleHtml}
          </ul>
        </div>

        <details class="src">
          <summary>Контраст — ${(contrast.match(/^\|/gm) || []).length - 2} пар, порог 4.5:1 для текста и 3:1 для иконок</summary>
${md(contrast.replace(/^#[^\n]*\n/, ''))}
        </details>
      </section>

${infoHtml}

      <section id="pages">
        <h2>Страницы концепта списком</h2>
        <p class="intro">Стенд, сравнение и оба раунда направлений. Открываются своими страницами, во всю ширину окна: они нарисованы токенами продукта, а не этого сайта.</p>

${cardsHtml}
      </section>
    </div>

    <div class="tabpanel" id="screens">
      <h1 class="vh">Концепт: страницы</h1>
      <section id="gallery">
        <h2>Экраны</h2>
        <p class="intro">Экраны продукта в стиле D, со всеми состояниями. Превью показывает сам экран — клик открывает страницу целиком, с полосой состояний и разбором под мокапом. ${SCREENS_NOTE}</p>

${galleryHtml}
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
