# Poker Settlement Bot

Этот бот помогает рассчитать минимальное количество транзакций между игроками после покерной игры.

## 🚀 Функциональность
- Добавление игроков с суммой закупа и выхода.
- Групповое (bulk) добавление игроков.
- Редактирование данных игрока.
- Расчёт транзакций для погашения долгов.
- Поддержка работы в групповых чатах Telegram.

## 📦 Установка

1. **Склонируйте репозиторий**:
   ```sh
   git clone https://github.com/your-repo/poker-bot.git
   cd poker-bot
   ```

2. **Установите зависимости**:
   ```sh
   npm install
   ```

3. **Создайте `.env` файл и укажите токен Telegram-бота**:
   ```sh
   echo "BOT_TOKEN=your_telegram_bot_token" > .env
   ```

## 🏃 Запуск локально

```sh
npm start
```

## 🚀 Деплой

### Railway (рекомендуется)
1. Зарегистрируйтесь на [Railway](https://railway.app/).
2. Подключите репозиторий и установите переменную окружения `BOT_TOKEN`.
3. Railway автоматически задеплоит бота.

### VPS (Ubuntu/Debian)
1. Установите **Node.js** и **Git**:
   ```sh
   sudo apt update && sudo apt install -y nodejs git
   ```
2. Склонируйте репозиторий и установите зависимости:
   ```sh
   git clone https://github.com/your-repo/poker-bot.git
   cd poker-bot
   npm install
   ```
3. Запустите бота с **PM2**:
   ```sh
   npm install -g pm2
   pm2 start bot.js --name poker-bot
   pm2 save
   pm2 startup
   ```

## 📜 Использование

### 📌 Основные команды
| Команда | Описание |
|---------|----------|
| `/start` | Начало работы с ботом |
| `/add_player {имя} {закуп} {выход}` | Добавить игрока |
| `/bulk_add {json}` | Массовое добавление игроков |
| `/edit_player {имя} {закуп} {выход}` | Изменить данные игрока |
| `/players` | Список игроков |
| `/close_game` | Завершить игру и рассчитать транзакции |

## 🛠 Контрибьютинг
Если хотите предложить улучшения, создавайте PR или открывайте issue.

## 📄 Лицензия
Этот проект распространяется под лицензией MIT.

