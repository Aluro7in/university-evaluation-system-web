import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Students table - stores student information with type (Engineering or Management)
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  studentId: varchar("studentId", { length: 64 }).notNull().unique(),
  type: mysqlEnum("type", ["engineering", "management"]).notNull(),
  enrollmentYear: int("enrollmentYear").notNull(),
  major: varchar("major", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Courses table - stores course information
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  courseCode: varchar("courseCode", { length: 64 }).notNull().unique(),
  courseName: varchar("courseName", { length: 255 }).notNull(),
  credits: int("credits").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Enrollments table - tracks student-course relationships
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: int("courseId").notNull().references(() => courses.id, { onDelete: "cascade" }),
  enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Grades table - stores student grades for courses with validation
 */
export const grades = mysqlTable("grades", {
  id: int("id").autoincrement().primaryKey(),
  enrollmentId: int("enrollmentId").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: int("courseId").notNull().references(() => courses.id, { onDelete: "cascade" }),
  grade: int("grade").notNull(), // 0-100
  gpaScale: varchar("gpaScale", { length: 10 }), // Calculated GPA on 4.0 scale
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = typeof grades.$inferInsert;