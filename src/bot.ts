import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import { game } from "./game";
import { formatTransactions } from "./calculator";
import { Errors } from "./errors.enum";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Привет! Добавляй игроков командами:\n" +
    "➕ `/add_player {имя} {закуп} {выход}` – добавить одного игрока\n" +
    "➕ `/add_players {имя1} {закуп1} {выход1} {имя2} {закуп2} {выход2} ...` – добавить сразу несколько игроков\n" +
    "📃 `/list_players` – показать список игроков\n" +
    "📊 `/close_game` – рассчитать выплаты и завершить игру",
    { parse_mode: "Markdown" },
  );
});

bot.onText(/\/add_player (\S+) (\d+) (\d+)/, (msg, match) => {
  if (!match) return;

  const [, name, bought, left] = match;
  try {
    game.addPlayer(name, parseInt(bought), parseInt(left));
    bot.sendMessage(msg.chat.id, `✅ Игрок ${name} добавлен!`);
  } catch (error) {
    if (error === Errors.PlayerDuplicate) {
      bot.sendMessage(msg.chat.id, `⚠️  Игрок ${name} уже существует!`);
    }
  }
});

bot.onText(/\/add_players (.+)/, (msg, match) => {
  if (!match) return;

  const playerData = match[1].split(" ");
  if (playerData.length % 3 !== 0) {
    bot.sendMessage(
      msg.chat.id,
      "⛔ Ошибка: Данные должны быть в формате `/add_players имя1 закуп1 выход1 имя2 закуп2 выход2`",
    );
    return;
  }

  const result = game.addPlayers(playerData);
  bot.sendMessage(msg.chat.id, result);
});

bot.onText(/\/edit_player (\S+) (\d+) (\d+)/, (msg, match) => {
  if (!match) return;

  const [, name, bought, left] = match;

  try {
    game.editPlayer(name, parseInt(bought), parseInt(left));
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
  const playerList = game.getPlayerList();
  bot.sendMessage(msg.chat.id, playerList);
});

bot.onText(/\/close_game/, (msg) => {
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

    // После расчёта сбрасываем список игроков
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

  //
  // const transactions = game.calculateTransactions();
  //
  // const response = formatTransactions(transactions);
  //
  // bot.sendMessage(msg.chat.id, response);
  //
  // // После расчёта сбрасываем список игроков
  // game.resetGame();
});

console.log("Бот запущен...");
