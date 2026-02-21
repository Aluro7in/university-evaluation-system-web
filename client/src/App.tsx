import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import StudentProfile from "./pages/StudentProfile";
import GradeManagement from "./pages/GradeManagement";
import Transcript from "./pages/Transcript";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={() => <DashboardLayout><AdminDashboard /></DashboardLayout>} />
      <Route path="/student/:id" component={() => <DashboardLayout><StudentProfile /></DashboardLayout>} />
      <Route path="/grades" component={() => <DashboardLayout><GradeManagement /></DashboardLayout>} />
      <Route path="/transcript" component={() => <DashboardLayout><Transcript /></DashboardLayout>} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
