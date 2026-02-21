import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { BookOpen, Users, BarChart3, FileText } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">University Evaluation System</h1>
              <p className="text-xl text-gray-700">
                Comprehensive student management with polymorphic grade calculations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
              <Card>
                <CardHeader>
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>Manage engineering and management students</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Create, update, and delete student records with different evaluation methods
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="w-8 h-8 text-green-600 mb-2" />
                  <CardTitle>Course Enrollment</CardTitle>
                  <CardDescription>Manage course enrollments and credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Students can enroll in courses and track their academic progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                  <CardTitle>Grade Management</CardTitle>
                  <CardDescription>Set and track student grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Automatic GPA calculation with different methods for each student type
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="w-8 h-8 text-orange-600 mb-2" />
                  <CardTitle>Transcripts</CardTitle>
                  <CardDescription>Generate official transcripts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View and print official academic transcripts with GPA details
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">Sign in to get started</p>
              <Button
                size="lg"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Welcome, {user?.name || "Student"}!</h1>
            <p className="text-lg text-gray-600">
              {user?.role === "admin"
                ? "You have administrative access to manage students, courses, and grades."
                : "View your profile, enroll in courses, and check your transcript."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user?.role === "admin" ? (
              <>
                <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setLocation("/dashboard")}>
                  <CardHeader>
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <CardTitle>Student Dashboard</CardTitle>
                    <CardDescription>Manage all students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setLocation("/grades")}>
                  <CardHeader>
                    <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle>Grade Management</CardTitle>
                    <CardDescription>Set student grades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Manage Grades
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setLocation("/transcript")}>
                  <CardHeader>
                    <FileText className="w-8 h-8 text-orange-600 mb-2" />
                    <CardTitle>View Transcript</CardTitle>
                    <CardDescription>Check your academic record</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Transcript
                    </Button>
                  </CardContent>
                </Card>

                {/* Student profile will be shown after they select their profile */}
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
