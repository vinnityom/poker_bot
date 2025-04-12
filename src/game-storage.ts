import { PokerGame } from "./game";
import { loadData, saveData } from "./gist-storage";

let state: Record<string, PokerGame>;

export async function initStorage() {
  state = {};
  const chats = await loadData();
  const entries = Object.entries(chats);

  entries.forEach(([chatId, players]) => {
    const game = new PokerGame();
    players.forEach((p: any) => game.addPlayer(p.name, p.bought, p.left));

    state[chatId] = game;
  });
}

export function saveGame() {
  const entries = Object.entries(state);
  const data = entries.reduce((acc, [chatId, game]) => {
    console.log("players: ", game.getPlayers());
    return { ...acc, [chatId]: game.getPlayers() };
  }, {});

  console.log("entries: ", entries);
  console.log("data: ", entries);

  saveData(data);
}

export function loadGame(chatId: number): PokerGame {
  const storedGame = state[chatId];
  if (storedGame) {
    return storedGame;
  }

  const newGame = new PokerGame();
  state[chatId] = newGame;
  return newGame;
}

export function deleteGame(chatId: number) {
  delete state[chatId];
  saveGame();
}
