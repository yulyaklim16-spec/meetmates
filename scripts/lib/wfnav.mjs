// Порядок экранов — один на вайрфреймы и на концепт.
//
// Источник правды у вайрфреймов: `wireframes/_screens.md` плюс ветки из `sitemap.md`.
// Концепт не разбирает их заново и не держит свой список — он читает уже собранное
// дерево вайрфреймов. Так два набора не могут разойтись: поменялся порядок там —
// он поменялся и здесь, а если вайрфреймы ещё не собраны, сборка концепта падает
// с понятным сообщением вместо тихо устаревшего списка.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const unescape = (s) => s
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&middot;/g, '·')
  .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&rsquo;/g, '’')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Любая собранная страница вайрфрейма несёт всё дерево целиком — берём первую попавшуюся.
export function wireframeOrder(root, probe = 'wireframes/feed.html') {
  const path = join(root, probe);
  if (!existsSync(path)) {
    throw new Error(`нет ${probe}: сначала node scripts/build-wireframes.mjs, порядок экранов берётся оттуда`);
  }
  const src = readFileSync(path, 'utf8');
  const i = src.indexOf('<nav class="wfnav"');
  if (i < 0) throw new Error(`в ${probe} нет дерева вайрфреймов — порядок брать неоткуда`);
  const nav = src.slice(i, src.indexOf('</nav>', i));

  const branches = [];
  const re = /<p class="gt"><span class="gn">\d+<\/span>([^<]+)<\/p>|<li class="scr[^"]*">(?:<b[^>]*>|<a[^>]*href="([a-z0-9-]+)\.html"[^>]*>)([^<]+)<\/[ab]>|<li>(?:<b[^>]*>|<a[^>]*href="([a-z0-9-]+)\.html"[^>]*>)([^<]+)<\/[ab]>/g;
  let m;
  while ((m = re.exec(nav))) {
    if (m[1]) { branches.push({ title: unescape(m[1]).trim(), screens: [] }); continue; }
    const branch = branches.at(-1);
    if (!branch) continue;
    if (m[3] !== undefined) {
      branch.screens.push({ file: m[2] || null, title: unescape(m[3]).trim(), pages: [] });
    } else if (m[5] !== undefined) {
      const scr = branch.screens.at(-1);
      if (scr) scr.pages.push({ file: m[4] || null, title: unescape(m[5]).trim() });
    }
  }
  // текущая страница в дереве стоит без href — подставляем имя зонда
  const current = probe.replace(/^.*\//, '').replace(/\.html$/, '');
  for (const b of branches) {
    for (const s of b.screens) {
      if (!s.file) s.file = current;
      for (const p of s.pages) if (!p.file) p.file = current;
    }
  }
  if (!branches.length) throw new Error('дерево вайрфреймов разобрано пустым');
  return branches;
}

// Плоский список страниц в том же порядке — для сборки и для проверки покрытия.
export const flatPages = (branches) =>
  branches.flatMap((b) => b.screens.flatMap((s) => [s.file, ...s.pages.map((p) => p.file)]));
