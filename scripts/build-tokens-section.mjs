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
  let inComment = false;
  for (const line of text.split('\n')) {
    const head = line.match(/\/\* ── (.+?) ─+/);
    if (head) { group = head[1].trim(); pending = []; continue; }
    // Комментарий над токеном — часть токена: в нём сказано, где цвет стоит
    // и из чего роль выросла. Пока блок не закрыт, в него идёт каждая строка:
    // прежняя проверка «строка начинается с буквы» выбрасывала продолжение,
    // начинавшееся с имени класса (`.mm-state, .mm-tabs — всё, что…`).
    if (!inComment && /^\s*\/\*/.test(line)) {
      pending = [line.replace(/^\s*\/\*\s?/, '').replace(/\*\/.*$/, '').trim()];
      inComment = !line.includes('*/');
      continue;
    }
    if (inComment) {
      pending.push(line.replace(/\*\/.*$/, '').replace(/^\s*\*?\s?/, '').trim());
      if (line.includes('*/')) inComment = false;
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

// ── блоки раздела ─────────────────────────────────────────────────────
// Цвет и радиус показываются плиткой, а не строкой таблицы: их узнают глазом,
// и образец в плитке больше строки в шесть раз. Геометрия наоборот — таблицей
// со шкалой и настоящей строкой интерфейса: там сравнивают числа.

const chipOf = (v) => {
  const r = resolve(v);
  if (/^#/.test(r)) return `<i class="tk-chip" style="background:${r}"></i>`;
  if (/gradient/.test(r)) return `<i class="tk-chip" style="background-image:${r}"></i>`;
  if (/^(0|inset)/.test(r)) return `<i class="tk-chip tk-chip--recipe" style="box-shadow:${r}"></i>`;
  return '<i class="tk-chip tk-chip--none"></i>';
};
// Размытие экрана — три слоя в одной строке: целиком оно занимает пол-листа,
// поэтому в плитке стоит его начало, а целиком значение лежит в самом файле.
const short = (v) => (v.length > 56 ? v.slice(0, 53).replace(/,[^,]*$/, '') + ' …' : v);

const swatchGrid = (rows) => `<div class="tk-grid">
${rows.map((r) => `  <div class="tk-swatch">${chipOf(r.value)}
    <code class="tk-name">${esc(r.name)}</code>
    <span class="tk-note"><b>${esc(short(r.value))}</b>${r.note ? ' — ' + inline(r.note) : ''}</span>
  </div>`).join('\n')}
</div>`;

// Угол видно только на углу: числом радиус не читается.
const radiusGrid = (rows) => `<div class="tk-grid tk-grid--sm">
${rows.map((r) => `  <div class="tk-swatch"><i class="tk-box" style="border-radius:${r.value}"></i>
    <code class="tk-name">${esc(r.name)}</code>
    <span class="tk-note"><b>${esc(r.value)}</b>${r.note ? ' — ' + inline(r.note) : ''}</span>
  </div>`).join('\n')}
</div>`;

const tokTable = (head, rows) => `<div class="tokw"><table class="tok">
  <thead><tr>${head}</tr></thead>
  <tbody>
${rows.join('\n')}
  </tbody>
</table></div>`;

// Шкала — полоса настоящей длины. Полоса отвечает на «насколько больше»,
// число рядом — на «сколько именно».
const barTable = (rows, bar) => tokTable(
  '<th>Токен</th><th class="c-num">Значение</th><th class="c-bar">Шкала</th><th>Где стоит</th>',
  rows.map((r) => `    <tr><td><code>${esc(r.name)}</code></td><td class="c-num">${esc(r.value)}</td>`
    + `<td class="c-bar">${bar(r)}</td><td class="tnote">${inline(r.note || '—')}</td></tr>`));

// Образец — настоящая строка интерфейса, а не «Aa»: кегль проверяется
// на той фразе, которую он понесёт.
const sampleTable = (rows, sample) => tokTable(
  '<th>Токен</th><th class="c-num">Значение</th><th>Образец</th><th>Где стоит</th>',
  rows.map((r) => `    <tr><td><code>${esc(r.name)}</code></td><td class="c-num">${esc(r.value)}</td>`
    + `<td class="c-sample">${sample(r)}</td><td class="tnote">${inline(r.note || '—')}</td></tr>`));

const roleTable = (rows) => tokTable(
  '<th>Семантика</th><th>Показывает на</th><th>За что отвечает</th>',
  rows.map((r) => {
    const to = r.value.match(/^var\((--[a-z0-9-]+)\)$/);
    const done = resolve(r.value);
    const hex = /^#/.test(done);
    // Значение показывается рядом с именем только тогда, когда оно короткое.
    // Размытие экрана разворачивается в три слоя на пол-листа: в клетке
    // с nowrap оно растягивало таблицу втрое шире страницы.
    const target = to
      ? `<span class="tk-pair">${hex ? `<i class="tk-dot" style="background:${done}"></i>` : ''}` +
        `<code>${esc(to[1])}</code>${hex ? ` <span class="dim">${esc(done)}</span>` : ''}</span>`
      : `<code class="dim">${esc(short(r.value))}</code>`;
    return `    <tr><td><code>${esc(r.name)}</code></td><td class="val">${target}</td><td class="tnote">${inline(r.note || '—')}</td></tr>`;
  }));

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
const colorHtml = colorGroups.map((g) => `      <h3>${esc(cap(g))}</h3>\n${swatchGrid(prim.filter((r) => r.group === g))}`).join('\n\n');

const semGroups = [...new Set(sem.map((r) => r.group))];
const semHtml = semGroups.map((g) => `      <h3>${esc(cap(g))}</h3>\n${roleTable(sem.filter((r) => r.group === g))}`).join('\n\n');

// ── шкалы ─────────────────────────────────────────────────────────────
// Строки взяты из интерфейса: обещание первого экрана (D-47) и текст пустой
// ленты. На выдуманной строке кегль проверять нечем — она другой длины
// и другого ритма.
const LINE = 'Meet mates · Enjoy the events';
const PARA = 'Events here are posted by people like you — and yours would be the first one nearby.';

const faceHtml = sampleTable(group(prim, /^--font-/), () =>
  `<span class="type" style="font-size:18px">${LINE}</span>`);
const typeHtml = sampleTable(desc(group(prim, /^--text-\d/)), (r) =>
  `<span class="type" style="font-size:${r.value}">${LINE}</span>`);
const weightHtml = sampleTable(desc(group(prim, /^--weight/)), (r) =>
  `<span class="type" style="font-size:16px;font-weight:${r.value}">${LINE}</span>`);
// Межстрочное видно только на нескольких строках: одна показывает кегль,
// а не расстояние между строками.
const leadingHtml = sampleTable(desc(group(prim, /^--leading/)), (r) =>
  `<span class="type type--para" style="line-height:${r.value}">${PARA}</span>`);
// Трекинг меряется на слове, а не на двух буквах: −0,035em на «Aa» не видно.
const trackingHtml = sampleTable(desc(group(prim, /^--tracking/)), (r) =>
  `<span class="type" style="font-size:22px;letter-spacing:${r.value}">${LINE}</span>`);
// Шаг показывается полосой настоящей ширины: 48px рядом с 2px — это то,
// чего не увидеть в столбце чисел.
const spaceHtml = barTable(desc(group(prim, /^--space/)), (r) =>
  (/^\d+px$/.test(r.value) ? `<i class="bar" style="width:${r.value}"></i>` : '<span class="dim">—</span>'));
const radiusHtml = radiusGrid(desc(group(prim, /^--radius/)));
// Размер сжат общим масштабом: 844px в клетку не влезает, но рядом с 16px
// должно быть видно, что это разные порядки. Проценты меряются от родителя,
// а не от экрана: у них полоса своя, штриховая, в долю от той же ширины.
const sizeRows = desc(group(prim, /^--size|^--width|^--measure/));
const maxPx = Math.max(...sizeRows.map((r) => (/px$/.test(r.value) ? Math.abs(parseFloat(r.value)) : 0)));
const sizeHtml = barTable(sizeRows, (r) => {
  if (/%$/.test(r.value)) {
    const w = Math.max(2, Math.round((parseFloat(r.value) / 100) * 160));
    return `<i class="bar bar--part" style="width:${w}px"></i>`;
  }
  if (!/px$/.test(r.value)) return '<span class="dim">—</span>';
  const w = Math.max(2, Math.round((Math.abs(parseFloat(r.value)) / maxPx) * 160));
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
const motionHtml = barTable(motionRows, (r) => {
  if (msOf(r.value)) return `<i class="bar bar--size" style="width:${Math.max(2, Math.round((msOf(r.value) / maxMs) * 160))}px"></i>`;
  if (/^--opacity/.test(r.name)) return `<i class="tk-dot tk-dot--ink" style="opacity:${r.value}"></i>`;
  if (/^--zoom/.test(r.name)) return `<span class="type" style="font-size:14px;display:inline-block;transform:scale(${r.value})">${LINE}</span>`;
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
// Проба — те же два токена, надетые друг на друга: число говорит, сколько
// получилось, а буквы рядом — как это выглядит. Без пробы таблица контраста
// рассказывает о читаемости, ничего не показывая.
const contrastHtml = tokTable(
  '<th>Пара</th><th class="c-num">Порог</th><th class="c-check">Проверка</th>',
  pairRows.map((x) => `    <tr><td><code>${esc(x.fg)}</code> на <code>${esc(x.bg)}</code>` +
    `<span class="tnote tnote--sub">${esc(x.what)}</span></td>` +
    `<td class="c-num">${String(x.min).replace('.', ',')}:1</td>` +
    `<td class="c-check"><span class="tk-pair">` +
    `<span class="tk-sample" style="color:${x.f};background:${x.b}">Aa</span>` +
    `<b>${fmt(x.r)}:1</b><span class="${x.ok ? 'tk-pass">да' : 'tk-fail">нет'}</span></span></td></tr>`));

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
.tok .c-num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.tok .c-bar { width: 34%; }
.tok .c-sample { width: 40%; }
.tok .c-check { width: 30%; }
.tok .val { white-space: nowrap; }
.tok .tnote { color: var(--ink-600); max-width: 48ch; }
/* Подпись под именем пары: что это за место на экране. Отдельной колонкой
   она растягивала таблицу, а без неё имена ничего не говорят. */
.tok .tnote--sub { display: block; margin-top: var(--s-1); }
.tok .dim { color: var(--ink-600); }
.tok code { font-size: var(--t-caption); white-space: nowrap; }

/* ── Плитка цвета: сам цвет сверху, под ним имя и строка «значение — где стоит».
   Цвет узнают глазом, и в плитке образец больше строки таблицы в шесть раз. */
.tk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(212px, 1fr)); gap: var(--s-3); margin: 0 0 var(--s-5); }
.tk-grid--sm { grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); }
.tk-swatch { padding: var(--s-3); border-radius: var(--r-lg); background: var(--surface-2); }
.tk-chip { display: block; height: 56px; border-radius: var(--r-md); border: 1px solid var(--line); background: var(--surface); }
/* Рецепт показывает себя тенью, а не заливкой; у значения без образца —
   штриховка: клетка не пустая, но и цвета в ней нет */
.tk-chip--recipe { background: var(--surface); }
.tk-chip--none { background: repeating-linear-gradient(45deg, var(--surface) 0 5px, transparent 5px 10px); }
.tk-box { display: block; height: 56px; background: var(--surface); border: 1px solid var(--line); }
.tk-name { display: block; margin: var(--s-3) 0 var(--s-1); font-size: var(--t-caption); color: var(--ink-900); white-space: nowrap; }
.tk-note { display: block; font-size: var(--t-micro); line-height: 1.5; color: var(--ink-600); }
.tk-note b { color: var(--ink-900); font-weight: var(--fw-medium); font-variant-numeric: tabular-nums; }

/* ── Проба и метки ──────────────────────────────────────────── */
.tk-pair { display: inline-flex; align-items: center; gap: var(--s-2); }
.tk-dot { display: inline-block; width: 14px; height: 14px; border-radius: 4px; border: 1px solid var(--line); flex: none; }
.tk-dot--ink { background: var(--ink-900); border-color: transparent; }
.tk-sample { display: inline-grid; place-items: center; width: 34px; height: 24px; border-radius: var(--r-sm); font-size: var(--t-caption); flex: none; }
.tk-pass { color: var(--ink-600); }
.tk-fail { color: #96123A; font-weight: var(--fw-bold); }

/* Образец набран настоящей строкой интерфейса: длинная строка сжимается
   до клетки, абзац межстрочного держит ширину в строках, а не в пикселях */
.type { display: block; line-height: 1.1; color: var(--ink-900); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.type--para { max-width: 38ch; white-space: normal; font-size: var(--t-caption); }
.bar { display: inline-block; height: 12px; border-radius: 2px; background: var(--brand-a); vertical-align: middle; }
.bar--size { height: 8px; background: var(--ink-400); }
.bar--part { height: 8px; background: repeating-linear-gradient(90deg, var(--ink-400) 0 6px, transparent 6px 9px); }

/* Строка файлов под шапкой: куда идти за самим значением */
.files { display: flex; flex-wrap: wrap; gap: var(--s-2); margin: var(--s-4) 0 0; padding: 0; list-style: none; }
.files a { display: inline-block; padding: var(--s-2) var(--s-3); border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--surface); font-size: var(--t-caption); text-decoration: none; color: var(--ink-900); }
.files a:hover, .files a:focus-visible { background: var(--surface-2); }

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
      <ul class="files">
        <li><a href="../tokens.css">tokens.css</a></li>
        <li><a href="../tokens.md">tokens.md</a></li>
        <li><a href="../components/">components/</a></li>
        <li><a href="../DESIGN.md">DESIGN.md</a></li>
        <li><a href="../figma/">figma/</a></li>
        <li><a href="kit.html">Раздел 07 · Сборка UI</a></li>
      </ul>
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
