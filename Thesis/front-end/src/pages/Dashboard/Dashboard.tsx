import { useAuth } from "../../context/AuthContext";
import { Tabs, Tab, Card } from "react-bootstrap";

export default function Dashboard() {
  const { role } = useAuth();

  if (!role) return <h3>Please select a role.</h3>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>{role} Dashboard</Card.Title>
        <Tabs defaultActiveKey="overview" className="mt-3">
          <Tab eventKey="overview" title="Overview">
            <p>General overview for {role}.</p>
          </Tab>
          {role === "ADMIN" && (
            <Tab eventKey="admin" title="Admin Tools">
              <p>Admin-specific tools.</p>
            </Tab>
          )}
          {role === "DOCTOR" && (
            <Tab eventKey="doctor" title="Doctor Tools">
              <p>Doctor-specific tools.</p>
            </Tab>
          )}
          {role === "STAFF" && (
            <Tab eventKey="staff" title="Staff Tools">
              <p>Staff-specific tools.</p>
            </Tab>
          )}
        </Tabs>
      </Card.Body>
    </Card>
  );
}
