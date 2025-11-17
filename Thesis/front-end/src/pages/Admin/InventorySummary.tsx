import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface Item {
  itemId: number;
  itemName: string;
  reorderLevel: number;
}

interface Batch {
  batchId: number;
  itemId: number;
  quantityInStock: number;
  batchNumber?: string;
  expirationDate?: string;
}

interface ConsultationInventory {
  consultationInventoryId: number;
  consultationId: number;
  batchId: number;
  quantityUsed: number;
}

interface Consultation {
  consultationId: number;
  consultationDate: string;
}

interface UsageSummary {
  itemName: string;
  totalUsed: number;
  lastUsed: string;
}

export default function InventorySummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [usageSummary, setUsageSummary] = useState<UsageSummary[]>([]);
  const [lowStock, setLowStock] = useState<{ itemName: string; stockLeft: number; reorderLevel: number }[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<Batch[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔹 Fetch all relevant data
        const [itemsRes, batchesRes, consultationsRes, usageRes] = await Promise.all([
          api.get<Item[]>("/InventoryItems"),
          api.get<Batch[]>("/InventoryBatches"),
          api.get<Consultation[]>("/Consultations"),
          api.get<ConsultationInventory[]>("/ConsultationInventories"),
        ]);

        setItems(itemsRes.data);
        setBatches(batchesRes.data);
        setConsultations(consultationsRes.data);

        // --- Low Stock ---
        const stockMap = new Map<number, number>();
        batchesRes.data.forEach((b) => {
          stockMap.set(b.itemId, (stockMap.get(b.itemId) || 0) + b.quantityInStock);
        });

        setLowStock(itemsRes.data.map((i) => ({
          itemName: i.itemName,
          stockLeft: stockMap.get(i.itemId) || 0,
          reorderLevel: i.reorderLevel,
        })));

        // --- Expiring Soon (next 30 days) ---
        const today = new Date();
        const soon = new Date();
        soon.setDate(today.getDate() + 30);

        setExpiringSoon(
          batchesRes.data.filter(b => b.expirationDate && new Date(b.expirationDate) <= soon)
        );

        // --- Usage Summary ---
        const batchMap = new Map<number, number>(batchesRes.data.map(b => [b.batchId, b.itemId]));
        const itemMap = new Map<number, string>(itemsRes.data.map(i => [i.itemId, i.itemName]));
        const consultationMap = new Map<number, string>(consultationsRes.data.map(c => [c.consultationId, c.consultationDate]));

        const usageMap = new Map<string, { totalUsed: number; lastUsed: string }>();
        (usageRes.data as ConsultationInventory[]).forEach(u => {
          const itemId = batchMap.get(u.batchId);
          const itemName = itemId ? itemMap.get(itemId) || `Item #${itemId}` : "Unknown Item";
          const date = consultationMap.get(u.consultationId) || "";

          if (!usageMap.has(itemName)) {
            usageMap.set(itemName, { totalUsed: u.quantityUsed, lastUsed: date });
          } else {
            const prev = usageMap.get(itemName)!;
            usageMap.set(itemName, {
              totalUsed: prev.totalUsed + u.quantityUsed,
              lastUsed: date > prev.lastUsed ? date : prev.lastUsed,
            });
          }
        });

        setUsageSummary(Array.from(usageMap.entries()).map(([itemName, data]) => ({
          itemName,
          ...data
        })));
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-4"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-semibold text-teal">Inventory Summary</h2>
      <Row className="g-4">

        {/* Expiring Soon */}
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center bg-teal text-white">
              <strong>🧪 Expiring Soon</strong>
              <Button variant="light" size="sm" onClick={() => navigate("/inventory-batches")}>View Batches</Button>
            </Card.Header>
            <Card.Body>
              {expiringSoon.length === 0 ? (
                <Alert variant="info" className="mb-0">No items nearing expiry.</Alert>
              ) : (
                <Table bordered hover responsive size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Batch No</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringSoon.map((b, idx) => (
                      <tr key={idx}>
                        <td>{items.find(i => i.itemId === b.itemId)?.itemName || "Unknown"}</td>
                        <td>{b.batchNumber || b.batchId}</td>
                        <td>{b.expirationDate ? new Date(b.expirationDate).toLocaleDateString() : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Low Stock */}
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center bg-teal text-white">
              <strong>📉 Low Stock Items</strong>
              <Button variant="light" size="sm" onClick={() => navigate("/inventory-items")}>View Items</Button>
            </Card.Header>
            <Card.Body>
              {lowStock.length === 0 ? (
                <Alert variant="info" className="mb-0">All items are sufficiently stocked.</Alert>
              ) : (
                <Table bordered hover responsive size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Stock Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.itemName}</td>
                        <td style={{ color: item.stockLeft <= item.reorderLevel ? "red" : "inherit", fontWeight: item.stockLeft <= item.reorderLevel ? "bold" : "normal" }}>
                          {item.stockLeft}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Usage Summary */}
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center bg-teal text-white">
              <strong>📦 Usage Summary</strong>
              <Button variant="light" size="sm" onClick={() => navigate("/inventory-usage")}>View Usage</Button>
            </Card.Header>
            <Card.Body>
              {usageSummary.length === 0 ? (
                <Alert variant="info" className="mb-0">No recent usage data available.</Alert>
              ) : (
                <Table bordered hover responsive size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>Item Name</th>
                      <th>Total Used</th>
                      <th>Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageSummary.map((u, idx) => (
                      <tr key={idx}>
                        <td>{u.itemName}</td>
                        <td>{u.totalUsed}</td>
                        <td>{u.lastUsed ? new Date(u.lastUsed).toLocaleDateString() : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </div>
  );
}

