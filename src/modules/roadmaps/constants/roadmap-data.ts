import type { RoadmapDef } from "../types/roadmap";

export const ROADMAPS: RoadmapDef[] = [
  {
    id: "mandarin-beginner-foundation",
    title: "Mandarin Beginner Foundation",
    description:
      "A step-by-step roadmap from your first Mandarin words to HSK 1 readiness.",
    nodes: [
      {
        id: "intro-mandarin",
        title: "Introduction to Mandarin",
        description:
          "Understand what Mandarin is, how characters work, and what to expect on your learning journey. Build confidence before diving into sounds and vocabulary.",
        category: "foundation",
        estimatedDuration: "10 min",
        prerequisiteIds: [],
        lessonInfo: {
          label: "Overview lesson",
          kind: "lesson",
        },
        choices: [
          {
            id: "intro-mandarin-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "intro-mandarin-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Introduction to Mandarin (Pendalaman)",
              estimatedDuration: "10 min",
            },
          },
        ],

        position: { x: 460, y: 0 },
      },
      {
        id: "pronunciation-foundation",
        title: "Pronunciation Foundation",
        description:
          "Learn the core building blocks of Mandarin pronunciation: initials, finals, and how sounds combine. This unlocks every speaking and listening skill that follows.",
        category: "foundation",
        estimatedDuration: "15 min",
        prerequisiteIds: ["intro-mandarin"],
        lessonInfo: {
          label: "Pronunciation basics",
          kind: "lesson",
        },
        choices: [
          {
            id: "pronunciation-foundation-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "pronunciation-foundation-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Pronunciation Foundation (Pendalaman)",
              estimatedDuration: "15 min",
            },
          },
        ],

        position: { x: 460, y: 240 },
      },
      {
        id: "pinyin",
        title: "Pinyin",
        description:
          "Master Pinyin, the Romanization system used to read and type Mandarin sounds. Practice initials, finals, and common syllables.",
        category: "foundation",
        estimatedDuration: "20 min",
        prerequisiteIds: ["pronunciation-foundation"],
        lessonInfo: {
          label: "Pinyin practice",
          kind: "practice",
          href: "/practice/pinyin-zhuyin",
        },
        choices: [
          {
            id: "pinyin-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "pinyin-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Pinyin (Pendalaman)",
              estimatedDuration: "20 min",
            },
          },
        ],

        position: { x: 40, y: 500 },
      },
      {
        id: "zhuyin",
        title: "Zhuyin",
        description:
          "Explore Zhuyin (Bopomofo), the phonetic system widely used in Taiwan. Learn its symbols and how they map to Mandarin sounds.",
        category: "foundation",
        estimatedDuration: "20 min",
        prerequisiteIds: ["pronunciation-foundation"],
        lessonInfo: {
          label: "Zhuyin practice",
          kind: "practice",
          href: "/practice/pinyin-zhuyin",
        },
        choices: [
          {
            id: "zhuyin-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "zhuyin-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Zhuyin (Pendalaman)",
              estimatedDuration: "20 min",
            },
          },
        ],

        position: { x: 460, y: 500 },
      },
      {
        id: "tones",
        title: "Mandarin Tones",
        description:
          "Train your ear and voice for the four main Mandarin tones plus the neutral tone. Tone accuracy changes meaning, so this is a key foundation skill.",
        category: "foundation",
        estimatedDuration: "20 min",
        prerequisiteIds: ["pronunciation-foundation"],
        lessonInfo: {
          label: "Tone recognition",
          kind: "practice",
          href: "/practice/tone",
        },
        choices: [
          {
            id: "tones-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "tones-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Mandarin Tones (Pendalaman)",
              estimatedDuration: "20 min",
            },
          },
        ],

        position: { x: 880, y: 500 },
      },
      {
        id: "syllable-formation",
        title: "Syllable Formation",
        description:
          "Combine initials, finals, and tones to form complete Mandarin syllables. Practice reading and producing natural syllable patterns.",
        category: "foundation",
        estimatedDuration: "15 min",
        prerequisiteIds: ["pinyin", "tones"],
        lessonInfo: {
          label: "Syllable builder",
          kind: "lesson",
        },
        choices: [
          {
            id: "syllable-formation-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "syllable-formation-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Syllable Formation (Pendalaman)",
              estimatedDuration: "15 min",
            },
          },
        ],

        position: { x: 460, y: 760 },
      },
      {
        id: "basic-vocabulary",
        title: "Basic Vocabulary",
        description:
          "Learn high-frequency beginner words for people, objects, numbers, and everyday actions. Build the vocabulary base needed for simple sentences.",
        category: "vocabulary",
        estimatedDuration: "25 min",
        prerequisiteIds: ["syllable-formation"],
        lessonInfo: {
          label: "Vocabulary collection",
          kind: "lesson",
          href: "/dictionary/all",
        },
        choices: [
          {
            id: "basic-vocabulary-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "basic-vocabulary-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Basic Vocabulary (Pendalaman)",
              estimatedDuration: "25 min",
            },
          },
        ],

        position: { x: 460, y: 1020 },
      },
      {
        id: "basic-grammar",
        title: "Basic Grammar",
        description:
          "Understand simple Mandarin sentence patterns, word order, and common particles. Learn how to form clear beginner statements and questions.",
        category: "grammar",
        estimatedDuration: "25 min",
        prerequisiteIds: ["basic-vocabulary"],
        lessonInfo: {
          label: "Grammar guide",
          kind: "lesson",
        },
        choices: [
          {
            id: "grammar-standar",
            label: "Jalur Standar",
            description: "Ikuti urutan grammar lengkap termasuk reading.",
            variant: {
              title: "Basic Grammar",
              estimatedDuration: "25 min",
            },
          },
          {
            id: "grammar-fokus-speaking",
            label: "Jalur Fokus Speaking",
            description:
              "Varian node untuk fokus bicara; di Dao, reading practice dilewati.",
            variant: {
              title: "Basic Grammar (Speaking Focus)",
              description:
                "Fokus pola kalimat untuk percakapan lisan. Reading practice dapat dilewati di Dao.",
              estimatedDuration: "20 min",
            },
            excludesNodeIds: ["reading-practice"],
          },
        ],
        position: { x: 140, y: 1280 },
      },
      {
        id: "listening-practice",
        title: "Listening Practice",
        description:
          "Develop listening comprehension with short beginner audio prompts, tone-aware phrases, and everyday Mandarin expressions.",
        category: "practice",
        estimatedDuration: "20 min",
        prerequisiteIds: ["basic-vocabulary"],
        lessonInfo: {
          label: "Listening center",
          kind: "practice",
          href: "/practice/listening",
        },
        choices: [
          {
            id: "listening-standar",
            label: "Jalur Standar",
            description: "Latihan listening umum.",
          },
          {
            id: "listening-intensif",
            label: "Jalur Intensif",
            description:
              "Varian node dengan fokus listening lebih dalam di Dao.",
            variant: {
              title: "Listening Practice (Intensif)",
              estimatedDuration: "30 min",
              description:
                "Latihan listening intensif dengan fokus nada dan frasa sehari-hari.",
            },
          },
        ],
        position: { x: 780, y: 1280 },
      },
      {
        id: "reading-practice",
        title: "Reading Practice",
        description:
          "Practice reading simple characters, Pinyin-supported phrases, and short beginner sentences. Connect vocabulary and grammar in context.",
        category: "practice",
        estimatedDuration: "20 min",
        prerequisiteIds: ["basic-vocabulary", "basic-grammar"],
        lessonInfo: {
          label: "Reading practice",
          kind: "practice",
        },
        choices: [
          {
            id: "reading-practice-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "reading-practice-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Reading Practice (Pendalaman)",
              estimatedDuration: "20 min",
            },
          },
        ],

        position: { x: 140, y: 1540 },
      },
      {
        id: "sentence-building",
        title: "Sentence Building",
        description:
          "Combine vocabulary, grammar, and listening skills to build your own beginner Mandarin sentences. Practice natural word order and useful patterns.",
        category: "grammar",
        estimatedDuration: "25 min",
        prerequisiteIds: ["basic-grammar", "listening-practice"],
        lessonInfo: {
          label: "Sentence builder",
          kind: "lesson",
        },
        choices: [
          {
            id: "sentence-building-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "sentence-building-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Sentence Building (Pendalaman)",
              estimatedDuration: "25 min",
            },
          },
        ],

        position: { x: 780, y: 1540 },
      },
      {
        id: "beginner-assessment",
        title: "Beginner Assessment",
        description:
          "Check your understanding across pronunciation, vocabulary, grammar, listening, and reading. Identify strengths and topics to review.",
        category: "assessment",
        estimatedDuration: "20 min",
        prerequisiteIds: ["reading-practice", "sentence-building"],
        lessonInfo: {
          label: "Beginner assessment",
          kind: "assessment",
        },
        choices: [
          {
            id: "beginner-assessment-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "beginner-assessment-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "Beginner Assessment (Pendalaman)",
              estimatedDuration: "20 min",
            },
          },
        ],

        position: { x: 460, y: 1800 },
      },
      {
        id: "hsk1-path",
        title: "HSK 1 Learning Path",
        description:
          "Move into structured HSK 1 preparation with a clear path through core words, patterns, and beginner communication goals.",
        category: "milestone",
        estimatedDuration: "Ongoing",
        prerequisiteIds: ["beginner-assessment"],
        lessonInfo: {
          label: "Start HSK 1 path",
          kind: "lesson",
        },
        choices: [
          {
            id: "hsk1-path-standar",
            label: "Standar",
            description: "Varian node standar untuk jalur utama.",
          },
          {
            id: "hsk1-path-pendalaman",
            label: "Pendalaman",
            description: "Varian node dengan pendalaman materi di Dao.",
            variant: {
              title: "HSK 1 Learning Path (Pendalaman)",
              estimatedDuration: "Ongoing",
            },
          },
        ],

        position: { x: 460, y: 2060 },
      },
    ],
    edges: [
      {
        id: "e-intro-foundation",
        source: "intro-mandarin",
        target: "pronunciation-foundation",
      },
      {
        id: "e-foundation-pinyin",
        source: "pronunciation-foundation",
        target: "pinyin",
        kind: "branch",
      },
      {
        id: "e-foundation-zhuyin",
        source: "pronunciation-foundation",
        target: "zhuyin",
        kind: "branch",
      },
      {
        id: "e-foundation-tones",
        source: "pronunciation-foundation",
        target: "tones",
        kind: "branch",
      },
      {
        id: "e-pinyin-syllable",
        source: "pinyin",
        target: "syllable-formation",
      },
      { id: "e-tones-syllable", source: "tones", target: "syllable-formation" },
      {
        id: "e-zhuyin-syllable",
        source: "zhuyin",
        target: "syllable-formation",
        kind: "branch",
      },
      {
        id: "e-syllable-vocab",
        source: "syllable-formation",
        target: "basic-vocabulary",
      },
      {
        id: "e-vocab-grammar",
        source: "basic-vocabulary",
        target: "basic-grammar",
      },
      {
        id: "e-vocab-listening",
        source: "basic-vocabulary",
        target: "listening-practice",
      },
      {
        id: "e-vocab-reading",
        source: "basic-vocabulary",
        target: "reading-practice",
        kind: "branch",
      },
      {
        id: "e-grammar-reading",
        source: "basic-grammar",
        target: "reading-practice",
      },
      {
        id: "e-grammar-sentence",
        source: "basic-grammar",
        target: "sentence-building",
      },
      {
        id: "e-listening-sentence",
        source: "listening-practice",
        target: "sentence-building",
      },
      {
        id: "e-reading-assessment",
        source: "reading-practice",
        target: "beginner-assessment",
      },
      {
        id: "e-sentence-assessment",
        source: "sentence-building",
        target: "beginner-assessment",
      },
      {
        id: "e-assessment-hsk1",
        source: "beginner-assessment",
        target: "hsk1-path",
      },
    ],
  },
];

export const DEFAULT_ROADMAP_ID =
  ROADMAPS[0]?.id ?? "mandarin-beginner-foundation";

export function getRoadmapById(id: string): RoadmapDef | undefined {
  return ROADMAPS.find((roadmap) => roadmap.id === id);
}
