import { useState } from "react";
import Icon from "@/components/ui/icon";

const mockRequests = [
  { id: 1001, type: "withdraw", user: "Игрок_7724", amount: 500, method: "СБП · Сбербанк", phone: "+7 (9xx) xxx-xx-94", date: "05.05.2026 10:30", status: "pending" },
  { id: 1002, type: "withdraw", user: "Pro_Gamer_X", amount: 1200, method: "СБП · Тинькофф", phone: "+7 (9xx) xxx-xx-17", date: "05.05.2026 11:15", status: "pending" },
  { id: 1003, type: "deposit", user: "Lucky777", amount: 3000, method: "Мобильный МТС", phone: "+7 (9xx) xxx-xx-03", date: "05.05.2026 12:00", status: "approved" },
  { id: 1004, type: "withdraw", user: "StarPlayer", amount: 750, method: "СБП · Альфа", phone: "+7 (9xx) xxx-xx-55", date: "05.05.2026 13:20", status: "rejected" },
];

const TG_LINK = "https://t.me/admin_neon_games";

export default function AdminPage() {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  const filtered = requests.filter(r => filter === "all" ? true : r.status === filter);

  const changeStatus = (id: number, status: "approved" | "rejected") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 flex flex-col items-center">
        <div className="card-neon rounded-2xl p-8 w-full animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 glow-magenta"
            style={{ background: "rgba(191,0,255,0.15)", border: "1px solid rgba(191,0,255,0.4)" }}>
            <Icon name="Shield" size={28} style={{ color: "#bf00ff" }} />
          </div>
          <h1 className="font-display text-xl text-center mb-2" style={{ color: "#bf00ff" }}>ADMIN PANEL</h1>
          <p className="text-center text-sm mb-6" style={{ color: "rgba(180,220,215,0.5)" }}>Введите пароль для входа</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl mb-4 text-sm outline-none"
            style={{ background: "rgba(191,0,255,0.08)", border: "1px solid rgba(191,0,255,0.3)", color: "#fff" }} />
          <button onClick={() => setAuthed(password === "admin123")}
            className="w-full py-3 rounded-xl font-bold btn-neon-magenta">
            Войти
          </button>
          <a href={TG_LINK} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-4 text-sm transition-all hover:opacity-80"
            style={{ color: "rgba(180,220,215,0.5)" }}>
            <Icon name="Send" size={14} />
            Управление через Telegram
          </a>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Ожидают", value: requests.filter(r => r.status === "pending").length, color: "#ff6b00" },
    { label: "Одобрено", value: requests.filter(r => r.status === "approved").length, color: "#39ff14" },
    { label: "Отклонено", value: requests.filter(r => r.status === "rejected").length, color: "#ff1744" },
    { label: "Всего", value: requests.length, color: "#00f5d4" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(191,0,255,0.15)", border: "1px solid rgba(191,0,255,0.4)" }}>
          <Icon name="Shield" size={20} style={{ color: "#bf00ff" }} />
        </div>
        <h1 className="font-display text-2xl" style={{ color: "#bf00ff" }}>ADMIN PANEL</h1>
        <a href={TG_LINK} target="_blank" rel="noopener noreferrer"
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: "rgba(0,150,255,0.15)", border: "1px solid rgba(0,150,255,0.3)", color: "#00aaff" }}>
          <Icon name="Send" size={14} />
          Telegram
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {stats.map((s, i) => (
          <div key={i} className="card-neon rounded-xl p-3 text-center"
            style={{ border: `1px solid ${s.color}25` }}>
            <div className="font-display text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {(["all", "pending", "approved", "rejected"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={filter === f ? { background: "rgba(191,0,255,0.2)", color: "#bf00ff", border: "1px solid rgba(191,0,255,0.4)" }
              : { background: "rgba(255,255,255,0.05)", color: "rgba(180,220,215,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {f === "all" ? "Все" : f === "pending" ? "Ожидают" : f === "approved" ? "Одобрено" : "Отклонено"}
          </button>
        ))}
      </div>

      {/* Requests */}
      <div className="flex flex-col gap-3">
        {filtered.map((r, i) => {
          const statusColor = r.status === "pending" ? "#ff6b00" : r.status === "approved" ? "#39ff14" : "#ff1744";
          const statusLabel = r.status === "pending" ? "Ожидает" : r.status === "approved" ? "Одобрено" : "Отклонено";
          return (
            <div key={r.id} className="card-neon rounded-2xl p-5 animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s`, border: `1px solid ${statusColor}20` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: "rgba(180,220,215,0.9)" }}>{r.user}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: r.type === "withdraw" ? "rgba(191,0,255,0.15)" : "rgba(0,245,212,0.15)", color: r.type === "withdraw" ? "#bf00ff" : "#00f5d4" }}>
                      {r.type === "withdraw" ? "Вывод" : "Пополнение"}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "rgba(180,220,215,0.4)" }}>#{r.id} · {r.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg" style={{ color: r.type === "withdraw" ? "#bf00ff" : "#00f5d4" }}>
                    {r.amount} ₽
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${statusColor}20`, color: statusColor }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>
                <Icon name="Smartphone" size={12} />
                {r.method} · {r.phone}
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => changeStatus(r.id, "approved")}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(57,255,20,0.15)", color: "#39ff14", border: "1px solid rgba(57,255,20,0.3)" }}>
                    ✓ Одобрить
                  </button>
                  <button onClick={() => changeStatus(r.id, "rejected")}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(255,23,68,0.15)", color: "#ff1744", border: "1px solid rgba(255,23,68,0.3)" }}>
                    ✕ Отклонить
                  </button>
                  <a href={`${TG_LINK}?text=Заявка+%23${r.id}+${r.user}+${r.amount}руб`} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{ background: "rgba(0,150,255,0.15)", color: "#00aaff", border: "1px solid rgba(0,150,255,0.3)" }}>
                    <Icon name="Send" size={14} />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
