// src/pages/Staff/Appointments.tsx
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import api from "../../api/axios";

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

interface Appointment {
  appointmentId: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  appointmentDateTime: string;
  appointmentStatus: "Booked" | "CheckedIn" | "Cancelled" | "NoShow" | "Completed";
  notes?: string | null;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDateTime: "",
    notes: "",
    appointmentStatus: "Booked" as Appointment["appointmentStatus"],
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get("/patients"),
        api.get("/doctors"),
        api.get("/appointments"),
      ]);

      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      doctorId: "",
      appointmentDateTime: "",
      notes: "",
      appointmentStatus: "Booked",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDateTime) {
      alert("Please fill in all required fields.");
      return;
    }

    const dto = {
      patientId: Number(formData.patientId),
      doctorId: Number(formData.doctorId),
      appointmentDateTime: formData.appointmentDateTime,
      notes: formData.notes || null,
      appointmentStatus: formData.appointmentStatus,
    };

    try {
      if (editingId) {
        // Update existing
        await api.put(`/appointments/${editingId}`, dto);
      } else {
        // Create new
        await api.post("/appointments", dto);
      }
      await loadData();
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving appointment.");
    }
  };

  const handleEdit = (a: Appointment) => {
    setEditingId(a.appointmentId);
    setFormData({
      patientId: String(a.patientId),
      doctorId: String(a.doctorId),
      appointmentDateTime: a.appointmentDateTime.slice(0, 16),
      notes: a.notes || "",
      appointmentStatus: a.appointmentStatus,
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id: number, status: Appointment["appointmentStatus"]) => {
    try {
      const existing = appointments.find(a => a.appointmentId === id);
      if (!existing) return alert("Appointment not found.");

      const dto = {
        patientId: existing.patientId,
        doctorId: existing.doctorId,
        appointmentDateTime: existing.appointmentDateTime,
        notes: existing.notes,
        appointmentStatus: status,
      };

      await api.put(`/appointments/${id}`, dto);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Appointments</h2>

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        + Book Appointment
      </Button>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : appointments.length === 0 ? (
        <Alert variant="info">No appointments available.</Alert>
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
                <td>{a.notes || "—"}</td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => handleEdit(a)}>Edit</Button>
                  <Button size="sm" variant="danger" className="ms-2" onClick={() => handleStatusChange(a.appointmentId, "Cancelled")}>Cancel</Button>
                  <Button size="sm" variant="success" className="ms-2" onClick={() => handleStatusChange(a.appointmentId, "Completed")}>Complete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for create/edit */}
      <Modal show={showModal} onHide={resetForm}>
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
                  <option key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Select name="doctorId" value={formData.doctorId} onChange={handleChange}>
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>{d.firstName} {d.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date & Time</Form.Label>
              <Form.Control type="datetime-local" name="appointmentDateTime" value={formData.appointmentDateTime} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} name="notes" value={formData.notes} onChange={handleChange} />
            </Form.Group>

            {editingId && (
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="appointmentStatus" value={formData.appointmentStatus} onChange={handleChange}>
                  <option value="Booked">Booked</option>
                  <option value="CheckedIn">CheckedIn</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="NoShow">NoShow</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm}>Close</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
