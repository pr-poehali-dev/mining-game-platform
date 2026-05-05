import os
import json
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    """Отправляет уведомление администратору в Telegram о новой заявке на вывод или пополнение."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    action_type = body.get('type', '')  # 'withdraw' или 'deposit'
    user = body.get('user', 'Неизвестен')
    amount = body.get('amount', 0)
    method = body.get('method', '')
    phone = body.get('phone', '')
    extra = body.get('extra', '')  # имя получателя для вывода

    bot_token = os.environ['TELEGRAM_BOT_TOKEN']
    chat_id = os.environ['TELEGRAM_ADMIN_CHAT_ID']

    if action_type == 'withdraw':
        emoji = '💸'
        title = 'ЗАЯВКА НА ВЫВОД'
        details = (
            f"👤 Игрок: {user}\n"
            f"💰 Сумма: {amount} ₽\n"
            f"🏦 Банк СБП: {method}\n"
            f"📱 Телефон: {phone}\n"
            f"👤 Получатель: {extra}"
        )
    elif action_type == 'deposit':
        emoji = '💳'
        title = 'ЗАЯВКА НА ПОПОЛНЕНИЕ'
        details = (
            f"👤 Игрок: {user}\n"
            f"💰 Сумма: {amount} ₽\n"
            f"📱 Оператор: {method}\n"
            f"☎️ Телефон: {phone}"
        )
    else:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unknown type'})
        }

    text = f"{emoji} *{title}*\n\n{details}"

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({
        'chat_id': chat_id,
        'text': text,
    }).encode('utf-8')

    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'ok': False, 'tg_error': error_body})
        }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'message_id': result.get('result', {}).get('message_id')})
    }