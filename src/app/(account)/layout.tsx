import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AllAppsSwitcher } from "@/components/all-apps-switcher";
import { Brand } from "@/components/ui";
import { AccountNavigation } from "@/components/account/navigation";
import { WorkspaceSelector } from "@/components/account/workspace-selector";
import { loadAccountMetadata } from "@/lib/account/store";
export default async function AccountLayout({children}:{children:React.ReactNode}){
  const account=await loadAccountMetadata(await headers());if(!account)redirect("/sign-in");
  return <div className="min-h-dvh"><a href="#account-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent focus:p-3 focus:text-accent-ink">Skip to content</a><header className="flex min-h-20 items-center justify-between gap-4 border-b border-line px-5 sm:px-8"><Brand/><AllAppsSwitcher/><Suspense><WorkspaceSelector workspaces={account.workspaces}/></Suspense><a href="/sign-out" className="hidden text-sm text-muted hover:text-text sm:block">Sign out</a></header><div className="mx-auto max-w-[1500px] lg:grid lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="border-b border-line p-3 lg:min-h-[calc(100dvh-80px)] lg:border-b-0 lg:border-r lg:p-5"><Suspense><AccountNavigation/></Suspense><div className="mt-10 hidden rounded-xl border border-line p-3 lg:block"><p className="truncate text-sm font-medium">{account.profile.name}</p><p className="mt-1 truncate text-xs text-muted">{account.profile.email}</p></div></aside><main id="account-content" className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}<footer className="mt-12 border-t border-line pt-5 text-xs text-muted">Your AXXES account · <a href="/apps" className="hover:text-text">Explore apps</a><a href="/sign-out" className="float-right hover:text-text">Sign out</a></footer></main></div></div>;
}
