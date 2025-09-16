import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/MainLayout";
import AppRouter from "./routes/AppRouter.tsx";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <AppRouter />
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}
