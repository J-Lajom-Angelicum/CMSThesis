// src/pages/doctor/PatientList.tsx
import { useState } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { loadPatients, savePatients, type Patient } from "../../data/patients";
import { useAuth } from "../../context/AuthContext";

export default function PatientList() {
  const { role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>(() => loadPatients());

  const handleDelete = (id: number) => {
    if (role !== "ADMIN") return;
    if (!confirm("Delete patient? This action cannot be undone.")) return;
    const updated = patients.filter((p) => p.patientID !== id);
    setPatients(updated);
    savePatients(updated);
  };

  const canCreateOrEdit = role === "ADMIN" || role === "DOCTOR";

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
            <tr key={p.patientID}>
              <td>{p.patientID}</td>
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
                    to={`/patients/${p.patientID}/edit`}
                    className="btn btn-sm btn-warning me-2"
                  >
                    Edit
                  </Link>
                )}

                {role === "ADMIN" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(p.patientID)}
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
