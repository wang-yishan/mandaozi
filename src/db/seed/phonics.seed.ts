import {
  PINYIN_EXERCISES,
  PINYIN_LESSONS,
  PINYIN_RULES,
  PINYIN_SYMBOLS,
} from "../../modules/practice-pinyin-zhuyin/constants/pinyin";
import {
  ZHUYIN_EXERCISES,
  ZHUYIN_LESSONS,
  ZHUYIN_RULES,
  ZHUYIN_SYMBOLS,
} from "../../modules/practice-pinyin-zhuyin/constants/zhuyin";
import { db } from "../index";
import {
  phonicsExercises,
  phonicsLessons,
  phonicsRules,
  phonicsSymbols,
} from "../schema";

export function seedPhonics() {
  const symbols = [...PINYIN_SYMBOLS, ...ZHUYIN_SYMBOLS];
  const rules = [...PINYIN_RULES, ...ZHUYIN_RULES];
  const lessons = [...PINYIN_LESSONS, ...ZHUYIN_LESSONS];
  const exercises = [...PINYIN_EXERCISES, ...ZHUYIN_EXERCISES];

  for (const s of symbols) {
    db.insert(phonicsSymbols)
      .values({
        id: s.id,
        scope: s.scope,
        kind: s.kind,
        label: s.label,
        zhuyin: s.zhuyin ?? null,
        pinyin: s.pinyin ?? null,
        groupName: s.group,
        description: s.description,
        descriptionId: s.descriptionId,
        audio: s.audio ?? null,
        examples: s.examples,
        notes: s.notes ?? null,
        commonMistakes: s.commonMistakes ?? null,
      })
      .onConflictDoUpdate({
        target: phonicsSymbols.id,
        set: {
          scope: s.scope,
          kind: s.kind,
          label: s.label,
          zhuyin: s.zhuyin ?? null,
          pinyin: s.pinyin ?? null,
          groupName: s.group,
          description: s.description,
          descriptionId: s.descriptionId,
          audio: s.audio ?? null,
          examples: s.examples,
          notes: s.notes ?? null,
          commonMistakes: s.commonMistakes ?? null,
        },
      })
      .run();
  }

  for (const r of rules) {
    db.insert(phonicsRules)
      .values({
        id: r.id,
        scope: r.scope,
        title: r.title,
        titleId: r.titleId,
        explanation: r.explanation,
        explanationId: r.explanationId,
        examples: r.examples,
      })
      .onConflictDoUpdate({
        target: phonicsRules.id,
        set: {
          scope: r.scope,
          title: r.title,
          titleId: r.titleId,
          explanation: r.explanation,
          explanationId: r.explanationId,
          examples: r.examples,
        },
      })
      .run();
  }

  for (const l of lessons) {
    db.insert(phonicsLessons)
      .values({
        id: l.id,
        scope: l.scope,
        slug: l.slug,
        order: l.order,
        title: l.title,
        titleId: l.titleId,
        summary: l.summary,
        summaryId: l.summaryId,
        objectives: l.objectives,
        estimatedMin: l.estimatedMin,
        xpReward: l.xpReward,
        symbolIds: l.symbolIds,
        ruleIds: l.ruleIds,
        exerciseIds: l.exerciseIds,
        quizExerciseIds: l.quizExerciseIds,
      })
      .onConflictDoUpdate({
        target: phonicsLessons.id,
        set: {
          scope: l.scope,
          slug: l.slug,
          order: l.order,
          title: l.title,
          titleId: l.titleId,
          summary: l.summary,
          summaryId: l.summaryId,
          objectives: l.objectives,
          estimatedMin: l.estimatedMin,
          xpReward: l.xpReward,
          symbolIds: l.symbolIds,
          ruleIds: l.ruleIds,
          exerciseIds: l.exerciseIds,
          quizExerciseIds: l.quizExerciseIds,
        },
      })
      .run();
  }

  for (const e of exercises) {
    db.insert(phonicsExercises)
      .values({
        id: e.id,
        scope: e.scope,
        lessonId: e.lessonId,
        type: e.type,
        prompt: e.prompt,
        promptId: e.promptId,
        promptAudioText: e.promptAudioText ?? null,
        promptAudio: e.promptAudio ?? null,
        choices: e.choices ?? null,
        choiceLabels: e.choiceLabels ?? null,
        correctChoice: e.correctChoice ?? null,
        pairs: e.pairs ?? null,
        build: e.build ?? null,
        compare: e.compare ?? null,
        explanation: e.explanation,
        explanationId: e.explanationId,
      })
      .onConflictDoUpdate({
        target: phonicsExercises.id,
        set: {
          scope: e.scope,
          lessonId: e.lessonId,
          type: e.type,
          prompt: e.prompt,
          promptId: e.promptId,
          promptAudioText: e.promptAudioText ?? null,
          promptAudio: e.promptAudio ?? null,
          choices: e.choices ?? null,
          choiceLabels: e.choiceLabels ?? null,
          correctChoice: e.correctChoice ?? null,
          pairs: e.pairs ?? null,
          build: e.build ?? null,
          compare: e.compare ?? null,
          explanation: e.explanation,
          explanationId: e.explanationId,
        },
      })
      .run();
  }

  return {
    symbols: symbols.length,
    rules: rules.length,
    lessons: lessons.length,
    exercises: exercises.length,
  };
}
