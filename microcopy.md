# Микрокопирайт — перепись текста интерфейса

> **Инвентарь, а не свод правил.** Здесь собран весь текст, который сейчас стоит
> на макетах `wireframes/*.html`: заголовки, кнопки, подписи полей, сообщения состояний.
> Ничего не переписано — задача переписи в том, чтобы стало видно то, чего не видно
> по одному экрану: одна и та же вещь названа в разных местах по-разному.
>
> Снято 29.09.2026 с набора **49 страниц, 13 экранов**. Пересобирается скриптом
> из самих макетов, руками не правится.
>
> Голос продукта и **словарь терминов** — [`voice.md`](./voice.md). Что уже решено про отдельные строки —
> [`wireframes/_conventions.md`](./wireframes/_conventions.md).

---

## 1. Что вошло в перепись и что нет

**Вошло:** всё, что человек читает в продукте — заголовки экранов и секций, подписи
кнопок и ссылок-выходов, плейсхолдеры и подписи полей, сообщения пустых состояний,
ошибок, загрузок и ожиданий, мета-строки карточек (расстояние, счётчик мест, сигналы
доверия), свободный текст экрана.

**Не вошло — это леса, а не продукт:** панель страниц слева, полоса состояний над
мокапом, подписи зон справа, служебный блок под макетом, системная строка телефона
и метка «сгиб — ниже не наше».

**Как читать колонки.** `Состояние` — базовый вид или одно из состояний экрана;
**во всех** значит, что строка одинакова во всех состояниях этого экрана.
`Зона` — из комментария в разметке: шапка, содержимое, действия, выход.
`Тип` — заголовок · кнопка · подпись поля · сообщение состояния · подпись ·
текст экрана · строка списка · текст пользователя.

## 2. Общее для всех экранов

| Строка | Тип | Где |
|---|---|---|
| `People` · `Events` · `Search` · `Chats` · `Profile` | кнопка | Таб-бар, все 49 страниц |
| `←` | кнопка, только aria-label | Шапка 24 страниц: `Back to chats`, `Back to the chat`, `Back to events`, `Back to people nearby` |
| `Report` | кнопка | Шапка там, где виден человек: диалог, профиль, карточка события (правило 4) |

## 3. Инвентарь по экранам

### VII.8 Радар

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| рабочий вид | Обещание | `Meet mates Enjoy the events` | заголовок |

### II.1 Колода

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | Шапка | `People nearby` | заголовок |
| **во всех** | Шапка | `Filters` | кнопка |
| **во всех** | Выход во второй путь | `Look at events →` | кнопка |
| рабочий вид | Карточка человека | `Olena, 26` | заголовок |
| рабочий вид | Карточка человека | `Olena, 26 — open profile` | кнопка · только aria-label |
| рабочий вид | Решение по карточке | `Skip` | кнопка |
| рабочий вид | Решение по карточке | `Like` | кнопка |
| рабочий вид | Карточка человека | `Hiking` | подпись |
| рабочий вид | Карточка человека | `Board games` | подпись |
| рабочий вид | Карточка человека | `Coffee` | подпись |
| рабочий вид | Карточка человека | `6 meetups attended` | подпись |
| рабочий вид | Карточка человека | `Replies quickly` | подпись |
| пусто | Вместо карточки | `You are all caught up` | заголовок |
| пусто | Что дальше | `Expand search` | кнопка |
| пусто | Что дальше | `Reset filters` | кнопка |
| пусто | Вместо карточки | `That’s everyone within 5 km who matches your filters.` | сообщение состояния |
| пусто | Вместо карточки | `That’s everyone within 5 km who matches your filters.` | текст экрана |
| ошибка | Вместо карточки | `Couldn’t load people nearby` | заголовок |
| ошибка | Что дальше | `Try again` | кнопка |
| ошибка | Вместо карточки | `The connection dropped while we were looking. Your likes and matches are safe.` | сообщение состояния |
| ошибка | Вместо карточки | `The connection dropped while we were looking. Your likes and matches are safe.` | текст экрана |
| загрузка | Решение по карточке | `Skip` | кнопка |
| загрузка | Решение по карточке | `Like` | кнопка |
| загрузка | Скелет карточки | `Looking for people near you` | сообщение состояния |

### I.1 Профиль человека

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Olena, 26` | заголовок |
| **во всех** | Планов нет | `Olena’s events` | заголовок |
| **во всех** | Решение | `Skip` | кнопка |
| **во всех** | Решение | `Like` | кнопка |
| **во всех** | Кто это | `Hiking` | подпись |
| **во всех** | Кто это | `Board games` | подпись |
| **во всех** | Кто это | `Coffee` | подпись |
| **во всех** | Кто это | `6 meetups attended` | подпись |
| **во всех** | Кто это | `Replies quickly` | подпись |
| **во всех** | Планов нет | `Moved to Kyiv in spring. Weekends are for long walks and board games.` | текст экрана |
| рабочий вид | Ближайшие запросы человека | `Board games` | заголовок объекта |
| рабочий вид | Ближайшие запросы человека | `Board games Sat 18:00` | кнопка |
| рабочий вид | Ближайшие запросы человека | `Ask to join` | кнопка |
| рабочий вид | Ближайшие запросы человека | `Kyiv Games Club · Podil · ~3 km` | подпись |
| рабочий вид | Ближайшие запросы человека | `1 spot left · Verified` | подпись |
| рабочий вид | Ближайшие запросы человека | `Sat 18:00` | подпись |
| пусто | Планов нет | `No events from Olena yet` | заголовок |
| пусто | Планов нет | `Look at events →` | кнопка |
| пусто | Планов нет | `Olena hasn’t posted anything yet. You can still say hi, or look at events nearby.` | сообщение состояния |
| пусто | Планов нет | `Olena hasn’t posted anything yet. You can still say hi, or look at events nearby.` | текст экрана |
| загрузка | Шапка готова | `Loading photos and events` | сообщение состояния |

### II.3 Совпадение

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| рабочий вид | -2: сам факт | `You and Olena both said yes` | заголовок |
| рабочий вид | Дорога дальше | `Say hi` | кнопка |
| рабочий вид | Дорога дальше | `Keep swiping` | кнопка |
| рабочий вид | -2: сам факт | `You have 3 interests in common. The chat is open — Olena can write to you too.` | сообщение состояния |
| рабочий вид | -2: сам факт | `You have 3 interests in common. The chat is open — Olena can write to you too.` | текст экрана |

### I.5 Верификация

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Verification` | заголовок |
| рабочий вид | Снять | `Take selfie` | кнопка |
| рабочий вид | Пропуск с названной ценой (§7 | `Do this later →` | кнопка |
| рабочий вид | Видоискатель | `Face the light, no sunglasses, no filters.` | подпись |
| рабочий вид | Пропуск с названной ценой (§7 | `You can browse now — verify to start chatting.` | текст экрана |
| ошибка | Причина | `We couldn’t read your face` | заголовок |
| ошибка | Пересдать | `Try again` | кнопка |
| ошибка | Выход | `Keep browsing →` | кнопка |
| ошибка | Причина | `Part of your face was out of frame. Hold the phone at eye level and try once more.` | сообщение состояния |
| ошибка | Причина | `This was your first try. After two, a person from the team looks at it — not a robot.` | сообщение состояния |
| ошибка | Причина | `Part of your face was out of frame. Hold the phone at eye level and try once more.` | текст экрана |
| загрузка | Действие выключено | `Checking…` | кнопка |
| загрузка | Ждать необязательно | `Keep browsing →` | кнопка |
| загрузка | Обработка | `Checking your selfie` | сообщение состояния |
| загрузка | Ждать необязательно | `This takes a few seconds. You can keep browsing while we check.` | текст экрана |
| успех | Факт и его последствие | `You’re verified` | заголовок |
| успех | Возврат ровно туда | `Back to Olena` | кнопка |
| успех | Второй путь тоже открылся | `Look at events →` | кнопка |
| успех | Факт и его последствие | `The badge is on your card now. You can message, join events and confirm people who ask to join yours.` | сообщение состояния |
| успех | Факт и его последствие | `The badge is on your card now. You can message, join events and confirm people who ask to join yours.` | текст экрана |
| успех в онбординге | Факт и что он даёт с самого начала | `You’re verified` | заголовок |
| успех в онбординге | Дальше | `See people` | кнопка |
| успех в онбординге | Факт и что он даёт с самого начала | `The badge is on your card from the start. You can message people you match with and join events right away.` | сообщение состояния |
| успех в онбординге | Факт и что он даёт с самого начала | `The badge is on your card from the start. You can message people you match with and join events right away.` | текст экрана |
| ожидание | Кто ответит и сколько это живёт | `A person is looking at your selfie` | заголовок |
| ожидание | Что можно делать вместо ожидания | `Keep browsing` | кнопка |
| ожидание | Что можно делать вместо ожидания | `Look at events` | кнопка |
| ожидание | Разговор ждёт | `Your chat with Olena is waiting →` | кнопка |
| ожидание | Кто ответит и сколько это живёт | `Automatic checks didn’t recognise you twice, so someone from the team takes over. Usually minutes, at most 24 hours — we’ll let you know either way.` | сообщение состояния |
| ожидание | Кто ответит и сколько это живёт | `Automatic checks didn’t recognise you twice, so someone from the team takes over. Usually minutes, at most 24 hours — we’ll let you know either way.` | текст экрана |

### IV.2 Диалог

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Olena` | заголовок |
| **во всех** | Выходы наружу | `Suggest a day` | кнопка |
| **во всех** | Выходы наружу | `Invite together` | кнопка |
| **во всех** | Поле ввода | `Write a message` | подпись поля |
| **во всех** | Поле ввода | `Message` | подпись поля |
| рабочий вид | Разговор | `Hi! Saw you’re into board games too` | текст пользователя |
| рабочий вид | Разговор | `Yes — there’s a game café on Podil I keep meaning to try` | текст пользователя |
| рабочий вид | Разговор | `Let’s go then. Which day works for you?` | текст пользователя |
| пусто | Пусто | `You matched 2 minutes ago` | заголовок |
| пусто | Пусто | `What got you into board games?` | кнопка |
| пусто | Пусто | `Know a good spot on Podil?` | кнопка |
| пусто | Пусто | `Free this weekend?` | кнопка |
| пусто | Пусто | `You both like hiking, board games and coffee. Start with that — Olena can write first too.` | сообщение состояния |
| пусто | Пусто | `You both like hiking, board games and coffee. Start with that — Olena can write first too.` | текст экрана |
| ошибка | Разговор цел | `Saturday works — the café opens at six Not sent · tap to try again` | строка списка |
| ошибка | Разговор цел | `Let’s go then. Which day works for you?` | текст пользователя |
| ошибка | Разговор цел | `Saturday works — the café opens at six` | текст пользователя |
| загрузка | Скелет истории | `Loading your conversation` | сообщение состояния |
| успех | Разговор и то | `It’s an event` | заголовок объекта |
| успех | Разговор и то | `Open the event` | кнопка |
| успех | Что дальше | `It’s in My events →` | кнопка |
| успех | Разговор и то | `It’s an event` | сообщение состояния |
| успех | Разговор и то | `Board games at Kyiv Games Club · Saturday, 18:00 · the two of you.` | сообщение состояния |
| успех | Разговор и то | `Saturday at six then? Kyiv Games Club` | текст пользователя |
| успех | Разговор и то | `Yes, I’m in` | текст пользователя |
| успех | Разговор и то | `Board games at Kyiv Games Club · Saturday, 18:00 · the two of you.` | текст экрана |
| успех | Что дальше | `We’ll ask both of you the day before: still going?` | текст экрана |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Waiting for Olena` | заголовок объекта |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Change the day` | кнопка |
| ожидание | Что можно вместо ожидания | `Invite together instead` | кнопка |
| ожидание | Что можно вместо ожидания | `Look at events →` | кнопка |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Waiting for Olena` | сообщение состояния |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Olena hasn’t answered the day yet. The suggestion stays open until Saturday — after that it just expires.` | сообщение состояния |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Saturday at six? Kyiv Games Club` | текст пользователя |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Olena hasn’t answered the day yet. The suggestion stays open until Saturday — after that it just expires.` | текст экрана |

### IV.3 Позвать вдвоём

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Go together` | заголовок |
| рабочий вид | Во что идём | `Events that fit two` | заголовок |
| рабочий вид | Во что идём | `Board games` | заголовок объекта |
| рабочий вид | Во что идём | `Morning run along the embankment` | заголовок объекта |
| рабочий вид | Кого зовём | `Olena` | кнопка |
| рабочий вид | Во что идём | `Board games Sat 18:00` | кнопка |
| рабочий вид | Во что идём | `Invite Olena` | кнопка |
| рабочий вид | Выход | `Look at all events →` | кнопка |
| рабочий вид | Во что идём | `Kyiv Games Club · Podil · ~3 km` | подпись |
| рабочий вид | Во что идём | `2 spots left · Verified` | подпись |
| рабочий вид | Во что идём | `Podil · ~1 km` | подпись |
| рабочий вид | Во что идём | `3 spots left · Verified` | подпись |
| рабочий вид | Кого зовём | `You’re inviting Olena . You go as a pair once Olena confirms` | подпись |
| рабочий вид | Во что идём | `Sat 18:00` | подпись |
| рабочий вид | Во что идём | `No date yet` | подпись |
| рабочий вид | Во что идём | `Morning run along the embankment No date yet` | строка списка |
| пусто | Выбирать не из чего | `Events that fit two` | заголовок |
| пусто | Выбирать не из чего | `No events that fit two yet` | заголовок |
| пусто | Кого зовём | `Olena` | кнопка |
| пусто | Два выхода | `Suggest a day instead` | кнопка |
| пусто | Два выхода | `Look at all events →` | кнопка |
| пусто | Кого зовём | `You’re inviting Olena` | подпись |
| пусто | Выбирать не из чего | `Most events around are for one more person. You can pick a day yourselves instead — that works the same way.` | сообщение состояния |
| пусто | Выбирать не из чего | `Most events around are for one more person. You can pick a day yourselves instead — that works the same way.` | текст экрана |
| ошибка | Кого зовём и почему пока нельзя | `Olena isn’t verified yet` | заголовок |
| ошибка | Что можно сделать сейчас | `Ask Olena to verify` | кнопка |
| ошибка | Что можно сделать сейчас | `Suggest a day instead` | кнопка |
| ошибка | Одной пойти можно всегда | `Look at events on your own →` | кнопка |
| ошибка | Кого зовём и почему пока нельзя | `Both of you need the badge to join an event as a pair. Olena can do it in a minute — a selfie, nothing else.` | сообщение состояния |
| ошибка | Кого зовём и почему пока нельзя | `Both of you need the badge to join an event as a pair. Olena can do it in a minute — a selfie, nothing else.` | текст экрана |
| успех | Факт и что он означает для обоих | `You’re both in` | заголовок |
| успех | Дорога дальше | `Open the chat` | кнопка |
| успех | Карточка плана | `Board games at Kyiv Games Club · Sat 18:00 →` | кнопка |
| успех | Факт и что он означает для обоих | `Andrii confirmed the two of you for board games at Kyiv Games Club, Saturday 18:00. The event chat is open.` | сообщение состояния |
| успех | Факт и что он означает для обоих | `Andrii confirmed the two of you for board games at Kyiv Games Club, Saturday 18:00. The event chat is open.` | текст экрана |
| успех | Дорога дальше | `We’ll ask you the day before: still going?` | текст экрана |
| ожидание | На каком шаге стоим | `Waiting for Olena` | заголовок объекта |
| ожидание | Во что именно зовём | `Board games` | заголовок объекта |
| ожидание | Во что именно зовём | `Board games Sat 18:00` | кнопка |
| ожидание | Что можно вместо ожидания | `Look at other events` | кнопка |
| ожидание | Что можно вместо ожидания | `Withdraw the invite` | кнопка |
| ожидание | Во что именно зовём | `Kyiv Games Club · Podil · ~3 km` | подпись |
| ожидание | Во что именно зовём | `2 spots left · Verified` | подпись |
| ожидание | Во что именно зовём | `Sat 18:00` | подпись |
| ожидание | На каком шаге стоим | `Waiting for Olena` | сообщение состояния |
| ожидание | На каком шаге стоим | `Step 1 of 2. Olena confirms first, then Andrii confirms the two of you — as one request for two spots.` | сообщение состояния |
| ожидание | На каком шаге стоим | `The invite stays open while the event does — until Saturday.` | сообщение состояния |
| ожидание | На каком шаге стоим | `Step 1 of 2. Olena confirms first, then Andrii confirms the two of you — as one request for two spots.` | текст экрана |

### III.1 Лента событий

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Events nearby` | заголовок |
| **во всех** | шапка | `Filters` | кнопка |
| **во всех** | шапка | `New` | кнопка |
| **во всех** | Срез вкладки | `Nearby` | кнопка |
| **во всех** | Срез вкладки | `Mine` | кнопка |
| **во всех** | Третий ответ | `See people →` | кнопка |
| рабочий вид | Лента | `Board games` | заголовок объекта |
| рабочий вид | Лента | `Morning run along the embankment` | заголовок объекта |
| рабочий вид | Лента | `Coffee and a walk in Podil` | заголовок объекта |
| рабочий вид | Лента | `Board games Sat 18:00` | кнопка |
| рабочий вид | Лента | `Ask to join` | кнопка |
| рабочий вид | Лента | `Invite` | кнопка |
| рабочий вид | Лента | `Kyiv Games Club · Podil · ~3 km` | подпись |
| рабочий вид | Лента | `2 going · 1 spot left · Verified` | подпись |
| рабочий вид | Лента | `Podil · ~1 km` | подпись |
| рабочий вид | Лента | `1 going · 2 spots left · Verified` | подпись |
| рабочий вид | Лента | `Podil · ~2 km` | подпись |
| рабочий вид | Лента | `1 spot left · Women only · Verified` | подпись |
| рабочий вид | Лента | `Sat 18:00` | подпись |
| рабочий вид | Лента | `No date yet` | подпись |
| рабочий вид | Лента | `Sun 11:00` | подпись |
| рабочий вид | Лента | `Morning run along the embankment No date yet` | строка списка |
| рабочий вид | Лента | `Coffee and a walk in Podil Sun 11:00` | строка списка |
| пусто | Пусто | `No events within 5 km yet` | заголовок |
| пусто | Три ответа потока | `Post an event` | кнопка |
| пусто | Три ответа потока | `Show events further out` | кнопка |
| пусто | Пусто | `Events here are posted by people like you — and yours would be the first one nearby.` | сообщение состояния |
| пусто | Пусто | `Events here are posted by people like you — and yours would be the first one nearby.` | текст экрана |
| ошибка | Причина названа | `Couldn’t load events nearby` | заголовок |
| ошибка | Одно действие | `Try again` | кнопка |
| ошибка | Причина названа | `The connection dropped while we were looking. Your own events and requests are safe.` | сообщение состояния |
| ошибка | Причина названа | `The connection dropped while we were looking. Your own events and requests are safe.` | текст экрана |
| загрузка | Скелет ленты | `Looking for events near you` | сообщение состояния |

### III.3 Карточка события

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Board games` | заголовок |
| **во всех** | Подтверждено | `Andrii · Verified · 12 meetups attended · Replies quickly` | подпись |
| **во всех** | Подтверждено | `Saturday, 18:00` | подпись |
| **во всех** | Подтверждено | `Free` | подпись |
| **во всех** | Подтверждено | `Kyiv Games Club · Podil · ~3 km` | подпись |
| **во всех** | Подтверждено | `Bringing Codenames and Wingspan. Anyone who knows the rules or wants to learn.` | текст экрана |
| рабочий вид | Отклик | `Ask to join` | кнопка |
| рабочий вид | Отклик | `Invite together` | кнопка |
| рабочий вид | Другие планы | `Look at other events →` | кнопка |
| рабочий вид | Что за план | `2 going · 1 spot left` | сообщение состояния |
| ошибка | Отказ | `Andrii didn’t take this one` | заголовок |
| ошибка | Следующий шаг | `Look at other events` | кнопка |
| ошибка | Следующий шаг | `See people` | кнопка |
| ошибка | Свой план | `Post an event →` | кнопка |
| ошибка | Отказ | `Board games at Kyiv Games Club is closed for you. It happens — people pick who they go with, and that’s the point of confirming.` | сообщение состояния |
| ошибка | Отказ | `Board games at Kyiv Games Club is closed for you. It happens — people pick who they go with, and that’s the point of confirming.` | текст экрана |
| загрузка | Действие на паузе | `Ask to join` | кнопка |
| загрузка | Действие на паузе | `Invite together` | кнопка |
| загрузка | Выход живой | `Look at other events →` | кнопка |
| загрузка | Полный скелет: данных нет вовсе | `Opening the event` | сообщение состояния |
| успех | Подтверждено | `You’re going` | заголовок объекта |
| успех | Дорога дальше | `Open the chat` | кнопка |
| успех | Дорога дальше | `Share my events` | кнопка |
| успех | Мои события | `It’s in My events →` | кнопка |
| успех | Подтверждено | `You’re going` | сообщение состояния |
| успех | Подтверждено | `Andrii confirmed you. The chat is open and the exact address is now visible.` | сообщение состояния |
| успех | Подтверждено | `2 going · 1 spot left · we’ll ask the day before` | сообщение состояния |
| успех | Подтверждено | `Andrii confirmed you. The chat is open and the exact address is now visible.` | текст экрана |
| ожидание | Кто должен ответить и сколько это живёт | `Waiting for Andrii` | заголовок объекта |
| ожидание | Что можно вместо ожидания | `Look at other events` | кнопка |
| ожидание | Что можно вместо ожидания | `Withdraw my request` | кнопка |
| ожидание | Второй путь | `See people →` | кнопка |
| ожидание | Кто должен ответить и сколько это живёт | `Waiting for Andrii` | сообщение состояния |
| ожидание | Кто должен ответить и сколько это живёт | `Your request is with Andrii. It stays open until Saturday — events without a date keep requests for 14 days.` | сообщение состояния |
| ожидание | Кто должен ответить и сколько это живёт | `2 going · 1 spot left · your request doesn’t take a spot yet` | сообщение состояния |
| ожидание | Кто должен ответить и сколько это живёт | `Your request is with Andrii. It stays open until Saturday — events without a date keep requests for 14 days.` | текст экрана |

### III.6 Мои события

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `My events` | заголовок |
| **во всех** | шапка | `New` | кнопка |
| **во всех** | Сегмент вкладки | `Nearby` | кнопка |
| **во всех** | Сегмент вкладки | `Mine` | кнопка |
| **во всех** | Чужие события рядом | `Look at events →` | кнопка |
| рабочий вид | Мои события | `Waiting for you` | заголовок |
| рабочий вид | Мои события | `Going` | заголовок |
| рабочий вид | Мои события | `Past` | заголовок |
| рабочий вид | Мои события | `Board games` | заголовок объекта |
| рабочий вид | Мои события | `Morning run along the embankment` | заголовок объекта |
| рабочий вид | Мои события | `Coffee and a walk in Podil` | заголовок объекта |
| рабочий вид | Мои события | `Board games Sat 18:00` | кнопка |
| рабочий вид | Мои события | `2 requests · tap to confirm · 1 spot left` | подпись |
| рабочий вид | Мои события | `Maryna · 3 going · ~1 km` | подпись |
| рабочий вид | Мои события | `Repeats weekly · 2 meetups so far` | подпись |
| рабочий вид | Мои события | `Sat 18:00` | подпись |
| рабочий вид | Мои события | `Sun 08:00` | подпись |
| рабочий вид | Мои события | `Last Sunday` | подпись |
| рабочий вид | Мои события | `Morning run along the embankment Sun 08:00` | строка списка |
| рабочий вид | Мои события | `Coffee and a walk in Podil Last Sunday` | строка списка |
| пусто | Пусто | `No events yet` | заголовок |
| пусто | Пусто | `Post an event` | кнопка |
| пусто | Пусто | `Events you post and events you join will show up here — along with the ones that already happened.` | сообщение состояния |
| пусто | Пусто | `Events you post and events you join will show up here — along with the ones that already happened.` | текст экрана |
| ошибка | Причина и то | `Couldn’t load your events` | заголовок |
| ошибка | Причина и то | `Try again` | кнопка |
| ошибка | Причина и то | `The connection dropped. Nothing is lost — your events and the people who joined them are safe.` | сообщение состояния |
| ошибка | Причина и то | `The connection dropped. Nothing is lost — your events and the people who joined them are safe.` | текст экрана |
| загрузка | Скелет списка | `Loading your events` | сообщение состояния |

### IV.1 Список чатов

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `My chats` | заголовок |
| **во всех** | Выход | `See people →` | кнопка |
| рабочий вид | Матчи без переписки | `New matches` | заголовок |
| рабочий вид | Список | `Olena` | заголовок объекта |
| рабочий вид | Список | `Board games` | заголовок объекта |
| рабочий вид | Список | `Maryna` | заголовок объекта |
| рабочий вид | Список | `Let’s go then. Which day works for you?` | подпись |
| рабочий вид | Список | `Event chat · 3 people · Andrii: see you at six` | подпись |
| рабочий вид | Список | `You matched — no messages yet` | подпись |
| рабочий вид | Матчи без переписки | `Maryna, Olha and Ihor — say hi` | подпись |
| рабочий вид | Список | `19:08 · 1 new` | подпись |
| рабочий вид | Список | `Mon` | подпись |
| рабочий вид | Список | `12 Jun` | подпись |
| рабочий вид | Список | `Olena 19:08 · 1 new Let’s go then. Which day works for you?` | строка списка |
| рабочий вид | Список | `Board games Mon Event chat · 3 people · Andrii: see you at six` | строка списка |
| рабочий вид | Список | `Maryna 12 Jun You matched — no messages yet` | строка списка |
| пусто | Пусто | `No chats yet` | заголовок |
| пусто | Оба пути к первому разговору | `See people` | кнопка |
| пусто | Оба пути к первому разговору | `Look at events` | кнопка |
| пусто | Пусто | `Chats open when you and someone both say yes — or when the author of an event confirms you.` | сообщение состояния |
| пусто | Пусто | `Chats open when you and someone both say yes — or when the author of an event confirms you.` | текст экрана |
| ошибка | Причина названа | `Couldn’t load your chats` | заголовок |
| ошибка | Причина названа | `Try again` | кнопка |
| ошибка | Причина названа | `The connection dropped. Nothing is lost — your messages are on the server.` | сообщение состояния |
| ошибка | Причина названа | `The connection dropped. Nothing is lost — your messages are on the server.` | текст экрана |
| загрузка | Скелет списка | `Loading your chats` | сообщение состояния |

### IX.1 Поиск

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Filters` | кнопка |
| **во всех** | шапка | `Search people and events` | подпись поля |
| **во всех** | шапка | `board games` | текст пользователя |
| рабочий вид | шапка | `Search` | заголовок |
| рабочий вид | Результаты двумя группами | `Events` | заголовок |
| рабочий вид | Результаты двумя группами | `People` | заголовок |
| рабочий вид | Результаты двумя группами | `Board games` | заголовок объекта |
| рабочий вид | Результаты двумя группами | `Board games evening at home` | заголовок объекта |
| рабочий вид | Результаты двумя группами | `Olena, 26` | заголовок объекта |
| рабочий вид | Результаты двумя группами | `Board games Sat 18:00` | кнопка |
| рабочий вид | Результаты двумя группами | `Ask to join` | кнопка |
| рабочий вид | Результаты двумя группами | `Invite` | кнопка |
| рабочий вид | Результаты двумя группами | `Kyiv Games Club · Podil · ~3 km` | подпись |
| рабочий вид | Результаты двумя группами | `1 spot left · Verified` | подпись |
| рабочий вид | Результаты двумя группами | `Podil · ~4 km · private address` | подпись |
| рабочий вид | Результаты двумя группами | `2 spots left · Verified` | подпись |
| рабочий вид | Результаты двумя группами | `3 common interests · Verified · 6 meetups attended` | подпись |
| рабочий вид | Результаты двумя группами | `Sat 18:00` | подпись |
| рабочий вид | Результаты двумя группами | `No date yet` | подпись |
| рабочий вид | Результаты двумя группами | `~2 km` | подпись |
| рабочий вид | Результаты двумя группами | `Board games evening at home No date yet` | строка списка |
| рабочий вид | Результаты двумя группами | `Olena, 26 ~2 km 3 common interests · Verified · 6 meetups attended` | строка списка |
| пусто | шапка | `Search` | заголовок |
| пусто | Ничего не нашлось | `Nothing for “bouldering” yet` | заголовок |
| пусто | Два выхода | `Post a bouldering event` | кнопка |
| пусто | Два выхода | `Look at all events →` | кнопка |
| пусто | Два выхода | `See people →` | кнопка |
| пусто | Ничего не нашлось | `No events and no people with this interest nearby. You could be the first to post one.` | сообщение состояния |
| пусто | шапка | `bouldering` | текст пользователя |
| пусто | Ничего не нашлось | `No events and no people with this interest nearby. You could be the first to post one.` | текст экрана |
| ошибка | шапка | `Search` | заголовок |
| ошибка | Причина названа | `Couldn’t run your search` | заголовок |
| ошибка | Причина названа | `Try again` | кнопка |
| ошибка | Выход | `Look at events →` | кнопка |
| ошибка | Причина названа | `The connection dropped. Your query is still here — try it again.` | сообщение состояния |
| ошибка | Причина названа | `The connection dropped. Your query is still here — try it again.` | текст экрана |
| загрузка | шапка | `Search` | заголовок |
| загрузка | Скелет обеих групп | `Events` | заголовок |
| загрузка | Скелет обеих групп | `People` | заголовок |
| загрузка | Выход живой | `Look at events →` | кнопка |
| загрузка | Скелет обеих групп | `Searching events and people` | сообщение состояния |

### I.2 Мой профиль

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| рабочий вид | шапка | `My profile` | заголовок |
| рабочий вид | Как меня видят | `How others see you` | заголовок |
| рабочий вид | Как меня видят | `Dasha, 27` | заголовок |
| рабочий вид | Глубокий слой | `My events` | заголовок объекта |
| рабочий вид | Глубокий слой | `My matches` | заголовок объекта |
| рабочий вид | Глубокий слой | `Verification` | заголовок объекта |
| рабочий вид | Глубокий слой | `Location` | заголовок объекта |
| рабочий вид | Глубокий слой | `Blocked people` | заголовок объекта |
| рабочий вид | Глубокий слой | `Safety center` | заголовок объекта |
| рабочий вид | Глубокий слой | `Settings` | заголовок объекта |
| рабочий вид | шапка | `Edit` | кнопка |
| рабочий вид | Глубокий слой | `My events 1 waiting for you` | кнопка |
| рабочий вид | Глубокий слой | `My matches 3 new` | кнопка |
| рабочий вид | Глубокий слой | `Verification Verified` | кнопка |
| рабочий вид | Глубокий слой | `Log out` | кнопка |
| рабочий вид | Глубокий слой | `1 waiting for you` | подпись |
| рабочий вид | Глубокий слой | `3 new` | подпись |
| рабочий вид | Глубокий слой | `Verified` | подпись |
| рабочий вид | Глубокий слой | `On · rounded` | подпись |
| рабочий вид | Глубокий слой | `0` | подпись |
| рабочий вид | Глубокий слой | `account, notifications` | подпись |
| рабочий вид | Как меня видят | `4 meetups attended` | подпись |
| рабочий вид | Как меня видят | `Replies quickly` | подпись |
| рабочий вид | Глубокий слой | `My events 1 waiting for you` | подпись |
| рабочий вид | Глубокий слой | `My matches 3 new` | подпись |
| рабочий вид | Глубокий слой | `Verification Verified` | подпись |
| рабочий вид | Как меня видят | `Kyiv · distance is always rounded for others` | подпись |
| загрузка | шапка | `My profile` | заголовок |
| загрузка | Известное | `How others see you` | заголовок |
| загрузка | Известное | `Dasha, 27` | заголовок |
| загрузка | Глубокий слой доступен и во время загрузки | `My events` | заголовок объекта |
| загрузка | Глубокий слой доступен и во время загрузки | `My matches` | заголовок объекта |
| загрузка | Глубокий слой доступен и во время загрузки | `Verification` | заголовок объекта |
| загрузка | Глубокий слой доступен и во время загрузки | `Location` | заголовок объекта |
| загрузка | Глубокий слой доступен и во время загрузки | `Blocked people` | заголовок объекта |
| загрузка | Глубокий слой доступен и во время загрузки | `Safety center` | заголовок объекта |
| загрузка | Глубокий слой доступен и во время загрузки | `Settings` | заголовок объекта |
| загрузка | шапка | `Edit` | кнопка |
| загрузка | Глубокий слой доступен и во время загрузки | `My events` | кнопка |
| загрузка | Глубокий слой доступен и во время загрузки | `My matches` | кнопка |
| загрузка | Глубокий слой доступен и во время загрузки | `Verification` | кнопка |
| загрузка | Глубокий слой доступен и во время загрузки | `Log out` | кнопка |
| загрузка | Глубокий слой доступен и во время загрузки | `On · rounded` | подпись |
| загрузка | Глубокий слой доступен и во время загрузки | `account, notifications` | подпись |
| загрузка | Глубокий слой доступен и во время загрузки | `My events` | подпись |
| загрузка | Глубокий слой доступен и во время загрузки | `My matches` | подпись |
| загрузка | Глубокий слой доступен и во время загрузки | `Verification` | подпись |
| загрузка | Известное | `Updating your meetup count` | сообщение состояния |

---

## 4. Расхождения — закрыты решением `D-60`

> Перепись снималась, когда расхождения ещё были. **Аудит 29.09** свёл их решением
> `D-60` (словарь и форматы): отклик — `request` на обеих сторонах · совместный отклик —
> `Invite together`, в превью `Invite` · момент взаимности — факт, `match` только в списках ·
> выход — `Look at events` плюс закрытый список уточнителей `other` / `all` / `on your own` ·
> расстояние `~3 km` без `away` · время `Sat 18:00` в превью и `Saturday, 18:00` на карточке ·
> нуля нет, заполненное событие — `No spots left` · местоимений по полу нет, стоит имя.
> Ниже — что было найдено; таблицы оставлены как след разбора.

### 4.1 Один предмет под разными именами

| Предмет | Как называется сейчас | Где | Почему это важно |
|---|---|---|---|
| **Отклик на событие** | `Ask to join` (действие) · `request` — «Your request is with him», «your request doesn’t take a spot yet», `Withdraw my request` · `responses` — «2 responses · tap to confirm» | лента, карточка события, ожидание, мои события | Три слова об одном: человек нажимает `ask`, статус зовёт это `request`, автор видит `responses` |
| **Совместный отклик** | `Invite together` (диалог, лента) · `Invite` (превью, сокращено по ширине `D-58`) · `Ask together` (экран «Go together») · `Withdraw the invite` | диалог, лента, «Позвать вдвоём» | Кнопка зовёт `invite`, а на самом экране действие называется `ask together` — на одном пути два глагола |
| **Совпадение** | `My matches` · `New matches` · «You matched — no messages yet» · «You matched 2 minutes ago» · **«You and Olena both said yes»** | профиль-хаб, список чатов, пустой диалог, экран совпадения | Везде `match`, и только на самом экране совпадения — «both said yes» |
| **Чат события** | `Event chat · 3 people` · `Open the chat` · `Open the event` | список чатов, успех события, успех диалога | Один объект и два разных «открыть»; `Open the event` ведёт не в чат, а на карточку |
| **Расстояние** | `~2 km` (чип на карточке человека) · `~3 km` (превью события) · `~3 km away` (карточка события, профиль) | колода, лента, карточка, профиль | Одна величина в двух написаниях: с `away` и без |
| **Событие без даты** | `No date yet` (ярлык) · «events without a date keep requests for 14 days» (объяснение) | лента, поиск, ожидание | Ярлык и объяснение согласованы, но срок живёт только в объяснении |

### 4.2 Одно действие — разные подписи кнопок

| Действие | Подписи сейчас | Где |
|---|---|---|
| **Вернуться в колоду** | `Keep browsing` · `Keep swiping` · `See people` | верификация · совпадение · пустые чаты, отказ на событии, успех в онбординге |
| **Отложить верификацию** | `Do this later →` · `Keep browsing →` | экран съёмки · загрузка и ошибка |
| **Вернуться в разговор** | `←` (aria `Back to the chat`) · `Back to Olena` · `Your chat with Olena is waiting →` · `Open the chat` | состояния диалога · успех верификации · ожидание верификации · успех события |
| **Создать событие** | `New` · `Post an event` · `Post an event →` · `Post a bouldering event` | шапка ленты · пустые состояния · отказ на событии · пустой поиск (подставляет запрос) |
| **Уйти в ленту** | `Look at events` · `Look at all events` · `Look at other events` · `Look at events on your own` | колода и чаты · «Позвать вдвоём» и поиск · карточка и ожидания · ошибка «Позвать вдвоём» |
| **Предложить день** | `Suggest a day` · `Suggest a day instead` · `Change the day` | диалог · пустое и ошибочное «Позвать вдвоём» · ожидание в диалоге |
| **Повторить попытку** | `Try again` (кнопка) · `tap to try again` (подпись на неотправленной реплике `D-52`) | ошибки загрузки · ошибка отправки в диалоге |

### 4.3 Тон: клише не найдено, три строки на проверку

| Что искали | Результат |
|---|---|
| `Oops`, `Something went wrong`, `Whoops` | **Не найдено.** Ошибки называют причину: «The connection dropped…», «Part of your face was out of frame…» |
| `Congratulations`, `Great!`, `Awesome`, `Yay` | **Не найдено** |
| Эмодзи, восклицательные знаки | Восклицательный знак один — в **реплике пользователя** `Hi! Saw you’re into board games too`. Эмодзи нет |
| Бодрый тон продукта | Три строки на проверку: `You are all caught up` · `You’re both in` · `You and Olena both said yes` |
| Многоточие в кнопке | `Checking…` — единственная кнопка-состояние с многоточием |

### 4.4 Тексты-заглушки

**Не найдено.** Ни `lorem ipsum`, ни «Заголовок 1», ни `TODO`. Весь текст доменный:
Kyiv Games Club, Podil, `2 going · 1 spot left`, `6 meetups attended`, `~3 km`.

---

## 5. Текст, который пишет пользователь — не переписываем

| Что | Примеры | Где |
|---|---|---|
| Реплики в чате | `Hi! Saw you’re into board games too` · `Let’s go then. Which day works for you?` · `Yes — there’s a game café on Podil I keep meaning to try` · `Saturday at six then? Kyiv Games Club` · `Yes, I’m in` | диалог и его состояния |
| Название события | `Board games` · `Morning run along the embankment` · `Coffee and a walk in Podil` · `Board games evening at home` | лента, поиск, карточка, мои события |
| Описание события | `Bringing Codenames and Wingspan. Anyone who knows the rules or wants to learn.` | карточка события |
| Био | `Moved to Kyiv in spring. Weekends are for long walks and board games.` | профиль человека |
| Запрос в поиске | `board games` · `bouldering` | поиск и его состояния |
| Имена и площадки | Olena, Andrii, Maryna, Kateryna, Dasha · Kyiv Games Club · Podil | везде |

**Отдельно — наш текст, который человек отправляет от своего имени.** Ice-breakers
в пустом чате: `What got you into board games?` · `Know a good spot on Podil?` ·
`Free this weekend?`. Пишем их мы, звучат они как реплика человека.

---

## 6. Что дальше

1. По каждому расхождению из §4.1 и §4.2 принять решение: одно имя или осознанно разные.
2. Решения записать сюда же — таблица станет **источником правды**, с которой сверяется
   каждая строка продукта.
3. Голос, которым всё это написано, — [`voice.md`](./voice.md).
