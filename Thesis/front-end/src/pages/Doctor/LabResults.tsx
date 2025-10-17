import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import api from "../../api/axios";

interface LabOrder {
  labOrderId: number;
  patientId: number;
  patientName?: string; // mapped from Patients
}

interface LabResult {
  labResultId: number;
  labOrderId: number;
  testName: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  dateReported?: string;
  notes?: string;
  labOrderInfo?: string; // Order # + patient name
}

export default function LabResults() {
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingResult, setEditingResult] = useState<LabResult | null>(null);
  const [formData, setFormData] = useState({
    labOrderId: "",
    testName: "",
    resultValue: "",
    unit: "",
    referenceRange: "",
    notes: "",
  });
  const [error, setError] = useState("");

  // Fetch LabOrders + LabResults
  const fetchData = async () => {
    try {
      const [ordersRes, resultsRes, patientsRes] = await Promise.all([
        api.get<LabOrder[]>("/LabOrders"),
        api.get<LabResult[]>("/LabResults"),
        api.get<{ patientId: number; firstName: string; lastName: string }[]>("/Patients"),
      ]);

      const ordersWithNames: LabOrder[] = ordersRes.data.map((o) => {
        const patient = patientsRes.data.find((p) => p.patientId === o.patientId);
        return {
          ...o,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
        };
      });

      setLabOrders(ordersWithNames);

      const mappedResults: LabResult[] = resultsRes.data.map((r) => {
        const order = ordersWithNames.find((o) => o.labOrderId === r.labOrderId);
        return {
          ...r,
          labOrderInfo: order ? `Order #${order.labOrderId} - ${order.patientName}` : `Order #${r.labOrderId}`,
        };
      });

      setLabResults(mappedResults);
    } catch (err) {
      console.error(err);
      setError("Failed to load lab results or lab orders");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () =>
    setFormData({
      labOrderId: "",
      testName: "",
      resultValue: "",
      unit: "",
      referenceRange: "",
      notes: "",
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.labOrderId || !formData.testName || !formData.resultValue) {
      setError("Lab Order, Test Name, and Result are required");
      return;
    }

    const payload = {
      labOrderId: Number(formData.labOrderId),
      testName: formData.testName,
      resultValue: formData.resultValue,
      unit: formData.unit || null,
      referenceRange: formData.referenceRange || null,
      notes: formData.notes || null,
      dateReported: new Date().toISOString().split("T")[0], // SQL DATE format
    };

    try {
      if (editingResult) {
        await api.put(`/LabResults/${editingResult.labResultId}`, payload);
      } else {
        await api.post("/LabResults", payload);
      }
      setShowModal(false);
      resetForm();
      setEditingResult(null);
      fetchData();
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save lab result");
    }
  };

  const handleEdit = (r: LabResult) => {
    setEditingResult(r);
    setFormData({
      labOrderId: String(r.labOrderId),
      testName: r.testName,
      resultValue: r.resultValue,
      unit: r.unit || "",
      referenceRange: r.referenceRange || "",
      notes: r.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this lab result?")) return;
    try {
      await api.delete(`/LabResults/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to delete lab result");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lab Results</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Button className="mb-3" onClick={() => { resetForm(); setEditingResult(null); setShowModal(true); }}>
        + Add Lab Result
      </Button>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Lab Order</th>
            <th>Test Name</th>
            <th>Result</th>
            <th>Unit</th>
            <th>Reference Range</th>
            <th>Date Reported</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {labResults.map((r) => (
            <tr key={r.labResultId}>
              <td>{r.labResultId}</td>
              <td>{r.labOrderInfo}</td>
              <td>{r.testName}</td>
              <td>{r.resultValue}</td>
              <td>{r.unit || "-"}</td>
              <td>{r.referenceRange || "-"}</td>
              <td>{r.dateReported ? new Date(r.dateReported).toLocaleDateString() : "-"}</td>
              <td>
                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(r)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(r.labResultId)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingResult ? "Edit Lab Result" : "Add Lab Result"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Lab Order</Form.Label>
              <Form.Select name="labOrderId" value={formData.labOrderId} onChange={handleChange}>
                <option value="">Select Lab Order</option>
                {labOrders.map((o) => (
                  <option key={o.labOrderId} value={o.labOrderId}>
                    {`Order #${o.labOrderId} - ${o.patientName}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Test Name</Form.Label>
              <Form.Control name="testName" value={formData.testName} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Result Value</Form.Label>
              <Form.Control name="resultValue" value={formData.resultValue} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Control name="unit" value={formData.unit} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reference Range</Form.Label>
              <Form.Control name="referenceRange" value={formData.referenceRange} onChange={handleChange} />
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
