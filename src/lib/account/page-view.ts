import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loadAccountOverview } from "./overview";
export type AccountSearch = Promise<{ workspace?: string }>;
export async function getAccountView(searchParams: AccountSearch) {
  const { workspace } = await searchParams;
  const result = await loadAccountOverview(await headers(), workspace);
  if (!result.ok && result.status === 401) redirect("/sign-in");
  return result;
}
