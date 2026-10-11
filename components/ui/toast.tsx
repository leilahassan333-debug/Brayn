import { CheckCircle2, X } from "lucide-react";
import { Button } from "./button";
export function Toast({
  message,
  dismiss,
}: {
  message: string;
  dismiss: () => void;
}) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} />
      {message}
      <Button
        variant="icon"
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </Button>
    </div>
  );
}
