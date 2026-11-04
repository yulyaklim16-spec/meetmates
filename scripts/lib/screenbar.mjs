// Полоса над мокапом: слева состояния экрана, справа ширина устройства.
//
// Один источник на оба набора — серые вайрфреймы и окрашенные экраны концепта.
// Разметка общая, цвета разные: каждый набор красит её своими токенами.
//
// Состояния переехали сюда из дерева: в дереве они раздували список втрое,
// а сравнивают состояния друг с другом, стоя на одном экране.

// ── переключатель ширины ──────────────────────────────────────────────
// Иконки рисуются здесь, а не берутся из набора продукта: это обвязка
// страницы макета, а не интерфейс. Три фигуры — телефон, планшет, монитор.
const SHAPES = {
  mobile: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M10.5 18.5h3"/>',
  tablet: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M10.5 17.8h3"/>',
  desktop: '<rect x="2" y="4" width="20" height="13" rx="2.5"/><path d="M9 20.5h6M12 17.5v3"/>',
};

const DEVICES = [
  ['mobile', 'Телефон, 390px — базовый макет'],
  ['tablet', 'Планшет, 834px'],
  ['desktop', 'Десктоп, 1280px'],
];

// ── вайрфрейм или дизайн ──────────────────────────────────────────────
// Один экран живёт в двух наборах: серая раскладка и окрашенная. Переключатель
// ведёт в тот же экран соседнего набора, а не в список — сравнивают их, стоя
// на одном месте.
export function kindBar(kind, name) {
  const wire = kind === 'wireframe'
    ? '<b aria-current="page">Wireframe</b>'
    : `<a href="../../wireframes/${name}.html">Wireframe</a>`;
  const design = kind === 'design'
    ? '<b aria-current="page">Design</b>'
    : `<a href="../concept/screens/${name}.html">Design</a>`;
  return `<nav class="wfkind" aria-label="Набор: вайрфрейм или дизайн">
  ${wire}
  ${design}
</nav>`;
}

export function deviceBar() {
  const items = DEVICES.map(([id, title]) => `    <button type="button" data-w="${id}" aria-pressed="${id === 'mobile'}" title="${title}">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">${SHAPES[id]}</svg>
      <span class="vh">${title}</span>
    </button>`).join('\n');
  return `<nav class="wfdev" aria-label="Ширина экрана">
${items}
</nav>`;
}

// ── переключатель темы ───────────────────────────────────────────
// Стоит рядом с шириной: и то и другое — условия показа, а не продукт.
// Тёмная тема принята `D-84`, и переключать её можно только здесь:
// кнопка ставит data-theme на корень, а дальше работает семантика
// в tokens.css — ни одного правила в components/ она не трогает.
export function themeBar() {
  return `<nav class="wfdev wftheme" aria-label="Тема">
    <button type="button" data-theme-set="light" aria-pressed="true">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/></svg>
      <span class="vh">Светлая тема</span>
    </button>
    <button type="button" data-theme-set="dark" aria-pressed="false">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>
      <span class="vh">Тёмная тема</span>
    </button>
</nav>`;
}

// Тот же переключатель без выбора ширины: витрина и оболочка не меняют
// ширину, а тему показывать обязаны — иначе тёмный вид компонента негде
// увидеть целиком. Ключ общий со страницами макетов: выбрал тему на экране —
// она же стоит в витрине.
export function themeJs() {
  return `<script>
(function () {
  var root = document.documentElement;
  var KEY = 'mm-theme';
  function theme(t) {
    if (t === 'dark') root.dataset.theme = 'dark';
    else root.removeAttribute('data-theme');
    document.querySelectorAll('.wftheme button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.themeSet === t));
    });
    try { localStorage.setItem(KEY, t); } catch (e) {}
  }
  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  theme(saved === 'dark' ? 'dark' : 'light');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.wftheme button');
    if (b) theme(b.dataset.themeSet);
  });
})();
</script>`;
}

// ── скрипт: выбор ширины ──────────────────────────────────────────────
// Выбор держится между страницами — состояния экрана лежат по соседним
// адресам, и терять ширину на каждом переходе нельзя. В голом виде (#bare)
// скрипт молчит: превью в галерее всегда 390px, иначе масштаб едет.
export function deviceJs() {
  return `<script>
(function () {
  var root = document.documentElement;
  // Ширину можно назвать адресом: ?w=tablet. Нужно разделу 10 — он
  // показывает те же страницы рамкой, и выбор посетителя в localStorage
  // не должен решать, что ему там покажут. Адрес сильнее памяти и её
  // не переписывает.
  var forced = (location.search.match(/[?&]w=(mobile|tablet|desktop)/) || [])[1];
  if (location.hash === '#bare') {
    if (forced) root.dataset.w = forced;
    return;
  }
  var KEY = 'mm-screen-width';
  // Группа кнопок темы несёт тот же класс .wfdev, что и группа ширины, —
  // у них общий вид. Поэтому и слушатель, и перебор aria-pressed ходят
  // только по кнопкам с data-w: иначе клик по «Dark» ставил ширину
  // undefined, устройство схлопывалось до телефона, а значение ещё и
  // запоминалось — «слёт» переживал переходы между страницами. Допустимые
  // значения названы явно, чтобы испорченное запомненное тоже не проходило.
  var WIDTHS = /^(mobile|tablet|desktop)$/;
  var SEL = '.wfdev button[data-w]';
  function press(w) {
    document.querySelectorAll(SEL).forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.w === w));
    });
  }
  function set(w) {
    if (!WIDTHS.test(w)) return;
    root.dataset.w = w;
    press(w);
    try { localStorage.setItem(KEY, w); } catch (e) {}
  }
  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (forced) { root.dataset.w = forced; press(forced); }
  else set(WIDTHS.test(saved || '') ? saved : 'mobile');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest(SEL);
    if (b) set(b.dataset.w);
  });
})();
</script>`;
}
