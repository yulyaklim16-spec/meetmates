// Сборка раздела 07 «Сборка UI» — sections/kit.html.
//
// Восемь подпунктов: кит целиком, потом витрина по частям — оболочка, навигация,
// карточки, формы, обратная связь, чат, — и в конце то, чего в ките нет.
// Текст каждого — свой раздел `## ` в ui/kit.md; живые компоненты — рамкой
// на ту же витрину с адресом #b-gN, который показывает одну группу.
//
// Соответствие подпункта и раздела документа жёсткое: заголовок, которого нет
// в TABS, роняет сборку. Иначе текст молча пропал бы со страницы.
//
// Запуск: node scripts/build-kit.mjs — после правки ui/kit.md или components/.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline, md } from './lib/markdown.mjs';
import { anchorsHtml, TABS_CSS, spyJs } from './lib/tabs.mjs';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const doc = read('ui/kit.md');
// Счёт берётся из того, чем одеты экраны: корневого tokens.css и components/.
// Руками эти числа не переписываются — они уже дважды отставали.
const tokensCss = read('tokens.css');
const compFiles = readdirSync(join(ROOT, 'components')).filter((f) => f.endsWith('.css')).sort();
const kitCss = compFiles.map((f) => read(`components/${f}`)).join('\n');
const kitHtml = read('ui/kit.html');
const shell = read('sections/index.html');

// ── счёт ──────────────────────────────────────────────────────────────
// Переменные считаются по уровням: примитив — всё до первой семантической
// роли, семантика — от неё до блока тёмной темы. Граница та же, что
// в разделе 08. Тема считается отдельно: это те же имена с другими
// значениями, и в сумму уровней они не идут — иначе набор «растёт»
// на девятнадцать переменных, которых не существует.
const SEM_AT = tokensCss.indexOf('--bg-page');
const DARK_AT = tokensCss.indexOf('[data-theme="dark"]');
if (DARK_AT === -1) throw new Error('в tokens.css нет блока тёмной темы — счёт отстал от файла');
const declsIn = (text) => [...text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[a-z0-9-]+)\s*:/g)].length;
const primCount = declsIn(tokensCss.slice(0, SEM_AT));
const semCount = declsIn(tokensCss.slice(SEM_AT, DARK_AT));
const darkCount = declsIn(tokensCss.slice(DARK_AT));
const varsCount = primCount + semCount;
const classCount = new Set([...kitCss.matchAll(/\.(mm-[a-z0-9-]+)/g)].map((m) => m[1])).size;
const caseCount = (kitHtml.match(/class="kit-case"/g) || []).length;

// ── проверка: в компонентах нет значения мимо токена ──────────────────
// Главное правило набора, и оно должно падать сборкой, а не обнаруживаться
// через месяц. Нечётных значений допускается два: волосяная линия и пилюля.
{
  const bad = [];
  for (const f of compFiles) {
    for (const line of read(`components/${f}`).split('\n')) {
      if (/^\s*(\/\*|\*)/.test(line)) continue;
      for (const m of line.matchAll(/(-?\d+(?:\.\d+)?)px/g)) {
        const n = Math.abs(parseFloat(m[1]));
        if (n && n !== 1 && n !== 999 && n % 2) bad.push(`${f}: ${line.trim()}`);
      }
    }
  }
  if (bad.length) {
    console.error('В components/ есть значения не кратные двум:\n  ' + [...new Set(bad)].join('\n  '));
    process.exit(1);
  }
}

// Число и слово при нём: 1 случай, 2–4 случая, 5–20 случаев. Счётчики кита
// растут с каждым компонентом, и подогнать слово один раз нельзя — оно
// меняется вместе с числом. На 33 страница писала «33 случаев».
const plural = (n, one, few, many) => {
  const d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return `${n} ${one}`;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
};

// ── группы витрины ────────────────────────────────────────────────────
// Разбираются из самой витрины: подпункт показывает группу рамкой, и имя
// группы для ссылки берётся оттуда же, где стоит её заголовок.
const GRP = new Map([...kitHtml.matchAll(
  /<section class="kit-grp" id="g(\d+)">\s*<h2 class="kit-grp-h"><span class="kit-n">\d+<\/span>([^<]+)<\/h2>/g)]
  .map((m) => [`g${m[1]}`, m[2].trim()]));
if (!GRP.size) throw new Error('в ui/kit.html не нашлось ни одной группы — разметка витрины изменилась');

// Страницы кита: открываются и отдельно, ссылкой из подпункта «Кит».
const PAGES = [
  { file: 'ui/kit.html', title: 'Витрина компонентов' },
  { file: 'ui/shell.html', title: 'Оболочка экрана' },
];
for (const p of PAGES) {
  if (!existsSync(join(ROOT, p.file))) throw new Error(`нет страницы ${p.file} — список раздела отстал`);
}

// Рамка с одной группой витрины. Заголовок и разбор группа несёт в себе —
// второй раз их писать не надо, иначе страница расходится с витриной.
const grpFrame = (id) => {
  const title = GRP.get(id);
  if (!title) throw new Error(`в витрине нет группы ${id} — подпункт раздела отстал`);
  return `        <li>
          <p class="framelink"><a href="../ui/kit.html#${id}">${esc(title)} — открыть в витрине &rarr;</a></p>
          <iframe src="../ui/kit.html#b-${id}" loading="lazy" scrolling="no" title="Витрина: ${esc(title)}"></iframe>
        </li>`;
};
// Рамка со целой страницей кита: так стоит оболочка — она короткая, и резать
// её на части нечего.
const pageFrame = (file, title, note) => `        <li>
          <p class="framelink"><a href="../${file}">${esc(title)} — открыть страницей &rarr;</a></p>
          <p class="cap">${esc(note)}</p>
          <iframe src="../${file}#bare" loading="lazy" scrolling="no" title="${esc(title)}"></iframe>
        </li>`;

const live = (items) => `      <ul class="live">\n${items.join('\n')}\n      </ul>`;

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

// ссылки kit.md даны от папки ui/, страница лежит в sections/
const render = (text) => md(text).replace(/href="\.\/(?!\.)/g, 'href="../ui/');

const parts = blocks(doc);
const intro = parts.find((b) => b.title === null);
const byTitle = new Map(parts.filter((b) => b.title).map((b) => [b.title, b.text]));

// Подпункт — раздел документа плюс живые компоненты из витрины.
const TABS = [
  {
    id: 'overview',
    title: 'Кит',
    html: live(PAGES.map((p) => `        <li>
          <p class="framelink"><a href="../${p.file}">${esc(p.title)} — открыть страницей &rarr;</a></p>
        </li>`)),
  },
  {
    id: 'shell',
    title: 'Оболочка',
    html: live([
      pageFrame('ui/shell.html', 'Оболочка экрана', 'Три шапки и нижнее меню разметкой. Отсюда её берёт экран, у которого ещё нет каркаса'),
      grpFrame('g9'),
      grpFrame('g10'),
    ]),
  },
  { id: 'navigation', title: 'Навигация', html: live([grpFrame('g3')]) },
  { id: 'cards', title: 'Карточки и списки', html: live([grpFrame('g4')]) },
  { id: 'forms', title: 'Формы', html: live([grpFrame('g1'), grpFrame('g2')]) },
  { id: 'feedback', title: 'Обратная связь', html: live([grpFrame('g5'), grpFrame('g6'), grpFrame('g7')]) },
  { id: 'chat', title: 'Чат', html: live([grpFrame('g8')]) },
  { id: 'gaps', title: 'Вне кита', html: '' },
];

const claimed = new Set(TABS.map((t) => t.title));
const orphan = [...byTitle.keys()].filter((t) => !claimed.has(t));
if (orphan.length) {
  console.error('В ui/kit.md есть разделы, которым нет подпункта: ' + orphan.join(', '));
  process.exit(1);
}
const missing = TABS.filter((t) => !byTitle.has(t.title)).map((t) => t.title);
if (missing.length) {
  console.error('В ui/kit.md нет разделов под подпункты: ' + missing.join(', '));
  process.exit(1);
}
// Каждая группа витрины обязана стоять хоть в одном подпункте: иначе компонент
// есть, а показать его негде.
const shown = new Set(TABS.flatMap((t) => [...t.html.matchAll(/#b-(g\d+)/g)].map((m) => m[1])));
const lost = [...GRP.keys()].filter((g) => !shown.has(g));
if (lost.length) {
  console.error('Группы витрины не попали ни в один подпункт: ' + lost.map((g) => `${g} «${GRP.get(g)}»`).join(', '));
  process.exit(1);
}

// Страница одна: части набора идут подряд, а подпункт в дереве — якорь
// на свою часть и отметка «я сейчас здесь». Прятать соседние незачем: кит
// читают подряд, и важно видеть, что за оболочкой идёт навигация, за ней
// карточки. Рамки грузятся по мере прокрутки — loading="lazy".
const panels = TABS.map((t, i) => `    <section class="block" id="${t.id}">
      <h2>${inline(t.title)}</h2>
${i === 0 && intro ? render(intro.text) + '\n' : ''}${render(byTitle.get(t.title))}
${t.html}
    </section>`).join('\n\n');

// ── боковая колонка ───────────────────────────────────────────────────
const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
const cur = /<a class="mat"([^>]*)href="kit\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html нет пункта 07 со ссылкой на kit.html — боковая колонка изменилась');
const subtabs = anchorsHtml(TABS.map((t) => ({ id: t.id, title: t.title })));
const aside = asideSrc.replace(cur, (m, attrs, head) =>
  `<a class="mat current"${attrs}href="kit.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);

// ── страница ──────────────────────────────────────────────────────────
const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Сборка UI · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="Кит: классы по файлам компонентов, оболочка разметкой и витрина, где каждое состояние нарисовано и названо. Восемь подпунктов по частям набора.">');

const extraCss = `
/* ── Раздел 07: сборка UI ───────────────────────────────────── */
${TABS_CSS}
.grp { margin: 0 0 var(--s-6); }
/* Компоненты стоят живыми, рамкой на саму витрину: подпункт открывает её
   адресом #b-gN и видит одну группу — со своим заголовком и своим разбором.
   Своей прокрутки у рамки нет, высоту ей задаёт скрипт внизу; пока он
   не отработал, держится запас, иначе страница прыгала бы с нуля. */
.live { list-style: none; margin: var(--s-4) 0 0; padding: 0; max-width: none; }
.live > li { margin: 0 0 var(--s-6); }
.live .framelink { margin: 0 0 var(--s-2); font-size: var(--t-caption); }
/* подпись под ссылкой — не выноска: .note на этой странице носит лиловую
   полосу слева и читается цитатой, а это просто строка о странице */
.live .cap { font-size: var(--t-caption); color: var(--ink-600); max-width: 72ch; margin: 0 0 var(--s-3); }
.live iframe {
  display: block; width: 100%; height: 86vh; overflow: hidden;
  border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface);
}
.block blockquote { margin: 0 0 var(--s-5); padding-left: var(--s-4); border-left: 2px solid var(--line); color: var(--ink-600); }
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
      <p class="lede">Кит: ${plural(classCount, 'класс', 'класса', 'классов')}
        в ${plural(compFiles.length, 'файле', 'файлах', 'файлах')} <a href="../components/">components/</a>,
        значения — ${plural(varsCount, 'переменная', 'переменные', 'переменных')} двумя уровнями
        из <a href="../tokens.css">tokens.css</a>, оболочка разметкой и витрина, где каждый компонент стоит
        живым со своими состояниями. Снят с окрашенных экранов раздела 06 — не нарисован заново.</p>
      <div class="chips">
        <span>${plural(classCount, 'класс', 'класса', 'классов')}</span>
        <span>${plural(compFiles.length, 'файл', 'файла', 'файлов')} компонентов</span>
        <span>${plural(caseCount, 'компонент', 'компонента', 'компонентов')} в витрине</span>
        <span>${primCount} примитивов и ${semCount} семантических</span>
        <span>${darkCount} переопределений в тёмной</span>
      </div>
    </div>

${panels}

    <footer>
      <p>Раздел 7 из 12 · Сборка UI. Источник — <a href="../ui/kit.md">ui/kit.md</a>;
        состав — <a href="../ui/inventory.md">inventory.md</a>, вид — <a href="../DESIGN.md">DESIGN.md</a>,
        значения — <a href="../tokens.css">tokens.css</a> и раздел <a href="tokens.html">08</a>.</p>
      <nav class="section-nav"><a href="concept.html">← Раздел 6 · Концепт</a></nav>
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
  var busy = false;
  function fit(f) {
    if (busy) return;
    busy = true;
    try {
      var d = f.contentDocument;
      if (d && d.readyState !== 'loading') {
        // Высота берётся по body, а не по documentElement: корень растянут
        // на саму рамку, и короткая группа оставалась бы с полуэкраном
        // пустоты внизу. Поля у body в обеих страницах нулевые.
        var h = d.body ? Math.max(d.body.scrollHeight, d.body.offsetHeight) : 0;
        if (!h) h = d.documentElement.scrollHeight;
        if (h) {
          f.style.height = h + 'px';
          // рамка считает высоту вместе со своими бортами: без добавки последние
          // два пикселя страницы оказывались срезаны
          var edges = h - f.clientHeight;
          if (edges > 0) f.style.height = (h + edges) + 'px';
        }
        // Наблюдатель ставится один раз и только на готовую страницу:
        // содержимое меняет высоту и после загрузки — доезжают снимки,
        // текст перетекает при смене ширины окна.
        if (!f.getAttribute('data-watched') && window.ResizeObserver) {
          f.setAttribute('data-watched', '1');
          new ResizeObserver(function () { fit(f); }).observe(d.documentElement);
        }
      }
    } catch (e) {}
    busy = false;
  }
  function fitAll() { for (var i = 0; i < frames.length; i++) fit(frames[i]); }
  // Событие load у рамки могло пройти до этого скрипта — поэтому мерим и сразу,
  // и по каждому load, и по готовности самой страницы.
  for (var i = 0; i < frames.length; i++) frames[i].addEventListener('load', fitAll);
  window.addEventListener('load', fitAll);
  window.addEventListener('resize', fitAll);
  fitAll();
})();
</script>

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/kit.html'), page, 'utf8');
console.log(`sections/kit.html: ${TABS.length} блоков, ${classCount} классов в ${compFiles.length} файлах, ` +
  `${caseCount} компонентов в витрине, ${varsCount} переменных, ${darkCount} переопределений темы`);
