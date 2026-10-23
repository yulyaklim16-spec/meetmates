// Сборка раздела 08 «Дизайн-токены» — sections/tokens.html.
//
// Текст — tokens.md: зачем два слоя, четыре правила, тёмная тема как проверка.
// Таблицы — из самого tokens.css: образцы цвета, роли со ссылкой на примитив,
// шкалы и сравнение светлой с тёмной. Числа на странице не переписываются
// руками: отстать им не от чего, они берутся из файла при сборке.
//
// Запуск: node scripts/build-tokens-section.mjs — после правки tokens.css или tokens.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline, md } from './lib/markdown.mjs';
import { subtabsHtml, TABS_CSS, tabsJs } from './lib/tabs.mjs';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const doc = read('tokens.md');
const css = read('tokens.css');
const shell = read('sections/index.html');

// ── разбор tokens.css ─────────────────────────────────────────────────
// Файл читается построчно, потому что нужен не только список имён, но и то,
// в какой группе имя стоит и что о нём сказано рядом: комментарий — часть
// токена, а не украшение.
const light = css;
const SEM_AT = light.indexOf('--bg-page');

const parse = (rawText, offset = 0) => {
  // Объявление, растянутое на несколько строк (размытие фона — три слоя),
  // сшивается в одну. Сшивать регулярным выражением по всему файлу нельзя:
  // в комментариях встречаются имена с двоеточием («То же значение, что
  // у --bg-page: роли разные…»), и склейка утаскивала следом настоящее
  // объявление. Поэтому строки собираются по одной, от начала объявления.
  const joined = [];
  let buf = null;
  for (const line of rawText.split('\n')) {
    if (buf !== null) {
      buf += ' ' + line.trim();
      if (line.includes(';')) { joined.push(buf); buf = null; }
      continue;
    }
    if (/^\s*--[a-z0-9-]+\s*:/.test(line) && !line.includes(';')) { buf = line.trimEnd(); continue; }
    joined.push(line);
  }
  if (buf !== null) joined.push(buf);
  const text = joined.join('\n');
  const rows = [];
  let group = null;
  let pending = [];
  for (const line of text.split('\n')) {
    const head = line.match(/\/\* ── (.+?) ─+/);
    if (head) { group = head[1].trim(); pending = []; continue; }
    const open = line.match(/^\s*\/\*\s?(.*)$/);
    if (open && !line.includes('*/')) { pending = [open[1].trim()]; continue; }
    if (pending.length && !line.includes('*/') && /^\s*(\*|[А-Яа-яA-Za-z(—])/.test(line) && !/^\s*--/.test(line)) {
      pending.push(line.replace(/^\s*\*?\s?/, '').trim());
      continue;
    }
    if (pending.length && line.includes('*/')) {
      pending.push(line.replace(/\*\/.*$/, '').replace(/^\s*\*?\s?/, '').trim());
      continue;
    }
    const decl = line.match(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);\s*(?:\/\*\s*(.*?)\s*\*\/)?/);
    if (decl) {
      rows.push({
        name: decl[1],
        value: decl[2].trim(),
        note: (decl[3] || pending.join(' ')).replace(/\s+/g, ' ').trim(),
        group: group || 'прочее',
        kind: offset ? 'role' : 'primitive',
      });
      pending = [];
      continue;
    }
    if (!line.trim()) pending = [];
  }
  return rows;
};

const prim = parse(light.slice(0, SEM_AT));
const sem = parse(light.slice(SEM_AT), 1);
const valueOf = new Map([...prim, ...sem].map((r) => [r.name, r.value]));

// значение роли до самого примитива: роль обязана упираться в примитив
const unresolved = new Set();
const resolve = (v, depth = 0) => {
  const m = typeof v === 'string' && v.match(/^var\((--[a-z0-9-]+)\)$/);
  if (!m || depth > 6) return v;
  const next = valueOf.get(m[1]);
  // имя, которого нет в файле, — разбор отстал от tokens.css, и это ошибка
  // сборки, а не пустая клетка на странице
  if (next === undefined) { unresolved.add(m[1]); return v; }
  return resolve(next, depth + 1);
};
const isColor = (v) => /^#[0-9a-fA-F]{3,8}$/.test(resolve(v) || '');

// ── контраст: он же считается скриптом, здесь — чтобы показать число ──
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const fmt = (n) => n.toFixed(2).replace('.', ',');

// ── таблицы ───────────────────────────────────────────────────────────
const swatch = (v) => {
  const r = resolve(v);
  if (/^#/.test(r)) return `<i class="sw" style="background:${r}"></i>`;
  if (/gradient/.test(r)) return `<i class="sw sw--wide" style="background-image:${r}"></i>`;
  if (/^(0|inset)/.test(r)) return `<i class="sw sw--shadow" style="box-shadow:${r}"></i>`;
  return '<i class="sw sw--none"></i>';
};

const colorTable = (rows) => `<table class="tok">
  <thead><tr><th class="c-sw"><span class="vh">Образец</span></th><th>Имя</th><th>Значение</th><th>Где стоит</th></tr></thead>
  <tbody>
${rows.map((r) => `    <tr><td>${swatch(r.value)}</td><td><code>${esc(r.name)}</code></td><td class="val"><code>${esc(r.value)}</code></td><td class="tnote">${inline(r.note || '—')}</td></tr>`).join('\n')}
  </tbody>
</table>`;

const roleTable = (rows) => `<table class="tok">
  <thead><tr><th class="c-sw"><span class="vh">Образец</span></th><th>Роль</th><th>Показывает на</th><th>За что отвечает</th></tr></thead>
  <tbody>
${rows.map((r) => {
  const to = r.value.match(/^var\((--[a-z0-9-]+)\)$/);
  const target = to ? `<code>${esc(to[1])}</code> <span class="dim">${esc(resolve(r.value))}</span>` : `<code>${esc(r.value)}</code>`;
  return `    <tr><td>${swatch(r.value)}</td><td><code>${esc(r.name)}</code></td><td class="val">${target}</td><td class="tnote">${inline(r.note || '—')}</td></tr>`;
}).join('\n')}
  </tbody>
</table>`;

const scaleTable = (rows, sample) => `<table class="tok">
  <thead><tr><th class="c-sw"><span class="vh">Образец</span></th><th>Имя</th><th>Значение</th><th>Где стоит</th></tr></thead>
  <tbody>
${rows.map((r) => `    <tr><td>${sample(r)}</td><td><code>${esc(r.name)}</code></td><td class="val"><code>${esc(r.value)}</code></td><td class="tnote">${inline(r.note || '—')}</td></tr>`).join('\n')}
  </tbody>
</table>`;

const group = (rows, re) => rows.filter((r) => re.test(r.name));
// Числовые шкалы читаются сверху вниз, от большего к меньшему: так видно
// потолок шкалы и шаг вниз от него, а не разбег от нуля.
const num = (v) => { const m = String(v).match(/-?\d*\.?\d+/); return m ? parseFloat(m[0]) : -Infinity; };
const desc = (rows) => [...rows].sort((a, b) => num(b.value) - num(a.value));

const colorGroups = [...new Set(prim.filter((r) => isColor(r.value) || /gradient|shadow|ring/.test(r.name)).map((r) => r.group))];
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const colorHtml = colorGroups.map((g) => `      <h3>${esc(cap(g))}</h3>\n${colorTable(prim.filter((r) => r.group === g))}`).join('\n\n');

const semGroups = [...new Set(sem.map((r) => r.group))];
const semHtml = semGroups.map((g) => `      <h3>${esc(cap(g))}</h3>\n${roleTable(sem.filter((r) => r.group === g))}`).join('\n\n');

const typeHtml = scaleTable(desc(group(prim, /^--text-\d/)), (r) =>
  `<span class="type" style="font-size:${r.value}">Aa</span>`);
const spaceHtml = scaleTable(desc(group(prim, /^--space/)), (r) =>
  `<i class="bar" style="width:${/px/.test(r.value) ? r.value : '8px'}"></i>`);
const radiusHtml = scaleTable(desc(group(prim, /^--radius/)), (r) =>
  `<i class="sw sw--radius" style="border-radius:${r.value}"></i>`);
const sizeHtml = scaleTable(desc(group(prim, /^--size|^--width|^--measure/)), () => '<i class="sw sw--none"></i>');

// ── текст раздела ─────────────────────────────────────────────────────
function blocks(text) {
  const body = text.replace(/^# .+\n/, '');
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

// ссылки tokens.md даны от корня, страница лежит в sections/
const infoHtml = blocks(doc).map((b) => {
  const html = md(b.text).replace(/href="\.\/(?!\.)/g, 'href="../');
  return b.title
    ? `      <section id="${slugify(b.title)}">\n        <h2>${inline(b.title)}</h2>\n${html}\n      </section>`
    : html;
}).join('\n\n');

// ── боковая колонка ───────────────────────────────────────────────────
const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
const cur = /<a class="mat"([^>]*)href="tokens\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html нет пункта 08 со ссылкой на tokens.html — боковая колонка изменилась');
const subtabs = subtabsHtml([
  { id: 'info', title: 'Информация' },
  { id: 'set', title: 'Набор' },
]);
const aside = asideSrc.replace(cur, (m, attrs, head) =>
  `<a class="mat current"${attrs}href="tokens.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);

const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Дизайн-токены · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="Два слоя токенов: примитив — значение, роль — ответственность. Правила слоя и весь набор таблицами, собранными из самого файла.">');

const extraCss = `
/* ── Раздел 08: дизайн-токены ───────────────────────────────── */
${TABS_CSS}
.tok { width: 100%; border-collapse: collapse; margin: 0 0 var(--s-5); font-size: var(--t-caption); }
.tok th { text-align: left; font-weight: var(--fw-semibold); color: var(--ink-600); padding: var(--s-2) var(--s-3); border-bottom: 1px solid var(--line); }
.tok td { padding: var(--s-2) var(--s-3); border-bottom: 1px solid var(--line); vertical-align: top; }
.tok tr:last-child td { border-bottom: 0; }
.tok .c-sw { width: 56px; }
.tok .val { white-space: nowrap; }
.tok .tnote { color: var(--ink-600); max-width: 48ch; }
.tok .dim { color: var(--ink-600); }
.tok code { font-size: var(--t-caption); white-space: nowrap; }
/* Имя токена не переносится: «--bg-page-wash» в две строки читается как два
   разных имени. Столбцу имён отдана фиксированная ширина, длинные значения
   сокращаются в самой сборке. */
.tok--dark td:first-child { width: 22ch; }
.tok--dark .dim code { white-space: nowrap; }
/* Образец показывает само значение: цвет заливкой, тень — тенью, радиус —
   своим углом. Подписи под ним нет — имя стоит в соседней клетке. */
.sw { display: inline-block; width: 36px; height: 24px; border-radius: var(--r-sm); border: 1px solid var(--line); vertical-align: middle; }
.sw--sm { width: 16px; height: 16px; margin-right: var(--s-2); }
.sw--wide { width: 56px; }
.sw--shadow { background: var(--surface); }
.sw--radius { background: var(--surface-2); }
.sw--none { background: repeating-linear-gradient(45deg, var(--surface-2) 0 4px, transparent 4px 8px); }
.type { display: inline-block; line-height: 1; color: var(--ink-900); }
.bar { display: inline-block; height: 12px; border-radius: 2px; background: var(--brand-a); vertical-align: middle; }
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
      <p class="eyebrow">Раздел 08</p>
      <h1>Дизайн-токены</h1>
      <p class="lede">Два слоя: <b>примитив</b> — значение само по себе, <b>роль</b> — ответственность.
        Компонент берёт цвет только ролью, геометрию — только примитивом. Таблицы ниже собраны
        из <a href="../tokens.css">tokens.css</a> при сборке страницы, поэтому отстать не могут.</p>
      <div class="chips">
        <span>${prim.length} примитивов</span>
        <span>${sem.length} ролей</span>
        <span>ноль значений в компонентах</span>
      </div>
    </div>

    <div class="tabpanel" id="info">
      <h1 class="vh">Дизайн-токены: информация</h1>
${infoHtml}
    </div>

    <div class="tabpanel" id="set">
      <h1 class="vh">Дизайн-токены: набор</h1>

      <section id="prim-color">
        <h2>Примитивы: цвет и составные значения</h2>
        <p class="intro">Имя говорит, <b>что это</b>, и молчит о месте. Компонент к ним
          за цветом не обращается — только роль.</p>
${colorHtml}
      </section>

      <section id="roles">
        <h2>Роли</h2>
        <p class="intro">Каждая показывает на примитив и ни на что больше. Третья колонка —
          во что роль упирается сейчас; четвёртая — из какого употребления она выросла.</p>
${semHtml}
      </section>

      <section id="scales">
        <h2>Шкалы</h2>
        <p class="intro">Геометрия и шрифт ролей не получают: отступ и радиус одинаковы
          в любой теме, и второе имя добавило бы слово, а не смысл.</p>
        <h3>Кегль</h3>
${typeHtml}
        <h3>Шаг</h3>
${spaceHtml}
        <h3>Радиус</h3>
${radiusHtml}
        <h3>Размер</h3>
${sizeHtml}
      </section>

    </div>

    <footer>
      <p>Раздел 8 из 12 · Дизайн-токены. Текст — <a href="../tokens.md">tokens.md</a>,
        значения — <a href="../tokens.css">tokens.css</a>, применение —
        <a href="../DESIGN.md">DESIGN.md</a>, набор для Figma — <a href="../figma/">figma/</a>.</p>
      <nav class="section-nav"><a href="kit.html">← Раздел 7 · Сборка UI</a></nav>
    </footer>
  </main>
</div>
${tabsJs(['info', 'set'])}

</body>
</html>
`;

if (unresolved.size) {
  console.error('Разбор tokens.css не нашёл объявления: ' + [...unresolved].join(', '));
  process.exit(1);
}

writeFileSync(join(ROOT, 'sections/tokens.html'), page, 'utf8');
console.log(`sections/tokens.html: ${prim.length} примитивов, ${sem.length} ролей`);
