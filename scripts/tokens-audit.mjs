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

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

// declaredIn — где у файла объявлены переменные. Компоненты берут всё
// из корневого tokens.css; окрашенный слой концепта — из tokens/tokens.css
const FILES = [
  // checkSizes — размеры проверяем в компонентах: ими одеты экраны.
  // Исключение одно и названо в самом файле: components/radar.css держит
  // одноразовую геометрию иллюстрации литералами
  ...readdirSync(join(ROOT, 'design-system/components')).filter((f) => f.endsWith('.css') && f !== 'radar.css').sort()
    .map((f) => ({ path: `design-system/components/${f}`, prefix: '--', declaredIn: ['design-system/tokens.css'], checkSizes: true })),
  { path: 'design-system/components/radar.css', prefix: '--', declaredIn: ['design-system/tokens.css'], checkSizes: false },
  { path: 'concept/components.css', prefix: '--', declaredIn: ['tokens/tokens.css'], checkSizes: false },
];

// свойства, значение которых обязано приходить из переменной
const COLOR = ['color', 'background', 'background-color', 'border-color', 'border',
  'fill', 'stroke', 'box-shadow', 'text-decoration-color', 'outline-color',
  'caret-color', 'scrollbar-color'];
const TYPE = ['font', 'font-family', 'font-size', 'font-weight', 'line-height',
  'letter-spacing'];
// Шаг и радиус — шкала набора, и в компоненте они только токеном: ступень
// повторяется в десятках мест, и правка ступени обязана разойтись сама.
//
// Ширина и высота проверку не проходят с `D-87`: мерка одного компонента —
// не решение набора, а размер этой детали, и место ей в самом компоненте.
// Токенами они были, и список рос до тридцати шести имён, которые читались
// по одному разу каждое.
//
// Два значения литералом разрешены и названы в ui/kit.md: 1px — волосяная
// линия, физический пиксель устройства, и 999px — признак «скругли до конца».
const SIZE = ['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'gap', 'row-gap', 'column-gap', 'border-radius'];
const SIZE_OK = /^(?:0|1|999)$/;

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

for (const { path, prefix, declaredIn, checkSizes } of FILES) {
  const src = readFileSync(join(ROOT, path), 'utf8');
  // геометрию рисунка вырезаем до того, как снимем комментарии: метки живут в них
  const raw = strip(src);
  const body = bodyOf(raw);
  const drawn = bodyOf(strip(src.replace(/\/\* geometry:start[\s\S]*?geometry:end \*\//g, '')));

  const colors = [];
  const types = [];
  const sizes = [];
  for (const m of drawn.matchAll(/([-a-z]+)\s*:\s*([^;{}]+);/g)) {
    const prop = m[1];
    const val = m[2].trim().toLowerCase();
    // всё, что пришло из переменных и нейтральных слов, из проверки убираем
    const rest = val.replace(/var\(--[a-z0-9-]+\)/g, '').replace(NEUTRAL, '');
    if (COLOR.includes(prop) && LITERAL_COLOR.test(rest)) colors.push(`${prop}: ${val}`);
    if (TYPE.includes(prop) && rest.replace(/[\s/,]/g, '')) types.push(`${prop}: ${val}`);
    // calc, собранный из токена и мерки, — норма: поле экрана минус жёлоб
    // прокрутки или место под иконку в поле. Ступень здесь из токена, а число
    // рядом с ней — та самая мерка, которой токен не нужен.
    const fromToken = val.includes('calc(') && val.includes('var(--');
    if (checkSizes && SIZE.includes(prop) && !fromToken) {
      for (const px of rest.matchAll(/(\d+)px/g)) {
        if (!SIZE_OK.test(px[1])) sizes.push(`${prop}: ${val}`);
      }
    }
  }

  const decl = declaredIn.map((f) => strip(readFileSync(join(ROOT, f), 'utf8'))).join('\n');
  const declared = new Set([...decl.matchAll(new RegExp(`^\\s*(${prefix}[a-z0-9-]+):`, 'gm'))].map((m) => m[1]));
  const used = new Set([...raw.matchAll(new RegExp(`var\\((${prefix}[a-z0-9-]+)`, 'g'))].map((m) => m[1]));
  const unused = [...declared].filter((t) => !used.has(t)).sort();
  const undeclared = [...used].filter((t) => !declared.has(t)).sort();

  console.log(`## ${path}\n`);
  say(!colors.length, `цвет литералом: ${colors.length ? colors.join(' · ') : 'нет'}`);
  say(!types.length, `шрифт литералом: ${types.length ? types.join(' · ') : 'нет'}`);
  if (checkSizes) say(!sizes.length, `размер литералом: ${sizes.length ? [...new Set(sizes)].join(' · ') : 'нет'}`);
  else console.log('  —   размер литералом: не проверяется (слой доживает свой век)');
  say(!undeclared.length, `переменные без объявления: ${undeclared.join(' · ') || 'нет'}`);
  console.log(`  —   объявлено и не используется: ${unused.join(' · ') || 'нет'} (это запас, не ошибка)`);
  console.log('');
}

// один токен — одно значение в обоих файлах
const hex = (css, prefix) =>
  Object.fromEntries([...css.matchAll(new RegExp(`${prefix}([a-z0-9-]+):\\s*(#[0-9A-Fa-f]{6}|[0-9.]+(?:em)?);`, 'g'))]
    .map((m) => [m[1], m[2].toLowerCase()]));

const prod = hex(readFileSync(join(ROOT, 'tokens/tokens.css'), 'utf8'), '--');
const kit = hex(readFileSync(join(ROOT, 'design-system/tokens.css'), 'utf8'), '--');
const drift = Object.keys(kit).filter((k) => prod[k] && prod[k] !== kit[k]);

console.log('## Кит против tokens.css\n');
say(!drift.length, `расхождение значений: ${drift.map((k) => `--${k}: ${prod[k]} / ${kit[k]}`).join(' · ') || 'нет'}`);

console.log(`\n${bad ? `**Не прошло проверок: ${bad}**` : 'Все проверки проходят.'}`);
process.exit(bad ? 1 : 0);
