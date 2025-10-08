import React, { useState, useEffect } from "react";
import { Form, Button, Table, Card } from "react-bootstrap";

interface Batch {
  batchId: number;
  itemId: number;
  batchNumber: string;
  quantityInStock: number;
  expirationDate: string;
  dateReceived: string;
}

interface Transaction {
  transactionId: number;
  batchId: number;
  quantityChange: number;
  transactionType: string;
  transactionDate: string;
  referenceId?: number; // consultationId
}

export default function InventoryUsage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usage, setUsage] = useState({
    consultationId: "",
    batchId: "",
    quantityUsed: "",
    notes: "",
  });

  useEffect(() => {
    const savedBatches = JSON.parse(localStorage.getItem("batches") || "[]");
    const savedTx = JSON.parse(localStorage.getItem("transactions") || "[]");
    setBatches(savedBatches);
    setTransactions(savedTx);
  }, []);

  const handleUseItem = (e: React.FormEvent) => {
    e.preventDefault();

    const { consultationId, batchId, quantityUsed } = usage;
    if (!consultationId || !batchId || !quantityUsed) return alert("Please fill all fields");

    const qty = parseInt(quantityUsed);
    if (qty <= 0) return alert("Quantity must be greater than zero.");

    // Update stock in localStorage
    let allBatches = JSON.parse(localStorage.getItem("batches") || "[]");
    const index = allBatches.findIndex((b: Batch) => b.batchId === parseInt(batchId));
    if (index === -1) return alert("Batch not found.");

    if (allBatches[index].quantityInStock < qty) {
      return alert("Not enough stock available!");
    }

    allBatches[index].quantityInStock -= qty;
    localStorage.setItem("batches", JSON.stringify(allBatches));
    setBatches(allBatches);

    // Create usage transaction
    const txList = JSON.parse(localStorage.getItem("transactions") || "[]");
    const newTx: Transaction = {
      transactionId: txList.length ? txList[txList.length - 1].transactionId + 1 : 1,
      batchId: parseInt(batchId),
      quantityChange: -qty,
      transactionType: "Usage",
      transactionDate: new Date().toISOString(),
      referenceId: parseInt(consultationId),
    };
    localStorage.setItem("transactions", JSON.stringify([...txList, newTx]));
    setTransactions([...txList, newTx]);

    alert("Usage recorded successfully!");
    setUsage({ consultationId: "", batchId: "", quantityUsed: "", notes: "" });
  };

  return (
    <div className="container mt-4">
      <h3>Inventory Usage (Deduction)</h3>

      <Card className="mb-4">
        <Card.Body>
          <h5>Record Item Usage</h5>
          <Form onSubmit={handleUseItem} className="row g-3">
            <div className="col-md-3">
              <Form.Control
                placeholder="Consultation ID"
                value={usage.consultationId}
                onChange={(e) => setUsage({ ...usage, consultationId: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <Form.Select
                value={usage.batchId}
                onChange={(e) => setUsage({ ...usage, batchId: e.target.value })}
                required
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchNumber} — {b.quantityInStock} left
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Form.Control
                type="number"
                placeholder="Quantity Used"
                value={usage.quantityUsed}
                onChange={(e) => setUsage({ ...usage, quantityUsed: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <Button type="submit" variant="warning" className="w-100">
                Deduct from Stock
              </Button>
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
          {batches.map((b) => (
            <tr key={b.batchId}>
              <td>{b.batchId}</td>
              <td>{b.batchNumber}</td>
              <td>{b.quantityInStock}</td>
              <td>{b.expirationDate}</td>
            </tr>
          ))}
          {batches.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                No batches available.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
