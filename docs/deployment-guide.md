# Руководство по развертыванию TermoStick на VPS сервере

Это полное руководство по развертыванию веб-приложения TermoStick на VPS сервере с Ubuntu/Debian.

## Содержание

1. [Требования](#требования)
2. [Подготовка сервера](#подготовка-сервера)
3. [Установка зависимостей](#установка-зависимостей)
4. [Загрузка проекта](#загрузка-проекта)
5. [Сборка приложения](#сборка-приложения)
6. [Настройка Nginx](#настройка-nginx)
7. [Настройка SSL сертификата](#настройка-ssl-сертификата)
8. [Обновление приложения](#обновление-приложения)
9. [Решение проблем](#решение-проблем)

---

## Требования

- VPS сервер с Ubuntu 20.04+ или Debian 11+
- Минимум 1GB RAM
- Доменное имя (например, termostick.uz)
- SSH доступ к серверу
- Root или sudo права

---

## Подготовка сервера

### 1. Подключитесь к серверу через SSH

```bash
ssh root@ваш_ip_адрес
# или
ssh username@ваш_ip_адрес
```

### 2. Обновите систему

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Создайте пользователя для приложения (опционально)

```bash
sudo adduser termostick
sudo usermod -aG sudo termostick
su - termostick
```

---

## Установка зависимостей

### 1. Установите Node.js 20.x

```bash
# Установка Node.js через NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версии
node --version  # должно быть v20.x.x
npm --version
```

### 2. Установите pnpm

```bash
sudo npm install -g pnpm

# Проверка версии
pnpm --version
```

### 3. Установите Nginx

```bash
sudo apt install -y nginx

# Запустите и включите автозапуск
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверка статуса
sudo systemctl status nginx
```

### 4. Установите Certbot для SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Загрузка проекта

### Способ 1: Через Git (рекомендуется)

```bash
# Установите Git
sudo apt install -y git

# Клонируйте репозиторий (замените на ваш URL)
cd /var/www
sudo mkdir -p termostick
sudo chown -R $USER:$USER termostick
cd termostick

# Если у вас есть Git репозиторий:
git clone https://github.com/ваш-username/termostick.git .
```

### Способ 2: Через SCP/SFTP

На вашем локальном компьютере (в папке с проектом):

```bash
# Создайте архив проекта
cd /workspace/shadcn-ui
tar -czf termostick.tar.gz .

# Загрузите на сервер
scp termostick.tar.gz username@ваш_ip:/var/www/termostick/

# На сервере распакуйте
cd /var/www/termostick
tar -xzf termostick.tar.gz
rm termostick.tar.gz
```

### Способ 3: Через FileZilla или WinSCP

1. Откройте FileZilla/WinSCP
2. Подключитесь к серверу (Host: ваш_ip, Username, Password/Key)
3. Загрузите все файлы из `/workspace/shadcn-ui` в `/var/www/termostick/`

---

## Сборка приложения

### 1. Установите зависимости

```bash
cd /var/www/termostick
pnpm install
```

### 2. Соберите production версию

```bash
pnpm run build
```

После успешной сборки вы увидите папку `dist/` с готовыми файлами.

### 3. Проверьте содержимое dist

```bash
ls -la dist/
# Должны быть: index.html, assets/, favicon.svg, robots.txt
```

---

## Настройка Nginx

### 1. Создайте конфигурационный файл Nginx

```bash
sudo nano /etc/nginx/sites-available/termostick
```

Вставьте следующую конфигурацию (замените `termostick.uz` на ваш домен):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name termostick.uz www.termostick.uz;

    root /var/www/termostick/dist;
    index index.html;

    # Логи
    access_log /var/log/nginx/termostick-access.log;
    error_log /var/log/nginx/termostick-error.log;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Кэширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - все запросы перенаправляем на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 2. Активируйте конфигурацию

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/termostick /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию на ошибки
sudo nginx -t

# Перезапустите Nginx
sudo systemctl reload nginx
```

### 3. Настройте DNS

В панели управления вашего доменного провайдера создайте A-запись:

```
Type: A
Name: @
Value: ваш_ip_адрес
TTL: 3600

Type: A
Name: www
Value: ваш_ip_адрес
TTL: 3600
```

Подождите 5-30 минут для распространения DNS.

---

## Настройка SSL сертификата

### 1. Получите SSL сертификат от Let's Encrypt

```bash
sudo certbot --nginx -d termostick.uz -d www.termostick.uz
```

Следуйте инструкциям:
- Введите email для уведомлений
- Согласитесь с условиями (Y)
- Выберите опцию 2 (перенаправление HTTP на HTTPS)

### 2. Проверьте автообновление сертификата

```bash
sudo certbot renew --dry-run
```

Certbot автоматически настроит cron job для обновления сертификата.

### 3. Проверьте HTTPS

Откройте браузер и перейдите на `https://termostick.uz` - должен работать с зеленым замком.

---

## Обновление приложения

### Способ 1: Через Git

```bash
cd /var/www/termostick

# Получите последние изменения
git pull origin main

# Установите новые зависимости (если есть)
pnpm install

# Пересоберите проект
pnpm run build

# Перезапустите Nginx (опционально)
sudo systemctl reload nginx
```

### Способ 2: Ручная загрузка

```bash
# На локальном компьютере
cd /workspace/shadcn-ui
pnpm run build
tar -czf dist.tar.gz dist/

# Загрузите на сервер
scp dist.tar.gz username@ваш_ip:/var/www/termostick/

# На сервере
cd /var/www/termostick
rm -rf dist/
tar -xzf dist.tar.gz
rm dist.tar.gz

# Перезапустите Nginx
sudo systemctl reload nginx
```

### Скрипт автоматического обновления

Создайте файл `update.sh`:

```bash
nano /var/www/termostick/update.sh
```

Содержимое:

```bash
#!/bin/bash
cd /var/www/termostick
git pull origin main
pnpm install
pnpm run build
sudo systemctl reload nginx
echo "✅ Приложение обновлено успешно!"
```

Сделайте скрипт исполняемым:

```bash
chmod +x /var/www/termostick/update.sh
```

Теперь для обновления просто запускайте:

```bash
./update.sh
```

---

## Решение проблем

### Проблема: Nginx показывает "403 Forbidden"

**Решение:**
```bash
# Проверьте права доступа
sudo chown -R www-data:www-data /var/www/termostick/dist
sudo chmod -R 755 /var/www/termostick/dist
```

### Проблема: "502 Bad Gateway"

**Решение:**
```bash
# Проверьте логи Nginx
sudo tail -f /var/log/nginx/termostick-error.log

# Проверьте, что dist/ существует
ls -la /var/www/termostick/dist/
```

### Проблема: Страницы не загружаются (404 на роутах)

**Решение:** Убедитесь, что в конфигурации Nginx есть строка:
```nginx
try_files $uri $uri/ /index.html;
```

### Проблема: SSL сертификат не работает

**Решение:**
```bash
# Проверьте статус certbot
sudo certbot certificates

# Принудительно обновите сертификат
sudo certbot renew --force-renewal
```

### Проблема: Изменения не отображаются после обновления

**Решение:**
```bash
# Очистите кэш браузера или откройте в режиме инкогнито
# Проверьте, что файлы действительно обновились
ls -lt /var/www/termostick/dist/assets/

# Очистите кэш Nginx (если настроен)
sudo systemctl reload nginx
```

---

## Мониторинг и логи

### Просмотр логов Nginx

```bash
# Access логи
sudo tail -f /var/log/nginx/termostick-access.log

# Error логи
sudo tail -f /var/log/nginx/termostick-error.log
```

### Проверка статуса Nginx

```bash
sudo systemctl status nginx
```

### Проверка использования ресурсов

```bash
# CPU и память
htop

# Дисковое пространство
df -h
```

---

## Резервное копирование

### Создание бэкапа

```bash
# Бэкап всего проекта
cd /var/www
sudo tar -czf termostick-backup-$(date +%Y%m%d).tar.gz termostick/

# Бэкап только dist
cd /var/www/termostick
sudo tar -czf dist-backup-$(date +%Y%m%d).tar.gz dist/
```

### Восстановление из бэкапа

```bash
cd /var/www
sudo tar -xzf termostick-backup-20250129.tar.gz
sudo systemctl reload nginx
```

---

## Дополнительные настройки

### Настройка Firewall (UFW)

```bash
# Установите UFW
sudo apt install -y ufw

# Разрешите SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Включите firewall
sudo ufw enable

# Проверьте статус
sudo ufw status
```

### Настройка автоматических обновлений системы

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Контрольный список развертывания

- [ ] Сервер обновлен (`apt update && apt upgrade`)
- [ ] Node.js 20.x установлен
- [ ] pnpm установлен
- [ ] Nginx установлен и запущен
- [ ] Проект загружен в `/var/www/termostick/`
- [ ] Зависимости установлены (`pnpm install`)
- [ ] Production сборка выполнена (`pnpm run build`)
- [ ] Nginx конфигурация создана
- [ ] DNS настроен (A-записи)
- [ ] SSL сертификат получен (Let's Encrypt)
- [ ] HTTPS работает
- [ ] Все страницы загружаются корректно
- [ ] Firewall настроен

---

## Полезные команды

```bash
# Перезапуск Nginx
sudo systemctl restart nginx

# Перезагрузка конфигурации Nginx (без простоя)
sudo systemctl reload nginx

# Проверка конфигурации Nginx
sudo nginx -t

# Просмотр версии Node.js
node --version

# Просмотр версии pnpm
pnpm --version

# Очистка кэша pnpm
pnpm store prune

# Просмотр размера папки
du -sh /var/www/termostick/
```

---

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/termostick-error.log`
2. Проверьте статус Nginx: `sudo systemctl status nginx`
3. Проверьте права доступа: `ls -la /var/www/termostick/dist/`
4. Убедитесь, что DNS настроен правильно: `nslookup termostick.uz`
5. Проверьте SSL сертификат: `sudo certbot certificates`

---

**Готово! Ваше приложение TermoStick теперь работает на VPS сервере! 🚀**