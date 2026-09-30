import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {SecuritySettings} from "@/components/account/security-settings";
export default async function SecurityPage(){const h=await headers(),current=await auth.api.getSession({headers:h});if(!current)return null;const sessions=await auth.api.listSessions({headers:h});return <><h1 className="text-3xl font-semibold tracking-tight">Security</h1><p className="mb-8 mt-3 text-sm text-muted">Manage your password and where you are signed in.</p><SecuritySettings devices={sessions.map(s=>({id:s.id,current:s.id===current.session.id,userAgent:s.userAgent??null,createdAt:new Date(s.createdAt).toISOString(),updatedAt:new Date(s.updatedAt).toISOString()}))}/></>}
