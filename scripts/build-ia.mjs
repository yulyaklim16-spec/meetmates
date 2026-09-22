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
  const before = md(block.slice(0, t0).trim(), { hShift: 0 });
  const after = md(block.slice(t1 + 3).trim(), { hShift: 0 });
  const count = branches.reduce((n, b) => n + b.screens.filter((s) => !s.code.startsWith('=')).length, 0);
  return { html, before, after, count };
}

// ── сущности ───────────────────────────────────────────────────────────
// Разбор раздела «Сущности» на объекты: номер, имя, job, поля, связи, оговорки.
function entities() {
  const block = section(sitemap, 'Сущности');
  const out = [];
  for (const part of block.split(/\n### /).slice(1)) {
    const nl = part.indexOf('\n');
    const head = part.slice(0, nl).trim();
    const body = part.slice(nl + 1).replace(/\n---\s*$/, '').trim();
    const m = head.match(/^(\d+[a-zа-я]?)\.\s*(.+)$/);
    if (!m) continue;                                   // «Карта связей» — не сущность
    const num = m[1];
    const dcode = (m[2].match(/`(D-\d+)`/) || [])[1] || '';
    const title = m[2].replace(/\s*`D-\d+`\s*/g, '').trim();
    const paren = (title.match(/\(([^)]+)\)$/) || [])[1] || '';
    const name = title.replace(/\s*\([^)]+\)$/, '').trim();

    const rows = [];
    let cols = [];
    const lead = [];       // «Порождает» и прочие абзацы с жирным зачином
    const prose = [];      // обычные абзацы
    let links = '';
    const notes = [];
    const lines = body.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith('|')) {
        const tbl = [];
        while (i < lines.length && lines[i].startsWith('|')) tbl.push(lines[i++]);
        i--;
        cols = splitRow(tbl[0]);
        for (const r of tbl.slice(2)) rows.push(splitRow(r));
        continue;
      }
      if (/^\s*$/.test(l)) continue;
      const buf = [l];
      while (i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].startsWith('|')) buf.push(lines[++i]);
      const para = buf.join(' ').trim();
      const label = para.match(/^`?\[\?\]`?\s*\*\*(.+?)[:.]?\*\*|^\*\*(.+?):\*\*/);
      const key = label ? (label[1] || label[2]) : '';
      if (/^Порождает/.test(key)) lead.push(para.replace(/^\*\*Порождает:\*\*\s*/, ''));
      else if (/^Связи/.test(key)) links = para.replace(/^\*\*Связи:\*\*\s*/, '').replace(/\.$/, '');
      else if (key) notes.push({ key: key.replace(/\s*—.*$/, ''), text: para });
      else prose.push(para);
    }
    const jobs = [...new Set((lead.join(' ').match(/\b[MRESG]\d\b/g) || []))];
    out.push({ num, name, paren, dcode, jobs, born: lead.join(' '), cols, rows, links, notes, prose, open: /\[\?\]/.test(body) });
  }
  return out;
}

// Карта связей: узлы расставлены руками, рёбра объявлены явно. Сборка падает,
// если в sitemap.md появилась или исчезла сущность, — карта не может отстать молча.
const NW = 146, NH = 46, COLGAP = 62, ROWH = 72, PAD = 22, RETURN = 46;
const cx = (c) => PAD + c * (NW + COLGAP);
const cy = (r) => PAD + r * ROWH;

const SPINE = [
  { num: '1',  col: 0, row: 2, label: 'Человек' },
  { num: '4',  col: 1, row: 0, label: 'Совпадение' },
  { num: '2',  col: 1, row: 2, label: 'Запрос' },
  { num: '9',  col: 1, row: 4, label: 'Серия' },
  { num: '5',  col: 2, row: 0, label: 'Чат' },
  { num: '3',  col: 2, row: 2, label: 'Отклик' },
  { num: '3a', col: 2, row: 3.2, label: 'Совместный отклик' },
  { num: '6',  col: 3, row: 1, label: 'Встреча' },
  { num: '7',  col: 4, row: 0, label: 'Явка' },
  { num: '8',  col: 4, row: 1, label: 'Присутствие' },
  { num: '12', col: 4, row: 2, label: 'Ссылка близкому' },
];
const BAND = [
  { num: '10', label: 'Верификация', to: 'гейт перед откликом и первым сообщением' },
  { num: '11', label: 'Жалоба и блокировка', to: 'выход из контакта, с любого экрана' },
  { num: '14', label: 'Интерес', to: 'связывает человека, запрос и фильтр' },
  { num: '13', label: 'Шаблон', to: 'предзаполняет запрос при создании' },
  { num: '15', label: 'Фильтр', to: 'параметры колоды и ленты, не хранится' },
];

// перенос подписи по словам — в SVG нет переноса строк
function wrap(text, max) {
  const out = [];
  for (const w of text.split(' ')) {
    if (out.length && (out[out.length - 1] + ' ' + w).length <= max) out[out.length - 1] += ' ' + w;
    else out.push(w);
  }
  return out;
}

function entityMap(list) {
  const byNum = new Map(list.map((e) => [e.num, e]));
  for (const n of [...SPINE, ...BAND]) {
    if (!byNum.has(n.num)) throw new Error(`карта связей: сущности ${n.num} нет в sitemap.md`);
  }
  const drawn = new Set([...SPINE, ...BAND].map((n) => n.num));
  const missed = list.filter((e) => !drawn.has(e.num));
  if (missed.length) throw new Error(`карта связей: сущности вне карты — ${missed.map((e) => e.num + ' ' + e.name).join(', ')}`);

  const pos = {};
  for (const n of SPINE) pos[n.num] = { x: cx(n.col), y: cy(n.row), ...n };
  const P = (num, side, off = 0) => {
    const p = pos[num];
    if (side === 'r') return [p.x + NW, p.y + NH / 2 + off];
    if (side === 'l') return [p.x, p.y + NH / 2 + off];
    if (side === 't') return [p.x + NW / 2 + off, p.y];
    return [p.x + NW / 2 + off, p.y + NH];
  };
  const mid = (a, b) => (a + b) / 2;
  const laneY = cy(4) + NH + 34;                        // обратная петля под цепочкой

  const edges = [
    { from: '1', to: '4', label: 'лайк', pts: () => [P('1', 'r', -8), [mid(P('1','r')[0], P('4','l')[0]), P('1','r',-8)[1]], [mid(P('1','r')[0], P('4','l')[0]), P('4','l')[1]], P('4', 'l')] },
    { from: '1', to: '2', label: 'автор', pts: () => [P('1', 'r', 8), P('2', 'l')] },
    { from: '4', to: '5', pts: () => [P('4', 'r'), P('5', 'l')] },
    { from: '5', to: '2', label: 'день назначен · D-39', pts: () => {
        const a = P('5', 'b', -30), b = P('2', 't', 34);
        const ly = a[1] + 26;
        return [a, [a[0], ly], [b[0], ly], b];
      } },
    { from: '2', to: '3', pts: () => [P('2', 'r'), P('3', 'l')] },
    { from: '3', to: '5', label: 'подтверждён', pts: () => {
        const a = P('3', 't', 40), b = P('5', 'b', 40);
        return [a, b];
      } },
    { from: '4', to: '3a', label: 'пара · D-36', pts: () => {
        const a = P('4', 'b', -46), b = P('3a', 'l');
        return [a, [a[0], b[1]], b];
      } },
    { from: '3a', to: '2', pts: () => {
        const a = P('3a', 'l', 0), b = P('2', 'b', 30);
        const lx = a[0] - COLGAP / 2 + 16;
        return [[a[0], a[1]], [lx, a[1]], [lx, b[1] + 18], [b[0], b[1] + 18], b];
      } },
    { from: '2', to: '9', label: 'повтор', pts: () => [P('2', 'b', -34), P('9', 't', -34)] },
    { from: '9', to: '6', pts: () => {
        const a = P('9', 'r'), b = P('6', 'b', 30);
        return [a, [b[0], a[1]], b];
      } },
    { from: '2', to: '6', label: 'дата назначена', pts: () => {
        const a = P('2', 'r', -12), b = P('6', 'l');
        const mx = a[0] + COLGAP / 2 - 6;
        return [a, [mx, a[1]], [mx, b[1]], b];
      } },
    { from: '6', to: '7', pts: () => [P('6', 'r'), P('7', 'l')] },
    { from: '6', to: '8', pts: () => [P('6', 'r'), P('8', 'l')] },
    { from: '6', to: '12', pts: () => [P('6', 'r'), P('12', 'l')] },
    { from: '8', to: '1', label: 'счётчик встреч', loop: true, pts: () => {
        const a = P('8', 'r'), b = P('1', 'b');
        const rx = PAD + NW * 5 + COLGAP * 4 + RETURN - 14;
        return [a, [rx, a[1]], [rx, laneY], [b[0], laneY], b];
      } },
  ];

  const R = 11;
  const path = (pts) => {
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1], [qx, qy] = pts[i], [nx, ny] = pts[i + 1];
      const l1 = Math.hypot(qx - px, qy - py), l2 = Math.hypot(nx - qx, ny - qy);
      const r = Math.min(R, l1 / 2, l2 / 2);
      const u1 = [(qx - px) / (l1 || 1), (qy - py) / (l1 || 1)];
      const u2 = [(nx - qx) / (l2 || 1), (ny - qy) / (l2 || 1)];
      d += ` L${(qx - u1[0] * r).toFixed(1)} ${(qy - u1[1] * r).toFixed(1)} Q${qx} ${qy} ${(qx + u2[0] * r).toFixed(1)} ${(qy + u2[1] * r).toFixed(1)}`;
    }
    const e = pts[pts.length - 1];
    return d + ` L${e[0]} ${e[1]}`;
  };

  const bandTop = laneY + 52;
  const bandW = (NW * 5 + COLGAP * 4 - 4 * 20) / 5;
  const W = PAD * 2 + NW * 5 + COLGAP * 4 + RETURN;
  const H = bandTop + 74 + PAD;

  const edgeSvg = edges.map((e) => {
    const pts = e.pts();
    const lbl = e.label ? (() => {
      // подпись — у последнего горизонтального колена: там, где ребро входит
      // в узел, а не там, где выходит: у выхода подписи соседних рёбер сходятся
      let best = null;
      for (let i = pts.length - 1; i >= 1; i--) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
        if (Math.abs(ay - by) > 1) continue;
        if (Math.abs(bx - ax) >= 24) { best = [ax, ay, bx, by]; break; }
        if (!best || Math.abs(bx - ax) > Math.abs(best[2] - best[0])) best = [ax, ay, bx, by];
      }
      const [ax, ay, bx] = best || [pts[0][0], pts[0][1], pts[1] ? pts[1][0] : pts[0][0]];
      return `<text class="el" x="${((ax + bx) / 2).toFixed(1)}" y="${(ay - 7).toFixed(1)}">${esc(e.label)}</text>`;
    })() : '';
    return `<g class="ed${e.loop ? ' loop' : ''}" data-from="${e.from}" data-to="${e.to}"><path d="${path(pts)}" marker-end="url(#ia-arrow)"/>${lbl}</g>`;
  }).join('\n');

  const nodeSvg = SPINE.map((n) => {
    const e = byNum.get(n.num);
    const p = pos[n.num];
    return `<a href="#e-${n.num}" class="nd" data-e="${n.num}" aria-label="${esc(e.name)} — сущность ${n.num}">
      <rect x="${p.x}" y="${p.y}" width="${NW}" height="${NH}" rx="12"/>
      <text class="nn" x="${p.x + 14}" y="${p.y + 19}">${esc(n.num)}</text>
      <text class="nl" x="${p.x + 14}" y="${p.y + 33}">${esc(n.label)}</text>
    </a>`;
  }).join('\n');

  const bandSvg = BAND.map((n, i) => {
    const x = PAD + i * (bandW + 20);
    const e = byNum.get(n.num);
    return `<a href="#e-${n.num}" class="nd band" data-e="${n.num}" aria-label="${esc(e.name)} — сущность ${n.num}">
      <rect x="${x}" y="${bandTop}" width="${bandW}" height="38" rx="10"/>
      <text class="nn" x="${x + 12}" y="${bandTop + 16}">${esc(n.num)}</text>
      <text class="nl" x="${x + 12}" y="${bandTop + 29}">${esc(n.label)}</text>
      ${wrap(n.to, 27).map((ln, k) => `<text class="nc" x="${x + 12}" y="${bandTop + 52 + k * 13}">${esc(ln)}</text>`).join('')}
    </a>`;
  }).join('\n');

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="ia-map-title">
  <title id="ia-map-title">Карта связей: ${SPINE.length} сущностей в цепочке и ${BAND.length} поперёк неё</title>
  <defs><marker id="ia-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0.8 L7 4 L0 7.2 z"/></marker></defs>
  <g class="edges">${edgeSvg}</g>
  <g class="nodes">${nodeSvg}</g>
  <line class="bandline" x1="${PAD}" y1="${bandTop - 26}" x2="${W - PAD}" y2="${bandTop - 26}"/>
  <text class="bandlbl" x="${PAD}" y="${bandTop - 12}">Действуют поперёк цепочки</text>
  <g class="nodes">${bandSvg}</g>
</svg>`;
}

function entityCards(list) {
  const pill = (j) => `<span class="jp${j === 'M1' ? ' main' : j.startsWith('G') ? ' hyp' : ''}" title="${esc(JOBS[j] || '')}">${j}</span>`;
  // связи: «→ отклики · ← автор (человек)» → чипы со ссылкой на карточку, если узнаём объект
  const target = (txt) => {
    const t = txt.toLowerCase();
    const hit = list.find((e) => {
      const base = e.name.toLowerCase().split(' ')[0].replace(/[«»(]/g, '');
      return base.length > 3 && t.includes(base.slice(0, base.length - 2));
    });
    return hit ? hit.num : '';
  };
  return list.map((e) => {
    const chips = e.links ? e.links.split('·').map((raw) => {
      const s = raw.trim();
      if (!s) return '';
      const dir = s.startsWith('→') ? 'out' : s.startsWith('←') ? 'in' : 'flat';
      const body = s.replace(/^[→←]\s*/, '');
      const num = target(body);
      const inner = `<span class="ar" aria-hidden="true">${dir === 'out' ? '→' : dir === 'in' ? '←' : '·'}</span>${inline(body)}`;
      return num && num !== e.num ? `<a class="lk ${dir}" href="#e-${num}">${inner}</a>` : `<span class="lk ${dir}">${inner}</span>`;
    }).join('') : '';
    // Набор колонок у сущностей разный: «Поле | Значения», «Поле | Обязательность |
    // Из какого job», «Поле | Из какого job». Колонку с job узнаём по заголовку,
    // остальные складываем в значение — иначе у «Встречи» job уезжает в текст.
    const jc = e.cols.length && /job/i.test(e.cols[e.cols.length - 1]) ? e.cols.length - 1 : -1;
    const fields = e.rows.length ? `<dl class="fields">${e.rows.map((r) => {
      const cell = jc >= 0 ? (r[jc] || '') : '';
      const codes = cell.match(/\b[MRESG]\d\b/g) || [];
      const trimmed = cell.replace(/\b[MRESG]\d\b/g, '').replace(/^[\s,;·—-]+|[\s,;·]+$/g, '').replace(/\s+/g, ' ').replace(/^\((.*)\)$/, '$1').trim();
      // «—» в колонке job значит «ни одного»: не срезаем его вместе с разделителями
      const rest = trimmed || (codes.length ? '' : cell.trim());
      const vals = r.slice(1).filter((_, i) => i + 1 !== jc).filter(Boolean);
      if (rest) vals.push(rest);
      const jobs = codes.length ? `<span class="fj">${codes.map(pill).join('')}</span>` : '';
      // строка, где в источнике стоят только job: пилюли идут по левому краю, а не в пустоту справа
      return `<dt>${inline(r[0])}</dt><dd${vals.length ? '' : ' class="only-jobs"'}>${vals.length ? `<span class="fv">${inline(vals.join(' · '))}</span>` : ''}${jobs}</dd>`;
    }).join('')}</dl>` : '';
    const notes = e.notes.map((n) => `<p class="nt">${inline(n.text)}</p>`).join('');
    const prose = e.prose.map((p) => `<p class="pr">${inline(p)}</p>`).join('');
    return `<article class="ent${e.jobs.length ? '' : ' nojob'}" id="e-${e.num}" data-e="${e.num}">
      <header><span class="enum">${esc(e.num)}</span><h3>${inline(e.name)}${e.paren ? `<span class="alt">${inline(e.paren)}</span>` : ''}</h3>${e.dcode ? `<code class="dcode">${e.dcode}</code>` : ''}<span class="jobs">${e.jobs.map(pill).join('')}</span></header>
      <p class="born"><span class="lbl">Порождает</span>${inline(e.born)}</p>
      ${fields}${prose}
      ${chips ? `<div class="links"><span class="lbl">Связи</span>${chips}</div>` : ''}
      ${notes}
    </article>`;
  }).join('\n');
}

// ── потоки ─────────────────────────────────────────────────────────────
function flowSections() {
  const parts = flows.split(/^## /m).slice(1);
  const out = [];
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const title = part.slice(0, nl).trim();
    let body = part.slice(nl + 1);
    if (title.startsWith('Что эти flows показали')) { out.push({ title, html: md(body, { hShift: 0 }), tail: true }); continue; }
    // текстовый блок разметки убираем — диаграмма рисуется один раз; исходник даём свёрнутым
    const src = body.match(/\*\*Разметка `flowchart TD`:\*\*\n\n```\n([\s\S]*?)```\n/);
    body = body.replace(/\*\*Разметка `flowchart TD`:\*\*\n\n```\n[\s\S]*?```\n/, '');
    body = body.replace(/\*\*Как это выглядит:\*\*\n\n/, '');
    let html = md(body, { hShift: 0 });
    if (src) {
      html = html.replace(/<pre class="mermaid">[\s\S]*?<\/pre>/, (pre) => `<div class="diagram">${pre}</div>\n<details class="src"><summary>Разметка <code>flowchart TD</code></summary><pre class="ascii">${esc(src[1])}</pre></details>`);
    }
    out.push({ title, html, id: 'flow-' + slug(title.split(' — ')[0]) });
  }
  return out;
}

// ── сборка страницы ────────────────────────────────────────────────────
const T = tree();
const E = entities();
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
.code { font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.06em; color: var(--ink-600); font-variant-numeric: tabular-nums; min-width: 3.2em; }
.sname { font-weight: var(--fw-bold); }
.jobs { display: inline-flex; flex-wrap: wrap; gap: var(--s-1); }
.jp { font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.04em; padding: 1px 8px; border-radius: var(--r-pill); background: var(--surface-2); color: var(--ink-600); cursor: help; }
.jp.main { background: var(--brand-gradient); color: var(--ink-on-brand); }
.jp.hyp { background: var(--surface); border: 1px dashed var(--ink-400); color: var(--ink-600); }
.who { margin-left: auto; font-size: var(--t-caption); color: var(--ink-600); }
.who.pri { color: var(--ink-600); }
.snote { margin: var(--s-2) 0 0; font-size: var(--t-caption); color: var(--ink-600); max-width: none; }
.states { margin: var(--s-2) 0 0; padding-left: 0; list-style: none; display: flex; flex-wrap: wrap; gap: var(--s-1) var(--s-2); max-width: none; }
.states li { margin: 0; font-size: var(--t-micro); color: var(--ink-600); padding: 2px 8px; border-radius: var(--r-sm); background: var(--surface-2); }
.joblegend { display: flex; flex-wrap: wrap; gap: var(--s-1) var(--s-3); margin: 0 0 var(--s-5); font-size: var(--t-caption); color: var(--ink-600); }
.joblegend span { white-space: nowrap; }
code.dcode { color: var(--brand-a); background: color-mix(in srgb, var(--brand-a) 8%, var(--surface)); }
pre.ascii { font-size: var(--t-caption); line-height: 1.45; overflow-x: auto; padding: var(--s-4); background: var(--surface-2); border-radius: var(--r-md); max-width: none; }
.diagram { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); padding: var(--s-4); margin: var(--s-4) 0; overflow-x: auto; }
.diagram pre.mermaid { margin: 0; font-size: var(--t-caption); color: var(--ink-600); }
.diagram svg { display: block; width: 100%; height: auto; max-width: none; }
.diagram.scroll svg { width: auto; }
.diagram.scroll { max-height: 80vh; overflow: auto; }
.dbar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2); margin: 0 0 var(--s-3); }
.dbar button { font: inherit; font-size: var(--t-caption); padding: 4px 12px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--surface); color: var(--ink-600); cursor: pointer; min-height: 32px; }
.dbar button.on { background: var(--surface-2); color: var(--ink-900); border-color: var(--ink-400); }
.dbar button:focus-visible { outline: 2px solid var(--brand-a); outline-offset: 2px; }
.dbar .dim { font-size: var(--t-micro); color: var(--ink-600); margin-left: auto; }
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

/* ── Поверхности браузера: выделение, каретка, фокус, цифры ── */
::selection { background: color-mix(in srgb, var(--brand-a) 22%, var(--surface)); color: var(--ink-900); }
:root { accent-color: var(--brand-a); caret-color: var(--brand-a); scrollbar-color: var(--line) transparent; scrollbar-width: thin; }
:where(a, button, summary, [tabindex]):focus-visible { outline: 2px solid var(--brand-a); outline-offset: 2px; border-radius: var(--r-sm); }
table, .num, .enum, .code { font-variant-numeric: tabular-nums; }

/* ── Карта связей ───────────────────────────────────────────── */
.diagram.map { padding: var(--s-5) var(--s-4) var(--s-4); }
.map svg { display: block; width: 100%; height: auto; }
.map .nd rect { fill: var(--surface); stroke: var(--line); stroke-width: 1.5; transition: fill var(--dur-fast) var(--ease-out), stroke var(--dur-fast) var(--ease-out); }
.map .nd .nn { font-size: 10px; font-weight: var(--fw-medium); letter-spacing: 0.08em; fill: var(--ink-600); font-variant-numeric: tabular-nums; }
.map .nd .nl { font-size: 13px; font-weight: var(--fw-bold); fill: var(--ink-900); }
.map .nd .nc { font-size: 10.5px; fill: var(--ink-600); }
.map .nd { cursor: pointer; }
.map .nd:hover rect, .map .nd:focus-visible rect, .map .nd.on rect { fill: var(--surface-2); stroke: var(--brand-a); }
.map .nd:focus-visible { outline: none; }
.map .nd:focus-visible rect { stroke-width: 2.5; }
.map .nd.band rect { fill: transparent; stroke-dasharray: 3 4; }
.map .ed path { fill: none; stroke: var(--ink-600); stroke-width: 1.5; transition: stroke var(--dur-fast) var(--ease-out), stroke-width var(--dur-fast) var(--ease-out); }
.map .ed .el { font-size: 10.5px; fill: var(--ink-600); text-anchor: middle; paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
.map .ed.loop path { stroke: var(--accent); stroke-dasharray: 5 5; }
.map .ed.loop .el { fill: color-mix(in srgb, var(--accent) 65%, var(--ink-900)); }
.map .ed.on path { stroke: var(--brand-a); stroke-width: 2.5; }
.map .ed.on .el { fill: var(--brand-a); }
.map marker path { fill: var(--ink-600); }
.map .ed.on marker path { fill: var(--brand-a); }
.map .bandline { stroke: var(--line); stroke-width: 1; }
.map .bandlbl { font-size: 10px; font-weight: var(--fw-medium); letter-spacing: 0.1em; text-transform: uppercase; fill: var(--ink-600); }
.map.dim .nd:not(.on) rect { stroke: color-mix(in srgb, var(--line) 60%, transparent); }
.map.dim .nd:not(.on) .nl { fill: var(--ink-400); }
.map.dim .ed:not(.on) path { stroke: color-mix(in srgb, var(--ink-400) 35%, transparent); }
.map.dim .ed:not(.on) .el { opacity: 0.35; }
.mapnote { font-size: var(--t-caption); color: var(--ink-600); margin: 0 0 var(--s-6); max-width: 72ch; }

/* ── Карточки сущностей ─────────────────────────────────────── */
.ents { display: grid; gap: var(--s-3); grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr)); align-items: start; margin: 0 0 var(--s-6); }
.ent { border: 1px solid var(--line); border-radius: var(--r-lg); background: var(--surface); padding: var(--s-4) var(--s-5) var(--s-5); scroll-margin-top: var(--s-5); transition: border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out); }
.ent:target, .ent.on { border-color: var(--brand-a); box-shadow: var(--shadow-md); }
.ent > header { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2) var(--s-3); margin-bottom: var(--s-3); }
.ent .enum { font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.08em; color: var(--ink-600); }
.ent h3 { margin: 0; font-size: var(--t-body); letter-spacing: -0.01em; }
.ent h3 .alt { font-weight: var(--fw-regular); color: var(--ink-600); margin-left: var(--s-2); }
.ent .jobs { margin-left: auto; }
.ent .lbl { display: block; font-size: var(--t-micro); font-weight: var(--fw-medium); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-600); margin-bottom: var(--s-1); }
.ent .born { font-size: var(--t-caption); color: var(--ink-600); margin: 0 0 var(--s-4); max-width: none; }
.ent.nojob { border-style: dashed; }
.fields { display: grid; grid-template-columns: minmax(6.5em, 12em) minmax(0, 1fr); gap: 1px var(--s-3); margin: 0 0 var(--s-4); font-size: var(--t-caption); }
.fields dt { font-weight: var(--fw-medium); color: var(--ink-900); padding: 8px 0 7px; border-top: 1px solid var(--line); }
.fields dd { margin: 0; color: var(--ink-600); padding: 8px 0 7px; border-top: 1px solid var(--line); display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: var(--s-1) var(--s-2); }
.fields dt:first-of-type, .fields dd:first-of-type { border-top: 0; }
.fields .fv { min-width: 0; }
.fields dd.only-jobs { grid-template-columns: auto; justify-items: start; }
.fields dd.only-jobs .fj { justify-self: start; }
.fields .fj { display: inline-flex; gap: 2px; justify-self: end; }
.ent .pr { font-size: var(--t-caption); color: var(--ink-600); margin: 0 0 var(--s-3); max-width: none; }
.links { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-1); margin: 0 0 var(--s-3); }
.links .lbl { width: 100%; }
.lk { font-size: var(--t-micro); color: var(--ink-600); background: var(--surface-2); border-radius: var(--r-pill); padding: 3px 10px; text-decoration: none; display: inline-flex; align-items: baseline; gap: 5px; }
a.lk:hover, a.lk:focus-visible { background: color-mix(in srgb, var(--brand-a) 12%, var(--surface)); color: var(--ink-900); }
.lk .ar { color: var(--ink-600); font-size: 11px; }
a.lk.out .ar { color: var(--brand-a); }
a.lk.in .ar { color: var(--accent); }
.ent .nt { font-size: var(--t-caption); color: var(--ink-600); margin: var(--s-3) 0 0; padding-top: var(--s-3); border-top: 1px solid var(--line); max-width: none; }
.ent .nt + .nt { border-top: 0; padding-top: 0; margin-top: var(--s-2); }
/* В узкой колонке две колонки полей не помещаются: подпись встаёт над значением */
@media (max-width: 560px) {
  .ent { padding: var(--s-4); }
  .fields { grid-template-columns: 1fr; }
  .fields dt { border-top: 1px solid var(--line); padding: var(--s-2) 0 0; }
  .fields dt:first-of-type { border-top: 0; padding-top: 0; }
  .fields dd { border-top: 0; padding: var(--s-1) 0 var(--s-2); }
  .ent > header .jobs { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) { .ent, .map .nd rect, .map .ed path { transition: none; } }
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
    // Карта связей в узкой колонке ужимается до нечитаемого — открываем её в натуральную величину.
    if (box.classList.contains('map') && box.clientWidth < natural * 0.72) {
      bar.querySelector('[data-mode="full"]').click();
    }
  }

  // Карта и карточки — один объект в двух видах: узел подсвечивает свою карточку,
  // карточка — свой узел и рёбра, которыми он связан.
  const map = document.querySelector('.diagram.map svg');
  if (map) {
    const nodes = [...map.querySelectorAll('.nd')];
    const edges = [...map.querySelectorAll('.ed')];
    const cards = new Map([...document.querySelectorAll('.ent')].map((c) => [c.dataset.e, c]));
    const clear = () => {
      map.closest('.map').classList.remove('dim');
      nodes.forEach((n) => n.classList.remove('on'));
      edges.forEach((e) => e.classList.remove('on'));
      cards.forEach((c) => c.classList.remove('on'));
    };
    const show = (num) => {
      clear();
      const linked = edges.filter((e) => e.dataset.from === num || e.dataset.to === num);
      if (!nodes.some((n) => n.dataset.e === num) && !linked.length) return;
      map.closest('.map').classList.add('dim');
      const near = new Set([num]);
      linked.forEach((e) => { e.classList.add('on'); near.add(e.dataset.from); near.add(e.dataset.to); });
      nodes.forEach((n) => n.classList.toggle('on', near.has(n.dataset.e)));
      cards.get(num)?.classList.add('on');
    };
    for (const n of nodes) {
      n.addEventListener('mouseenter', () => show(n.dataset.e));
      n.addEventListener('focus', () => show(n.dataset.e));
      n.addEventListener('mouseleave', clear);
      n.addEventListener('blur', clear);
    }
    for (const [num, card] of cards) {
      card.addEventListener('mouseenter', () => show(num));
      card.addEventListener('mouseleave', clear);
    }
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
      ${md(section(sitemap, 'Навигация'), { hShift: 0 })}
    </section>

    <section id="trace">
      <h2>Трассировка</h2>
      ${md(section(sitemap, 'Трассировка'), { hShift: 0 })}
    </section>

    <section id="flows">
      <h2>Потоки</h2>
      ${md(flowsIntro, { hShift: 0 })}
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
      <p class="intro">Объекты, с которыми человек имеет дело, чтобы закрыть свой job. В основной перечень сущность попадает, только если её требует хотя бы один job из <a href="../research/jtbd.md">jtbd.md</a>; всё остальное — в «Под вопросом» ниже. <code>[?]</code> — объект предполагается, а не выведен.</p>
      <div class="diagram map">${entityMap(E)}</div>
      <p class="mapnote">Узел ведёт к карточке. ${E.length} сущностей, у каждой есть job; единственный job без сущности — <b>E1</b> «чувствовать, что это нормально»: его несёт интент, а интент — в «Под вопросом».</p>
      <div class="ents">${entityCards(E)}</div>
      <h3 id="under-question">Под вопросом</h3>
      ${md(section(sitemap, 'Под вопросом'), { hShift: 0 })}
      <h3>Гигиена безопасности</h3>
      ${md(section(sitemap, 'Гигиена безопасности'), { hShift: 0 })}
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
