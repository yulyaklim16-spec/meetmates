// Сборка публичного сайта.
//
// В deploy уходит: редирект в корне, страницы разделов, токены, которыми они
// отрисовываются, и только те скриншоты, на которые страницы действительно ссылаются.
//
// Чего в deploy нет: внутренних .md — бриф, разборы, планы. Иначе Vercel
// отдавал бы продуктовую стратегию статикой по прямым ссылкам.
// Ссылки страниц на такие файлы переписываются на приватный GitHub: у команды
// они откроются, у постороннего — упрутся в аутентификацию GitHub.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join, posix } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'dist');

// страницы сайта относительно корня репозитория
const PAGES = ['research/research.html', 'research/persones.html', 'sections/index.html', 'sections/ia.html'];

// ── база для ссылок на исходники ───────────────────────────────
// читаем из git, чтобы адрес репозитория не был зашит в скрипт
function repoBlobBase() {
  // На Vercel репозиторий приезжает без .git — git-команды там не работают.
  // Адрес собираем из переменных окружения сборки, иначе ссылки на исходники
  // в задеплоенной версии молча превращаются в текст.
  const { VERCEL_GIT_REPO_OWNER: owner, VERCEL_GIT_REPO_SLUG: slug } = process.env;
  if (owner && slug) {
    const branch = process.env.VERCEL_GIT_COMMIT_REF || 'main';
    return `https://github.com/${owner}/${slug}/blob/${branch}/`;
  }
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const m = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
    if (!m) return null;
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim() || 'main';
    return `https://github.com/${m[1]}/blob/${branch}/`;
  } catch {
    return null;
  }
}
const BLOB = repoBlobBase();

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const copied = [];
function copyAsset(rel) {
  const from = join(ROOT, rel);
  if (!existsSync(from)) return false;
  const to = join(OUT, rel);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  copied.push(rel);
  return true;
}

// ── 1. скриншоты, на которые ссылаются страницы ────────────────
// пути в разметке даны относительно папки страницы, приводим к корню репозитория
const pages = PAGES.map((rel) => ({
  rel,
  dir: posix.dirname(rel),
  html: readFileSync(join(ROOT, rel), 'utf8'),
}));

const shots = new Set();
for (const p of pages) {
  for (const m of p.html.matchAll(/(?:src|href)="([^":]+\.png)"/g)) {
    shots.add(posix.normalize(posix.join(p.dir, m[1])));
  }
}
const missing = [];
for (const rel of shots) if (!copyAsset(rel)) missing.push(rel);
if (missing.length) {
  console.error('Битые ссылки на скриншоты:\n  ' + missing.join('\n  '));
  process.exit(1);
}

// ── 2. токены: страницы отрисовываются ими ─────────────────────
if (!copyAsset('tokens/tokens.css')) {
  console.error('Нет tokens/tokens.css — страницы останутся без стилей');
  process.exit(1);
}

// ── 3. страницы: ссылки на внутренние документы уводим на GitHub ─
const rewritten = [];
const dropped = [];
const publish = (html, dirRelativeToRoot) =>
  html.replace(/<a\b([^>]*)>/g, (tag, attrs) => {
    const href = attrs.match(/href="([^"]+)"/);
    if (!href) return tag;
    const url = href[1];
    // внешние ссылки, якоря, страницы сайта, папки с query и картинки оставляем как есть
    if (
      /^(https?:|mailto:|#)/.test(url) ||
      url.endsWith('.html') ||
      url.endsWith('.png') ||
      url.includes('?') ||
      url.endsWith('/')
    ) return tag;

    if (BLOB) {
      const fromRoot = posix.normalize(posix.join(dirRelativeToRoot, url));
      rewritten.push(fromRoot);
      const next = attrs.replace(/href="[^"]+"/, `href="${BLOB}${fromRoot}"`);
      return `<a${next}${/target=/.test(next) ? '' : ' target="_blank" rel="noopener"'}>`;
    }
    // без известного репозитория ссылку не выдумываем — просто снимаем её
    dropped.push(url);
    return `<a${attrs.replace(/\s*href="[^"]+"/, '')}>`;
  });

const note = BLOB
  ? 'Ссылки на документы ведут в приватный репозиторий на GitHub: сами файлы на этом сайте не публикуются.'
  : 'Ссылки на документы сняты: файлы на этом сайте не публикуются.';

for (const p of pages) {
  mkdirSync(join(OUT, p.dir), { recursive: true });
  writeFileSync(
    join(OUT, p.rel),
    publish(p.html, p.dir).replace('<!--PUBLIC-NOTE-->', `<p>${note}</p>`),
    'utf8'
  );
}

// ── 4. редирект в корне ────────────────────────────────────────
writeFileSync(join(OUT, 'index.html'), readFileSync(join(ROOT, 'index.html'), 'utf8'), 'utf8');

// ── 5. без индексации: страницы внутренние ─────────────────────
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');

// ── 6. проверка: ни одного .md в сборке ────────────────────────
const leaked = copied.filter((f) => f.endsWith('.md'));
if (leaked.length) {
  console.error('В сборку попали внутренние документы:\n  ' + leaked.join('\n  '));
  process.exit(1);
}

console.log(
  `dist готов: index.html (редирект) + ${PAGES.join(', ')} + tokens.css + ${copied.length - 1} скриншотов\n` +
  (BLOB
    ? `ссылок уведено на ${BLOB}: ${rewritten.length}`
    : `ссылок снято (репозиторий не определён): ${dropped.length}`)
);
