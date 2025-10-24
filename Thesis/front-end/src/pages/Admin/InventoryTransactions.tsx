import React, { useState, useEffect } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import api from "../../api/axios";

interface Transaction {
  transactionId: number;
  batchId: number;
  itemName: string; // mapped from backend
  quantityChange: number;
  transactionType: string;
  transactionDate: string;
}

export default function InventoryTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get<Transaction[]>("/InventoryTransactions");
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-teal">Inventory Transactions</h3>

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
                  <td>{t.itemName}</td>
                  <td>{t.batchId}</td>
                  <td>{t.transactionType}</td>
                  <td
                    className={
                      t.quantityChange > 0 ? "text-success" : "text-danger"
                    }
                  >
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
