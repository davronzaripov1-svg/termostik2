# TermoStick - План разработки веб-демо приложения

## Дизайн концепция

### Референсы дизайна
- **Printful.com**: Профессиональный B2B стиль, калькулятор цены
- **Vistaprint.com**: Конструктор заказов, загрузка файлов
- **Stickermule.com**: Минимализм, быстрый заказ
- **Стиль**: Modern B2B Minimalism + Professional E-commerce

### Цветовая палитра
- Primary: #1E40AF (Deep Blue - профессиональный, надежный)
- Secondary: #3B82F6 (Bright Blue - акценты, кнопки)
- Accent: #10B981 (Green - успех, подтверждения)
- Warning: #F59E0B (Orange - предупреждения)
- Background Light: #F9FAFB (Light Gray)
- Background Dark: #111827 (Dark Gray)
- Text Primary: #111827 (Dark) / #F9FAFB (Light)
- Text Secondary: #6B7280 (Gray)

### Типографика
- Heading1: Inter font-weight 700 (48px) - заголовки страниц
- Heading2: Inter font-weight 600 (36px) - секции
- Heading3: Inter font-weight 600 (24px) - подзаголовки
- Body/Normal: Inter font-weight 400 (16px) - основной текст
- Body/Emphasis: Inter font-weight 600 (16px) - акценты
- Small: Inter font-weight 400 (14px) - подписи
- Navigation: Inter font-weight 500 (16px) - навигация

### Ключевые компоненты
- **Кнопки**: Blue gradient (#3B82F6 to #1E40AF), white text, 8px rounded, hover: brightness +10%
- **Карточки**: White/Dark background, subtle shadow, 12px rounded, hover: lift 4px
- **Формы**: Clean inputs, focus: blue border, labels above inputs
- **Калькулятор**: Sticky sidebar, real-time price updates

### Изображения для генерации
1. **hero-termostick-printing.jpg** - Профессиональное оборудование для печати термостикеров, современный цех (Style: photorealistic, professional)
2. **dtf-technology-showcase.jpg** - DTF термостикеры крупным планом, яркие цвета, детали (Style: photorealistic, macro)
3. **vinyl-stickers-collection.jpg** - Коллекция виниловых наклеек разных форм и цветов (Style: photorealistic, product photography)
4. **textile-printing-process.jpg** - Процесс нанесения принта на текстиль, футболка (Style: photorealistic, industrial)
5. **uv-dtf-samples.jpg** - Образцы UV DTF печати на разных поверхностях (Style: photorealistic, showcase)
6. **business-client-success.jpg** - Довольный бизнес-клиент с готовой продукцией (Style: photorealistic, professional)
7. **logo-termostick.png** - Логотип TermoStick, минималистичный, профессиональный (Style: vector-style, clean)
8. **technology-icons-dtf.png** - Иконка DTF технологии (Style: minimalist icon)
9. **technology-icons-vinyl.png** - Иконка Vinyl технологии (Style: minimalist icon)
10. **technology-icons-uv.png** - Иконка UV DTF технологии (Style: minimalist icon)

---

## Техническая документация (будет создана)

### 1. Архитектура системы (docs/architecture.md)
- Общая архитектура приложения
- Компоненты системы
- Взаимодействие frontend-backend
- Масштабирование

### 2. API Спецификация (docs/api-swagger.md)
- 12+ REST API endpoints
- Swagger документация
- Примеры запросов/ответов

### 3. Структура БД (docs/database-schema.md)
- PostgreSQL схема
- Таблицы и связи
- Индексы и оптимизация

### 4. User Flow (docs/user-flow.md)
- Сценарии использования
- Навигация пользователя
- Бизнес-процессы

### 5. План масштабирования (docs/scaling-plan.md)
- Добавление текстиля
- Интеграция CRM
- Маркетплейс функционал

---

## Задачи разработки

### 1. Подготовка и структура
- [x] Инициализация проекта shadcn-ui
- [ ] Создание структуры папок
- [ ] Генерация всех изображений (10 шт)
- [ ] Создание технической документации (5 файлов)

### 2. Компоненты UI
- [ ] Header.tsx - шапка с навигацией, переключатель темы, корзина
- [ ] Footer.tsx - футер с контактами и ссылками
- [ ] TechnologyCard.tsx - карточка технологии печати
- [ ] ProductCard.tsx - карточка товара в каталоге
- [ ] PriceCalculator.tsx - калькулятор цены (sticky sidebar)
- [ ] FileUploader.tsx - загрузчик файлов с проверкой DPI
- [ ] OrderSummary.tsx - итоги заказа
- [ ] ThemeToggle.tsx - переключатель светлой/темной темы

### 3. Страницы
- [ ] pages/Home.tsx - главная страница с баннерами, технологиями, популярными заказами
- [ ] pages/Catalog.tsx - каталог с фильтрами и сортировкой
- [ ] pages/OrderBuilder.tsx - конструктор заказа с загрузкой файлов
- [ ] pages/Cart.tsx - корзина с расчетом стоимости
- [ ] pages/Checkout.tsx - оформление заказа
- [ ] pages/Profile.tsx - личный кабинет с историей заказов
- [ ] pages/Admin.tsx - админ-панель (базовая версия)

### 4. Утилиты и хуки
- [ ] lib/priceCalculator.ts - логика расчета цены
- [ ] lib/fileValidator.ts - валидация файлов (DPI, формат, размер)
- [ ] hooks/useCart.ts - управление корзиной
- [ ] hooks/useTheme.ts - управление темой

### 5. Данные и моки
- [ ] data/technologies.ts - данные о технологиях печати
- [ ] data/products.ts - моковые данные товаров
- [ ] data/orders.ts - примеры заказов

### 6. Стилизация и адаптивность
- [ ] Применение дизайн-системы
- [ ] Responsive дизайн (mobile-first)
- [ ] Анимации и переходы
- [ ] Темная тема

### 7. Тестирование и финализация
- [ ] Проверка всех страниц
- [ ] Тестирование калькулятора
- [ ] Проверка адаптивности
- [ ] Lint и build
- [ ] UI рендеринг проверка