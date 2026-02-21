import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
import { InsertStudent, InsertCourse, InsertEnrollment, InsertGrade, students, courses, enrollments, grades } from "../drizzle/schema";

// Student queries
export async function getStudentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(students);
}

export async function createStudent(data: InsertStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(students).values(data);
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(students).where(eq(students.id, id));
}

// Course queries
export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses);
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(courses).values(data);
}

// Enrollment queries
export async function enrollStudent(data: InsertEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(enrollments).values(data);
}

export async function getStudentEnrollments(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      enrollment: enrollments,
      course: courses,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, studentId));
}

export async function unenrollStudent(enrollmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(enrollments).where(eq(enrollments.id, enrollmentId));
}

// Grade queries
export async function setGrade(data: InsertGrade) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db
    .select()
    .from(grades)
    .where(eq(grades.enrollmentId, data.enrollmentId))
    .limit(1);
  
  if (existing.length > 0) {
    return await db.update(grades).set(data).where(eq(grades.enrollmentId, data.enrollmentId));
  } else {
    return await db.insert(grades).values(data);
  }
}

export async function getStudentGrades(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      grade: grades,
      course: courses,
      enrollment: enrollments,
    })
    .from(grades)
    .innerJoin(courses, eq(grades.courseId, courses.id))
    .innerJoin(enrollments, eq(grades.enrollmentId, enrollments.id))
    .where(eq(grades.studentId, studentId));
}

export async function getStudentGradesByEnrollment(enrollmentId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(grades).where(eq(grades.enrollmentId, enrollmentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
