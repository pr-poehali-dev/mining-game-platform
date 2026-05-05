import Icon from "@/components/ui/icon";

const TG_SUPPORT = "https://t.me/neon_games_support";

export default function ContactsPage() {
  const faqs = [
    { q: "Как долго обрабатываются выплаты?", a: "Вывод средств обрабатывается в течение 24 часов. В большинстве случаев — до 2 часов." },
    { q: "Какая минимальная сумма вывода?", a: "Минимальная сумма вывода — 300 ₽. Максимальный дневной лимит вывода — 50 000 ₽." },
    { q: "Есть ли бонус за первое пополнение?", a: "Да! Первое пополнение от 500 ₽ даёт +50% к сумме пополнения." },
    { q: "Что делать если игра зависла?", a: "Обновите страницу. Если проблема не решилась — напишите в поддержку с описанием ситуации." },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)" }}>
          <Icon name="MessageCircle" size={20} style={{ color: "#ff6b00" }} />
        </div>
        <h1 className="font-display text-2xl" style={{ color: "#ff6b00" }}>ПОДДЕРЖКА</h1>
      </div>

      {/* Support channels */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <a href={TG_SUPPORT} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:scale-[1.02]"
          style={{ background: "rgba(0,150,255,0.08)", border: "1px solid rgba(0,150,255,0.25)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,150,255,0.15)", border: "1px solid rgba(0,150,255,0.3)" }}>
            <Icon name="Send" size={22} style={{ color: "#00aaff" }} />
          </div>
          <div>
            <div className="font-bold" style={{ color: "#00aaff" }}>Telegram</div>
            <div className="text-sm" style={{ color: "rgba(180,220,215,0.6)" }}>Ответим за 15 минут</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "#39ff14" }} />
              <span className="text-xs" style={{ color: "#39ff14" }}>Онлайн 24/7</span>
            </div>
          </div>
        </a>

        <div className="flex items-center gap-4 p-5 rounded-2xl"
          style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.25)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)" }}>
            <Icon name="Clock" size={22} style={{ color: "#ff6b00" }} />
          </div>
          <div>
            <div className="font-bold" style={{ color: "#ff6b00" }}>Время работы</div>
            <div className="text-sm" style={{ color: "rgba(180,220,215,0.6)" }}>24 часа / 7 дней</div>
            <div className="text-xs mt-1" style={{ color: "rgba(180,220,215,0.4)" }}>Без выходных</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="font-display text-base mb-4" style={{ color: "rgba(180,220,215,0.7)" }}>ЧАСТЫЕ ВОПРОСЫ</h2>
      <div className="flex flex-col gap-3 mb-8">
        {faqs.map((item, i) => (
          <div key={i} className="card-neon rounded-2xl p-5 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)" }}>
                <span className="text-xs font-bold" style={{ color: "#ff6b00" }}>?</span>
              </div>
              <div>
                <div className="font-medium mb-2" style={{ color: "rgba(180,220,215,0.9)" }}>{item.q}</div>
                <div className="text-sm" style={{ color: "rgba(180,220,215,0.55)" }}>{item.a}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center p-6 rounded-2xl animate-fade-in"
        style={{ background: "rgba(0,150,255,0.06)", border: "1px solid rgba(0,150,255,0.2)", animationDelay: "0.4s" }}>
        <p className="text-sm mb-4" style={{ color: "rgba(180,220,215,0.6)" }}>Не нашли ответ на вопрос?</p>
        <a href={TG_SUPPORT} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #0088cc, #005f8f)", color: "#fff", boxShadow: "0 0 20px rgba(0,136,204,0.3)" }}>
          <Icon name="Send" size={16} />
          Написать в поддержку
        </a>
      </div>
    </div>
  );
}
