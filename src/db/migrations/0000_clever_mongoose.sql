CREATE TABLE `roadmap_edges` (
	`id` text PRIMARY KEY NOT NULL,
	`roadmap_id` text NOT NULL,
	`source_node_id` text NOT NULL,
	`target_node_id` text NOT NULL,
	`kind` text DEFAULT 'main' NOT NULL,
	FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `roadmap_edges_roadmap_idx` ON `roadmap_edges` (`roadmap_id`);--> statement-breakpoint
CREATE INDEX `roadmap_edges_source_idx` ON `roadmap_edges` (`source_node_id`);--> statement-breakpoint
CREATE INDEX `roadmap_edges_target_idx` ON `roadmap_edges` (`target_node_id`);--> statement-breakpoint
CREATE TABLE `roadmap_node_prerequisites` (
	`node_id` text NOT NULL,
	`prerequisite_node_id` text NOT NULL,
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`prerequisite_node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `roadmap_node_prereq_node_idx` ON `roadmap_node_prerequisites` (`node_id`);--> statement-breakpoint
CREATE INDEX `roadmap_node_prereq_prereq_idx` ON `roadmap_node_prerequisites` (`prerequisite_node_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `roadmap_node_prereq_uq` ON `roadmap_node_prerequisites` (`node_id`,`prerequisite_node_id`);--> statement-breakpoint
CREATE TABLE `roadmap_nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`roadmap_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`estimated_duration` text NOT NULL,
	`lesson_kind` text,
	`lesson_label` text,
	`lesson_href` text,
	`pos_x` real NOT NULL,
	`pos_y` real NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `roadmap_nodes_roadmap_idx` ON `roadmap_nodes` (`roadmap_id`);--> statement-breakpoint
CREATE TABLE `roadmaps` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vocabulary_words` (
	`id` text PRIMARY KEY NOT NULL,
	`hanzi` text NOT NULL,
	`pinyin` text NOT NULL,
	`meaning_en` text NOT NULL,
	`meaning_id` text NOT NULL,
	`hsk_level` text NOT NULL,
	`example_hanzi` text NOT NULL,
	`example_meaning_id` text NOT NULL,
	`audio_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vocabulary_words_hsk_idx` ON `vocabulary_words` (`hsk_level`);--> statement-breakpoint
CREATE UNIQUE INDEX `vocabulary_words_hanzi_uq` ON `vocabulary_words` (`hanzi`);--> statement-breakpoint
CREATE TABLE `world_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hanzi` text NOT NULL,
	`subtitle_pinyin` text NOT NULL,
	`description` text NOT NULL,
	`xp` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `world_category_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`kind` text DEFAULT 'lesson' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `world_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `world_category_lessons_category_idx` ON `world_category_lessons` (`category_id`);--> statement-breakpoint
CREATE TABLE `world_tone_options` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `phonics_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`lesson_id` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`prompt_id` text NOT NULL,
	`prompt_audio_text` text,
	`prompt_audio` text,
	`choices` text,
	`choice_labels` text,
	`correct_choice` text,
	`pairs` text,
	`build` text,
	`compare` text,
	`explanation` text NOT NULL,
	`explanation_id` text NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `phonics_lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `phonics_exercises_scope_idx` ON `phonics_exercises` (`scope`);--> statement-breakpoint
CREATE INDEX `phonics_exercises_lesson_idx` ON `phonics_exercises` (`lesson_id`);--> statement-breakpoint
CREATE TABLE `phonics_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`slug` text NOT NULL,
	`order` integer NOT NULL,
	`title` text NOT NULL,
	`title_id` text NOT NULL,
	`summary` text NOT NULL,
	`summary_id` text NOT NULL,
	`objectives` text NOT NULL,
	`estimated_min` integer NOT NULL,
	`xp_reward` integer NOT NULL,
	`symbol_ids` text NOT NULL,
	`rule_ids` text NOT NULL,
	`exercise_ids` text NOT NULL,
	`quiz_exercise_ids` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `phonics_lessons_scope_order_idx` ON `phonics_lessons` (`scope`,`order`);--> statement-breakpoint
CREATE UNIQUE INDEX `phonics_lessons_scope_slug_uq` ON `phonics_lessons` (`scope`,`slug`);--> statement-breakpoint
CREATE TABLE `phonics_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`title` text NOT NULL,
	`title_id` text NOT NULL,
	`explanation` text NOT NULL,
	`explanation_id` text NOT NULL,
	`examples` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `phonics_rules_scope_idx` ON `phonics_rules` (`scope`);--> statement-breakpoint
CREATE TABLE `phonics_symbols` (
	`id` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`zhuyin` text,
	`pinyin` text,
	`group_name` text NOT NULL,
	`description` text NOT NULL,
	`description_id` text NOT NULL,
	`audio` text,
	`examples` text NOT NULL,
	`notes` text,
	`common_mistakes` text
);
--> statement-breakpoint
CREATE INDEX `phonics_symbols_scope_idx` ON `phonics_symbols` (`scope`);--> statement-breakpoint
CREATE TABLE `phonics_incorrect_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`scope` text NOT NULL,
	`lesson_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`prompt` text NOT NULL,
	`correct_answer` text NOT NULL,
	`user_answer` text NOT NULL,
	`created_at` text NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `phonics_incorrect_answers_user_idx` ON `phonics_incorrect_answers` (`user_id`);--> statement-breakpoint
CREATE TABLE `phonics_lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`status` text DEFAULT 'not-started' NOT NULL,
	`best_score` integer DEFAULT 0 NOT NULL,
	`last_score` integer DEFAULT 0 NOT NULL,
	`accuracy` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`completed_at` text,
	`mastery` text DEFAULT 'new' NOT NULL,
	`incorrect_exercise_ids` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `phonics_lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `phonics_lesson_progress_user_idx` ON `phonics_lesson_progress` (`user_id`);--> statement-breakpoint
CREATE TABLE `phonics_symbol_progress` (
	`user_id` text NOT NULL,
	`symbol_id` text NOT NULL,
	`mastery` text DEFAULT 'new' NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`incorrect` integer DEFAULT 0 NOT NULL,
	`last_reviewed_at` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `symbol_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`symbol_id`) REFERENCES `phonics_symbols`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `phonics_symbol_progress_user_idx` ON `phonics_symbol_progress` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`user_id` text NOT NULL,
	`hanzi` text NOT NULL,
	`vocabulary_id` text,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `hanzi`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vocabulary_id`) REFERENCES `vocabulary_words`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `user_favorites_user_idx` ON `user_favorites` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_lesson_completions` (
	`user_id` text NOT NULL,
	`lesson_key` text NOT NULL,
	`xp_awarded` integer DEFAULT 0 NOT NULL,
	`completed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_lesson_completions_user_idx` ON `user_lesson_completions` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_phonics_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_mode` text DEFAULT 'both' NOT NULL,
	`selected_accent` text DEFAULT 'putonghua' NOT NULL,
	`playback_rate` integer DEFAULT 1 NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`goal` text DEFAULT 'Conversation' NOT NULL,
	`level` text DEFAULT 'Beginner · HSK 1–2' NOT NULL,
	`daily_goal_min` integer DEFAULT 10 NOT NULL,
	`language` text DEFAULT 'Indonesian / English' NOT NULL,
	`theme_mode` text DEFAULT 'light' NOT NULL,
	`reminders` integer DEFAULT true NOT NULL,
	`sound` integer DEFAULT true NOT NULL,
	`onboarding_done` integer DEFAULT false NOT NULL,
	`intensive_enrolled` integer DEFAULT false NOT NULL,
	`sidebar_collapsed` integer DEFAULT false NOT NULL,
	`more_menu_layout` text DEFAULT 'grid-2' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`words_mastered` integer DEFAULT 0 NOT NULL,
	`lessons_completed` integer DEFAULT 0 NOT NULL,
	`streak_days` integer DEFAULT 0 NOT NULL,
	`accuracy` integer DEFAULT 0 NOT NULL,
	`claimed_daily_reward` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_roadmap_node_progress` (
	`user_id` text NOT NULL,
	`roadmap_id` text NOT NULL,
	`node_id` text NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `roadmap_id`, `node_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_roadmap_node_progress_user_roadmap_idx` ON `user_roadmap_node_progress` (`user_id`,`roadmap_id`);--> statement-breakpoint
CREATE TABLE `user_task_completions` (
	`user_id` text NOT NULL,
	`task_id` text NOT NULL,
	`xp_awarded` integer DEFAULT 0 NOT NULL,
	`completed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `task_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_task_completions_user_idx` ON `user_task_completions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
