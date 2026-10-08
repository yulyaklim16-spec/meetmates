// Сборка раздела 05 «Tone of voice и микрокопи» — sections/voice.html.
//
// Источники: voice.md (как продукт говорит) и microcopy.md (что написано сейчас).
// Страница собирается целиком из них: правим документы, а не страницу.
//
// Две вкладки подпунктами в дереве, как у раздела 04: «Голос» — принципы, словарь,
// запретное и микрокопи по элементам; «Перепись» — инвентарь всех строк интерфейса.
// Инвентарь свёрнут по экранам: 466 строк одной лентой не читает никто, а раскрытый
// экран сразу показывает, что на нём написано.
//
// Запуск: node scripts/build-voice.mjs — после правки voice.md или microcopy.md.
// Оболочка (стили, боковая колонка) берётся из sections/index.html — один источник
// правды по внешнему виду разделов.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline, md, section } from './lib/markdown.mjs';
import { subtabsHtml, TABS_CSS, tabsJs } from './lib/tabs.mjs';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const voice = read('voice.md');
const micro = read('microcopy.md');
const shell = read('sections/index.html');

// ── счёт для шапки ─────────────────────────────────────────────────────
// Строки таблиц: подряд идущие строки с `|`, минус заголовок и разделитель.
function countRows(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  let n = 0, run = 0;
  for (const l of lines) {
    if (l.startsWith('|')) { run++; continue; }
    if (run) { n += Math.max(0, run - 2); run = 0; }
  }
  return n + Math.max(0, run - 2);
}

const principles = (section(voice, 'Принципы').match(/^### /gm) || []).length;
const terms = countRows(section(voice, 'Словарь'));
const inventoryRows = countRows(section(micro, '3. Инвентарь по экранам'));
const edits = countRows(section(micro, '6. Переписанные страницы — было и стало'));

// ── разбор документа на разделы `## ` ─────────────────────────────────
function blocks(text) {
  const body = text.replace(/\r/g, '').replace(/^#[^#][^\n]*\n/, '');  // H1 — у страницы свой
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

// «1 строка · 2 строки · 5 строк» — счёт читает человек, а не машина
const plural = (n, [one, few, many]) => {
  const d = n % 10, h = n % 100;
  return `${n} ${d === 1 && h !== 11 ? one : d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many}`;
};
const rows = (n) => plural(n, ['строка', 'строки', 'строк']);

// ── инвентарь: каждый экран — свой свёрток ────────────────────────────
// Закрыт по умолчанию: перепись нужна точечно — посмотреть, что стоит на экране.
function inventoryHtml(text) {
  const parts = text.split(/^### /m).map((p, i) => (i === 0 ? p : '### ' + p));
  const intro = parts[0].trim() ? md(parts[0].trim()) : '';
  const screens = parts.slice(1).map((p) => {
    const nl = p.indexOf('\n');
    const title = p.slice(4, nl).trim();
    const rest = p.slice(nl + 1).trim();
    return `      <details class="inv" id="${slugify(title)}">
        <summary>${inline(title)}<span>${rows(countRows(rest))}</span></summary>
        ${md(rest, { hShift: 1 })}
      </details>`;
  }).join('\n');
  return `${intro}\n<div class="invlist">\n${screens}\n</div>`;
}

// ── боковая колонка: раздел 05 становится текущим, под ним — подпункты ──
const asideSrc = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length);
const cur = /<a class="mat"([^>]*)href="voice\.html">([\s\S]*?)<i>[^<]*<\/i><\/span><\/a>/;
if (!cur.test(asideSrc)) throw new Error('в sections/index.html нет пункта 05 со ссылкой на voice.html — боковая колонка изменилась');
const subtabs = subtabsHtml([
  { id: 'voice', title: 'Голос' },
  { id: 'microcopy', title: 'Перепись' },
]);
const aside = asideSrc.replace(cur, (m, attrs, head) =>
  `<a class="mat current"${attrs}href="voice.html" aria-current="page">${head}<i>текущий раздел</i></span></a>${subtabs}`);

// ── содержимое вкладок ────────────────────────────────────────────────
const voiceHtml = blocks(voice).map((b) => (b.title
  ? `      <section id="${slugify(b.title)}">\n        <h2>${inline(b.title)}</h2>\n${md(b.text)}\n      </section>`
  : md(b.text))).join('\n\n');

const microHtml = blocks(micro).map((b) => {
  if (!b.title) return md(b.text);
  const isInv = /^3\. Инвентарь/.test(b.title);
  return `      <section id="${slugify(b.title)}">\n        <h2>${inline(b.title)}</h2>\n${isInv ? inventoryHtml(b.text) : md(b.text)}\n      </section>`;
}).join('\n\n');

// ── страница ──────────────────────────────────────────────────────────
const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Tone of voice и микрокопи · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Голос продукта: пять принципов с доказательствами, словарь, запретное и микрокопи по типам элементов. Плюс перепись всего текста интерфейса.">');

const extraCss = `
/* ── Раздел 05: голос и перепись ───────────────────────────── */
${TABS_CSS}

/* Перепись: экран — свёрток. Закрыт по умолчанию, потому что нужен точечно */
.invlist { display: flex; flex-direction: column; gap: var(--s-2); margin: var(--s-4) 0 var(--s-6); }
details.inv { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); }
details.inv > summary {
  cursor: pointer; list-style: none;
  display: flex; align-items: baseline; gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  font-size: var(--t-body-sm); font-weight: var(--fw-medium);
}
details.inv > summary::-webkit-details-marker { display: none; }
details.inv > summary::before { content: "›"; color: var(--ink-400); transition: transform var(--dur-fast) var(--ease-out); }
details.inv[open] > summary::before { transform: rotate(90deg); }
details.inv > summary span { margin-left: auto; font-weight: var(--fw-regular); font-size: var(--t-micro); color: var(--ink-600); font-variant-numeric: tabular-nums; }
details.inv > summary:hover { background: var(--surface-2); border-radius: var(--r-md); }
details.inv > :not(summary) { margin-left: var(--s-4); margin-right: var(--s-4); }
details.inv > :last-child { margin-bottom: var(--s-4); }
details.inv h3 { font-size: var(--t-body-sm); margin: var(--s-4) 0 var(--s-2); }

/* Голос: примеры и антипримеры идут блоками кода — их много, они должны быть тихими */
#voice pre.ascii { background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--r-md); padding: var(--s-3) var(--s-4); font-size: var(--t-caption); line-height: 1.5; overflow-x: auto; }
#voice blockquote, #microcopy blockquote { margin: 0 0 var(--s-5); padding-left: var(--s-4); border-left: 2px solid var(--line); color: var(--ink-600); }
`;

const page = `${head}${extraCss}</style>
</head>
<body>

<a class="skip" href="#content">Перейти к материалу</a>

<div class="shell">

  ${aside}

  <main id="content">
    <div class="tabpanel" id="voice">
    <div class="masthead">
      <h1>Tone of voice и микрокопи</h1>
      <p class="lede">Как продукт говорит — и что у него написано прямо сейчас. Пять принципов, у каждого строка из исследования, из которой он выведен; словарь, где одно понятие — одно слово; запретное; тон для экранов, которых ещё нет. Собрано из <a href="../voice.md">voice.md</a> и <a href="../microcopy.md">microcopy.md</a>; страница пересобирается скриптом, руками не правится.</p>
      <div class="chips">
        <span><b>${principles}</b> ${plural(principles, ['принцип', 'принципа', 'принципов']).replace(/^\d+ /, '')}</span>
        <span><b>${terms}</b> ${plural(terms, ['слово', 'слова', 'слов']).replace(/^\d+ /, '')} в словаре</span>
        <span><b>${inventoryRows}</b> ${plural(inventoryRows, ['строка', 'строки', 'строк']).replace(/^\d+ /, '')} интерфейса</span>
        <span><b>${edits}</b> ${plural(edits, ['правка', 'правки', 'правок']).replace(/^\d+ /, '')} текста</span>
      </div>
      <!--PUBLIC-NOTE-->
    </div>

${voiceHtml}
    </div>

    <div class="tabpanel" id="microcopy">
      <h1 class="vh">Tone of voice и микрокопи: перепись</h1>
${microHtml}
    </div>

    <footer>
      <p>Раздел 5 из 12 · Tone of voice и микрокопи. Источники — <a href="../voice.md">voice.md</a>, <a href="../microcopy.md">microcopy.md</a>; решения — <a href="../DECISIONS.md">DECISIONS.md</a>.</p>
      <nav class="section-nav"><a href="wireframes.html">← Раздел 4 · Прототипирование и вайрфрейминг</a></nav>
    </footer>
  </main>
</div>
${tabsJs(['voice', 'microcopy'])}

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/voice.html'), page, 'utf8');
console.log(`sections/voice.html: ${principles} принципов, ${terms} слов в словаре, ${inventoryRows} строк переписи`);
