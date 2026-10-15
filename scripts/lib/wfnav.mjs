// Порядок экранов — один на вайрфреймы и на концепт.
//
// Источник правды у вайрфреймов: `wireframes/_screens.md` плюс ветки из `sitemap.md`.
// Концепт не разбирает их заново и не держит свой список — он читает уже собранные
// страницы вайрфреймов. Так два набора не могут разойтись: поменялся порядок там —
// он поменялся и здесь, а если вайрфреймы ещё не собраны, сборка концепта падает
// с понятным сообщением вместо тихо устаревшего списка.
//
// Ветки и экраны берутся из дерева в боковой панели, состояния — из полосы над
// мокапом. Раньше и то и другое лежало в дереве; состояния из него убраны
// (они раздували список втрое), поэтому за ними идём туда, где они теперь живут.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const unescape = (s) => s
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&middot;/g, '·')
  .replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&rsquo;/g, '’')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// Состояния одного экрана — из полосы над его мокапом. Первый пункт полосы
// это сам экран (рабочий вид), остальные — его состояния.
function statesOf(root, file) {
  const path = join(root, 'wireframes', `${file}.html`);
  if (!existsSync(path)) throw new Error(`нет wireframes/${file}.html — экран есть в дереве, страницы нет`);
  const src = readFileSync(path, 'utf8');
  const i = src.indexOf('<nav class="wfstates"');
  if (i < 0) return [];                                   // экран без состояний
  const strip = src.slice(i, src.indexOf('</nav>', i));
  const out = [];
  const re = /<li[^>]*>(?:<b[^>]*>|<a[^>]*href="([a-z0-9-]+)\.html"[^>]*>)([^<]+)<\/[ab]>/g;
  let m;
  while ((m = re.exec(strip))) out.push({ file: m[1] || file, title: unescape(m[2]).trim() });
  return out.slice(1);                                    // первый — сам экран
}

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
  const re = /<p class="gt"><span class="gn">\d+<\/span>([^<]+)<\/p>|<li class="scr[^"]*">(?:<b[^>]*>|<a[^>]*href="([a-z0-9-]+)\.html"[^>]*>)([^<]+)<\/[ab]>/g;
  let m;
  while ((m = re.exec(nav))) {
    if (m[1]) { branches.push({ title: unescape(m[1]).trim(), screens: [] }); continue; }
    const branch = branches.at(-1);
    if (!branch) continue;
    branch.screens.push({ file: m[2] || null, title: unescape(m[3]).trim(), pages: [] });
  }
  // текущая страница в дереве стоит без href — подставляем имя зонда
  const current = probe.replace(/^.*\//, '').replace(/\.html$/, '');
  for (const b of branches) {
    for (const s of b.screens) {
      if (!s.file) s.file = current;
      s.pages = statesOf(root, s.file);
    }
  }
  if (!branches.length) throw new Error('дерево вайрфреймов разобрано пустым');
  return branches;
}

// Плоский список страниц в том же порядке — для сборки и для проверки покрытия.
export const flatPages = (branches) =>
  branches.flatMap((b) => b.screens.flatMap((s) => [s.file, ...s.pages.map((p) => p.file)]));
