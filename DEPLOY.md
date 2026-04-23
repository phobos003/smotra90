# Deployment — смотровая 90

Пошагово, чтобы запустить оплату, билеты и сканер на VPS.

## 1. Postgres на VPS

SSH на сервер:

```bash
ssh root@89.111.143.103
```

Поставить Docker (если нет):

```bash
docker --version || curl -fsSL https://get.docker.com | sh
```

Запустить Postgres. **Замени `STRONG_PASSWORD`** на свой надёжный пароль и сохрани его:

```bash
docker run -d \
  --name smotra-postgres \
  --restart always \
  -e POSTGRES_USER=smotra \
  -e POSTGRES_PASSWORD=STRONG_PASSWORD \
  -e POSTGRES_DB=smotra \
  -p 127.0.0.1:5432:5432 \
  -v /var/lib/smotra-postgres:/var/lib/postgresql/data \
  postgres:16
```

Проверка:

```bash
docker ps
docker exec -it smotra-postgres psql -U smotra -d smotra -c "SELECT version();"
```

## 2. .env на VPS

В `/var/www/smotra90/.env` положить (через `nano .env`):

```env
DATABASE_URL="postgresql://smotra:STRONG_PASSWORD@localhost:5432/smotra?schema=public"

YOOKASSA_SHOP_ID="ваш_test_shop_id"
YOOKASSA_SECRET_KEY="ваш_test_secret_key"

SMTP_HOST="smtp.mail.ru"
SMTP_PORT="465"
SMTP_USER="info@visota90.ru"
SMTP_PASSWORD="пароль_от_ящика"
SMTP_FROM="Высота 90 <info@visota90.ru>"

ADMIN_PASSWORD="длинный_пароль_для_админки"
ADMIN_COOKIE_SECRET="32+_символьная_случайная_строка"

NEXT_PUBLIC_SITE_URL="https://visota90.ru"
```

Для `ADMIN_COOKIE_SECRET` сгенерируй: `openssl rand -hex 32`.

## 3. Миграция БД и деплой

```bash
cd /var/www/smotra90
git pull
npm ci
npx prisma migrate deploy
npm run build
npx pm2 restart visota
```

Первый раз (создать миграцию) — локально на твоём ноуте:

```bash
# Локально
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "Initial Prisma migration"
git push
```

Потом на VPS `prisma migrate deploy` применит её.

## 4. Nginx — пропускает webhook

Нужно, чтобы `POST /api/webhook/yookassa` проходил без токенов/редиректов. Обычно Next за nginx-proxy работает из коробки. Проверь, что в `/etc/nginx/sites-enabled/visota90` есть:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
}
```

## 5. Webhook в ЮKassa

В личном кабинете ЮKassa → **Интеграция → HTTP-уведомления**:

- URL: `https://visota90.ru/api/webhook/yookassa`
- События: `payment.succeeded`, `payment.canceled`

Сначала настрой в **тестовом магазине**, потом в боевом.

## 6. DBeaver с твоего ноута

Порт 5432 наружу не торчит — подключаемся через SSH-туннель:

1. New Connection → **PostgreSQL**
2. Main:
   - Host: `localhost`
   - Port: `5432`
   - Database: `smotra`
   - Username: `smotra`
   - Password: `STRONG_PASSWORD`
3. SSH:
   - Use SSH tunnel ✅
   - Host: `89.111.143.103`
   - User: `root`
   - Auth: свой ключ/пароль
4. Test → OK

## 7. Первый раз

1. Зайди на `https://visota90.ru/admin/login` → пароль из `ADMIN_PASSWORD`
2. Вкладка **Даты** → добавь несколько дат и укажи лимит
3. На главной нажми «Купить» → выбери дату → введи email → оплати тестовой картой `1111 1111 1111 1026` (ЮKassa test)
4. После успешной оплаты письмо упадёт на почту, откроется страница билета с QR
5. Вкладка **Сканер** → сканируй QR с телефона → «Пропустить»

## 8. Переход в прод-режим ЮKassa

1. В ЮKassa создай/получи **боевой магазин**
2. Замени `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` в `.env` на боевые
3. В ЮKassa добавь URL webhook для **боевого** магазина тоже
4. Перезапусти: `pm2 restart visota`

## Полный релиз-команда (после всего выше)

```bash
ssh root@89.111.143.103 "cd /var/www/smotra90 && git pull && NODE_ENV=production npm ci && npx prisma migrate deploy && npm run build && npx pm2 restart visota"
```
