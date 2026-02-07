import { Navigate, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Campaigns from "./pages/Campaigns";
import CampaignDashboard from "./pages/CampaignDashboard";
import CharacterAdmin from "./pages/CharacterAdmin";
import CharacterViewer from "./pages/CharacterViewer";
import MapViewer from "./pages/MapViewer";
import ClassViewer from "./pages/ClassViewer";
import ItemViewer from "./pages/ItemViewer";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchMe, logout } from "./store/slices/authSlice";
import Button from "./components/ui/Button";
import Breadcrumbs from "./components/ui/Breadcrumbs";

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

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppSelector((state) => state.auth);
  if (loading) {
    return <div className="panel">Loading...</div>;
  }
  if (user) {
    return <Navigate to="/campaigns" replace />;
  }
  return <>{children}</>;
}

function CharacterIndexRedirect() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const campaignId = parts[1];
  return <Navigate to={`/campaigns/${campaignId}/characters/view`} replace />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = location.pathname !== "/campaigns";
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/campaigns" className="brand">
          FeVTTRPG
        </Link>
        {user && (
          <div className="nav-links">
            <Link to="/campaigns" className="nav-link">
              Campaigns
            </Link>
            <Link to="/classes" className="nav-link">
              Classes
            </Link>
          </div>
        )}
        <div className="spacer" />
        {user && (
          <div className="user-info">
            {showBack && (
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Back
              </Button>
            )}
            <span>{user.displayName}</span>
            <Button variant="ghost" onClick={() => dispatch(logout())}>
              Logout
            </Button>
          </div>
        )}
      </header>
      <main className="content">
        {user && <Breadcrumbs />}
        {children}
      </main>
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
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <Register />
            </RequireGuest>
          }
        />
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
          path="/campaigns/:campaignId/characters"
          element={
            <RequireAuth>
              <CharacterIndexRedirect />
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
          path="/classes"
          element={
            <RequireAuth>
              <ClassViewer />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/items"
          element={
            <RequireAuth>
              <ItemViewer layout="stacked" />
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
