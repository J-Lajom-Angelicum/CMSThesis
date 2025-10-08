import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";

interface Transaction {
  transactionId: number;
  batchId: number;
  quantityChange: number;
  transactionType: string;
  transactionDate: string;
}

export default function InventoryTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const tx = JSON.parse(localStorage.getItem("transactions") || "[]");
    setTransactions(tx);
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Inventory Transactions</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Batch ID</th>
            <th>Type</th>
            <th>Quantity Change</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.transactionId}>
              <td>{t.transactionId}</td>
              <td>{t.batchId}</td>
              <td>{t.transactionType}</td>
              <td>{t.quantityChange}</td>
              <td>{new Date(t.transactionDate).toLocaleString()}</td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No transactions recorded.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
