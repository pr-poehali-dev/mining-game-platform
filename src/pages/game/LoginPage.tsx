import { useState } from "react";
import Icon from "@/components/ui/icon";
import { verifyCode } from "@/lib/api";
import type { UserProfile } from "@/lib/api";

const BOT_USERNAME = import.meta.env.VITE_TG_BOT_USERNAME || "neon_games_bot";

interface LoginPageProps {
  onLogin: (user: UserProfile, token: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"intro" | "code">("intro");

  const handleVerify = async () => {
    if (code.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const result = await verifyCode(code.trim().toUpperCase());
      onLogin(result.user, result.token);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Неверный или устаревший код");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-cyan"
            style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(0,245,212,0.05))", border: "1px solid rgba(0,245,212,0.5)" }}>
            <span className="font-display text-3xl" style={{ color: "#00f5d4" }}>NG</span>
          </div>
          <h1 className="font-display text-4xl mb-1">
            <span style={{ color: "#00f5d4", textShadow: "0 0 20px rgba(0,245,212,0.5)" }}>NEON</span>
            <span style={{ color: "#bf00ff", textShadow: "0 0 20px rgba(191,0,255,0.5)" }}>GAMES</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(180,220,215,0.5)" }}>Игровая платформа</p>
        </div>

        {step === "intro" ? (
          <div className="card-neon rounded-2xl p-6 animate-fade-in">
            <h2 className="font-display text-lg text-center mb-5" style={{ color: "rgba(180,220,215,0.9)" }}>
              ВХОД ЧЕРЕЗ TELEGRAM
            </h2>

            <div className="flex flex-col gap-3 mb-6">
              {[
                { n: 1, text: "Открой нашего бота в Telegram", icon: "Send" },
                { n: 2, text: "Нажми /start — бот пришлёт код", icon: "MessageSquare" },
                { n: 3, text: "Введи код на следующем шаге", icon: "KeyRound" },
              ].map(item => (
                <div key={item.n} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.1)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4" }}>
                    {item.n}
                  </div>
                  <span className="text-sm" style={{ color: "rgba(180,220,215,0.7)" }}>{item.text}</span>
                  <Icon name={item.icon} size={15} className="ml-auto flex-shrink-0" style={{ color: "rgba(0,245,212,0.4)" }} />
                </div>
              ))}
            </div>

            <a
              href={`https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm mb-3 transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #0088cc, #005f8f)", color: "#fff", boxShadow: "0 0 20px rgba(0,136,204,0.3)" }}>
              <Icon name="Send" size={16} />
              Открыть бота @{BOT_USERNAME}
            </a>

            <button onClick={() => setStep("code")}
              className="w-full py-3 rounded-xl font-bold text-sm btn-neon-cyan">
              У меня уже есть код →
            </button>
          </div>
        ) : (
          <div className="card-neon rounded-2xl p-6 animate-scale-in">
            <button onClick={() => setStep("intro")} className="flex items-center gap-1.5 text-sm mb-5 transition-all hover:opacity-70"
              style={{ color: "rgba(180,220,215,0.5)" }}>
              <Icon name="ArrowLeft" size={14} /> Назад
            </button>

            <h2 className="font-display text-lg text-center mb-2" style={{ color: "rgba(180,220,215,0.9)" }}>
              ВВЕДИТЕ КОД
            </h2>
            <p className="text-xs text-center mb-5" style={{ color: "rgba(180,220,215,0.4)" }}>
              Код из Telegram (6 символов)
            </p>

            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
              placeholder="ABC123"
              maxLength={6}
              autoFocus
              className="w-full rounded-xl px-4 py-4 text-center text-2xl font-display outline-none mb-4 tracking-widest"
              style={{ background: "rgba(0,245,212,0.08)", border: `1px solid ${error ? "rgba(255,23,68,0.5)" : "rgba(0,245,212,0.3)"}`, color: "#00f5d4", letterSpacing: "0.3em" }}
            />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm animate-scale-in"
                style={{ background: "rgba(255,23,68,0.1)", border: "1px solid rgba(255,23,68,0.3)", color: "#ff1744" }}>
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={code.length < 4 || loading}
              className="w-full py-3.5 rounded-xl font-display text-lg btn-neon-fill disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader" size={18} className="animate-spin" />
                  Проверяем...
                </span>
              ) : "ВОЙТИ"}
            </button>

            <p className="text-center text-xs mt-4" style={{ color: "rgba(180,220,215,0.35)" }}>
              Нет кода?{" "}
              <a href={`https://t.me/${BOT_USERNAME}`} target="_blank" rel="noopener noreferrer"
                style={{ color: "#00f5d4" }}>
                Открыть бота
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
