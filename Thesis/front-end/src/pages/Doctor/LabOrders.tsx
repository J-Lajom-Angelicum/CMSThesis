import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface LabOrder {
  labOrderId: number;
  consultationId: number;
  patientId: number;
  orderedByUserId: number;
  orderDate: string;
  notes?: string;
  patientName?: string; // mapped from Patients
  consultationDate?: string; // mapped from Consultations
  orderedByUsername?: string; // mapped from Users
}

interface Patient {
  patientId: number;
  firstName: string;
  lastName: string;
}

interface Consultation {
  consultationId: number;
  consultationDate: string;
}

interface User {
  userId: number;
  username: string;
}

export default function LabOrders() {
  const { user } = useAuth(); // assume this returns username string
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);
  const [formData, setFormData] = useState({
    patientId: "",
    consultationId: "",
    notes: "",
  });
  const [error, setError] = useState("");

  // Fetch dropdowns + map current username to userId
  const fetchDropdowns = async () => {
    try {
      const [patientsRes, consultationsRes, usersRes] = await Promise.all([
        api.get<Patient[]>("/Patients"),
        api.get<Consultation[]>("/Consultations"),
        api.get<User[]>("/Users"),
      ]);

      setPatients(
        patientsRes.data.map((p) => ({ ...p, fullName: `${p.firstName} ${p.lastName}` }))
      );
      setConsultations(consultationsRes.data);
      setUsers(usersRes.data);

      // Map current username to userId
      if (typeof user === "string") {
        const found = usersRes.data.find((u) => u.username === user);
        if (found) setCurrentUserId(found.userId);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dropdowns or users");
    }
  };

  // Fetch LabOrders and map names/dates
  const fetchLabOrders = async () => {
    try {
      const res = await api.get<LabOrder[]>("/LabOrders");

      const mapped: LabOrder[] = res.data.map((o) => {
        const patient = patients.find((p) => p.patientId === o.patientId);
        const consultation = consultations.find((c) => c.consultationId === o.consultationId);
        const user = users.find((u) => u.userId === o.orderedByUserId);

        return {
          ...o,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
          consultationDate: consultation ? consultation.consultationDate : "",
          orderedByUsername: user ? user.username : "Unknown",
        };
      });

      setLabOrders(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load lab orders");
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  // Refresh lab orders after dropdowns loaded
  useEffect(() => {
    if (patients.length && consultations.length && users.length) {
      fetchLabOrders();
    }
  }, [patients, consultations, users]);

  const resetForm = () =>
    setFormData({
      patientId: "",
      consultationId: "",
      notes: "",
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.patientId || !formData.consultationId) {
      setError("Patient and Consultation are required");
      return;
    }
    if (!currentUserId) {
      setError("You must be logged in");
      return;
    }

    const payload = {
      patientId: Number(formData.patientId),
      consultationId: Number(formData.consultationId),
      notes: formData.notes || null,
      orderedByUserId: currentUserId,
    };

    try {
      if (editingOrder) {
        await api.put(`/LabOrders/${editingOrder.labOrderId}`, payload);
      } else {
        await api.post("/LabOrders", payload);
      }
      setShowModal(false);
      resetForm();
      setEditingOrder(null);
      fetchLabOrders();
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save lab order");
    }
  };

  const handleEdit = (o: LabOrder) => {
    setEditingOrder(o);
    setFormData({
      patientId: String(o.patientId),
      consultationId: String(o.consultationId),
      notes: o.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this lab order?")) return;
    try {
      await api.delete(`/LabOrders/${id}`);
      fetchLabOrders();
    } catch (err) {
      console.error(err);
      setError("Failed to delete lab order");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lab Orders</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Button className="mb-3" onClick={() => { resetForm(); setEditingOrder(null); setShowModal(true); }}>
        + Add Lab Order
      </Button>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
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
              <td>{o.consultationDate || "-"}</td>
              <td>{o.patientName}</td>
              <td>{o.orderedByUsername}</td>
              <td>{new Date(o.orderDate).toLocaleDateString()}</td>
              <td>{o.notes || "-"}</td>
              <td>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(o)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(o.labOrderId)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingOrder ? "Edit Lab Order" : "Add Lab Order"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select name="patientId" value={formData.patientId} onChange={handleChange}>
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Consultation</Form.Label>
              <Form.Select name="consultationId" value={formData.consultationId} onChange={handleChange}>
                <option value="">Select Consultation</option>
                {consultations.map((c) => (
                  <option key={c.consultationId} value={c.consultationId}>
                    {`ID:${c.consultationId} - ${new Date(c.consultationDate).toLocaleDateString()}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={2} name="notes" value={formData.notes} onChange={handleChange} />
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
