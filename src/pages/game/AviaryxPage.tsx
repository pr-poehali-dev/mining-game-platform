import { useState, useEffect, useRef } from "react";
import { UserState, HistoryItem } from "../Index";
import Icon from "@/components/ui/icon";

interface AviaryxProps {
  user: UserState;
  updateBalance: (delta: number) => void;
  addHistory: (item: Omit<HistoryItem, "id">) => void;
}

type GameState = "waiting" | "flying" | "crashed" | "won";

const TICK_MS = 100;
const MIN_CRASH = 1.05;
const MAX_CRASH = 20;

function genCrash(): number {
  const r = Math.random();
  return parseFloat((MIN_CRASH + Math.pow(r, 0.4) * (MAX_CRASH - MIN_CRASH)).toFixed(2));
}

const history = [
  { mult: 1.24, color: "#00f5d4" }, { mult: 8.71, color: "#39ff14" }, { mult: 1.02, color: "#ff1744" },
  { mult: 3.55, color: "#00f5d4" }, { mult: 14.2, color: "#39ff14" }, { mult: 2.01, color: "#00f5d4" },
  { mult: 1.14, color: "#ff1744" }, { mult: 6.4, color: "#39ff14" },
];

export default function AviaryxPage({ user, updateBalance, addHistory }: AviaryxProps) {
  const [bet, setBet] = useState(100);
  const [autoCashout, setAutoCashout] = useState<number | "">(2.0);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashAt, setCrashAt] = useState(0);
  const [hasBet, setHasBet] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const now = () => new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const stopTick = () => { if (tickRef.current) clearInterval(tickRef.current); };

  const startRound = () => {
    const crash = genCrash();
    setCrashAt(crash);
    setMultiplier(1.00);
    setGameState("flying");
    startedAtRef.current = Date.now();

    tickRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      const current = parseFloat((1 + elapsed * 0.15 + elapsed * elapsed * 0.03).toFixed(2));
      setMultiplier(current);

      if (current >= crash) {
        clearInterval(tickRef.current!);
        setMultiplier(crash);
        setGameState("crashed");
        setHasBet(false);
        setTimeout(() => {
          setCountdown(5);
          startCountdown();
        }, 3000);
      }

      if (typeof autoCashout === "number" && current >= autoCashout) {
        handleCashout(current);
        clearInterval(tickRef.current!);
      }
    }, TICK_MS);
  };

  const startCountdown = () => {
    let c = 5;
    countdownRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current!);
        setHasBet(false);
        startRound();
      }
    }, 1000);
  };

  useEffect(() => {
    startCountdown();
    return () => {
      stopTick();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const placeBet = () => {
    if (gameState !== "waiting" && gameState !== "crashed") return;
    if (user.balance < bet) return;
    updateBalance(-bet);
    setHasBet(true);
  };

  const handleCashout = (mult?: number) => {
    const m = mult ?? multiplier;
    if (!hasBet || gameState !== "flying") return;
    const win = Math.floor(bet * m);
    updateBalance(win);
    addHistory({ type: "game", label: `Авиарикс — кешаут x${m.toFixed(2)}`, amount: win - bet, date: now() });
    setHasBet(false);
    setGameState("won");
  };

  const multColor = multiplier < 2 ? "#00f5d4" : multiplier < 5 ? "#39ff14" : multiplier < 10 ? "#ff6b00" : "#bf00ff";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-magenta"
          style={{ background: "linear-gradient(135deg, rgba(191,0,255,0.2), rgba(191,0,255,0.05))", border: "1px solid rgba(191,0,255,0.4)" }}>
          <Icon name="Plane" size={20} style={{ color: "#bf00ff" }} />
        </div>
        <div>
          <h1 className="font-display text-2xl" style={{ color: "#bf00ff" }}>АВИАРИКС</h1>
          <p className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Забери до краша · Множитель растёт</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Баланс</div>
          <div className="font-bold" style={{ color: "#00f5d4" }}>{user.balance.toFixed(2)} ₽</div>
        </div>
      </div>

      {/* History chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {history.map((h, i) => (
          <span key={i} className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: `${h.color}18`, color: h.color, border: `1px solid ${h.color}40` }}>
            x{h.mult}
          </span>
        ))}
      </div>

      {/* Game screen */}
      <div className="rounded-2xl mb-5 overflow-hidden animate-fade-in" style={{ animationDelay: "0.1s", border: "1px solid rgba(191,0,255,0.2)", background: "rgba(10,8,25,0.9)", height: "240px", position: "relative" }}>
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "linear-gradient(rgba(191,0,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(191,0,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {gameState === "waiting" || gameState === "crashed" ? (
            <div className="text-center">
              {gameState === "crashed" ? (
                <>
                  <div className="font-display text-5xl mb-2" style={{ color: "#ff1744", textShadow: "0 0 30px rgba(255,23,68,0.7)" }}>
                    КРАШ x{crashAt.toFixed(2)}
                  </div>
                  <div className="text-sm" style={{ color: "rgba(180,220,215,0.5)" }}>Следующий раунд через {countdown}с</div>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-3 animate-float">✈️</div>
                  <div className="font-display text-xl" style={{ color: "rgba(180,220,215,0.7)" }}>Старт через</div>
                  <div className="font-display text-5xl" style={{ color: "#bf00ff", textShadow: "0 0 20px rgba(191,0,255,0.6)" }}>{countdown}с</div>
                </>
              )}
            </div>
          ) : gameState === "won" ? (
            <div className="text-center animate-scale-in">
              <div className="text-5xl mb-2">🎉</div>
              <div className="font-display text-3xl" style={{ color: "#39ff14", textShadow: "0 0 20px rgba(57,255,20,0.6)" }}>
                КЕШАУТ x{multiplier.toFixed(2)}
              </div>
              <div className="text-sm mt-1" style={{ color: "rgba(180,220,215,0.5)" }}>+{Math.floor(bet * multiplier - bet)} ₽</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-2 animate-float" style={{ filter: `drop-shadow(0 0 20px ${multColor})` }}>✈️</div>
              <div className="font-display text-6xl transition-all duration-100" style={{ color: multColor, textShadow: `0 0 30px ${multColor}80` }}>
                x{multiplier.toFixed(2)}
              </div>
              {hasBet && (
                <div className="text-sm mt-1" style={{ color: "#39ff14" }}>
                  +{Math.floor(bet * multiplier - bet)} ₽ если заберёшь сейчас
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bet panel */}
      <div className="card-neon-magenta rounded-2xl p-5 mb-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Ставка (₽)</label>
            <input type="number" min={10} value={bet}
              onChange={e => setBet(Math.max(10, parseInt(e.target.value) || 10))}
              disabled={hasBet}
              className="w-full rounded-lg px-3 py-2 text-sm font-bold outline-none"
              style={{ background: "rgba(191,0,255,0.08)", border: "1px solid rgba(191,0,255,0.3)", color: "#bf00ff" }} />
            <div className="flex gap-1.5 mt-2">
              {[50, 100, 250, 500].map(v => (
                <button key={v} onClick={() => setBet(v)} disabled={hasBet}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={bet === v ? { background: "rgba(191,0,255,0.2)", color: "#bf00ff", border: "1px solid rgba(191,0,255,0.5)" }
                    : { background: "rgba(191,0,255,0.06)", color: "rgba(180,220,215,0.6)", border: "1px solid rgba(191,0,255,0.15)" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Авто-кешаут (x)</label>
            <input type="number" step={0.1} min={1.1} value={autoCashout}
              onChange={e => setAutoCashout(e.target.value === "" ? "" : parseFloat(e.target.value))}
              disabled={hasBet}
              className="w-full rounded-lg px-3 py-2 text-sm font-bold outline-none"
              style={{ background: "rgba(191,0,255,0.08)", border: "1px solid rgba(191,0,255,0.3)", color: "#bf00ff" }} />
            <div className="flex gap-1.5 mt-2">
              {[1.5, 2, 3, 5].map(v => (
                <button key={v} onClick={() => setAutoCashout(v)} disabled={hasBet}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={autoCashout === v ? { background: "rgba(191,0,255,0.2)", color: "#bf00ff", border: "1px solid rgba(191,0,255,0.5)" }
                    : { background: "rgba(191,0,255,0.06)", color: "rgba(180,220,215,0.6)", border: "1px solid rgba(191,0,255,0.15)" }}>
                  x{v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {gameState === "flying" && hasBet ? (
          <button onClick={() => handleCashout()}
            className="w-full py-4 rounded-xl font-display text-lg btn-neon-fill animate-pulse-neon">
            ЗАБРАТЬ {Math.floor(bet * multiplier)} ₽ · x{multiplier.toFixed(2)}
          </button>
        ) : (
          <button onClick={placeBet}
            disabled={hasBet || user.balance < bet || gameState === "flying"}
            className="w-full py-4 rounded-xl font-display text-lg btn-neon-magenta disabled:opacity-40 disabled:cursor-not-allowed">
            {hasBet ? "✓ СТАВКА ПРИНЯТА" : "ПОСТАВИТЬ " + bet + " ₽"}
          </button>
        )}
      </div>

      {/* Risk info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Низкий риск", mult: "x1.1–x2", color: "#00f5d4", tip: "Авто x1.5" },
          { label: "Средний", mult: "x2–x5", color: "#ff6b00", tip: "Авто x3" },
          { label: "Высокий", mult: "x5+", color: "#bf00ff", tip: "Авто x10" },
        ].map((r, i) => (
          <button key={i} onClick={() => setAutoCashout(r.tip === "Авто x1.5" ? 1.5 : r.tip === "Авто x3" ? 3 : 10)}
            className="card-neon rounded-xl p-3 text-center transition-all hover:scale-105">
            <div className="font-bold text-sm" style={{ color: r.color }}>{r.mult}</div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>{r.label}</div>
            <div className="text-xs mt-1" style={{ color: "rgba(180,220,215,0.4)" }}>{r.tip}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
