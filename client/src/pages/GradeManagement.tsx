import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export default function GradeManagement() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [grade, setGrade] = useState<string>("");

  const { data: students } = trpc.students.list.useQuery();
  const { data: enrollments } = trpc.enrollments.list.useQuery(
    { studentId: parseInt(selectedStudentId) },
    { enabled: !!selectedStudentId }
  );

  const setGradeMutation = trpc.grades.set.useMutation();
  const { data: studentGrades, refetch: refetchGrades } = trpc.grades.list.useQuery(
    { studentId: parseInt(selectedStudentId) },
    { enabled: !!selectedStudentId }
  );

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only administrators can manage grades.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSetGrade = async () => {
    if (!selectedEnrollmentId || !grade) {
      toast.error("Please select an enrollment and enter a grade");
      return;
    }

    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error("Grade must be between 0 and 100");
      return;
    }

    try {
      const enrollment = enrollments?.find(e => e.enrollment.id === parseInt(selectedEnrollmentId));
      if (!enrollment) {
        toast.error("Enrollment not found");
        return;
      }

      await setGradeMutation.mutateAsync({
        enrollmentId: parseInt(selectedEnrollmentId),
        courseId: enrollment.course.id,
        grade: gradeNum,
      });

      toast.success("Grade set successfully");
      setGrade("");
      setSelectedEnrollmentId("");
      setIsOpen(false);
      refetchGrades();
    } catch (error: any) {
      toast.error(error.message || "Failed to set grade");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grade Management</h1>
        <p className="text-gray-600 mt-2">Set and manage student grades</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Set Student Grades</CardTitle>
              <CardDescription>Enter grades for enrolled courses</CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Set Grade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Student Grade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Student</label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students?.map(student => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.studentId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedStudentId && (
                    <div>
                      <label className="text-sm font-medium">Select Enrollment</label>
                      <Select value={selectedEnrollmentId} onValueChange={setSelectedEnrollmentId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course..." />
                        </SelectTrigger>
                        <SelectContent>
                          {enrollments?.map(enrollment => (
                            <SelectItem key={enrollment.enrollment.id} value={enrollment.enrollment.id.toString()}>
                              {enrollment.course.courseCode} - {enrollment.course.courseName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedEnrollmentId && (
                    <div>
                      <label className="text-sm font-medium">Grade (0-100)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                        placeholder="Enter grade"
                      />
                    </div>
                  )}

                  <Button onClick={handleSetGrade} disabled={setGradeMutation.isPending} className="w-full">
                    {setGradeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting...
                      </>
                    ) : (
                      "Set Grade"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {selectedStudentId && studentGrades && studentGrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Course Code</th>
                    <th className="text-left py-2 px-4">Course Name</th>
                    <th className="text-left py-2 px-4">Grade</th>
                    <th className="text-left py-2 px-4">GPA Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.map(gradeRecord => (
                    <tr key={gradeRecord.grade.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{gradeRecord.course.courseCode}</td>
                      <td className="py-2 px-4">{gradeRecord.course.courseName}</td>
                      <td className="py-2 px-4 font-medium">{gradeRecord.grade.grade}</td>
                      <td className="py-2 px-4">{gradeRecord.grade.gpaScale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedStudentId ? (
            <div className="text-center py-8 text-gray-500">
              <p>No grades set for this student yet</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a student to view their grades</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
