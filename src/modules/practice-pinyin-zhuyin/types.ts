export type PhonicsScope = "pinyin" | "zhuyin";
export type PhonicsDisplayMode = "pinyin" | "zhuyin" | "both";
export type AudioVariant = "putonghua" | "guoyu";
export type PlaybackRate = 0.75 | 1;
export type Mastery = "new" | "learning" | "review" | "mastered";
export type LessonStatus = "not-started" | "in-progress" | "completed";

export interface PhonicsExample {
  hanzi: string;
  pinyin: string;
  zhuyin: string;
  glossEn: string;
  glossId: string;
  audio?: Partial<Record<AudioVariant, string>>;
}

export interface PhonicsSymbol {
  id: string;
  scope: PhonicsScope;
  kind:
    | "initial"
    | "final"
    | "compound-final"
    | "medial"
    | "tone-mark"
    | "rule";
  label: string;
  zhuyin?: string;
  pinyin?: string;
  group: string;
  description: string;
  descriptionId: string;
  audio?: Partial<Record<AudioVariant, string>>;
  examples: PhonicsExample[];
  notes?: string[];
  commonMistakes?: string[];
}

export interface PhonicsRule {
  id: string;
  scope: PhonicsScope;
  title: string;
  titleId: string;
  explanation: string;
  explanationId: string;
  examples: PhonicsExample[];
}

export type ExerciseType =
  | "recognition"
  | "audio-identification"
  | "matching"
  | "sound-compare"
  | "syllable-build";

export interface MatchPair {
  left: string;
  right: string;
}

export interface BuildAnswer {
  initial: string;
  final: string;
  tone?: string;
  resultPinyin: string;
  resultZhuyin: string;
  hanzi?: string;
}

export interface Exercise {
  id: string;
  scope: PhonicsScope;
  lessonId: string;
  type: ExerciseType;
  prompt: string;
  promptId: string;
  promptAudioText?: string;
  promptAudio?: Partial<Record<AudioVariant, string>>;
  choices?: string[];
  choiceLabels?: Record<string, string>;
  correctChoice?: string;
  pairs?: MatchPair[];
  build?: {
    initialOptions: string[];
    finalOptions: string[];
    toneOptions?: string[];
    answer: BuildAnswer;
  };
  compare?: {
    text: string;
    pinyin: string;
    zhuyin: string;
    focus: string;
  };
  explanation: string;
  explanationId: string;
}

export interface PhonicsLesson {
  id: string;
  scope: PhonicsScope;
  slug: string;
  order: number;
  title: string;
  titleId: string;
  summary: string;
  summaryId: string;
  objectives: string[];
  estimatedMin: number;
  xpReward: number;
  symbolIds: string[];
  ruleIds: string[];
  exerciseIds: string[];
  quizExerciseIds: string[];
}

export interface LessonProgress {
  status: LessonStatus;
  bestScore: number;
  lastScore: number;
  accuracy: number;
  attempts: number;
  completedAt?: string;
  mastery: Mastery;
  incorrectExerciseIds: string[];
}

export interface SymbolProgress {
  mastery: Mastery;
  correct: number;
  incorrect: number;
  lastReviewedAt?: string;
}

export interface IncorrectAnswer {
  id: string;
  scope: PhonicsScope;
  lessonId: string;
  exerciseId: string;
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
  resolved: boolean;
}

export interface ScopeProgress {
  xpEarned: number;
  lessonsCompleted: number;
  accuracy: number;
  masteredSymbols: number;
}

export interface PhonicsProgressState {
  displayMode: PhonicsDisplayMode;
  selectedAccent: AudioVariant;
  playbackRate: PlaybackRate;
  lessonProgress: Record<string, LessonProgress>;
  symbolProgress: Record<string, SymbolProgress>;
  incorrectAnswers: IncorrectAnswer[];
  totalXp: number;
}
