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

export function deviceBar() {
  const items = DEVICES.map(([id, title]) => `    <button type="button" data-w="${id}" aria-pressed="${id === 'mobile'}" title="${title}">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">${SHAPES[id]}</svg>
      <span class="vh">${title}</span>
    </button>`).join('\n');
  return `<nav class="wfdev" aria-label="Ширина экрана">
${items}
</nav>`;
}

// ── скрипт: выбор ширины ──────────────────────────────────────────────
// Выбор держится между страницами — состояния экрана лежат по соседним
// адресам, и терять ширину на каждом переходе нельзя. В голом виде (#bare)
// скрипт молчит: превью в галерее всегда 390px, иначе масштаб едет.
export function deviceJs() {
  return `<script>
(function () {
  if (location.hash === '#bare') return;
  var root = document.documentElement;
  var KEY = 'mm-screen-width';
  function set(w) {
    root.dataset.w = w;
    document.querySelectorAll('.wfdev button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.w === w));
    });
    try { localStorage.setItem(KEY, w); } catch (e) {}
  }
  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  set(saved || 'mobile');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.wfdev button');
    if (b) set(b.dataset.w);
  });
})();
</script>`;
}
