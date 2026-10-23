// MeetMates → Figma, короткий путь: токены забираются по ссылке.
// Вставить целиком в Scripter (Plugins → Scripter) и нажать Run.
// Создаёт коллекции Primitive и Semantic; роли встают ссылками на примитивы.
// Повторный запуск обновляет, а не плодит дубли.

const URL_TOKENS = 'https://raw.githubusercontent.com/yulyaklim16-spec/meetmates/main/figma/variables.json';

const data = await (await fetch(URL_TOKENS)).json();

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const pick = (n) => cols.find((c) => c.name === n) || figma.variables.createVariableCollection(n);
const primCol = pick('Primitive');
const semCol = pick('Semantic');

const had = await figma.variables.getLocalVariablesAsync();
const key = (col, path) => col.id + '|' + path;
const byName = new Map(had.map((v) => [key({ id: v.variableCollectionId }, v.name), v]));
const ensure = (col, path, type) => byName.get(key(col, path)) || figma.variables.createVariable(path, col, type);

const made = new Map();
for (const t of data.primitive) {
  const v = ensure(primCol, t.path, t.type);
  v.setValueForMode(primCol.modes[0].modeId, t.value);
  v.description = '--' + t.css;
  made.set(t.path, v);
}

let links = 0;
for (const t of data.semantic) {
  if (t.alias) {
    const target = made.get(t.alias);
    if (!target) continue;
    const v = ensure(semCol, t.path, target.resolvedType);
    v.setValueForMode(semCol.modes[0].modeId, figma.variables.createVariableAlias(target));
    v.description = '--' + t.css + ' → --' + t.alias.split('/').pop();
    links += 1;
  } else {
    const v = ensure(semCol, t.path, 'STRING');
    v.setValueForMode(semCol.modes[0].modeId, t.value);
    v.description = '--' + t.css;
  }
}

figma.notify(
  'Перенесено: ' + data.primitive.length + ' примитивов, ' +
  data.semantic.length + ' ролей, из них ссылками ' + links
);
