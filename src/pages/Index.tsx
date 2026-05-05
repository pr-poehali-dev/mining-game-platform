import { useState } from "react";
import HomePage from "./game/HomePage";
import MinerPage from "./game/MinerPage";
import AviaryxPage from "./game/AviaryxPage";
import ProfilePage from "./game/ProfilePage";
import AdminPage from "./game/AdminPage";
import ContactsPage from "./game/ContactsPage";
import DepositPage from "./game/DepositPage";
import WithdrawPage from "./game/WithdrawPage";
import Navbar from "./game/Navbar";

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

const initialUser: UserState = {
  balance: 1250.00,
  name: "Игрок_7724",
  history: [
    { id: 1, type: "deposit", label: "Пополнение", amount: 500, date: "05.05.2026 10:12" },
    { id: 2, type: "game", label: "Минёр — победа", amount: 320, date: "05.05.2026 11:30" },
    { id: 3, type: "game", label: "Авиарикс — вылет x2.4", amount: -200, date: "05.05.2026 12:05" },
    { id: 4, type: "game", label: "Минёр — поражение", amount: -150, date: "05.05.2026 13:20" },
    { id: 5, type: "deposit", label: "Пополнение", amount: 780, date: "05.05.2026 14:00" },
  ],
};

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<UserState>(initialUser);

  const addHistory = (item: Omit<HistoryItem, "id">) => {
    setUser(prev => ({
      ...prev,
      history: [{ ...item, id: Date.now() }, ...prev.history],
    }));
  };

  const updateBalance = (delta: number) => {
    setUser(prev => ({ ...prev, balance: Math.max(0, prev.balance + delta) }));
  };

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage navigate={navigate} user={user} />;
      case "miner": return <MinerPage user={user} updateBalance={updateBalance} addHistory={addHistory} />;
      case "aviaryx": return <AviaryxPage user={user} updateBalance={updateBalance} addHistory={addHistory} />;
      case "profile": return <ProfilePage user={user} navigate={navigate} />;
      case "admin": return <AdminPage />;
      case "contacts": return <ContactsPage />;
      case "deposit": return <DepositPage user={user} updateBalance={updateBalance} addHistory={addHistory} navigate={navigate} />;
      case "withdraw": return <WithdrawPage user={user} updateBalance={updateBalance} addHistory={addHistory} navigate={navigate} />;
      default: return <HomePage navigate={navigate} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg relative">
      <div className="scanlines fixed inset-0 z-0 pointer-events-none" />
      <Navbar page={page} navigate={navigate} user={user} />
      <main className="pt-16 relative z-10">
        {renderPage()}
      </main>
    </div>
  );
}
