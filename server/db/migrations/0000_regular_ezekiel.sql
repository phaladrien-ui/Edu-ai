CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`user_id` text NOT NULL,
	`chat_type` text DEFAULT 'general',
	`context` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chats_user_id_idx` ON `chats` (`user_id`);--> statement-breakpoint
CREATE INDEX `chats_chat_type_idx` ON `chats` (`chat_type`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`scholarship_id` text NOT NULL,
	`match_score` integer NOT NULL,
	`confidence_level` text NOT NULL,
	`match_reasons` text,
	`status` text DEFAULT 'recommended' NOT NULL,
	`applied_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scholarship_id`) REFERENCES `scholarships`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `matches_student_id_idx` ON `matches` (`student_id`);--> statement-breakpoint
CREATE INDEX `matches_scholarship_id_idx` ON `matches` (`scholarship_id`);--> statement-breakpoint
CREATE INDEX `matches_status_idx` ON `matches` (`status`);--> statement-breakpoint
CREATE INDEX `matches_match_score_idx` ON `matches` (`match_score`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`parts` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_chat_id_idx` ON `messages` (`chat_id`);--> statement-breakpoint
CREATE INDEX `messages_role_idx` ON `messages` (`role`);--> statement-breakpoint
CREATE TABLE `scholarship_chats` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scholarship_chats_user_id_idx` ON `scholarship_chats` (`user_id`);--> statement-breakpoint
CREATE TABLE `scholarship_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`parts` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `scholarship_chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scholarship_messages_chat_id_idx` ON `scholarship_messages` (`chat_id`);--> statement-breakpoint
CREATE TABLE `scholarships` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`description` text,
	`url` text,
	`eligibility` text,
	`amount` integer,
	`coverage` text,
	`duration` text,
	`deadline` integer,
	`competitiveness` text,
	`success_rate` integer,
	`tags` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `scholarships_name_idx` ON `scholarships` (`name`);--> statement-breakpoint
CREATE INDEX `scholarships_provider_idx` ON `scholarships` (`provider`);--> statement-breakpoint
CREATE INDEX `scholarships_deadline_idx` ON `scholarships` (`deadline`);--> statement-breakpoint
CREATE INDEX `scholarships_is_active_idx` ON `scholarships` (`is_active`);--> statement-breakpoint
CREATE TABLE `students` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`education_level` text,
	`field_of_study` text,
	`target_countries` text,
	`target_universities` text,
	`academic_background` text,
	`extracurricular` text,
	`languages` text,
	`budget_constraint` integer,
	`preferred_region` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `students_user_id_unique` ON `students` (`user_id`);--> statement-breakpoint
CREATE INDEX `students_user_id_idx` ON `students` (`user_id`);--> statement-breakpoint
CREATE INDEX `students_education_level_idx` ON `students` (`education_level`);--> statement-breakpoint
CREATE INDEX `students_field_of_study_idx` ON `students` (`field_of_study`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text NOT NULL,
	`username` text NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_provider_id_idx` ON `users` (`provider`,`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);