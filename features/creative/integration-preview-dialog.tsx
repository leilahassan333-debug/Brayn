import { Check, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { WorkspaceController } from "@/application/use-workspace-controller";

export function IntegrationPreviewDialog({
  modal,
  close,
}: Pick<WorkspaceController, "modal" | "close">) {
  return (
    <>
      {modal && !["project", "task"].includes(modal) && (
        <Modal
          title={
            {
              plan: "Preview weekly planning",
              strategy: "From brief to brand direction",
              brief: "Preview presentation creation",
              booking: "Preview meeting booking",
              email: "Preview scheduled email",
              personal: "Review personal commitment",
            }[modal] ?? "Integration preview"
          }
          close={close}
        >
          <span className="integration-badge">
            {modal === "personal"
              ? "Sample personal commitment"
              : "Preview · Not connected"}
          </span>
          <p className="preview-description">
            {
              {
                plan: "In Phase 4, Brayn will propose a week around your working hours, task estimates, priorities, deadlines, meetings, personal plans and breaks. You’ll review every suggested change before anything is applied. Overloaded weeks will be flagged with suggestions to postpone work.",
                strategy:
                  "In Phase 3, choose the project notes and files to include. Review missing information, supply it or explicitly approve a labeled assumption. Generated strategy will save privately to this project with editing and version history.",
                brief:
                  "In Phase 3, upload your completed artwork and supporting text. Brayn will assemble your chosen template without redesigning or distorting the work. Preview, edit slide text and order, then download real PowerPoint or PDF files.",
                booking:
                  "In Phase 4, clients can accept or decline slots through email without accessing your dashboard. Availability will be checked again before booking, with timezone support, double-booking prevention and configured Zoom links.",
                email:
                  "In Phase 4, write or approve your email, choose the recipient and schedule delivery. Background jobs will work with the browser closed, with cancellation, delivery status and duplicate-safe retries.",
                personal:
                  "A sample personal commitment on October 16, 2026 at 3:00 PM, America/New_York. Personal commitments will be considered in future weekly planning.",
              }[modal]
            }
          </p>
          <div className="preview-note">
            <AlertCircle size={17} />
            <p>
              {modal === "personal"
                ? "Demo calendar entry only."
                : "This preview does not generate content, change your schedule, book a meeting or send email."}
            </p>
          </div>
          <div className="modal-actions">
            <Button variant="primary" onClick={close}>
              Close preview
              <Check size={16} />
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
