"use client";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { dateKey } from "@/domain/workspace/calendar";
import {
  prepareTaskChange,
  readTaskRequest,
  resolveTaskDate,
  type AssistantReply,
  type TaskRequest,
} from "@/domain/workspace/task-assistant";
import type { WorkspaceController } from "@/application/use-workspace-controller";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function TaskAssistant({
  data,
  page,
  selected,
  applyAssistantTask,
  formError,
  ready,
}: Pick<
  WorkspaceController,
  "data" | "page" | "selected" | "applyAssistantTask" | "formError" | "ready"
>) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<AssistantReply | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const trigger = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dismiss = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const respond = (message: string) => {
    const today = dateKey(new Date());
    let request: TaskRequest | undefined;
    if (reply?.kind === "question") {
      request = { ...reply.request };
      switch (reply.field) {
        case "project": {
          const matches = data.projects.filter(
            (p) =>
              p.id === message ||
              p.name.toLowerCase() === message.toLowerCase() ||
              p.client.toLowerCase() === message.toLowerCase(),
          );
          if (matches.length !== 1) {
            setMessages((current) => [...current, message]);
            return;
          }
          request.projectId = matches[0].id;
          break;
        }
        case "task":
          request.taskId = message;
          break;
        case "date":
          request.date = resolveTaskDate(message, today);
          break;
        case "assignee":
          request.assignee = message;
          break;
        case "title":
          request.title = message;
          break;
      }
    } else request = readTaskRequest(message, today);
    setMessages((current) => [...current.slice(-9), message]);
    setInput("");
    setReply(
      request
        ? prepareTaskChange(
            request,
            data,
            page === "Project" ? selected : undefined,
          )
        : {
            kind: "help",
            message:
              "Try “Add a task to finish the mood board by Friday”, “Rename mood board to Final mood board”, “Assign mood board to Alex”, or “Reschedule mood board to tomorrow”. Use an exact project or task name when needed.",
          },
    );
  };
  return (
    <>
      <button
        ref={trigger}
        className="assistant-launcher"
        aria-expanded={open}
        aria-controls="task-assistant"
        onClick={() => (open ? dismiss() : setOpen(true))}
      >
        <MessageSquare size={18} />
        Task assistant
      </button>
      {open && (
        <aside
          id="task-assistant"
          className="task-assistant"
          aria-label="Task assistant"
        >
          <div className="assistant-heading">
            <div>
              <h2>Task assistant</h2>
              <small>Local task commands · Review before saving</small>
            </div>
            <Button
              variant="icon"
              aria-label="Close task assistant"
              onClick={dismiss}
            >
              <X size={20} />
            </Button>
          </div>
          <div className="assistant-content">
            <p className="section-description">
              Create, edit, assign or reschedule a task. Use a task name and
              project name. Every change requires your confirmation.
            </p>
            <div className="assistant-history" aria-label="Your requests">
              {messages.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
            <div aria-live="polite">
              {reply?.kind === "help" && <p>{reply.message}</p>}
              {reply?.kind === "question" && (
                <p className="assistant-question">{reply.message}</p>
              )}
              {reply?.kind === "proposal" && (
                <div className="assistant-proposal">
                  <h3>Confirm task change</h3>
                  <dl>
                    <dt>Action</dt>
                    <dd>{reply.proposal.action}</dd>
                    <dt>Project</dt>
                    <dd>{reply.proposal.projectName}</dd>
                    <dt>Task</dt>
                    <dd>{reply.proposal.draft.title}</dd>
                    <dt>Due date</dt>
                    <dd>{reply.proposal.draft.date}</dd>
                    <dt>Priority</dt>
                    <dd>{reply.proposal.draft.priority}</dd>
                    <dt>Assignee</dt>
                    <dd>{reply.proposal.draft.assignee || "Unassigned"}</dd>
                    {reply.proposal.expected && (
                      <>
                        <dt>Current task</dt>
                        <dd>
                          {JSON.parse(reply.proposal.expected).title} · due{" "}
                          {JSON.parse(reply.proposal.expected).date} ·{" "}
                          {JSON.parse(reply.proposal.expected).assignee ||
                            "Unassigned"}
                        </dd>
                      </>
                    )}
                  </dl>
                  <p>Nothing changes until you confirm.</p>
                  <div className="button-row">
                    <Button
                      onClick={() => {
                        const p = reply.proposal;
                        if (applyAssistantTask(p)) {
                          setReply({
                            kind: "help",
                            message:
                              "Task change saved. Your project is updated.",
                          });
                        }
                      }}
                    >
                      Confirm change
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setReply({
                          kind: "help",
                          message:
                            "Change cancelled. No task changes were saved.",
                        })
                      }
                    >
                      Cancel change
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {formError && (
              <p role="alert" className="error-banner">
                {formError}
              </p>
            )}
          </div>
          {reply?.kind !== "proposal" && (
            <form
              className="assistant-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) respond(input.trim());
              }}
            >
              {reply?.kind === "question" &&
              ["project", "task"].includes(reply.field) ? (
                <Field
                  label={
                    reply.field === "project" ? "Choose project" : "Choose task"
                  }
                >
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) respond(e.target.value);
                    }}
                  >
                    <option value="">Select…</option>
                    {reply.field === "project"
                      ? data.projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.client}
                          </option>
                        ))
                      : data.projects
                          .find((p) => p.id === reply.request.projectId)
                          ?.tasks.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} — {t.date}
                            </option>
                          ))}
                  </select>
                </Field>
              ) : (
                <>
                  <Field label="Message to task assistant">
                    <input
                      ref={inputRef}
                      value={input}
                      maxLength={500}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Add a task to finish the mood board by Friday"
                      disabled={!ready}
                    />
                  </Field>
                  <Button type="submit" disabled={!ready || !input.trim()}>
                    Send request
                  </Button>
                </>
              )}
              {reply?.kind === "question" && (
                <Button
                  variant="link"
                  onClick={() => {
                    setReply(null);
                    setInput("");
                  }}
                >
                  Cancel request
                </Button>
              )}
            </form>
          )}
        </aside>
      )}
    </>
  );
}
