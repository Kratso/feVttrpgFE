import type { SelectHTMLAttributes } from "react";

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectInput({ className = "", ...rest }: SelectInputProps) {
  return <select className={className} {...rest} />;
}
