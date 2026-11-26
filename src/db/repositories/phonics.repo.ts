import { asc, eq, inArray } from "drizzle-orm";
import type {
  Exercise,
  PhonicsLesson,
  PhonicsRule,
  PhonicsScope,
  PhonicsSymbol,
} from "@/modules/practice-pinyin-zhuyin/types";
import { db } from "../index";
import {
  phonicsExercises,
  phonicsLessons,
  phonicsRules,
  phonicsSymbols,
} from "../schema";

function mapSymbol(row: typeof phonicsSymbols.$inferSelect): PhonicsSymbol {
  return {
    id: row.id,
    scope: row.scope as PhonicsScope,
    kind: row.kind as PhonicsSymbol["kind"],
    label: row.label,
    zhuyin: row.zhuyin ?? undefined,
    pinyin: row.pinyin ?? undefined,
    group: row.groupName,
    description: row.description,
    descriptionId: row.descriptionId,
    audio: (row.audio as PhonicsSymbol["audio"]) ?? undefined,
    examples: (row.examples as PhonicsSymbol["examples"]) ?? [],
    notes: (row.notes as string[] | null) ?? undefined,
    commonMistakes: (row.commonMistakes as string[] | null) ?? undefined,
  };
}

function mapRule(row: typeof phonicsRules.$inferSelect): PhonicsRule {
  return {
    id: row.id,
    scope: row.scope as PhonicsScope,
    title: row.title,
    titleId: row.titleId,
    explanation: row.explanation,
    explanationId: row.explanationId,
    examples: (row.examples as PhonicsRule["examples"]) ?? [],
  };
}

function mapLesson(row: typeof phonicsLessons.$inferSelect): PhonicsLesson {
  return {
    id: row.id,
    scope: row.scope as PhonicsScope,
    slug: row.slug,
    order: row.order,
    title: row.title,
    titleId: row.titleId,
    summary: row.summary,
    summaryId: row.summaryId,
    objectives: (row.objectives as string[]) ?? [],
    estimatedMin: row.estimatedMin,
    xpReward: row.xpReward,
    symbolIds: (row.symbolIds as string[]) ?? [],
    ruleIds: (row.ruleIds as string[]) ?? [],
    exerciseIds: (row.exerciseIds as string[]) ?? [],
    quizExerciseIds: (row.quizExerciseIds as string[]) ?? [],
  };
}

function mapExercise(row: typeof phonicsExercises.$inferSelect): Exercise {
  return {
    id: row.id,
    scope: row.scope as PhonicsScope,
    lessonId: row.lessonId,
    type: row.type as Exercise["type"],
    prompt: row.prompt,
    promptId: row.promptId,
    promptAudioText: row.promptAudioText ?? undefined,
    promptAudio: (row.promptAudio as Exercise["promptAudio"]) ?? undefined,
    choices: (row.choices as string[] | null) ?? undefined,
    choiceLabels: (row.choiceLabels as Record<string, string> | null) ?? undefined,
    correctChoice: row.correctChoice ?? undefined,
    pairs: (row.pairs as Exercise["pairs"]) ?? undefined,
    build: (row.build as Exercise["build"]) ?? undefined,
    compare: (row.compare as Exercise["compare"]) ?? undefined,
    explanation: row.explanation,
    explanationId: row.explanationId,
  };
}

export function listPhonicsSymbolsByScope(scope: PhonicsScope): PhonicsSymbol[] {
  return db
    .select()
    .from(phonicsSymbols)
    .where(eq(phonicsSymbols.scope, scope))
    .all()
    .map(mapSymbol);
}

export function listPhonicsRulesByScope(scope: PhonicsScope): PhonicsRule[] {
  return db
    .select()
    .from(phonicsRules)
    .where(eq(phonicsRules.scope, scope))
    .all()
    .map(mapRule);
}

export function listPhonicsLessonsByScope(scope: PhonicsScope): PhonicsLesson[] {
  return db
    .select()
    .from(phonicsLessons)
    .where(eq(phonicsLessons.scope, scope))
    .orderBy(asc(phonicsLessons.order))
    .all()
    .map(mapLesson);
}

export function getPhonicsLesson(scope: PhonicsScope, lessonId: string): PhonicsLesson | undefined {
  const row = db
    .select()
    .from(phonicsLessons)
    .where(eq(phonicsLessons.id, lessonId))
    .get();
  if (!row || row.scope !== scope) return undefined;
  return mapLesson(row);
}

export function getPhonicsSymbolsByIds(ids: string[]): PhonicsSymbol[] {
  if (ids.length === 0) return [];
  const rows = db
    .select()
    .from(phonicsSymbols)
    .where(inArray(phonicsSymbols.id, ids))
    .all();
  const byId = new Map(rows.map((r) => [r.id, mapSymbol(r)]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as PhonicsSymbol[];
}

export function getPhonicsRulesByIds(ids: string[]): PhonicsRule[] {
  if (ids.length === 0) return [];
  const rows = db
    .select()
    .from(phonicsRules)
    .where(inArray(phonicsRules.id, ids))
    .all();
  const byId = new Map(rows.map((r) => [r.id, mapRule(r)]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as PhonicsRule[];
}

export function getPhonicsExercisesByIds(ids: string[]): Exercise[] {
  if (ids.length === 0) return [];
  const rows = db
    .select()
    .from(phonicsExercises)
    .where(inArray(phonicsExercises.id, ids))
    .all();
  const byId = new Map(rows.map((r) => [r.id, mapExercise(r)]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Exercise[];
}

export function getPhonicsExerciseById(id: string): Exercise | undefined {
  const row = db
    .select()
    .from(phonicsExercises)
    .where(eq(phonicsExercises.id, id))
    .get();
  return row ? mapExercise(row) : undefined;
}

export function listAllPhonicsLessons(): PhonicsLesson[] {
  return db
    .select()
    .from(phonicsLessons)
    .orderBy(asc(phonicsLessons.scope), asc(phonicsLessons.order))
    .all()
    .map(mapLesson);
}
