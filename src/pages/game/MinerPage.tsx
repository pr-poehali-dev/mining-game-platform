import { useState, useCallback } from "react";
import { UserState, HistoryItem } from "../Index";
import Icon from "@/components/ui/icon";

interface MinerProps {
  user: UserState;
  updateBalance: (delta: number) => void;
  addHistory: (item: Omit<HistoryItem, "id">) => void;
}

type CellState = "hidden" | "open" | "bomb" | "flagged";

interface Cell {
  isMine: boolean;
  state: CellState;
}

const GRID = 5;

function generateGrid(mineCount: number): Cell[] {
  const cells: Cell[] = Array(GRID * GRID).fill(null).map(() => ({ isMine: false, state: "hidden" }));
  let placed = 0;
  while (placed < mineCount) {
    const idx = Math.floor(Math.random() * GRID * GRID);
    if (!cells[idx].isMine) { cells[idx].isMine = true; placed++; }
  }
  return cells;
}

function calcMultiplier(opened: number, mines: number): number {
  const safe = GRID * GRID - mines;
  if (opened === 0) return 1;
  let mult = 1;
  for (let i = 0; i < opened; i++) {
    mult *= (GRID * GRID - mines - i) / (GRID * GRID - i);
  }
  return Math.max(1, parseFloat((1 / mult * 0.95).toFixed(2)));
}

export default function MinerPage({ user, updateBalance, addHistory }: MinerProps) {
  const [mineCount, setMineCount] = useState(3);
  const [bet, setBet] = useState(100);
  const [cells, setCells] = useState<Cell[]>([]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [opened, setOpened] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [revealAll, setRevealAll] = useState(false);
  const now = () => new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const startGame = () => {
    if (bet < 10) return;
    if (user.balance < bet) return;
    updateBalance(-bet);
    setCells(generateGrid(mineCount));
    setGameState("playing");
    setOpened(0);
    setCurrentMultiplier(1);
    setRevealAll(false);
  };

  const handleCell = useCallback((idx: number) => {
    if (gameState !== "playing") return;
    setCells(prev => {
      const next = [...prev];
      if (next[idx].state !== "hidden") return prev;
      if (next[idx].isMine) {
        next[idx] = { ...next[idx], state: "bomb" };
        const revealed = next.map(c => ({ ...c, state: c.state === "hidden" ? (c.isMine ? "bomb" : "open") : c.state })) as Cell[];
        setGameState("lost");
        setRevealAll(true);
        addHistory({ type: "game", label: `Минёр — поражение (${mineCount} мин)`, amount: -bet, date: now() });
        return revealed;
      }
      next[idx] = { ...next[idx], state: "open" };
      const newOpened = opened + 1;
      setOpened(newOpened);
      const safe = GRID * GRID - mineCount;
      const mult = calcMultiplier(newOpened, mineCount);
      setCurrentMultiplier(mult);
      if (newOpened >= safe) {
        setGameState("won");
        const win = Math.floor(bet * mult);
        updateBalance(win);
        addHistory({ type: "game", label: `Минёр — победа x${mult} (${mineCount} мин)`, amount: win - bet, date: now() });
      }
      return next;
    });
  }, [gameState, opened, mineCount, bet]);

  const cashOut = () => {
    if (gameState !== "playing" || opened === 0) return;
    const win = Math.floor(bet * currentMultiplier);
    updateBalance(win);
    addHistory({ type: "game", label: `Минёр — кешаут x${currentMultiplier}`, amount: win - bet, date: now() });
    setGameState("won");
    setRevealAll(true);
  };

  const mineOptions = [1, 2, 3, 5, 8, 10, 15, 20];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-cyan"
          style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(0,245,212,0.05))", border: "1px solid rgba(0,245,212,0.4)" }}>
          <Icon name="Bomb" size={20} style={{ color: "#00f5d4" }} />
        </div>
        <div>
          <h1 className="font-display text-2xl" style={{ color: "#00f5d4" }}>МИНЁР</h1>
          <p className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Поле 5×5 · Открывай безопасные клетки</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Баланс</div>
          <div className="font-bold" style={{ color: "#00f5d4" }}>{user.balance.toFixed(2)} ₽</div>
        </div>
      </div>

      {/* Settings panel */}
      <div className="card-neon rounded-2xl p-5 mb-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Bet */}
          <div>
            <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Ставка (₽)</label>
            <div className="flex gap-2 mb-2">
              <input type="number" min={10} value={bet}
                onChange={e => setBet(Math.max(10, parseInt(e.target.value) || 10))}
                disabled={gameState === "playing"}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4" }} />
            </div>
            <div className="flex gap-1.5">
              {[50, 100, 250, 500].map(v => (
                <button key={v} onClick={() => setBet(v)} disabled={gameState === "playing"}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={bet === v ? { background: "rgba(0,245,212,0.2)", color: "#00f5d4", border: "1px solid rgba(0,245,212,0.5)" }
                    : { background: "rgba(0,245,212,0.06)", color: "rgba(180,220,215,0.6)", border: "1px solid rgba(0,245,212,0.15)" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Mines */}
          <div>
            <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Количество мин</label>
            <div className="grid grid-cols-4 gap-1.5">
              {mineOptions.map(m => (
                <button key={m} onClick={() => setMineCount(m)} disabled={gameState === "playing"}
                  className="py-2 rounded-lg text-xs font-bold transition-all"
                  style={mineCount === m ? { background: "rgba(255,23,68,0.2)", color: "#ff1744", border: "1px solid rgba(255,23,68,0.5)" }
                    : { background: "rgba(255,23,68,0.06)", color: "rgba(255,100,120,0.6)", border: "1px solid rgba(255,23,68,0.15)" }}>
                  💣{m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multiplier bar */}
      {(gameState === "playing" || gameState === "won") && (
        <div className="flex items-center justify-between px-5 py-3 rounded-xl mb-4 animate-scale-in"
          style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.25)" }}>
          <div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Текущий множитель</div>
            <div className="font-display text-2xl" style={{ color: "#00f5d4", textShadow: "0 0 15px rgba(0,245,212,0.6)" }}>
              x{currentMultiplier}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Потенциальный выигрыш</div>
            <div className="font-bold text-xl" style={{ color: "#39ff14" }}>
              {Math.floor(bet * currentMultiplier)} ₽
            </div>
          </div>
          {gameState === "playing" && opened > 0 && (
            <button onClick={cashOut}
              className="px-4 py-2 rounded-xl font-bold text-sm btn-neon-fill animate-pulse-neon">
              Забрать
            </button>
          )}
        </div>
      )}

      {/* Game status */}
      {gameState === "won" && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl mb-4 glow-green animate-scale-in"
          style={{ background: "rgba(57,255,20,0.1)", border: "1px solid rgba(57,255,20,0.4)" }}>
          <span className="text-2xl">🎉</span>
          <div>
            <div className="font-bold" style={{ color: "#39ff14" }}>Победа! +{Math.floor(bet * currentMultiplier - bet)} ₽</div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>x{currentMultiplier}</div>
          </div>
        </div>
      )}
      {gameState === "lost" && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl mb-4 animate-scale-in"
          style={{ background: "rgba(255,23,68,0.1)", border: "1px solid rgba(255,23,68,0.4)" }}>
          <span className="text-2xl">💥</span>
          <div>
            <div className="font-bold" style={{ color: "#ff1744" }}>Взрыв! -{bet} ₽</div>
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Открыто {opened} клеток</div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="card-neon rounded-2xl p-4 mb-5" style={{ border: "1px solid rgba(0,245,212,0.15)" }}>
        {cells.length === 0 ? (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}>
            {Array(GRID * GRID).fill(0).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg"
                style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.1)" }} />
            ))}
          </div>
        ) : (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}>
            {cells.map((cell, i) => {
              const isOpen = cell.state === "open";
              const isBomb = cell.state === "bomb";
              const isHidden = cell.state === "hidden";
              return (
                <button key={i} onClick={() => handleCell(i)} disabled={!isHidden || gameState !== "playing"}
                  className="aspect-square rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                  style={isBomb ? { background: "rgba(255,23,68,0.25)", border: "1px solid rgba(255,23,68,0.6)" }
                    : isOpen ? { background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.4)" }
                      : { background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)", cursor: gameState === "playing" ? "pointer" : "default" }}>
                  {isBomb ? <span className="text-xl">💣</span>
                    : isOpen ? <span style={{ color: "#00f5d4" }}>✓</span>
                      : revealAll && cell.isMine ? <span className="text-xl opacity-40">💣</span> : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Start/Reset button */}
      {gameState === "idle" || gameState === "won" || gameState === "lost" ? (
        <button onClick={startGame} disabled={user.balance < bet}
          className="w-full py-4 rounded-xl font-display text-lg transition-all duration-200 btn-neon-fill disabled:opacity-40 disabled:cursor-not-allowed">
          {gameState === "idle" ? "НАЧАТЬ ИГРУ" : "ИГРАТЬ ЕЩЁ"}
        </button>
      ) : (
        <button onClick={cashOut} disabled={opened === 0}
          className="w-full py-4 rounded-xl font-display text-lg transition-all duration-200 btn-neon-fill disabled:opacity-40">
          ЗАБРАТЬ {Math.floor(bet * currentMultiplier)} ₽
        </button>
      )}
    </div>
  );
}
