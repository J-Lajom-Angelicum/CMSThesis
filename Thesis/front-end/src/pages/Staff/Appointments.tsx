// src/pages/Staff/Appointments.tsx
import { useMemo, useState } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

type AppointmentStatus = "Booked" | "CheckedIn" | "Cancelled" | "NoShow" | "Completed";

type Appointment = {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  appointmentDateTime: string;
  appointmentStatus: AppointmentStatus;
  notes?: string;
};

export default function Appointments() {
  const { role, user, users } = useAuth();

  const currentUser = users.find(u => u.username === user);
  const currentUserId = currentUser?.id ?? null;

  const isAdmin = role === "ADMIN";
  const isStaff = role === "STAFF";
  const isDoctor = role === "DOCTOR";

  // initial data
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const docIds = users.filter(u => u.role === "DOCTOR").map(u => u.id);
    const docA = docIds[0] ?? 201;
    const docB = docIds[1] ?? (docA === 201 ? 202 : 201);

    return [
      {
        appointmentId: 1,
        patientId: 101,
        doctorId: docA,
        appointmentDateTime: "2025-09-30T09:00",
        appointmentStatus: "Booked",
        notes: "Follow-up checkup",
      },
      {
        appointmentId: 2,
        patientId: 102,
        doctorId: docB,
        appointmentDateTime: "2025-10-01T14:00",
        appointmentStatus: "CheckedIn",
        notes: "Initial consultation",
      },
    ];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDateTime: "",
    appointmentStatus: "Booked" as AppointmentStatus,
    notes: "",
  });

  // safe typing for input/select/textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const displayedAppointments = useMemo(() => {
    if (isDoctor && currentUserId !== null) {
      return appointments.filter(a => a.doctorId === currentUserId);
    }
    return appointments;
  }, [appointments, isDoctor, currentUserId]);

  // add or update
  const handleSave = () => {
    if (editingId) {
      setAppointments(prev =>
        prev.map(a =>
          a.appointmentId === editingId
            ? {
                ...a,
                patientId: Number(formData.patientId),
                doctorId: Number(formData.doctorId),
                appointmentDateTime: formData.appointmentDateTime,
                appointmentStatus: formData.appointmentStatus,
                notes: formData.notes,
              }
            : a
        )
      );
    } else {
      const nextId =
        appointments.length > 0
          ? Math.max(...appointments.map(a => a.appointmentId)) + 1
          : 1;
      setAppointments(prev => [
        ...prev,
        {
          appointmentId: nextId,
          patientId: Number(formData.patientId),
          doctorId: Number(formData.doctorId),
          appointmentDateTime: formData.appointmentDateTime,
          appointmentStatus: formData.appointmentStatus,
          notes: formData.notes,
        },
      ]);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({
      patientId: "",
      doctorId: "",
      appointmentDateTime: "",
      appointmentStatus: "Booked",
      notes: "",
    });
  };

  const handleEdit = (a: Appointment) => {
    setEditingId(a.appointmentId);
    setFormData({
      patientId: String(a.patientId),
      doctorId: String(a.doctorId),
      appointmentDateTime: a.appointmentDateTime,
      appointmentStatus: a.appointmentStatus,
      notes: a.notes ?? "",
    });
    setShowModal(true);
  };

  const handleCancel = (id: number) => {
    setAppointments(prev =>
      prev.map(a =>
        a.appointmentId === id ? { ...a, appointmentStatus: "Cancelled" } : a
      )
    );
  };

  const handleComplete = (id: number) => {
    setAppointments(prev =>
      prev.map(a =>
        a.appointmentId === id ? { ...a, appointmentStatus: "Completed" } : a
      )
    );
  };

  return (
    <div className="container mt-4">
      <h2>Appointments</h2>

      {(isAdmin || isStaff) && (
        <Button
          variant="primary"
          className="mb-3"
          onClick={() => {
            setEditingId(null);
            setFormData({
              patientId: "",
              doctorId: "",
              appointmentDateTime: "",
              appointmentStatus: "Booked",
              notes: "",
            });
            setShowModal(true);
          }}
        >
          + Book Appointment
        </Button>
      )}

      {displayedAppointments.length === 0 ? (
        <Alert variant="info">No appointments to show.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedAppointments.map(a => (
              <tr key={a.appointmentId}>
                <td>{a.appointmentId}</td>
                <td>{a.patientId}</td>
                <td>{a.doctorId}</td>
                <td>{new Date(a.appointmentDateTime).toLocaleString()}</td>
                <td>{a.appointmentStatus}</td>
                <td>{a.notes}</td>
                <td>
                  {isDoctor &&
                    currentUserId !== null &&
                    a.doctorId === currentUserId &&
                    a.appointmentStatus !== "Completed" && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleComplete(a.appointmentId)}
                      >
                        Mark Completed
                      </Button>
                    )}

                  {(isAdmin || isStaff) &&
                    a.appointmentStatus === "Booked" && (
                      <Button
                        size="sm"
                        variant="danger"
                        className="ms-2"
                        onClick={() => handleCancel(a.appointmentId)}
                      >
                        Cancel
                      </Button>
                    )}

                  {(isAdmin || isStaff) && (
                    <Button
                      size="sm"
                      variant="warning"
                      className="ms-2"
                      onClick={() => handleEdit(a)}
                    >
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Edit Appointment" : "Book Appointment"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Patient ID</Form.Label>
              <Form.Control
                type="number"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor ID</Form.Label>
              <Form.Control
                type="number"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Use a numeric doctor id (from users list).
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="appointmentDateTime"
                value={formData.appointmentDateTime}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="appointmentStatus"
                value={formData.appointmentStatus}
                onChange={handleChange}
              >
                <option value="Booked">Booked</option>
                <option value="CheckedIn">CheckedIn</option>
                <option value="Cancelled">Cancelled</option>
                <option value="NoShow">NoShow</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
