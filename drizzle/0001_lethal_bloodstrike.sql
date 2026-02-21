CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseCode` varchar(64) NOT NULL,
	`courseName` varchar(255) NOT NULL,
	`credits` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_courseCode_unique` UNIQUE(`courseCode`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`enrollmentDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`grade` int NOT NULL,
	`gpaScale` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentId` varchar(64) NOT NULL,
	`type` enum('engineering','management') NOT NULL,
	`enrollmentYear` int NOT NULL,
	`major` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grades` ADD CONSTRAINT `grades_enrollmentId_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grades` ADD CONSTRAINT `grades_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grades` ADD CONSTRAINT `grades_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;