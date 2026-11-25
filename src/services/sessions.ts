import { LOGIN_HISTORY, SESSIONS, type Session } from "@/data/sessions";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

export const sessionsStore = createStore<Session[]>(SESSIONS);

export async function signOutSession(id: string) {
  await delay();
  sessionsStore.set((s) => s.filter((x) => x.id !== id || x.current));
}

export async function signOutOtherSessions() {
  await delay();
  sessionsStore.set((s) => s.filter((x) => x.current));
}

export function loginHistoryCsv() {
  const head = ["User", "Date & time", "Method", "IP address", "Result"];
  const rows = LOGIN_HISTORY.map((e) => [e.user, e.at, e.method, e.ip, e.result === "success" ? "Success" : `Failed x${e.attempts ?? 1}`]);
  return [head, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadLoginHistory() {
  const url = URL.createObjectURL(new Blob([loginHistoryCsv()], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "login-history.csv";
  a.click();
  URL.revokeObjectURL(url);
}
