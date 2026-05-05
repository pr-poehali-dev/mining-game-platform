import { Page, UserState } from "../Index";
import Icon from "@/components/ui/icon";

interface ProfileProps {
  user: UserState;
  navigate: (p: Page) => void;
  onLogout?: () => void;
}

export default function ProfilePage({ user, navigate, onLogout }: ProfileProps) {
  const totalDeposit = user.history.filter(h => h.type === "deposit").reduce((s, h) => s + h.amount, 0);
  const totalWithdraw = user.history.filter(h => h.type === "withdraw").reduce((s, h) => s + Math.abs(h.amount), 0);
  const gamesPlayed = user.history.filter(h => h.type === "game").length;
  const wins = user.history.filter(h => h.type === "game" && h.amount > 0).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, rgba(191,0,255,0.2), rgba(191,0,255,0.05))", border: "1px solid rgba(191,0,255,0.4)" }}>
          <Icon name="User" size={20} style={{ color: "#bf00ff" }} />
        </div>
        <h1 className="font-display text-2xl" style={{ color: "#bf00ff" }}>ПРОФИЛЬ</h1>
      </div>

      {/* User card */}
      <div className="card-neon-magenta rounded-2xl p-6 mb-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display glow-magenta"
            style={{ background: "linear-gradient(135deg, rgba(191,0,255,0.25), rgba(191,0,255,0.05))", border: "1px solid rgba(191,0,255,0.4)" }}>
            🎮
          </div>
          <div>
            <div className="font-display text-xl" style={{ color: "#bf00ff" }}>{user.name}</div>
            <div className="text-sm" style={{ color: "rgba(180,220,215,0.5)" }}>ID: #7724</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "#39ff14" }} />
              <span className="text-xs" style={{ color: "#39ff14" }}>Онлайн</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs mb-1" style={{ color: "rgba(180,220,215,0.5)" }}>Баланс</div>
            <div className="font-display text-2xl" style={{ color: "#00f5d4", textShadow: "0 0 10px rgba(0,245,212,0.4)" }}>
              {user.balance.toFixed(2)} ₽
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Пополнено", value: totalDeposit.toFixed(0) + " ₽", color: "#00f5d4" },
            { label: "Выведено", value: totalWithdraw.toFixed(0) + " ₽", color: "#39ff14" },
            { label: "Игр", value: gamesPlayed.toString(), color: "#bf00ff" },
            { label: "Побед", value: wins.toString(), color: "#ff6b00" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 text-center"
              style={{ background: `rgba(${s.color === "#00f5d4" ? "0,245,212" : s.color === "#39ff14" ? "57,255,20" : s.color === "#bf00ff" ? "191,0,255" : "255,107,0"},0.08)`, border: `1px solid ${s.color}30` }}>
              <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(180,220,215,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <button onClick={() => navigate("deposit")}
          className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.25)", color: "#00f5d4" }}>
          <Icon name="Plus" size={20} />
          <div className="text-left">
            <div className="font-bold text-sm">Пополнить</div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Мобильный платёж</div>
          </div>
        </button>
        <button onClick={() => navigate("withdraw")}
          className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
          style={{ background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.25)", color: "#39ff14" }}>
          <Icon name="ArrowDownToLine" size={20} />
          <div className="text-left">
            <div className="font-bold text-sm">Вывести</div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>На карту СБП</div>
          </div>
        </button>
      </div>

      {/* Logout */}
      {onLogout && (
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium mb-5 transition-all hover:scale-[1.01] animate-fade-in"
          style={{ background: "rgba(255,23,68,0.08)", border: "1px solid rgba(255,23,68,0.2)", color: "rgba(255,80,100,0.8)", animationDelay: "0.25s" }}>
          <Icon name="LogOut" size={15} />
          Выйти из аккаунта
        </button>
      )}

      {/* History */}
      <div className="card-neon rounded-2xl p-5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h2 className="font-display text-base mb-4" style={{ color: "rgba(180,220,215,0.8)" }}>
          ИСТОРИЯ ОПЕРАЦИЙ
        </h2>
        <div className="flex flex-col gap-2">
          {user.history.length === 0 ? (
            <div className="text-center py-8" style={{ color: "rgba(180,220,215,0.4)" }}>
              История пуста
            </div>
          ) : (
            user.history.slice(0, 15).map(item => {
              const isPositive = item.amount > 0;
              const color = isPositive ? "#39ff14" : item.type === "game" ? "#ff1744" : "#00f5d4";
              const icon = item.type === "deposit" ? "Plus" : item.type === "withdraw" ? "ArrowDownToLine" : "Gamepad2";
              return (
                <div key={item.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon name={icon} size={14} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "rgba(180,220,215,0.9)" }}>{item.label}</div>
                    <div className="text-xs" style={{ color: "rgba(180,220,215,0.4)" }}>{item.date}</div>
                  </div>
                  <div className="font-bold text-sm flex-shrink-0"
                    style={{ color }}>
                    {isPositive ? "+" : ""}{item.amount} ₽
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}