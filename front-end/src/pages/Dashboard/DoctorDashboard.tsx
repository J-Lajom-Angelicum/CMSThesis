import { Container, Row, Col, Card } from "react-bootstrap";

export default function DoctorDashboard() {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Doctor Dashboard</h2>

      <Row>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Appointments</Card.Title>
              <Card.Text>
                View and manage your upcoming appointments with patients.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Patient Records</Card.Title>
              <Card.Text>
                Quickly access medical histories and ongoing treatments.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Prescriptions</Card.Title>
              <Card.Text>
                Manage prescriptions and issue new medication orders.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
