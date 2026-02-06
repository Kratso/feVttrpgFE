import { Navigate, Route, Routes, Link } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Campaigns from "./pages/Campaigns";
import CampaignDashboard from "./pages/CampaignDashboard";
import CharacterAdmin from "./pages/CharacterAdmin";
import CharacterViewer from "./pages/CharacterViewer";
import MapViewer from "./pages/MapViewer";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchMe, logout } from "./store/slices/authSlice";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppSelector((state) => state.auth);
  if (loading) {
    return <div className="panel">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
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
            <button className="ghost" onClick={() => dispatch(logout())}>
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
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

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
