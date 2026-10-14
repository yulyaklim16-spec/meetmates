// Сборка раздела 07 «Сборка UI» — sections/kit.html.
//
// Источник текста — ui/kit.md: что такое кит, из чего собран, какой дрейф имён
// он свёл и чего в нём нет. Страница собирается из документа целиком; правим
// документ, а не страницу.
//
// Вторая вкладка — сами страницы кита: витрина и оболочка. Они открываются
// своими страницами, во всю ширину: нарисованы ui/kit.css, то есть значениями
// продукта, а не этого сайта. Так же решено у разделов 04 и 06 — фрейм внутри
// раздела заставлял бы скроллить дважды.
//
// Запуск: node scripts/build-kit.mjs — после правки ui/kit.md или kit.css.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline, md } from './lib/markdown.mjs';
import { subtabsHtml, TABS_CSS, tabsJs } from './lib/tabs.mjs';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const doc = read('ui/kit.md');
const kitCss = read('ui/kit.css');
const kitHtml = read('ui/kit.html');
const shell = read('sections/index.html');

// ── счёт берём из самих файлов ────────────────────────────────────────
// Числа в тексте раздела уже дважды отставали в других разделах, поэтому
// здесь они не переписываются руками: посчитали — вставили.
const root = kitCss.slice(kitCss.indexOf(':root'), kitCss.indexOf('\n}', kitCss.indexOf(':root')));
const varsCount = [...root.matchAll(/^\s*(--mm-[a-z0-9-]+)\s*:/gm)].length;
const classCount = new Set([...kitCss.matchAll(/\.(mm-[a-z0-9-]+)/g)].map((m) => m[1])).size;
const caseCount = (kitHtml.match(/class="kit-case"/g) || []).length;
const groupCount = (kitHtml.match(/class="kit-grp"/g) || []).length;

// ── проверка: в ките нет значения вне :root ───────────────────────────
// Это главное правило файла, и оно должно падать сборкой, а не обнаруживаться
// через месяц. Нечётных значений допускается два: волосяная линия и пилюля.
{
  const body = kitCss.slice(kitCss.indexOf('\n}', kitCss.indexOf(':root')));
  const bad = [];
  for (const line of body.split('\n')) {
    if (/^\s*(\/\*|\*)/.test(line)) continue;
    for (const m of line.matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
      const n = Math.abs(parseFloat(m[1]));
      if (n && n !== 1 && n !== 999 && n % 2) bad.push(line.trim());
    }
  }
  if (bad.length) {
    console.error('В ui/kit.css есть значения не кратные двум:\n  ' + [...new Set(bad)].join('\n  '));
    process.exit(1);
  }
}

// ── страницы кита ─────────────────────────────────────────────────────
const PAGES = [
  {
    file: 'ui/kit.html',
    title: 'Витрина компонентов',
    note: `${groupCount} разделов по ролям, ${caseCount} случаев. Каждый компонент живой, со своими состояниями; текст настоящий, из интерфейса`,
  },
  {
    file: 'ui/shell.html',
    title: 'Оболочка экрана',
    note: 'Три шапки и нижнее меню разметкой. Отсюда её берёт экран, у которого ещё нет каркаса',
  },
];
for (const p of PAGES) {
  if (!existsSync(join(ROOT, p.file))) throw new Error(`нет страницы ${p.file} — список раздела отстал`);
}

const cardsHtml = `      <ul class="cards">
${PAGES.map((p) => `        <li><a href="../${p.file}"><b>${esc(p.title)}</b><span>${esc(p.note)}</span></a></li>`).join('\n')}
      </ul>`;

// Превью: страница кита ужата до карточки. Мокап внутри неё — 390px,
// поэтому масштаб тот же, что в галерее раздела 06.
const previewHtml = PAGES.map((p) => `        <li>
          <a href="../${p.file}" title="${esc(p.title)}">
            <span class="shot"><iframe src="../${p.file}" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true" title="${esc(p.title)}"></iframe></span>
            <span class="cap">${esc(p.title)}</span>
          </a>
        </li>`).join('\n');

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

// ссылки kit.md даны от папки ui/, страница лежит в sections/
const infoHtml = blocks(doc).map((b) => {
  const html = md(b.text).replace(/href="\.\/(?!\.)/g, 'href="../ui/');
  return b.title
    ? `      <section id="${slugify(b.title)}">\n        <h2>${inline(b.title)}</h2>\n${html}\n      </section>`
    : html;
}).join('\n\n');

// ── боковая колонка ───────────────────────────────────────────────────
const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
const cur = /<a class="mat"([^>]*)href="kit\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html нет пункта 07 со ссылкой на kit.html — боковая колонка изменилась');
const subtabs = subtabsHtml([
  { id: 'info', title: 'Информация' },
  { id: 'pages', title: 'Страницы' },
]);
const aside = asideSrc.replace(cur, (m, attrs, head) =>
  `<a class="mat current"${attrs}href="kit.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);

// ── страница ──────────────────────────────────────────────────────────
const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Сборка UI · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="Кит: один файл стилей, оболочка разметкой и витрина компонентов. Снят с окрашенных экранов, свёл разошедшиеся имена в один набор.">');

const extraCss = `
/* ── Раздел 07: сборка UI ───────────────────────────────────── */
${TABS_CSS}
.grp { margin: 0 0 var(--s-6); }
.cards { list-style: none; margin: var(--s-3) 0 var(--s-6); padding: 0; display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); }
.cards a {
  display: block; height: 100%;
  border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface);
  padding: var(--s-3) var(--s-4); text-decoration: none; color: var(--ink-900);
  transition: border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.cards a:hover, .cards a:focus-visible { border-color: var(--ink-400); background: var(--surface-2); }
.cards b { display: block; font-size: var(--t-body-sm); margin-bottom: 2px; }
.cards span { font-size: var(--t-caption); color: var(--ink-600); }

/* Превью страниц кита: сама страница ужата, клик идёт по ссылке, не по фрейму */
.gal { list-style: none; margin: var(--s-4) 0; padding: 0; display: grid; gap: var(--s-4); grid-template-columns: repeat(auto-fill, 320px); max-width: none; }
.gal a { display: block; text-decoration: none; color: var(--ink-600); }
.gal .shot {
  display: block; position: relative; overflow: hidden;
  width: 320px; height: 420px;
  border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface);
}
.gal iframe {
  position: absolute; top: 0; left: 0;
  width: 1000px; height: 1312px; border: 0;
  transform: scale(0.32); transform-origin: 0 0; pointer-events: none;
}
.gal .cap { display: block; margin-top: var(--s-2); font-size: var(--t-micro); }
.gal a:hover .shot, .gal a:focus-visible .shot { border-color: var(--ink-400); }
.gal a:hover .cap { color: var(--ink-900); }

#info blockquote { margin: 0 0 var(--s-5); padding-left: var(--s-4); border-left: 2px solid var(--line); color: var(--ink-600); }
`;

const page = `${head}${extraCss}</style>
</head>
<body>
<a class="skip" href="#content">К содержимому</a>

<div class="shell">
${aside}

  <main id="content">
    <div class="masthead">
      <p class="eyebrow">Раздел 07</p>
      <h1>Сборка UI</h1>
      <p class="lede">Кит: один файл стилей на ${varsCount} переменных и ${classCount} классов,
        оболочка разметкой и витрина, где каждый компонент стоит живым со своими состояниями.
        Снят с окрашенных экранов раздела 06 — не нарисован заново.</p>
      <div class="chips">
        <span>${varsCount} переменных</span>
        <span>${classCount} классов</span>
        <span>${caseCount} компонентов в витрине</span>
        <span>один уровень токенов</span>
      </div>
    </div>

    <div class="tabpanel" id="info">
      <h1 class="vh">Сборка UI: информация</h1>
${infoHtml}
    </div>

    <div class="tabpanel" id="pages">
      <h1 class="vh">Сборка UI: страницы</h1>
      <section>
        <h2>Страницы кита</h2>
        <p class="intro">Открываются своими страницами, во всю ширину окна: они нарисованы
          <a href="../ui/kit.css">ui/kit.css</a>, то есть значениями продукта, а не этого сайта.</p>

${cardsHtml}

        <ul class="gal">
${previewHtml}
        </ul>
      </section>
    </div>

    <footer>
      <p>Раздел 7 из 12 · Сборка UI. Источник — <a href="../ui/kit.md">ui/kit.md</a>;
        состав — <a href="../ui/inventory.md">inventory.md</a>, вид — <a href="../DESIGN.md">DESIGN.md</a>,
        значения — <a href="../tokens/tokens.css">tokens.css</a>.</p>
      <nav class="section-nav"><a href="concept.html">← Раздел 6 · Концепт</a></nav>
    </footer>
  </main>
</div>
${tabsJs(['info', 'pages'])}

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/kit.html'), page, 'utf8');
console.log(`sections/kit.html: ${varsCount} переменных, ${classCount} классов, ${caseCount} компонентов в витрине`);
