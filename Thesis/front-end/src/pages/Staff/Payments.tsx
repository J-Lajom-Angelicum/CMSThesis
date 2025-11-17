import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import Select from "react-select";
import type { SingleValue } from "react-select";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

type PaymentMethod = "Cash" | "Card" | "Insurance" | "Online";

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
  fullName?: string;
}

interface Consultation {
  consultationId: number;
  patientId: number;
  appointmentId?: number;
  consultationDate: string;
}

interface Appointment {
  appointmentId: number;
  patientId: number;
  appointmentDateTime: string;
}

interface User {
  userId: number;
  username: string;
}

interface Payment {
  paymentId: number;
  patientId: number;
  consultationId: number;
  appointmentId?: number | null;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReason: string;
  paymentDate: string;
  recordedByUserId: number;
}

interface PaymentDisplay extends Payment {
  patientName?: string;
  consultationDate?: string;
  appointmentDate?: string;
}

interface SelectOption {
  value: number;
  label: string;
}

export default function Payments() {
  const { user } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [payments, setPayments] = useState<PaymentDisplay[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    patientId: "",
    consultationId: "",
    appointmentId: "",
    amount: "",
    paymentMethod: "Cash" as PaymentMethod,
    paymentReason: "",
  });
  const [error, setError] = useState("");

  // Fetch dropdowns
  const fetchDropdowns = async () => {
    try {
      const [patientsRes, consultationsRes, appointmentsRes, usersRes] = await Promise.all([
        api.get<Patient[]>("/Patients"),
        api.get<Consultation[]>("/Consultations"),
        api.get<Appointment[]>("/Appointments"),
        api.get<User[]>("/Users"),
      ]);

      const mappedPatients = patientsRes.data.map(p => ({
        ...p,
        fullName: `${p.firstName} ${p.lastName}`,
      }));

      setPatients(mappedPatients);
      setConsultations(consultationsRes.data);
      setAppointments(appointmentsRes.data);
      setUsers(usersRes.data);

      if (typeof user === "string") {
        const found = usersRes.data.find(u => u.username === user);
        if (found) setCurrentUserId(found.userId);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dropdowns or users");
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get<Payment[]>("/Payments");

      const mapped: PaymentDisplay[] = res.data.map(p => {
        const patient = patients.find(pt => pt.patientId === p.patientId);
        const consultation = consultations.find(c => c.consultationId === p.consultationId);
        const appointment = appointments.find(a => a.appointmentId === p.appointmentId);

        return {
          ...p,
          patientName: patient?.fullName ?? "Unknown",
          consultationDate: consultation?.consultationDate ?? "",
          appointmentDate: appointment?.appointmentDateTime ?? "",
        };
      });

      setPayments(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments");
    }
  };

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => {
    if (patients.length && consultations.length) fetchPayments();
  }, [patients, consultations, appointments]);

  const resetForm = () => setFormData({
    patientId: "",
    consultationId: "",
    appointmentId: "",
    amount: "",
    paymentMethod: "Cash",
    paymentReason: "",
  });

  // Generic input/select change handler for text/number fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // React-Select handlers
  const handlePatientChange = (selected: SingleValue<SelectOption>) =>
    setFormData(prev => ({ ...prev, patientId: selected ? String(selected.value) : "" }));

  const handleConsultationChange = (selected: SingleValue<SelectOption>) =>
    setFormData(prev => ({ ...prev, consultationId: selected ? String(selected.value) : "" }));

  const handleAppointmentChange = (selected: SingleValue<SelectOption>) =>
    setFormData(prev => ({ ...prev, appointmentId: selected ? String(selected.value) : "" }));

  const handleSave = async () => {
    if (!currentUserId) return setError("You must be logged in to record a payment");
    if (!formData.patientId || !formData.consultationId || !formData.amount || !formData.paymentReason) {
      return setError("Patient, consultation, amount, and reason are required");
    }

    const payload = {
      patientId: Number(formData.patientId),
      consultationId: Number(formData.consultationId),
      appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      paymentReason: formData.paymentReason,
      recordedByUserId: currentUserId,
    };

    try {
      if (editingPayment) {
        await api.put(`/Payments/${editingPayment.paymentId}`, payload);
      } else {
        await api.post("/Payments", payload);
      }
      setShowModal(false);
      resetForm();
      fetchPayments();
    } catch (err) {
      console.error(err);
      setError("Failed to save payment");
    }
  };

  const handleEdit = (p: PaymentDisplay) => {
    setEditingPayment(p);
    setFormData({
      patientId: String(p.patientId),
      consultationId: String(p.consultationId),
      appointmentId: p.appointmentId ? String(p.appointmentId) : "",
      amount: String(p.amount),
      paymentMethod: p.paymentMethod,
      paymentReason: p.paymentReason,
    });
    setShowModal(true);
  };

  const getUsername = (userId: number) => users.find(u => u.userId === userId)?.username ?? "Unknown";

  // Options for react-select
  const patientOptions: SelectOption[] = patients.map(p => ({ value: p.patientId, label: p.fullName! }));
  const consultationOptions: SelectOption[] = consultations.map(c => ({
    value: c.consultationId,
    label: `ID:${c.consultationId} - ${new Date(c.consultationDate).toLocaleDateString()}`,
  }));
  const appointmentOptions: SelectOption[] = appointments.map(a => ({
    value: a.appointmentId,
    label: `ID:${a.appointmentId} - ${new Date(a.appointmentDateTime).toLocaleString()}`,
  }));

  return (
    <div className="container mt-4">
      <h2>Payments</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Button variant="primary" className="mb-3" onClick={() => { resetForm(); setEditingPayment(null); setShowModal(true); }}>
        + Add Payment
      </Button>

      {payments.length === 0 ? (
        <Alert variant="info">No payments recorded.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Consultation</th>
              <th>Appointment</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Recorded By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.paymentId}>
                <td>{p.paymentId}</td>
                <td>{p.patientName}</td>
                <td>{p.consultationDate ? new Date(p.consultationDate).toLocaleDateString() : "-"}</td>
                <td>{p.appointmentDate ? new Date(p.appointmentDate).toLocaleString() : "-"}</td>
                <td>₱{p.amount.toFixed(2)}</td>
                <td>{p.paymentMethod}</td>
                <td>{p.paymentReason}</td>
                <td>{new Date(p.paymentDate).toLocaleString()}</td>
                <td>{getUsername(p.recordedByUserId)}</td>
                <td><Button size="sm" variant="warning" onClick={() => handleEdit(p)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingPayment ? "Edit Payment" : "Add Payment"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Select
                options={patientOptions}
                value={patientOptions.find(opt => opt.value === Number(formData.patientId)) || null}
                onChange={handlePatientChange}
                isClearable
                placeholder="Select Patient"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Consultation</Form.Label>
              <Select
                options={consultationOptions}
                value={consultationOptions.find(opt => opt.value === Number(formData.consultationId)) || null}
                onChange={handleConsultationChange}
                isClearable
                placeholder="Select Consultation"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment (optional)</Form.Label>
              <Select
                options={appointmentOptions}
                value={appointmentOptions.find(opt => opt.value === Number(formData.appointmentId)) || null}
                onChange={handleAppointmentChange}
                isClearable
                placeholder="None"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Insurance">Insurance</option>
                <option value="Online">Online</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control type="text" name="paymentReason" value={formData.paymentReason} onChange={handleChange} />
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
