# Быстрое развертывание TermoStick (5 минут)

Это краткое руководство для быстрого развертывания приложения на VPS.

## Предварительные требования

- VPS с Ubuntu 20.04+
- SSH доступ
- Домен (например, termostick.uz)

## Шаг 1: Подключитесь к серверу

```bash
ssh root@ваш_ip
```

## Шаг 2: Установите зависимости (одной командой)

```bash
sudo apt update && sudo apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git && \
sudo npm install -g pnpm
```

## Шаг 3: Загрузите проект

### Вариант A: Через Git

```bash
cd /var/www && \
sudo mkdir -p termostick && \
sudo chown -R $USER:$USER termostick && \
cd termostick && \
git clone https://github.com/ваш-username/termostick.git .
```

### Вариант B: Загрузите файлы вручную

На вашем компьютере:
```bash
cd /workspace/shadcn-ui
tar -czf termostick.tar.gz .
scp termostick.tar.gz username@ваш_ip:/tmp/
```

На сервере:
```bash
sudo mkdir -p /var/www/termostick
cd /var/www/termostick
sudo tar -xzf /tmp/termostick.tar.gz
sudo chown -R $USER:$USER /var/www/termostick
```

## Шаг 4: Соберите проект

```bash
cd /var/www/termostick
pnpm install
pnpm run build
```

## Шаг 5: Настройте Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/termostick
sudo ln -s /etc/nginx/sites-available/termostick /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Отредактируйте домен в конфигурации:
```bash
sudo nano /etc/nginx/sites-available/termostick
# Замените termostick.uz на ваш домен
```

Проверьте и перезапустите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Шаг 6: Настройте DNS

В панели управления доменом создайте A-записи:
```
@ -> ваш_ip
www -> ваш_ip
```

Подождите 5-30 минут.

## Шаг 7: Получите SSL сертификат

```bash
sudo certbot --nginx -d termostick.uz -d www.termostick.uz
```

Следуйте инструкциям certbot.

## Шаг 8: Готово! 🎉

Откройте браузер и перейдите на `https://termostick.uz`

---

## Обновление приложения

```bash
cd /var/www/termostick
./update.sh
```

Или вручную:
```bash
cd /var/www/termostick
git pull
pnpm install
pnpm run build
sudo systemctl reload nginx
```

---

## Решение проблем

### Nginx показывает 403 Forbidden
```bash
sudo chown -R www-data:www-data /var/www/termostick/dist
sudo chmod -R 755 /var/www/termostick/dist
```

### Страницы не загружаются (404)
Проверьте, что в nginx.conf есть:
```nginx
try_files $uri $uri/ /index.html;
```

### SSL не работает
```bash
sudo certbot renew --force-renewal
```

---

## Полное руководство

Смотрите `docs/deployment-guide.md` для подробной информации.