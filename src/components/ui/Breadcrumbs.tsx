import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

const labels: Record<string, string> = {
  campaigns: "Campaigns",
  characters: "Characters",
  admin: "Admin",
  view: "Viewer",
  maps: "Maps",
  create: "Create",
  edit: "Editor",
  items: "Items",
  classes: "Classes",
  tilesets: "Tilesets",
  presets: "Presets",
  login: "Login",
  register: "Register",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const campaigns = useAppSelector((state) => state.campaigns.campaigns);
  const maps = useAppSelector((state) => state.maps.maps);
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  const crumbs = parts.map((part, index) => {
    const prev = parts[index - 1];
    const next = parts[index + 1];
    const path = `/${parts.slice(0, index + 1).join("/")}`;
    let label = labels[part] ?? part;
    let targetPath = path;

    if (prev === "campaigns") {
      label = campaigns.find((campaign) => campaign.id === part)?.name ?? part;
    }

    if (part === "characters" && parts[0] === "campaigns" && parts[1]) {
      targetPath = `/campaigns/${parts[1]}/characters/view`;
    }

    if (part === "maps" && parts[0] === "campaigns" && parts[1]) {
      const campaignId = parts[1];
      if (next === "create") {
        targetPath = `/campaigns/${campaignId}/maps/create`;
      } else if (next === "edit") {
        targetPath = `/campaigns/${campaignId}/maps/edit`;
      } else {
        targetPath = `/campaigns/${campaignId}/maps/view`;
      }
    }

    if (prev === "edit" && parts[index - 2] === "maps" && parts[0] === "campaigns") {
      const mapName = maps.find((map) => map.id === part)?.name;
      label = mapName ?? "Map";
    }

    if (part === "tilesets" && parts[0] === "campaigns" && parts[1]) {
      const campaignId = parts[1];
      targetPath = next === "view" ? `/campaigns/${campaignId}/tilesets/view` : `/campaigns/${campaignId}/tilesets`;
    }

    return { path: targetPath, label };
  });

  return (
    <nav className="breadcrumbs">
      {crumbs.map((crumb, index) => (
        <span key={crumb.path}>
          {index > 0 && <span className="muted"> / </span>}
          <Link to={crumb.path} className="crumb">
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
