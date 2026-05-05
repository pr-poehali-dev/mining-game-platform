import os
import json
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p72360393_mining_game_platform")


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Auth API: верификация кода из Telegram, выдача токена, профиль, баланс, история."""

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

    # GET без action — вернуть профиль
    if method == "GET" and not action:
        if not token:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "no token"})}
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT u.id, u.tg_id, u.name, u.tg_username, u.balance "
            f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": cors, "body": json.dumps({"error": "invalid token"})}
        return {"statusCode": 200, "headers": cors, "body": json.dumps({
            "id": row[0], "tg_id": row[1], "name": row[2], "tg_username": row[3], "balance": float(row[4])
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

    # POST action=verify
    if action == "verify":
        code = body.get("code", "").strip().upper()
        if not code:
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "no code"})}
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"SELECT tg_id, tg_username, tg_first_name FROM {SCHEMA}.tg_codes "
            f"WHERE code = %s AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            (code,)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "invalid or expired code"})}
        tg_id, tg_username, tg_first_name = row
        name = tg_first_name or tg_username or f"Игрок_{str(tg_id)[-4:]}"
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (tg_id, tg_username, tg_first_name, name) VALUES (%s, %s, %s, %s) "
            f"ON CONFLICT (tg_id) DO UPDATE SET tg_username = EXCLUDED.tg_username, "
            f"tg_first_name = EXCLUDED.tg_first_name, updated_at = NOW() RETURNING id, name, balance",
            (tg_id, tg_username, tg_first_name, name)
        )
        user_row = cur.fetchone()
        user_id, user_name, balance = user_row
        new_token = secrets.token_urlsafe(32)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, new_token))
        cur.execute(f"UPDATE {SCHEMA}.tg_codes SET expires_at = NOW() WHERE code = %s", (code,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": cors, "body": json.dumps({
            "token": new_token,
            "user": {"id": user_id, "tg_id": tg_id, "name": user_name, "tg_username": tg_username, "balance": float(balance)}
        })}

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
