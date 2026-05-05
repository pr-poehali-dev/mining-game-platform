import { useState } from "react";
import Icon from "@/components/ui/icon";
import { loginUser, registerUser } from "@/lib/api";
import type { UserProfile } from "@/lib/api";

interface LoginPageProps {
  onLogin: (user: UserProfile, token: string) => void;
}

type Mode = "login" | "register";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const result = mode === "login"
        ? await loginUser(login.trim(), password)
        : await registerUser(login.trim(), password, name.trim());
      onLogin(result.user, result.token);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setLogin("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.2), rgba(0,245,212,0.05))", border: "1px solid rgba(0,245,212,0.5)" }}
          >
            <span className="font-display text-3xl" style={{ color: "#00f5d4" }}>NG</span>
          </div>
          <h1 className="font-display text-4xl mb-1">
            <span style={{ color: "#00f5d4", textShadow: "0 0 20px rgba(0,245,212,0.5)" }}>NEON</span>
            <span style={{ color: "#bf00ff", textShadow: "0 0 20px rgba(191,0,255,0.5)" }}>GAMES</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(180,220,215,0.5)" }}>Игровая платформа</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: "1px solid rgba(0,245,212,0.2)", background: "rgba(0,245,212,0.04)" }}>
          {(["login", "register"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-2.5 text-sm font-display transition-all"
              style={{
                background: mode === m ? "rgba(0,245,212,0.15)" : "transparent",
                color: mode === m ? "#00f5d4" : "rgba(180,220,215,0.4)",
                borderBottom: mode === m ? "2px solid #00f5d4" : "2px solid transparent",
              }}
            >
              {m === "login" ? "ВХОД" : "РЕГИСТРАЦИЯ"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="card-neon rounded-2xl p-6 flex flex-col gap-4">

          {mode === "register" && (
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "rgba(180,220,215,0.5)" }}>Имя</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Как тебя зовут?"
                className="w-full rounded-xl px-4 py-3 outline-none text-sm"
                style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", color: "rgba(180,220,215,0.9)" }}
              />
            </div>
          )}

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "rgba(180,220,215,0.5)" }}>Логин</label>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              placeholder="Введи логин"
              autoComplete="username"
              className="w-full rounded-xl px-4 py-3 outline-none text-sm"
              style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", color: "rgba(180,220,215,0.9)" }}
            />
          </div>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: "rgba(180,220,215,0.5)" }}>Пароль</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={mode === "register" ? "Минимум 6 символов" : "Введи пароль"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="w-full rounded-xl px-4 py-3 pr-11 outline-none text-sm"
                style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.2)", color: "rgba(180,220,215,0.9)" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "rgba(0,245,212,0.4)" }}
              >
                <Icon name={showPass ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm animate-scale-in"
              style={{ background: "rgba(255,23,68,0.1)", border: "1px solid rgba(255,23,68,0.3)", color: "#ff1744" }}
            >
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !login || !password || (mode === "register" && !name)}
            className="w-full py-3.5 rounded-xl font-display text-base btn-neon-fill disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Icon name="Loader" size={16} className="animate-spin" />
                {mode === "login" ? "Входим..." : "Регистрируем..."}
              </span>
            ) : mode === "login" ? "ВОЙТИ" : "СОЗДАТЬ АККАУНТ"}
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "rgba(180,220,215,0.3)" }}>
          {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="underline transition-opacity hover:opacity-70"
            style={{ color: "rgba(0,245,212,0.6)" }}
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>

      </div>
    </div>
  );
}
