// Сборка раздела 03 «Информационная архитектура» — sections/ia.html.
//
// Источники: sitemap.md (сущности, дерево экранов, навигация, трассировка)
// и flows.md (потоки). Страница генерируется целиком: дерево экранов
// рисуется с подписью job у каждого экрана, потоки — как Mermaid-диаграммы
// (mermaid.js подключается с CDN), остальная проза — из markdown.
//
// Запуск: node scripts/build-ia.mjs — после любой правки sitemap.md или flows.md.
// Оболочка страницы (стили, боковая колонка) берётся из sections/index.html,
// чтобы у разделов был один источник правды по внешнему виду.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const sitemap = read('sitemap.md');
const flows = read('flows.md');
const jtbd = read('research/jtbd.md');
const shell = read('sections/index.html');

// ── job-коды → названия (из матрицы jtbd.md и заголовков гипотез) ──────
const JOBS = {};
for (const m of jtbd.matchAll(/^\| \*\*([A-Z]\d)\*\* ([^|]+?)\s*(?:⚠\s*)?(?:`D-\d+`\s*)?\|/gm)) JOBS[m[1]] = m[2].trim();
for (const m of jtbd.matchAll(/^### (G\d)\. (.+?)\s*$/gm)) JOBS[m[1]] = m[2].trim();
JOBS.M1 = JOBS.M1 || 'компания для планов и продолжение';

// ── утилиты ────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ссылки из markdown ведут от корня репозитория; страница лежит в sections/
function fixHref(url) {
  if (/^(https?:|mailto:|#)/.test(url)) return url;
  return '../' + url.replace(/^\.\//, '');
}

// строчная разметка: код, жирный, курсив, зачёркнутое, ссылки, D-коды
function inline(s) {
  let out = '';
  // сначала код — внутри него ничего не трогаем
  const parts = s.split(/(`[^`]*`)/);
  for (const p of parts) {
    if (p.startsWith('`') && p.endsWith('`') && p.length >= 2) {
      const code = p.slice(1, -1);
      out += /^D-\d+$/.test(code) ? `<code class="dcode">${esc(code)}</code>` : `<code>${esc(code)}</code>`;
      continue;
    }
    let t = esc(p);
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => `<a href="${fixHref(url)}">${txt}</a>`);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/~~(.+?)~~/g, '<s>$1</s>');
    t = t.replace(/(^|[\s(«])\*([^*\s][^*]*?)\*(?=[\s).,;:»!?]|$)/g, '$1<em>$2</em>');
    out += t;
  }
  return out;
}

// блочная разметка: заголовки, абзацы, списки, таблицы, цитаты, код
function md(text, { hShift = 0 } = {}) {
  const lines = text.replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  const para = [];
  const flush = () => {
    if (para.length) { html.push(`<p>${inline(para.join(' '))}</p>`); para.length = 0; }
  };
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { flush(); i++; continue; }
    if (/^---+\s*$/.test(l)) { flush(); i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,6}) (.+)$/))) {
      flush();
      const lvl = Math.min(6, m[1].length + hShift);
      const id = slug(m[2]);
      html.push(`<h${lvl} id="${id}">${inline(m[2])}</h${lvl}>`);
      i++; continue;
    }
    if (l.startsWith('```')) {
      flush();
      const lang = l.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      if (lang === 'mermaid') html.push(`<pre class="mermaid">${esc(buf.join('\n'))}</pre>`);
      else html.push(`<pre class="ascii">${esc(buf.join('\n'))}</pre>`);
      continue;
    }
    if (l.startsWith('> ') || l === '>') {
      flush();
      const buf = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) buf.push(lines[i++].replace(/^> ?/, ''));
      html.push(`<blockquote>${md(buf.join('\n'), { hShift })}</blockquote>`);
      continue;
    }
    if (l.startsWith('|')) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      html.push(table(rows));
      continue;
    }
    if (/^(\s*)([-*]|\d+\.) /.test(l)) {
      flush();
      html.push(list(lines, i, (n) => { i = n; }));
      continue;
    }
    para.push(l.trim());
    i++;
  }
  flush();
  return html.join('\n');
}

function slug(s) {
  return s.toLowerCase().replace(/[`*]/g, '').replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '');
}

function splitRow(row) {
  // ячейки таблицы; экранированный `\|` внутри ячейки не рвём
  const cells = [];
  let cur = '';
  for (let k = 1; k < row.length; k++) {
    const ch = row[k];
    if (ch === '\\' && row[k + 1] === '|') { cur += '|'; k++; continue; }
    if (ch === '|') { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim() !== '' || row.endsWith('|') === false) cells.push(cur.trim());
  return cells;
}

function table(rows) {
  const head = splitRow(rows[0]);
  const body = rows.slice(2).map(splitRow);
  const wide = head.length > 8;
  const th = head.map((c) => `<th>${inline(c)}</th>`).join('');
  const tr = body.map((r) => `<tr>${r.map((c, k) => `<td${wide && k > 0 ? ' class="c"' : ''}>${inline(c)}</td>`).join('')}</tr>`).join('\n');
  return `<div class="tw${wide ? ' matrix' : ''}"><table><thead><tr>${th}</tr></thead><tbody>\n${tr}\n</tbody></table></div>`;
}

function list(lines, start, setIndex) {
  // простой список с продолжением строк (отступ) и одним уровнем вложенности
  const ordered = /^\s*\d+\. /.test(lines[start]);
  const items = [];
  let i = start;
  while (i < lines.length) {
    const l = lines[i];
    const m = l.match(/^(\s*)([-*]|\d+\.) (.*)$/);
    if (m && m[1].length === 0) { items.push({ text: m[3], sub: [] }); i++; continue; }
    if (m && m[1].length > 0 && items.length) { items[items.length - 1].sub.push(m[3]); i++; continue; }
    if (/^\s+\S/.test(l) && items.length) {
      const last = items[items.length - 1];
      if (last.sub.length) last.sub[last.sub.length - 1] += ' ' + l.trim();
      else last.text += ' ' + l.trim();
      i++; continue;
    }
    break;
  }
  setIndex(i);
  const tag = ordered ? 'ol' : 'ul';
  const li = items.map((it) => {
    const sub = it.sub.length ? `<ul>${it.sub.map((s) => `<li>${inline(s)}</li>`).join('')}</ul>` : '';
    return `<li>${inline(it.text)}${sub}</li>`;
  }).join('\n');
  return `<${tag}>${li}</${tag}>`;
}

// вырезать раздел `## Заголовок` до следующего `## `
function section(text, title) {
  const re = new RegExp(`^## ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
  const m = text.match(re);
  if (!m) throw new Error(`нет раздела «${title}»`);
  const start = m.index + m[0].length;
  const next = text.slice(start).search(/^## /m);
  return text.slice(start, next === -1 ? undefined : start + next).trim();
}

// ── дерево экранов ─────────────────────────────────────────────────────
function tree() {
  const block = section(sitemap, 'Экраны');
  const t0 = block.indexOf('```\nMeetMates');
  const t1 = block.indexOf('```', t0 + 5);
  const lines = block.slice(t0 + 4, t1).split('\n');
  const branches = [];
  let branch = null;
  let screen = null;
  const screenRe = /^[│ ]   [├└]── (?:(= I\.5|[IVX]+\.\d+) )?(.+?)\s{2,}(\([A-Z0-9, ]+\)|\[СИРОТА\])\s*(.*)$/;
  for (const raw of lines) {
    let m;
    if ((m = raw.match(/^[├└]── (.+)$/))) { branch = { title: m[1].trim(), screens: [] }; branches.push(branch); screen = null; continue; }
    if ((m = raw.match(screenRe))) {
      screen = { code: m[1] || '', name: m[2].trim(), jobs: m[3].match(/[A-Z]\d/g) || [], who: m[4].trim(), notes: [], states: [] };
      branch.screens.push(screen); continue;
    }
    if (!screen) continue;
    const body = raw.replace(/^[│ ]+/, '').trim();
    if (!body) continue;
    if (body.startsWith('~')) screen.states.push(body.replace(/^~\s*/, ''));
    else screen.notes.push(body);
  }
  const pill = (j) => `<span class="jp${j === 'M1' ? ' main' : j.startsWith('G') ? ' hyp' : ''}" title="${esc(JOBS[j] || '')}">${j}</span>`;
  const who = (w) => {
    if (!w) return '';
    const cls = w.startsWith('S') ? 'sec' : 'pri';
    return `<span class="who ${cls}">${inline(w)}</span>`;
  };
  const html = branches.map((b) => `
<div class="branch">
  <h3>${inline(b.title)}</h3>
  <ol class="screens">
${b.screens.map((s) => `    <li class="screen${s.code.startsWith('=') ? ' same' : ''}">
      <div class="shead"><span class="code">${esc(s.code)}</span><span class="sname">${inline(s.name)}</span><span class="jobs">${s.jobs.map(pill).join('')}</span>${who(s.who)}</div>
      ${s.notes.length ? `<p class="snote">${s.notes.map(inline).join(' · ')}</p>` : ''}
      ${s.states.length ? `<ul class="states">${s.states.map((st) => `<li>${inline(st)}</li>`).join('')}</ul>` : ''}
    </li>`).join('\n')}
  </ol>
</div>`).join('\n');
  // правила и сводка раздела — текст до дерева и после него
  const before = md(block.slice(0, t0).trim(), { hShift: 1 });
  const after = md(block.slice(t1 + 3).trim(), { hShift: 1 });
  const count = branches.reduce((n, b) => n + b.screens.filter((s) => !s.code.startsWith('=')).length, 0);
  return { html, before, after, count };
}

// ── потоки ─────────────────────────────────────────────────────────────
function flowSections() {
  const parts = flows.split(/^## /m).slice(1);
  const out = [];
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const title = part.slice(0, nl).trim();
    let body = part.slice(nl + 1);
    if (title.startsWith('Что эти flows показали')) { out.push({ title, html: md(body, { hShift: 1 }), tail: true }); continue; }
    // текстовый блок разметки убираем — диаграмма рисуется один раз; исходник даём свёрнутым
    const src = body.match(/\*\*Разметка `flowchart TD`:\*\*\n\n```\n([\s\S]*?)```\n/);
    body = body.replace(/\*\*Разметка `flowchart TD`:\*\*\n\n```\n[\s\S]*?```\n/, '');
    body = body.replace(/\*\*Как это выглядит:\*\*\n\n/, '');
    let html = md(body, { hShift: 1 });
    if (src) {
      html = html.replace(/<pre class="mermaid">[\s\S]*?<\/pre>/, (pre) => `<div class="diagram">${pre}</div>\n<details class="src"><summary>Разметка <code>flowchart TD</code></summary><pre class="ascii">${esc(src[1])}</pre></details>`);
    }
    out.push({ title, html, id: 'flow-' + slug(title.split(' — ')[0]) });
  }
  return out;
}

// ── сборка страницы ────────────────────────────────────────────────────
const T = tree();
const F = flowSections();
const flowsIntro = flows.split(/^## /m)[0].replace(/^# .*\n/, '').trim();

const headEnd = shell.indexOf('</style>');
let head = shell.slice(0, headEnd);
head = head
  .replace(/<title>[^<]*<\/title>/, '<title>Информационная архитектура · MeetMates</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Дерево экранов с job у каждого экрана, навигация в три слоя, матрица покрытия jobs × экраны и потоки как Mermaid-диаграммы.">');

const extraCss = `
/* ── Раздел 03: дерево, job-подписи, диаграммы ─────────────── */
.branch { margin: 0 0 var(--s-5); }
.branch h3 { margin: var(--s-5) 0 var(--s-3); }
.screens { list-style: none; margin: 0; padding: 0; max-width: none; display: grid; gap: var(--s-2); }
.screen { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); padding: var(--s-3) var(--s-4); }
.screen.same { border-style: dashed; }
.shead { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2) var(--s-3); }
.code { font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.06em; color: var(--ink-400); font-variant-numeric: tabular-nums; min-width: 3.2em; }
.sname { font-weight: var(--fw-bold); }
.jobs { display: inline-flex; flex-wrap: wrap; gap: var(--s-1); }
.jp { font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.04em; padding: 1px 8px; border-radius: var(--r-pill); background: var(--surface-2); color: var(--ink-600); cursor: help; }
.jp.main { background: var(--brand-gradient); color: var(--ink-on-brand); }
.jp.hyp { background: var(--surface); border: 1px dashed var(--line); color: var(--ink-400); }
.who { margin-left: auto; font-size: var(--t-caption); color: var(--ink-400); }
.who.pri { color: var(--ink-600); }
.snote { margin: var(--s-2) 0 0; font-size: var(--t-caption); color: var(--ink-600); max-width: none; }
.states { margin: var(--s-2) 0 0; padding-left: 0; list-style: none; display: flex; flex-wrap: wrap; gap: var(--s-1) var(--s-2); max-width: none; }
.states li { margin: 0; font-size: var(--t-micro); color: var(--ink-600); padding: 2px 8px; border-radius: var(--r-sm); background: var(--surface-2); }
.joblegend { display: flex; flex-wrap: wrap; gap: var(--s-1) var(--s-3); margin: 0 0 var(--s-5); font-size: var(--t-caption); color: var(--ink-600); }
.joblegend span { white-space: nowrap; }
code.dcode { color: var(--brand-a); background: color-mix(in srgb, var(--brand-a) 8%, var(--surface)); }
pre.ascii { font-size: var(--t-caption); line-height: 1.45; overflow-x: auto; padding: var(--s-4); background: var(--surface-2); border-radius: var(--r-md); max-width: none; }
.diagram { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); padding: var(--s-4); margin: var(--s-4) 0; overflow-x: auto; }
.diagram pre.mermaid { margin: 0; font-size: var(--t-caption); color: var(--ink-400); }
.diagram svg { display: block; width: 100%; height: auto; max-width: none; }
.diagram.scroll svg { width: auto; }
.diagram.scroll { max-height: 80vh; overflow: auto; }
.dbar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2); margin: 0 0 var(--s-3); }
.dbar button { font: inherit; font-size: var(--t-caption); padding: 4px 12px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--surface); color: var(--ink-600); cursor: pointer; min-height: 32px; }
.dbar button.on { background: var(--surface-2); color: var(--ink-900); border-color: var(--ink-400); }
.dbar button:focus-visible { outline: 2px solid var(--brand-a); outline-offset: 2px; }
.dbar .dim { font-size: var(--t-micro); color: var(--ink-400); margin-left: auto; }
.diagram .term-dead > * > path, .diagram .term-dead rect { fill: color-mix(in srgb, var(--danger) 14%, var(--surface)) !important; stroke: var(--danger) !important; }
.diagram .term-win > * > path, .diagram .term-win rect { fill: color-mix(in srgb, var(--accent) 18%, var(--surface)) !important; stroke: var(--accent) !important; }
.diagram .term-open > * > path, .diagram .term-open rect { fill: color-mix(in srgb, var(--warn) 18%, var(--surface)) !important; stroke: var(--warn) !important; }
details.src { margin: 0 0 var(--s-5); }
details.src summary { cursor: pointer; font-size: var(--t-caption); color: var(--ink-600); }
details.src pre { margin-top: var(--s-3); }
.flow { padding-top: var(--s-6); border-top: 1px solid var(--line); }
.flow h3 { font-size: var(--t-h2); margin-top: 0; }
.flow blockquote { margin: 0 0 var(--s-4); padding: var(--s-3) var(--s-4); border-left: 3px solid var(--brand-a); background: var(--surface-2); border-radius: 0 var(--r-md) var(--r-md) 0; max-width: 72ch; }
.flow blockquote p:last-child { margin-bottom: 0; }
blockquote { margin: 0 0 var(--s-4); padding: var(--s-3) var(--s-4); border-left: 3px solid var(--line); color: var(--ink-600); max-width: 72ch; }
blockquote p:last-child { margin-bottom: 0; }
.tw.matrix table { font-size: var(--t-micro); }
.tw.matrix td.c { text-align: center; }
.tw.matrix th, .tw.matrix td { padding: 4px 6px; white-space: nowrap; }
h5, h6 { font-size: var(--t-body-sm); font-weight: var(--fw-bold); margin: var(--s-4) 0 var(--s-2); }
`;

const aside = shell.slice(shell.indexOf('<aside class="side">'), shell.indexOf('</aside>') + '</aside>'.length)
  .replace(/<a class="mat soon" href="\?section=3">([\s\S]*?)<i>скоро<\/i>/, '<a class="mat current" href="ia.html">$1<i>текущий раздел</i>')
  .replace('</nav>', `</nav>

    <nav class="anchors" aria-label="На этой странице">
      <a href="#tree">Дерево экранов</a>
      <a href="#nav">Навигация</a>
      <a href="#trace">Трассировка</a>
      <a href="#flows">Потоки</a>
      <a href="#entities">Сущности</a>
    </nav>`);

const order = (k) => (k === 'M1' ? '0' : k[0] === 'R' ? '1' : k[0] === 'E' ? '2' : k[0] === 'S' ? '3' : '4') + k;
const jobLegend = Object.entries(JOBS)
  .map(([k, v]) => [k, k[0] === 'G' ? v.charAt(0).toLowerCase() + v.slice(1) : v])
  .sort(([a], [b]) => order(a).localeCompare(order(b)))
  .map(([k, v]) => `<span><b>${k}</b> ${esc(v)}</span>`).join('');

const page = `${head}${extraCss}</style>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  // Цвета диаграмм — из токенов (§8): фон узлов surface-2, обводка brand-a, текст ink-900.
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis', padding: 8, nodeSpacing: 28, rankSpacing: 36 },
    themeVariables: {
      fontFamily: v('--font') || 'Inter, sans-serif',
      fontSize: '13px',
      primaryColor: v('--surface-2') || '#F4F1FB',
      primaryTextColor: v('--ink-900') || '#14121F',
      primaryBorderColor: v('--brand-a') || '#7B2FF7',
      lineColor: v('--ink-600') || '#55506B',
      secondaryColor: v('--surface') || '#FFFFFF',
      tertiaryColor: v('--surface') || '#FFFFFF',
      clusterBkg: v('--surface') || '#FFFFFF',
      edgeLabelBackground: v('--surface') || '#FFFFFF',
    },
  });
  // Крупные потоки не помещаются в колонку: по умолчанию — по ширине (обзор),
  // «100 %» — натуральный размер в прокручиваемом окне, «отдельно» — SVG во вкладке.
  await mermaid.run();
  for (const box of document.querySelectorAll('.diagram')) {
    const svg = box.querySelector('svg');
    if (!svg) continue;
    // терминалы: тупик — danger, job закрыт — accent, не закрыт / частично — warn
    for (const node of svg.querySelectorAll('g.node')) {
      const t = node.textContent.trim();
      const cls = t.startsWith('Тупик') ? 'term-dead' : t.startsWith('Job закрыт') ? 'term-win' : /^Job (не закрыт|частично)/.test(t) ? 'term-open' : '';
      if (cls) node.classList.add(cls);
    }
    const natural = svg.viewBox.baseVal.width;
    const bar = document.createElement('div');
    bar.className = 'dbar';
    bar.innerHTML = '<button type="button" data-mode="fit" class="on">По ширине</button><button type="button" data-mode="full">100 %</button><button type="button" data-mode="open">Открыть отдельно</button><span class="dim">' + Math.round(natural) + ' px</span>';
    box.prepend(bar);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.mode === 'open') {
        const clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.style.maxWidth = 'none'; clone.setAttribute('width', natural); clone.removeAttribute('height');
        const url = URL.createObjectURL(new Blob([clone.outerHTML], { type: 'image/svg+xml' }));
        window.open(url, '_blank');
        return;
      }
      bar.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      if (b.dataset.mode === 'full') { svg.style.width = natural + 'px'; box.classList.add('scroll'); }
      else { svg.style.width = ''; box.classList.remove('scroll'); }
    });
  }
</script>
</head>
<body>

<a class="skip" href="#content">Перейти к материалу</a>

<div class="shell">

  ${aside}

  <main id="content">
    <div class="masthead">
      <p class="eyebrow">Раздел 3 из 12</p>
      <h1><span class="grad">Информационная архитектура</span></h1>
      <p class="lede">Из чего собирается интерфейс: сущности → экраны с job у каждого → навигация в три слоя → матрица покрытия jobs × экраны → потоки с тупиками и состояниями. Собрано из <a href="../sitemap.md">sitemap.md</a> и <a href="../flows.md">flows.md</a>; страница пересобирается скриптом, руками не правится.</p>
      <div class="chips">
        <span><b>${T.count}</b> экранов</span>
        <span><b>3</b> вкладки</span>
        <span><b>${F.filter((f) => !f.tail).length}</b> потоков</span>
        <span><b>0</b> сирот</span>
      </div>
      <!--PUBLIC-NOTE-->
    </div>

    <section id="tree">
      <h2>Дерево экранов</h2>
      <p class="intro">Экран определяется объектом, который показывает; смена статуса — состояние, не экран. У каждого экрана — job, ради которых он существует, и кому он нужен: <b>P</b> — primary-персоне (Даша), <b>S</b> — только secondary, <b>А</b> — Артёму как автору <code>+N</code>.</p>
      <div class="joblegend">${jobLegend}</div>
      ${T.html}
      <details class="src"><summary>Правила раздела и сводка</summary>${T.before}${T.after}</details>
    </section>

    <section id="nav">
      <h2>Навигация</h2>
      ${md(section(sitemap, 'Навигация'), { hShift: 1 })}
    </section>

    <section id="trace">
      <h2>Трассировка</h2>
      ${md(section(sitemap, 'Трассировка'), { hShift: 1 })}
    </section>

    <section id="flows">
      <h2>Потоки</h2>
      ${md(flowsIntro, { hShift: 1 })}
${F.filter((f) => !f.tail).map((f) => `      <article class="flow" id="${f.id}">
        <h3>${inline(f.title)}</h3>
        ${f.html}
      </article>`).join('\n')}
      <article class="flow">
        <h3>Что эти flows показали</h3>
        ${F.find((f) => f.tail).html}
      </article>
    </section>

    <section id="entities">
      <h2>Сущности</h2>
      ${md(section(sitemap, 'Сущности'), { hShift: 1 })}
      <h3>Под вопросом</h3>
      ${md(section(sitemap, 'Под вопросом'), { hShift: 1 })}
      <h3>Гигиена безопасности</h3>
      ${md(section(sitemap, 'Гигиена безопасности'), { hShift: 1 })}
    </section>

    <footer>
      <p>Раздел 3 из 12 · Информационная архитектура. Источники — <a href="../sitemap.md">sitemap.md</a>, <a href="../flows.md">flows.md</a>; решения — <a href="../DECISIONS.md">DECISIONS.md</a>.</p>
      <nav class="section-nav"><a href="../research/persones.html">← Раздел 2 · Персоны и JTBD</a></nav>
    </footer>
  </main>
</div>

</body>
</html>
`;

writeFileSync(join(ROOT, 'sections/ia.html'), page, 'utf8');
console.log(`sections/ia.html: ${T.count} экранов, ${F.length - 1} потоков, ${Object.keys(JOBS).length} job-кодов`);
