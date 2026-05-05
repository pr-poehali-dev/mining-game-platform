import os
import json
import secrets
import hashlib
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p72360393_mining_game_platform")


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def handler(event: dict, context) -> dict:
    """Auth API: регистрация и вход по логину/паролю, профиль, баланс, история."""

    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    method = event.get("httpMethod", "GET")
    token = (event.get("headers") or {}).get("X-Auth-Token") or (event.get("headers") or {}).get("x-auth-token")

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    qs = event.get("queryStringParameters") or {}
    action = body.get("action") or qs.get("action") or ""

    def get_user_row(cur):
        if not token:
            return None
        cur.execute(
            f"SELECT u.id, u.balance FROM {SCHEMA}.sessions s "
            f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        return cur.fetchone()

    # GET без action — профиль
    if method == "GET" and not action:
        if not token:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "no token"})}
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT u.id, u.login, u.name, u.balance "
            f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "invalid token"})}
        return {"statusCode": 200, "headers": cors, "body": json.dumps({
            "id": row[0], "tg_id": 0, "name": row[2], "tg_username": row[1], "balance": float(row[3])
        })}

    # POST action=register
    if action == "register":
        login = body.get("login", "").strip().lower()
        password = body.get("password", "").strip()
        name = body.get("name", "").strip()
        if not login or not password or not name:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Заполните все поля"})}
        if len(login) < 3:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Логин минимум 3 символа"})}
        if len(password) < 6:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Пароль минимум 6 символов"})}
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE login = %s", (login,))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Логин уже занят"})}
        pw_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (tg_id, name, login, password_hash) "
            f"VALUES (%s, %s, %s, %s) RETURNING id, balance",
            (0, name, login, pw_hash)
        )
        user_row = cur.fetchone()
        user_id, balance = user_row
        new_token = secrets.token_urlsafe(32)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, new_token))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({
            "token": new_token,
            "user": {"id": user_id, "tg_id": 0, "name": name, "tg_username": login, "balance": float(balance)}
        })}

    # POST action=login
    if action == "login":
        login = body.get("login", "").strip().lower()
        password = body.get("password", "").strip()
        if not login or not password:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Введите логин и пароль"})}
        conn = get_db()
        cur = conn.cursor()
        pw_hash = hash_password(password)
        cur.execute(
            f"SELECT id, name, balance FROM {SCHEMA}.users WHERE login = %s AND password_hash = %s",
            (login, pw_hash)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Неверный логин или пароль"})}
        user_id, name, balance = row
        new_token = secrets.token_urlsafe(32)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, new_token))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({
            "token": new_token,
            "user": {"id": user_id, "tg_id": 0, "name": name, "tg_username": login, "balance": float(balance)}
        })}

    # GET action=history
    if action == "history" and method == "GET":
        if not token:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "no token"})}
        conn = get_db()
        cur = conn.cursor()
        row = get_user_row(cur)
        if not row:
            conn.close()
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "invalid token"})}
        user_id = row[0]
        cur.execute(
            f"SELECT id, type, label, amount, created_at FROM {SCHEMA}.game_history "
            f"WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
            (user_id,)
        )
        rows = cur.fetchall()
        conn.close()
        history = [{"id": r[0], "type": r[1], "label": r[2], "amount": float(r[3]),
                    "date": r[4].strftime("%d.%m.%Y %H:%M")} for r in rows]
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"history": history})}

    # POST action=balance
    if action == "balance":
        if not token:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "no token"})}
        delta = float(body.get("delta", 0))
        conn = get_db()
        cur = conn.cursor()
        row = get_user_row(cur)
        if not row:
            conn.close()
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "invalid token"})}
        user_id = row[0]
        cur.execute(
            f"UPDATE {SCHEMA}.users SET balance = GREATEST(0, balance + %s), updated_at = NOW() "
            f"WHERE id = %s RETURNING balance",
            (delta, user_id)
        )
        new_balance = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"balance": float(new_balance)})}

    # POST action=history
    if action == "history":
        if not token:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "no token"})}
        conn = get_db()
        cur = conn.cursor()
        row = get_user_row(cur)
        if not row:
            conn.close()
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "invalid token"})}
        user_id = row[0]
        cur.execute(
            f"INSERT INTO {SCHEMA}.game_history (user_id, type, label, amount) VALUES (%s, %s, %s, %s)",
            (user_id, body.get("type"), body.get("label"), float(body.get("amount", 0)))
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
