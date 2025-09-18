// src/pages/doctor/Patients.tsx
import { useNavigate } from "react-router-dom";
import PatientList from "./PatientList";
import { Button } from "react-bootstrap";

export default function Patients() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Patients</h2>
      <PatientList />
      
      <div className="mt-3">
        <Button variant="primary" onClick={() => navigate("/patients/new")}>
          + Add Patient
        </Button>
      </div>
    </div>
  );
}
