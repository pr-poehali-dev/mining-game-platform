import { useState, useEffect, useCallback } from "react";
import HomePage from "./game/HomePage";
import MinerPage from "./game/MinerPage";
import AviaryxPage from "./game/AviaryxPage";
import ProfilePage from "./game/ProfilePage";
import AdminPage from "./game/AdminPage";
import ContactsPage from "./game/ContactsPage";
import DepositPage from "./game/DepositPage";
import WithdrawPage from "./game/WithdrawPage";
import LoginPage from "./game/LoginPage";
import Navbar from "./game/Navbar";
import { getMe, updateBalance as apiUpdateBalance, addHistory as apiAddHistory, getHistory, clearToken, hasToken } from "@/lib/api";
import type { UserProfile } from "@/lib/api";

export type Page = "home" | "miner" | "aviaryx" | "profile" | "admin" | "contacts" | "deposit" | "withdraw";

export interface UserState {
  balance: number;
  name: string;
  history: HistoryItem[];
}

export interface HistoryItem {
  id: number;
  type: "game" | "deposit" | "withdraw";
  label: string;
  amount: number;
  date: string;
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [authUser, setAuthUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!hasToken()) { setAuthLoading(false); return; }
    getMe().then(u => {
      setAuthUser(u);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!authUser) return;
    getHistory().then(h => setHistory(h as HistoryItem[]));
  }, [authUser]);

  const handleLogin = (user: UserProfile) => {
    setAuthUser(user);
    getHistory().then(h => setHistory(h as HistoryItem[]));
  };

  const handleLogout = () => {
    clearToken();
    setAuthUser(null);
    setHistory([]);
    setPage("home");
  };

  const addHistory = useCallback(async (item: Omit<HistoryItem, "id">) => {
    const local: HistoryItem = { ...item, id: Date.now() };
    setHistory(prev => [local, ...prev]);
    await apiAddHistory({ type: item.type, label: item.label, amount: item.amount });
  }, []);

  const updateBalance = useCallback(async (delta: number) => {
    if (!authUser) return;
    setAuthUser(prev => prev ? { ...prev, balance: Math.max(0, prev.balance + delta) } : null);
    const newBalance = await apiUpdateBalance(delta);
    setAuthUser(prev => prev ? { ...prev, balance: newBalance } : null);
  }, [authUser]);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const userState: UserState = {
    balance: authUser?.balance ?? 0,
    name: authUser?.name ?? "",
    history,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center grid-bg">
        <div className="text-center animate-pulse-neon">
          <div className="font-display text-3xl mb-2" style={{ color: "#00f5d4" }}>
            NEON<span style={{ color: "#bf00ff" }}>GAMES</span>
          </div>
          <div className="text-sm" style={{ color: "rgba(180,220,215,0.4)" }}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-background grid-bg relative">
        <div className="scanlines fixed inset-0 z-0 pointer-events-none" />
        <div className="relative z-10">
          <LoginPage onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage navigate={navigate} user={userState} />;
      case "miner": return <MinerPage user={userState} updateBalance={updateBalance} addHistory={addHistory} />;
      case "aviaryx": return <AviaryxPage user={userState} updateBalance={updateBalance} addHistory={addHistory} />;
      case "profile": return <ProfilePage user={userState} navigate={navigate} onLogout={handleLogout} />;
      case "admin": return <AdminPage />;
      case "contacts": return <ContactsPage />;
      case "deposit": return <DepositPage user={userState} updateBalance={updateBalance} addHistory={addHistory} navigate={navigate} />;
      case "withdraw": return <WithdrawPage user={userState} updateBalance={updateBalance} addHistory={addHistory} navigate={navigate} />;
      default: return <HomePage navigate={navigate} user={userState} />;
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg relative">
      <div className="scanlines fixed inset-0 z-0 pointer-events-none" />
      <Navbar page={page} navigate={navigate} user={userState} />
      <main className="pt-16 relative z-10">
        {renderPage()}
      </main>
    </div>
  );
}
