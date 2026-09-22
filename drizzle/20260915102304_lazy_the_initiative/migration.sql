PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_daily_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`date` text NOT NULL UNIQUE,
	`milliSeconds` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_daily_logs`(`id`, `date`, `milliSeconds`) SELECT `id`, `date`, `milliSeconds` FROM `daily_logs`;--> statement-breakpoint
DROP TABLE `daily_logs`;--> statement-breakpoint
ALTER TABLE `__new_daily_logs` RENAME TO `daily_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;