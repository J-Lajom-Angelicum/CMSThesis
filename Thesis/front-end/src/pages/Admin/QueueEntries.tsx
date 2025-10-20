import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import api from "../../api/axios";

interface QueueEntry {
  queueEntryId: number;
  patientId: number;
  appointmentId: number | null;
  doctorId: number | null;
  consultationId: number | null;
  status: "Waiting" | "InProgress" | "Done" | "Skipped";
  createdAt: string;
}

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
}

interface Doctor {
  doctorId: number;
  firstName: string;
  lastName: string;
}

interface Consultation {
  consultationId: number;
  patientId: number;
  doctorId: number;
  appointmentId: number | null;
  consultationDate: string;
}

interface Appointment {
  appointmentId: number;
  appointmentDateTime: string;
  appointmentStatus: string;
}

interface QueueEntryDisplay extends QueueEntry {
  patientName?: string;
  doctorName?: string;
  consultationDate?: string | null;
  appointmentDate?: string | null;
}

const statusOptions = ["Waiting", "InProgress", "Done", "Skipped"] as const;

export default function QueueEntries() {
  const [queue, setQueue] = useState<QueueEntryDisplay[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [patientsRes, doctorsRes, consultationsRes, appointmentsRes] =
        await Promise.all([
          api.get<Patient[]>("/Patients"),
          api.get<Doctor[]>("/Doctors"),
          api.get<Consultation[]>("/Consultations"),
          api.get<Appointment[]>("/Appointments"),
        ]);

      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setConsultations(consultationsRes.data);
      setAppointments(appointmentsRes.data);

      fetchQueueEntries(
        patientsRes.data,
        doctorsRes.data,
        consultationsRes.data,
        appointmentsRes.data
      );
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };

  const fetchQueueEntries = async (
    patientsData?: Patient[],
    doctorsData?: Doctor[],
    consultationsData?: Consultation[],
    appointmentsData?: Appointment[]
  ) => {
    try {
      const res = await api.get<QueueEntry[]>("/QueueEntries");

      const mapped: QueueEntryDisplay[] = res.data.map((q) => {
        const patient = (patientsData || patients).find(
          (p) => p.patientId === q.patientId
        );
        const doctor = (doctorsData || doctors).find(
          (d) => d.doctorId === q.doctorId
        );
        const consultation = (consultationsData || consultations).find(
          (c) => c.consultationId === q.consultationId
        );

        const appointmentIdFromConsult = consultation?.appointmentId;
        const appointment = (appointmentsData || appointments).find(
          (a) => a.appointmentId === (q.appointmentId ?? appointmentIdFromConsult)
        );

        return {
          ...q,
          patientName: patient
            ? `${patient.firstName} ${patient.lastName}`
            : "Unknown",
          doctorName: doctor
            ? `${doctor.firstName} ${doctor.lastName}`
            : "Unassigned",
          consultationDate: consultation?.consultationDate ?? null,
          appointmentDate: appointment?.appointmentDateTime ?? null,
          appointmentId: appointment?.appointmentId ?? q.appointmentId ?? null,
        };
      });

      setQueue(mapped);
    } catch (err) {
      console.error("Failed to fetch queue entries:", err);
    }
  };

  const handleStatusChange = async (
    queueId: number,
    newStatus: QueueEntry["status"]
  ) => {
    const queueEntry = queue.find((q) => q.queueEntryId === queueId);
    if (!queueEntry) return;

    try {
      // Send full DTO required by backend
      await api.put(`/QueueEntries/${queueId}`, {
        Status: newStatus,
        DoctorId: queueEntry.doctorId,
        ConsultationId: queueEntry.consultationId,
      });

      // Optimistic UI update
      setQueue((prev) =>
        prev.map((q) =>
          q.queueEntryId === queueId ? { ...q, status: newStatus } : q
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusButtonVariant = (status: QueueEntry["status"]) => {
    switch (status) {
      case "Waiting":
        return "secondary";
      case "InProgress":
        return "info";
      case "Done":
        return "success";
      case "Skipped":
        return "danger";
    }
  };

  return (
    <div className="container mt-4">
      <h2>Queue Entries</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Appointment</th>
            <th>Appointment Date</th>
            <th>Doctor</th>
            <th>Consultation</th>
            <th>Consultation Date</th>
            <th>Status</th>
            <th>Change Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((q) => (
            <tr key={q.queueEntryId}>
              <td>{q.queueEntryId}</td>
              <td>{q.patientName}</td>
              <td>{q.appointmentId ?? "—"}</td>
              <td>
                {q.appointmentDate
                  ? new Date(q.appointmentDate).toLocaleString()
                  : "—"}
              </td>
              <td>{q.doctorName}</td>
              <td>{q.consultationId ?? "—"}</td>
              <td>
                {q.consultationDate
                  ? new Date(q.consultationDate).toLocaleString()
                  : "—"}
              </td>
              <td>{q.status}</td>
              <td>
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    className="me-1 mb-1"
                    variant={statusButtonVariant(status)}
                    active={q.status === status}
                    onClick={() => handleStatusChange(q.queueEntryId, status)}
                  >
                    {status}
                  </Button>
                ))}
              </td>
              <td>{new Date(q.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
