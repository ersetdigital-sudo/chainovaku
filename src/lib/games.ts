import type { Item } from "./services";

export type Game = {
  zone: boolean;
  label?: string;
  mark: string;
  tag: string;
  items: Item[];
  chips: Item[];
};

export const GAMES: Record<string, Game> = {
  "Mobile Legends": {
    zone: true,
    mark: "ML",
    tag: "MOBA",
    items: [
      ["5 Diamond", "", 2900],
      ["86 Diamond", "", 22000],
      ["172 Diamond", "", 43500],
      ["257 Diamond", "", 64500],
      ["344 Diamond", "", 86500],
      ["706 Diamond", "", 172000],
    ],
    chips: [
      ["5 💎", "", 2900],
      ["86 💎", "", 22000],
      ["172 💎", "", 43500],
      ["257 💎", "", 64500],
      ["344 💎", "", 86500],
      ["706 💎", "", 172000],
    ],
  },
  "Free Fire": {
    zone: false,
    mark: "FF",
    tag: "Battle Royale",
    items: [
      ["5 Diamond", "", 1500],
      ["70 Diamond", "", 9500],
      ["140 Diamond", "", 19000],
      ["355 Diamond", "", 47500],
      ["720 Diamond", "", 95000],
      ["1450 Diamond", "", 190000],
    ],
    chips: [
      ["5 💎", "", 1500],
      ["70 💎", "", 9500],
      ["140 💎", "", 19000],
      ["355 💎", "", 47500],
      ["720 💎", "", 95000],
      ["1450 💎", "", 190000],
    ],
  },
  "PUBG Mobile": {
    zone: false,
    mark: "PUBG",
    tag: "Battle Royale",
    items: [
      ["60 UC", "", 15000],
      ["325 UC", "", 75000],
      ["660 UC", "", 149000],
      ["1800 UC", "", 375000],
    ],
    chips: [
      ["60 UC", "", 15000],
      ["325 UC", "", 75000],
      ["660 UC", "", 149000],
      ["1800 UC", "", 375000],
    ],
  },
  "Genshin Impact": {
    zone: true,
    label: "Server",
    mark: "GI",
    tag: "Open World",
    items: [
      ["60 Genesis Crystal", "", 16000],
      ["330 Genesis Crystal", "", 79000],
      ["1090 Genesis Crystal", "", 249000],
      ["Blessing of the Welkin Moon", "", 79000],
    ],
    chips: [
      ["60 Crystal", "", 16000],
      ["330 Crystal", "", 79000],
      ["1090 Crystal", "", 249000],
      ["Welkin", "", 79000],
    ],
  },
  "Honor of Kings": {
    zone: false,
    mark: "HOK",
    tag: "MOBA",
    items: [
      ["16 Tokens", "", 3000],
      ["80 Tokens", "", 15000],
      ["240 Tokens", "", 45000],
      ["400 Tokens", "", 75000],
      ["800 Tokens", "", 150000],
      ["1600 Tokens", "", 300000],
    ],
    chips: [
      ["16 Token", "", 3000],
      ["80 Token", "", 15000],
      ["240 Token", "", 45000],
      ["400 Token", "", 75000],
      ["800 Token", "", 150000],
      ["1600 Token", "", 300000],
    ],
  },
  Roblox: {
    zone: false,
    mark: "RBLX",
    tag: "Sandbox",
    items: [
      ["80 Robux", "", 15000],
      ["400 Robux", "", 75000],
      ["800 Robux", "", 150000],
      ["1700 Robux", "", 300000],
      ["4500 Robux", "", 750000],
      ["10000 Robux", "", 1500000],
    ],
    chips: [
      ["80 R$", "", 15000],
      ["400 R$", "", 75000],
      ["800 R$", "", 150000],
      ["1700 R$", "", 300000],
      ["4500 R$", "", 750000],
      ["10000 R$", "", 1500000],
    ],
  },
};

export const gameNames = Object.keys(GAMES);
