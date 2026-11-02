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

// ── набор сам на себя: ссылка внутри tokens.css ──────────────────────
// Составные роли — тени, кольца, блик заглушки — собраны из других ролей.
// Если имя внутри var() переименовали, а ссылку не поправили, свойство
// становится невалидным и просто исчезает: кольцо фокуса пропадает во всём
// продукте, а гейты остаются зелёными. Поэтому набор проверяется сам на себя.
{
  const tokens = readFileSync(join(ROOT, 'design-system/tokens.css'), 'utf8');
  const bare = tokens.replace(/\/\*[\s\S]*?\*\//g, '');
  const declared = new Set([...bare.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const used = new Set([...bare.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  const dangling = [...used].filter((t) => !declared.has(t)).sort();

  console.log('## Набор сам на себя\n');
  say(!dangling.length, `ссылки на необъявленное в tokens.css: ${dangling.join(' · ') || 'нет'}`);

  // Составная роль вычисляется там, где объявлена: var() внутри подставляется
  // ролями того же места и наследуется вниз уже подставленным. Объявлённая
  // только на :root, она приносит светлые значения в любое поддерево с темой.
  const darkAt = bare.indexOf('[data-theme="dark"]');
  const light = bare.slice(0, darkAt);
  const dark = bare.slice(darkAt);
  const themed = new Set([...dark.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const frozen = [];
  for (const m of light.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = m;
    if (themed.has(name)) continue;
    const refs = [...value.matchAll(/var\((--[a-z0-9-]+)/g)].map((x) => x[1]).filter((r) => themed.has(r));
    if (refs.length) frozen.push(`${name} ← ${[...new Set(refs)].join(', ')}`);
  }
  say(!frozen.length, `составные роли без значения в тёмной: ${frozen.join(' · ') || 'нет'}`);
  console.log('');
}

// Тема на поддереве: носитель атрибута одевается сам.
//
// [data-theme] на элементе меняет роли во всём поддереве, но не трогает уже
// вычисленные свойства: color объявлен на body страницы и наследуется вниз
// готовым значением. Поэтому элемент с темой обязан объявить свои фон и цвет
// сам — иначе чернила приходят со страницы, и в блоке состояний получался
// чёрный заголовок на чёрной карточке.
//
// Проверяется только носитель: селектор, который кончается на [data-theme…].
// Потомок (`.states-row[data-theme] .kit-stage`) цвет наследует от него
// и объявлять ничего не должен.
{
  const files = ['design-system/docs/docs.css', 'design-system/components/index.css', 'concept/components.css'];
  const naked = [];
  for (const rel of files) {
    let css;
    try { css = readFileSync(join(ROOT, rel), 'utf8'); } catch { continue; }
    const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const [, sel, body] = m;
      // носитель темы: атрибут стоит в последней части селектора
      const carries = sel.split(',').map((x) => x.trim()).filter((x) => /\[data-theme[^\]]*\]\s*$/.test(x));
      if (!carries.length) continue;
      if (/^\s*\[data-theme/.test(sel.trim())) continue;   // блок самих ролей — он их и объявляет
      const has = (prop) => new RegExp(`(^|;|\\s)${prop}\\s*:`).test(body);
      const miss = ['background', 'color'].filter((prop) =>
        prop === 'background' ? !(has('background') || has('background-color')) : !has(prop));
      if (miss.length) naked.push(`${rel}: ${carries[0]} — нет ${miss.join(' и ')}`);
    }
  }

  console.log('## Тема на поддереве\n');
  say(!naked.length, `носитель темы без своих фона и цвета: ${naked.join(' · ') || 'нет'}`);
  console.log('');
}

// ── Две шкалы одного продукта: карта имён `D-101` ────────────────────
//
// Шкалы живут в двух файлах под разными именами: продукт назвал их по роли
// (`--t-body`, `--s-4`), набор — по значению (`--text-16`, `--space-16`),
// и ни одно имя не встречается в обоих. Проверка ниже сверяла только
// совпадающие имена, поэтому по типографике и шкале она молчала всегда:
// кегль можно было поменять в наборе и не поменять в продукте, и экраны
// разъехались бы молча.
//
// Поэтому пары названы здесь явно. Скрипт требует трёх вещей:
//   1. оба имени пары объявлены — иначе имя переименовали, а карту не поправили;
//   2. значения равны — иначе шкала разъехалась;
//   3. имя шкалы, не попавшее в карту, названо в SOLO с причиной — иначе
//      ступень завели с одной стороны и забыли про другую.
{
  const PAIRS = [
    // гарнитура и кегль
    ['--font', '--font-sans'], ['--t-display', '--text-34'], ['--t-h1', '--text-28'],
    ['--t-h2', '--text-22'], ['--t-h3', '--text-18'], ['--t-body', '--text-16'],
    ['--t-body-sm', '--text-14'], ['--t-caption', '--text-12'],
    // вес, межстрочное, трекинг
    ['--fw-regular', '--weight-400'], ['--fw-medium', '--weight-500'],
    ['--fw-semibold', '--weight-600'], ['--fw-bold', '--weight-700'],
    ['--lh-flat', '--leading-100'], ['--lh-tight', '--leading-105'],
    ['--lh-heading', '--leading-125'], ['--lh-promise', '--leading-145'],
    ['--lh-body', '--leading-150'],
    ['--tr-btn', '--tracking-button'], ['--tr-heading', '--tracking-heading'],
    ['--tr-display', '--tracking-display'],
    // шаг и радиус
    ['--s-1', '--space-4'], ['--s-2', '--space-8'], ['--s-3', '--space-12'],
    ['--s-4', '--space-16'], ['--s-5', '--space-24'], ['--s-6', '--space-32'],
    ['--s-7', '--space-48'], ['--label-pad', '--space-label'],
    ['--r-sm', '--radius-sm'], ['--r-md', '--radius-md'], ['--r-lg', '--radius-lg'],
    ['--r-pill', '--radius-pill'],
    // движение
    ['--dur-fast', '--duration-fast'], ['--dur-slow', '--duration-slow'],
    ['--ease-out', '--ease-out'],
  ];

  // Ступени без пары. Каждая — с причиной, иначе это недосмотр, а не решение.
  const SOLO = {
    '--text-20': 'знак возврата: кегля 20px в продуктовой шкале нет',
    '--space-2': 'самый мелкий шаг кита — время реплики, подпись тега',
    '--space-6': 'поля нижнего меню и вкладки',
    '--space-mark': 'оптический воздух вокруг выделенного слова, не ступень',
    '--duration-skeleton': 'пробег блика по заглушке — своя длительность',
    '--r-xl': '30px снят из набора `D-79`: остался на стенде радиусов concept.html',
    '--dur-base': '250ms в наборе не встречается: переходов этой длины у кита нет',
    '--ease-spring': 'возврат свайп-карточки: движения свайпа в ките нет',
  };

  // Берём объявления из :root, а не из @media: блок prefers-reduced-motion
  // глушит длительности до 1ms, и это не значение шкалы, а её выключение.
  const valuesOf = (rel) => {
    const bare = strip(readFileSync(join(ROOT, rel), 'utf8')).replace(/@media[^{]*\{[\s\S]*?\}\s*\}/g, '');
    const out = {};
    for (const m of bare.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) if (!(m[1] in out)) out[m[1]] = m[2].trim();
    return out;
  };
  const prodV = valuesOf('tokens/tokens.css');
  const kitV = valuesOf('design-system/tokens.css');

  const missing = [];
  const apart = [];
  for (const [p, k] of PAIRS) {
    if (!(p in prodV)) missing.push(`${p} нет в tokens/tokens.css`);
    if (!(k in kitV)) missing.push(`${k} нет в design-system/tokens.css`);
    if (p in prodV && k in kitV && prodV[p] !== kitV[k]) apart.push(`${p}: ${prodV[p]} / ${k}: ${kitV[k]}`);
  }

  // что считать шкалой: гарнитура, кегль, вес, межстрочное, трекинг, шаг,
  // радиус и движение. Цвет сюда не входит — его сверяет проверка ниже.
  // Кегль — только числовое имя: --text-16 это шкала, --text-primary роль цвета.
  const SCALE = /^--(font$|font-sans$|t-[a-z]|text-\d|fw-|weight-\d|lh-|leading-\d|tr-|tracking-|s-\d|space-|r-[a-z]|radius-|dur-|duration-|ease-|label-pad$)/;
  const paired = new Set(PAIRS.flat());
  const orphans = [];
  for (const [file, vals] of [['tokens/tokens.css', prodV], ['design-system/tokens.css', kitV]]) {
    for (const name of Object.keys(vals)) {
      if (!SCALE.test(name) || paired.has(name) || name in SOLO) continue;
      orphans.push(`${file}: ${name}`);
    }
  }

  console.log('## Две шкалы одного продукта\n');
  say(!missing.length, `имя пары не объявлено: ${missing.join(' · ') || 'нет'}`);
  say(!apart.length, `шкала разъехалась: ${apart.join(' · ') || 'нет'}`);
  say(!orphans.length, `ступень без пары и без причины: ${orphans.join(' · ') || 'нет'}`);
  console.log(`  —   ступеней с записанной причиной: ${Object.keys(SOLO).length}`);
  console.log('');
}

// ── точка изменения поведения: число в запросе равно токену `D-107` ──
//
// var() в условии @media и @container CSS не принимает: значение там обязано
// стоять числом. Значит точка живёт в двух местах — токеном --bp-* в наборе
// и числом в компоненте, — и разъехаться они могут молча: правка токена
// раскладку не сдвинет, а гейты останутся зелёными. Поэтому каждое число
// из запроса сверяется с объявленными точками.
{
  const tokens = strip(readFileSync(join(ROOT, 'design-system/tokens.css'), 'utf8'));
  const bps = new Map([...tokens.matchAll(/(--bp-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[2].trim(), m[1]]));
  const stray = [];
  const used = new Set();
  for (const f of readdirSync(join(ROOT, 'design-system/components')).filter((x) => x.endsWith('.css')).sort()) {
    const css = strip(readFileSync(join(ROOT, `design-system/components/${f}`), 'utf8'));
    for (const m of css.matchAll(/@(?:media|container)[^{]*?\(\s*(?:min|max)-width\s*:\s*([^)]+)\)/g)) {
      const v = m[1].trim();
      if (bps.has(v)) used.add(bps.get(v));
      else stray.push(`${f}: ${v}`);
    }
  }

  console.log('## Точка изменения поведения\n');
  say(!stray.length, `число в запросе мимо токена --bp-*: ${stray.join(' · ') || 'нет'}`);
  console.log(`  —   объявлено точек: ${[...bps.values()].join(' · ') || 'нет'}; занято раскладкой: ${[...used].sort().join(' · ') || 'ни одной'}`);
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
