import { useState } from "react";
import { Page, UserState, HistoryItem } from "../Index";
import Icon from "@/components/ui/icon";

interface WithdrawProps {
  user: UserState;
  updateBalance: (delta: number) => void;
  addHistory: (item: Omit<HistoryItem, "id">) => void;
  navigate: (p: Page) => void;
}

const MIN_WITHDRAW = 300;
const MAX_WITHDRAW_DAY = 50000;

const BANKS = [
  { id: "sber", label: "Сбербанк", color: "#39ff14" },
  { id: "tinkoff", label: "Т-Банк", color: "#ff6b00" },
  { id: "alpha", label: "Альфа-Банк", color: "#ff1744" },
  { id: "vtb", label: "ВТБ", color: "#00aaff" },
  { id: "other", label: "Другой", color: "#bf00ff" },
];

export default function WithdrawPage({ user, updateBalance, addHistory, navigate }: WithdrawProps) {
  const [amount, setAmount] = useState(500);
  const [bank, setBank] = useState("sber");
  const [phone, setPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const now = () => new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const selectedBank = BANKS.find(b => b.id === bank)!;
  const canWithdraw = user.balance >= MIN_WITHDRAW;

  const handleSubmit = () => {
    if (amount < MIN_WITHDRAW || amount > user.balance || amount > MAX_WITHDRAW_DAY || !phone || !cardName) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    updateBalance(-amount);
    addHistory({ type: "withdraw", label: `Вывод СБП ${selectedBank.label}`, amount: -amount, date: now() });
    setStep("success");
  };

  if (!canWithdraw) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="card-neon rounded-2xl p-8 animate-fade-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(255,23,68,0.15)", border: "1px solid rgba(255,23,68,0.4)" }}>
            <Icon name="AlertCircle" size={32} style={{ color: "#ff1744" }} />
          </div>
          <h2 className="font-display text-xl mb-2" style={{ color: "#ff1744" }}>НЕДОСТАТОЧНО СРЕДСТВ</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(180,220,215,0.5)" }}>
            Минимальная сумма вывода — {MIN_WITHDRAW} ₽.<br />
            Ваш баланс: {user.balance.toFixed(2)} ₽
          </p>
          <button onClick={() => navigate("deposit")} className="w-full py-3 rounded-xl font-bold btn-neon-fill">
            Пополнить баланс
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="animate-scale-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.5)" }}>
            <Icon name="CheckCircle" size={40} style={{ color: "#39ff14" }} />
          </div>
          <h2 className="font-display text-3xl mb-2" style={{ color: "#39ff14" }}>ЗАЯВКА ПРИНЯТА</h2>
          <p className="text-sm mb-2" style={{ color: "rgba(180,220,215,0.6)" }}>Выводим на {selectedBank.label}</p>
          <p className="font-display text-4xl mb-3" style={{ color: "#00f5d4" }}>{amount} ₽</p>
          <p className="text-sm mb-8" style={{ color: "rgba(180,220,215,0.4)" }}>Обработка: до 24 часов · Оставшийся баланс: {user.balance.toFixed(2)} ₽</p>
          <div className="flex gap-3">
            <button onClick={() => navigate("home")} className="flex-1 py-3 rounded-xl font-bold btn-neon-fill">
              На главную
            </button>
            <button onClick={() => navigate("profile")} className="flex-1 py-3 rounded-xl font-bold btn-neon-cyan">
              Профиль
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
              { label: "Банк (СБП)", value: selectedBank.label },
              { label: "Телефон СБП", value: phone },
              { label: "Получатель", value: cardName },
              { label: "Сумма вывода", value: `${amount} ₽` },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2.5" style={{ borderBottom: "1px solid rgba(0,245,212,0.1)" }}>
                <span className="text-sm" style={{ color: "rgba(180,220,215,0.5)" }}>{row.label}</span>
                <span className="text-sm font-bold" style={{ color: "#00f5d4" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mb-5" style={{ color: "rgba(180,220,215,0.4)" }}>
            Средства поступят в течение 24 часов. Дневной лимит вывода: {MAX_WITHDRAW_DAY.toLocaleString()} ₽
          </p>
          <div className="flex gap-3">
            <button onClick={() => setStep("form")} className="flex-1 py-3 rounded-xl font-bold btn-neon-cyan">
              Назад
            </button>
            <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl font-bold btn-neon-fill">
              Подтвердить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(57,255,20,0.15)", border: "1px solid rgba(57,255,20,0.4)" }}>
          <Icon name="ArrowDownToLine" size={20} style={{ color: "#39ff14" }} />
        </div>
        <div>
          <h1 className="font-display text-2xl" style={{ color: "#39ff14" }}>ВЫВОД СРЕДСТВ</h1>
          <p className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Мин: {MIN_WITHDRAW} ₽ · Лимит/день: {MAX_WITHDRAW_DAY.toLocaleString()} ₽</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Баланс</div>
          <div className="font-bold" style={{ color: "#00f5d4" }}>{user.balance.toFixed(2)} ₽</div>
        </div>
      </div>

      {/* Bank */}
      <div className="card-neon rounded-2xl p-5 mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <label className="text-xs mb-3 block" style={{ color: "rgba(180,220,215,0.6)" }}>Банк для перевода СБП</label>
        <div className="flex flex-wrap gap-2">
          {BANKS.map(b => (
            <button key={b.id} onClick={() => setBank(b.id)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={bank === b.id ? { background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}50` }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(180,220,215,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="card-neon rounded-2xl p-5 mb-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Сумма вывода (₽)</label>
        <input type="number" min={MIN_WITHDRAW} max={Math.min(user.balance, MAX_WITHDRAW_DAY)} value={amount}
          onChange={e => setAmount(Math.min(user.balance, MAX_WITHDRAW_DAY, Math.max(MIN_WITHDRAW, parseInt(e.target.value) || MIN_WITHDRAW)))}
          className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none mb-3"
          style={{ background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.3)", color: "#39ff14" }} />
        <div className="flex gap-2">
          {[300, 500, 1000, 2000].filter(v => v <= user.balance).map(v => (
            <button key={v} onClick={() => setAmount(v)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={amount === v ? { background: "rgba(57,255,20,0.2)", color: "#39ff14", border: "1px solid rgba(57,255,20,0.5)" }
                : { background: "rgba(57,255,20,0.06)", color: "rgba(180,220,215,0.6)", border: "1px solid rgba(57,255,20,0.12)" }}>
              {v}
            </button>
          ))}
          <button onClick={() => setAmount(Math.min(user.balance, MAX_WITHDRAW_DAY))}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: "rgba(57,255,20,0.06)", color: "rgba(180,220,215,0.6)", border: "1px solid rgba(57,255,20,0.12)" }}>
            Макс
          </button>
        </div>
      </div>

      {/* Phone */}
      <div className="card-neon rounded-2xl p-5 mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Телефон для СБП</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="+7 (___) ___-__-__"
          className="w-full rounded-xl px-4 py-3 outline-none mb-3"
          style={{ background: "rgba(57,255,20,0.06)", border: "1px solid rgba(57,255,20,0.25)", color: "#fff" }} />
        <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.6)" }}>Имя получателя (как в банке)</label>
        <input type="text" value={cardName} onChange={e => setCardName(e.target.value)}
          placeholder="Иван И."
          className="w-full rounded-xl px-4 py-3 outline-none"
          style={{ background: "rgba(57,255,20,0.06)", border: "1px solid rgba(57,255,20,0.25)", color: "#fff" }} />
      </div>

      <button onClick={handleSubmit} disabled={amount < MIN_WITHDRAW || amount > user.balance || !phone || !cardName}
        className="w-full py-4 rounded-xl font-display text-lg btn-neon-fill disabled:opacity-40 disabled:cursor-not-allowed animate-fade-in"
        style={{ animationDelay: "0.25s" }}>
        ВЫВЕСТИ {amount} ₽
      </button>

      <p className="text-center text-xs mt-3" style={{ color: "rgba(180,220,215,0.35)" }}>
        Обработка до 24 часов · Дневной лимит {MAX_WITHDRAW_DAY.toLocaleString()} ₽
      </p>
    </div>
  );
}
