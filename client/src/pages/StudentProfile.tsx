import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function StudentProfile() {
  const { user } = useAuth();
  const [location] = useLocation();
  const studentId = parseInt(location.split("/").pop() || "0");
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const { data: student, isLoading: studentLoading } = trpc.students.get.useQuery(
    { id: studentId },
    { enabled: studentId > 0 }
  );

  const { data: enrollments, refetch: refetchEnrollments } = trpc.enrollments.list.useQuery(
    { studentId },
    { enabled: studentId > 0 }
  );

  const { data: courses } = trpc.courses.list.useQuery();
  const { data: gpaData } = trpc.grades.calculateGPA.useQuery(
    { studentId },
    { enabled: studentId > 0 }
  );

  const enrollMutation = trpc.enrollments.enroll.useMutation();
  const unenrollMutation = trpc.enrollments.unenroll.useMutation();

  const handleEnroll = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }

    try {
      await enrollMutation.mutateAsync({
        studentId,
        courseId: parseInt(selectedCourseId),
      });
      toast.success("Enrolled successfully");
      setSelectedCourseId("");
      setIsEnrollOpen(false);
      refetchEnrollments();
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll");
    }
  };

  const handleUnenroll = async (enrollmentId: number) => {
    if (confirm("Are you sure you want to unenroll from this course?")) {
      try {
        await unenrollMutation.mutateAsync({ enrollmentId });
        toast.success("Unenrolled successfully");
        refetchEnrollments();
      } catch (error: any) {
        toast.error(error.message || "Failed to unenroll");
      }
    }
  };

  // Get available courses (not yet enrolled)
  const enrolledCourseIds = new Set(enrollments?.map(e => e.course.id) || []);
  const availableCourses = courses?.filter(c => !enrolledCourseIds.has(c.id)) || [];

  if (studentLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>The requested student profile could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{student.studentId}</h1>
        <p className="text-gray-600 mt-2">
          {student.type === "engineering" ? "Engineering" : "Management"} Student • {student.major || "No major specified"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gpaData?.gpa.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-gray-600 mt-1">On 4.0 scale</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enrollments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gpaData?.totalCredits || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enrolled Courses</CardTitle>
              <CardDescription>Courses you are currently enrolled in</CardDescription>
            </div>
            {availableCourses.length > 0 && (
              <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Enroll Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enroll in Course</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Course</label>
                      <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCourses.map(course => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.courseCode} - {course.courseName} ({course.credits} credits)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleEnroll} disabled={enrollMutation.isPending} className="w-full">
                      {enrollMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        "Enroll"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {enrollments && enrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No courses enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments?.map(enrollment => (
                <div
                  key={enrollment.enrollment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{enrollment.course.courseCode}</p>
                    <p className="text-sm text-gray-600">{enrollment.course.courseName}</p>
                    <p className="text-xs text-gray-500">{enrollment.course.credits} credits</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnenroll(enrollment.enrollment.id)}
                    disabled={unenrollMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
