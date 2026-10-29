// Сборка раздела 09 «Дизайн-система» — sections/system.html.
//
// Семь подпунктов: пакет, компоненты, страница компонента, почему так,
// правила, проверки и что открыто. Текст каждого — свой раздел `## `
// в design-system/system.md; живые страницы — рамкой на сами docs
// с адресом #bare, который убирает их собственную шапку.
//
// Соответствие подпункта и раздела документа жёсткое: заголовок, которого
// нет в TABS, роняет сборку — иначе текст молча пропал бы со страницы.
// Числа на странице считаются из самой системы и руками не переписываются.
//
// Запуск: node scripts/build-system-section.mjs — после правки system.md,
// компонентов или страниц docs.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline, md } from './lib/markdown.mjs';
import { anchorsHtml, TABS_CSS, spyJs } from './lib/tabs.mjs';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const doc = read('design-system/system.md');
const shell = read('sections/index.html');
const tokensCss = read('design-system/tokens.css');

// ── счёт: из самой системы ────────────────────────────────────────────
const SEM_AT = tokensCss.indexOf('--bg-page');
const DARK_AT = tokensCss.indexOf('[data-theme="dark"]');
if (SEM_AT < 0 || DARK_AT < 0) throw new Error('в tokens.css не нашлись границы уровней — счёт отстал от файла');
const declsIn = (text) => [...text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[a-z0-9-]+)\s*:/g)].length;
const primCount = declsIn(tokensCss.slice(0, SEM_AT));
const semCount = declsIn(tokensCss.slice(SEM_AT, DARK_AT));

const compFiles = readdirSync(join(ROOT, 'design-system/components')).filter((f) => f.endsWith('.css')).sort();
// Классы считаются по всему набору разом, а не по файлам: имя, встреченное
// в двух файлах, — один класс. Тот же счёт, что в разделе 07.
const kitCss = compFiles.map((f) => read('design-system/components/' + f)).join('\n');
const classCount = new Set([...kitCss.matchAll(/\.(mm-[a-z0-9-]+)/g)].map((m) => m[1])).size;

const docsFiles = readdirSync(join(ROOT, 'design-system/docs')).filter((f) => f.endsWith('.html')).sort();
// Страницы компонентов — всё, кроме трёх общих: showcase, паттерны и «почему так»
const compPages = docsFiles.filter((f) => !['index.html', 'why.html', 'patterns.html'].includes(f));
if (!compPages.length) throw new Error('в design-system/docs нет страниц компонентов — раздел нечего показывать');

// ── живые рамки ───────────────────────────────────────────────────────
// Страница показана собой, а не пересказом: адрес #bare убирает её шапку,
// потому что навигация раздела уже стоит слева.
const docFrame = (file, title, note) => {
  if (!existsSync(join(ROOT, 'design-system/docs', file))) {
    throw new Error(`нет страницы design-system/docs/${file} — подпункт раздела отстал`);
  }
  return `        <li>
          <p class="framelink"><a href="../design-system/docs/${file}">${esc(title)} — открыть страницей &rarr;</a></p>
          ${note ? `<p class="cap">${esc(note)}</p>` : ''}
          <iframe src="../design-system/docs/${file}#bare" loading="lazy" scrolling="no" title="${esc(title)}"></iframe>
        </li>`;
};
const live = (items) => `      <ul class="live">\n${items.join('\n')}\n      </ul>`;

// список страниц компонентов — чтобы с раздела можно было уйти в любую
const pageList = `      <ul class="pagelist">
${compPages.map((f) => {
  const html = read(`design-system/docs/${f}`);
  const name = html.match(/<h1>([^<]+)<\/h1>/);
  const cls = html.match(/<p class="classes"><code>([^<]+)<\/code>/);
  if (!name) throw new Error(`в design-system/docs/${f} нет заголовка — разметка страницы изменилась`);
  return `        <li><a href="../design-system/docs/${f}">${esc(name[1])}</a> <code>${cls ? cls[1] : ''}</code></li>`;
}).join('\n')}
      </ul>`;

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
const parsed = blocks(doc);
const intro = parsed.find((b) => b.title === null);
const byTitle = new Map(parsed.filter((b) => b.title).map((b) => [b.title, b.text]));

// ссылки system.md даны от папки design-system/, страница лежит в sections/
const render = (text) => md(text, { base: 'design-system' });

const TABS = [
  { id: 'package', title: 'Пакет', html: '' },
  {
    id: 'components',
    title: 'Компоненты',
    html: live([docFrame('index.html', 'Showcase компонентов', 'Тридцать три компонента живыми — те же классы и тот же файл стилей, что в продукте')]) + '\n' + pageList,
  },
  {
    id: 'patterns',
    title: 'Паттерны',
    html: live([docFrame('patterns.html', 'Паттерны', 'Восемь кладок, которые повторяются на трёх и более экранах — у каждой названы экраны')]),
  },
  {
    id: 'page',
    title: 'Страница компонента',
    html: live([docFrame('event-card.html', 'Карточка события', 'Пример страницы: анатомия, варианты и размеры, когда употреблять, правило и антиправило')]),
  },
  {
    id: 'why',
    title: 'Почему так',
    html: live([docFrame('why.html', 'Почему система такова', 'Пять пар атрибутов с источником, откуда приёмы, направление R «Сирень» и его цена')]),
  },
  { id: 'rules', title: 'Правила, которые держат систему', html: '' },
  { id: 'checks', title: 'Что проверяют скрипты', html: '' },
  { id: 'open', title: 'Что открыто', html: '' },
];

const claimed = new Set(TABS.map((t) => t.title));
const orphan = [...byTitle.keys()].filter((t) => !claimed.has(t));
if (orphan.length) {
  console.error('В design-system/system.md есть разделы, которым нет подпункта: ' + orphan.join(', '));
  process.exit(1);
}
const missing = TABS.filter((t) => !byTitle.has(t.title)).map((t) => t.title);
if (missing.length) {
  console.error('В design-system/system.md нет разделов под подпункты: ' + missing.join(', '));
  process.exit(1);
}

const panels = TABS.map((t, i) => `    <section class="block" id="${t.id}">
      <h2>${inline(t.title)}</h2>
${i === 0 && intro ? render(intro.text) + '\n' : ''}${render(byTitle.get(t.title))}
${t.html}
    </section>`).join('\n\n');

// ── боковая колонка ───────────────────────────────────────────────────
const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
const cur = /<a class="mat"([^>]*)href="system\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html нет пункта 09 со ссылкой на system.html — боковая колонка изменилась');
const subtabs = anchorsHtml(TABS.map((t) => ({ id: t.id, title: t.title })));
const aside = asideSrc.replace(cur, (m, attrs, head) =>
  `<a class="mat current"${attrs}href="system.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);

// ── страница ──────────────────────────────────────────────────────────
const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Дизайн-система · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="Система одним пакетом: страница на каждый компонент — анатомия, варианты, когда употреблять, правило и антиправило, — и «Почему так».">');

const extraCss = `
/* ── Раздел 09: дизайн-система ──────────────────────────────── */
/* Раздел показывает живые страницы рамкой, и рамке нужно место: документация
   просит 1240px, витрина — 390px на макет плюс поля. Поэтому оболочка здесь
   шире обычной; текст в ней по-прежнему ограничен 72ch и не растягивается. */
.shell { max-width: 1600px; }

${TABS_CSS}
/* Страницы документации стоят живыми, рамкой на самих себя: адрес #bare
   убирает их шапку, навигация раздела уже стоит слева. Своей прокрутки
   у рамки нет — высоту задаёт скрипт внизу, до него держится запас. */
.live { margin: var(--s-5) 0 0; padding: 0; list-style: none; display: grid; gap: var(--s-6); max-width: none; }
.live iframe { width: 100%; min-height: 560px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); display: block; }
.framelink { margin: 0 0 var(--s-2); font-size: var(--t-caption); }
.cap { margin: 0 0 var(--s-3); font-size: var(--t-caption); color: var(--ink-600); }
/* Список страниц: отсюда уходят в любой компонент, не листая showcase */
.pagelist { margin: var(--s-5) 0 0; padding: 0; list-style: none; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--s-2) var(--s-4); }
.pagelist li { display: flex; flex-wrap: wrap; gap: var(--s-2); align-items: baseline; font-size: var(--t-caption); }
.pagelist code { color: var(--ink-600); font-size: var(--t-micro); }
`;

const page = `${head}${extraCss}</style>
</head>
<body>
<a class="skip" href="#content">К содержимому</a>

<div class="shell">
${aside}

  <main id="content">
    <div class="masthead">
      <p class="eyebrow">Раздел 09</p>
      <h1>Дизайн-система</h1>
      <p class="lede">Система одним пакетом: ${classCount} классов в ${compFiles.length} файлах компонентов,
        ${primCount + semCount} переменных двумя уровнями и одна дверь — <a href="../design-system/index.css">index.css</a>.
        У каждого компонента своя страница: анатомия с подписями частей, варианты и размеры,
        когда употреблять и пара «правило — антиправило». Страницы живые: они одеты той же
        системой, что и продукт.</p>
      <div class="chips">
        <span>${compPages.length} страниц компонентов</span>
        <span>${classCount} классов</span>
        <span>${primCount} примитивов и ${semCount} ролей</span>
        <span>одна точка входа</span>
      </div>
    </div>

${panels}

    <footer>
      <p>Раздел 9 из 12 · Дизайн-система. Источник — <a href="../design-system/system.md">design-system/system.md</a>;
        сами страницы — <a href="../design-system/docs/index.html">docs/</a>, значения — раздел
        <a href="tokens.html">08</a>, кит — раздел <a href="kit.html">07</a>.</p>
      <nav class="section-nav"><a href="tokens.html">← Раздел 8 · Дизайн-токены</a></nav>
    </footer>
  </main>
</div>
${spyJs(TABS.map((t) => t.id))}
<script>
// Рамка принимает высоту своей страницы: прокрутки внутри нет, страницу
// листает общая полоса раздела. Страницы свои, с того же домена, поэтому
// высота читается напрямую; всё в try — если доступа не будет, рамка
// останется с запасом высоты из стилей, а не схлопнется.
(function () {
  var frames = document.querySelectorAll('.live iframe');
  function fit(f) {
    try {
      var d = f.contentDocument;
      if (!d || !d.body) return;
      var h = Math.max(d.body.scrollHeight, d.documentElement.scrollHeight);
      if (h > 80) f.style.height = h + 'px';
    } catch (e) {}
  }
  frames.forEach(function (f) {
    f.addEventListener('load', function () { fit(f); setTimeout(function () { fit(f); }, 400); });
    fit(f);
  });
  window.addEventListener('resize', function () { frames.forEach(fit); });
})();
</script>
</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/system.html'), page, 'utf8');
console.log(`sections/system.html: ${TABS.length} блоков, ${compPages.length} страниц компонентов, ${classCount} классов, ${primCount + semCount} переменных`);
