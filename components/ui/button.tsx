import type { ButtonHTMLAttributes } from "react";
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "icon" | "link";
  compact?: boolean;
};
export function Button({
  variant = "primary",
  compact = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = {
    primary: "primary",
    secondary: "secondary",
    icon: "icon-button",
    link: "text-link",
  };
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-control disabled:cursor-not-allowed disabled:opacity-50 ${classes[variant]} ${compact ? "compact" : ""} ${className}`.trim()}
    />
  );
}
