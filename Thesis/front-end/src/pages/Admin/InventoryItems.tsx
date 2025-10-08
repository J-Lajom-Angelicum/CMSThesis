import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";

type InventoryItem = {
  itemId: number;
  itemName: string;
  itemCategory: string;
  itemDescription: string;
  unit: string;
  reorderLevel: number;
  supplierName: string;
  quantityInStock: number;
  dateAdded: string;
};

export default function InventoryItems() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    itemName: "",
    itemCategory: "",
    itemDescription: "",
    unit: "",
    reorderLevel: "",
    supplierName: "",
    quantityInStock: "",
  });

  // 🧠 Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("inventoryItems");
    if (saved) setItems(JSON.parse(saved));
    else {
      // Initial mock data
      const mockData: InventoryItem[] = [
        {
          itemId: 1,
          itemName: "Amoxicillin 500mg Capsule",
          itemCategory: "Medicine",
          itemDescription: "Antibiotic capsule for bacterial infections",
          unit: "box",
          reorderLevel: 10,
          supplierName: "MedLife Pharma",
          quantityInStock: 15,
          dateAdded: new Date().toISOString(),
        },
      ];
      setItems(mockData);
      localStorage.setItem("inventoryItems", JSON.stringify(mockData));
    }
  }, []);

  // 🧩 Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem("inventoryItems", JSON.stringify(items));
  }, [items]);

  // Form handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (editingId) {
      setItems(prev =>
        prev.map(i =>
          i.itemId === editingId
            ? {
                ...i,
                ...formData,
                reorderLevel: Number(formData.reorderLevel),
                quantityInStock: Number(formData.quantityInStock),
              }
            : i
        )
      );
    } else {
      const newId =
        items.length > 0 ? Math.max(...items.map(i => i.itemId)) + 1 : 1;
      const newItem: InventoryItem = {
        itemId: newId,
        itemName: formData.itemName,
        itemCategory: formData.itemCategory,
        itemDescription: formData.itemDescription,
        unit: formData.unit,
        reorderLevel: Number(formData.reorderLevel),
        supplierName: formData.supplierName,
        quantityInStock: Number(formData.quantityInStock),
        dateAdded: new Date().toISOString(),
      };
      setItems(prev => [...prev, newItem]);
    }

    // Reset
    setShowModal(false);
    setEditingId(null);
    setFormData({
      itemName: "",
      itemCategory: "",
      itemDescription: "",
      unit: "",
      reorderLevel: "",
      supplierName: "",
      quantityInStock: "",
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.itemId);
    setFormData({
      itemName: item.itemName,
      itemCategory: item.itemCategory,
      itemDescription: item.itemDescription,
      unit: item.unit,
      reorderLevel: String(item.reorderLevel),
      supplierName: item.supplierName,
      quantityInStock: String(item.quantityInStock),
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setItems(prev => prev.filter(i => i.itemId !== id));
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-teal mb-3">Inventory Items</h2>

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        + Add Item
      </Button>

      {items.length === 0 ? (
        <Alert variant="info">No items found in inventory.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Unit</th>
              <th>Stock</th>
              <th>Reorder Level</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.itemId}>
                <td>{i.itemId}</td>
                <td>{i.itemName}</td>
                <td>{i.itemCategory}</td>
                <td>{i.supplierName}</td>
                <td>{i.unit}</td>
                <td
                  className={
                    i.quantityInStock < i.reorderLevel ? "text-danger fw-bold" : ""
                  }
                >
                  {i.quantityInStock}
                </td>
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
                  <Button size="sm" variant="danger" onClick={() => handleDelete(i.itemId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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

            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Control
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity In Stock</Form.Label>
              <Form.Control
                type="number"
                name="quantityInStock"
                value={formData.quantityInStock}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
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
