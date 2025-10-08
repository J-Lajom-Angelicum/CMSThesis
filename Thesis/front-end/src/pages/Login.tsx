import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user, role } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(username, password);
    setLoading(false);

    if (!success) {
      setError("Invalid username or password");
      return;
    }

    // Optional lightweight log immediately after success
    console.log("Login attempt succeeded for username:", username);
  };

  // Redirect automatically when user & role are set
  useEffect(() => {
    if (user && role) {
      console.log("User logged in:", { user, role }); // log here too
      navigate("/dashboard", { replace: true });
    }
  }, [user, role, navigate]);

  return (
    <Card className="p-4 mx-auto" style={{ maxWidth: "400px", marginTop: "100px" }}>
      <Card.Title className="mb-3">Login</Card.Title>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </Form.Group>

        <Button type="submit" className="w-100" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Form>
    </Card>
  );
}
