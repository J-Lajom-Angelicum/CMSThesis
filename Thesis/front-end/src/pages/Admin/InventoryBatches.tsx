import React, { useState, useEffect } from "react";
import { Button, Table, Form, Card } from "react-bootstrap";

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
}

export default function InventoryBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [itemId] = useState(1); // Example selected item
  const [newBatch, setNewBatch] = useState({
    batchNumber: "",
    quantityInStock: "",
    expirationDate: "",
  });

  // Load from localStorage
  useEffect(() => {
    const savedBatches = JSON.parse(localStorage.getItem("batches") || "[]");
    setBatches(savedBatches.filter((b: Batch) => b.itemId === itemId));
  }, [itemId]);

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();

    const batchList = JSON.parse(localStorage.getItem("batches") || "[]");
    const newId = batchList.length ? batchList[batchList.length - 1].batchId + 1 : 1;

    const batch: Batch = {
      batchId: newId,
      itemId,
      batchNumber: newBatch.batchNumber || `Batch-${newId}`,
      quantityInStock: parseInt(newBatch.quantityInStock),
      expirationDate: newBatch.expirationDate,
      dateReceived: new Date().toISOString().split("T")[0],
    };

    const updated = [...batchList, batch];
    localStorage.setItem("batches", JSON.stringify(updated));
    setBatches(updated.filter((b: Batch) => b.itemId === itemId));

    // Create transaction automatically
    const txList = JSON.parse(localStorage.getItem("transactions") || "[]");
    const newTx: Transaction = {
      transactionId: txList.length ? txList[txList.length - 1].transactionId + 1 : 1,
      batchId: newId,
      quantityChange: parseInt(newBatch.quantityInStock),
      transactionType: "Restock",
      transactionDate: new Date().toISOString(),
    };
    localStorage.setItem("transactions", JSON.stringify([...txList, newTx]));

    // Reset form
    setNewBatch({ batchNumber: "", quantityInStock: "", expirationDate: "" });
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Inventory Batches (Item ID #{itemId})</h3>

      <Card className="mb-4">
        <Card.Body>
          <h5>Add New Batch</h5>
          <Form onSubmit={handleAddBatch} className="row g-2">
            <div className="col-md-3">
              <Form.Control
                placeholder="Batch Number"
                value={newBatch.batchNumber}
                onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <Form.Control
                type="number"
                placeholder="Quantity"
                value={newBatch.quantityInStock}
                onChange={(e) => setNewBatch({ ...newBatch, quantityInStock: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <Form.Control
                type="date"
                value={newBatch.expirationDate}
                onChange={(e) => setNewBatch({ ...newBatch, expirationDate: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <Button type="submit" variant="success" className="w-100">
                + Add Batch
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Batch Number</th>
            <th>Quantity</th>
            <th>Expiration</th>
            <th>Date Received</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.batchId}>
              <td>{b.batchId}</td>
              <td>{b.batchNumber}</td>
              <td>{b.quantityInStock}</td>
              <td>{b.expirationDate}</td>
              <td>{b.dateReceived}</td>
            </tr>
          ))}
          {batches.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No batches found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
