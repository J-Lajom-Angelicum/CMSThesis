import { useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";

interface LabResult {
  labResultId: number;
  labOrderId: number;
  testName: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  dateReported?: string;
  notes?: string;
}

export default function LabResults() {
  const [labResults, setLabResults] = useState<LabResult[]>([
    {
      labResultId: 1,
      labOrderId: 101,
      testName: "Complete Blood Count (CBC)",
      resultValue: "Normal",
      unit: "",
      referenceRange: "",
      dateReported: "2025-10-05",
      notes: "No abnormalities detected.",
    },
    {
      labResultId: 2,
      labOrderId: 102,
      testName: "Fasting Blood Sugar",
      resultValue: "92",
      unit: "mg/dL",
      referenceRange: "70 - 100 mg/dL",
      dateReported: "2025-10-06",
      notes: "Slightly high but acceptable.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);

  const handleView = (result: LabResult) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this lab result?")) {
      setLabResults(labResults.filter((r) => r.labResultId !== id));
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Lab Results</h2>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Lab Order ID</th>
            <th>Test Name</th>
            <th>Result</th>
            <th>Unit</th>
            <th>Reference Range</th>
            <th>Date Reported</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {labResults.map((result) => (
            <tr key={result.labResultId}>
              <td>{result.labResultId}</td>
              <td>{result.labOrderId}</td>
              <td>{result.testName}</td>
              <td>{result.resultValue}</td>
              <td>{result.unit || "-"}</td>
              <td>{result.referenceRange || "-"}</td>
              <td>{result.dateReported || "-"}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleView(result)}
                >
                  View
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => alert("Edit feature coming soon!")}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(result.labResultId)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* View Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Lab Result Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResult && (
            <div>
              <p><strong>Test Name:</strong> {selectedResult.testName}</p>
              <p><strong>Result:</strong> {selectedResult.resultValue}</p>
              <p><strong>Unit:</strong> {selectedResult.unit || "N/A"}</p>
              <p><strong>Reference Range:</strong> {selectedResult.referenceRange || "N/A"}</p>
              <p><strong>Date Reported:</strong> {selectedResult.dateReported}</p>
              <p><strong>Notes:</strong> {selectedResult.notes || "No notes"}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
