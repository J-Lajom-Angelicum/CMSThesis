// src/data/appointments.ts
export type AppointmentStatus = "Booked" | "CheckedIn" | "Cancelled" | "NoShow" | "Completed";

export type Appointment = {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  appointmentStatus: AppointmentStatus;
  notes?: string;
};

export const mockAppointments: Appointment[] = [
  {
    appointmentId: 1,
    patientId: 101,
    doctorId: 201,
    appointmentDateTime: "2025-09-30T09:00",
    appointmentStatus: "Booked",
    notes: "Follow-up checkup",
  },
  {
    appointmentId: 2,
    patientId: 102,
    doctorId: 202,
    appointmentDateTime: "2025-10-01T14:00",
    appointmentStatus: "CheckedIn",
    notes: "Initial consultation",
  },
];
