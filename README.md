# Telegram-бот для уведомлений о формах

При отправке форм со страниц **main** (Login) и **add** (Register) бот отправляет в Telegram сообщение с данными формы в том же виде, что и в `output/main.json` / `output/add.json`.

## Настройка

1. Создайте бота в Telegram через [@BotFather](https://t.me/BotFather), получите токен.
2. Узнайте ID чата (например, напишите боту [@userinfobot](https://t.me/userinfobot)).
3. Скопируйте `.env.example` в `.env` и заполните (при запуске бот подхватит переменные из `.env`):
   - `TELEGRAM_BOT_TOKEN` — токен бота
   - `TELEGRAM_CHAT_ID` — ID чата для уведомлений

## Запуск

```bash
cd bot
npm install
npm start
```

По умолчанию бот слушает порт **3001**.

## Интеграция с основным сервером

Чтобы при отправке форм с сайта уведомления уходили в Telegram:

1. Запустите бота (`cd bot && npm start`).
2. В папке `server` задайте переменную окружения с URL бота, например:
   ```bash
   BOT_URL=http://localhost:3001
   ```
3. Запустите основной сервер (`cd server && npm start`).

Сервер будет отправлять на бота запросы:
- `POST /notify/main` — при отправке формы Login (тело как в `output/main.json`).
- `POST /notify/add` — при отправке формы Register (тело как в `output/add.json`).

Если `BOT_URL` не задан, сервер по-прежнему только пишет данные в `output/*.json`, уведомления в Telegram не отправляются.
