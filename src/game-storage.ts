import fs from "fs";
import path from "path";
import { PokerGame } from "./game";

const DATA_DIR = path.resolve("data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

export function saveGame(chatId: number, game: PokerGame) {
  const filePath = path.join(DATA_DIR, `${chatId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(game.getPlayers(), null, 2));
}

export function loadGame(chatId: number): PokerGame {
  const filePath = path.join(DATA_DIR, `${chatId}.json`);
  const game = new PokerGame();

  if (fs.existsSync(filePath)) {
    console.log('found game filed');
    const data = fs.readFileSync(filePath, "utf-8");
    const players = JSON.parse(data);
    players.forEach((p: any) => game.addPlayer(p.name, p.bought, p.left));
  }

  return game;
}

export function deleteGame(chatId: number) {
  const filePath = path.join(DATA_DIR, `${chatId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

