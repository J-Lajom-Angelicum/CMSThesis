import { useState } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

type LabOrder = {
  labOrderId: number;
  consultationId: number;
  patientId: number;
  orderedByUserId: number;
  orderDate: string;
  notes: string;
};

export default function LabOrders() {
  const { roleId, user } = useAuth();

  // Mock example data
  const [labOrders, setLabOrders] = useState<LabOrder[]>([
    {
      labOrderId: 1,
      consultationId: 101,
      patientId: 12,
      orderedByUserId: 1,
      orderDate: "2025-10-06",
      notes: "CBC and urinalysis requested",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    consultationId: "",
    patientId: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editingId) {
      setLabOrders((prev) =>
        prev.map((o) =>
          o.labOrderId === editingId
            ? {
                ...o,
                consultationId: Number(formData.consultationId),
                patientId: Number(formData.patientId),
                notes: formData.notes,
              }
            : o
        )
      );
    } else {
      const nextId =
        labOrders.length > 0
          ? Math.max(...labOrders.map((o) => o.labOrderId)) + 1
          : 1;

      setLabOrders((prev) => [
        ...prev,
        {
          labOrderId: nextId,
          consultationId: Number(formData.consultationId),
          patientId: Number(formData.patientId),
          orderedByUserId: 1, // mock current user
          orderDate: new Date().toISOString().split("T")[0],
          notes: formData.notes,
        },
      ]);
    }

    setShowModal(false);
    setEditingId(null);
    setFormData({ consultationId: "", patientId: "", notes: "" });
  };

  const handleEdit = (order: LabOrder) => {
    setEditingId(order.labOrderId);
    setFormData({
      consultationId: String(order.consultationId),
      patientId: String(order.patientId),
      notes: order.notes,
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this lab order?")) {
      setLabOrders((prev) => prev.filter((o) => o.labOrderId !== id));
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lab Orders</h2>

      {(roleId === 1 || roleId === 3) && (
        <Button
          variant="primary"
          className="mb-3"
          onClick={() => {
            setEditingId(null);
            setFormData({ consultationId: "", patientId: "", notes: "" });
            setShowModal(true);
          }}
        >
          + Create Lab Order
        </Button>
      )}

      {labOrders.length === 0 ? (
        <Alert variant="info">No lab orders found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Consultation</th>
              <th>Patient</th>
              <th>Ordered By</th>
              <th>Order Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {labOrders.map((o) => (
              <tr key={o.labOrderId}>
                <td>{o.labOrderId}</td>
                <td>{o.consultationId}</td>
                <td>{o.patientId}</td>
                <td>{o.orderedByUserId}</td>
                <td>{o.orderDate}</td>
                <td>{o.notes}</td>
                <td>
                  {(roleId === 2 || roleId === 3) && (
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => handleEdit(o)}
                    >
                      Edit
                    </Button>
                  )}
                  {roleId === 3 && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(o.labOrderId)}
                    >
                      Delete
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
            {editingId ? "Edit Lab Order" : "Create Lab Order"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
              <Form.Label>Patient ID</Form.Label>
              <Form.Control
                type="number"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
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
