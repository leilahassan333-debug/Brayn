"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkspaceState } from "@/domain/workspace/models";
import type { WorkspaceRepository } from "./workspace-repository";

export function useWorkspace(
  repository: WorkspaceRepository,
  initial: WorkspaceState,
) {
  const [data, setData] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const state = useRef(initial);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const revision = useRef(0);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let canceled = false;
    repository
      .load()
      .then((saved) => {
        if (canceled) return;
        const next = saved ?? initial;
        state.current = next;
        setData(next);
      })
      .catch(() => {
        if (!canceled)
          setStorageError(
            "Saved demo data could not be loaded. Showing the starter workspace.",
          );
      })
      .finally(() => {
        if (!canceled) setReady(true);
      });
    return () => {
      canceled = true;
      mounted.current = false;
    };
  }, [repository, initial]);
  const commit = useCallback(
    (command: (current: WorkspaceState) => WorkspaceState) => {
      const next = command(state.current); // Validation completes before any mutation.
      state.current = next;
      setData(next);
      const currentRevision = ++revision.current;
      queue.current = queue.current
        .then(() => repository.save(next))
        .then(() => {
          if (mounted.current && currentRevision === revision.current)
            setStorageError("");
        })
        .catch(() => {
          if (mounted.current)
            setStorageError(
              "Browser storage is unavailable. Changes will last only for this session.",
            );
        });
      return next;
    },
    [repository],
  );
  return { data, ready, storageError, commit };
}
