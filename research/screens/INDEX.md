# Индекс скриншотов

Снято 2026-09-07 в мобильном вьюпорте **390 × 844** (наш базовый макет), Playwright.
Разбор — в [`../competitor-analysis.md`](../competitor-analysis.md).

Экраны, закрытые логином или недоступные из веба, помечены **«доступ ограничен»**
в подписи и суффиксом `--dostup-ogranichen` в имени файла.

| Файл | Продукт | Что на экране |
|---|---|---|
| `ami--landing--01-hero.png` | AMI | Первый экран лендинга: позиционирование и вход в Telegram-бот |
| `ami--landing--02-full.png` | AMI | Лендинг целиком: два режима (романтика / дружба), совместимость, «без прихованих платежів» |
| `ami--app--03-telegram-gate--dostup-ogranichen.png` | AMI | **Доступ ограничен.** Продукт живёт как Telegram mini-app; из веба доступна только страница бота, сам интерфейс подбора закрыт авторизацией Telegram |
| `tinder--landing--01-hero.png` | Tinder | Первый экран: «It starts with a swipe.™» — механика вынесена в главный слоган |
| `tinder--app--02-recs-login-wall--dostup-ogranichen.png` | Tinder | **Доступ ограничен.** `/app/recs` без сессии редиректит на лендинг; колода свайпов недоступна |
| `karabas--events--01-feed.png` | Karabas | Первый экран афиши: баннер, заголовок «Афіша подій 2026 в Україні» |
| `karabas--events--02-feed-full.png` | Karabas | Лента целиком: карточки событий по категориям, участники нигде не показаны |
| `bumble-bff--landing--01-hero.png` | Bumble For Friends | Первый экран: «Find your people with Bumble For Friends», только App Store / Google Play |
| `bumble-bff--landing--02-full.png` | Bumble For Friends | Лендинг целиком: «There are friends for every era. Even your messy ones.», интент-чипы, The Friendship Hub |
| `bumble-bff--app--03-store-screens.png` | Bumble For Friends | Карточка Google Play: витринные экраны приложения, «Contains ads · In-app purchases», 1M+ загрузок. Сам продукт в Украине недоступен — внутренние экраны иначе **доступ ограничен** |
| `meetup--landing--01-hero.png` | Meetup | Первый экран: «The people platform. Where interests become friendships.» |
| `meetup--events--02-kyiv-feed.png` | Meetup | Лента «Events near Kyiv, UA»: фильтры, карточка с аватарами и счётчиком «6 attendees» |

## Замечания к съёмке

- Cookie-баннеры на Tinder, Bumble, Meetup и Karabas закрывают первый экран целиком.
  Скрины сняты после отклонения баннера — кроме `karabas--events--02-feed-full.png`,
  где баннер виден в верхней части: это честная картина первого визита.
- `tinder--landing--01-hero.png` и `tinder--app--02-...` визуально совпадают — это и есть результат:
  Tinder не показывает неавторизованному пользователю ничего, кроме лендинга.
- Внутренние экраны AMI, Tinder и Bumble For Friends недоступны без регистрации.
  Для BFF частично заменены витринными скриншотами из Google Play.
