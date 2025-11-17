import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
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
  appointmentDateTime: string;
}

interface Consultation {
  consultationId: number;
  patientId: number;
  doctorId: number;
  appointmentId?: number | null; // ✅ Allow null here
  consultationDate: string;
  notes: string;
  diagnosis: string;
  treatment: string;
}

interface QueueEntry {
  queueEntryId: number;
  patientId: number;
  appointmentId: number | null;
  doctorId: number | null;
  consultationId: number | null;
  status: "Waiting" | "InProgress" | "Done" | "Skipped";
}

export default function Consultations() {
  const { role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentId: "",
    consultationDate: "",
    notes: "",
    diagnosis: "",
    treatment: "",
  });

  const isAdmin = role === "ADMIN";
  const isDoctor = role === "DOCTOR";
  const isStaff = role === "STAFF";

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsRes, doctorsRes, apptRes, consRes, queueRes] = await Promise.all([
        api.get("/patients"),
        api.get("/doctors"),
        api.get("/appointments"),
        api.get("/consultations"),
        api.get("/queueentries"),
      ]);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setAppointments(apptRes.data);
      setConsultations(consRes.data);
      setQueue(queueRes.data);
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
      appointmentId: "",
      consultationDate: "",
      notes: "",
      diagnosis: "",
      treatment: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    if (isStaff) return alert("Staff cannot modify consultations.");
    if (
  !Number(formData.patientId) ||
  !Number(formData.doctorId) ||
  !formData.consultationDate
) {
  alert("Please fill in all required fields.");
  return;
}

    const dto = {
      patientId: Number(formData.patientId),
      doctorId: Number(formData.doctorId),
      appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
      consultationDate: formData.consultationDate,
      notes: formData.notes,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
    };

    try {
      let savedConsultation: Consultation;
      if (editingId) {
        await api.put(`/consultations/${editingId}`, dto);
        savedConsultation = { ...dto, consultationId: editingId };
      } else {
        const res = await api.post("/consultations", dto);
        savedConsultation = res.data;
      }

      // 🔗 Update linked QueueEntry if appointmentId exists
      if (dto.appointmentId) {
        const linkedQueue = queue.find(q => q.appointmentId === dto.appointmentId);
        if (linkedQueue) {
          await api.put(`/queueentries/${linkedQueue.queueEntryId}`, {
            Status: "Done",
            DoctorId: linkedQueue.doctorId,
            ConsultationId: savedConsultation.consultationId,
          });

          // Update UI immediately
          setQueue(prev =>
            prev.map(q =>
              q.queueEntryId === linkedQueue.queueEntryId
                ? { ...q, consultationId: savedConsultation.consultationId, status: "Done" }
                : q
            )
          );
        }
      }

      await loadData();
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving consultation.");
    }
  };

  const handleEdit = (c: Consultation) => {
    if (isStaff) return;
    setEditingId(c.consultationId);
    setFormData({
      patientId: String(c.patientId),
      doctorId: String(c.doctorId),
      appointmentId: c.appointmentId ? String(c.appointmentId) : "",
      consultationDate: c.consultationDate.slice(0, 16),
      notes: c.notes,
      diagnosis: c.diagnosis,
      treatment: c.treatment,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to delete this consultation?")) return;
    try {
      await api.delete(`/consultations/${id}`);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete consultation.");
    }
  };

  const displayedConsultations = useMemo(() => {
    if (isDoctor) {
      return consultations.filter(c => c.doctorId === Number(localStorage.getItem("doctorId")));
    }
    return consultations;
  }, [consultations, isDoctor]);

  return (
    <div className="container mt-4">
      <h2>Consultations</h2>

      {(isAdmin || isDoctor) && (
        <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
          + New Consultation
        </Button>
      )}

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : displayedConsultations.length === 0 ? (
        <Alert variant="info">No consultations found.</Alert>
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
              {(isAdmin || isDoctor) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayedConsultations.map(c => (
              <tr key={c.consultationId}>
                <td>{c.consultationId}</td>
                <td>{patients.find(p => p.patientId === c.patientId)?.firstName}{" "}{patients.find(p => p.patientId === c.patientId)?.lastName}</td>
                <td>{doctors.find(d => d.doctorId === c.doctorId)?.firstName}{" "}{doctors.find(d => d.doctorId === c.doctorId)?.lastName}</td>
                <td>{c.appointmentId || "-"}</td>
                <td>{new Date(c.consultationDate).toLocaleString()}</td>
                <td>{c.diagnosis}</td>
                <td>{c.treatment}</td>
                <td>{c.notes}</td>
                {(isAdmin || isDoctor) && (
                  <td>
                    <Button size="sm" variant="warning" onClick={() => handleEdit(c)}>Edit</Button>
                    {isAdmin && (
                      <Button size="sm" variant="danger" className="ms-2" onClick={() => handleDelete(c.consultationId)}>Delete</Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* MODAL */}
      <Modal show={showModal} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Consultation" : "New Consultation"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select name="patientId" value={formData.patientId} onChange={handleChange} disabled={isStaff}>
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctor</Form.Label>
              <Form.Select name="doctorId" value={formData.doctorId} onChange={handleChange} disabled={isStaff}>
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>{d.firstName} {d.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment (optional)</Form.Label>
              <Form.Select name="appointmentId" value={formData.appointmentId} onChange={handleChange}>
                <option value="">None</option>
                {appointments.map(a => (
                  <option key={a.appointmentId} value={a.appointmentId}>
                    {a.appointmentId} — {new Date(a.appointmentDateTime).toLocaleString()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="datetime-local" name="consultationDate" value={formData.consultationDate} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Treatment</Form.Label>
              <Form.Control as="textarea" rows={2} name="treatment" value={formData.treatment} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm}>Close</Button>
          {(isAdmin || isDoctor) && <Button variant="primary" onClick={handleSave}>Save</Button>}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
