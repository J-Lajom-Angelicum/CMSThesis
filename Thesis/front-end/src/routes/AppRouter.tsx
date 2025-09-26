// src/routes/AppRouter.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Login from "../pages/Login";

import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import DoctorDashboard from "../pages/Dashboard/DoctorDashboard";
import StaffDashboard from "../pages/Dashboard/StaffDashboard";

import CreateUser from "../pages/Admin/CreateUser";
import PatientList from "../pages/Doctor/PatientList";
import PatientForm from "../pages/Doctor/PatientForm";
import Consultations from "../pages/Doctor/Consultations";

import Appointments from "../pages/Staff/Appointments";

export default function AppRouter() {
  const { roleId } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} />

      {/* Generic dashboard that routes by role */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            {roleId === 3 ? (
              <AdminDashboard />
            ) : roleId === 1 ? (
              <DoctorDashboard />
            ) : roleId === 2 ? (
              <StaffDashboard />
            ) : (
              <Home />
            )}
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

      {/* Patient Management (Admin + Doctor + Staff) */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/create"
        element={
          <ProtectedRoute allowedRoles={[1, 3]}>
            <PatientForm mode="create" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id/edit"
        element={
          <ProtectedRoute allowedRoles={[1, 3]}>
            <PatientForm mode="edit" />
          </ProtectedRoute>
        }
      />

      {/* Appointments (Admin + Staff + Doctor) */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <Appointments />
          </ProtectedRoute>
        }
      />

      {/* Consultations (Doctor + Admin + Staff) */}
      <Route
        path="/consultations"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <Consultations />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
