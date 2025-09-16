import { useState } from "react";
import { Form, Button, Card, Table } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function CreateUser() {
  const { roleId, users, createUser, updateUser, deleteUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [userRoleId, setUserRoleId] = useState<1 | 2 | 3>(2);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (roleId !== 3) return <h4 className="text-danger">Access denied: Admins only</h4>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const roleName = userRoleId === 3 ? "ADMIN" : userRoleId === 1 ? "DOCTOR" : "STAFF";

    if (editingIndex !== null) {
      updateUser(editingIndex, {
        username,
        password,
        name,
        email,
        contactNo,
        roleId: userRoleId,
        role: roleName,
        isActive: true,
      });
      setEditingIndex(null);
    } else {
      // createUser(username, password, name, email, contactNo, userRoleId);
      createUser({
        username,
        password,
        name,
        email,
        contactNo,
        roleId: userRoleId,
        role: roleName,
        isActive: true,
      });

    }

    setUsername("");
    setPassword("");
    setName("");
    setEmail("");
    setContactNo("");
    setUserRoleId(2);
  };

  const handleEdit = (index: number) => {
    const u = users[index];
    setUsername(u.username);
    setPassword(u.password);
    setEmail(u.email || "");
    setContactNo(u.contactNo || "");
    setUserRoleId(u.roleId as 1 | 2 | 3);
    setEditingIndex(index);
  };

  return (
    <Card className="p-3">
      <Card.Title>{editingIndex !== null ? "Edit User" : "Create User"}</Card.Title>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Username</Form.Label>
          <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Contact No</Form.Label>
          <Form.Control value={contactNo} onChange={(e) => setContactNo(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Role</Form.Label>
          <Form.Select value={userRoleId} onChange={(e) => setUserRoleId(Number(e.target.value) as 1 | 2 | 3)}>
            <option value={3}>Admin</option>
            <option value={1}>Doctor</option>
            <option value={2}>Staff</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" className="me-2">{editingIndex !== null ? "Update" : "Create"}</Button>
        {editingIndex !== null && <Button variant="secondary" onClick={() => setEditingIndex(null)}>Cancel</Button>}
      </Form>

      <hr />

      <h5>Existing Users</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Role</th>
            <th style={{ width: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={idx}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.contactNo}</td>
              <td>{u.role}</td>
              <td>
                <Button size="sm" className="me-2" onClick={() => handleEdit(idx)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => deleteUser(idx)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
