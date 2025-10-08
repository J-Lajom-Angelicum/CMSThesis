// src/data/patients.ts
export type PatientGender = "M" | "F" | "O";

export interface Patient {
  patientID: number;
  firstName: string;
  lastName: string;
  contactNo?: string;
  email?: string;
  birthDate: string; // ISO date
  patientSex: PatientGender;
}

const initialPatients: Patient[] = [
  {
    patientID: 1,
    firstName: "Juan",
    lastName: "Dela Cruz",
    contactNo: "09171234567",
    email: "juan@example.com",
    birthDate: "1995-03-12",
    patientSex: "M",
  },
  {
    patientID: 2,
    firstName: "Maria",
    lastName: "Santos",
    contactNo: "09981234567",
    email: "maria@example.com",
    birthDate: "1998-07-21",
    patientSex: "F",
  },
];

const STORAGE_KEY = "patients_v1";

export function loadPatients(): Patient[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Patient[]) : initialPatients.slice();
}

export function savePatients(patients: Patient[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

export function getPatientById(id: number): Patient | undefined {
  return loadPatients().find((p) => p.patientID === id);
}
