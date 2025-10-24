import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import api from "../../api/axios";

interface Supplier {
  supplierId: number;
  supplierName: string;
}

type InventoryItem = {
  itemId: number;
  itemName: string;
  itemCategory: string;
  itemDescription: string;
  unit: string;
  reorderLevel: number;
  supplierId?: number | null;
  supplierName?: string;
  dateAdded: string;
};

export default function InventoryItems() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    itemName: "",
    itemCategory: "",
    itemDescription: "",
    unit: "",
    reorderLevel: "",
    supplierId: "",
  });

  // 🧠 Fetch inventory items
  const fetchItems = async () => {
    try {
      const res = await api.get<InventoryItem[]>("/InventoryItems");
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory items.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Fetch suppliers for dropdown
  const fetchSuppliers = async () => {
    try {
      const res = await api.get<Supplier[]>("/Suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers.");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  // 🧩 Form change handler
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Save item (POST or PUT)
  const handleSave = async () => {
    const payload = {
      itemName: formData.itemName,
      itemCategory: formData.itemCategory,
      itemDescription: formData.itemDescription,
      unit: formData.unit,
      reorderLevel: Number(formData.reorderLevel),
      supplierId:
        formData.supplierId === "N/A" || formData.supplierId === ""
          ? null
          : Number(formData.supplierId),
    };

    try {
      if (editingId) {
        await api.put(`/InventoryItems/${editingId}`, payload);
      } else {
        await api.post("/InventoryItems", payload);
      }
      await fetchItems();
      handleClose();
    } catch (err: any) {
      console.error(err);
      setError("Failed to save item.");
    }
  };

  // ✏️ Edit handler
  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.itemId);
    setFormData({
      itemName: item.itemName,
      itemCategory: item.itemCategory,
      itemDescription: item.itemDescription,
      unit: item.unit,
      reorderLevel: String(item.reorderLevel),
      supplierId: item.supplierId ? String(item.supplierId) : "N/A",
    });
    setShowModal(true);
  };

  // ❌ Delete handler
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/InventoryItems/${id}`);
      setItems((prev) => prev.filter((i) => i.itemId !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete item.");
    }
  };

  // 🧹 Close modal + reset
  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      itemName: "",
      itemCategory: "",
      itemDescription: "",
      unit: "",
      reorderLevel: "",
      supplierId: "",
    });
    setError("");
  };

  return (
    <div className="container mt-4">
      <h2 className="text-teal mb-3">Inventory Items</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        + Add Item
      </Button>

      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : items.length === 0 ? (
        <Alert variant="info">No items found in inventory.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Unit</th>
              <th>Reorder Level</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.itemId}>
                <td>{i.itemId}</td>
                <td>{i.itemName}</td>
                <td>{i.itemCategory}</td>
                <td>{i.supplierName || "—"}</td>
                <td>{i.unit}</td>
                <td>{i.reorderLevel}</td>
                <td>{new Date(i.dateAdded).toLocaleDateString()}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEdit(i)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(i.itemId)}
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
          <Modal.Title>{editingId ? "Edit Item" : "Add Item"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="itemCategory"
                value={formData.itemCategory}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Control
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reorder Level</Form.Label>
              <Form.Control
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
              />
            </Form.Group>

            {/* 🧭 Supplier Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
              >
                <option value="">— Select Supplier —</option>
                <option value="N/A">N/A</option>
                {suppliers.map((s) => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.supplierName}
                  </option>
                ))}
              </Form.Select>
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
