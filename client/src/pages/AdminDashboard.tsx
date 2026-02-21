import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

interface StudentFormData {
  studentId: string;
  type: "engineering" | "management";
  enrollmentYear: number;
  major?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    studentId: "",
    type: "engineering",
    enrollmentYear: new Date().getFullYear(),
    major: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students, isLoading, refetch } = trpc.students.list.useQuery();
  const createStudentMutation = trpc.students.create.useMutation();
  const deleteStudentMutation = trpc.students.delete.useMutation();

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only administrators can access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleCreateStudent = async () => {
    try {
      await createStudentMutation.mutateAsync({
        ...formData,
        enrollmentYear: parseInt(formData.enrollmentYear.toString()),
      });
      toast.success("Student created successfully");
      setFormData({
        studentId: "",
        type: "engineering",
        enrollmentYear: new Date().getFullYear(),
        major: "",
      });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create student");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudentMutation.mutateAsync({ id });
        toast.success("Student deleted successfully");
        refetch();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete student");
      }
    }
  };

  const filteredStudents = students?.filter(
    s =>
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.major?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage students, courses, and grades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engineering Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.filter(s => s.type === "engineering").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Management Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.filter(s => s.type === "management").length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>View and manage all students in the system</CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Student ID</label>
                    <Input
                      value={formData.studentId}
                      onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="e.g., ENG001"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as "engineering" | "management" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Enrollment Year</label>
                    <Input
                      type="number"
                      value={formData.enrollmentYear}
                      onChange={e => setFormData({ ...formData, enrollmentYear: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Major (Optional)</label>
                    <Input
                      value={formData.major || ""}
                      onChange={e => setFormData({ ...formData, major: e.target.value })}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <Button onClick={handleCreateStudent} disabled={!formData.studentId || createStudentMutation.isPending} className="w-full">
                    {createStudentMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Student"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by student ID or major..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Student ID</th>
                      <th className="text-left py-2 px-4">Type</th>
                      <th className="text-left py-2 px-4">Major</th>
                      <th className="text-left py-2 px-4">Enrollment Year</th>
                      <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{student.studentId}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            student.type === "engineering"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {student.type.charAt(0).toUpperCase() + student.type.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-4">{student.major || "-"}</td>
                        <td className="py-2 px-4">{student.enrollmentYear}</td>
                        <td className="py-2 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/student/${student.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              disabled={deleteStudentMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
