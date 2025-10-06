// src/pages/Staff/Appointments.tsx
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import api from "../../api/axios";

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
}

interface Appointment {
  appointmentId: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  appointmentDateTime: string;
  appointmentStatus: string;
  notes: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDateTime: "",
    notes: "",
  });

  // Load patients, doctors, and appointments
  const loadData = async () => {
    try {
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get("/patients"),
        api.get("/users?role=DOCTOR"),
        api.get("/appointments"),
      ]);

      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDateTime) {
      alert("Please fill required fields.");
      return;
    }

    const dto = {
      patientId: Number(formData.patientId),
      doctorId: Number(formData.doctorId),
      appointmentDateTime: formData.appointmentDateTime,
      notes: formData.notes || null,
    };

    try {
      if (editingId) {
        await api.put(`/appointments/${editingId}`, dto);
      } else {
        await api.post("/appointments", dto);
      }

      await loadData();
      setShowModal(false);
      setEditingId(null);
      setFormData({ patientId: "", doctorId: "", appointmentDateTime: "", notes: "" });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving appointment");
    }
  };

  const handleEdit = (a: Appointment) => {
    setEditingId(a.appointmentId);
    setFormData({
      patientId: String(a.patientId),
      doctorId: String(a.doctorId),
      appointmentDateTime: a.appointmentDateTime,
      notes: a.notes,
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/appointments/${id}`, { appointmentStatus: status });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Appointments</h2>
      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        + Book Appointment
      </Button>

      {appointments.length === 0 ? (
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
            {appointments.map(a => (
              <tr key={a.appointmentId}>
                <td>{a.appointmentId}</td>
                <td>{a.patientFirstName} {a.patientLastName}</td>
                <td>{a.doctorFirstName} {a.doctorLastName}</td>
                <td>{new Date(a.appointmentDateTime).toLocaleString()}</td>
                <td>{a.appointmentStatus}</td>
                <td>{a.notes}</td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => handleEdit(a)}>Edit</Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="ms-2"
                    onClick={() => handleStatusChange(a.appointmentId, "Cancelled")}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    className="ms-2"
                    onClick={() => handleStatusChange(a.appointmentId, "Completed")}
                  >
                    Complete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for create/edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Appointment" : "Book Appointment"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select name="patientId" value={formData.patientId} onChange={handleChange}>
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Select name="doctorId" value={formData.doctorId} onChange={handleChange}>
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.firstName} {d.lastName}
                  </option>
                ))}
              </Form.Select>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
