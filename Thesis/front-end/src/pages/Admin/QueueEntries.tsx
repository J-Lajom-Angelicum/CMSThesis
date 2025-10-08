// src/pages/Staff/QueueEntries.tsx
import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import type { QueueEntry, QueueEntryStatus } from "../../data/queue";
import type { Appointment } from "../../data/appointments";

export default function QueueEntries() {
  const [queue, setQueue] = useState<QueueEntry[]>(() => {
    const saved = localStorage.getItem("queue");
    return saved ? JSON.parse(saved) : [];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem("appointments");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("queue", JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  // ✅ Update queue + appointment together
  const handleQueueStatusChange = (queueId: number, newStatus: QueueEntryStatus) => {
    // Update queue
    setQueue((prev) =>
      prev.map((entry) =>
        entry.queueEntryId === queueId ? { ...entry, status: newStatus } : entry
      )
    );

    // Update appointment linked to that queue entry
    const q = queue.find((q) => q.queueEntryId === queueId);
    if (q?.appointmentId) {
      setAppointments((prev) =>
        prev.map((a) => {
          if (a.appointmentId === q.appointmentId) {
            let mapped: Appointment["appointmentStatus"] = a.appointmentStatus;
            if (newStatus === "Skipped") mapped = "Cancelled";
            else if (newStatus === "Done") mapped = "Completed";
            else if (newStatus === "InProgress") mapped = "CheckedIn";
            return { ...a, appointmentStatus: mapped };
          }
          return a;
        })
      );
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
            <th>Doctor</th>
            <th>Status</th>
            <th>Change Status</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((q) => (
            <tr key={q.queueEntryId}>
              <td>{q.queueEntryId}</td>
              <td>{q.patientId}</td>
              <td>{q.appointmentId}</td>
              <td>{q.doctorId ?? "Unassigned"}</td>
              <td>{q.status}</td>
              <td>
                <Button
                  size="sm"
                  variant="info"
                  className="me-2"
                  onClick={() => handleQueueStatusChange(q.queueEntryId, "InProgress")}
                >
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  className="me-2"
                  onClick={() => handleQueueStatusChange(q.queueEntryId, "Done")}
                >
                  Done
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleQueueStatusChange(q.queueEntryId, "Skipped")}
                >
                  Skipped
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
