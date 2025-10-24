import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import api from "../../api/axios";

interface InventoryBatch {
  batchId: number;
  itemId: number;
  itemName: string; // mapped from backend
  batchNumber?: string;
  quantityInStock: number;
  expirationDate: string;
  dateReceived: string;
}

interface InventoryItem {
  itemId: number;
  itemName: string;
}

export default function InventoryBatches() {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    itemId: "",
    batchNumber: "",
    quantityInStock: "",
    expirationDate: "",
  });

  // 🧠 Fetch batches
  const fetchBatches = async () => {
      try {
        const [batchRes, itemRes] = await Promise.all([
          api.get<InventoryBatch[]>("/InventoryBatches"),
          api.get<InventoryItem[]>("/InventoryItems"),
        ]);

       const itemsMap = new Map(itemRes.data.map((i) => [i.itemId, i.itemName]));

        const mappedBatches = batchRes.data.map((b) => ({
          ...b,
          itemName: itemsMap.get(b.itemId) || "Unknown Item",
        }));

        setBatches(mappedBatches);
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory batches.");
     } finally {
       setLoading(false);
     }
  };

  // 🧠 Fetch items for dropdown
  const fetchItems = async () => {
    try {
      const res = await api.get<InventoryItem[]>("/InventoryItems");
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load items for dropdown.");
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchItems();
  }, []);

  // 🧩 Handle form change (fixed TypeScript type)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Save batch
  const handleSave = async () => {
    const payload = {
      itemId: Number(formData.itemId),
      batchNumber: formData.batchNumber,
      quantityInStock: Number(formData.quantityInStock),
      expirationDate: formData.expirationDate,
    };

    try {
      if (editingId) {
        await api.put(`/InventoryBatches/${editingId}`, payload);
      } else {
        await api.post("/InventoryBatches", payload);
      }
      await fetchBatches();
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save batch.");
    }
  };

  // ✏️ Edit batch
  const handleEdit = (b: InventoryBatch) => {
    setEditingId(b.batchId);
    setFormData({
      itemId: String(b.itemId),
      batchNumber: b.batchNumber || "",
      quantityInStock: String(b.quantityInStock),
      expirationDate: b.expirationDate.split("T")[0],
    });
    setShowModal(true);
  };

  // ❌ Delete batch
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    try {
      await api.delete(`/InventoryBatches/${id}`);
      setBatches((prev) => prev.filter((b) => b.batchId !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete batch.");
    }
  };

  // 🧹 Close modal + reset
  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      itemId: "",
      batchNumber: "",
      quantityInStock: "",
      expirationDate: "",
    });
    setError("");
  };

  return (
    <div className="container mt-4">
      <h2 className="text-teal mb-3">Inventory Batches</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Header with dropdown */}
      <div className="d-flex align-items-center mb-3">
        <Form.Label className="me-2 mb-0 fw-semibold text-teal">
          Add New Batch of:
        </Form.Label>
        <Form.Select
          name="itemId"
          value={formData.itemId}
          onChange={handleChange}
          style={{ width: "250px", marginRight: "10px" }}
        >
          <option value="">— Select Item —</option>
          {items.map((i) => (
            <option key={i.itemId} value={i.itemId}>
              {i.itemName}
            </option>
          ))}
        </Form.Select>
        <Button
          variant="primary"
          className="ms-auto"
          onClick={() => setShowModal(true)}
          disabled={!formData.itemId}
        >
          + Add Batch
        </Button>
      </div>

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : batches.length === 0 ? (
        <Alert variant="info">No inventory batches found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>Batch ID</th>
              <th>Item</th>
              <th>Batch Number</th>
              <th>Quantity in Stock</th>
              <th>Expiration Date</th>
              <th>Date Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.batchId}>
                <td>{b.batchId}</td>
                <td>{b.itemName}</td>
                <td>{b.batchNumber || "—"}</td>
                <td>{b.quantityInStock}</td>
                <td>{new Date(b.expirationDate).toLocaleDateString()}</td>
                <td>{new Date(b.dateReceived).toLocaleDateString()}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEdit(b)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(b.batchId)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* 🧾 Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Edit Batch" : "Add Batch"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Batch Number (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="Enter supplier batch number"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity In Stock</Form.Label>
              <Form.Control
                type="number"
                name="quantityInStock"
                value={formData.quantityInStock}
                onChange={handleChange}
                placeholder="Enter stock quantity"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiration Date</Form.Label>
              <Form.Control
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
