import React, { useState, useEffect } from "react";
import { Form, Button, Table, Card, Spinner, Alert, Modal } from "react-bootstrap";
import api from "../../api/axios";

interface Batch {
  batchId: number;
  itemId: number;
  batchNumber: string;
  quantityInStock: number;
  expirationDate: string;
  dateReceived: string;
}

interface Consultation {
  consultationId: number;
  consultationDate: string;
}

interface ConsultationInventory {
  consultationInventoryId: number;
  consultationId: number;
  batchId: number;
  quantityUsed: number;
  notes: string;
  consultationDate?: string;
}

export default function InventoryUsage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [usageList, setUsageList] = useState<ConsultationInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [usage, setUsage] = useState({
    consultationId: "",
    batchId: "",
    quantityUsed: "",
    notes: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalData, setModalData] = useState({
    consultationId: "",
    batchId: "",
    quantityUsed: "",
    notes: "",
  });

  // Unified fetch
  const fetchData = async () => {
    try {
      const [batchesRes, consultationsRes, usageRes] = await Promise.all([
        api.get("/InventoryBatches"),
        api.get("/Consultations"),
        api.get("/ConsultationInventories"),
      ]);

      const batchesData: Batch[] = batchesRes.data.map((b: any) => ({
        batchId: b.batchId ?? b.BatchId,
        itemId: b.itemId ?? b.ItemId,
        batchNumber: b.batchNumber ?? b.BatchNumber,
        quantityInStock: b.quantityInStock ?? b.QuantityInStock,
        expirationDate: b.expirationDate ?? b.ExpirationDate,
        dateReceived: b.dateReceived ?? b.DateReceived,
      }));

      const consultationsData: Consultation[] = consultationsRes.data.map((c: any) => ({
        consultationId: c.consultationId ?? c.ConsultationId,
        consultationDate: c.consultationDate ?? c.ConsultationDate,
      }));

      const consultationMap = new Map<number, string>(
        consultationsData.map((c) => [c.consultationId, c.consultationDate])
      );

      const usageData: ConsultationInventory[] = usageRes.data.map((u: any) => ({
        consultationInventoryId: u.consultationInventoryId ?? u.ConsultationInventoryId,
        consultationId: u.consultationId ?? u.ConsultationId,
        batchId: u.batchId ?? u.BatchId,
        quantityUsed: u.quantityUsed ?? u.QuantityUsed,
        notes: u.notes ?? u.Notes,
        consultationDate: consultationMap.get(u.consultationId ?? u.ConsultationId),
      }));

      setBatches(batchesData);
      setConsultations(consultationsData);
      setUsageList(usageData);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Create new usage
  const handleUseItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { consultationId, batchId, quantityUsed, notes } = usage;

    if (!consultationId || !batchId || !quantityUsed) {
      alert("Please fill all required fields.");
      return;
    }

    const qty = parseInt(quantityUsed);
    const batch = batches.find((b) => b.batchId === parseInt(batchId));
    if (!batch || batch.quantityInStock < qty) {
      alert("Not enough stock or batch not found!");
      return;
    }

    try {
      await api.post("/ConsultationInventories", {
        consultationId: parseInt(consultationId),
        batchId: parseInt(batchId),
        quantityUsed: qty,
        notes,
      });
      await fetchData();
      setUsage({ consultationId: "", batchId: "", quantityUsed: "", notes: "" });
      alert("Usage recorded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to record usage.");
    }
  };

  // --- Edit / Modal logic
  const handleEdit = (u: ConsultationInventory) => {
    setEditingId(u.consultationInventoryId);
    setModalData({
      consultationId: String(u.consultationId),
      batchId: String(u.batchId),
      quantityUsed: String(u.quantityUsed),
      notes: u.notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/ConsultationInventories/${id}`);
      setUsageList((prev) => prev.filter((u) => u.consultationInventoryId !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
    }
  };

  const handleSave = async () => {
    const qty = parseInt(modalData.quantityUsed);
    const batch = batches.find((b) => b.batchId === parseInt(modalData.batchId));
    if (!batch || batch.quantityInStock < qty) {
      alert("Not enough stock or batch not found!");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/ConsultationInventories/${editingId}`, {
          consultationId: parseInt(modalData.consultationId),
          batchId: parseInt(modalData.batchId),
          quantityUsed: qty,
          notes: modalData.notes,
        });
      }
      await fetchData();
      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update record.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Inventory Usage (Consultations)</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* --- Create usage form */}
          <Card className="mb-4">
            <Card.Body>
              <h5>Record Item Usage</h5>
              <Form onSubmit={handleUseItem} className="row g-3">
                <div className="col-md-4">
                  <Form.Select
                    value={usage.consultationId}
                    onChange={(e) => setUsage({ ...usage, consultationId: e.target.value })}
                    required
                  >
                    <option value="">Select Consultation</option>
                    {consultations.map((c) => (
                      <option key={c.consultationId} value={c.consultationId}>
                        {`ID:${c.consultationId} - ${new Date(c.consultationDate).toLocaleDateString()}`}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="col-md-4">
                  <Form.Select
                    value={usage.batchId}
                    onChange={(e) => setUsage({ ...usage, batchId: e.target.value })}
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                      <option key={b.batchId} value={b.batchId}>
                        {`ID:${b.batchId} - ${new Date(b.expirationDate).toLocaleDateString()}`}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="col-md-2">
                  <Form.Control
                    type="number"
                    placeholder="Qty Used"
                    value={usage.quantityUsed}
                    onChange={(e) => setUsage({ ...usage, quantityUsed: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-2">
                  <Button type="submit" variant="warning" className="w-100">Deduct</Button>
                </div>

                <div className="col-md-12">
                  <Form.Control
                    placeholder="Notes (optional)"
                    value={usage.notes}
                    onChange={(e) => setUsage({ ...usage, notes: e.target.value })}
                  />
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* --- Usage table */}
          <h5>Recorded Usages</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Consultation</th>
                <th>Batch ID</th>
                <th>Quantity Used</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usageList.length > 0 ? usageList.map((u) => (
                <tr key={u.consultationInventoryId}>
                  <td>{u.consultationInventoryId}</td>
                  <td>{u.consultationId} — {u.consultationDate ? new Date(u.consultationDate).toLocaleDateString() : "N/A"}</td>
                  <td>{u.batchId}</td>
                  <td>{u.quantityUsed}</td>
                  <td>{u.notes || "—"}</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(u)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u.consultationInventoryId)}>Delete</Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted">No usage records yet.</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* --- Edit modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit Usage</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Consultation</Form.Label>
                  <Form.Select
                    value={modalData.consultationId}
                    onChange={(e) => setModalData({ ...modalData, consultationId: e.target.value })}
                  >
                    {consultations.map((c) => (
                      <option key={c.consultationId} value={c.consultationId}>
                        {`ID:${c.consultationId} - ${new Date(c.consultationDate).toLocaleDateString()}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Batch</Form.Label>
                  <Form.Select
                    value={modalData.batchId}
                    onChange={(e) => setModalData({ ...modalData, batchId: e.target.value })}
                  >
                    {batches.map((b) => (
                      <option key={b.batchId} value={b.batchId}>
                        {`ID:${b.batchId} - ${new Date(b.expirationDate).toLocaleDateString()}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Quantity Used</Form.Label>
                  <Form.Control
                    type="number"
                    value={modalData.quantityUsed}
                    onChange={(e) => setModalData({ ...modalData, quantityUsed: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    type="text"
                    value={modalData.notes}
                    onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save</Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
