import { settleDebts, Transaction } from "./calculator";
import { Errors } from "./errors.enum";

export type Player = {
  name: string;
  bought: number;
  left: number;
};

export class PokerGame {
  private players: Player[] = [];

  addPlayer(name: string, bought: number, left: number) {
    const existingPlayer = this.players.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );

    if (existingPlayer) {
      throw Errors.PlayerDuplicate;
    }

    this.players.push({ name, bought, left });
  }

  addPlayers(data: string[]) {
    let response = "";
    for (let i = 0; i < data.length; i += 3) {
      const name = data[i];
      const bought = parseInt(data[i + 1]);
      const left = parseInt(data[i + 2]);

      if (isNaN(bought) || isNaN(left)) {
        response += `⛔ Ошибка: Неверные данные для ${name}\n`;
        continue;
      }

      try {
        this.addPlayer(name, bought, left);
        response += `✅ Игрок ${name} добавлен!\n`;
      } catch (error) {
        if (error === Errors.PlayerDuplicate) {
          response += `⚠️ Игрок ${name} уже существует!\n`;
        } else {
          response += `⛔ Ошибка при добавлении ${name}\n`;
        }
      }
    }
    return response;
  }

  editPlayer(name: string, bought: number, left: number) {
    const player = this.players.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );

    if (!player) {
      throw Errors.PlayerNotFound;
    }

    player.bought = bought;
    player.left = left;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getPlayerList(): string {
    if (this.players.length === 0) {
      return "❌ Список игроков пуст.";
    }

    return this.players
      .map(
        (p, index) =>
          `${index + 1}. ${p.name}: закуп ${p.bought}, выход ${p.left}`,
      )
      .join("\n");
  }

  calculateTransactions(): Transaction[] {
    const totalBought = this.players.reduce((sum, p) => sum + p.bought, 0);
    const totalLeft = this.players.reduce((sum, p) => sum + p.left, 0);

    if (totalBought !== totalLeft) {
      throw {
        name: Errors.ImbalanceError,
        message: "Общая сумма закупа не равна сумме выхода.",
        difference: totalBought - totalLeft,
        playerList: this.getPlayerList(),
      };
    }

    const transactions = settleDebts(this.players);
    return transactions;
  }

  resetGame() {
    this.players = [];
  }
}
