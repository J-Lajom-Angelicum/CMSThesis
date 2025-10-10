import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import api from "../../api/axios";

interface QueueEntry {
  queueEntryId: number;
  patientId: number;
  patientName: string;
  appointmentId: number | null;
  appointmentDate: string | null;
  doctorId: number | null;
  doctorName: string | null;
  consultationId: number | null;
  status: "Waiting" | "InProgress" | "Done" | "Skipped";
  createdAt: string;
}

export default function QueueEntries() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);

  useEffect(() => {
    fetchQueueEntries();
  }, []);

  const fetchQueueEntries = async () => {
    try {
      const response = await api.get("/QueueEntries");
      setQueue(response.data);
    } catch (err) {
      console.error("Failed to fetch queue entries:", err);
    }
  };

  const handleQueueStatusChange = async (queueId: number, newStatus: QueueEntry["status"]) => {
    try {
      await api.put(`/QueueEntries/${queueId}/status`, JSON.stringify(newStatus), {
        headers: { "Content-Type": "application/json" },
      });
      fetchQueueEntries(); // refresh after update
    } catch (err) {
      console.error("Failed to update queue status:", err);
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
              <td>{q.appointmentDate ?? "—"}</td>
              <td>{q.doctorName ?? "—"}</td>
              <td>{q.consultationId ?? "—"}</td>
              <td>{q.status}</td>
              <td>
                <Button
                  size="sm"
                  variant="info"
                  onClick={() => handleQueueStatusChange(q.queueEntryId, "InProgress")}
                >
                  In Progress
                </Button>{" "}
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleQueueStatusChange(q.queueEntryId, "Done")}
                >
                  Done
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleQueueStatusChange(q.queueEntryId, "Skipped")}
                >
                  Skipped
                </Button>
              </td>
              <td>{new Date(q.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
