import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Public pages
import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Login from "../pages/Login";

// Dashboards
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import DoctorDashboard from "../pages/Dashboard/DoctorDashboard";
import StaffDashboard from "../pages/Dashboard/StaffDashboard";

// Admin pages
import CreateUser from "../pages/Admin/CreateUser";
import QueueEntries from "../pages/Admin/QueueEntries";
import InventoryItems from "../pages/Admin/InventoryItems";
import InventoryBatches from "../pages/Admin/InventoryBatches";
import InventoryTransactions from "../pages/Admin/InventoryTransactions";
import InventoryUsage from "../pages/Admin/InventoryUsage";
import InventorySummary from "../pages/Admin/InventorySummary";
import InventoryCard from "../pages/Admin/InventoryCard";
import Suppliers from "../pages/Admin/Suppliers";

// Doctor pages
import PatientList from "../pages/Doctor/PatientList";
import PatientForm from "../pages/Doctor/PatientForm";
import Consultations from "../pages/Doctor/Consultations";
import LabOrders from "../pages/Doctor/LabOrders";
import LabResults from "../pages/Doctor/LabResults";

// Staff pages
import Appointments from "../pages/Staff/Appointments";
import Payments from "../pages/Staff/Payments";

export default function AppRouter() {
  const { roleId } = useAuth();

  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} />

      {/* ---------- DASHBOARD REDIRECT (BASED ON ROLE) ---------- */}
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

      {/* ---------- ADMIN-ONLY ROUTES ---------- */}
      <Route
        path="/create-user"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <CreateUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/queue-entries"
        element={
          <ProtectedRoute allowedRoles={[2,3]}>
            <QueueEntries />
          </ProtectedRoute>
        }
      />

      {/* ---------- PATIENT MANAGEMENT ---------- */}
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
          <ProtectedRoute allowedRoles={[2, 3]}>
            <PatientForm mode="create" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id/edit"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <PatientForm mode="edit" />
          </ProtectedRoute>
        }
      />

      {/* ---------- APPOINTMENTS & PAYMENTS ---------- */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <Payments />
          </ProtectedRoute>
        }
      />

      {/* ---------- CONSULTATIONS ---------- */}
      <Route
        path="/consultations"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <Consultations />
          </ProtectedRoute>
        }
      />

      {/* ---------- LAB MODULES ---------- */}
      <Route
        path="/lab-orders"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <LabOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lab-results"
        element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <LabResults />
          </ProtectedRoute>
        }
      />

      {/* ---------- INVENTORY MODULES ---------- */}
      <Route
        path="/inventory-items"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <InventoryItems />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-batches"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <InventoryBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-usage"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <InventoryUsage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-transactions"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <InventoryTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-summary"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <InventorySummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-card"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <InventoryCard />
          </ProtectedRoute>
        }
      />

      {/* ---------- SUPPLIERS ---------- */}
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute allowedRoles={[2, 3]}>
            <Suppliers />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
