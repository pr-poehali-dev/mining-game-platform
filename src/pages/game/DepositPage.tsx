import { useState } from "react";
import { Page, UserState, HistoryItem } from "../Index";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const NOTIFY_URL = func2url["notify-telegram"];
const ADMIN_PHONE = "7 (962) 903-15-56";
const MIN_DEPOSIT = 100;
const MAX_DEPOSIT = 15000;

interface DepositProps {
  user: UserState;
  updateBalance: (delta: number) => void;
  addHistory: (item: Omit<HistoryItem, "id">) => void;
  navigate: (p: Page) => void;
}

export default function DepositPage({ user, updateBalance, addHistory, navigate }: DepositProps) {
  const [amount, setAmount] = useState(500);
  const [step, setStep] = useState<"amount" | "pay" | "pending">("amount");
  const [copied, setCopied] = useState(false);

  const now = () => new Date().toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const copyPhone = () => {
    navigator.clipboard.writeText(ADMIN_PHONE.replace(/\s|\(|\)|-/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaid = async () => {
    addHistory({ type: "deposit", label: `Заявка на пополнение`, amount, date: now() });
    setStep("pending");
    fetch(NOTIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "deposit",
        user: user.name,
        amount,
        method: "Мобильная связь",
        phone: ADMIN_PHONE,
      }),
    }).catch(() => {});
  };

  // Шаг 1 — выбор суммы
  if (step === "amount") {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-cyan"
            style={{ background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.4)" }}>
            <Icon name="Plus" size={20} style={{ color: "#00f5d4" }} />
          </div>
          <div>
            <h1 className="font-display text-2xl" style={{ color: "#00f5d4" }}>ПОПОЛНЕНИЕ</h1>
            <p className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>
              Мин: {MIN_DEPOSIT} ₽ · Макс: {MAX_DEPOSIT.toLocaleString()} ₽
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs" style={{ color: "rgba(180,220,215,0.5)" }}>Баланс</div>
            <div className="font-bold" style={{ color: "#00f5d4" }}>{user.balance.toFixed(2)} ₽</div>
          </div>
        </div>

        <div className="card-neon rounded-2xl p-6 mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <label className="text-xs mb-3 block" style={{ color: "rgba(180,220,215,0.6)" }}>
            Выберите сумму пополнения
          </label>

          {/* Быстрый выбор */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000].map(v => (
              <button key={v} onClick={() => setAmount(v)}
                className="py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                style={amount === v
                  ? { background: "rgba(0,245,212,0.2)", color: "#00f5d4", border: "1px solid rgba(0,245,212,0.6)", boxShadow: "0 0 12px rgba(0,245,212,0.2)" }
                  : { background: "rgba(0,245,212,0.05)", color: "rgba(180,220,215,0.7)", border: "1px solid rgba(0,245,212,0.12)" }}>
                {v >= 1000 ? (v / 1000) + " 000" : v} ₽
              </button>
            ))}
          </div>

          {/* Ввод вручную */}
          <label className="text-xs mb-2 block" style={{ color: "rgba(180,220,215,0.5)" }}>
            Или введите сумму вручную
          </label>
          <input
            type="number" min={MIN_DEPOSIT} max={MAX_DEPOSIT} value={amount}
            onChange={e => setAmount(Math.min(MAX_DEPOSIT, Math.max(MIN_DEPOSIT, parseInt(e.target.value) || MIN_DEPOSIT)))}
            className="w-full rounded-xl px-4 py-3 text-lg font-bold outline-none"
            style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.25)", color: "#00f5d4" }}
          />
        </div>

        <button
          onClick={() => setStep("pay")}
          disabled={amount < MIN_DEPOSIT || amount > MAX_DEPOSIT}
          className="w-full py-4 rounded-xl font-display text-lg btn-neon-fill disabled:opacity-40 animate-fade-in"
          style={{ animationDelay: "0.2s" }}>
          ДАЛЕЕ — {amount.toLocaleString()} ₽
        </button>
      </div>
    );
  }

  // Шаг 2 — реквизиты и оплата
  if (step === "pay") {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <button onClick={() => setStep("amount")} className="flex items-center gap-2 mb-6 text-sm transition-all hover:opacity-70"
          style={{ color: "rgba(180,220,215,0.5)" }}>
          <Icon name="ArrowLeft" size={16} /> Назад
        </button>

        <div className="text-center mb-6 animate-fade-in">
          <div className="font-display text-4xl mb-1" style={{ color: "#00f5d4", textShadow: "0 0 20px rgba(0,245,212,0.4)" }}>
            {amount.toLocaleString()} ₽
          </div>
          <div className="text-sm" style={{ color: "rgba(180,220,215,0.5)" }}>к оплате мобильной связью</div>
        </div>

        {/* Реквизит */}
        <div className="rounded-2xl p-6 mb-5 animate-fade-in" style={{ animationDelay: "0.1s", background: "rgba(0,245,212,0.06)", border: "2px solid rgba(0,245,212,0.3)" }}>
          <div className="text-xs mb-3 text-center" style={{ color: "rgba(180,220,215,0.5)" }}>
            Отправьте {amount.toLocaleString()} ₽ на номер мобильной связи
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl mb-4"
            style={{ background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.4)" }}>
            <div>
              <div className="text-xs mb-1" style={{ color: "rgba(180,220,215,0.5)" }}>Номер телефона</div>
              <div className="font-display text-2xl" style={{ color: "#00f5d4", letterSpacing: "0.05em" }}>
                +{ADMIN_PHONE}
              </div>
            </div>
            <button onClick={copyPhone}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={copied
                ? { background: "rgba(57,255,20,0.2)", color: "#39ff14", border: "1px solid rgba(57,255,20,0.5)" }
                : { background: "rgba(0,245,212,0.12)", color: "#00f5d4", border: "1px solid rgba(0,245,212,0.3)" }}>
              <Icon name={copied ? "Check" : "Copy"} size={14} />
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>

          {/* Инструкция */}
          <div className="flex flex-col gap-2.5">
            {[
              { n: 1, text: "Перейдите в приложение своего оператора" },
              { n: 2, text: `Отправьте ${amount.toLocaleString()} ₽ на номер +${ADMIN_PHONE}` },
              { n: 3, text: "Нажмите кнопку «Я перевёл» ниже" },
              { n: 4, text: "Ожидайте зачисления — обычно до 15 минут" },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                  style={{ background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4" }}>
                  {item.n}
                </div>
                <span className="text-sm" style={{ color: "rgba(180,220,215,0.7)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handlePaid}
          className="w-full py-4 rounded-xl font-display text-lg btn-neon-fill mb-3 animate-fade-in"
          style={{ animationDelay: "0.25s" }}>
          ✅ Я ПЕРЕВЁЛ {amount.toLocaleString()} ₽
        </button>

        <p className="text-center text-xs" style={{ color: "rgba(180,220,215,0.3)" }}>
          После нажатия администратор получит уведомление и зачислит средства
        </p>
      </div>
    );
  }

  // Шаг 3 — ожидание подтверждения
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="animate-scale-in">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-neon"
          style={{ background: "rgba(255,107,0,0.15)", border: "2px solid rgba(255,107,0,0.5)" }}>
          <Icon name="Clock" size={38} style={{ color: "#ff6b00" }} />
        </div>
        <h2 className="font-display text-3xl mb-2" style={{ color: "#ff6b00" }}>ЗАЯВКА ПРИНЯТА</h2>
        <p className="text-sm mb-2" style={{ color: "rgba(180,220,215,0.6)" }}>Ожидайте зачисления</p>
        <p className="font-display text-4xl mb-4" style={{ color: "#00f5d4" }}>{amount.toLocaleString()} ₽</p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse-neon" style={{ background: "#ff6b00" }} />
          <span className="text-sm" style={{ color: "#ff6b00" }}>Обычно до 15 минут</span>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate("home")} className="flex-1 py-3 rounded-xl font-bold btn-neon-fill">
            На главную
          </button>
          <button onClick={() => { setStep("amount"); }}
            className="flex-1 py-3 rounded-xl font-bold btn-neon-cyan">
            Ещё пополнить
          </button>
        </div>
      </div>
    </div>
  );
}
