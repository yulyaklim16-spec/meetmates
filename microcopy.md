# Микрокопирайт — перепись текста интерфейса

> **Инвентарь, а не свод правил.** Здесь собран весь текст, который сейчас стоит
> на макетах `wireframes/*.html`: заголовки, кнопки, подписи полей, сообщения состояний.
> Ничего не переписано — задача переписи в том, чтобы стало видно то, чего не видно
> по одному экрану: одна и та же вещь названа в разных местах по-разному.
>
> Снято 30.09.2026 — после переписывания текста по `voice.md` — с набора **49 страниц, 13 экранов**. Пересобирается скриптом
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
| ошибка | Вместо карточки | `The connection dropped. Your likes and matches are safe.` | сообщение состояния |
| ошибка | Вместо карточки | `The connection dropped. Your likes and matches are safe.` | текст экрана |
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
| пусто | Планов нет | `Events here are posted by people themselves — Olena hasn’t posted one yet.` | сообщение состояния |
| пусто | Планов нет | `Events here are posted by people themselves — Olena hasn’t posted one yet.` | текст экрана |
| загрузка | Шапка готова | `Loading photos and events` | сообщение состояния |

### II.3 Совпадение

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| рабочий вид | -2: сам факт | `You and Olena both said yes` | заголовок |
| рабочий вид | Дорога дальше | `Say hi` | кнопка |
| рабочий вид | Дорога дальше | `See people` | кнопка |
| рабочий вид | -2: сам факт | `You have 3 interests in common. The chat is open — Olena can write to you too.` | сообщение состояния |
| рабочий вид | -2: сам факт | `You have 3 interests in common. The chat is open — Olena can write to you too.` | текст экрана |

### I.5 Верификация

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Verification` | заголовок |
| **во всех** | Выход | `Keep browsing →` | кнопка |
| рабочий вид | Снять | `Take selfie` | кнопка |
| рабочий вид | Видоискатель | `Face the light, no sunglasses, no filters.` | подпись |
| рабочий вид | Пропуск с названной ценой (§7 | `You can browse now — verify to start chatting.` | текст экрана |
| ошибка | Причина | `Couldn’t read your face` | заголовок |
| ошибка | Пересдать | `Try again` | кнопка |
| ошибка | Причина | `Part of your face was out of frame. Hold the phone at eye level and try once more.` | сообщение состояния |
| ошибка | Причина | `This was your first try. There’s no limit on tries — after two, someone from the team looks at your selfie.` | сообщение состояния |
| ошибка | Причина | `Part of your face was out of frame. Hold the phone at eye level and try once more.` | текст экрана |
| загрузка | Действие выключено | `Take selfie` | кнопка |
| загрузка | Обработка | `Checking your selfie` | сообщение состояния |
| загрузка | Ждать необязательно | `This takes a few seconds. You can keep browsing while the check runs.` | текст экрана |
| успех | Факт и его последствие | `You’re verified` | заголовок |
| успех | Возврат ровно туда | `Open the chat` | кнопка |
| успех | Второй путь тоже открылся | `Look at events →` | кнопка |
| успех | Факт и его последствие | `The badge is on your card now. You can message, join events and confirm people who ask to join yours.` | сообщение состояния |
| успех | Факт и его последствие | `The badge is on your card now. You can message, join events and confirm people who ask to join yours.` | текст экрана |
| успех в онбординге | Факт и что он даёт с самого начала | `You’re verified` | заголовок |
| успех в онбординге | Дальше | `See people` | кнопка |
| успех в онбординге | Факт и что он даёт с самого начала | `The badge is on your card from the start. You can message anyone you both said yes to and join events right away.` | сообщение состояния |
| успех в онбординге | Факт и что он даёт с самого начала | `The badge is on your card from the start. You can message anyone you both said yes to and join events right away.` | текст экрана |
| ожидание | Кто ответит и сколько это живёт | `Someone from the team is checking your selfie` | заголовок |
| ожидание | Что можно делать вместо ожидания | `Keep browsing` | кнопка |
| ожидание | Что можно делать вместо ожидания | `Look at events` | кнопка |
| ожидание | Разговор ждёт | `Open the chat →` | кнопка |
| ожидание | Кто ответит и сколько это живёт | `The automatic check couldn’t read your face twice. Usually minutes, at most 24 hours — we’ll let you know either way.` | сообщение состояния |
| ожидание | Кто ответит и сколько это живёт | `The automatic check couldn’t read your face twice. Usually minutes, at most 24 hours — we’ll let you know either way.` | текст экрана |

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
| пусто | Пусто | `No messages yet` | заголовок |
| пусто | Пусто | `What got you into board games?` | кнопка |
| пусто | Пусто | `Know a good spot on Podil?` | кнопка |
| пусто | Пусто | `Free this weekend?` | кнопка |
| пусто | Пусто | `You and Olena both said yes 2 minutes ago. You both like hiking, board games and coffee — start with that, and Olena can write first too.` | сообщение состояния |
| пусто | Пусто | `You and Olena both said yes 2 minutes ago. You both like hiking, board games and coffee — start with that, and Olena can write first too.` | текст экрана |
| ошибка | Разговор цел | `Saturday works — the café opens at six Not sent · tap to try again` | строка списка |
| ошибка | Разговор цел | `Let’s go then. Which day works for you?` | текст пользователя |
| ошибка | Разговор цел | `Saturday works — the café opens at six` | текст пользователя |
| загрузка | Скелет истории | `Loading your chat with Olena` | сообщение состояния |
| успех | Разговор и то | `It’s an event` | заголовок объекта |
| успех | Разговор и то | `Open the event` | кнопка |
| успех | Что дальше | `It’s in My events →` | кнопка |
| успех | Разговор и то | `It’s an event` | сообщение состояния |
| успех | Разговор и то | `Board games at Kyiv Games Club · Saturday, 18:00 · the two of you.` | сообщение состояния |
| успех | Разговор и то | `Saturday at six then? Kyiv Games Club` | текст пользователя |
| успех | Разговор и то | `Yes, I’m in` | текст пользователя |
| успех | Разговор и то | `Board games at Kyiv Games Club · Saturday, 18:00 · the two of you.` | текст экрана |
| успех | Что дальше | `A reminder comes the day before: Still going?` | текст экрана |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Waiting for Olena` | заголовок объекта |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Change the day` | кнопка |
| ожидание | Что можно вместо ожидания | `Look at events →` | кнопка |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Waiting for Olena` | сообщение состояния |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Olena hasn’t answered yet. The suggestion stays open until Saturday — after that it expires.` | сообщение состояния |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Saturday at six? Kyiv Games Club` | текст пользователя |
| ожидание | Предложение висит в разговоре и ждёт ответа | `Olena hasn’t answered yet. The suggestion stays open until Saturday — after that it expires.` | текст экрана |

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
| пусто | Два выхода | `Suggest a day` | кнопка |
| пусто | Два выхода | `Look at all events →` | кнопка |
| пусто | Кого зовём | `You’re inviting Olena` | подпись |
| пусто | Выбирать не из чего | `Most events around are for one more person. You can suggest a day in the chat instead — that makes an event for the two of you.` | сообщение состояния |
| пусто | Выбирать не из чего | `Most events around are for one more person. You can suggest a day in the chat instead — that makes an event for the two of you.` | текст экрана |
| ошибка | Кого зовём и почему пока нельзя | `Olena isn’t verified yet` | заголовок |
| ошибка | Что можно сделать сейчас | `Ask Olena to verify` | кнопка |
| ошибка | Что можно сделать сейчас | `Suggest a day` | кнопка |
| ошибка | Одной пойти можно всегда | `Look at events on your own →` | кнопка |
| ошибка | Кого зовём и почему пока нельзя | `Both of you need the badge to join an event as a pair. Olena only needs to take a selfie.` | сообщение состояния |
| ошибка | Кого зовём и почему пока нельзя | `Both of you need the badge to join an event as a pair. Olena only needs to take a selfie.` | текст экрана |
| успех | Факт и что он означает для обоих | `You’re both confirmed` | заголовок |
| успех | Дорога дальше | `Open the chat` | кнопка |
| успех | Карточка плана | `Board games at Kyiv Games Club · Sat 18:00 →` | кнопка |
| успех | Факт и что он означает для обоих | `Andrii confirmed the two of you for board games at Kyiv Games Club, Saturday, 18:00. The event chat is open.` | сообщение состояния |
| успех | Факт и что он означает для обоих | `Andrii confirmed the two of you for board games at Kyiv Games Club, Saturday, 18:00. The event chat is open.` | текст экрана |
| успех | Дорога дальше | `We’ll ask you the day before: still going?` | текст экрана |
| ожидание | На каком шаге стоим | `Waiting for Olena` | заголовок объекта |
| ожидание | Во что именно зовём | `Board games` | заголовок объекта |
| ожидание | Во что именно зовём | `Board games Sat 18:00` | кнопка |
| ожидание | Что можно вместо ожидания | `Look at other events` | кнопка |
| ожидание | Что можно вместо ожидания | `Withdraw my invite` | кнопка |
| ожидание | Во что именно зовём | `Kyiv Games Club · Podil · ~3 km` | подпись |
| ожидание | Во что именно зовём | `2 spots left · Verified` | подпись |
| ожидание | Во что именно зовём | `Sat 18:00` | подпись |
| ожидание | На каком шаге стоим | `Waiting for Olena` | сообщение состояния |
| ожидание | На каком шаге стоим | `Step 1 of 2. Olena confirms first, then Andrii confirms the two of you — as one request for two spots.` | сообщение состояния |
| ожидание | На каком шаге стоим | `The invite stays open while the event does — until Saturday. Withdrawing it cancels the invite for Olena.` | сообщение состояния |
| ожидание | На каком шаге стоим | `Step 1 of 2. Olena confirms first, then Andrii confirms the two of you — as one request for two spots.` | текст экрана |

### III.1 Лента событий

| Состояние | Зона | Строка | Тип |
|---|---|---|---|
| **во всех** | шапка | `Events nearby` | заголовок |
| **во всех** | шапка | `Filters` | кнопка |
| **во всех** | шапка | `Post` | кнопка |
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
| ошибка | Причина названа | `The connection dropped. Your own events and requests are safe.` | сообщение состояния |
| ошибка | Причина названа | `The connection dropped. Your own events and requests are safe.` | текст экрана |
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
| рабочий вид | Другие планы | `Look at other events →` | кнопка |
| рабочий вид | Что за план | `2 going · 1 spot left` | сообщение состояния |
| ошибка | Отказ | `Andrii didn’t take this one` | заголовок |
| ошибка | Следующий шаг | `Look at other events` | кнопка |
| ошибка | Следующий шаг | `See people` | кнопка |
| ошибка | Свой план | `Post an event →` | кнопка |
| ошибка | Отказ | `Board games at Kyiv Games Club is closed for you. It happens — people pick who they go with, and that’s the point of confirming.` | сообщение состояния |
| ошибка | Отказ | `Board games at Kyiv Games Club is closed for you. It happens — people pick who they go with, and that’s the point of confirming.` | текст экрана |
| загрузка | Действие на паузе | `Ask to join` | кнопка |
| загрузка | Выход живой | `Look at other events →` | кнопка |
| загрузка | Полный скелет: данных нет вовсе | `Opening the event` | сообщение состояния |
| успех | Подтверждено | `You’re going` | заголовок объекта |
| успех | Дорога дальше | `Open the chat` | кнопка |
| успех | Дорога дальше | `Share my events` | кнопка |
| успех | Мои события | `It’s in My events →` | кнопка |
| успех | Подтверждено | `You’re going` | сообщение состояния |
| успех | Подтверждено | `Andrii confirmed you. The chat is open and the exact address is now visible.` | сообщение состояния |
| успех | Подтверждено | `2 going · 1 spot left · Still going? comes the day before` | сообщение состояния |
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
| **во всех** | шапка | `Post` | кнопка |
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
| рабочий вид | Мои события | `Coffee and a walk in Podil 20 Sep` | кнопка |
| рабочий вид | Мои события | `2 requests · tap to confirm · 1 spot left` | подпись |
| рабочий вид | Мои события | `Maryna · 3 going · ~1 km` | подпись |
| рабочий вид | Мои события | `Repeats weekly · 2 meetups so far` | подпись |
| рабочий вид | Мои события | `Sat 18:00` | подпись |
| рабочий вид | Мои события | `Sun 08:00` | подпись |
| рабочий вид | Мои события | `20 Sep` | подпись |
| рабочий вид | Мои события | `Morning run along the embankment Sun 08:00` | строка списка |
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
| рабочий вид | Список | `You both said yes — no messages yet` | подпись |
| рабочий вид | Матчи без переписки | `Maryna, Olha and Ihor — say hi` | подпись |
| рабочий вид | Список | `19:08 · 1 new` | подпись |
| рабочий вид | Список | `Mon` | подпись |
| рабочий вид | Список | `12 Jun` | подпись |
| рабочий вид | Список | `Olena 19:08 · 1 new Let’s go then. Which day works for you?` | строка списка |
| рабочий вид | Список | `Board games Mon Event chat · 3 people · Andrii: see you at six` | строка списка |
| рабочий вид | Список | `Maryna 12 Jun You both said yes — no messages yet` | строка списка |
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
| пусто | Ничего не нашлось | `No events or people for “bouldering” yet` | заголовок |
| пусто | Два выхода | `Post an event` | кнопка |
| пусто | Два выхода | `Look at all events →` | кнопка |
| пусто | Два выхода | `See people →` | кнопка |
| пусто | Ничего не нашлось | `Events here are posted by people like you — yours would be the first one with this interest.` | сообщение состояния |
| пусто | шапка | `bouldering` | текст пользователя |
| пусто | Ничего не нашлось | `Events here are posted by people like you — yours would be the first one with this interest.` | текст экрана |
| ошибка | шапка | `Search` | заголовок |
| ошибка | Причина названа | `Couldn’t run your search` | заголовок |
| ошибка | Причина названа | `Try again` | кнопка |
| ошибка | Выход | `Look at events →` | кнопка |
| ошибка | Причина названа | `The connection dropped. Your search is still here.` | сообщение состояния |
| ошибка | Причина названа | `The connection dropped. Your search is still here.` | текст экрана |
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
| рабочий вид | Глубокий слой | `My events 1 request` | кнопка |
| рабочий вид | Глубокий слой | `My matches 3 new` | кнопка |
| рабочий вид | Глубокий слой | `Verification Verified` | кнопка |
| рабочий вид | Глубокий слой | `Log out` | кнопка |
| рабочий вид | Глубокий слой | `1 request` | подпись |
| рабочий вид | Глубокий слой | `3 new` | подпись |
| рабочий вид | Глубокий слой | `Verified` | подпись |
| рабочий вид | Глубокий слой | `On · rounded` | подпись |
| рабочий вид | Глубокий слой | `None` | подпись |
| рабочий вид | Глубокий слой | `Account and notifications` | подпись |
| рабочий вид | Как меня видят | `4 meetups attended` | подпись |
| рабочий вид | Как меня видят | `Replies quickly` | подпись |
| рабочий вид | Глубокий слой | `My events 1 request` | подпись |
| рабочий вид | Глубокий слой | `My matches 3 new` | подпись |
| рабочий вид | Глубокий слой | `Verification Verified` | подпись |
| рабочий вид | Как меня видят | `Kyiv · distance is always rounded for others` | подпись |
| рабочий вид | Глубокий слой | `You’ll need to sign in again to get back to your chats and events.` | сообщение состояния |
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
| загрузка | Глубокий слой доступен и во время загрузки | `Account and notifications` | подпись |
| загрузка | Глубокий слой доступен и во время загрузки | `My events` | подпись |
| загрузка | Глубокий слой доступен и во время загрузки | `My matches` | подпись |
| загрузка | Глубокий слой доступен и во время загрузки | `Verification` | подпись |
| загрузка | Известное | `Updating your meetup count` | сообщение состояния |
| загрузка | Глубокий слой доступен и во время загрузки | `You’ll need to sign in again to get back to your chats and events.` | сообщение состояния |

---

## 4. Расхождения — закрыты решением `D-60`

> Перепись снималась, когда расхождения ещё были. **Аудит 29.09** свёл их решением
> `D-60` (словарь и форматы): отклик — `request` на обеих сторонах · совместный отклик —
> `Invite together`, в превью `Invite` · момент взаимности — факт, `match` только в списках ·
> выход — `Look at events` плюс закрытый список уточнителей `other` / `all` / `on your own` ·
> расстояние `~3 km` без `away` · время `Sat 18:00` в превью и `Saturday, 18:00` на карточке ·
> нуля нет, заполненное событие — `No spots left` · местоимений по полу нет, стоит имя.
> **Остаток закрыт переписыванием 30.09** — имена кнопок из §4.2 сведены в таблице
> «Сквозная сверка» в §6, там же сказано, что осталось разным намеренно.
>
> Ниже — что было найдено; таблицы оставлены как след разбора — **действующих имён в них искать не нужно**.

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

## 6. Переписанные страницы — было и стало

Правка по [`voice.md`](./voice.md) идёт экранами. Ниже — что изменилось на уже
переписанных; строки, которые проверены и оставлены, перечислены после таблицы.

### Лента событий: `feed` · `feed-empty` · `feed-error` · `feed-loading` — 30.09

| Экран | Тип | Было | Стало | Почему |
|---|---|---|---|---|
| все четыре | кнопка, шапка | `New` | `Post` (+ `aria-label="Post an event"`) | Кнопка — глагол, из которого виден результат («Микрокопи»). Полное имя словаря не помещается рядом с `Filters`, поэтому оно в aria — тот же приём, что `Invite` в превью `D-60` |
| `feed` | скрытый заголовок | `First path` | `People` | Скринридер читал внутренний термин брифа («первый путь», §4). Заголовок называет место, а не нашу схему |
| `feed-error` | сообщение состояния | `The connection dropped while we were looking. Your own events and requests are safe.` | `The connection dropped. Your own events and requests are safe.` | «Мы» о себе не говорим — кроме живой проверки селфи (Словарь, «Обращение») |

**Проверено и оставлено как есть:** `Events nearby` (заголовок называет место словом
словаря) · `Filters` (кнопка, открывающая место, — названное исключение) · `Nearby` / `Mine`
(срез вкладки, не действие) · `Ask to join`, `Invite`, `Show events further out`,
`Post an event`, `Try again`, `See people` (словарь, «Действия») · `No events within 5 km yet`
и текст под ним (пустое ведёт к действию) · `Couldn't load events nearby` (ошибка называет
предмет) · `Looking for events near you` (загрузка называет, что грузится) · все мета-строки
превью (форматы `D-60`).

**Не тронуто — это пишет человек:** `Board games` · `Morning run along the embankment` ·
`Coffee and a walk in Podil` (§5 этого файла).

**Найдено по ходу, но за пределами этих страниц:** та же формулировка
«while we were looking» стоит в `deck-error` — поправим, когда дойдём до колоды.

### Остальные двенадцать экранов — 30.09

Разбирали шесть субагентов, по одному на семейство экранов; решения по спорным местам
приняты ведущим и отмечены отдельно. Всего **47 правок**.

#### Колода · профиль человека · совпадение

| Страница | Тип | Было | Стало | Почему |
|---|---|---|---|---|
| `deck` ×4 | скрытый заголовок | `Second path` | `Events` | Скринридер читал внутренний термин брифа |
| `deck-empty` | кнопка | `Expand search` | `Expand search` + `aria-label="Show people further out"` | Полное имя не помещается рядом с `Reset filters`; парная кнопка в ленте — `Show events further out` |
| `deck-error` | сообщение | `The connection dropped **while we were looking**…` | `The connection dropped…` | «Мы» о себе — только на живой проверке селфи |
| `profile-empty` | сообщение | `Olena hasn’t posted anything yet. You can still **say hi**, or look at events nearby.` | `Events here are posted by people themselves — Olena hasn’t posted one yet.` | `say hi` обещал контакт, которого там нет: писать можно только после взаимности. Плюс уточнитель `nearby` вне закрытого списка |
| `match` | кнопка | `Keep swiping` | `See people` | `swipe` — язык конкурентов, в словаре запрещён |

#### Верификация · радар

| Страница | Тип | Было | Стало | Почему |
|---|---|---|---|---|
| `verify` | кнопка | `Do this later` | `Keep browsing` | Одно действие — одно имя; так же названо на загрузке и ошибке |
| `verify-error` | заголовок | `**We** couldn’t read your face` | `Couldn’t read your face` | «Мы» о себе; эталон ошибки — `Couldn’t load your chats` |
| `verify-error` | подпись | `…a person from the team looks at it — **not a robot**.` | `There’s no limit on tries — after two, someone from the team looks at your selfie.` | Шутка в ошибке; два имени одного человека; безлимитная пересдача названа заранее (`D-26`) |
| `verify-loading` | подпись | `…while **we** check.` | `…while the check runs.` | «Мы» здесь про автоматику |
| `verify-loading` | скрытый заголовок | `Checking` (дважды подряд) | `Take the selfie` | Две секции с одним именем |
| `verify-success` | кнопка | `Back to Olena` | `Open the chat` | Кнопка — глагол; одно имя возврата в чат |
| `verify-success-signup` | сообщение | `people you **match** with` | `anyone you both said yes to` | `match` как событие — язык дейтинга |
| `verify-waiting` | заголовок | `A person is looking at your selfie` | `Someone from the team is checking your selfie` | Одно имя человека за экраном |
| `verify-waiting` | сообщение | `Automatic checks didn’t **recognise you** twice…` | `The automatic check couldn’t read your face twice…` | Верификация подтверждает живое фото, не личность (§7.3) |
| `verify-waiting` | выход | `Your chat with Olena is waiting →` | `Open the chat →` | Фраза вместо действия; одно имя |
| `verify-success` | скрытый заголовок | `Second path` | `Events` | Тот же внутренний термин |

#### Диалог

| Страница | Тип | Было | Стало | Почему |
|---|---|---|---|---|
| `dialog-empty` | заголовок | `You **matched** 2 minutes ago` | `No messages yet` | Пустое называет, чего нет; `match` как событие запрещён |
| `dialog-empty` | сообщение | `You both like hiking…` | `You and Olena both said yes 2 minutes ago. You both like hiking… ` | Факт взаимности переехал во вторую строку — это «почему так бывает» |
| `dialog-success` | текст | `**We’ll** ask both of you the day before: still going?` | `A reminder comes the day before: Still going?` | «Мы» о себе; напоминание названо своим именем (`D-16`) |
| `dialog-waiting` | кнопка | `Invite together **instead**` | `Invite together` | Уточнитель вне закрытого списка `D-60` |
| `dialog-waiting` | сообщение | `…hasn’t answered **the day** yet… **just** expires` | `…hasn’t answered yet… expires` | Смягчитель и калька |
| `dialog-loading` | сообщение | `Loading your **conversation**` | `Loading your chat with Olena` | Объект зовётся `chat` |
| `dialog` ×6 | скрытый заголовок | `Conversation` | `Chat with Olena` | То же: один объект — одно имя |

#### Позвать вдвоём

| Страница | Тип | Было | Стало | Почему |
|---|---|---|---|---|
| `invite` | скрытый заголовок | `Nothing fits` | `All events` | Заголовок называет место, а не вывод о выборе |
| `invite-empty` | сообщение | `You can **pick a day** yourselves instead — that works the same way.` | `You can suggest a day in the chat instead — that makes an event for the two of you.` | Действие названо словарным именем; виден результат (`D-39`) |
| `invite-empty` | кнопка | `Suggest a day **instead**` | `Suggest a day` | Уточнитель вне закрытого списка |
| `invite-error` | скрытый заголовок | `Alone` | `Events on your own` | **`alone` стоит прямо в списке запретных слов** (правило 13, `D-20`) |
| `invite-error` | сообщение | `Olena can do it **in a minute** — a selfie, nothing else.` | `Olena only needs to take a selfie.` | Продукт не контролирует срок: на ручной проверке до 24 часов |
| `invite-success` | заголовок | `You’re both **in**` | `You’re both confirmed` | Участие называется `going` → `confirmed` |
| `invite-success` | сообщение | `Saturday 18:00` | `Saturday, 18:00` | Формат карточки `D-60` |
| `invite-success` | текст | `**We’ll** ask you the day before` | `A reminder comes the day before` | «Мы» о себе |
| `invite-waiting` | кнопка | `Withdraw **the** invite` | `Withdraw **my** invite` | Параллель с `Withdraw my request` |
| `invite-waiting` | подпись | `…until Saturday.` | `…until Saturday. Withdrawing it cancels the invite for Olena.` | Опасное действие обязано сказать, что произойдёт |

#### Карточка события · мои события

| Страница | Тип | Было | Стало | Почему |
|---|---|---|---|---|
| `plan`, `plan-loading` | скрытый заголовок | `Join` | `Ask to join` | Словарь запрещает `Join`: место даёт автор |
| `plan-waiting` | скрытый заголовок | `Waiting for the author` | `Waiting for Andrii` | «Автор» — внутренний термин; о человеке по имени |
| `plan-success` | скрытый заголовок | `You are in` | `You’re going` | Участие — `going` |
| `plan-success` | сообщение | `· **we’ll ask** the day before` | `· Still going? comes the day before` | «Мы» о себе; имя напоминания |
| `plan-success` | выход | вёл на `feed.html` | ведёт на `my-events.html` | Подпись обещает «Мои события», а вела в ленту |
| `plan`, `plan-loading` | кнопка | `Invite together` на событии с **одним** местом | кнопка убрана | `D-36`: пара в `+1` не помещается; в ленте у той же строки её справедливо нет |
| `my-events` ×4 | кнопка | `New` | `Post` + `aria-label="Post an event"` | Два среза одной вкладки звали создание разными именами |
| `my-events` | подпись | `Last Sunday` | `20 Sep` | Относительное время — только в списке чатов |

#### Чаты · поиск · мой профиль

| Страница | Тип | Было | Стало | Почему |
|---|---|---|---|---|
| `chats` | подпись | `You **matched** — no messages yet` | `You both said yes — no messages yet` | `match` как событие |
| `search-empty` | заголовок | `Nothing for “bouldering” yet` | `No events or people for “bouldering” yet` | Пустое называет предмет |
| `search-empty` | сообщение | `No events and no people with this interest nearby…` | `Events here are posted by people like you — yours would be the first one with this interest.` | Вторая строка объясняет, почему так бывает |
| `search-empty` | кнопка | `Post a **bouldering** event` | `Post an event` | Одно действие — одно имя |
| `search-empty`, `search-error` | скрытый заголовок | `Nothing found` · `Search failed` | `Results` | В рабочем виде та же секция уже `Results` |
| `search-error` | сообщение | `Your **query** is still here — try it again.` | `Your search is still here.` | Канцелярское слово; «что делать» уже в кнопке |
| `my-profile` ×2 | кнопка | `Edit` | `Edit` + `aria-label="Edit profile"` | Короткое в кнопке, полное в aria |
| `my-profile` | подпись | `1 waiting for you` | `1 request` | Отклик — `request` на обеих сторонах |
| `my-profile` | подпись | `0` | `None` | Нуля в продукте не бывает `D-60` |
| `my-profile` ×2 | подпись | `account, notifications` | `Account and notifications` | Единообразие значений в списке |
| `my-profile` ×2 | добавлена строка | — | `You’ll need to sign in again to get back to your chats and events.` | Опасное действие: до нажатия сказать, что произойдёт |

### Сквозная сверка: одно действие — одно имя

После правок прогнан скрипт по всем 49 страницам. Расхождения, которые он нашёл, и что с ними:

| Действие или предмет | Как звалось на разных экранах | Решение |
|---|---|---|
| Вернуться в колоду | `See people` · `Keep swiping` (совпадение) | **`See people`** везде; `swipe` запрещён словарём |
| Отложить верификацию | `Do this later` · `Keep browsing` | **`Keep browsing`** — это **другое** действие, чем «уйти к людям», и оно записано в словарь отдельной строкой |
| Вернуться в чат | `Back to Olena` · `Your chat with Olena is waiting →` · `Open the chat` | **`Open the chat`** везде |
| Создать событие | `New` (лента, мои события) · `Post an event` · `Post a bouldering event` | **`Post`** в тесной шапке (полное имя в aria), **`Post an event`** там, где помещается |
| Отозвать | `Withdraw my request` · `Withdraw the invite` | **`Withdraw my …`** — одна форма для обоих |
| Предложить день | `Suggest a day` · `Suggest a day instead` | **`Suggest a day`**: `instead` вне закрытого списка |
| Позвать вдвоём | `Invite together` · `Invite` · `Invite together instead` | **`Invite together`**, `Invite` — только где не помещается (`D-60`) |
| Момент взаимности | `You matched …` ×2 · `You and Olena both said yes` | **факт**: «both said yes»; `match` — только в списках |
| Чат как объект | `Conversation` ×6 · `chat` | **`chat`** везде, включая скрытые заголовки |
| Участие | `You are in` · `You’re both in` · `going` / `confirmed` | **`going` → `confirmed`** |
| Отклик у автора | `1 waiting for you` · `2 requests` | **`request`** на обеих сторонах |

**Осталось намеренно разным:** `Invite` против `Invite together` (тесная строка, `D-60`),
`People` / `Events` на радаре против `See people` / `Look at events` (экран учит соответствию
с таб-баром — исключение записано в `voice.md`), `Filters` как имя места, а не действия.

## 7. Что дальше

1. По каждому расхождению из §4.1 и §4.2 принять решение: одно имя или осознанно разные.
2. Решения записать сюда же — таблица станет **источником правды**, с которой сверяется
   каждая строка продукта.
3. Голос, которым всё это написано, — [`voice.md`](./voice.md).
