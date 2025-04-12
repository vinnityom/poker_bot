import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { formatTransactions } from "./calculator";
import { Errors } from "./errors.enum";
import { PokerGame } from "./game";
import { deleteGame, initStorage, loadGame, saveGame } from "./game-storage";

initStorage().then(() => {
  function getGame(chatId: number): PokerGame {
    return loadGame(chatId);
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
  const bot = new TelegramBot(TOKEN);

  const url = process.env.WEBHOOK_URL!;
  bot.setWebHook(`${url}/bot${TOKEN}`);

  // bot.startPolling();

  const app = express();
  app.use(bodyParser.json());

  app.post(`/bot${TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  app.get("/health", (_req, res) => {
    res.send("OK");
  });

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      "Привет! Добавляй игроков командами:\n" +
      "➕ `/add_player {имя} {закуп} {выход}` – добавить одного игрока\n" +
      "➕ `/add_players {имя1} {закуп1} {выход1} {имя2} {закуп2} {выход2} ...` – добавить сразу несколько игроков\n" +
      "➕ `/edit_player {имя} {закуп} {выход}` – редактировать уже существующего игрока\n" +
      "📃 `/list_players` – показать список игроков\n" +
      "📊 `/close_game` – рассчитать выплаты и завершить игру",
      { parse_mode: "Markdown" },
    );
  });

  bot.onText(/\/add_player (\S+) (\d+) (\d+)/, (msg, match) => {
    if (!match) return;

    const game = getGame(msg.chat.id);

    const [, name, bought, left] = match;
    try {
      game.addPlayer(name, parseInt(bought), parseInt(left));
      saveGame();

      bot.sendMessage(msg.chat.id, `✅ Игрок ${name} добавлен!`);
    } catch (error) {
      if (error === Errors.PlayerDuplicate) {
        bot.sendMessage(msg.chat.id, `⚠️  Игрок ${name} уже существует!`);
      }
    }
  });

  bot.onText(/\/add_players (.+)/, (msg, match) => {
    if (!match) return;

    const game = getGame(msg.chat.id);

    const playerData = match[1].split(" ");
    if (playerData.length % 3 !== 0) {
      bot.sendMessage(
        msg.chat.id,
        "⛔ Ошибка: Данные должны быть в формате `/add_players имя1 закуп1 выход1 имя2 закуп2 выход2`",
      );
      return;
    }

    const result = game.addPlayers(playerData);
    saveGame();

    bot.sendMessage(msg.chat.id, result);
  });

  bot.onText(/\/edit_player (\S+) (\d+) (\d+)/, (msg, match) => {
    if (!match) return;

    const [, name, bought, left] = match;

    const game = getGame(msg.chat.id);

    try {
      game.editPlayer(name, parseInt(bought), parseInt(left));
      saveGame();

      bot.sendMessage(msg.chat.id, `✅ Данные игрока ${name} обновлены!`);
    } catch (error) {
      if (error === Errors.PlayerNotFound) {
        bot.sendMessage(msg.chat.id, `⚠️ Игрок ${name} не найден!`);
      } else {
        bot.sendMessage(
          msg.chat.id,
          `⛔ Ошибка при редактировании игрока ${name}`,
        );
      }
    }
  });

  bot.onText(/\/list_players/, (msg) => {
    const game = getGame(msg.chat.id);
    const playerList = game.getPlayerList();
    bot.sendMessage(msg.chat.id, playerList);
  });

  bot.onText(/\/close_game/, (msg) => {
    const game = getGame(msg.chat.id);
    const players = game.getPlayers();

    if (players.length === 0) {
      bot.sendMessage(
        msg.chat.id,
        "Нет игроков. Добавьте их командой /add_player.",
      );
      return;
    }
    try {
      const transactions = game.calculateTransactions();
      const response = formatTransactions(transactions);
      bot.sendMessage(msg.chat.id, response);

      deleteGame(msg.chat.id);
      game.resetGame();
    } catch (error: any) {
      if (error.name === Errors.ImbalanceError) {
        bot.sendMessage(
          msg.chat.id,
          `❌ Ошибка: ${error.message}\n` +
          `Разница: ${error.difference > 0 ? "+" : ""}${error.difference}\n\n` +
          `📃 Список игроков:\n${error.playerList}`,
        );
      } else {
        bot.sendMessage(msg.chat.id, "⛔ Произошла ошибка при расчете.");
      }
    }
  });

  console.log("Бот запущен...");

  // Запускаем express сервер
  app.listen(8000, () => {
    console.log("Express server is running on port 8000");
  });
});
