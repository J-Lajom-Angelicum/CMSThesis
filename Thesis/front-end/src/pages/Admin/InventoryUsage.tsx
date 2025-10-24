import React, { useState, useEffect } from "react";
import { Form, Button, Table, Card, Spinner, Alert } from "react-bootstrap";
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

  // Fetch batches, consultations, and usage
  const fetchData = async () => {
    try {
      const [batchesRes, consultationsRes, usageRes] = await Promise.all([
        api.get<Batch[]>("/InventoryBatches"),
        api.get<Consultation[]>("/Consultations"),
        api.get<ConsultationInventory[]>("/ConsultationInventory"),
      ]);

      setBatches(batchesRes.data);
      setConsultations(consultationsRes.data);
      setUsageList(usageRes.data);
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

  const handleUseItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const { consultationId, batchId, quantityUsed, notes } = usage;

    if (!consultationId || !batchId || !quantityUsed)
      return alert("Please fill all required fields.");

    const qty = parseInt(quantityUsed);
    if (qty <= 0) return alert("Quantity must be greater than zero.");

    const batch = batches.find((b) => b.batchId === parseInt(batchId));
    if (!batch) return alert("Batch not found.");
    if (batch.quantityInStock < qty) return alert("Not enough stock available!");

    try {
      await api.post("/ConsultationInventory", {
        consultationId: parseInt(consultationId),
        batchId: parseInt(batchId),
        quantityUsed: qty,
        notes: notes || "",
      });

      fetchData();
      setUsage({ consultationId: "", batchId: "", quantityUsed: "", notes: "" });
      alert("Usage recorded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to record usage.");
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
          <Card className="mb-4">
            <Card.Body>
              <h5>Record Item Usage</h5>
              <Form onSubmit={handleUseItem} className="row g-3">
                <div className="col-md-4">
                  <Form.Select
                    value={usage.consultationId}
                    onChange={(e) =>
                      setUsage({ ...usage, consultationId: e.target.value })
                    }
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
                    onChange={(e) =>
                      setUsage({ ...usage, quantityUsed: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-2">
                  <Button type="submit" variant="warning" className="w-100">
                    Deduct
                  </Button>
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

          <h5>Updated Batches</h5>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Batch Number</th>
                <th>Quantity in Stock</th>
                <th>Expiration</th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map((b) => (
                  <tr key={b.batchId}>
                    <td>{b.batchId}</td>
                    <td>{b.batchNumber}</td>
                    <td>{b.quantityInStock}</td>
                    <td>{new Date(b.expirationDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No batches available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}
