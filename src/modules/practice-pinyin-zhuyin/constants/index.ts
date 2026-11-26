import type {
  Exercise,
  PhonicsLesson,
  PhonicsRule,
  PhonicsScope,
  PhonicsSymbol,
} from "../types";
import {
  PINYIN_EXERCISES,
  PINYIN_LESSONS,
  PINYIN_RULES,
  PINYIN_SYMBOLS,
} from "./pinyin";
import {
  ZHUYIN_EXERCISES,
  ZHUYIN_LESSONS,
  ZHUYIN_RULES,
  ZHUYIN_SYMBOLS,
} from "./zhuyin";

export const ALL_SYMBOLS: PhonicsSymbol[] = [
  ...PINYIN_SYMBOLS,
  ...ZHUYIN_SYMBOLS,
];
export const ALL_RULES: PhonicsRule[] = [...PINYIN_RULES, ...ZHUYIN_RULES];
export const ALL_LESSONS: PhonicsLesson[] = [
  ...PINYIN_LESSONS,
  ...ZHUYIN_LESSONS,
];
export const ALL_EXERCISES: Exercise[] = [
  ...PINYIN_EXERCISES,
  ...ZHUYIN_EXERCISES,
];

export const SCOPES: Array<{
  id: PhonicsScope;
  title: string;
  titleId: string;
  subtitle: string;
  description: string;
  accentLabel: string;
  symbolLabel: string;
}> = [
  {
    id: "pinyin",
    title: "Pinyin",
    titleId: "Pinyin",
    subtitle: "Romanized Mandarin",
    description:
      "Learn initials, finals, compound finals, syllable formation, and spelling rules used across Mainland Mandarin learning.",
    accentLabel: "Putonghua / Mainstream",
    symbolLabel: "Initials & Finals",
  },
  {
    id: "zhuyin",
    title: "Zhuyin",
    titleId: "Zhuyin (Bopomofo)",
    subtitle: "Bopomofo Symbols",
    description:
      "Learn initials, medials, finals, syllable formation, and special tone rules used in Taiwan Mandarin learning.",
    accentLabel: "Guoyu / Taiwan",
    symbolLabel: "Symbols & Medials",
  },
];

export function getScope(scope: PhonicsScope) {
  const found = SCOPES.find((s) => s.id === scope);
  if (!found) throw new Error(`Unknown phonics scope: ${scope}`);
  return found;
}

export function getLessonsByScope(scope: PhonicsScope) {
  return ALL_LESSONS.filter((l) => l.scope === scope).sort(
    (a, b) => a.order - b.order,
  );
}

export function getLesson(scope: PhonicsScope, lessonId: string) {
  return ALL_LESSONS.find((l) => l.scope === scope && l.id === lessonId);
}

export function getSymbolsByIds(ids: string[]) {
  return ids
    .map((id) => ALL_SYMBOLS.find((s) => s.id === id))
    .filter(Boolean) as PhonicsSymbol[];
}

export function getRulesByIds(ids: string[]) {
  return ids
    .map((id) => ALL_RULES.find((r) => r.id === id))
    .filter(Boolean) as PhonicsRule[];
}

export function getExercisesByIds(ids: string[]) {
  return ids
    .map((id) => ALL_EXERCISES.find((e) => e.id === id))
    .filter(Boolean) as Exercise[];
}

export function getExerciseById(id: string) {
  return ALL_EXERCISES.find((e) => e.id === id);
}
