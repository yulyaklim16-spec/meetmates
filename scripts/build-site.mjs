// Сборка публичного сайта.
//
// В deploy уходит: хаб (index.html), страница итогов (research.html),
// токены, нужные хабу для отрисовки, и только те скриншоты, на которые
// research.html действительно ссылается.
//
// Чего в deploy нет: внутренних .md — бриф, разборы, планы. Иначе Vercel
// отдавал бы продуктовую стратегию статикой по прямым ссылкам.
// Ссылки хаба на такие файлы переписываются на приватный GitHub: у команды
// они откроются, у постороннего — упрутся в аутентификацию GitHub.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'dist');

// ── база для ссылок на исходники ───────────────────────────────
// читаем из git, чтобы адрес репозитория не был зашит в скрипт
function repoBlobBase() {
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

// ── 1. research.html и его скриншоты ───────────────────────────
const research = readFileSync(join(ROOT, 'research.html'), 'utf8');
const missing = [];
// каждый скриншот упомянут дважды — в src картинки и в href ссылки на полный размер
const shots = new Set([...research.matchAll(/(?:src|href)="(research\/screens\/[^"]+)"/g)].map((m) => m[1]));
for (const rel of shots) {
  if (!copyAsset(rel)) missing.push(rel);
}
if (missing.length) {
  console.error('Битые ссылки на скриншоты:\n  ' + missing.join('\n  '));
  process.exit(1);
}
writeFileSync(join(OUT, 'research.html'), research, 'utf8');

// ── 2. токены: хаб отрисовывается ими ──────────────────────────
if (!copyAsset('tokens/tokens.css')) {
  console.error('Нет tokens/tokens.css — хаб останется без стилей');
  process.exit(1);
}

// ── 3. хаб: локальные ссылки на не-html уводим на GitHub ───────
let hub = readFileSync(join(ROOT, 'index.html'), 'utf8');

const rewritten = [];
const dropped = [];
hub = hub.replace(/<a\b([^>]*)>/g, (tag, attrs) => {
  const href = attrs.match(/href="([^"]+)"/);
  if (!href) return tag;
  const url = href[1];
  // внешние ссылки и внутренние страницы сайта оставляем как есть
  if (/^(https?:|mailto:|#)/.test(url) || url.endsWith('.html')) return tag;

  if (BLOB) {
    rewritten.push(url);
    const next = attrs.replace(/href="[^"]+"/, `href="${BLOB}${url}"`);
    return `<a${next}${/target=/.test(next) ? '' : ' target="_blank" rel="noopener"'}>`;
  }
  // без известного репозитория ссылку не выдумываем — просто снимаем её
  dropped.push(url);
  return `<a${attrs.replace(/\s*href="[^"]+"/, '')}>`;
});

const note = BLOB
  ? 'Ссылки на документы ведут в приватный репозиторий на GitHub: сами файлы на этом сайте не публикуются.'
  : 'Ссылки на документы сняты: файлы на этом сайте не публикуются.';
hub = hub.replace('<!--PUBLIC-NOTE-->', `<p>${note}</p>`);

writeFileSync(join(OUT, 'index.html'), hub, 'utf8');

// ── 4. без индексации: страница внутренняя ─────────────────────
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');

// ── 5. проверка: ни одного .md в сборке ────────────────────────
const leaked = copied.filter((f) => f.endsWith('.md'));
if (leaked.length) {
  console.error('В сборку попали внутренние документы:\n  ' + leaked.join('\n  '));
  process.exit(1);
}

console.log(
  `dist готов: index.html + research.html + tokens.css + ${copied.length - 1} скриншотов\n` +
  (BLOB
    ? `ссылок уведено на ${BLOB}: ${rewritten.length}`
    : `ссылок снято (репозиторий не определён): ${dropped.length}`)
);
