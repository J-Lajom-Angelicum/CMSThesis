import { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
  contactNo?: string | null;
  email?: string | null;
  birthDate: string;
  patientSex: string;
}

export default function PatientList() {
  const { role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Only Staff (2) and Admin (3) can add/edit
  const canCreateOrEdit = role === "ADMIN" || role === "STAFF";

  // Fetch patients from API
  useEffect(() => {
    api
      .get("/patients")
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

 // Only Admin (3) can delete
const handleDelete = async (id: number) => {
  if (role !== "ADMIN") return;
  if (!confirm("Delete patient? This action cannot be undone.")) return;

  try {
    await api.delete(`/patients/${id}`);
    setPatients((prev) => prev.filter((p) => p.patientId !== id));
    alert("Patient deleted successfully.");
  } catch (err) {
    console.error(err);
    alert("Failed to delete patient.");
  }
};

  if (loading) return <p>Loading patients...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Patient Profiles</h2>

        {canCreateOrEdit ? (
          <Link to="/patients/create" className="btn btn-success">
            + Add Patient
          </Link>
        ) : (
          <Button variant="success" disabled>
            + Add Patient
          </Button>
        )}
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Birth Date</th>
            <th>Sex</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.patientId}>
              <td>{p.patientId}</td>
              <td>
                {p.firstName} {p.lastName}
              </td>
              <td>{p.contactNo}</td>
              <td>{p.email}</td>
              <td>{new Date(p.birthDate).toLocaleDateString()}</td>
              <td>{p.patientSex}</td>
              <td>
                {canCreateOrEdit && (
                  <Link
                    to={`/patients/${p.patientId}`}
                    className="btn btn-sm btn-warning me-2"
                  >
                    Edit
                  </Link>
                )}

                {role === "ADMIN" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(p.patientId)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
