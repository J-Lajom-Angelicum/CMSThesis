import { useState } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

type PaymentMethod = "Cash" | "Card" | "Insurance" | "Online";

type Payment = {
  paymentId: number;
  patientId: number;
  consultationId: number;
  appointmentId?: number | null;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReason: string;
  paymentDate: string;
  recordedByUserId: number;
};

export default function Payments() {
  const { user, users } = useAuth();

  const currentUser = users.find(u => u.username === user);
  const currentUserId = currentUser?.id ?? 0;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    consultationId: "",
    appointmentId: "",
    amount: "",
    paymentMethod: "Cash" as PaymentMethod,
    paymentReason: "",
  });

  // ✅ fixed handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // add or edit
  const handleSave = () => {
    if (editingId) {
      setPayments(prev =>
        prev.map(p =>
          p.paymentId === editingId
            ? {
                ...p,
                patientId: Number(formData.patientId),
                consultationId: Number(formData.consultationId),
                appointmentId: formData.appointmentId
                  ? Number(formData.appointmentId)
                  : null,
                amount: Number(formData.amount),
                paymentMethod: formData.paymentMethod,
                paymentReason: formData.paymentReason,
              }
            : p
        )
      );
    } else {
      const nextId =
        payments.length > 0
          ? Math.max(...payments.map(p => p.paymentId)) + 1
          : 1;
      setPayments(prev => [
        ...prev,
        {
          paymentId: nextId,
          patientId: Number(formData.patientId),
          consultationId: Number(formData.consultationId),
          appointmentId: formData.appointmentId
            ? Number(formData.appointmentId)
            : null,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentReason: formData.paymentReason,
          paymentDate: new Date().toISOString(),
          recordedByUserId: currentUserId,
        },
      ]);
    }

    // reset
    setShowModal(false);
    setEditingId(null);
    setFormData({
      patientId: "",
      consultationId: "",
      appointmentId: "",
      amount: "",
      paymentMethod: "Cash",
      paymentReason: "",
    });
  };

  const handleEdit = (p: Payment) => {
    setEditingId(p.paymentId);
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

  return (
    <div className="container mt-4">
      <h2>Payments</h2>

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => {
          setEditingId(null);
          setFormData({
            patientId: "",
            consultationId: "",
            appointmentId: "",
            amount: "",
            paymentMethod: "Cash",
            paymentReason: "",
          });
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
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Payment" : "Add Payment"}</Modal.Title>
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
              <Form.Label>Consultation ID</Form.Label>
              <Form.Control
                type="number"
                name="consultationId"
                value={formData.consultationId}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Appointment ID (optional)</Form.Label>
              <Form.Control
                type="number"
                name="appointmentId"
                value={formData.appointmentId}
                onChange={handleChange}
              />
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
              <Form.Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
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
