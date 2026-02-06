import type { HTMLAttributes, ReactNode } from "react";

type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Toolbar({ children, className = "", ...rest }: ToolbarProps) {
  return (
    <div className={`toolbar ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
