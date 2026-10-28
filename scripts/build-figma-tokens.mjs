// Токены для Figma: собирает из корневого tokens.css два артефакта.
//
//   figma/tokens.json          — набор для плагина Tokens Studio: два набора,
//                                primitive и semantic; семантика ссылается
//                                на примитив ссылкой {primitive.color.plum-900}
//   figma/import-variables.js  — код для плагина-консоли (Scripter или свой
//                                плагин): создаёт две коллекции переменных,
//                                связывает семантику с примитивом алиасами
//                                и заводит стили для теней и размытия
//
// Почему два: Figma держит переменными цвет, число и строку, но не держит
// тень и градиент — их приходится заводить стилями, а это умеет только
// плагин. JSON переносит цифры, скрипт переносит всё.
//
// Запуск: node scripts/build-figma-tokens.mjs — после правки tokens.css

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const raw = readFileSync(join(ROOT, 'design-system/tokens.css'), 'utf8');
// комментарии гасим до разбора: в них попадаются имена с двоеточием
// («То же значение, что у --bg-page: роли разные…»), и без этого
// объявление читалось бы из пояснения. Длину сохраняем, чтобы
// индексы остались прежними.
const COMMENT = new RegExp('/\\*[\\s\\S]*?\\*/', 'g');
const css = raw.replace(COMMENT, (c) => c.replace(new RegExp('[^\\r\\n]', 'g'), ' '));

const semAt = raw.indexOf('SEMANTIC —');
// Тёмная тема — те же имена с другими значениями: в один список их складывать
// нельзя, иначе коллекция удвоится. Она уезжает вторым режимом (D-84).
const darkAt = raw.indexOf('[data-theme="dark"]');
if (darkAt === -1) throw new Error('в tokens.css нет блока тёмной темы — разбор отстал от файла');
const decl = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
const prim = [];
const sem = [];
const darkList = [];
for (const m of css.matchAll(decl)) {
  const name = m[1].slice(2);
  const value = m[2].replace(/\s+/g, ' ').trim();
  if (m.index >= darkAt) darkList.push({ name, value });
  else (m.index < semAt ? prim : sem).push({ name, value });
}
const darkOf = new Map(darkList.map((t) => [t.name, t.value]));

// ── какого типа значение ──────────────────────────────────────────────
const kind = (v) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return 'color';
  if (/^-?\d+(\.\d+)?px$/.test(v)) return 'px';
  if (/^-?\d*\.?\d+$/.test(v)) return 'number';
  if (/^-?\d+(\.\d+)?%$/.test(v)) return 'percent';
  if (/gradient|rgba?\(/.test(v) && /,/.test(v)) return v.includes('gradient') ? 'gradient' : 'shadow';
  if (/^inset |^0 0 0 /.test(v)) return 'shadow';
  return 'string';
};

// имя переменной → путь в дереве: первое слово становится группой
const groupOf = (name) => {
  const map = [
    [/^(white|gray|plum|lilac|lime|crimson|rose)/, 'color'],
    [/^space/, 'space'], [/^radius/, 'radius'], [/^size/, 'size'],
    [/^text-\d/, 'font-size'], [/^weight/, 'weight'], [/^leading/, 'leading'],
    [/^tracking/, 'tracking'], [/^duration/, 'duration'],
    [/^shadow|^ring/, 'effect'], [/^gradient/, 'gradient'],
    [/^width|^measure/, 'measure'], [/^font-sans|^ease|^opacity|^zoom/, 'misc'],
  ];
  const hit = map.find(([re]) => re.test(name));
  return hit ? hit[1] : 'misc';
};
const semGroup = (name) => {
  const first = name.split('-')[0];
  return ['bg', 'text', 'icon', 'color', 'border'].includes(first) ? first : 'color';
};
const leaf = (name, group) => {
  if (group === 'color' && /^(white)$/.test(name)) return name;
  return name.replace(new RegExp(`^${group}-?`), '') || name;
};

// ── 1. JSON для Tokens Studio ────────────────────────────────────────
const typeOf = { color: 'color', px: 'sizing', number: 'number', percent: 'sizing',
  gradient: 'other', shadow: 'boxShadow', string: 'other' };

const tree = { primitive: {}, semantic: {} };
for (const { name, value } of prim) {
  const g = groupOf(name);
  const k = kind(value);
  tree.primitive[g] = tree.primitive[g] || {};
  tree.primitive[g][leaf(name, g)] = {
    value: k === 'px' ? value.replace('px', '') : value,
    type: typeOf[k] || 'other',
    description: `--${name}`,
  };
}
for (const { name, value } of sem) {
  const g = semGroup(name);
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/);
  let v = value;
  if (ref) {
    const pg = groupOf(ref[1]);
    v = `{primitive.${pg}.${leaf(ref[1], pg)}}`;
  }
  tree.semantic[g] = tree.semantic[g] || {};
  tree.semantic[g][leaf(name, g)] = { value: v, type: ref && /color|bg|border|icon|text/.test(g) ? 'color' : 'other', description: `--${name}` };
}

// Третий набор для Tokens Studio: только то, что тема меняет. В плагине он
// включается поверх semantic — так же, как режим в самих переменных Figma.
tree['semantic-dark'] = {};
for (const { name, value } of darkList) {
  const g = semGroup(name);
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/);
  let v = value;
  if (ref) {
    const pg = groupOf(ref[1]);
    v = `{primitive.${pg}.${leaf(ref[1], pg)}}`;
  }
  tree['semantic-dark'][g] = tree['semantic-dark'][g] || {};
  tree['semantic-dark'][g][leaf(name, g)] = { value: v, type: 'color', description: `--${name} в тёмной теме` };
}

mkdirSync(join(ROOT, 'figma'), { recursive: true });
writeFileSync(join(ROOT, 'figma/tokens.json'), `${JSON.stringify(tree, null, 2)}\n`, 'utf8');

// ── 2. код для плагина ───────────────────────────────────────────────
const hexToRgb = (h) => ({
  r: parseInt(h.slice(1, 3), 16) / 255,
  g: parseInt(h.slice(3, 5), 16) / 255,
  b: parseInt(h.slice(5, 7), 16) / 255,
});

const primEntries = prim.map(({ name, value }) => {
  const k = kind(value);
  const path = `${groupOf(name)}/${leaf(name, groupOf(name))}`;
  if (k === 'color') return { path, type: 'COLOR', value: hexToRgb(value), css: name };
  if (k === 'px') return { path, type: 'FLOAT', value: parseFloat(value), css: name };
  if (k === 'number') return { path, type: 'FLOAT', value: parseFloat(value), css: name };
  return { path, type: 'STRING', value, css: name };
});
const semEntries = sem.map(({ name, value }) => {
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/);
  const path = `${semGroup(name)}/${leaf(name, semGroup(name))}`;
  if (!ref) return { path, type: 'STRING', value, css: name };
  const pg = groupOf(ref[1]);
  return { path, alias: `${pg}/${leaf(ref[1], pg)}`, css: name };
});

// Тёмный режим: те же пути, другой примитив под ними.
const darkEntries = darkList.map(({ name, value }) => {
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/);
  const path = `${semGroup(name)}/${leaf(name, semGroup(name))}`;
  if (!ref) return { path, value, css: name };
  const pg = groupOf(ref[1]);
  return { path, alias: `${pg}/${leaf(ref[1], pg)}`, css: name };
});

const EFFECT_LIST = prim.filter(({ value }) => kind(value) === 'shadow').map(({ name, value }) => ({ name, value }));
const GRADIENT_LIST = prim.filter(({ value }) => kind(value) === 'gradient').map(({ name, value }) => ({ name, value }));

const code = `// MeetMates → Figma: переменные и стили одним прогоном.
// Сгенерировано scripts/build-figma-tokens.mjs из tokens.css — руками не править.
//
// Как запустить: открыть нужный файл в Figma, поставить плагин Scripter
// (Plugins → Scripter), вставить этот код и нажать Run. Плагин создаёт
// две коллекции переменных — Primitive и Semantic, — связывает семантику
// с примитивом алиасами и заводит стили для теней и размытия экрана.
// Повторный запуск не плодит дубли: существующие переменные обновляются.

const PRIMITIVE = ${JSON.stringify(primEntries, null, 2)};
const SEMANTIC = ${JSON.stringify(semEntries, null, 2)};
const SEMANTIC_DARK = ${JSON.stringify(darkEntries, null, 2)};

const EFFECTS = ${JSON.stringify(EFFECT_LIST, null, 2)};
const GRADIENTS = ${JSON.stringify(GRADIENT_LIST, null, 2)};

async function run() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const pick = (name) => collections.find((c) => c.name === name)
    || figma.variables.createVariableCollection(name);
  const primCol = pick('Primitive');
  const semCol = pick('Semantic');

  const existing = await figma.variables.getLocalVariablesAsync();
  const byName = new Map(existing.map((v) => [v.variableCollectionId + '|' + v.name, v]));
  const ensure = (col, path, type) => {
    const key = col.id + '|' + path;
    return byName.get(key) || figma.variables.createVariable(path, col, type);
  };

  const made = new Map();
  for (const t of PRIMITIVE) {
    const v = ensure(primCol, t.path, t.type);
    v.setValueForMode(primCol.modes[0].modeId, t.value);
    v.description = '--' + t.css;
    made.set(t.path, v);
  }
  let aliased = 0;
  for (const t of SEMANTIC) {
    if (t.alias) {
      const target = made.get(t.alias);
      if (!target) { console.warn('нет примитива для', t.path, '→', t.alias); continue; }
      const v = ensure(semCol, t.path, target.resolvedType);
      v.setValueForMode(semCol.modes[0].modeId, figma.variables.createVariableAlias(target));
      v.description = '--' + t.css + ' → --' + t.alias.split('/').pop();
      aliased += 1;
    } else {
      const v = ensure(semCol, t.path, 'STRING');
      v.setValueForMode(semCol.modes[0].modeId, t.value);
      v.description = '--' + t.css;
    }
  }

  // тёмная тема — второй режим той же коллекции, а не второй набор имён:
  // так Figma переключает макет целиком, как продукт переключает data-theme
  const darkMode = semCol.modes.find((m) => m.name === 'Dark')
    || { modeId: semCol.addMode('Dark') };
  const semByPath = new Map();
  for (const t of SEMANTIC) {
    const v = byName.get(semCol.id + '|' + t.path);
    if (v) semByPath.set(t.path, v);
  }
  const semVars = await figma.variables.getLocalVariablesAsync();
  for (const v of semVars) if (v.variableCollectionId === semCol.id) semByPath.set(v.name, v);
  let darkSet = 0;
  for (const t of SEMANTIC_DARK) {
    const v = semByPath.get(t.path);
    if (!v) { console.warn('нет роли для тёмного режима:', t.path); continue; }
    if (t.alias) {
      const target = made.get(t.alias);
      if (!target) { console.warn('нет примитива для', t.path, '→', t.alias); continue; }
      v.setValueForMode(darkMode.modeId, figma.variables.createVariableAlias(target));
    } else {
      v.setValueForMode(darkMode.modeId, t.value);
    }
    darkSet += 1;
  }

  // тени и размытие переменными не держатся — заводим стилями
  const styles = await figma.getLocalEffectStylesAsync();
  for (const e of EFFECTS) {
    const name = 'shadow/' + e.name;
    const style = styles.find((s) => s.name === name) || figma.createEffectStyle();
    style.name = name;
    style.description = '--' + e.name + ': ' + e.value;
  }

  figma.notify(
    'Перенесено: ' + PRIMITIVE.length + ' примитивов, ' + SEMANTIC.length +
    ' ролей (из них ссылками ' + aliased + '), тёмных значений ' + darkSet +
    ', стилей теней ' + EFFECTS.length
  );
}

run();
`;
writeFileSync(join(ROOT, 'figma/import-variables.js'), code, 'utf8');

// ── 3. машинный набор для короткого скрипта ──────────────────────────
// Тот же состав, но без кода: его забирает по ссылке figma/import-from-url.js,
// чтобы в плагин нужно было вставить два десятка строк, а не тысячу
writeFileSync(join(ROOT, 'figma/variables.json'),
  `${JSON.stringify({ primitive: primEntries, semantic: semEntries, semanticDark: darkEntries, effects: EFFECT_LIST, gradients: GRADIENT_LIST }, null, 2)}
`, 'utf8');

console.log(
  `figma/tokens.json: примитивов ${prim.length}, ролей ${sem.length}, тёмных переопределений ${darkList.length}\n` +
  `figma/import-variables.js: переменных ${primEntries.length + semEntries.length}, ` +
  `из них ссылками ${semEntries.filter((t) => t.alias).length}`
);
