import { Container, Row, Col, Card } from "react-bootstrap";

export default function AdminDashboard() {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>User Management</Card.Title>
              <Card.Text>
                Create, update, or remove user accounts and assign roles.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>System Settings</Card.Title>
              <Card.Text>
                Configure clinic system preferences and access controls.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Reports & Analytics</Card.Title>
              <Card.Text>
                Generate and review system-wide usage and performance reports.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
