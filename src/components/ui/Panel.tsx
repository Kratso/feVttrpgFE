import type { HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Panel({ children, className = "", ...rest }: PanelProps) {
  return (
    <div className={`panel ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
