# wireframes

Низкодетализированные экраны: структура, иерархия, логика переходов. **Без цвета и без фото.**
Задача этапа — доказать, что флоу работает, до того как в него вложен визуал.

## Правила

- Оттенки серого, одна гарнитура, блоки-плейсхолдеры вместо изображений.
- Показываем реальные тексты кнопок и заголовков (на английском) — они часть проектирования.
- Каждый экран рисуется в трёх состояниях: **обычное · пустое · загрузка/ошибка**.
  Пустые состояния для MeetMates критичны: пустая колода и пустая лента событий — это норма на старте.
- Базовая ширина 390px. Отмечать, что попадает на первый экран без скролла.

## Что покрываем

Полный список экранов — в [`../CLAUDE.md`](../CLAUDE.md), §6.

Порядок работы — по пяти ключевым флоу, а не по отдельным экранам:

1. **First run** — Splash → онбординг → первая колода
2. **Swipe → Match → Chat**
3. **Join event** — лента → карточка события → Join → групповой чат
4. **Create event** — два шага
5. **Safety** — Report → причина → Block

## Именование

```
<flow>--<step>-<screen>.png
01-first-run--03-interests.png
02-match--02-match-modal.png
```

## Статус

| Флоу | Экраны | Статус |
|---|---|---|
| First run | Splash · Sign in · Age gate · Profile setup · Interests · Location · Verification | TBD |
| Swipe → Match → Chat | Deck · Filters · Profile detail · Match modal · Empty deck · Conversation | TBD |
| Join event | Feed · Event detail · Group chat · Empty feed | TBD |
| Create event | Step 1 · Step 2 · My events | TBD |
| Safety | Report sheet · Block confirm · Safety center · Blocked users | TBD |
