import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";

interface Supplier {
  SupplierId: number;
  SupplierName: string;
  ContactNo: string;
  Email: string;
  Address: string;
}

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Omit<Supplier, "SupplierId">>({
    SupplierName: "",
    ContactNo: "",
    Email: "",
    Address: "",
  });

  // Load suppliers from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("suppliers");
    if (stored) setSuppliers(JSON.parse(stored));
  }, []);

  // Save suppliers to localStorage
  const saveToLocalStorage = (data: Supplier[]) => {
    localStorage.setItem("suppliers", JSON.stringify(data));
    setSuppliers(data);
  };

  const handleShowModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setForm({
        SupplierName: supplier.SupplierName,
        ContactNo: supplier.ContactNo,
        Email: supplier.Email,
        Address: supplier.Address,
      });
    } else {
      setEditingSupplier(null);
      setForm({ SupplierName: "", ContactNo: "", Email: "", Address: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSupplier) {
      // Update existing supplier
      const updated = suppliers.map((s) =>
        s.SupplierId === editingSupplier.SupplierId ? { ...editingSupplier, ...form } : s
      );
      saveToLocalStorage(updated);
    } else {
      // Add new supplier
      const newSupplier: Supplier = {
        SupplierId: suppliers.length > 0 ? suppliers[suppliers.length - 1].SupplierId + 1 : 1,
        ...form,
      };
      saveToLocalStorage([...suppliers, newSupplier]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      const updated = suppliers.filter((s) => s.SupplierId !== id);
      saveToLocalStorage(updated);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Supplier Management</h2>
      <Button className="mb-3" onClick={() => handleShowModal()}>
        + Add Supplier
      </Button>

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
            suppliers.map((supplier) => (
              <tr key={supplier.SupplierId}>
                <td>{supplier.SupplierId}</td>
                <td>{supplier.SupplierName}</td>
                <td>{supplier.ContactNo}</td>
                <td>{supplier.Email}</td>
                <td>{supplier.Address}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowModal(supplier)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(supplier.SupplierId)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No suppliers found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Supplier Name</Form.Label>
              <Form.Control
                type="text"
                name="SupplierName"
                value={form.SupplierName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact No</Form.Label>
              <Form.Control
                type="text"
                name="ContactNo"
                value={form.ContactNo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="Address"
                value={form.Address}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingSupplier ? "Update" : "Add"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Suppliers;
