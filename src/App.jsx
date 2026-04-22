import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import UserDashboard from "./pages/user/Dashboard";
import StudentsPage from "./pages/admin/Students";
import MyProfile from "./pages/student/MyProfile";
import MyGroups from "./pages/student/MyGroups";
import HomeworkPage from "./pages/student/Homework";
import Attendance from "./pages/student/Attendance";
import Payments from "./pages/student/Payments";
import Ratings from "./pages/student/Ratings";

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/contacts" element={<PlaceholderPage title="Contacts" />} />
              <Route path="/admin/deals" element={<PlaceholderPage title="Deals" />} />
              <Route path="/admin/reports" element={<PlaceholderPage title="Reports" />} />
              <Route path="/admin/settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/students" element={<StudentsPage />} />
              <Route path="/manager/contacts" element={<PlaceholderPage title="Contacts" />} />
              <Route path="/manager/deals" element={<PlaceholderPage title="Deals" />} />
              <Route path="/manager/reports" element={<PlaceholderPage title="Reports" />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard" element={<UserDashboard />} />
              <Route path="/student/profile" element={<MyProfile />} />
              <Route path="/student/groups" element={<MyGroups />} />
              <Route path="/student/homework" element={<HomeworkPage />} />
              <Route path="/student/attendance" element={<Attendance />} />
              <Route path="/student/payments" element={<Payments />} />
              <Route path="/student/ratings" element={<Ratings />} />
            </Route>
          </Route>

          {/* Staff routes */}
          <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/staff/dashboard" element={<UserDashboard />} />
              <Route path="/staff/students" element={<StudentsPage />} />
              <Route path="/staff/contacts" element={<PlaceholderPage title="Contacts" />} />
              <Route path="/staff/deals" element={<PlaceholderPage title="Deals" />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body items-center text-center py-16">
          <p className="text-base-content/40 text-lg">
            This page is under construction
          </p>
          <p className="text-base-content/30 text-sm mt-1">Come back soon!</p>
        </div>
      </div>
    </div>
  );
}
