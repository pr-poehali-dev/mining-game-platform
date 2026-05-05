import os
import json
import urllib.request


def handler(event: dict, context) -> dict:
    """Регистрирует tg-webhook URL в Telegram через setWebhook."""

    cors = {"Access-Control-Allow-Origin": "*"}

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**cors, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}, "body": ""}

    bot_token = os.environ["TELEGRAM_BOT_TOKEN"]
    webhook_url = os.environ["TG_WEBHOOK_URL"]

    url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
    payload = json.dumps({"url": webhook_url}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
        return {"statusCode": 200, "headers": cors, "body": json.dumps(result)}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return {
            "statusCode": 200,
            "headers": cors,
            "body": json.dumps({"error": str(e), "detail": err_body, "token_preview": bot_token[:10] + "...", "webhook_url": webhook_url})
        }