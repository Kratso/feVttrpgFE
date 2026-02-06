import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

const labels: Record<string, string> = {
  campaigns: "Campaigns",
  characters: "Characters",
  admin: "Admin",
  view: "Viewer",
  maps: "Maps",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const campaigns = useAppSelector((state) => state.campaigns.campaigns);
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  const crumbs = parts.map((part, index) => {
    const prev = parts[index - 1];
    const path = `/${parts.slice(0, index + 1).join("/")}`;
    let label = labels[part] ?? part;
    let targetPath = path;

    if (prev === "campaigns") {
      label = campaigns.find((campaign) => campaign.id === part)?.name ?? part;
    }

    if (part === "characters" && parts[0] === "campaigns" && parts[1]) {
      targetPath = `/campaigns/${parts[1]}/characters/view`;
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
