// Разметка markdown → HTML для страниц разделов.
//
// Один рендерер на все сборки: build-ia.mjs и build-voice.mjs. Поддерживает
// ровно то, что встречается в наших документах, — заголовки, абзацы, списки,
// таблицы, цитаты, блоки кода, строчную разметку и `D-NN` как отдельный код.
// Чего нет, того в документах быть не должно: лишний синтаксис молча пропадёт.

// ── утилиты ────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ссылки из markdown ведут от корня репозитория; страница лежит в sections/
function fixHref(url) {
  if (/^(https?:|mailto:|#)/.test(url)) return url;
  return '../' + url.replace(/^\.\//, '');
}

// строчная разметка: код, жирный, курсив, зачёркнутое, ссылки, D-коды
//
// Ссылки и код прячутся за метки раньше остального: подпись ссылки бывает
// в обратных кавычках (`[`voice.md`](./voice.md)`), а жирное — обнимать код
// (`**отстали от `D-37`**`). Разбор по кускам рвал такие места пополам,
// и разметка оставалась на странице сырой.
function inline(s) {
  const slots = [];
  const put = (html) => `\u0000${slots.push(html) - 1}\u0000`;

  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => put(`<a href="${fixHref(url)}">${inline(txt)}</a>`));
  s = s.replace(/`([^`]*)`/g, (_, code) =>
    put(/^D-\d+$/.test(code) ? `<code class="dcode">${esc(code)}</code>` : `<code>${esc(code)}</code>`));

  let t = esc(s);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/~~(.+?)~~/g, '<s>$1</s>');
  t = t.replace(/(^|[\s(«])\*([^*\s][^*]*?)\*(?=[\s).,;:»!?]|$)/g, '$1<em>$2</em>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[i]);
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

export { esc, fixHref, inline, md, slug, splitRow, table, list, section };
