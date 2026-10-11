import type { HTMLAttributes } from "react";
export type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "aside" | "div";
};
export function Panel({
  as: Element = "section",
  className = "",
  ...props
}: PanelProps) {
  return <Element {...props} className={`panel ${className}`.trim()} />;
}
