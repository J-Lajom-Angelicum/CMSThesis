import { useMemo, useState } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

type Consultation = {
  consultationId: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  consultationDate: string;
  notes: string;
  diagnosis: string;
  treatment: string;
};

export default function Consultations() {
  const { role, user, users } = useAuth();

  const currentUser = users.find(u => u.username === user);
  const currentUserId = currentUser?.id ?? null;

  const isAdmin = role === "ADMIN";
  const isDoctor = role === "DOCTOR";
  const isStaff = role === "STAFF";

  // Initial sample data
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      consultationId: 1,
      patientId: 101,
      doctorId: currentUserId ?? 201,
      appointmentId: 1,
      consultationDate: "2025-09-27T10:00",
      notes: "Patient reported mild fever.",
      diagnosis: "Viral Infection",
      treatment: "Paracetamol 500mg",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: currentUserId ? String(currentUserId) : "",
    appointmentId: "",
    consultationDate: "",
    notes: "",
    diagnosis: "",
    treatment: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // RBAC filtering
  const displayedConsultations = useMemo(() => {
    if (isDoctor && currentUserId !== null) {
      return consultations.filter(c => c.doctorId === currentUserId);
    }
    if (isStaff) {
      return consultations; // staff sees all but cannot modify
    }
    if (isAdmin) {
      return consultations; // admin sees all
    }
    return [];
  }, [consultations, isDoctor, isStaff, isAdmin, currentUserId]);

  const handleSave = () => {
    if (isStaff) return; // staff cannot save

    if (editingId) {
      setConsultations(prev =>
        prev.map(c =>
          c.consultationId === editingId
            ? {
                ...c,
                patientId: Number(formData.patientId),
                doctorId: Number(formData.doctorId),
                appointmentId: formData.appointmentId
                  ? Number(formData.appointmentId)
                  : undefined,
                consultationDate: formData.consultationDate,
                notes: formData.notes,
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
              }
            : c
        )
      );
    } else {
      const nextId =
        consultations.length > 0
          ? Math.max(...consultations.map(c => c.consultationId)) + 1
          : 1;
      setConsultations(prev => [
        ...prev,
        {
          consultationId: nextId,
          patientId: Number(formData.patientId),
          doctorId: Number(formData.doctorId),
          appointmentId: formData.appointmentId
            ? Number(formData.appointmentId)
            : undefined,
          consultationDate: formData.consultationDate,
          notes: formData.notes,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
        },
      ]);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({
      patientId: "",
      doctorId: currentUserId ? String(currentUserId) : "",
      appointmentId: "",
      consultationDate: "",
      notes: "",
      diagnosis: "",
      treatment: "",
    });
  };

  const handleEdit = (c: Consultation) => {
    if (isStaff) return; // staff cannot edit

    setEditingId(c.consultationId);
    setFormData({
      patientId: String(c.patientId),
      doctorId: String(c.doctorId),
      appointmentId: c.appointmentId ? String(c.appointmentId) : "",
      consultationDate: c.consultationDate,
      notes: c.notes,
      diagnosis: c.diagnosis,
      treatment: c.treatment,
    });
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <h2>Consultations</h2>

      {/* New button: only Doctor + Admin */}
      {(isDoctor || isAdmin) && (
        <Button
          variant="primary"
          className="mb-3"
          onClick={() => {
            setEditingId(null);
            setFormData({
              patientId: "",
              doctorId: currentUserId ? String(currentUserId) : "",
              appointmentId: "",
              consultationDate: "",
              notes: "",
              diagnosis: "",
              treatment: "",
            });
            setShowModal(true);
          }}
        >
          + New Consultation
        </Button>
      )}

      {displayedConsultations.length === 0 ? (
        <Alert variant="info">No consultations to show.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Appointment</th>
              <th>Date</th>
              <th>Diagnosis</th>
              <th>Treatment</th>
              <th>Notes</th>
              {(isDoctor || isAdmin) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayedConsultations.map(c => (
              <tr key={c.consultationId}>
                <td>{c.consultationId}</td>
                <td>{c.patientId}</td>
                <td>{c.doctorId}</td>
                <td>{c.appointmentId ?? "-"}</td>
                <td>{new Date(c.consultationDate).toLocaleString()}</td>
                <td>{c.diagnosis}</td>
                <td>{c.treatment}</td>
                <td>{c.notes}</td>
                {(isDoctor || isAdmin) && (
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleEdit(c)}
                    >
                      Edit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? "Edit Consultation" : "New Consultation"}
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
                disabled={isStaff} // staff can't change
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor ID</Form.Label>
              <Form.Control
                type="number"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                disabled={isDoctor || isStaff} // doctor locked to self, staff read-only
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment ID (optional)</Form.Label>
              <Form.Control
                type="number"
                name="appointmentId"
                value={formData.appointmentId}
                onChange={handleChange}
                disabled={isStaff}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="datetime-local"
                name="consultationDate"
                value={formData.consultationDate}
                onChange={handleChange}
                disabled={isStaff}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                disabled={isStaff}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Treatment</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                disabled={isStaff}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Clinical Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={isStaff}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {(isDoctor || isAdmin) && (
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
