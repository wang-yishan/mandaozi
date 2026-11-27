CREATE TABLE `assessment_competencies` (
	`assessment_id` text NOT NULL,
	`competency_id` text NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	`min_score` integer,
	PRIMARY KEY(`assessment_id`, `competency_id`),
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`competency_id`) REFERENCES `competencies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assessment_competencies_assessment_idx` ON `assessment_competencies` (`assessment_id`);--> statement-breakpoint
CREATE INDEX `assessment_competencies_comp_idx` ON `assessment_competencies` (`competency_id`);--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`mode` text DEFAULT 'auto' NOT NULL,
	`max_score` integer DEFAULT 100 NOT NULL,
	`pass_score` integer DEFAULT 70 NOT NULL,
	`config_json` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `assessments_kind_idx` ON `assessments` (`kind`);--> statement-breakpoint
CREATE INDEX `assessments_active_idx` ON `assessments` (`active`);--> statement-breakpoint
CREATE TABLE `competencies` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`domain` text DEFAULT 'general' NOT NULL,
	`level_band` text,
	`rubric_json` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `competencies_domain_idx` ON `competencies` (`domain`);--> statement-breakpoint
CREATE INDEX `competencies_active_idx` ON `competencies` (`active`);--> statement-breakpoint
CREATE UNIQUE INDEX `competencies_slug_uq` ON `competencies` (`slug`);--> statement-breakpoint
CREATE TABLE `learning_item_competencies` (
	`learning_item_id` text NOT NULL,
	`competency_id` text NOT NULL,
	`role` text DEFAULT 'teaches' NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	PRIMARY KEY(`learning_item_id`, `competency_id`, `role`),
	FOREIGN KEY (`learning_item_id`) REFERENCES `learning_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`competency_id`) REFERENCES `competencies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_item_competencies_item_idx` ON `learning_item_competencies` (`learning_item_id`);--> statement-breakpoint
CREATE INDEX `learning_item_competencies_comp_idx` ON `learning_item_competencies` (`competency_id`);--> statement-breakpoint
CREATE TABLE `learning_items` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`source_type` text NOT NULL,
	`source_ref` text NOT NULL,
	`estimated_min` integer,
	`meta_json` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `learning_items_kind_idx` ON `learning_items` (`kind`);--> statement-breakpoint
CREATE INDEX `learning_items_source_type_idx` ON `learning_items` (`source_type`);--> statement-breakpoint
CREATE INDEX `learning_items_active_idx` ON `learning_items` (`active`);--> statement-breakpoint
CREATE TABLE `roadmap_node_assessments` (
	`node_id` text NOT NULL,
	`assessment_id` text NOT NULL,
	`required` integer DEFAULT true NOT NULL,
	`pass_score_override` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`node_id`, `assessment_id`),
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `roadmap_node_assessments_node_idx` ON `roadmap_node_assessments` (`node_id`);--> statement-breakpoint
CREATE INDEX `roadmap_node_assessments_assessment_idx` ON `roadmap_node_assessments` (`assessment_id`);--> statement-breakpoint
CREATE TABLE `roadmap_node_competencies` (
	`node_id` text NOT NULL,
	`competency_id` text NOT NULL,
	`relation` text DEFAULT 'primary' NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	PRIMARY KEY(`node_id`, `competency_id`),
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`competency_id`) REFERENCES `competencies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `roadmap_node_competencies_node_idx` ON `roadmap_node_competencies` (`node_id`);--> statement-breakpoint
CREATE INDEX `roadmap_node_competencies_comp_idx` ON `roadmap_node_competencies` (`competency_id`);--> statement-breakpoint
CREATE TABLE `roadmap_node_resources` (
	`node_id` text NOT NULL,
	`learning_item_id` text NOT NULL,
	`role` text DEFAULT 'learn' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`unlock_rule_json` text,
	PRIMARY KEY(`node_id`, `learning_item_id`, `role`),
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`learning_item_id`) REFERENCES `learning_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `roadmap_node_resources_node_idx` ON `roadmap_node_resources` (`node_id`);--> statement-breakpoint
CREATE INDEX `roadmap_node_resources_item_idx` ON `roadmap_node_resources` (`learning_item_id`);--> statement-breakpoint
CREATE TABLE `roadmap_node_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`roadmap_id` text NOT NULL,
	`node_id` text NOT NULL,
	`rule_type` text DEFAULT 'unlock' NOT NULL,
	`rule_json` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `roadmap_node_rules_roadmap_idx` ON `roadmap_node_rules` (`roadmap_id`);--> statement-breakpoint
CREATE INDEX `roadmap_node_rules_node_idx` ON `roadmap_node_rules` (`node_id`);--> statement-breakpoint
CREATE INDEX `roadmap_node_rules_type_idx` ON `roadmap_node_rules` (`rule_type`);--> statement-breakpoint
CREATE TABLE `user_assessment_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`assessment_id` text NOT NULL,
	`roadmap_id` text,
	`node_id` text,
	`score` integer,
	`max_score` integer,
	`passed` integer,
	`status` text DEFAULT 'submitted' NOT NULL,
	`response_json` text,
	`evaluation_json` text,
	`idempotency_key` text,
	`started_at` integer,
	`submitted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `user_assessment_attempts_user_idx` ON `user_assessment_attempts` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_assessment_attempts_assessment_idx` ON `user_assessment_attempts` (`assessment_id`);--> statement-breakpoint
CREATE INDEX `user_assessment_attempts_user_node_idx` ON `user_assessment_attempts` (`user_id`,`node_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_assessment_attempts_idempotency_uq` ON `user_assessment_attempts` (`user_id`,`assessment_id`,`idempotency_key`);--> statement-breakpoint
CREATE TABLE `user_competency_mastery` (
	`user_id` text NOT NULL,
	`competency_id` text NOT NULL,
	`state` text DEFAULT 'not_started' NOT NULL,
	`score` real DEFAULT 0 NOT NULL,
	`confidence` real DEFAULT 0 NOT NULL,
	`evidence_count` integer DEFAULT 0 NOT NULL,
	`last_evidence_type` text,
	`last_evidence_id` text,
	`last_evidence_at` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `competency_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`competency_id`) REFERENCES `competencies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_competency_mastery_user_idx` ON `user_competency_mastery` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_competency_mastery_state_idx` ON `user_competency_mastery` (`state`);--> statement-breakpoint
CREATE TABLE `user_learning_item_progress` (
	`user_id` text NOT NULL,
	`learning_item_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `learning_item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`learning_item_id`) REFERENCES `learning_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_learning_item_progress_user_idx` ON `user_learning_item_progress` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_roadmap_branch_choices` (
	`user_id` text NOT NULL,
	`roadmap_id` text NOT NULL,
	`choice_node_id` text NOT NULL,
	`choice_id` text NOT NULL,
	`selected_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `roadmap_id`, `choice_node_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`choice_node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_roadmap_branch_choices_user_roadmap_idx` ON `user_roadmap_branch_choices` (`user_id`,`roadmap_id`);--> statement-breakpoint
CREATE TABLE `user_roadmap_records` (
	`user_id` text NOT NULL,
	`roadmap_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`is_selected` integer DEFAULT false NOT NULL,
	`selected_at` integer,
	`started_at` integer,
	`completed_at` integer,
	`last_opened_at` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `roadmap_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_roadmap_one_selected_uq` ON `user_roadmap_records` (`user_id`) WHERE "user_roadmap_records"."is_selected" = 1;--> statement-breakpoint
CREATE INDEX `user_roadmap_records_user_status_idx` ON `user_roadmap_records` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `user_roadmap_records_user_completed_idx` ON `user_roadmap_records` (`user_id`,`completed_at`);--> statement-breakpoint
CREATE INDEX `user_roadmap_records_user_selected_idx` ON `user_roadmap_records` (`user_id`,`is_selected`);