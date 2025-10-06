import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function PatientList() {
  const [patients, setPatients] = useState<any[]>([]);
  
  useEffect(() => {
    api.get("/patients")
      .then(res => setPatients(res.data))
      .catch(err => console.error(err));
  }, []);
  
  return (
    <ul>
      {patients.map(p => (
        <li key={p.patientId}>{p.firstName} {p.lastName}</li>
      ))}
    </ul>
  );
}
