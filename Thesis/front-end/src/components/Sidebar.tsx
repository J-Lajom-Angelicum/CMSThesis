import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { roleId } = useAuth();

  return (
    <div className="sidebar bg-light p-3">
      <h5 className="mb-4">Menu</h5>
      <Nav className="flex-column">

        {/* Common links (all roles) */}
        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>

        {/* Role-specific links */}
        {roleId === 1 && ( // Doctor
          <>
            <Nav.Link as={Link} to="/patients">Patients</Nav.Link>
            <Nav.Link as={Link} to="/consultations">Consultations</Nav.Link>
          </>
        )}

        {roleId === 2 && ( // Staff
          <>
            <Nav.Link as={Link} to="/patients">Patients</Nav.Link>
            <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
          </>
        )}

        {roleId === 3 && ( // Admin
          <>
            <Nav.Link as={Link} to="/create-user">User Management</Nav.Link>
            <Nav.Link as={Link} to="/patients">Patients</Nav.Link>
            <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
          </>
        )}
      </Nav>
    </div>
  );
}
