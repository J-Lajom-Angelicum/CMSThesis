import React, { useState, useEffect } from "react";
import { Table, Spinner, Alert, Row, Col, Button } from "react-bootstrap";
import Select from "react-select";
import type { SingleValue } from "react-select";
import api from "../../api/axios";

interface Transaction {
  transactionId: number;
  batchId: number;
  itemId: number;
  quantityChange: number;
  transactionType: string;
  transactionDate: string;
}

interface Item {
  itemId: number;
  itemName: string;
}

interface Batch {
  batchId: number;
  itemId: number;
  batchNumber: string;
  quantityInStock: number;
  expirationDate: string;
}

interface UsageTemplate {
  id: number;
  label: string;
  batchId: number;
  itemId: number;
  quantityUsed: number; // negative for usage
}

export default function InventoryTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [usageTemplates, setUsageTemplates] = useState<UsageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUsage, setSelectedUsage] = useState<SingleValue<UsageTemplate>>(null);

  // 🔹 Fetch data
  const fetchData = async () => {
    try {
      const [transRes, itemsRes, batchesRes] = await Promise.all([
        api.get<Transaction[]>("/InventoryTransactions"),
        api.get<Item[]>("/InventoryItems"),
        api.get<Batch[]>("/InventoryBatches"),
      ]);

      setTransactions(transRes.data);
      setItems(itemsRes.data);
      setBatches(batchesRes.data);

      // 🔹 Create usage templates dynamically (for dropdown)
      const templates: UsageTemplate[] = batchesRes.data.map((b: Batch) => {
        const item = itemsRes.data.find((i) => i.itemId === b.itemId);
        return {
          id: b.batchId,
          label: `${item?.itemName || "Item"} — 1`, // default usage 1 for now
          batchId: b.batchId,
          itemId: b.itemId,
          quantityUsed: -1, // negative to reduce stock
        };
      });

      setUsageTemplates(templates);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Get item name helper
  const getItemName = (itemId: number) => {
    const item = items.find((i) => i.itemId === itemId);
    return item ? item.itemName : `Item #${itemId}`;
  };

  // 🔹 Handle recording a usage
  const handleUsageSelect = async () => {
    if (!selectedUsage) return;

    const usage = selectedUsage;
    const batch = batches.find((b) => b.batchId === usage.batchId);

    if (!batch || batch.quantityInStock < Math.abs(usage.quantityUsed)) {
      alert("Not enough stock for this usage.");
      return;
    }

    try {
      // Record the usage as a negative transaction
      await api.post("/InventoryTransactions", {
        batchId: usage.batchId,
        itemId: usage.itemId,
        quantityChange: usage.quantityUsed,
        transactionType: "Usage",
        transactionDate: new Date().toISOString(),
      });

      // Optionally, update batch stock on backend
      await api.patch(`/InventoryBatches/${usage.batchId}`, {
        quantityInStock: batch.quantityInStock + usage.quantityUsed, // negative reduces stock
      });

      await fetchData();
      setSelectedUsage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to record usage.");
    }
  };

  return (
    <div className="container mt-4">
      <Row className="align-items-center mb-3">
        <Col><h3 className="text-teal">Inventory Transactions</h3></Col>
        <Col md={6}>
          <Row>
            <Col>
              <Select
                value={selectedUsage}
                onChange={setSelectedUsage}
                options={usageTemplates}
                placeholder="Select usage..."
                isSearchable
              />
            </Col>
            <Col>
              <Button
                className="w-100"
                onClick={handleUsageSelect}
                disabled={!selectedUsage}
              >
                Record Usage
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Batch ID</th>
              <th>Type</th>
              <th>Quantity Change</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <tr key={t.transactionId}>
                  <td>{t.transactionId}</td>
                  <td>{getItemName(t.itemId)}</td>
                  <td>{t.batchId}</td>
                  <td>{t.transactionType}</td>
                  <td className={t.quantityChange > 0 ? "text-success" : "text-danger"}>
                    {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}
                  </td>
                  <td>{new Date(t.transactionDate).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No transactions recorded.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
