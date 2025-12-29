# 🚀 Развертывание TermoStick на VPS

Добро пожаловать! Это руководство поможет вам развернуть приложение TermoStick на вашем VPS сервере.

## 📚 Доступные руководства

### 1. **Быстрое развертывание (5 минут)** ⚡
   - Файл: `docs/quick-deploy.md`
   - Для опытных пользователей
   - Минимальные объяснения, только команды

### 2. **Полное руководство (подробное)** 📖
   - Файл: `docs/deployment-guide.md`
   - Пошаговые инструкции
   - Решение проблем
   - Мониторинг и бэкапы

## 🎯 Что вам понадобится

- ✅ VPS сервер (Ubuntu 20.04+ или Debian 11+)
- ✅ Минимум 1GB RAM
- ✅ Доменное имя (например, termostick.uz)
- ✅ SSH доступ к серверу

## 📦 Файлы для развертывания

Все необходимые файлы уже подготовлены:

```
/workspace/shadcn-ui/
├── nginx.conf              # Конфигурация Nginx
├── deploy.sh               # Скрипт автоматического развертывания
├── update.sh               # Скрипт для обновления приложения
├── .env.example            # Пример переменных окружения
├── docs/
│   ├── deployment-guide.md # Полное руководство
│   └── quick-deploy.md     # Быстрое руководство
└── dist/                   # Production сборка (после pnpm run build)
```

## 🚀 Быстрый старт

### Способ 1: Автоматическое развертывание (рекомендуется)

1. **Загрузите все файлы проекта на сервер:**

   ```bash
   # На вашем компьютере
   cd /workspace/shadcn-ui
   tar -czf termostick.tar.gz .
   scp termostick.tar.gz username@ваш_ip:/tmp/
   ```

2. **На сервере распакуйте и запустите скрипт:**

   ```bash
   # Подключитесь к серверу
   ssh username@ваш_ip
   
   # Создайте директорию
   sudo mkdir -p /var/www/termostick
   sudo chown -R $USER:$USER /var/www/termostick
   
   # Распакуйте файлы
   cd /var/www/termostick
   tar -xzf /tmp/termostick.tar.gz
   
   # Запустите автоматическое развертывание
   ./deploy.sh
   ```

3. **Настройте SSL:**

   ```bash
   sudo certbot --nginx -d termostick.uz -d www.termostick.uz
   ```

4. **Готово!** Откройте `https://termostick.uz` в браузере

### Способ 2: Ручное развертывание

Следуйте инструкциям в `docs/deployment-guide.md`

## 🔄 Обновление приложения

После внесения изменений в код:

```bash
cd /var/www/termostick
./update.sh
```

## 📋 Контрольный список

Перед развертыванием убедитесь:

- [ ] У вас есть VPS сервер с Ubuntu/Debian
- [ ] У вас есть доменное имя
- [ ] DNS настроен (A-запись указывает на IP сервера)
- [ ] У вас есть SSH доступ к серверу
- [ ] Все файлы проекта загружены на сервер

## 🛠️ Основные команды

```bash
# Установка зависимостей
pnpm install

# Сборка production версии
pnpm run build

# Проверка конфигурации Nginx
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx

# Просмотр логов
sudo tail -f /var/log/nginx/termostick-error.log

# Обновление приложения
./update.sh
```

## 🆘 Помощь

### Часто встречающиеся проблемы:

**1. Nginx показывает 403 Forbidden**
```bash
sudo chown -R www-data:www-data /var/www/termostick/dist
sudo chmod -R 755 /var/www/termostick/dist
```

**2. Страницы не загружаются (404 на роутах)**
- Проверьте, что в nginx.conf есть: `try_files $uri $uri/ /index.html;`

**3. SSL не работает**
```bash
sudo certbot renew --force-renewal
```

**4. Изменения не отображаются**
- Очистите кэш браузера (Ctrl+Shift+R)
- Проверьте, что файлы обновились: `ls -lt /var/www/termostick/dist/assets/`

### Логи для диагностики:

```bash
# Логи Nginx
sudo tail -f /var/log/nginx/termostick-error.log
sudo tail -f /var/log/nginx/termostick-access.log

# Статус Nginx
sudo systemctl status nginx

# Проверка портов
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

## 📞 Поддержка

Если у вас возникли проблемы:

1. Проверьте `docs/deployment-guide.md` - раздел "Решение проблем"
2. Проверьте логи Nginx
3. Убедитесь, что все зависимости установлены
4. Проверьте права доступа к файлам

## 🎉 После успешного развертывания

Ваше приложение будет доступно по адресу:
- `https://termostick.uz`
- `https://www.termostick.uz`

Функции приложения:
- ✅ Главная страница с информацией о компании
- ✅ Каталог продукции (8 продуктов)
- ✅ Страница технологий (DTF, Vinyl, UV DTF, 3D Vinyl)
- ✅ Калькулятор цены
- ✅ Корзина покупок
- ✅ Личный кабинет
- ✅ Адаптивный дизайн
- ✅ Темная/светлая тема

---

## 📁 Структура проекта на сервере

```
/var/www/termostick/
├── dist/                    # Production файлы (обслуживаются Nginx)
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.js
│   │   └── index-*.css
│   ├── favicon.svg
│   └── robots.txt
├── src/                     # Исходный код
├── public/                  # Публичные файлы
├── node_modules/            # Зависимости
├── package.json
├── vite.config.ts
├── nginx.conf              # Конфигурация Nginx
├── deploy.sh               # Скрипт развертывания
└── update.sh               # Скрипт обновления
```

## 🔐 Безопасность

Рекомендации:

1. **Настройте Firewall:**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Регулярно обновляйте систему:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Настройте автоматическое обновление SSL:**
   - Certbot автоматически настраивает cron job
   - Проверка: `sudo certbot renew --dry-run`

4. **Создавайте резервные копии:**
   ```bash
   cd /var/www
   sudo tar -czf termostick-backup-$(date +%Y%m%d).tar.gz termostick/
   ```

---

**Готово! Ваше приложение TermoStick работает на VPS! 🎊**

Для получения дополнительной информации смотрите:
- `docs/deployment-guide.md` - полное руководство
- `docs/quick-deploy.md` - быстрое развертывание