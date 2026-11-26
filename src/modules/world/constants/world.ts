export interface WorldCategory {
  id: string;
  name: string;
  hanzi: string;
  pinyin: string;
  lessons: string[];
  xp: number;
  desc: string;
}

export const WORLD_CATEGORIES: WorldCategory[] = [
  {
    id: "greetings",
    name: "Greetings",
    hanzi: "你好",
    pinyin: "Greetings",
    lessons: ["Nǐ hǎo", "Zàijiàn", "Xièxie", "Assessment"],
    xp: 120,
    desc: "Say hello, thank and say goodbye with warmth.",
  },
  {
    id: "basic-vocab",
    name: "Basic Vocabulary",
    hanzi: "词汇",
    pinyin: "Vocabulary",
    lessons: ["People & things", "Big & small", "Daily words", "Assessment"],
    xp: 140,
    desc: "Everyday words for people, places and things.",
  },
  {
    id: "numbers",
    name: "Numbers",
    hanzi: "数字",
    pinyin: "Numbers",
    lessons: ["1–5", "6–10", "Counting people", "Assessment"],
    xp: 110,
    desc: "Count, ask prices and talk about quantities.",
  },
  {
    id: "pronunciation",
    name: "Pronunciation",
    hanzi: "发音",
    pinyin: "Pronunciation",
    lessons: ["Four tones", "Tone pairs", "Listening lab", "Assessment"],
    xp: 130,
    desc: "Hear the music of Mandarin and shape each tone.",
  },
  {
    id: "basic-sentences",
    name: "Basic Sentences",
    hanzi: "句子",
    pinyin: "Sentences",
    lessons: ["I am…", "This is…", "Questions", "Assessment"],
    xp: 150,
    desc: "Build your first real sentences, step by step.",
  },
];

export const WORLD_TONE_OPTIONS = [
  "mā (mother)",
  "má (hemp)",
  "mǎ (horse)",
  "mà (scold)",
] as const;
