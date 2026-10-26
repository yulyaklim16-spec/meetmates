// Две вкладки раздела подпунктами в дереве слева.
//
// Один источник на все разделы, у которых материал не помещается в одну ленту:
// раздел 04 (информация и макеты), раздел 05 (голос и перепись). Подпункты стоят
// под текущим разделом в дереве — выбор раздела и выбор того, что внутри него,
// в одном месте. Нажат любой — дерево сжимается до номеров, потому что выбор
// уже сделан и место нужно содержимому; вернуть дерево целиком — нажать на номер.
//
// Без скрипта это обычные якоря: видны оба блока, ссылки ведут к своим заголовкам.

// Разметка подпунктов. Вставляется внутрь пункта текущего раздела в боковом дереве.
// items: [{ id, title }] — id служит и якорем, и идентификатором панели.
export function subtabsHtml(items, indent = '        ') {
  // Подпункт с href ведёт наружу, на отдельную страницу: так устроены «Вайрфреймы»
  // и «Экраны» — они открывают сам макет, а не панель внутри раздела. Скрипт
  // вкладок такие пункты не трогает: у них нет data-tab.
  const rows = items.map((it, i) =>
    it.href
      ? `${indent}  <a href="${it.href}">${it.title}</a>`
      : `${indent}  <a href="#${it.id}" data-tab="${it.id}"${i === 0 ? ' aria-current="true"' : ''}>${it.title}</a>`).join('\n');
  return `
${indent}<nav class="subtabs" aria-label="Что показывать в разделе">
${rows}
${indent}</nav>`;
}

// Подпункты как места в одной ленте, а не как вкладки.
//
// Разделы 07 и 08 показывают один набор по частям, и части идут подряд: блок
// цвета, за ним геометрия, за ней семантика. Прятать соседние незачем — читают
// их всё равно подряд, а подпункт отвечает на вопрос «где я сейчас» и «куда
// перейти». Поэтому здесь обычные якоря плюс отметка текущего по тому,
// что видно на экране. Без скрипта работают и якоря, и сама страница.
export function anchorsHtml(items, indent = '        ') {
  const rows = items.map((it, i) =>
    `${indent}  <a href="#${it.id}" data-spy="${it.id}"${i === 0 ? ' aria-current="true"' : ''}>${it.title}</a>`).join('\n');
  return `
${indent}<nav class="subtabs" aria-label="Части раздела">
${rows}
${indent}</nav>`;
}

// Отметка текущей части. Берёт верхнюю из видимых: окно почти всегда захватывает
// две, и без порядка отметка прыгала бы между ними при каждом пикселе прокрутки.
export function spyJs(ids) {
  return `
<script>
(function () {
  var ids = ${JSON.stringify(ids)};
  var links = {};
  var all = document.querySelectorAll('.subtabs a[data-spy]');
  for (var i = 0; i < all.length; i++) links[all[i].getAttribute('data-spy')] = all[i];
  function mark(id) {
    for (var k in links) {
      if (k === id) links[k].setAttribute('aria-current', 'true');
      else links[k].removeAttribute('aria-current');
    }
  }
  if (!('IntersectionObserver' in window)) return;
  var seen = {};
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) seen[entries[j].target.id] = entries[j].isIntersecting;
    for (var k = 0; k < ids.length; k++) if (seen[ids[k]]) { mark(ids[k]); return; }
  }, { rootMargin: '-8% 0px -72% 0px' });
  for (var n = 0; n < ids.length; n++) {
    var el = document.getElementById(ids[n]);
    if (el) io.observe(el);
  }
  // Последний блок короче окна и в полосу наблюдения целиком не попадает:
  // докрутив страницу до конца, человек видел отметку на предпоследнем.
  window.addEventListener('scroll', function () {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) mark(ids[ids.length - 1]);
  }, { passive: true });
})();
</script>`;
}

// Общие стили: скрытый заголовок, сами подпункты и сжатая полоса разделов.
// Колонки сжатого вида задаёт страница: у раздела 04 рядом встаёт второе дерево,
// у остальных — только содержимое.
export const TABS_CSS = `
.vh { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* ── Что показывать в разделе: подпункты в самом дереве ───── */
.subtabs { display: flex; flex-direction: column; gap: 1px; margin: var(--s-2) 0 var(--s-4) 30px; padding-left: var(--s-3); border-left: 1px solid var(--line); }
.subtabs a { position: relative; padding: var(--s-2) var(--s-3); border-radius: var(--r-sm); font-size: var(--t-caption); color: var(--ink-600); text-decoration: none; transition: background var(--dur-fast) var(--ease-out); }
.subtabs a:hover { background: var(--surface-2); color: var(--ink-900); }
.subtabs a:focus-visible { outline: 2px solid var(--brand-a); outline-offset: -2px; }
/* Выбранный подпункт — жирный и с точкой слева, а не залитый: заливка занята
   самим разделом, и два залитых пятна в колонке спорят друг с другом */
.subtabs a[aria-current="true"] { color: var(--ink-900); font-weight: var(--fw-bold); }
.subtabs a[aria-current="true"]::before {
  content: ""; position: absolute; left: calc(var(--s-3) * -1 - 1px); top: 50%;
  width: 5px; height: 5px; margin-top: -2px; border-radius: 50%; background: var(--ink-900);
}

/* Нажат любой подпункт — разделы сжимаются до номеров.
   Сами подпункты остаются: иначе, нажав первый, человек в нём запрётся */
.shell[data-collapsed] { grid-template-columns: 124px minmax(0, 1fr); gap: var(--s-5); }
.shell[data-collapsed] .side .stage,
.shell[data-collapsed] .side .lbl,
.shell[data-collapsed] .side .brand b,
.shell[data-collapsed] .side .mat .t { display: none; }
.shell[data-collapsed] .side .brand { justify-content: center; margin-bottom: var(--s-5); }
.shell[data-collapsed] .side .mat { justify-content: center; padding: var(--s-3) 0; }
.shell[data-collapsed] .side .mat .n { font-size: var(--t-caption); min-width: 0; }
.shell[data-collapsed] .side .mat.current .n { color: var(--ink-900); font-weight: var(--fw-medium); }
.shell[data-collapsed] .side .subtabs { margin-left: 0; padding-left: var(--s-2); border-left-color: var(--line); }
.shell[data-collapsed] .side .subtabs a { font-size: var(--t-micro); padding: var(--s-2); }
@media (max-width: 900px) {
  .shell[data-collapsed] { grid-template-columns: minmax(0, 1fr); }
}`;

// Скрипт переключения. ids — те же, что у панелей и якорей; первый открыт по умолчанию.
export function tabsJs(ids) {
  return `
<script>
// Подпункты текущего раздела в дереве. Нажат любой — дерево сжимается до номеров,
// вернуть его целиком можно нажатием на сам номер раздела. Без скрипта — якоря.
(function () {
  var ids = ${JSON.stringify(ids)};
  var shell = document.querySelector('.shell');
  var subtabs = document.querySelector('.subtabs');
  if (!shell || !subtabs) return;
  var panels = {};
  for (var i = 0; i < ids.length; i++) panels[ids[i]] = document.getElementById(ids[i]);
  var links = subtabs.querySelectorAll('a[data-tab]');

  function show(name, collapsed, push) {
    shell.setAttribute('data-tab', name);
    if (collapsed) shell.setAttribute('data-collapsed', '');
    else shell.removeAttribute('data-collapsed');
    for (var k in panels) if (panels[k]) panels[k].hidden = (k !== name);
    for (var j = 0; j < links.length; j++) {
      if (links[j].getAttribute('data-tab') === name) links[j].setAttribute('aria-current', 'true');
      else links[j].removeAttribute('aria-current');
    }
    if (push) history.replaceState(null, '', '#' + name);
  }

  subtabs.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-tab]');
    if (!a) return;
    e.preventDefault();
    show(a.getAttribute('data-tab'), true, true);
  });

  // номер раздела возвращает дерево целиком, не трогая показанное
  var cur = document.querySelector('.side .mat.current');
  if (cur) cur.addEventListener('click', function (e) {
    if (shell.hasAttribute('data-collapsed')) {
      e.preventDefault();
      show(shell.getAttribute('data-tab'), false, false);
    }
  });

  // переход по якорю внутри той же страницы (и кнопки «назад»/«вперёд»)
  // не перезагружает её — вкладку переключаем сами
  window.addEventListener('hashchange', function () {
    var n = location.hash.slice(1);
    if (ids.indexOf(n) > -1) show(n, true, false);
  });

  var h = location.hash.slice(1);
  var known = ids.indexOf(h) > -1;
  show(known ? h : ids[0], known, false);
})();
</script>`;
}
