import { Container, Row, Col, Card } from "react-bootstrap";

export default function StaffDashboard() {
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Staff Dashboard</h2>

      <Row>
        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Appointment Scheduling</Card.Title>
              <Card.Text>
                Book, reschedule, or cancel patient appointments quickly.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Patient Assistance</Card.Title>
              <Card.Text>
                Support doctors by preparing records and guiding patients.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Inventory Support</Card.Title>
              <Card.Text>
                Track supplies, update stock levels, and assist with inventory
                requests.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
