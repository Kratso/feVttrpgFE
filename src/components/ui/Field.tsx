import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
};

export default function Field({ label, children }: FieldProps) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}
