import os
import json
import random
import string
import psycopg2
import urllib.request

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p72360393_mining_game_platform")


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def tg_send(token: str, chat_id: int, text: str):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({"chat_id": chat_id, "text": text}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req)


def gen_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def handler(event: dict, context) -> dict:
    """Telegram webhook: принимает сообщения от бота, генерирует код входа и отправляет его пользователю."""

    cors = {"Access-Control-Allow-Origin": "*"}

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**cors, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}, "body": ""}

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    body = json.loads(event.get("body") or "{}")
    message = body.get("message") or body.get("edited_message")
    if not message:
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

    chat_id = message["chat"]["id"]
    text = message.get("text", "").strip()
    from_user = message.get("from", {})
    tg_id = from_user.get("id")
    tg_username = from_user.get("username")
    tg_first_name = from_user.get("first_name", "")

    if text.startswith("/start"):
        code = gen_code()
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.tg_codes (tg_id, tg_username, tg_first_name, code) VALUES (%s, %s, %s, %s)",
            (tg_id, tg_username, tg_first_name, code)
        )
        conn.commit()
        conn.close()

        reply = (
            f"Привет, {tg_first_name}!\n\n"
            f"Твой код для входа на NEON GAMES:\n\n"
            f"  {code}\n\n"
            f"Введи этот код на сайте. Код действует 10 минут."
        )
        tg_send(bot_token, chat_id, reply)

    elif text.startswith("/code"):
        # Повторная генерация кода
        code = gen_code()
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.tg_codes (tg_id, tg_username, tg_first_name, code) VALUES (%s, %s, %s, %s)",
            (tg_id, tg_username, tg_first_name, code)
        )
        conn.commit()
        conn.close()
        tg_send(bot_token, chat_id, f"Новый код для входа:\n\n  {code}\n\nДействует 10 минут.")

    else:
        tg_send(bot_token, chat_id,
                "Отправь /start чтобы получить код для входа на сайт.\nОтправь /code чтобы получить новый код.")

    return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}
