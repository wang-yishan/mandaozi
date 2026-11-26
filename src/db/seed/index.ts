import { seedVocabularyIdempotent } from "./vocab.seed";
import { seedWorld } from "./world.seed";
import { seedRoadmaps } from "./roadmaps.seed";
import { seedPhonics } from "./phonics.seed";

function main() {
  console.log("Seeding SQLite database...");

  const vocabCount = seedVocabularyIdempotent();
  console.log(`  vocabulary_words: ${vocabCount}`);

  const world = seedWorld();
  console.log(`  world_categories: ${world.categories}`);
  console.log(`  world_tone_options: ${world.toneOptions}`);

  const roadmaps = seedRoadmaps();
  console.log(
    `  roadmaps: ${roadmaps.roadmaps}, nodes: ${roadmaps.nodes}, edges: ${roadmaps.edges}, prereqs: ${roadmaps.prereqs}`,
  );

  const phonics = seedPhonics();
  console.log(
    `  phonics symbols: ${phonics.symbols}, rules: ${phonics.rules}, lessons: ${phonics.lessons}, exercises: ${phonics.exercises}`,
  );

  console.log("Seed complete.");
}

main();
