import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type CardLinkProps = {
  to: string;
  children: ReactNode;
};

export default function CardLink({ to, children }: CardLinkProps) {
  return (
    <Link to={to} className="card">
      {children}
    </Link>
  );
}
