import { Children, cloneElement, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const generated = useId();
  const child = Children.only(children);
  if (!isValidElement(child))
    throw new Error("Field requires one input, textarea, or select.");
  const control = child as ReactElement<{ id?: string }>;
  const id = control.props.id ?? generated;
  return (
    <label className="field flex flex-col gap-2" htmlFor={id}>
      <span>{label}</span>
      {cloneElement(control, { id })}
    </label>
  );
}
