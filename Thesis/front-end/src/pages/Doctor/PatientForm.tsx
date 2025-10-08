// src/pages/doctor/PatientForm.tsx
import { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

type PatientGender = "M" | "F" | "O";

interface PatientFormProps {
  mode?: "create" | "edit";
}

export default function PatientForm({ mode: propMode }: PatientFormProps) {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const routeId = params.id ? Number(params.id) : undefined;
  const formMode: "create" | "edit" = propMode ?? (routeId ? "edit" : "create");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [patientSex, setPatientSex] = useState<PatientGender>("M");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(formMode === "edit");

  // Fetch patient data if editing
  useEffect(() => {
    if (formMode === "edit" && routeId) {
      api
        .get(`/patients/${routeId}`)
        .then((res) => {
          const data = res.data;
          setFirstName(data.firstName);
          setLastName(data.lastName);
          setBirthDate(data.birthDate);
          setPatientSex(data.patientSex);
          setContactNo(data.contactNo ?? "");
          setEmail(data.email ?? "");
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to load patient data.");
          navigate("/patients");
        })
        .finally(() => setLoading(false));
    }
  }, [formMode, routeId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      alert("Please fill required fields.");
      return;
    }

    const patientDto = {
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      BirthDate: birthDate,
      PatientSex: patientSex,
      ContactNo: contactNo.trim() || null,
      Email: email.trim() || null,
    };

    try {
      if (formMode === "create") {
        await api.post("/patients", patientDto);
        alert("Patient created successfully!");
      } else if (formMode === "edit" && routeId) {
        await api.put(`/patients/${routeId}`, patientDto);
        alert("Patient updated successfully!");
      }

      navigate("/patients");
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.title ||
        err.response?.data?.message ||
        "An error occurred while saving the patient.";
      alert(msg);
    }
  };

  if (loading) return <p>Loading patient data...</p>;

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
