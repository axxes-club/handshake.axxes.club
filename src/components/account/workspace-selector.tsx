"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { WorkspaceInfo } from "@/lib/account/types";
import { resolveAccountScope } from "@/lib/account/scope";
export function WorkspaceSelector({ workspaces }: { workspaces: WorkspaceInfo[] }) {
  const router=useRouter(),pathname=usePathname(),params=useSearchParams();
  const selected=resolveAccountScope(params.get("workspace")??undefined,workspaces);
  const value=selected.ok?(selected.scope.kind==="personal"?"personal":selected.scope.id):"";
  return <div className="flex items-center gap-3"><label htmlFor="account-workspace" className="hidden text-xs text-muted sm:block">Viewing</label><select id="account-workspace" aria-label="Workspace" value={value} onChange={e=>{const query=new URLSearchParams(params.toString());query.set("workspace",e.target.value);router.push(`${pathname}?${query}`)}} className="input h-10 max-w-[250px] text-sm"><option value="personal">Personal</option>{!selected.ok&&<option value="" disabled>Workspace unavailable</option>}{workspaces.map(w=><option key={w.id} value={w.id}>{w.name} · {w.role}</option>)}</select></div>;
}
