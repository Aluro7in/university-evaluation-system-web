import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Transcript() {
  const { user } = useAuth();

  const { data: currentStudent } = trpc.students.me.useQuery();
  const { data: transcript, isLoading } = trpc.grades.transcript.useQuery(
    { studentId: currentStudent?.id || 0 },
    { enabled: !!currentStudent?.id }
  );

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Transcript Available</CardTitle>
            <CardDescription>Your transcript could not be loaded.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Transcript</h1>
          <p className="text-gray-600 mt-2">Official record of your academic performance</p>
        </div>
        <Button onClick={handlePrint} className="gap-2 print:hidden">
          <Download className="w-4 h-4" />
          Print/Export
        </Button>
      </div>

      <Card className="print:border-0">
        <CardHeader className="border-b">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">{transcript.student.studentId}</h2>
              <p className="text-gray-600">{transcript.student.major || "No major specified"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Student Type</p>
                <p className="font-medium">
                  {transcript.student.type === "engineering" ? "Engineering" : "Management"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Enrollment Year</p>
                <p className="font-medium">{transcript.student.enrollmentYear}</p>
              </div>
              <div>
                <p className="text-gray-600">Calculation Method</p>
                <p className="font-medium">{transcript.calculationMethod}</p>
              </div>
              <div>
                <p className="text-gray-600">Overall GPA</p>
                <p className="font-bold text-lg">{transcript.gpa.toFixed(2)} / 4.0</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {transcript.courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No courses enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-gray-300 bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Course Code</th>
                      <th className="text-left py-3 px-4 font-semibold">Course Name</th>
                      <th className="text-center py-3 px-4 font-semibold">Credits</th>
                      <th className="text-center py-3 px-4 font-semibold">Grade</th>
                      <th className="text-center py-3 px-4 font-semibold">GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcript.courses.map((course, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{course.courseCode}</td>
                        <td className="py-3 px-4">{course.courseName}</td>
                        <td className="py-3 px-4 text-center">{course.credits}</td>
                        <td className="py-3 px-4 text-center font-medium">{course.grade}</td>
                        <td className="py-3 px-4 text-center">{course.gpaScale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t-2 border-gray-300 pt-4 mt-6">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Courses</p>
                    <p className="text-lg font-bold">{transcript.courses.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Credits</p>
                    <p className="text-lg font-bold">{transcript.totalCredits}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Overall GPA (4.0 Scale)</p>
                    <p className="text-lg font-bold text-blue-600">{transcript.gpa.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
                <p>
                  <strong>Calculation Method:</strong> {transcript.calculationMethod}
                  {transcript.student.type === "engineering"
                    ? " - Average of all course grades converted to 4.0 scale"
                    : " - Weighted average based on course credits"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
