import { useState } from "react";
import { Page, UserState, HistoryItem } from "../Index";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const NOTIFY_URL = func2url["notify-telegram"];

interface DepositProps {
  user: UserState;
  updateBalance: (delta: number) => void;
  addHistory: (item: Omit<HistoryItem, "id">) => void;
  navigate: (p: Page) => void;
}

const MIN_DEPOSIT = 100;
const MAX_DEPOSIT = 15000;

const METHODS = [
  { id: "mts", label: "МТС", icon: "Smartphone", color: "#ff1744", desc: "Мобильный платёж МТС" },
  { id: "megafon", label: "МегаФон", icon: "Smartphone", color: "#39ff14", desc: "Мобильный платёж МегаФон" },
  { id: "beeline", label: "Билайн", icon: "Smartphone", color: "#ff6b00", desc: "Мобильный платёж Билайн" },
  { id: "tele2", label: "Tele2", icon: "Smartphone", color: "#00f5d4", desc: "Мобильный платёж Tele2" },
];

export default function DepositPage({ user, updateBalance, addHistory, navigate }: DepositProps) {
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState("mts");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const now = () => new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const selectedMethod = METHODS.find(m => m.id === method)!;

  const handleSubmit = () => {
    if (amount < MIN_DEPOSIT || amount > MAX_DEPOSIT || !phone) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    updateBalance(amount);
    addHistory({ type: "deposit", label: `Пополнение ${selectedMethod.label}`, amount, date: now() });
    setStep("success");
    fetch(NOTIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "deposit",
        user: user.name,
        amount,
        method: selectedMethod.label,
        phone,
      }),
    }).catch(() => {});
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="animate-scale-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 glow-green"
            style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.5)" }}>
            <Icon name="CheckCircle" size={40} style={{ color: "#39ff14" }} />
          </div>
          <h2 className="font-display text-3xl mb-2" style={{ color: "#39ff14" }}>УСПЕШНО!</h2>
          <p className="text-sm mb-2" style={{ color: "rgba(180,220,215,0.6)" }}>Баланс пополнен на</p>
          <p className="font-display text-4xl mb-6" style={{ color: "#00f5d4" }}>{amount} ₽</p>
          <p className="text-sm mb-8" style={{ color: "rgba(180,220,215,0.4)" }}>Новый баланс: {user.balance.toFixed(2)} ₽</p>
          <div className="flex gap-3">
            <button onClick={() => navigate("home")} className="flex-1 py-3 rounded-xl font-bold btn-neon-fill">
              Играть
            </button>
            <button onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl font-bold btn-neon-cyan">
              Ещё раз
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="card-neon rounded-2xl p-6 animate-scale-in">
          <h2 className="font-display text-xl text-center mb-6" style={{ color: "#00f5d4" }}>ПОДТВЕРЖДЕНИЕ</h2>
          <div className="flex flex-col gap-3 mb-6">
            {[
              { label: "Способ оплаты", value: selectedMethod.label },
              { label: "Номер телефона", value: phone },
              { label: "Сумма", value: `${amount} ₽` },
              { label: "Зачисление на баланс", value: `${amount} ₽` },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
                <span className="text-sm" style={{ color: "rgba(180,220,215,0.5)" }}>{row.label}</span>
                <span className="text-sm font-bold" style={{ color: "#00f5d4" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl font-bold btn-neon-cyan">
              Назад
            </button>
            <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl font-bold btn-neon-fill">
              Оплатить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-cyan"
          style={{ background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.4)" }}>
          <Icon name="Plus" size={20} style={{ color: "#00f5d4" }} />
        </div>
        <div>
          <h1 className="font-display text-2xl" style={{ color: "#00f5d4" }}>ПОПОЛНЕНИЕ</h1>
          <p className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Мин: {MIN_DEPOSIT} ₽ · Макс: {MAX_DEPOSIT.toLocaleString()} ₽</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Баланс</div>
          <div className="font-bold" style={{ color: "#00f5d4" }}>{user.balance.toFixed(2)} ₽</div>
        </div>
      </div>

      {/* Method */}
      <div className="card-neon rounded-2xl p-5 mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <label className="text-xs mb-3 block" style={{ color: "rgba(180,220,215,0.6)" }}>Способ оплаты</label>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className="flex items-center gap-3 p-3 rounded-xl transition-all text-left"
              style={method === m.id ? { background: `${m.color}18`, border: `1px solid ${m.color}50`, color: m.color }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(180,220,215,0.6)" }}>
              <Icon name={m.icon} size={18} />
              <div>
                <div className="text-sm font-bold">{m.label}</div>
                <div className="text-xs opacity-60">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="card-neon rounded-2xl p-5 mb-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Сумма пополнения (₽)</label>
        <input type="number" min={MIN_DEPOSIT} max={MAX_DEPOSIT} value={amount}
          onChange={e => setAmount(Math.min(MAX_DEPOSIT, Math.max(MIN_DEPOSIT, parseInt(e.target.value) || MIN_DEPOSIT)))}
          className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none mb-3"
          style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4" }} />
        <div className="flex gap-2">
          {[100, 300, 500, 1000, 2000, 5000].map(v => (
            <button key={v} onClick={() => setAmount(v)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={amount === v ? { background: "rgba(0,245,212,0.2)", color: "#00f5d4", border: "1px solid rgba(0,245,212,0.5)" }
                : { background: "rgba(0,245,212,0.06)", color: "rgba(180,220,215,0.6)", border: "1px solid rgba(0,245,212,0.12)" }}>
              {v >= 1000 ? (v / 1000) + "K" : v}
            </button>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div className="card-neon rounded-2xl p-5 mb-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Номер телефона</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="+7 (___) ___-__-__"
          className="w-full rounded-xl px-4 py-3 outline-none"
          style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.3)", color: "#fff" }} />
      </div>

      <button onClick={handleSubmit} disabled={amount < MIN_DEPOSIT || !phone}
        className="w-full py-4 rounded-xl font-display text-lg btn-neon-fill disabled:opacity-40 disabled:cursor-not-allowed animate-fade-in"
        style={{ animationDelay: "0.25s" }}>
        ПОПОЛНИТЬ НА {amount} ₽
      </button>

      <p className="text-center text-xs mt-3" style={{ color: "rgba(180,220,215,0.35)" }}>
        Средства зачисляются мгновенно после подтверждения оплаты
      </p>
    </div>
  );
}