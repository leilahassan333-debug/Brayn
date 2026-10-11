import type { WorkspaceState } from "@/domain/workspace/models";

// UI never reads storage directly. Future live adapters implement this port.
// This aggregate port is for Phase 1; a live adapter must authorize scoped
// server operations and handle conflicts instead of trusting browser snapshots.
export interface WorkspaceRepository {
  load(): Promise<WorkspaceState | null>;
  save(state: WorkspaceState): Promise<void>;
}
