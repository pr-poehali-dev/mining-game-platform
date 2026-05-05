import { Page, UserState } from "../Index";
import Icon from "@/components/ui/icon";

interface HomePageProps {
  navigate: (p: Page) => void;
  user: UserState;
}

const games = [
  {
    id: "miner" as Page,
    title: "МИНЁР",
    subtitle: "5×5 поле, выбери мины",
    desc: "Открывай клетки, избегай бомб. Чем больше мин — тем выше множитель.",
    icon: "Bomb",
    color: "#00f5d4",
    glow: "glow-cyan",
    gradient: "linear-gradient(135deg, rgba(0,245,212,0.12), rgba(0,245,212,0.03))",
    border: "rgba(0,245,212,0.3)",
    multiplier: "до x25",
    tag: "🔥 Хит",
  },
  {
    id: "aviaryx" as Page,
    title: "АВИАРИКС",
    subtitle: "Коэффициент растёт",
    desc: "Самолёт взлетает — коэффициент растёт. Успей забрать до краша!",
    icon: "Plane",
    color: "#bf00ff",
    glow: "glow-magenta",
    gradient: "linear-gradient(135deg, rgba(191,0,255,0.12), rgba(191,0,255,0.03))",
    border: "rgba(191,0,255,0.3)",
    multiplier: "до x100",
    tag: "⚡ Новинка",
  },
];

const stats = [
  { label: "Игроков онлайн", value: "1 248", icon: "Users", color: "#00f5d4" },
  { label: "Выплачено сегодня", value: "284 530 ₽", icon: "TrendingUp", color: "#39ff14" },
  { label: "Максимальный выигрыш", value: "x97.4", icon: "Zap", color: "#bf00ff" },
];

export default function HomePage({ navigate, user }: HomePageProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.25)", color: "#00f5d4" }}>
          <span className="w-2 h-2 rounded-full animate-pulse-neon" style={{ background: "#39ff14" }} />
          1 248 игроков онлайн
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl mb-4 leading-tight">
          <span style={{ color: "#00f5d4", textShadow: "0 0 30px rgba(0,245,212,0.5)" }}>NEON</span>
          <br />
          <span style={{ color: "#bf00ff", textShadow: "0 0 30px rgba(191,0,255,0.5)" }}>GAMES</span>
        </h1>

        <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: "rgba(180,220,215,0.7)" }}>
          Играй. Рискуй. Выигрывай.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate("miner")}
            className="px-8 py-3 rounded-xl font-bold text-sm btn-neon-fill">
            Играть сейчас
          </button>
          <button onClick={() => navigate("deposit")}
            className="px-8 py-3 rounded-xl font-bold text-sm btn-neon-cyan">
            + Пополнить счёт
          </button>
        </div>

        {/* Balance banner */}
        <div className="inline-flex items-center gap-3 mt-6 px-5 py-2.5 rounded-xl"
          style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)" }}>
          <Icon name="Wallet" size={16} style={{ color: "#00f5d4" }} />
          <span style={{ color: "rgba(180,220,215,0.6)" }} className="text-sm">Ваш баланс:</span>
          <span className="font-bold" style={{ color: "#00f5d4" }}>{user.balance.toFixed(2)} ₽</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="card-neon rounded-xl p-4 text-center animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s`, border: `1px solid rgba(${s.color === "#00f5d4" ? "0,245,212" : s.color === "#39ff14" ? "57,255,20" : "191,0,255"},0.2)` }}>
            <Icon name={s.icon} size={20} className="mx-auto mb-2" style={{ color: s.color }} />
            <div className="font-bold text-sm sm:text-base" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "rgba(180,220,215,0.5)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Games */}
      <h2 className="font-display text-xl mb-5 text-center" style={{ color: "rgba(180,220,215,0.8)" }}>
        ВЫБЕРИ ИГРУ
      </h2>

      <div className="grid sm:grid-cols-2 gap-5 mb-10">
        {games.map((game, i) => (
          <button key={game.id} onClick={() => navigate(game.id)}
            className="text-left rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] group animate-fade-in"
            style={{
              background: game.gradient,
              border: `1px solid ${game.border}`,
              animationDelay: `${i * 0.15}s`,
            }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `rgba(${game.color === "#00f5d4" ? "0,245,212" : "191,0,255"},0.15)`, border: `1px solid ${game.border}` }}>
                <Icon name={game.icon} size={22} style={{ color: game.color }} />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ background: `rgba(${game.color === "#00f5d4" ? "0,245,212" : "191,0,255"},0.15)`, color: game.color }}>
                {game.tag}
              </span>
            </div>

            <h3 className="font-display text-2xl mb-1" style={{ color: game.color }}>
              {game.title}
            </h3>
            <p className="text-sm mb-2" style={{ color: "rgba(180,220,215,0.5)" }}>{game.subtitle}</p>
            <p className="text-sm mb-4" style={{ color: "rgba(180,220,215,0.7)" }}>{game.desc}</p>

            <div className="flex items-center justify-between">
              <span className="font-bold text-lg" style={{ color: game.color }}>{game.multiplier}</span>
              <div className="flex items-center gap-1 text-sm group-hover:gap-2 transition-all"
                style={{ color: game.color }}>
                Играть <Icon name="ArrowRight" size={14} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "Plus", label: "Пополнить", page: "deposit" as Page, color: "#00f5d4" },
          { icon: "ArrowDownToLine", label: "Вывести", page: "withdraw" as Page, color: "#39ff14" },
          { icon: "User", label: "Профиль", page: "profile" as Page, color: "#bf00ff" },
          { icon: "MessageCircle", label: "Поддержка", page: "contacts" as Page, color: "#ff6b00" },
        ].map((a, i) => (
          <button key={i} onClick={() => navigate(a.page)}
            className="card-neon rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105"
            style={{ border: `1px solid rgba(${a.color === "#00f5d4" ? "0,245,212" : a.color === "#39ff14" ? "57,255,20" : a.color === "#bf00ff" ? "191,0,255" : "255,107,0"},0.2)` }}>
            <Icon name={a.icon} size={20} style={{ color: a.color }} />
            <span className="text-xs font-medium" style={{ color: a.color }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
