/**
 * GPA Calculator utilities for different student types
 * Engineering: Simple average of all course grades
 * Management: Credit-weighted average
 */

export interface CourseGrade {
  grade: number;
  credits: number;
}

/**
 * Convert percentage grade (0-100) to GPA scale (0-4.0)
 */
export function percentageToGPA(percentage: number): number {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.0;
  if (percentage >= 70) return 2.0;
  if (percentage >= 60) return 1.0;
  return 0.0;
}

/**
 * Calculate GPA for Engineering students (simple average)
 */
export function calculateEngineeringGPA(courseGrades: CourseGrade[]): number {
  if (courseGrades.length === 0) return 0;
  
  const gpaValues = courseGrades.map(cg => percentageToGPA(cg.grade));
  const sum = gpaValues.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / gpaValues.length).toFixed(2));
}

/**
 * Calculate GPA for Management students (credit-weighted average)
 */
export function calculateManagementGPA(courseGrades: CourseGrade[]): number {
  if (courseGrades.length === 0) return 0;
  
  let totalWeightedGPA = 0;
  let totalCredits = 0;
  
  for (const cg of courseGrades) {
    const gpa = percentageToGPA(cg.grade);
    totalWeightedGPA += gpa * cg.credits;
    totalCredits += cg.credits;
  }
  
  if (totalCredits === 0) return 0;
  return parseFloat((totalWeightedGPA / totalCredits).toFixed(2));
}

/**
 * Calculate GPA based on student type
 */
export function calculateStudentGPA(
  studentType: "engineering" | "management",
  courseGrades: CourseGrade[]
): number {
  if (studentType === "engineering") {
    return calculateEngineeringGPA(courseGrades);
  } else {
    return calculateManagementGPA(courseGrades);
  }
}
