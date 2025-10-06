import { useEffect, useState } from "react";
import { Table, Button, Card, Row, Col, Alert } from "react-bootstrap";

type ExpiringItem = {
  itemName: string;
  batchNo: string;
  expiryDate: string;
};

type LowStockItem = {
  itemName: string;
  stockLeft: number;
};

type UsageSummary = {
  itemName: string;
  totalUsed: number;
  lastUsed: string;
};

export default function InventorySummary() {
  const [expiringSoon, setExpiringSoon] = useState<ExpiringItem[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [usageSummary, setUsageSummary] = useState<UsageSummary[]>([]);

  useEffect(() => {
    // Mock data (replace with your API calls later)
    setExpiringSoon([
      { itemName: "Amoxicillin 500mg", batchNo: "B-102", expiryDate: "2025-11-12" },
      { itemName: "Vitamin C 1000mg", batchNo: "B-087", expiryDate: "2025-12-01" },
    ]);

    setLowStock([
      { itemName: "Alcohol 70%", stockLeft: 8 },
      { itemName: "Cotton Balls", stockLeft: 12 },
    ]);

    setUsageSummary([
      { itemName: "Syringe 5ml", totalUsed: 230, lastUsed: "2025-10-04" },
      { itemName: "Bandage Roll", totalUsed: 145, lastUsed: "2025-10-03" },
    ]);
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-semibold text-teal">Inventory Summary</h2>

      <Row className="g-4">
        {/* Expiring Soon */}
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="d-flex justify-content-between align-items-center bg-teal text-white">
              <strong>🧪 Expiring Soon</strong>
              <Button variant="light" size="sm">View Batches</Button>
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
                    {expiringSoon.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.batchNo}</td>
                        <td>{item.expiryDate}</td>
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
              <Button variant="light" size="sm">View Items</Button>
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
                    {lowStock.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.stockLeft}</td>
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
              <Button variant="light" size="sm">View Usage</Button>
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
                    {usageSummary.map((item, index) => (
                      <tr key={index}>
                        <td>{item.itemName}</td>
                        <td>{item.totalUsed}</td>
                        <td>{item.lastUsed}</td>
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
