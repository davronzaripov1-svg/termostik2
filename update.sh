#!/bin/bash

# Скрипт для обновления приложения TermoStick

set -e

echo "🔄 Обновление приложения TermoStick..."

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Проверка наличия Git
if command -v git &> /dev/null; then
    echo "📥 Получение последних изменений из Git..."
    git pull origin main
    success "Код обновлен"
else
    warning "Git не установлен. Пропускаем git pull."
fi

# Установка зависимостей
echo ""
echo "📦 Установка зависимостей..."
pnpm install
success "Зависимости установлены"

# Сборка
echo ""
echo "🔨 Сборка проекта..."
pnpm run build
success "Проект собран"

# Перезагрузка Nginx
echo ""
echo "🔄 Перезагрузка Nginx..."
sudo systemctl reload nginx
success "Nginx перезагружен"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Приложение обновлено успешно! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Откройте браузер и проверьте изменения (Ctrl+Shift+R для жесткого обновления)"
echo ""