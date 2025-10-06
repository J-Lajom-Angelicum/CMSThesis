// src/components/MainLayout.tsx
import { type ReactNode } from "react";
import { Container, Navbar, Nav, Image, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { role, roleId, logout } = useAuth();

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
        <Container>
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
                <Button variant="outline-light" size="sm" onClick={logout}>
                  Logout
                </Button>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main layout: Sidebar + Content */}
      <div className="d-flex" style={{ marginTop: "56px" }}>
        {role && <Sidebar />} {/* Sidebar visible only when logged in */}
        <div
          className="content flex-grow-1"
          style={{
            marginLeft: role ? "220px" : "0", // space for sidebar
            padding: "20px",
          }}
        >
          <Container>{children}</Container>
        </div>
      </div>
    </>
  );
}
