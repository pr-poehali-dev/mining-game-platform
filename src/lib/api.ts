import func2url from "../../backend/func2url.json";

const AUTH_URL = func2url["auth"];

export interface UserProfile {
  id: number;
  tg_id: number;
  name: string;
  tg_username: string | null;
  balance: number;
}

export interface HistoryItem {
  id: number;
  type: "game" | "deposit" | "withdraw";
  label: string;
  amount: number;
  date: string;
}

function getToken(): string | null {
  return localStorage.getItem("ng_token");
}

function setToken(token: string) {
  localStorage.setItem("ng_token", token);
}

export function clearToken() {
  localStorage.removeItem("ng_token");
}

export function hasToken(): boolean {
  return !!getToken();
}

async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["X-Auth-Token"] = token;
  const res = await fetch(`${AUTH_URL}${path}`, { ...options, headers });
  return res;
}

export async function verifyCode(code: string): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verify", code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка входа");
  setToken(data.token);
  return data;
}

export async function getMe(): Promise<UserProfile | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(AUTH_URL, {
    headers: { "Content-Type": "application/json", "X-Auth-Token": token },
  });
  if (!res.ok) { clearToken(); return null; }
  return res.json();
}

export async function getHistory(): Promise<HistoryItem[]> {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${AUTH_URL}?action=history`, {
    headers: { "X-Auth-Token": token },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.history || [];
}

export async function updateBalance(delta: number): Promise<number> {
  const token = getToken();
  if (!token) return 0;
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": token },
    body: JSON.stringify({ action: "balance", delta }),
  });
  const data = await res.json();
  return data.balance ?? 0;
}

export async function addHistory(item: { type: string; label: string; amount: number }): Promise<void> {
  const token = getToken();
  if (!token) return;
  await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Auth-Token": token },
    body: JSON.stringify({ action: "history", ...item }),
  });
}
