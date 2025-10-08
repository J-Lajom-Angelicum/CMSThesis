// src/pages/Admin/CreateUser.tsx
import { useState, useEffect } from "react";
import { Form, Button, Card, Table, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function CreateUser() {
  const { roleId } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [userRoleId, setUserRoleId] = useState<1 | 2 | 3>(2);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  // Only admins can access
  if (roleId !== 3) return <h4 className="text-danger">Access denied: Admins only</h4>;

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await api.get("/Users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setContactNo("");
    setUserRoleId(2);
    setEditingUserId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || (!editingUserId && !password)) {
      setError("Username and password are required.");
      return;
    }

    try {
      if (editingUserId) {
        // Update payload matches backend UserUpdateDTO
        const payload: any = {
          Email: email,
          ContactNo: contactNo,
          RoleId: userRoleId,
          IsActive: true,
        };
        if (password) payload.UserPassword = password; // optional
        await api.put(`/Users/${editingUserId}`, payload);
      } else {
        // Create payload matches backend UserCreateDTO
        const payload: any = {
          Username: username,
          UserPassword: password,
          Email: email,
          ContactNo: contactNo,
          RoleId: userRoleId,
          IsActive: true,
        };
        await api.post("/Users", payload);
      }

      fetchUsers();
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to save user. Check console.");
    }
  };

  const handleEdit = (userId: number) => {
    const user = users.find(u => u.userId === userId);
    if (!user) return;

    setUsername(user.username);
    setPassword(""); // leave blank to keep existing password
    setEmail(user.email || "");
    setContactNo(user.contactNo || "");
    setUserRoleId(user.roleId as 1 | 2 | 3);
    setEditingUserId(user.userId);
    setError("");
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/Users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    }
  };

  return (
    <Card className="p-3">
      <Card.Title>{editingUserId ? "Edit User" : "Create User"}</Card.Title>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {!editingUserId && (
          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control value={username} onChange={e => setUsername(e.target.value)} />
          </Form.Group>
        )}

        <Form.Group className="mb-2">
          <Form.Label>Password {editingUserId && "(leave blank to keep current)"}</Form.Label>
          <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Contact No</Form.Label>
          <Form.Control value={contactNo} onChange={e => setContactNo(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Role</Form.Label>
          <Form.Select value={userRoleId} onChange={e => setUserRoleId(Number(e.target.value) as 1 | 2 | 3)}>
            <option value={3}>Admin</option>
            <option value={1}>Doctor</option>
            <option value={2}>Staff</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" className="me-2">{editingUserId ? "Update" : "Create"}</Button>
        <Button variant="secondary" onClick={resetForm}>Cancel</Button>
      </Form>

      <hr />
      <h5>Existing Users</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>UserId</th>
            <th>Username</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Role</th>
            <th style={{ width: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.contactNo}</td>
              <td>{u.roleId === 3 ? "ADMIN" : u.roleId === 1 ? "DOCTOR" : "STAFF"}</td>
              <td>
                <Button size="sm" className="me-2" onClick={() => handleEdit(u.userId)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(u.userId)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
