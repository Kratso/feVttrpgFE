import { Navigate, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Campaigns from "./pages/Campaigns";
import CampaignDashboard from "./pages/CampaignDashboard";
import CharacterAdmin from "./pages/CharacterAdmin";
import CharacterViewer from "./pages/CharacterViewer";
import MapViewer from "./pages/MapViewer";
import { useAuth } from "./context/AuthContext";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="panel">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/campaigns" className="brand">
          FeVTTRPG
        </Link>
        <div className="spacer" />
        {user && (
          <div className="user-info">
            <span>{user.displayName}</span>
            <button className="ghost" onClick={() => logout()}>
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/campaigns" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/campaigns"
          element={
            <RequireAuth>
              <Campaigns />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId"
          element={
            <RequireAuth>
              <CampaignDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/characters/admin"
          element={
            <RequireAuth>
              <CharacterAdmin />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/characters/view"
          element={
            <RequireAuth>
              <CharacterViewer />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/maps"
          element={
            <RequireAuth>
              <MapViewer />
            </RequireAuth>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
