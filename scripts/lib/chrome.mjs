// Полоса разделов проекта — служебная навигация страниц, которые лежат
// вне sections/: макеты вайрфреймов и экраны концепта.
//
// Номера, а не имена: рядом с полосой стоит дерево страниц этого раздела,
// и два полных дерева подряд человек не читает. Имя остаётся в title
// и aria-label. Готовые разделы перечислены здесь одним списком, чтобы
// полоса не отставала от сайта, когда готовым становится следующий.

const SECTIONS = [
  { n: '01', href: 'research/research.html', title: 'Ресерч и бенчмарк' },
  { n: '02', href: 'research/persones.html', title: 'Персоны и JTBD' },
  { n: '03', href: 'sections/ia.html', title: 'Информационная архитектура' },
  { n: '04', href: 'sections/wireframes.html#wireframes', title: 'Прототипирование и вайрфрейминг' },
  { n: '05', href: 'sections/voice.html', title: 'Tone of voice и микрокопи' },
  { n: '06', href: 'sections/concept.html#screens', title: 'Концепт' },
];

// prefix — путь до корня сайта от страницы: '../' для wireframes/, '../../' для concept/screens/
export function rail({ prefix, current }) {
  const items = SECTIONS.map((s) => {
    const cur = s.n === current;
    return `  <a${cur ? ' class="now" aria-current="page"' : ''} href="${prefix}${s.href}" aria-label="Раздел ${s.n} — ${s.title}" title="${s.title}">${s.n}</a>`;
  }).join('\n');
  return `<nav class="wfrail" aria-label="Разделы проекта">
  <a class="home" href="${prefix}sections/index.html" aria-label="MeetMates — все разделы">MM</a>
${items}
</nav>`;
}
