import { Container, Row, Col, Card } from "react-bootstrap";
import InventoryCard from "../Admin/InventoryCard";

export default function AdminDashboard() {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>User Management</Card.Title>
              <Card.Text>Manage users and roles.</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <InventoryCard /> {/* ✅ Inventory summary */}
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Reports & Analytics</Card.Title>
              <Card.Text>Access detailed system reports.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
