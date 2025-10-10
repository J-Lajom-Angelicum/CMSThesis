import { useEffect, useState } from "react";
import { Card, Form, Button, Table, Alert } from "react-bootstrap";
import api from "../../api/axios";

interface Doctor {
  doctorId: number;
  userId: number | null;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNo: string;
}

interface DoctorForm {
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNo: string;
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState<DoctorForm>({
    userId: "",
    firstName: "",
    lastName: "",
    specialty: "",
    licenseNo: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      userId: "",
      firstName: "",
      lastName: "",
      specialty: "",
      licenseNo: "",
    });
    setEditingId(null);
    setError("");
  };

  // ✅ Generic handleChange with proper typing
  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dto = {
      UserId: formData.userId ? Number(formData.userId) : null,
      FirstName: formData.firstName.trim(),
      LastName: formData.lastName.trim(),
      Specialty: formData.specialty.trim(),
      LicenseNo: formData.licenseNo.trim(),
    };

    try {
      if (editingId) {
        await api.put(`/doctors/${editingId}`, dto);
        alert("Doctor updated successfully!");
      } else {
        await api.post("/doctors", dto);
        alert("Doctor created successfully!");
      }

      fetchDoctors();
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Error saving doctor.");
    }
  };

  // ✅ Edit existing doctor
  const handleEdit = (doctor: Doctor) => {
    setFormData({
      userId: doctor.userId ? String(doctor.userId) : "",
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty,
      licenseNo: doctor.licenseNo,
    });
    setEditingId(doctor.doctorId);
  };

  // ✅ Delete doctor
  const handleDelete = async (doctorId: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await api.delete(`/doctors/${doctorId}`);
      fetchDoctors();
    } catch (err) {
      console.error(err);
      setError("Failed to delete doctor.");
    }
  };

  return (
    <Card className="p-3">
      <Card.Title>{editingId ? "Edit Doctor" : "Add Doctor"}</Card.Title>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <p>Loading doctors...</p>}

      <Form onSubmit={handleSubmit}>
        {/* Optional: Add UserId link to Users table later */}
        <Form.Group className="mb-2">
          <Form.Label>User ID (optional)</Form.Label>
          <Form.Control
            name="userId"
            type="number"
            value={formData.userId}
            onChange={handleChange}
            placeholder="Link to existing User ID"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Specialty</Form.Label>
          <Form.Control
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            placeholder="e.g., Pediatrics"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>License No</Form.Label>
          <Form.Control
            name="licenseNo"
            value={formData.licenseNo}
            onChange={handleChange}
            placeholder="e.g., DOC-12345"
          />
        </Form.Group>

        <div className="mt-3">
          <Button type="submit" className="me-2">
            {editingId ? "Update" : "Create"}
          </Button>
          <Button variant="secondary" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </Form>

      <hr />

      <h5>Existing Doctors</h5>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Name</th>
            <th>Specialty</th>
            <th>License No</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d.doctorId}>
              <td>{d.doctorId}</td>
              <td>{d.userId ?? "—"}</td>
              <td>
                {d.firstName} {d.lastName}
              </td>
              <td>{d.specialty || "—"}</td>
              <td>{d.licenseNo || "—"}</td>
              <td>
                <Button
                  size="sm"
                  className="me-2"
                  variant="warning"
                  onClick={() => handleEdit(d)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(d.doctorId)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
