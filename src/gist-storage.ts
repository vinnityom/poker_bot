import axios from "axios";
import { Player } from "./game";

const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

const GIST_NAME = "poker_bot_games.json";

const api = axios.create({
  baseURL: `https://api.github.com/gists`,
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `token ${GITHUB_TOKEN}`,
  },
});

export async function loadData(): Promise<Record<string, Player[]>> {
  const res = await api.get(`/${GIST_ID}`);
  const content = res.data.files[GIST_NAME].content;
  console.log(content);
  return JSON.parse(content);
}

export async function saveData(data: Record<string, Player[]>) {
  const content = JSON.stringify(data, null, 2);

  await api.patch(`/${GIST_ID}`, {
    files: {
      [GIST_NAME]: {
        content,
      },
    },
  });
}
