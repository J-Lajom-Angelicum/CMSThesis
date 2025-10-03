// src/data/queue.ts
export type QueueEntryStatus = "Waiting" | "InProgress" | "Done" | "Skipped";

export type QueueEntry = {
  queueEntryId: number;
  patientId: number;
  appointmentId?: number;    // link to appointment (if applicable)
  consultationId?: number;   // ✅ add consultation link
  doctorId?: number;
  status: QueueEntryStatus;
  createdAt: string;
};

export const mockQueue: QueueEntry[] = [
  {
    queueEntryId: 1,
    patientId: 101,
    appointmentId: 1,
    consultationId: 11,   // ✅ now possible
    doctorId: 201,
    status: "Waiting",
    createdAt: "2025-09-30T08:50",
  },
  {
    queueEntryId: 2,
    patientId: 102,
    appointmentId: 2,
    consultationId: 12,   // ✅ now possible
    doctorId: 202,
    status: "InProgress",
    createdAt: "2025-10-01T13:50",
  },
];
