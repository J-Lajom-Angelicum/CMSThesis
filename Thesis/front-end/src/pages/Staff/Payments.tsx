import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

type PaymentMethod = "Cash" | "Card" | "Insurance" | "Online";

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
  fullName: string;
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

interface Payment {
  paymentId: number;
  patientId: number;
  patientName: string;
  consultationId: number;
  consultationDate: string;
  appointmentId?: number | null;
  appointmentDate?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReason: string;
  paymentDate: string;
  recordedByUser?: string;
}

export default function Payments() {
  const { user } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

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

  // Fetch dropdown data
  const fetchDropdowns = async () => {
    try {
      const [patientsRes, consultationsRes, appointmentsRes] = await Promise.all([
        api.get<Patient[]>("/Patients"),
        api.get<Consultation[]>("/Consultations"),
        api.get<Appointment[]>("/Appointments"),
      ]);

      setPatients(
        patientsRes.data.map(p => ({ ...p, fullName: `${p.firstName} ${p.lastName}` }))
      );
      setConsultations(consultationsRes.data);
      setAppointments(appointmentsRes.data);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
      setError("Failed to load dropdown data");
    }
  };

  // Fetch payments from backend
  const fetchPayments = async () => {
    try {
      const res = await api.get<Payment[]>("/Payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setError("Failed to load payments");
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchPayments();
  }, []);

  const resetForm = () => {
    setFormData({
      patientId: "",
      consultationId: "",
      appointmentId: "",
      amount: "",
      paymentMethod: "Cash",
      paymentReason: "",
    });
    setEditingPayment(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (!user) {
        setError("You must be logged in to record a payment");
        return;
      }

      const payload = {
        patientId: Number(formData.patientId),
        consultationId: Number(formData.consultationId),
        appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentReason: formData.paymentReason,
        recordedByUser: user, // <-- using username directly
      };

      if (editingPayment) {
        await api.put(`/Payments/${editingPayment.paymentId}`, payload);
      } else {
        await api.post("/Payments", payload);
      }

      setShowModal(false);
      resetForm();
      fetchPayments();
    } catch (err) {
      console.error("Failed to save payment:", err);
      setError("Failed to save payment");
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      patientId: String(payment.patientId),
      consultationId: String(payment.consultationId),
      appointmentId: payment.appointmentId ? String(payment.appointmentId) : "",
      amount: String(payment.amount),
      paymentMethod: payment.paymentMethod,
      paymentReason: payment.paymentReason,
    });
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <h2>Payments</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
      >
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
                <td>{new Date(p.consultationDate).toLocaleDateString()}</td>
                <td>{p.appointmentDate ? new Date(p.appointmentDate).toLocaleString() : "-"}</td>
                <td>₱{p.amount.toFixed(2)}</td>
                <td>{p.paymentMethod}</td>
                <td>{p.paymentReason}</td>
                <td>{new Date(p.paymentDate).toLocaleString()}</td>
                <td>{p.recordedByUser ?? user}</td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => handleEdit(p)}>
                    Edit
                  </Button>
                </td>
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
              <Form.Select name="patientId" value={formData.patientId} onChange={handleChange}>
                <option value="">Select patient</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.fullName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Consultation</Form.Label>
              <Form.Select name="consultationId" value={formData.consultationId} onChange={handleChange}>
                <option value="">Select consultation</option>
                {consultations.map(c => (
                  <option key={c.consultationId} value={c.consultationId}>
                    {`ID:${c.consultationId} - ${new Date(c.consultationDate).toLocaleDateString()}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment (optional)</Form.Label>
              <Form.Select name="appointmentId" value={formData.appointmentId} onChange={handleChange}>
                <option value="">None</option>
                {appointments.map(a => (
                  <option key={a.appointmentId} value={a.appointmentId}>
                    {`ID:${a.appointmentId} - ${new Date(a.appointmentDateTime).toLocaleString()}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
              />
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
              <Form.Control
                type="text"
                name="paymentReason"
                value={formData.paymentReason}
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
