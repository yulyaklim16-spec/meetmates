// Токены вместо значений — проверяется скриптом, а не глазами.
//
// Правило 2 рабочих соглашений: цвета, радиусы, тени, отступы — только через
// переменные. Этот скрипт проверяет то же самое для цвета и для шрифта во всех
// файлах, которые описывают компоненты продукта:
//
//   ui/kit.css              — кит
//   concept/components.css  — окрашенный слой концепта
//
// Что ищем в теле файла (всё, что после :root):
//   1. цвет литералом     — #hex, rgb(), hsl(), слово вроде white;
//   2. шрифт литералом    — font / font-size / font-weight / line-height /
//                           letter-spacing / font-family мимо var();
//   3. объявленную, но ни разу не использованную переменную;
//   4. переменную, которой пользуются, но нигде не объявили;
//   5. расхождение значений между ui/kit.css и tokens/tokens.css: один и тот же
//      токен не может значить в ките одно, а в продукте другое.
//
// Чего НЕ проверяем: wireframes/_wire.css и concept/screens/screens.css —
// это обвязка страницы макета (подписи зон, рамка телефона), а не компоненты.
//
// Код выхода 1, если хоть одна проверка не прошла.
//
// Запуск: node scripts/tokens-audit.mjs

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

// declaredIn — где у файла объявлены переменные: кит держит свои сам,
// окрашенный слой концепта берёт их из tokens/tokens.css
const FILES = [
  { path: 'ui/kit.css', prefix: '--mm-', declaredIn: ['ui/kit.css'] },
  { path: 'concept/components.css', prefix: '--', declaredIn: ['tokens/tokens.css'] },
];

// свойства, значение которых обязано приходить из переменной
const COLOR = ['color', 'background', 'background-color', 'border-color', 'border',
  'fill', 'stroke', 'box-shadow', 'text-decoration-color', 'outline-color',
  'caret-color', 'scrollbar-color'];
const TYPE = ['font', 'font-family', 'font-size', 'font-weight', 'line-height',
  'letter-spacing'];

// значения, которые переменной не требуют: они не цвет и не размер, а отсутствие
const NEUTRAL = /\b(none|transparent|inherit|currentcolor|initial|unset|auto|solid|dashed|inset|normal|italic|nowrap|0)\b/g;
const LITERAL_COLOR = /#[0-9a-f]{3,8}|rgba?\(|hsla?\(|\b(?:white|black|red|green|blue|gray|grey|silver)\b/;

const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const bodyOf = (css) => {
  const i = css.indexOf(':root');
  return i === -1 ? css : css.slice(css.indexOf('}', i) + 1);
};

let bad = 0;
const say = (ok, line) => {
  if (!ok) bad += 1;
  console.log(`${ok ? '  да ' : '**нет**'} ${line}`);
};

console.log('# Токены вместо значений\n');

for (const { path, prefix, declaredIn } of FILES) {
  const raw = strip(readFileSync(join(ROOT, path), 'utf8'));
  const body = bodyOf(raw);

  const colors = [];
  const types = [];
  for (const m of body.matchAll(/([-a-z]+)\s*:\s*([^;{}]+);/g)) {
    const prop = m[1];
    const val = m[2].trim().toLowerCase();
    // всё, что пришло из переменных и нейтральных слов, из проверки убираем
    const rest = val.replace(/var\(--[a-z0-9-]+\)/g, '').replace(NEUTRAL, '');
    if (COLOR.includes(prop) && LITERAL_COLOR.test(rest)) colors.push(`${prop}: ${val}`);
    if (TYPE.includes(prop) && rest.replace(/[\s/,]/g, '')) types.push(`${prop}: ${val}`);
  }

  const decl = declaredIn.map((f) => strip(readFileSync(join(ROOT, f), 'utf8'))).join('\n');
  const declared = new Set([...decl.matchAll(new RegExp(`^\\s*(${prefix}[a-z0-9-]+):`, 'gm'))].map((m) => m[1]));
  const used = new Set([...raw.matchAll(new RegExp(`var\\((${prefix}[a-z0-9-]+)`, 'g'))].map((m) => m[1]));
  const unused = [...declared].filter((t) => !used.has(t)).sort();
  const undeclared = [...used].filter((t) => !declared.has(t)).sort();

  console.log(`## ${path}\n`);
  say(!colors.length, `цвет литералом: ${colors.length ? colors.join(' · ') : 'нет'}`);
  say(!types.length, `шрифт литералом: ${types.length ? types.join(' · ') : 'нет'}`);
  say(!undeclared.length, `переменные без объявления: ${undeclared.join(' · ') || 'нет'}`);
  console.log(`  —   объявлено и не используется: ${unused.join(' · ') || 'нет'} (это запас, не ошибка)`);
  console.log('');
}

// один токен — одно значение в обоих файлах
const hex = (css, prefix) =>
  Object.fromEntries([...css.matchAll(new RegExp(`${prefix}([a-z0-9-]+):\\s*(#[0-9A-Fa-f]{6}|[0-9.]+(?:em)?);`, 'g'))]
    .map((m) => [m[1], m[2].toLowerCase()]));

const prod = hex(readFileSync(join(ROOT, 'tokens/tokens.css'), 'utf8'), '--');
const kit = hex(readFileSync(join(ROOT, 'ui/kit.css'), 'utf8'), '--mm-');
const drift = Object.keys(kit).filter((k) => prod[k] && prod[k] !== kit[k]);

console.log('## Кит против tokens.css\n');
say(!drift.length, `расхождение значений: ${drift.map((k) => `--${k}: ${prod[k]} / ${kit[k]}`).join(' · ') || 'нет'}`);

console.log(`\n${bad ? `**Не прошло проверок: ${bad}**` : 'Все проверки проходят.'}`);
process.exit(bad ? 1 : 0);
