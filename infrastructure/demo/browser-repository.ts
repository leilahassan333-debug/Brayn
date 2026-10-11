import type { WorkspaceRepository } from "@/application/workspace-repository";
import type { WorkspaceState } from "@/domain/workspace/models";
import { decodeWorkspace } from "@/domain/workspace/validation";
export const DEMO_STORAGE_KEY = "brayn-demo-v1";
export class BrowserWorkspaceRepository implements WorkspaceRepository {
  // Storage is resolved lazily: module imports and SSR do not touch window.
  constructor(
    private readonly storage: () => Pick<Storage, "getItem" | "setItem"> = () =>
      window.localStorage,
  ) {}
  async load(): Promise<WorkspaceState | null> {
    const value = this.storage().getItem(DEMO_STORAGE_KEY);
    return value === null ? null : decodeWorkspace(JSON.parse(value));
  }
  async save(state: WorkspaceState): Promise<void> {
    this.storage().setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  }
}
