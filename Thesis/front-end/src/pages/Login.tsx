// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate("/"); // redirect to dashboard after login
    } else {
      setError("Invalid username or password");
    }
  };

  
  return (
    <Card className="p-4 mx-auto" style={{ maxWidth: "400px" }}>
      {!user ? (
        <>
          <Card.Title className="mb-3">Login</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </Form.Group>
            <Button type="submit" className="w-100">Login</Button>
          </Form>
        </>
      ) : (
        <>
          <h5>Welcome, {user} ({role})</h5>
          <Button variant="secondary" onClick={logout} className="mt-3 w-100">
            Logout
          </Button>
        </>
      )}
    </Card>
  );
}
