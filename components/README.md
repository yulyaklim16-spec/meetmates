# components

UI-компоненты MeetMates: разметка, стили и поведение. Строятся на токенах из
[`../tokens/`](../tokens/), правила использования — в [`../design-system/`](../design-system/).

## Правила

1. Компонент не знает про экран, на котором стоит. Никаких внешних отступов внутри компонента —
   расстояние между блоками задаёт экран.
2. Все значения — через переменные из `tokens.css`. Хардкод цвета, радиуса, тайминга — ошибка.
3. Каждый компонент описывает **все свои состояния**: default · hover · active · focus ·
   disabled · loading · error · empty. Отсутствующие состояния — источник багов на сборке.
4. Фокус видим всегда. Клавиатурная навигация не ломается.
5. Тач-таргет ≥ `--tap-min` (44px), даже если визуально элемент меньше.
6. Анимации уважают `prefers-reduced-motion`.
7. Текст в компонентах — на английском.

## Состав (по объёму MVP)

**Базовые**
`Button` (primary с градиентом / secondary / ghost / danger) · `IconButton` · `Tag` (пилюля
интереса, выбранная и нет) · `Avatar` (+ статус online, бейдж Verified) · `Input` · `Textarea` ·
`Toggle` · `Chip-фильтр` · `Badge` · `Counter`

**Навигация**
`TabBar` (4 таба) · `TopBar` (заголовок, назад, действие) · `BottomSheet` · `Modal`

**Продуктовые**
`SwipeCard` (фото, градиентная подложка, имя, возраст, расстояние, общие теги, лейблы LIKE/SKIP) ·
`SwipeDeck` (стек + физика драга) · `SwipeControls` (skip / like / undo) · `MatchModal` ·
`PlanCard` · `PlanDetailHeader` · `ParticipantsRow` · `RespondButton` (Ask to join / Waiting / Confirmed) ·
`SpotsCounter` (двухфазный: going → confirmed) · `WhoCanJoinPicker` (Anyone / Women only / Men only) ·
`ChatListItem` · `MessageBubble` · `IceBreakerChips` · `ReportSheet` · `VerifiedBadge` ·
`DistanceLabel` (округлённое расстояние, см. правило геоприватности)

**Состояния**
`EmptyState` (пустая колода, пустая лента запросов, пустой чат) · `Skeleton` · `ErrorState` · `Toast`

*Имена обновлены 2026-09-15 вместе с заменой единицы: событие с организатором
заменено запросом на компанию — `../CLAUDE.md` §5.4.*

## Статус

Пока не начато — компоненты собираются после утверждения концепта. `TBD`
