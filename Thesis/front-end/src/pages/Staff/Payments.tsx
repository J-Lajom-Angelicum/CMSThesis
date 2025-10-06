import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

type PaymentMethod = "Cash" | "Card" | "Insurance" | "Online";

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

export default function Payments() {
  const { user } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
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
      if (editingPayment) {
        // Update existing payment
        const updated = {
          ...editingPayment,
          patientId: Number(formData.patientId),
          consultationId: Number(formData.consultationId),
          appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentReason: formData.paymentReason,
        };
        await api.put(`/Payments/${editingPayment.paymentId}`, updated);
      } else {
        // Create new payment
        const newPayment = {
          patientId: Number(formData.patientId),
          consultationId: Number(formData.consultationId),
          appointmentId: formData.appointmentId ? Number(formData.appointmentId) : null,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentReason: formData.paymentReason,
        };
        await api.post("/Payments", newPayment);
      }
      setShowModal(false);
      resetForm();
      fetchPayments(); // Refresh the table
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
                <td>{p.patientId}</td>
                <td>{p.consultationId}</td>
                <td>{p.appointmentId ?? "-"}</td>
                <td>₱{p.amount.toFixed(2)}</td>
                <td>{p.paymentMethod}</td>
                <td>{p.paymentReason}</td>
                <td>{new Date(p.paymentDate).toLocaleString()}</td>
                <td>{p.recordedByUserId}</td>
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
              <Form.Label>Patient ID</Form.Label>
              <Form.Control type="number" name="patientId" value={formData.patientId} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Consultation ID</Form.Label>
              <Form.Control type="number" name="consultationId" value={formData.consultationId} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment ID (optional)</Form.Label>
              <Form.Control type="number" name="appointmentId" value={formData.appointmentId} onChange={handleChange} />
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
