import type { ReactNode } from "react";
import Button from "./Button";

type FloatingPanelProps = {
  side: "left" | "right";
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  size?: "default" | "wide";
};

export default function FloatingPanel({
  side,
  title,
  isOpen,
  onToggle,
  children,
  size = "default",
}: FloatingPanelProps) {
  return (
    <>
      <Button type="button" className={`floating-toggle ${side}`} onClick={onToggle}>
        {title}
      </Button>
      {isOpen && (
        <aside className={`floating-shell ${side} ${size === "wide" ? "wide" : ""}`.trim()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <Button type="button" variant="ghost" onClick={onToggle}>
              Close
            </Button>
          </div>
          <div style={{ overflow: "auto" }}>{children}</div>
        </aside>
      )}
    </>
  );
}
