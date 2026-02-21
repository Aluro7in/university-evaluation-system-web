import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { calculateStudentGPA, percentageToGPA } from "./gpaCalculator";
import { TRPCError } from "@trpc/server";

// Validation schemas
const createStudentSchema = z.object({
  studentId: z.string().min(1),
  type: z.enum(["engineering", "management"]),
  enrollmentYear: z.number().int(),
  major: z.string().optional(),
});

const createCourseSchema = z.object({
  courseCode: z.string().min(1),
  courseName: z.string().min(1),
  credits: z.number().int().min(1),
  description: z.string().optional(),
});

const enrollCourseSchema = z.object({
  courseId: z.number().int(),
});

const setGradeSchema = z.object({
  enrollmentId: z.number().int(),
  courseId: z.number().int(),
  grade: z.number().int().min(0).max(100),
});

// Helper to check if user is admin
function isAdmin(user: any): boolean {
  return user?.role === "admin";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Student management endpoints
  students: router({
    // Get current user's student profile
    me: protectedProcedure.query(async ({ ctx }) => {
      const student = await db.getStudentByUserId(ctx.user.id);
      return student;
    }),

    // Get all students (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!isAdmin(ctx.user)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can view all students" });
      }
      return await db.getAllStudents();
    }),

    // Get student by ID
    get: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ ctx, input }) => {
        const student = await db.getStudentById(input.id);
        if (!student) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        // Allow viewing own profile or admin access
        if (student.userId !== ctx.user.id && !isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot view other student's profile" });
        }
        return student;
      }),

    // Create new student (admin only)
    create: protectedProcedure
      .input(createStudentSchema)
      .mutation(async ({ ctx, input }) => {
        if (!isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create students" });
        }
        return await db.createStudent({
          ...input,
          userId: ctx.user.id,
        });
      }),

    // Update student (admin or self)
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), data: createStudentSchema.partial() }))
      .mutation(async ({ ctx, input }) => {
        const student = await db.getStudentById(input.id);
        if (!student) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        if (student.userId !== ctx.user.id && !isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot update other student's profile" });
        }
        return await db.updateStudent(input.id, input.data);
      }),

    // Delete student (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        if (!isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can delete students" });
        }
        return await db.deleteStudent(input.id);
      }),
  }),

  // Course management endpoints
  courses: router({
    // Get all courses
    list: protectedProcedure.query(async () => {
      return await db.getAllCourses();
    }),

    // Get course by ID
    get: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const course = await db.getCourseById(input.id);
        if (!course) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
        }
        return course;
      }),

    // Create course (admin only)
    create: protectedProcedure
      .input(createCourseSchema)
      .mutation(async ({ ctx, input }) => {
        if (!isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create courses" });
        }
        return await db.createCourse(input);
      }),
  }),

  // Enrollment management endpoints
  enrollments: router({
    // Get student's enrollments
    list: protectedProcedure
      .input(z.object({ studentId: z.number().int() }))
      .query(async ({ ctx, input }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        if (student.userId !== ctx.user.id && !isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot view other student's enrollments" });
        }
        return await db.getStudentEnrollments(input.studentId);
      }),

    // Enroll student in course
    enroll: protectedProcedure
      .input(z.object({ studentId: z.number().int(), courseId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        if (student.userId !== ctx.user.id && !isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot enroll other students" });
        }

        const course = await db.getCourseById(input.courseId);
        if (!course) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
        }

        return await db.enrollStudent({
          studentId: input.studentId,
          courseId: input.courseId,
        });
      }),

    // Unenroll student from course
    unenroll: protectedProcedure
      .input(z.object({ enrollmentId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        return await db.unenrollStudent(input.enrollmentId);
      }),
  }),

  // Grade management endpoints
  grades: router({
    // Get student's grades
    list: protectedProcedure
      .input(z.object({ studentId: z.number().int() }))
      .query(async ({ ctx, input }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        if (student.userId !== ctx.user.id && !isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot view other student's grades" });
        }
        return await db.getStudentGrades(input.studentId);
      }),

    // Set grade for enrollment
    set: protectedProcedure
      .input(setGradeSchema)
      .mutation(async ({ ctx, input }) => {
        if (!isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can set grades" });
        }

        const gpaScale = percentageToGPA(input.grade).toFixed(2);

        return await db.setGrade({
          enrollmentId: input.enrollmentId,
          studentId: 0, // Will be set by the database
          courseId: input.courseId,
          grade: input.grade,
          gpaScale,
        });
      }),

    // Calculate GPA for student
    calculateGPA: protectedProcedure
      .input(z.object({ studentId: z.number().int() }))
      .query(async ({ ctx, input }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        if (student.userId !== ctx.user.id && !isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot view other student's GPA" });
        }

        const grades = await db.getStudentGrades(input.studentId);
        const courseGrades = grades.map(g => ({
          grade: g.grade.grade,
          credits: g.course.credits,
        }));

        const gpa = calculateStudentGPA(student.type as "engineering" | "management", courseGrades);

        return {
          gpa,
          studentType: student.type,
          courseCount: courseGrades.length,
          totalCredits: courseGrades.reduce((sum, cg) => sum + cg.credits, 0),
        };
      }),

    // Get transcript
    transcript: protectedProcedure
      .input(z.object({ studentId: z.number().int() }))
      .query(async ({ ctx, input }) => {
        const student = await db.getStudentById(input.studentId);
        if (!student) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        if (student.userId !== ctx.user.id && !isAdmin(ctx.user)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot view other student's transcript" });
        }

        const grades = await db.getStudentGrades(input.studentId);
        const courseGrades = grades.map(g => ({
          grade: g.grade.grade,
          credits: g.course.credits,
        }));

        const gpa = calculateStudentGPA(student.type as "engineering" | "management", courseGrades);

        return {
          student: {
            id: student.id,
            studentId: student.studentId,
            name: student.studentId,
            type: student.type,
            major: student.major,
            enrollmentYear: student.enrollmentYear,
          },
          courses: grades.map(g => ({
            courseCode: g.course.courseCode,
            courseName: g.course.courseName,
            credits: g.course.credits,
            grade: g.grade.grade,
            gpaScale: g.grade.gpaScale,
          })),
          gpa,
          totalCredits: courseGrades.reduce((sum, cg) => sum + cg.credits, 0),
          calculationMethod: student.type === "engineering" ? "Simple Average" : "Credit-Weighted Average",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
