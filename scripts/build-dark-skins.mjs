// Доска тёмных обликов — concept/dark-skins.html.
//
// Пять наборов значений для тёмной темы на одном и том же экране. Доска
// нужна ровно для выбора: принятый облик живёт в tokens.css блоком
// [data-theme="dark"] (`D-84`), а здесь стоят кандидаты — поэтому значения
// тут литералами. Так же устроена доска обликов concept/skins.html.
//
// Экран берётся из готовых страниц концепта, а не рисуется заново: так
// сравниваются именно цвета, а не вёрстка. Контраст каждой пары считается
// при сборке, и непроходная пара роняет её — выбирать из того, что не проходит
// AA, незачем.
//
// Запуск: node scripts/build-dark-skins.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// ── пять наборов ──────────────────────────────────────────────────────
// Доверие тема не трогает ни в одном: лайм читается на любом тёмном фоне,
// а слово на нём своими чернилами (D-80). Геометрия от темы не зависит вовсе.
const SKINS = [
  {
    id: 'ink',
    name: 'Чернила',
    idea: 'Нейтральная тушь с еле заметным фиолетовым подтоном. Фиолет остаётся только в акценте, '
      + 'фотографии и лайм выглядят ровно так, как сняты. Самый спокойный из пяти.',
    v: {
      'bg-page': '#0E0D11', 'bg-surface': '#1A1920', 'bg-nested': '#24232C',
      'bg-hover': '#2E2D38', 'bg-selected': '#3C3A48', 'bg-mine': '#2E2D38', 'bg-undelivered': '#5E2435',
      'text-primary': '#F6F5F8', 'text-muted': '#AFABB8', 'text-on-action': '#0E0D11',
      'text-on-selected': '#F6F5F8', 'text-danger': '#F59BAF', 'icon-muted': '#8C8899',
      'color-action': '#F6F5F8', 'color-action-hover': '#DCD9E4', 'color-danger': '#F59BAF',
      'border-hairline': '#35333E', 'border-focus': '#AFABB8',
    },
  },
  {
    id: 'plum',
    name: 'Сливовая ночь',
    accepted: true,
    idea: 'Тот же сливовый род, что в светлой теме, но лестницей и мягче: лист, карточка и вложенное '
      + 'идут тремя различимыми ступенями одного тона. Обводок нет вовсе — карточку отделяет то, '
      + 'что она светлее листа, а вторичное действие стоит ступенью выше карточки. '
      + 'Ступени крупные: от листа до наведения пять различимых шагов.',
    v: {
      'bg-page': '#0F0B18', 'bg-surface': '#342B52', 'bg-nested': '#1E1733',
      'bg-secondary': '#473B6E',
      'bg-hover': '#5A4C8A', 'bg-selected': '#C9BBE2', 'bg-mine': '#473B6E', 'bg-undelivered': '#5C2338',
      'text-primary': '#F2EDF6', 'text-muted': '#D3CAE4', 'text-on-action': '#0F0B18',
      'text-on-selected': '#1A1026', 'text-danger': '#FBC2CE', 'icon-muted': '#8C7E9B',
      'color-action': '#F2EDF6', 'color-action-hover': '#E0D6EE', 'color-danger': '#FBC2CE',
      'border-hairline': '#0F0B18', 'border-focus': '#D3CAE4',
    },
  },
  {
    id: 'lilac',
    name: 'Сирень на угле',
    idea: 'Карточка заметно выше листа, действие — светлая сирень вместо белого. Самый «сиреневый» '
      + 'из пяти и самый мягкий по контрасту кнопки.',
    v: {
      'bg-page': '#171320', 'bg-surface': '#241E33', 'bg-nested': '#2F2842',
      'bg-hover': '#3B3253', 'bg-selected': '#B9A8D6', 'bg-mine': '#3B3253', 'bg-undelivered': '#632A3F',
      'text-primary': '#FFFFFF', 'text-muted': '#C8BEDA', 'text-on-action': '#171320',
      'text-on-selected': '#171320', 'text-danger': '#F7A8BA', 'icon-muted': '#9A90AE',
      'color-action': '#E0D6EE', 'color-action-hover': '#CDBFE4', 'color-danger': '#F7A8BA',
      'border-hairline': '#3E3657', 'border-focus': '#C8BEDA',
    },
  },
  {
    id: 'indigo',
    name: 'Полночный индиго',
    idea: 'Синий вместо фиолетового: холодный лист, холодная карточка. Лайм доверия на синем '
      + 'звучит громче всего — это и плюс, и цена.',
    v: {
      'bg-page': '#0B1020', 'bg-surface': '#151B30', 'bg-nested': '#1E2540',
      'bg-hover': '#283151', 'bg-selected': '#A8B6E0', 'bg-mine': '#283151', 'bg-undelivered': '#5A2440',
      'text-primary': '#EEF2FC', 'text-muted': '#AAB4D0', 'text-on-action': '#0B1020',
      'text-on-selected': '#0B1020', 'text-danger': '#FFA3B5', 'icon-muted': '#8792B3',
      'color-action': '#EEF2FC', 'color-action-hover': '#D5DCF0', 'color-danger': '#FFA3B5',
      'border-hairline': '#2E3759', 'border-focus': '#AAB4D0',
    },
  },
  {
    id: 'warm',
    name: 'Тёплый уголь',
    idea: 'Нейтрально-тёплый: лист уходит в коричневый, а не в синий. Кожа на фотографиях '
      + 'не синеет, лайм садится спокойнее всего. Фиолетового в теме не остаётся вовсе.',
    v: {
      'bg-page': '#121110', 'bg-surface': '#1D1B19', 'bg-nested': '#272421',
      'bg-hover': '#322E2A', 'bg-selected': '#443E37', 'bg-mine': '#322E2A', 'bg-undelivered': '#5C2B2B',
      'text-primary': '#F7F3EE', 'text-muted': '#B6AEA3', 'text-on-action': '#121110',
      'text-on-selected': '#F7F3EE', 'text-danger': '#F6A6AE', 'icon-muted': '#938B80',
      'color-action': '#F7F3EE', 'color-action-hover': '#E2DBD1', 'color-danger': '#F6A6AE',
      'border-hairline': '#3A3530', 'border-focus': '#B6AEA3',
    },
  },
];

// Доверие у всех одно и то же: лайм и тёмные чернила на нём
const VERIFIED = '#D9F56F';
const ON_VERIFIED = '#1A1026';

// ── контраст: те же пары, что проверяет раздел 08 ─────────────────────
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const fmt = (n) => n.toFixed(2).replace('.', ',');

// [что, чем пишем, на чём, порог]
const PAIRS = [
  ['Основной текст на экране', 'text-primary', 'bg-page', 4.5],
  ['Основной текст на карточке', 'text-primary', 'bg-surface', 4.5],
  ['Основной текст под курсором', 'text-primary', 'bg-hover', 4.5],
  ['Вторичный текст на карточке', 'text-muted', 'bg-surface', 4.5],
  ['Вторичный текст на вложенном', 'text-muted', 'bg-nested', 4.5],
  ['Вторичный текст под курсором', 'text-muted', 'bg-hover', 4.5],
  ['Слово на кнопке действия', 'text-on-action', 'color-action', 4.5],
  ['Слово на наведённой кнопке', 'text-on-action', 'color-action-hover', 4.5],
  ['Подпись выбранной вкладки', 'text-on-selected', 'bg-selected', 4.5],
  ['Своя реплика в диалоге', 'text-primary', 'bg-mine', 4.5],
  ['Реплика, которая не ушла', 'text-primary', 'bg-undelivered', 4.5],
  ['Опасное словом на карточке', 'text-danger', 'bg-surface', 4.5],
  ['Опасное словом под курсором', 'text-danger', 'bg-hover', 4.5],
  ['Иконка на экране', 'icon-muted', 'bg-page', 3],
  ['Иконка на карточке', 'icon-muted', 'bg-surface', 3],
  ['Иконка на вложенном', 'icon-muted', 'bg-nested', 3],
  ['Кольцо фокуса на вложенном', 'border-focus', 'bg-nested', 3],

];

const measured = SKINS.map((s) => {
  const rows = PAIRS.map(([what, fg, bg, min]) => {
    const f = s.v[fg]; const b = s.v[bg];
    const r = ratio(f, b);
    return { what, fg, bg, f, b, r, min, ok: r >= min };
  });
  // доверие — общая пара: показываем её, но она у всех одинаковая
  rows.push({ what: 'Слово на лейбе Verified', fg: 'text-on-verified', bg: 'color-verified',
    f: ON_VERIFIED, b: VERIFIED, r: ratio(ON_VERIFIED, VERIFIED), min: 4.5, ok: true });
  return { ...s, rows };
});

const bad = measured.flatMap((s) => s.rows.filter((r) => !r.ok).map((r) => `${s.name}: ${r.what} — ${fmt(r.r)}:1 < ${r.min}:1`));
if (bad.length) {
  console.error('Пары ниже порога — такой облик выбирать не из чего:\n  ' + bad.join('\n  '));
  process.exit(1);
}

// ── экран из готовой страницы концепта ────────────────────────────────
// Берём внутренность .mm-screen и снимаем с неё обвязку стенда: системные
// полосы и подписи зон — страница макета, а не продукт, и к выбору цвета
// отношения не имеют.
const screenOf = (file) => {
  const html = read(`concept/screens/${file}`);
  const open = html.indexOf('<div class="mm-screen">');
  if (open === -1) throw new Error(`в ${file} нет .mm-screen — разметка экрана изменилась`);
  let i = html.indexOf('>', open) + 1;
  let depth = 1;
  const start = i;
  while (depth && i < html.length) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) { depth += 1; i = nextOpen + 4; }
    else { depth -= 1; i = nextClose + 6; }
  }
  return html.slice(start, i - 6)
    .replace(/<div class="anns">[\s\S]*?<\/div>\s*<\/div>/, '')
    .replace(/<div class="anns">[\s\S]*?<\/div>\s*(?=<!--)/, '')
    .replace(/<p class="statusbar">[\s\S]*?<\/p>/g, '')
    .replace(/<p class="browserbar">[\s\S]*?<\/p>/g, '')
    .replace(/<div class="homebar">[\s\S]*?<\/div>/g, '')
    .replace(/<p class="fold">[\s\S]*?<\/p>/g, '')
    // снимки лежат в concept/img/: со страницы экрана путь идёт на уровень вверх,
    // с доски — нет, она сама лежит в concept/
    .replace(/(src|srcset)="\.\.\/img\//g, '$1="img/')
    .replace(/, \.\.\/img\//g, ', img/')
    .trim();
};

const SCREENS = [
  { file: 'deck.html', title: 'Колода' },
  { file: 'feed.html', title: 'Лента событий' },
];
const bodies = SCREENS.map((s) => ({ ...s, html: screenOf(s.file) }));

// ── страница ──────────────────────────────────────────────────────────
const vars = (s) => Object.entries(s.v).map(([k, v]) => `  --${k}: ${v};`).join('\n');

const skinCss = measured.map((s) => `[data-skin="${s.id}"] {
${vars(s)}
  --bg-page-wash: none;
  --color-verified: ${VERIFIED};
  --text-on-verified: ${ON_VERIFIED};
}`).join('\n\n');

const table = (s) => `<table class="ct">
  <thead><tr><th>Пара</th><th>Порог</th><th>Проверка</th></tr></thead>
  <tbody>
${s.rows.map((r) => `    <tr><td>${r.what}</td><td class="n">${String(r.min).replace('.', ',')}:1</td>` +
  `<td class="n"><span class="sw" style="color:${r.f};background:${r.b}">Aa</span> <b>${fmt(r.r)}:1</b></td></tr>`).join('\n')}
  </tbody>
</table>`;

const columns = measured.map((s) => `  <section class="skin" data-skin="${s.id}" id="${s.id}">
    <header class="skin-head">
      <h2>${s.name}${s.accepted ? ' <i class="ok">принят</i>' : ''}</h2>
      <p class="idea">${s.idea}</p>
      <p class="keys">${['bg-page', 'bg-surface', 'bg-nested', 'color-action'].map((k) =>
        `<span><i style="background:${s.v[k]}"></i>${s.v[k]}</span>`).join('')}</p>
    </header>
${bodies.map((b) => `    <figure class="shot">
      <div class="mm mm-screen">
${b.html}
      </div>
      <figcaption>${b.title}</figcaption>
    </figure>`).join('\n')}
    <details class="ct-wrap">
      <summary>Контраст: ${s.rows.length} пар, все проходят</summary>
${table(s)}
    </details>
  </section>`).join('\n\n');

const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Тёмные облики · MeetMates</title>
<meta name="description" content="Пять наборов значений для тёмной темы на одном экране: выбор облика до того, как он станет токенами.">
<!--
  СГЕНЕРИРОВАНО scripts/build-dark-skins.mjs — руками не править.
  Доска для выбора: пять тёмных обликов на одном и том же экране.
  Принятый облик уезжает в tokens.css блоком [data-theme="dark"],
  остальные остаются здесь — как снятое направление на concept/skins.html.
-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../components/index.css">
<style>
  /* обвязка доски: к продукту не относится */
  body { margin: 0; padding: 32px; background: #15131A; color: #EDEAF2;
    font: 400 14px/1.55 "Figtree", -apple-system, sans-serif; }
  .top { max-width: 76ch; margin: 0 0 28px; }
  .top h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: -.03em; }
  .top p { margin: 0 0 6px; color: #ADA6BC; }
  .top code { font-family: ui-monospace, monospace; font-size: 12px; }
  .board { display: flex; gap: 24px; align-items: flex-start; overflow-x: auto; padding-bottom: 24px; }
  .skin { flex: none; width: 390px; }
  .skin-head { margin: 0 0 16px; }
  .skin-head h2 { margin: 0 0 6px; font-size: 20px; letter-spacing: -.02em; }
  /* принятый облик помечен: доска остаётся журналом выбора, а не черновиком */
  .skin-head h2 .ok { font-style: normal; font-size: 11px; font-weight: 600; letter-spacing: 0;
    vertical-align: 4px; padding: 3px 8px; border-radius: 999px; background: #D9F56F; color: #1A1026; }
  [data-skin]:not([data-skin="plum"]) .shot { opacity: .72; }
  .idea { margin: 0 0 10px; font-size: 13px; line-height: 1.5; color: #ADA6BC; }
  .keys { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; font: 11px/1 ui-monospace, monospace; color: #ADA6BC; }
  .keys span { display: inline-flex; align-items: center; gap: 6px; }
  .keys i { width: 14px; height: 14px; border-radius: 4px; border: 1px solid #332F3D; }
  .shot { margin: 0 0 16px; }
  /* Экран стоит в рамке без мокапа телефона: сравниваются цвета, а не корпус */
  .shot .mm-screen { border-radius: 26px; box-shadow: 0 0 0 1px #332F3D, 0 10px 30px rgba(0, 0, 0, .45); }
  .shot figcaption { margin-top: 8px; font-size: 12px; color: #8E87A0; }
  .ct-wrap { border-top: 1px solid #2A2733; padding-top: 10px; }
  .ct-wrap summary { cursor: pointer; font-size: 12px; color: #ADA6BC; }
  .ct { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
  .ct th { text-align: left; font-weight: 600; color: #8E87A0; padding: 4px 6px; border-bottom: 1px solid #2A2733; }
  .ct td { padding: 4px 6px; border-bottom: 1px solid #2A2733; }
  .ct .n { text-align: right; white-space: nowrap; }
  .sw { display: inline-grid; place-items: center; width: 26px; height: 18px; border-radius: 6px; font-size: 10px; }

${skinCss}
</style>
</head>
<body>

<div class="top">
  <h1>Тёмные облики — пять наборов на выбор</h1>
  <p>Один и тот же экран пять раз. Меняются только значения тёмной темы: девятнадцать
  семантических имён, ни одного правила в <code>components/</code>. Лайм доверия
  не меняется ни в одном — он читается на любом тёмном фоне, и слово на нём своими чернилами.</p>
  <p>Контраст каждой пары посчитан при сборке; облик, у которого пара не проходит AA,
  на доску не попадает. Принятый уедет в <code>tokens.css</code>, остальные останутся здесь —
  так же, как снятое направление «Стекло» осталось на доске обликов.</p>
</div>

<div class="board">
${columns}
</div>

</body>
</html>
`;

writeFileSync(join(ROOT, 'concept/dark-skins.html'), page, 'utf8');
console.log(`concept/dark-skins.html: ${SKINS.length} обликов, ${bodies.length} экрана, ` +
  `${measured[0].rows.length} пар контраста у каждого — все проходят`);
