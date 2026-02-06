import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function TextInput({ className = "", ...rest }: TextInputProps) {
  return <input className={className} {...rest} />;
}
