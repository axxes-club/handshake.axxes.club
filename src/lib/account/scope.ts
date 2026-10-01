import type { AccountScope, WorkspaceInfo } from "./types";
export const isWorkspaceId = (value: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function resolveAccountScope(requested: string | undefined, workspaces: WorkspaceInfo[]): { ok: true; scope: AccountScope } | { ok: false; status: 400 | 403 } {
  if (requested === "personal") return { ok: true, scope: { kind: "personal" } };
  if (requested !== undefined) {
    if (!isWorkspaceId(requested)) return { ok: false, status: 400 };
    const workspace = workspaces.find(w => w.id === requested);
    return workspace ? { ok: true, scope: { kind: "workspace", id: workspace.id } } : { ok: false, status: 403 };
  }
  const ordered = [...workspaces].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  return { ok: true, scope: ordered[0] ? { kind: "workspace", id: ordered[0].id } : { kind: "personal" } };
}
