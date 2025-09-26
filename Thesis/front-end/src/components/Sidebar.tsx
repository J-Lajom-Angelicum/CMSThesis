import { Nav, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { roleId } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className={`sidebar p-3 ${darkMode ? "sidebar-dark" : "sidebar-light"}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Menu</h5>
        <Button
          size="sm"
          variant={darkMode ? "light" : "dark"}
          onClick={toggleDarkMode}
        >
          {darkMode ? "☀️" : "🌙"}
        </Button>
      </div>

      <Nav className="flex-column">
        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
        {roleId === 1 && (
          <>
            <Nav.Link as={Link} to="/patients">Patients</Nav.Link>
            <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
            <Nav.Link as={Link} to="/consultations">Consultations</Nav.Link>
          </>
        )}
        {roleId === 2 && (
          <>
            <Nav.Link as={Link} to="/patients">Patients</Nav.Link>
            <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
            <Nav.Link as={Link} to="/consultations">Consultations</Nav.Link>
          </>
        )}
        {roleId === 3 && (
          <>
            <Nav.Link as={Link} to="/create-user">User Management</Nav.Link>
            <Nav.Link as={Link} to="/patients">Patients</Nav.Link>
            <Nav.Link as={Link} to="/appointments">Appointments</Nav.Link>
            <Nav.Link as={Link} to="/consultations">Consultations</Nav.Link>
          </>
        )}
      </Nav>
    </div>
  );
}
