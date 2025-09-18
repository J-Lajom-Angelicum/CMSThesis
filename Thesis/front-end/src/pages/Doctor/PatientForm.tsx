// src/pages/doctor/PatientForm.tsx
import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  type Patient,
  type PatientGender,
  loadPatients,
  savePatients,
  getPatientById,
} from "../../data/patients";

interface PatientFormProps {
  mode?: "create" | "edit";
}

export default function PatientForm({ mode: propMode }: PatientFormProps) {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const routeId = params.id ? Number(params.id) : undefined;
  const formMode: "create" | "edit" = propMode ?? (routeId ? "edit" : "create");

  const existing = routeId ? getPatientById(routeId) : undefined;

  const [firstName, setFirstName] = useState(existing?.firstName ?? "");
  const [lastName, setLastName] = useState(existing?.lastName ?? "");
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? "");
  const [patientSex, setPatientSex] = useState<PatientGender>(
    (existing?.patientSex as PatientGender) ?? "M"
  );
  const [contactNo, setContactNo] = useState(existing?.contactNo ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");

  // If the existing patient loads later, sync state (useful if localStorage changed)
  useEffect(() => {
    if (formMode === "edit" && existing) {
      setFirstName(existing.firstName);
      setLastName(existing.lastName);
      setBirthDate(existing.birthDate);
      setPatientSex(existing.patientSex);
      setContactNo(existing.contactNo ?? "");
      setEmail(existing.email ?? "");
    }
  }, [existing, formMode]);

  if (formMode === "edit" && routeId && !existing) {
    return (
      <div className="container mt-4">
        <h2>Edit Patient</h2>
        <p>Patient not found.</p>
        <Button onClick={() => navigate("/patients")}>Back to list</Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      alert("Please fill required fields.");
      return;
    }

    if (formMode === "create") {
      const all = loadPatients();
      const newId =
        all.length === 0 ? 1 : Math.max(...all.map((p) => p.patientID)) + 1;
      const newPatient: Patient = {
        patientID: newId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate,
        patientSex,
        contactNo: contactNo.trim() || undefined,
        email: email.trim() || undefined,
      };
      const updated = [...all, newPatient];
      savePatients(updated);
      navigate("/patients");
    } else {
      // edit
      const all = loadPatients();
      const updated = all.map((p) =>
        p.patientID === routeId
          ? {
              ...p,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              birthDate,
              patientSex,
              contactNo: contactNo.trim() || undefined,
              email: email.trim() || undefined,
            }
          : p
      );
      savePatients(updated);
      navigate("/patients");
    }
  };

  return (
    <div className="container mt-4">
      <h2>{formMode === "create" ? "Add Patient" : "Edit Patient"}</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Birth Date</Form.Label>
          <Form.Control
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Sex</Form.Label>
          <Form.Select
            value={patientSex}
            onChange={(e) => setPatientSex(e.target.value as PatientGender)}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contact No</Form.Label>
          <Form.Control
            value={contactNo}
            onChange={(e) => setContactNo(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <div>
          <Button type="submit" variant="primary" className="me-2">
            Save
          </Button>
          <Button variant="secondary" onClick={() => navigate("/patients")}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
