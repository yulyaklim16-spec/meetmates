// Сборка раздела 08 «Дизайн-токены» — sections/tokens.html.
//
// Семь подпунктов, по одному на слой: граница между уровнями, цвет, геометрия,
// семантика, контраст, правки, что открыто. Текст каждого — свой раздел `## `
// в tokens.md; таблицы — из самого tokens.css. Числа на странице не
// переписываются руками: отстать им не от чего, они берутся из файла при сборке.
//
// Соответствие подпункта и раздела документа жёсткое: заголовок, которого нет
// в TABS, роняет сборку. Иначе текст молча пропал бы со страницы.
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
// Граница уровней — начало баннера SEMANTIC, а не первая его роль: если резать
// по `--bg-page`, подпись группы «── фон ──» остаётся в примитивах, и первые
// четыре роли попадают в таблицу «Прочее».
const SEM_AT = light.lastIndexOf('/*', light.indexOf('SEMANTIC — семантика цвета'));
if (SEM_AT < 0) throw new Error('в tokens.css не нашёлся баннер SEMANTIC — разбор отстал от файла');

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

// ── контраст: тот же расчёт, что в гейте, но в именах семантики ────────
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

// Число и слово при нём: 1 пара, 2–4 пары, 5–20 пар. Счётчик пар растёт
// вместе с набором, и подогнать слово один раз нельзя.
const plural = (n, one, few, many) => {
  const d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return `${n} ${one}`;
  if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
};

// ── таблицы ───────────────────────────────────────────────────────────
const swatch = (v) => {
  const r = resolve(v);
  if (/^#/.test(r)) return `<i class="sw" style="background:${r}"></i>`;
  if (/gradient/.test(r)) return `<i class="sw sw--wide" style="background-image:${r}"></i>`;
  if (/^(0|inset)/.test(r)) return `<i class="sw sw--shadow" style="box-shadow:${r}"></i>`;
  return '<i class="sw sw--none"></i>';
};

const colorTable = (rows) => `<div class="tokw"><table class="tok">
  <thead><tr><th class="c-sw"><span class="vh">Образец</span></th><th>Имя</th><th>Значение</th><th>Где стоит</th></tr></thead>
  <tbody>
${rows.map((r) => `    <tr><td>${swatch(r.value)}</td><td><code>${esc(r.name)}</code></td><td class="val"><code>${esc(r.value)}</code></td><td class="tnote">${inline(r.note || '—')}</td></tr>`).join('\n')}
  </tbody>
</table></div>`;

const roleTable = (rows) => `<div class="tokw"><table class="tok">
  <thead><tr><th class="c-sw"><span class="vh">Образец</span></th><th>Семантика</th><th>Показывает на</th><th>За что отвечает</th></tr></thead>
  <tbody>
${rows.map((r) => {
  const to = r.value.match(/^var\((--[a-z0-9-]+)\)$/);
  const target = to ? `<code>${esc(to[1])}</code> <span class="dim">${esc(resolve(r.value))}</span>` : `<code>${esc(r.value)}</code>`;
  return `    <tr><td>${swatch(r.value)}</td><td><code>${esc(r.name)}</code></td><td class="val">${target}</td><td class="tnote">${inline(r.note || '—')}</td></tr>`;
}).join('\n')}
  </tbody>
</table></div>`;

const scaleTable = (rows, sample) => `<div class="tokw"><table class="tok">
  <thead><tr><th class="c-sw"><span class="vh">Образец</span></th><th>Имя</th><th>Значение</th><th>Где стоит</th></tr></thead>
  <tbody>
${rows.map((r) => `    <tr><td>${sample(r)}</td><td><code>${esc(r.name)}</code></td><td class="val"><code>${esc(r.value)}</code></td><td class="tnote">${inline(r.note || '—')}</td></tr>`).join('\n')}
  </tbody>
</table></div>`;

const group = (rows, re) => rows.filter((r) => re.test(r.name));
// Числовые шкалы читаются сверху вниз, от большего к меньшему: так видно
// потолок шкалы и шаг вниз от него, а не разбег от нуля.
const num = (v) => { const m = String(v).match(/-?\d*\.?\d+/); return m ? parseFloat(m[0]) : -Infinity; };
const desc = (rows) => [...rows].sort((a, b) => num(b.value) - num(a.value));

// Группы отбираются по имени группы, а не по именам токенов внутри:
// --size-dot-ring затягивал в таблицу цвета весь «размер», и она двоилась.
const colorGroups = [...new Set(prim.map((r) => r.group))]
  .filter((g) => /^цвет|тень и кольцо/.test(g));
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const colorHtml = colorGroups.map((g) => `      <h3>${esc(cap(g))}</h3>\n${colorTable(prim.filter((r) => r.group === g))}`).join('\n\n');

const semGroups = [...new Set(sem.map((r) => r.group))];
const semHtml = semGroups.map((g) => `      <h3>${esc(cap(g))}</h3>\n${roleTable(sem.filter((r) => r.group === g))}`).join('\n\n');

// ── шкалы ─────────────────────────────────────────────────────────────
const faceHtml = scaleTable(group(prim, /^--font-/), () =>
  '<span class="type" style="font-size:20px">Aa</span>');
const typeHtml = scaleTable(desc(group(prim, /^--text-\d/)), (r) =>
  `<span class="type" style="font-size:${r.value}">Aa</span>`);
const weightHtml = scaleTable(desc(group(prim, /^--weight/)), (r) =>
  `<span class="type" style="font-size:20px;font-weight:${r.value}">Aa</span>`);
// Межстрочное видно только на двух строках: одна строка показывает кегль,
// а не расстояние между строками.
const leadingHtml = scaleTable(desc(group(prim, /^--leading/)), (r) =>
  `<span class="lead" style="line-height:${r.value}">Aa<br>Aa</span>`);
// Трекинг меряется на слове, а не на двух буквах: −0,035em на «Aa» не видно.
const trackingHtml = scaleTable(desc(group(prim, /^--tracking/)), (r) =>
  `<span class="type" style="font-size:16px;letter-spacing:${r.value}">Meet</span>`);
const spaceHtml = scaleTable(desc(group(prim, /^--space/)), (r) =>
  `<i class="bar" style="width:${/px/.test(r.value) ? r.value : '8px'}"></i>`);
const radiusHtml = scaleTable(desc(group(prim, /^--radius/)), (r) =>
  `<i class="sw sw--radius" style="border-radius:${r.value}"></i>`);
// Образец размера — полоса настоящей длины, сжатая общим масштабом: 844px
// в клетку не влезает, но рядом с 16px должно быть видно, что это разные
// порядки. Проценты и ch меряются не в пикселях — у них полосы нет.
const sizeRows = desc(group(prim, /^--size|^--width|^--measure/));
const maxPx = Math.max(...sizeRows.map((r) => (/px$/.test(r.value) ? Math.abs(parseFloat(r.value)) : 0)));
const sizeHtml = scaleTable(sizeRows, (r) => {
  // проценты меряются от родителя, а не от экрана: их полоса своя,
  // в долю от той же сотни двадцати, и видно, что это доля, а не пиксели
  if (/%$/.test(r.value)) {
    const w = Math.max(2, Math.round((parseFloat(r.value) / 100) * 120));
    return `<i class="bar bar--part" style="width:${w}px"></i>`;
  }
  if (!/px$/.test(r.value)) return '<span class="dim">—</span>';
  const w = Math.max(2, Math.round((Math.abs(parseFloat(r.value)) / maxPx) * 120));
  return `<i class="bar bar--size" style="width:${w}px"></i>`;
});
// Длительность — полоса в долю от самой долгой; прозрачность — та же плашка
// в полсилы; у кривой образца нет: её видно только в движении.
const msOf = (v) => (/ms$/.test(v) ? parseFloat(v) : /s$/.test(v) ? parseFloat(v) * 1000 : 0);
// Движение шкалой не является: длительность, кривая, увеличение и прозрачность
// меряются разным, и общего «больше — меньше» у них нет. Поэтому здесь порядок
// файла, а не убывание, — иначе 1.4s вставало бы между 200ms и кривой.
const motionRows = group(prim, /^--duration|^--ease|^--zoom|^--opacity/);
const maxMs = Math.max(...motionRows.map((r) => msOf(r.value)));
const motionHtml = scaleTable(motionRows, (r) => {
  if (msOf(r.value)) return `<i class="bar bar--size" style="width:${Math.max(2, Math.round((msOf(r.value) / maxMs) * 120))}px"></i>`;
  if (/^--opacity/.test(r.name)) return `<i class="sw sw--ink" style="opacity:${r.value}"></i>`;
  if (/^--zoom/.test(r.name)) return `<span class="type" style="font-size:16px;display:inline-block;transform:scale(${r.value})">Aa</span>`;
  return '<span class="dim">—</span>';
});

// ── контраст: пары в именах семантики ─────────────────────────────────
// Гейт считает те же пары по tokens/tokens.css, где уровень один. Здесь они
// названы семантикой — тем, чем их читает компонент. Фон экрана градиентный,
// поэтому текст на размытии считается по --lilac-150, самому тёмному его месту.
const PAIRS = [
  ['Основной текст на фоне экрана', '--text-primary', '--bg-page', 4.5],
  ['Основной текст на карточке', '--text-primary', '--bg-surface', 4.5],
  ['Заголовок экрана на размытии', '--text-primary', '--lilac-150', 4.5],
  ['Подпись кнопки под курсором', '--text-primary', '--bg-hover', 4.5],
  ['Вторичный текст на карточке', '--text-muted', '--bg-surface', 4.5],
  ['Вторичный текст на вложенном: поле, чип', '--text-muted', '--bg-nested', 4.5],
  ['Вторичный текст на размытии', '--text-muted', '--lilac-150', 4.5],
  ['Вторичный текст под курсором', '--text-muted', '--bg-hover', 4.5],
  ['Слово на кнопке действия', '--text-on-action', '--color-action', 4.5],
  ['Слово на лейбе Verified', '--text-on-verified', '--color-verified', 4.5],
  ['Подпись выбранной вкладки', '--text-on-selected', '--bg-selected', 4.5],
  ['Своя реплика в диалоге', '--text-primary', '--bg-mine', 4.5],
  ['Реплика, которая не ушла', '--text-primary', '--bg-undelivered', 4.5],
  ['Опасное словом на карточке', '--text-danger', '--bg-surface', 4.5],
  ['Опасное словом на размытии: Report, отказ', '--text-danger', '--lilac-150', 4.5],
  ['Опасное словом под курсором', '--text-danger', '--bg-hover', 4.5],
  ['Иконка на фоне экрана (не текст)', '--icon-muted', '--bg-page', 3],
  ['Иконка на карточке (не текст)', '--icon-muted', '--bg-surface', 3],
  ['Иконка на вложенном (не текст)', '--icon-muted', '--bg-nested', 3],
  ['Кольцо фокуса на вложенном (не текст)', '--border-focus', '--bg-nested', 3],
  ['Заливка и обводка опасного на размытии (не текст)', '--color-danger', '--lilac-150', 3],
];

const hexOf = (name) => {
  const v = valueOf.get(name);
  if (v === undefined) { unresolved.add(name); return null; }
  const r = resolve(v);
  return /^#[0-9a-fA-F]{6}$/.test(r) ? r.toUpperCase() : null;
};
const pairRows = PAIRS.map(([what, fg, bg, min]) => {
  const f = hexOf(fg); const b = hexOf(bg);
  const r = f && b ? ratio(f, b) : 0;
  return { what, fg, bg, f, b, r, min, ok: r >= min };
});
const contrastHtml = `<div class="tokw"><table class="tok tok--pairs">
  <thead><tr><th>Где</th><th>Текст или знак</th><th>Фон</th><th class="c-num">Коэффициент</th><th class="c-num">Порог</th></tr></thead>
  <tbody>
${pairRows.map((x) => `    <tr><td>${esc(x.what)}</td>` +
  `<td><i class="sw sw--sm" style="background:${x.f}"></i><code>${esc(x.fg)}</code></td>` +
  `<td><i class="sw sw--sm" style="background:${x.b}"></i><code>${esc(x.bg)}</code></td>` +
  `<td class="c-num"><b>${fmt(x.r)}:1</b></td><td class="c-num">${String(x.min).replace('.', ',')}:1</td></tr>`).join('\n')}
  </tbody>
</table></div>`;

// ── текст раздела: один `## ` на подпункт ─────────────────────────────
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
const render = (text) => md(text).replace(/href="\.\/(?!\.)/g, 'href="../');

const parts = blocks(doc);
const intro = parts.find((b) => b.title === null);
const byTitle = new Map(parts.filter((b) => b.title).map((b) => [b.title, b.text]));

// Подпункт — раздел документа плюс свои таблицы. Заголовок документа, которого
// здесь нет, роняет сборку: текст не должен пропадать со страницы молча.
const TABS = [
  { id: 'overview', title: 'Два уровня', tables: '' },
  { id: 'primitive', title: 'Цвет', tables: colorHtml },
  {
    id: 'scales',
    title: 'Геометрия',
    tables: `      <h3>Гарнитура</h3>
${faceHtml}

      <h3>Кегль</h3>
${typeHtml}

      <h3>Вес</h3>
${weightHtml}

      <h3>Межстрочное</h3>
${leadingHtml}

      <h3>Трекинг</h3>
${trackingHtml}

      <h3>Шаг</h3>
${spaceHtml}

      <h3>Радиус</h3>
${radiusHtml}

      <h3>Размер</h3>
${sizeHtml}

      <h3>Движение и прозрачность</h3>
${motionHtml}`,
  },
  { id: 'semantic', title: 'Семантика цвета', tables: semHtml },
  { id: 'contrast', title: 'Контраст', tables: contrastHtml },
  { id: 'fixes', title: 'Правки', tables: '' },
  { id: 'decision', title: 'Что открыто', tables: '' },
];

const claimed = new Set(TABS.map((t) => t.title));
const orphan = [...byTitle.keys()].filter((t) => !claimed.has(t));
if (orphan.length) {
  console.error('В tokens.md есть разделы, которым нет подпункта: ' + orphan.join(', '));
  process.exit(1);
}
const missing = TABS.filter((t) => !byTitle.has(t.title)).map((t) => t.title);
if (missing.length) {
  console.error('В tokens.md нет разделов под подпункты: ' + missing.join(', '));
  process.exit(1);
}

const panels = TABS.map((t, i) => `    <div class="tabpanel" id="${t.id}">
      <h1 class="vh">Дизайн-токены: ${esc(t.title.toLowerCase())}</h1>
${i === 0 && intro ? render(intro.text) + '\n' : ''}      <section id="${slugify(t.title)}">
        <h2>${inline(t.title)}</h2>
${render(byTitle.get(t.title))}
${t.tables}
      </section>
    </div>`).join('\n\n');

// ── боковая колонка ───────────────────────────────────────────────────
const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
const cur = /<a class="mat"([^>]*)href="tokens\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html нет пункта 08 со ссылкой на tokens.html — боковая колонка изменилась');
const subtabs = subtabsHtml(TABS.map((t) => ({ id: t.id, title: t.title })));
const aside = asideSrc.replace(cur, (m, attrs, head) =>
  `<a class="mat current"${attrs}href="tokens.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);

const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Дизайн-токены · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="Два уровня токенов: примитив — значение, семантика — ответственность. Цвет, геометрия, контраст и весь набор таблицами, собранными из самого файла.">');

const extraCss = `
/* ── Раздел 08: дизайн-токены ───────────────────────────────── */
${TABS_CSS}
/* Узкую страницу таблица не растягивает: её листает своя полоса, а не вся
   страница. Контраст с длинной первой колонкой на телефоне иначе уезжал вбок. */
.tokw { overflow-x: auto; margin: 0 0 var(--s-5); }
.tok { width: 100%; border-collapse: collapse; font-size: var(--t-caption); }
.tok th { text-align: left; font-weight: var(--fw-semibold); color: var(--ink-600); padding: var(--s-2) var(--s-3); border-bottom: 1px solid var(--line); }
.tok td { padding: var(--s-2) var(--s-3); border-bottom: 1px solid var(--line); vertical-align: top; }
.tok tr:last-child td { border-bottom: 0; }
.tok .c-sw { width: 136px; }
.tok .c-num { text-align: right; white-space: nowrap; }
.tok .val { white-space: nowrap; }
.tok .tnote { color: var(--ink-600); max-width: 48ch; }
.tok .dim { color: var(--ink-600); }
.tok code { font-size: var(--t-caption); white-space: nowrap; }
/* Пары контраста: первая колонка держит фразу, остальные — имя с образцом.
   Коэффициент выровнен по правому краю, чтобы числа читались столбиком. */
.tok--pairs td:first-child { max-width: 36ch; }
.tok--pairs .sw--sm { vertical-align: -3px; }
/* Образец показывает само значение: цвет заливкой, тень — тенью, радиус —
   своим углом. Подписи под ним нет — имя стоит в соседней клетке. */
.sw { display: inline-block; width: 36px; height: 24px; border-radius: var(--r-sm); border: 1px solid var(--line); vertical-align: middle; }
.sw--sm { width: 14px; height: 14px; border-radius: 4px; margin-right: var(--s-2); }
.sw--wide { width: 56px; }
.sw--shadow { background: var(--surface); }
.sw--radius { background: var(--surface-2); }
.sw--ink { background: var(--ink-900); border-color: transparent; }
.sw--none { background: repeating-linear-gradient(45deg, var(--surface-2) 0 4px, transparent 4px 8px); }
.type { display: inline-block; line-height: 1; color: var(--ink-900); }
.lead { display: inline-block; font-size: var(--t-caption); color: var(--ink-900); }
.bar { display: inline-block; height: 12px; border-radius: 2px; background: var(--brand-a); vertical-align: middle; }
.bar--size { height: 8px; background: var(--ink-400); }
.bar--part { height: 8px; background: repeating-linear-gradient(90deg, var(--ink-400) 0 6px, transparent 6px 9px); }
#overview blockquote { margin: 0 0 var(--s-5); padding-left: var(--s-4); border-left: 2px solid var(--line); color: var(--ink-600); }
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
      <p class="lede">Два уровня: <b>примитив</b> — значение само по себе, <b>семантика</b> — ответственность.
        Так они и названы в <a href="../tokens.css">tokens.css</a> — <code>PRIMITIVE</code> и <code>SEMANTIC</code>,
        и так же в Figma. Компонент берёт цвет только семантикой, геометрию — только примитивом. Таблицы в подпунктах
        собраны из <a href="../tokens.css">tokens.css</a> при сборке страницы, поэтому отстать не могут.</p>
      <div class="chips">
        <span>${prim.length} примитивов</span>
        <span>${sem.length} семантических</span>
        <span>${plural(pairRows.length, 'пара', 'пары', 'пар')} контраста</span>
        <span>ноль значений в компонентах</span>
      </div>
    </div>

${panels}

    <footer>
      <p>Раздел 8 из 12 · Дизайн-токены. Текст — <a href="../tokens.md">tokens.md</a>,
        значения — <a href="../tokens.css">tokens.css</a>, применение —
        <a href="../DESIGN.md">DESIGN.md</a>, набор для Figma — <a href="../figma/">figma/</a>.</p>
      <nav class="section-nav"><a href="kit.html">← Раздел 7 · Сборка UI</a></nav>
    </footer>
  </main>
</div>
${tabsJs(TABS.map((t) => t.id))}

</body>
</html>
`;

if (unresolved.size) {
  console.error('Разбор tokens.css не нашёл объявления: ' + [...unresolved].join(', '));
  process.exit(1);
}

// Таблица контраста — не картинка, а проверка: пара ниже порога роняет сборку
// так же, как гейт contrast.mjs. Иначе страница рассказывала бы о доступности,
// показывая непроходные числа.
const bad = pairRows.filter((x) => !x.ok);
if (bad.length) {
  console.error('Пары ниже порога:\n' + bad.map((x) => `  ${x.what}: ${fmt(x.r)}:1 < ${x.min}:1 (${x.fg} на ${x.bg})`).join('\n'));
  process.exit(1);
}

writeFileSync(join(ROOT, 'sections/tokens.html'), page, 'utf8');
console.log(`sections/tokens.html: ${TABS.length} подпунктов, ${prim.length} примитивов, ${sem.length} семантических, ${plural(pairRows.length, 'пара', 'пары', 'пар')} контраста`);
