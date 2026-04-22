import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";
import UserDashboard from "./pages/user/Dashboard";

export default function App() {
  return (
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
              <Route
                path="/admin/contacts"
                element={<PlaceholderPage title="Contacts" />}
              />
              <Route
                path="/admin/deals"
                element={<PlaceholderPage title="Deals" />}
              />
              <Route
                path="/admin/reports"
                element={<PlaceholderPage title="Reports" />}
              />
              <Route
                path="/admin/settings"
                element={<PlaceholderPage title="Settings" />}
              />
            </Route>
          </Route>

          {/* Manager routes */}
          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route
                path="/manager/contacts"
                element={<PlaceholderPage title="Contacts" />}
              />
              <Route
                path="/manager/deals"
                element={<PlaceholderPage title="Deals" />}
              />
              <Route
                path="/manager/reports"
                element={<PlaceholderPage title="Reports" />}
              />
            </Route>
          </Route>

          {/* User routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route
                path="/user/contacts"
                element={<PlaceholderPage title="Contacts" />}
              />
              <Route
                path="/user/deals"
                element={<PlaceholderPage title="Deals" />}
              />
            </Route>
          </Route>

          {/* staff routes */}
          <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route
                path="/user/contacts"
                element={<PlaceholderPage title="Contacts" />}
              />
              <Route
                path="/user/deals"
                element={<PlaceholderPage title="Deals" />}
              />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
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
