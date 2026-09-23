// Сборка раздела 04 «Прототипирование и вайрфрейминг» — sections/wireframes.html.
//
// Навигация по макетам строится из wireframes/_screens.md: список страниц выводится
// из таблицы состояний, а есть страница или ещё нет — проверяется по файловой системе.
// Значит раздел не врёт: появился файл — появилась ссылка, руками ничего не отмечается.
//
// Запуск: node scripts/build-wireframes.mjs — после добавления любой страницы в wireframes/.
// Оболочка (стили, боковая колонка) берётся из sections/index.html, как и у раздела 3.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const screensMd = read('wireframes/_screens.md');
const shell = read('sections/index.html');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── экраны из таблицы состояний ────────────────────────────────────────
// | **II.1** Колода | `deck` | ✓ | ✓ | ✓ | — |
const STATES = [
  { key: 'empty', suffix: '-empty', title: 'пусто' },
  { key: 'error', suffix: '-error', title: 'ошибка' },
  { key: 'loading', suffix: '-loading', title: 'загрузка' },
  { key: 'success', suffix: '-success', title: 'успех' },
];

function screens() {
  const rows = [...screensMd.matchAll(/^\| \*\*([IVX]+\.\d+)\*\* ([^|]+?) \| `([a-z]+)` \| (.+?) \|\s*$/gm)];
  if (rows.length !== 8) throw new Error(`в _screens.md найдено ${rows.length} экранов вместо восьми`);
  // экраны с ожиданием — отдельная таблица D-42
  const waitBlock = screensMd.slice(screensMd.indexOf('### Пятое состояние'), screensMd.indexOf('### Почему так'));
  const waits = new Set([...waitBlock.matchAll(/\*\*([IVX]+\.\d+)\*\*/g)].map((m) => m[1]));

  return rows.map(([, code, name, file, tail]) => {
    const flags = tail.split('|').map((c) => c.trim());
    const has = Object.fromEntries(STATES.map((s, i) => [s.key, flags[i] === '✓']));
    const onlySuccess = has.success && !has.empty && !has.error && !has.loading;
    const pages = [{ file: `${file}.html`, title: onlySuccess ? 'успех — он же рабочий вид' : 'рабочий вид' }];
    for (const s of STATES) {
      if (!has[s.key]) continue;
      if (s.key === 'success' && onlySuccess) continue;   // успех совпал с базовым видом
      pages.push({ file: `${file}${s.suffix}.html`, title: s.title });
    }
    if (waits.has(code)) pages.push({ file: `${file}-waiting.html`, title: 'ожидание чужого решения · D-42' });
    return { code, name: name.trim(), file, pages };
  });
}

// ── что из этого уже нарисовано ────────────────────────────────────────
const list = screens();
for (const s of list) for (const p of s.pages) p.exists = existsSync(join(ROOT, 'wireframes', p.file));
const done = list.flatMap((s) => s.pages).filter((p) => p.exists);
const total = list.flatMap((s) => s.pages).length;
if (!done.length) throw new Error('в wireframes/ нет ни одной страницы — раздел показывать нечего');

// показываем первый нарисованный макет; его экран — первый в навигации
const current = done[0];
const currentScreen = list.find((s) => s.pages.includes(current));

// ── страница раздела ───────────────────────────────────────────────────
const head = shell.slice(0, shell.indexOf('</style>'))
  .replace(/<title>[^<]*<\/title>/, '<title>Прототипирование и вайрфрейминг · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Вайрфреймы главного потока: макеты в мокапе телефона, по странице на состояние. Навигация по экранам и текущий макет.">');

const aside = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length)
  .replace(/<a class="mat soon" href="\?section=4">([\s\S]*?)<i>скоро<\/i>/, '<a class="mat current" href="wireframes.html">$1<i>текущий раздел</i>')
  .replace(/<a class="mat soon" href="\?section=3">([\s\S]*?)<i>скоро<\/i>/, '<a class="mat" href="ia.html">$1<i>готово</i>')
  .replace('</nav>', `</nav>

    <nav class="anchors" aria-label="На этой странице">
      <a href="#nav">Макеты</a>
      <a href="#view">Текущий макет</a>
      <a href="#rules">Правила</a>
    </nav>`);

const extraCss = `
/* ── Раздел 04: навигация по макетам и просмотр ────────────── */
.wf { list-style: none; padding: 0; display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); align-items: start; margin: 0 0 var(--s-6); }
.wf > li { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); padding: var(--s-3) var(--s-4); }
.wf .sh { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2) var(--s-3); margin-bottom: var(--s-2); }
.wf .sh .code { font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.06em; color: var(--ink-600); }
.wf .sh b { font-size: var(--t-body-sm); }
.wf .sh .n { margin-left: auto; font-size: var(--t-micro); color: var(--ink-600); }
.wf ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1px; max-width: none; }
.wf ul li { margin: 0; border-top: 1px solid var(--line); padding: 5px 0; font-size: var(--t-caption); display: flex; gap: var(--s-3); align-items: baseline; }
.wf ul li:first-child { border-top: 0; }
.wf ul li span { margin-left: auto; color: var(--ink-600); font-size: var(--t-micro); }
.wf a { text-decoration: none; }
.wf a:hover, .wf a:focus-visible { text-decoration: underline; }
.wf .todo { color: var(--ink-400); }
.wf .todo span { color: var(--ink-400); }

/* фрейм должен быть шире 760px: у самого макета там брейкпоинт, ниже которого
   служебные подписи возвращаются в поток и ломают колонку 390 */
.viewer { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface-2); padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-4); margin: 0 0 var(--s-5); }
.viewer iframe { width: 100%; height: 1320px; border: 0; background: var(--surface); border-radius: var(--r-md); }
.viewer .cap { font-size: var(--t-caption); color: var(--ink-600); max-width: 70ch; }
`;

const navHtml = list.map((s) => {
  const ready = s.pages.filter((p) => p.exists).length;
  return `      <li>
        <p class="sh"><span class="code">${esc(s.code)}</span><b>${esc(s.name)}</b><span class="n">${ready} из ${s.pages.length}</span></p>
        <ul>
${s.pages.map((p) => p.exists
    ? `          <li><a href="../wireframes/${p.file}">${p.file}</a><span>${esc(p.title)}</span></li>`
    : `          <li class="todo">${p.file}<span>${esc(p.title)} — не нарисован</span></li>`).join('\n')}
        </ul>
      </li>`;
}).join('\n');

const page = `${head}${extraCss}</style>
</head>
<body>

<a class="skip" href="#content">Перейти к материалу</a>

<div class="shell">

  ${aside}

  <main id="content">
    <div class="masthead">
      <h1>Прототипирование и вайрфрейминг</h1>
      <p class="lede">Низкодетализированные экраны в сером: структура, иерархия и зоны — до того как в них вложат визуал. Каждый макет стоит в мокапе телефона, потому что продукт владеет не всем экраном, и каждое состояние — отдельная страница. Правила — <a href="../wireframes/_conventions.md">_conventions.md</a>, что рисуем — <a href="../wireframes/_screens.md">_screens.md</a>.</p>
      <div class="chips">
        <span><b>${done.length}</b> из ${total} страниц</span>
        <span><b>${list.length}</b> экранов главного потока</span>
        <span><b>713</b> px продукту из 844</span>
      </div>
      <!--PUBLIC-NOTE-->
    </div>

    <section id="nav">
      <h2>Макеты</h2>
      <p class="intro">Восемь экранов главного потока и их состояния. Ссылка есть там, где страница нарисована; остальное — план, выведенный из таблицы состояний <a href="../wireframes/_screens.md">_screens.md</a>. Список собирается сборкой, отмечать готовность руками не нужно.</p>
      <ol class="wf">
${navHtml}
      </ol>
    </section>

    <section id="view">
      <h2>Текущий макет</h2>
      <p class="intro"><b>${esc(currentScreen.code)} ${esc(currentScreen.name)}</b> — ${esc(current.title)}. Экран, с которого Даша начинает главный job: колода после онбординга, первый шаг основного пути <code class="dcode">D-37</code>. Справа от мокапа — подписи зон и их главные действия; под ним — служебный блок со ссылкой на источник. Ни то, ни другое в прототип не едет.</p>
      <div class="viewer">
        <iframe src="../wireframes/${current.file}" title="Вайрфрейм: ${esc(currentScreen.name)}" loading="lazy"></iframe>
        <p class="cap">Мокап показывает, что из 844px экрана продукту принадлежит 713: остальное забирают системная строка, панель браузера Safari и индикатор жеста. <a href="../wireframes/${current.file}">Открыть страницу отдельно</a></p>
      </div>
    </section>

    <section id="rules">
      <h2>Правила, по которым это нарисовано</h2>
      <p class="intro">Полностью — <a href="../wireframes/_conventions.md">_conventions.md</a>. Здесь то, что видно на макете.</p>
      <div class="tw"><table>
        <thead><tr><th>Правило</th><th>Как это видно</th></tr></thead>
        <tbody>
          <tr><td><b>Мокап телефона обязателен</b></td><td>Продукту принадлежит 713px из 844; системные зоны нарисованы и подписаны. Не поместилось — находка, а не повод растянуть рамку</td></tr>
          <tr><td><b>Серый ничего не кодирует</b></td><td>Состояние объясняется текстом. Непонятно в сером — непонятно и в цвете, просто выяснится позже и дороже</td></tr>
          <tr><td><b>Одно состояние — одна страница</b></td><td>Структура одинаковая, содержимое разное: видно, что это тот же экран. Пятое состояние — ожидание чужого решения <code class="dcode">D-42</code></td></tr>
          <tr><td><b>Текст настоящий</b></td><td><code>3 common interests</code>, <code>6 meetups attended</code>, <code>~2 km away</code> — и те же запреты копирайта, что в продукте</td></tr>
          <tr><td><b>Семантическая разметка</b></td><td><code>header</code>, <code>main</code>, <code>nav</code>, <code>article</code>, <code>button</code>; <code>div</code> — только корпус и экран телефона</td></tr>
        </tbody>
      </table></div>
    </section>

    <footer>
      <p>Раздел 4 из 12 · Прототипирование и вайрфрейминг. Источники — <a href="../wireframes/_screens.md">_screens.md</a>, <a href="../wireframes/_conventions.md">_conventions.md</a>; экраны и состояния — <a href="../sitemap.md">sitemap.md</a>.</p>
      <nav class="section-nav"><a href="ia.html">← Раздел 3 · Информационная архитектура</a></nav>
    </footer>
  </main>
</div>

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/wireframes.html'), page, 'utf8');
console.log(`sections/wireframes.html: ${done.length} из ${total} страниц, ${list.length} экранов`);
