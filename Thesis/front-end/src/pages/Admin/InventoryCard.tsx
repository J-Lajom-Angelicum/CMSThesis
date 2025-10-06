import React, { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function InventoryCard() {
  const navigate = useNavigate();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("items") || "[]");
    const batches = JSON.parse(localStorage.getItem("batches") || "[]");

    // Expiring soon (within 30 days)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    const expiring = batches.filter((b: any) => {
      const exp = new Date(b.ExpiryDate);
      return exp >= today && exp <= nextMonth;
    });

    // Low stock
    const lowStock = items.filter((item: any) => {
      const totalQty = batches
        .filter((b: any) => b.ItemId === item.ItemId)
        .reduce((sum: number, b: any) => sum + b.Quantity, 0);
      return totalQty < item.ReorderLevel;
    });

    setExpiringSoonCount(expiring.length);
    setLowStockCount(lowStock.length);
  }, []);

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Inventory Summary</Card.Title>
        <p className="mb-1">⚠️ Expiring Soon: <strong>{expiringSoonCount}</strong></p>
        <p className="mb-1">📦 Low Stock Items: <strong>{lowStockCount}</strong></p>
        <Button
          variant="primary"
          size="sm"
          className="mt-2"
          onClick={() => navigate("/inventory-dashboard")}
        >
          View Full Report
        </Button>
      </Card.Body>
    </Card>
  );
}
