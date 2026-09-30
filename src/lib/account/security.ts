export function revocableSession<T extends { id: string; token: string }>(sessions: T[], id: string, currentId: string): T | null {
  if (id === currentId) return null;
  return sessions.find(s => s.id === id) ?? null;
}
