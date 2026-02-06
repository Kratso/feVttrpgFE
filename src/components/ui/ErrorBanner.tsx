import type { HTMLAttributes } from "react";

type ErrorBannerProps = HTMLAttributes<HTMLDivElement> & {
  message?: string | null;
};

export default function ErrorBanner({ message, className = "", ...rest }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className={`error ${className}`.trim()} {...rest}>
      {message}
    </div>
  );
}
