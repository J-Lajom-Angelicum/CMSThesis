// src/routes/AppRouter.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Login from "../pages/Login";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import DoctorDashboard from "../pages/Dashboard/DoctorDashboard";
import StaffDashboard from "../pages/Dashboard/StaffDashboard";
import CreateUser from "../pages/Admin/CreateUser";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboards with role-based protection */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/doctor"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/staff"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin-only tools */}
      <Route
        path="/create-user"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <CreateUser />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
