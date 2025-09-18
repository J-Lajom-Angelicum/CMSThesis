// src/components/MainLayout.tsx
import { type ReactNode, useEffect } from "react";
import { Container, Navbar, Nav, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar"; // 👈 import sidebar
import "./MainLayout.css";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { role, roleId, logout } = useAuth();

  // Debugging: check the role and roleId every render
  useEffect(() => {
    console.log("Logged-in Role:", role, "RoleId:", roleId);
  }, [role, roleId]);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
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

      {/* Layout with Sidebar + Content */}
      <div className="d-flex">
        {role && <Sidebar />} {/* Sidebar only if logged in */}
        <div
          className="content flex-grow-1"
          style={{
            marginLeft: role ? "220px" : "0", // adjust if sidebar exists
            marginTop: "56px", // offset for fixed navbar
            padding: "20px",
          }}
        >
          <Container>{children}</Container>
        </div>
      </div>
    </>
  );
}
