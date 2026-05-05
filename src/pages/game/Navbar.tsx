import { useState } from "react";
import { Page, UserState } from "../Index";
import Icon from "@/components/ui/icon";

interface NavbarProps {
  page: Page;
  navigate: (p: Page) => void;
  user: UserState;
}

export default function Navbar({ page, navigate, user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { label: string; page: Page; icon: string }[] = [
    { label: "Главная", page: "home", icon: "Home" },
    { label: "Минёр", page: "miner", icon: "Bomb" },
    { label: "Авиарикс", page: "aviaryx", icon: "Plane" },
    { label: "Профиль", page: "profile", icon: "User" },
    { label: "Контакты", page: "contacts", icon: "MessageCircle" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{ background: "rgba(5, 10, 20, 0.95)", borderBottom: "1px solid rgba(0,245,212,0.15)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("home")} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-cyan"
            style={{ background: "linear-gradient(135deg, #00f5d4, #008c7a)", border: "1px solid #00f5d4" }}>
            <span className="text-black font-display font-bold text-sm">NG</span>
          </div>
          <span className="font-display text-lg hidden sm:block" style={{ color: "#00f5d4", textShadow: "0 0 10px #00f5d4" }}>
            NEON<span style={{ color: "#bf00ff", textShadow: "0 0 10px #bf00ff" }}>GAMES</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={page === item.page ? {
                background: "rgba(0,245,212,0.15)",
                color: "#00f5d4",
                border: "1px solid rgba(0,245,212,0.4)",
              } : {
                color: "rgba(180,220,215,0.7)",
                border: "1px solid transparent",
              }}
            >
              <Icon name={item.icon} size={14} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Balance */}
          <button onClick={() => navigate("deposit")} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4" }}>
            <Icon name="Wallet" size={14} />
            <span className="text-sm font-bold">{user.balance.toFixed(2)} ₽</span>
          </button>

          {/* Deposit/Withdraw buttons */}
          <button onClick={() => navigate("deposit")}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 btn-neon-fill">
            <Icon name="Plus" size={14} />
            Пополнить
          </button>

          {/* Mobile burger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg"
            style={{ color: "#00f5d4", border: "1px solid rgba(0,245,212,0.3)" }}>
            <Icon name={menuOpen ? "X" : "Menu"} size={18} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 animate-fade-in"
          style={{ background: "rgba(5, 10, 20, 0.98)", borderBottom: "1px solid rgba(0,245,212,0.15)", backdropFilter: "blur(16px)" }}>
          <div className="px-4 py-3 flex flex-col gap-1">
            {/* Balance mobile */}
            <div className="flex items-center justify-between p-3 rounded-lg mb-2"
              style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)" }}>
              <span className="text-sm" style={{ color: "rgba(180,220,215,0.6)" }}>Баланс</span>
              <span className="font-bold" style={{ color: "#00f5d4" }}>{user.balance.toFixed(2)} ₽</span>
            </div>
            {navItems.map(item => (
              <button key={item.page} onClick={() => { navigate(item.page); setMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left"
                style={page === item.page ? {
                  background: "rgba(0,245,212,0.12)",
                  color: "#00f5d4",
                  border: "1px solid rgba(0,245,212,0.3)",
                } : { color: "rgba(180,220,215,0.7)" }}>
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => { navigate("deposit"); setMenuOpen(false); }}
                className="py-2 rounded-lg text-sm font-bold btn-neon-fill">
                + Пополнить
              </button>
              <button onClick={() => { navigate("withdraw"); setMenuOpen(false); }}
                className="py-2 rounded-lg text-sm font-medium btn-neon-magenta">
                Вывести
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
