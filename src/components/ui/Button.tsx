import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "ghost" | "default";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export default function Button({ variant = "default", className = "", ...rest }: ButtonProps) {
  const variantClass = variant === "default" ? "" : variant;
  return <button className={`${variantClass} ${className}`.trim()} {...rest} />;
}
