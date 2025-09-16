import { type ReactNode, useEffect } from "react";
import { Container, Navbar, Nav, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MainLayout.css";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { role, roleId, logout } = useAuth();

  // Debugging: check the role and roleId every render
  useEffect(() => {
    console.log("Logged-in Role:", role, "RoleId:", roleId);
  }, [role, roleId]);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          {/* Logo + Name */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <Image
              src="src/assets/logo.png"
              roundedCircle
              className="me-2 clinic-logo"
              alt="Clinic Logo"
            />
            Cortez-Pineda Clinic System
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/about">About Us</Nav.Link>
              <Nav.Link as={Link} to="/services">Services</Nav.Link>
              {!role && <Nav.Link as={Link} to="/login">Login</Nav.Link>}
              {roleId === 3 && role && (
                <Nav.Link as={Link} to="/create-user">Create Users</Nav.Link>
              )}
            </Nav>
            {role && (
              <Nav>
                <Navbar.Text className="me-3">Signed in as: {role}</Navbar.Text>
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">{children}</Container>
    </>
  );
}
