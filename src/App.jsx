import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Partenaires from "./pages/Partenaires";
import Rapports from "./pages/Rapports";
import WaitingApproval from "./pages/WaitingApproval";
import keycloak        from "./keycloak";


function ProtectedRoute({ children }) {
  if (!keycloak.authenticated) {
    keycloak.login({ redirectUri: window.location.origin + "/dashboard" });
    return null;
  }

  // Vérifie si l'utilisateur a un rôle valide
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const systemRoles = ["default-roles-partner-management", "offline_access", "uma_authorization"];
  const hasRole = roles.some((r) => !systemRoles.includes(r));

  if (!hasRole) {
    return <Navigate to="/waiting" replace />;
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/waiting" element={<WaitingApproval />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/partenaires" element={<Partenaires />} />
        <Route path="/rapports" element={<Rapports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;