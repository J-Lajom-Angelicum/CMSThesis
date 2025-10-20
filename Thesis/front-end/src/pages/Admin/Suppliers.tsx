import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table, Alert } from "react-bootstrap";
import api from "../../api/axios"; // your Axios instance

// Match backend JSON casing
interface Supplier {
  supplierId: number;
  supplierName: string;
  contactNo?: string;
  email?: string;
  address?: string;
}

type SupplierForm = Omit<Supplier, "supplierId">;

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierForm>({
    supplierName: "",
    contactNo: "",
    email: "",
    address: "",
  });
  const [error, setError] = useState("");

  // Fetch suppliers from backend
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
    fetchSuppliers();
  }, []);

  const handleShowModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setForm({
        supplierName: supplier.supplierName,
        contactNo: supplier.contactNo || "",
        email: supplier.email || "",
        address: supplier.address || "",
      });
    } else {
      setEditingSupplier(null);
      setForm({ supplierName: "", contactNo: "", email: "", address: "" });
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.supplierName.trim()) {
      setError("Supplier Name is required.");
      return;
    }

    try {
      let savedSupplier: Supplier;

      if (editingSupplier) {
        // Update supplier
        await api.put(`/Suppliers/${editingSupplier.supplierId}`, form);
        savedSupplier = { supplierId: editingSupplier.supplierId, ...form };
        setSuppliers(prev =>
          prev.map(s => (s.supplierId === editingSupplier.supplierId ? savedSupplier : s))
        );
      } else {
        // Add new supplier
        const res = await api.post<Supplier>("/Suppliers", form);
        savedSupplier = res.data; // backend returns Supplier with ID
        setSuppliers(prev => [...prev, savedSupplier]);
      }

      setShowModal(false);
      setEditingSupplier(null);
      setForm({ supplierName: "", contactNo: "", email: "", address: "" });
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save supplier.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    try {
      await api.delete(`/Suppliers/${id}`);
      setSuppliers(prev => prev.filter(s => s.supplierId !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete supplier.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Supplier Management</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button className="mb-3" onClick={() => handleShowModal()}>+ Add Supplier</Button>

      <Table bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Supplier Name</th>
            <th>Contact No</th>
            <th>Email</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length > 0 ? (
            suppliers.map(s => (
              <tr key={s.supplierId}>
                <td>{s.supplierId}</td>
                <td>{s.supplierName}</td>
                <td>{s.contactNo || "—"}</td>
                <td>{s.email || "—"}</td>
                <td>{s.address || "—"}</td>
                <td>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => handleShowModal(s)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s.supplierId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">No suppliers found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Name</Form.Label>
              <Form.Control
                type="text"
                name="supplierName"
                value={form.supplierName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact No</Form.Label>
              <Form.Control
                type="text"
                name="contactNo"
                value={form.contactNo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">Cancel</Button>
              <Button variant="primary" type="button" onClick={handleSave}>
                {editingSupplier ? "Update" : "Add"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
