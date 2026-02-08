import { Navigate, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Campaigns from "./pages/Campaigns";
import CampaignDashboard from "./pages/CampaignDashboard";
import CharacterAdmin from "./pages/CharacterAdmin";
import CharacterViewer from "./pages/CharacterViewer";
import MapViewer from "./features/maps/MapViewer";
import MapCreator from "./pages/MapCreator";
import MapEditor from "./pages/MapEditor";
import Tilesets from "./pages/Tilesets";
import TilesetViewer from "./pages/TilesetViewer";
import PresetBuilder from "./pages/PresetBuilder";
import ClassViewer from "./pages/ClassViewer";
import ItemViewer from "./pages/ItemViewer";
import LogAudit from "./pages/LogAudit";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchMe, logout, sessionExpired } from "./store/slices/authSlice";
import Button from "./components/ui/Button";
import Breadcrumbs from "./components/ui/Breadcrumbs";
import { setUnauthorizedHandler } from "./api/client";

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
  const navigate = useNavigate();
  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(sessionExpired());
      navigate("/login", { replace: true });
    });
    dispatch(fetchMe());
    return () => setUnauthorizedHandler(null);
  }, [dispatch, navigate]);

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
              <Navigate to="../maps/view" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/logs"
          element={
            <RequireAuth>
              <LogAudit />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/maps/view"
          element={
            <RequireAuth>
              <MapViewer />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/maps/create"
          element={
            <RequireAuth>
              <MapCreator />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/maps/edit/:mapId"
          element={
            <RequireAuth>
              <MapEditor />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/maps/edit"
          element={
            <RequireAuth>
              <MapEditor />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/tilesets"
          element={
            <RequireAuth>
              <Tilesets />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/tilesets/view"
          element={
            <RequireAuth>
              <TilesetViewer />
            </RequireAuth>
          }
        />
        <Route
          path="/campaigns/:campaignId/presets"
          element={
            <RequireAuth>
              <PresetBuilder />
            </RequireAuth>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
