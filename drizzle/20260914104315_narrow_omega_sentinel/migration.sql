CREATE TABLE `daily_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`date` text NOT NULL,
	`seconds` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goal` (
	`id` integer PRIMARY KEY,
	`activityName` text NOT NULL,
	`dailyTargetSeconds` integer NOT NULL
);
