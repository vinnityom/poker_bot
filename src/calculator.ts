import { Player } from "./game";

export type Transaction = {
  from: string;
  to: string;
  amount: number;
};

export function settleDebts(players: Player[]): Transaction[] {
  const transactions: Transaction[] = [];

  // Рассчитываем баланс каждого игрока (сколько он должен или заработал)
  const balances = players.map((p) => ({
    name: p.name,
    balance: p.left - p.bought,
  }));

  // Разделяем должников и кредиторов
  const debtors = balances
    .filter((p) => p.balance < 0)
    .sort((a, b) => a.balance - b.balance);
  const creditors = balances
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);

    transactions.push({ from: debtor.name, to: creditor.name, amount });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return transactions;
}

export function validateTransactions(
  players: Player[],
  transactions: Transaction[]
): boolean {
  const balances = new Map<string, number>();
  players.forEach((p) => balances.set(p.name, p.left - p.bought));

  transactions.forEach(({ from, to, amount }) => {
    balances.set(from, (balances.get(from) || 0) + amount);
    balances.set(to, (balances.get(to) || 0) - amount);
  });

  return Array.from(balances.values()).every((balance) => balance === 0);
}

export function formatTransactions(transactions: Transaction[]): string {
  return transactions
    .map((t) => `${t.from} переводит ${t.amount} игроку ${t.to}`)
    .join("\n");
}
