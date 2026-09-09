// Сборка публичного сайта из research.html.
// В deploy уходит только страница и те скриншоты, на которые она ссылается.
// Внутренние документы (CLAUDE.md, research/*.md) в dist не попадают — иначе
// Vercel отдал бы их статикой по прямым ссылкам.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'dist');
const PAGE = 'research.html';

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const html = readFileSync(join(ROOT, PAGE), 'utf8');

// собираем все локальные пути на скриншоты из src= и href=
const assets = new Set();
for (const m of html.matchAll(/(?:src|href)="(research\/screens\/[^"]+)"/g)) {
  assets.add(m[1]);
}

let copied = 0;
const missing = [];
for (const rel of assets) {
  const from = join(ROOT, rel);
  if (!existsSync(from)) { missing.push(rel); continue; }
  const to = join(OUT, rel);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  copied++;
}

if (missing.length) {
  console.error('Битые ссылки на скриншоты:\n  ' + missing.join('\n  '));
  process.exit(1);
}

// страница становится корнем сайта
writeFileSync(join(OUT, 'index.html'), html, 'utf8');

// без индексации: страница внутренняя, публикуется для удобства чтения
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');

console.log(`dist готов: index.html + ${copied} скриншотов`);
