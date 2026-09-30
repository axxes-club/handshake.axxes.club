"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Database, Building2, Link2, UserRound, ShieldCheck, ArrowUpRight } from "lucide-react";
const items = [{href:"/",label:"Overview",Icon:LayoutDashboard},{href:"/data",label:"Your data",Icon:Database},{href:"/workspaces",label:"Workspaces",Icon:Building2},{href:"/connections",label:"Connections",Icon:Link2},{href:"/profile",label:"Profile",Icon:UserRound},{href:"/security",label:"Security",Icon:ShieldCheck}];
export function AccountNavigation() {
  const pathname = usePathname(); const search = useSearchParams();
  const query = search.get("workspace") ? `?workspace=${encodeURIComponent(search.get("workspace")!)}` : "";
  return <nav aria-label="Account" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">{items.map(({href,label,Icon})=><Link key={href} href={`${href}${query}`} aria-current={pathname===href?"page":undefined} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${pathname===href?"bg-accent/10 font-medium text-accent":"text-muted hover:bg-panel-2 hover:text-text"}`}><Icon size={17} aria-hidden="true"/>{label}</Link>)}<Link href="/apps" className="mt-auto flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted hover:text-text lg:mt-8"><ArrowUpRight size={17} aria-hidden="true"/>Explore AXXES</Link></nav>;
}
