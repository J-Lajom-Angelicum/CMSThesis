// src/data/consultations.ts
export type Consultation = {
  consultationId: number;
  patientId: number;
  doctorId: number;
  date: string;
  notes: string;
};

export const mockConsultations: Consultation[] = [
  {
    consultationId: 11,
    patientId: 101,
    doctorId: 201,
    date: "2025-09-30T09:30",
    notes: "Blood pressure follow-up",
  },
  {
    consultationId: 12,
    patientId: 102,
    doctorId: 202,
    date: "2025-10-01T14:30",
    notes: "First-time consultation",
  },
];
