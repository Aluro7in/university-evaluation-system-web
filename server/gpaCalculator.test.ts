import { describe, it, expect } from "vitest";
import {
  percentageToGPA,
  calculateEngineeringGPA,
  calculateManagementGPA,
  calculateStudentGPA,
} from "./gpaCalculator";

describe("GPA Calculator", () => {
  describe("percentageToGPA", () => {
    it("should convert 90+ to 4.0", () => {
      expect(percentageToGPA(90)).toBe(4.0);
      expect(percentageToGPA(95)).toBe(4.0);
      expect(percentageToGPA(100)).toBe(4.0);
    });

    it("should convert 80-89 to 3.0", () => {
      expect(percentageToGPA(80)).toBe(3.0);
      expect(percentageToGPA(85)).toBe(3.0);
      expect(percentageToGPA(89)).toBe(3.0);
    });

    it("should convert 70-79 to 2.0", () => {
      expect(percentageToGPA(70)).toBe(2.0);
      expect(percentageToGPA(75)).toBe(2.0);
      expect(percentageToGPA(79)).toBe(2.0);
    });

    it("should convert 60-69 to 1.0", () => {
      expect(percentageToGPA(60)).toBe(1.0);
      expect(percentageToGPA(65)).toBe(1.0);
      expect(percentageToGPA(69)).toBe(1.0);
    });

    it("should convert below 60 to 0.0", () => {
      expect(percentageToGPA(59)).toBe(0.0);
      expect(percentageToGPA(50)).toBe(0.0);
      expect(percentageToGPA(0)).toBe(0.0);
    });
  });

  describe("calculateEngineeringGPA", () => {
    it("should calculate simple average of GPA values", () => {
      const grades = [
        { grade: 85, credits: 3 },
        { grade: 90, credits: 4 },
        { grade: 78, credits: 3 },
      ];
      // 85 -> 3.0, 90 -> 4.0, 78 -> 2.0
      // Average: (3.0 + 4.0 + 2.0) / 3 = 3.0
      expect(calculateEngineeringGPA(grades)).toBe(3.0);
    });

    it("should return 0 for empty array", () => {
      expect(calculateEngineeringGPA([])).toBe(0);
    });

    it("should handle single course", () => {
      const grades = [{ grade: 85, credits: 3 }];
      // 85 -> 3.0
      expect(calculateEngineeringGPA(grades)).toBe(3.0);
    });

    it("should ignore credits in calculation", () => {
      const grades = [
        { grade: 85, credits: 1 },
        { grade: 95, credits: 100 },
      ];
      // 85 -> 3.0, 95 -> 4.0
      // Average: (3.0 + 4.0) / 2 = 3.5
      expect(calculateEngineeringGPA(grades)).toBe(3.5);
    });
  });

  describe("calculateManagementGPA", () => {
    it("should calculate credit-weighted average", () => {
      const grades = [
        { grade: 85, credits: 3 },
        { grade: 90, credits: 4 },
      ];
      // 85 -> 3.0 * 3 = 9.0
      // 90 -> 4.0 * 4 = 16.0
      // Total: (9.0 + 16.0) / (3 + 4) = 25.0 / 7 = 3.57
      expect(calculateManagementGPA(grades)).toBe(3.57);
    });

    it("should return 0 for empty array", () => {
      expect(calculateManagementGPA([])).toBe(0);
    });

    it("should handle single course", () => {
      const grades = [{ grade: 85, credits: 3 }];
      // 85 -> 3.0
      expect(calculateManagementGPA(grades)).toBe(3.0);
    });

    it("should weight courses by credits", () => {
      const grades = [
        { grade: 80, credits: 1 }, // 3.0 * 1 = 3.0
        { grade: 100, credits: 4 }, // 4.0 * 4 = 16.0
      ];
      // Total: (3.0 + 16.0) / (1 + 4) = 19.0 / 5 = 3.8
      expect(calculateManagementGPA(grades)).toBe(3.8);
    });
  });

  describe("calculateStudentGPA", () => {
    it("should use engineering calculation for engineering students", () => {
      const grades = [
        { grade: 85, credits: 3 },
        { grade: 90, credits: 4 },
        { grade: 78, credits: 3 },
      ];
      const gpa = calculateStudentGPA("engineering", grades);
      expect(gpa).toBe(3.0);
    });

    it("should use management calculation for management students", () => {
      const grades = [
        { grade: 85, credits: 3 },
        { grade: 90, credits: 4 },
      ];
      const gpa = calculateStudentGPA("management", grades);
      expect(gpa).toBe(3.57);
    });

    it("should return 0 for empty grades", () => {
      expect(calculateStudentGPA("engineering", [])).toBe(0);
      expect(calculateStudentGPA("management", [])).toBe(0);
    });
  });
});
