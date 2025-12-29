#!/bin/bash

# Скрипт для автоматического развертывания TermoStick на VPS

set -e  # Остановка при ошибке

echo "🚀 Начинаем развертывание TermoStick..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода успешного сообщения
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Функция для вывода предупреждения
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Функция для вывода ошибки
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    error "Node.js не установлен. Установите Node.js 20.x"
    exit 1
fi
success "Node.js установлен: $(node --version)"

# Проверка наличия pnpm
if ! command -v pnpm &> /dev/null; then
    warning "pnpm не установлен. Устанавливаем..."
    npm install -g pnpm
    success "pnpm установлен"
fi
success "pnpm установлен: $(pnpm --version)"

# Проверка наличия Nginx
if ! command -v nginx &> /dev/null; then
    error "Nginx не установлен. Установите Nginx"
    exit 1
fi
success "Nginx установлен: $(nginx -v 2>&1)"

# Установка зависимостей
echo ""
echo "📦 Установка зависимостей..."
pnpm install
success "Зависимости установлены"

# Сборка проекта
echo ""
echo "🔨 Сборка production версии..."
pnpm run build
success "Проект собран"

# Проверка наличия dist папки
if [ ! -d "dist" ]; then
    error "Папка dist не найдена. Сборка не удалась."
    exit 1
fi
success "Папка dist создана"

# Копирование Nginx конфигурации
echo ""
echo "⚙️  Настройка Nginx..."
if [ -f "nginx.conf" ]; then
    warning "Скопируйте nginx.conf в /etc/nginx/sites-available/termostick"
    echo "Команда: sudo cp nginx.conf /etc/nginx/sites-available/termostick"
    echo "Затем: sudo ln -s /etc/nginx/sites-available/termostick /etc/nginx/sites-enabled/"
else
    warning "Файл nginx.conf не найден"
fi

# Проверка конфигурации Nginx
echo ""
echo "🔍 Проверка конфигурации Nginx..."
if sudo nginx -t; then
    success "Конфигурация Nginx корректна"
    echo ""
    echo "🔄 Перезагрузка Nginx..."
    sudo systemctl reload nginx
    success "Nginx перезагружен"
else
    error "Ошибка в конфигурации Nginx"
    exit 1
fi

# Итоговое сообщение
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Развертывание завершено успешно! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Следующие шаги:"
echo "1. Убедитесь, что DNS настроен (A-запись указывает на ваш IP)"
echo "2. Получите SSL сертификат:"
echo "   sudo certbot --nginx -d termostick.uz -d www.termostick.uz"
echo "3. Откройте браузер и перейдите на ваш домен"
echo ""
echo "📚 Полное руководство: docs/deployment-guide.md"
echo ""