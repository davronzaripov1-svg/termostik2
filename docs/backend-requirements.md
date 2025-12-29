# Техническое задание для Backend разработчика
## Проект: TermoStick - Маркетплейс термотрансферов и виниловых наклеек

---

## 1. Обзор проекта

**TermoStick** — это B2B/B2C платформа для онлайн-продажи:
- DTF термостикеров
- Виниловых наклеек
- Сублимационных принтов
- UV DTF стикеров
- 3D винила 1 мм
- Текстильной продукции (в будущем)

**Целевая аудитория:**
- Полиграфические компании
- Швейные производства
- Бренды одежды
- Малый бизнес
- Частные клиенты

---

## 2. Технологический стек

### Рекомендуемый стек:

**Backend Framework (выберите один):**
- **Option 1 (рекомендуется):** Python + FastAPI 0.104+
- **Option 2:** Node.js 18+ + Express.js 4.18+

**База данных:**
- PostgreSQL 15+ (основная БД)
- Redis 7+ (кэширование, сессии, очереди)

**Дополнительные технологии:**
- JWT для аутентификации
- Celery (Python) / Bull (Node.js) для фоновых задач
- AWS S3 / MinIO для хранения файлов
- Docker + Docker Compose для контейнеризации
- Nginx как reverse proxy

**Интеграции:**
- Payme API (платежи для Узбекистана)
- Click API (платежи для Узбекистана)
- Stripe API (опционально, международные платежи)
- Telegram Bot API (уведомления)
- SMS.uz / Eskiz.uz (SMS уведомления)

---

## 3. Архитектура системы

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│                   https://termostick.uz                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│              SSL Termination + Load Balancing                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (FastAPI / Express)                 │
│                   Port: 8000 / 3000                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │Order Service │  │Payment Service│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Product Svc   │  │ File Service │  │Notification   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL   │  │    Redis     │  │   AWS S3     │
│   Database    │  │    Cache     │  │File Storage  │
└───────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌───────────────────────────────────────────────────┐
│          External Services                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Payme   │ │  Click   │ │ Telegram │         │
│  └──────────┘ └──────────┘ └──────────┘         │
└───────────────────────────────────────────────────┘
```

---

## 4. Схема базы данных PostgreSQL

### 4.1. Таблица: users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    company_name VARCHAR(255),
    telegram_username VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    avatar_url VARCHAR(500),
    language VARCHAR(5) DEFAULT 'ru' CHECK (language IN ('ru', 'uz', 'en'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

### 4.2. Таблица: products

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    technology VARCHAR(50) NOT NULL CHECK (technology IN ('DTF', 'Vinyl', 'UV DTF', '3D Vinyl', 'Sublimation')),
    category VARCHAR(100) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    unit VARCHAR(20) DEFAULT 'piece' CHECK (unit IN ('piece', 'meter', 'sheet')),
    
    -- Технические характеристики
    material VARCHAR(100),
    temperature INTEGER, -- температура прессования в °C
    pressure VARCHAR(50), -- давление (low/medium/high)
    press_time INTEGER, -- время прессования в секундах
    
    -- Размеры
    width_cm DECIMAL(10, 2),
    height_cm DECIMAL(10, 2),
    thickness_mm DECIMAL(10, 3),
    
    -- Медиа
    image_url VARCHAR(500),
    gallery_urls TEXT[], -- массив URL изображений
    
    -- Статус
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_technology ON products(technology);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
```

### 4.3. Таблица: product_pricing

Ценообразование с учетом тиража (bulk pricing)

```sql
CREATE TABLE product_pricing (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_pricing_product_id ON product_pricing(product_id);
```

### 4.4. Таблица: orders

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- TS-2024-00001
    
    -- Статус заказа
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'printing', 
        'quality_check', 'ready', 'shipped', 'delivered', 
        'cancelled', 'refunded'
    )),
    
    -- Стоимость
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Доставка
    delivery_method VARCHAR(50) CHECK (delivery_method IN ('pickup', 'courier', 'express')),
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_phone VARCHAR(20),
    
    -- Производство
    production_days INTEGER DEFAULT 3,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    
    -- Комментарии
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Даты
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 4.5. Таблица: order_items

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    
    -- Детали продукта (snapshot на момент заказа)
    product_name VARCHAR(255) NOT NULL,
    technology VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Кастомизация
    custom_width_cm DECIMAL(10, 2),
    custom_height_cm DECIMAL(10, 2),
    custom_notes TEXT,
    
    -- Файлы дизайна
    design_file_url VARCHAR(500),
    design_file_name VARCHAR(255),
    design_file_size INTEGER, -- в байтах
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### 4.6. Таблица: cart

```sql
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    custom_width_cm DECIMAL(10, 2),
    custom_height_cm DECIMAL(10, 2),
    design_file_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_user_id ON cart(user_id);
```

### 4.7. Таблица: payments

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Детали платежа
    payment_method VARCHAR(50) CHECK (payment_method IN ('payme', 'click', 'stripe', 'cash', 'bank_transfer')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UZS',
    
    -- Статус
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    )),
    
    -- Внешние ID
    transaction_id VARCHAR(255) UNIQUE,
    external_payment_id VARCHAR(255),
    
    -- Детали провайдера
    provider_response JSONB,
    error_message TEXT,
    
    -- Даты
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 4.8. Таблица: notifications

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Тип и канал
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'order_created', 'order_confirmed', 'order_processing',
        'order_ready', 'order_shipped', 'order_delivered',
        'payment_completed', 'payment_failed', 'promo'
    )),
    channel VARCHAR(20) CHECK (channel IN ('email', 'sms', 'telegram', 'push')),
    
    -- Содержание
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Статус
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Метаданные
    metadata JSONB,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 4.9. Таблица: admin_logs

```sql
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'order', 'product', 'user', etc.
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_entity ON admin_logs(entity_type, entity_id);
```

### 4.10. Таблица: promo_codes

```sql
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percent', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);
```

### 4.11. Таблица: file_uploads

```sql
CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL, -- в байтах
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    is_validated BOOLEAN DEFAULT FALSE,
    validation_errors TEXT[],
    dpi INTEGER,
    width_px INTEGER,
    height_px INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_order_id ON file_uploads(order_id);
```

---

## 5. API Endpoints

### Base URL
```
Production: https://api.termostick.uz/v1
Development: http://localhost:8000/v1
```

### 5.1. Authentication Endpoints

#### POST /auth/register
Регистрация нового пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+998901234567",
  "password": "SecurePass123!",
  "full_name": "Иван Иванов",
  "company_name": "ООО Принт Студия",
  "city": "Ташкент",
  "telegram_username": "@ivanov",
  "language": "ru"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Иван Иванов",
      "role": "user"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

#### POST /auth/login
Вход в систему

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "Иван Иванов",
      "role": "user",
      "avatar_url": "https://cdn.termostick.uz/avatars/1.jpg"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

#### POST /auth/refresh
Обновление access token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Выход из системы

**Headers:**
```
Authorization: Bearer {access_token}
```

#### POST /auth/forgot-password
Восстановление пароля

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Сброс пароля

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

---

### 5.2. Products Endpoints

#### GET /products
Получить список продуктов с фильтрацией и пагинацией

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)
- `technology` (string: DTF, Vinyl, UV DTF, 3D Vinyl)
- `category` (string)
- `min_price` (decimal)
- `max_price` (decimal)
- `search` (string)
- `sort` (string: price_asc, price_desc, name_asc, name_desc, newest)
- `is_featured` (boolean)

**Example Request:**
```
GET /products?technology=DTF&page=1&limit=10&sort=price_asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "DTF Transfer - Custom Design",
        "slug": "dtf-transfer-custom",
        "description": "Профессиональные DTF трансферы...",
        "technology": "DTF",
        "category": "Custom Transfers",
        "base_price": 15000,
        "image_url": "https://cdn.termostick.uz/products/dtf-1.jpg",
        "material": "DTF Film + Powder",
        "temperature": 160,
        "pressure": "Medium",
        "press_time": 15,
        "is_featured": true,
        "pricing_tiers": [
          {
            "min_quantity": 1,
            "max_quantity": 49,
            "price_per_unit": 15000,
            "discount_percent": 0
          },
          {
            "min_quantity": 50,
            "max_quantity": 99,
            "price_per_unit": 12000,
            "discount_percent": 20
          },
          {
            "min_quantity": 100,
            "max_quantity": null,
            "price_per_unit": 10000,
            "discount_percent": 33
          }
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 48,
      "items_per_page": 10,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET /products/{id}
Получить детальную информацию о продукте

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "DTF Transfer - Custom Design",
    "slug": "dtf-transfer-custom",
    "description": "Полное описание продукта...",
    "technology": "DTF",
    "category": "Custom Transfers",
    "base_price": 15000,
    "min_quantity": 1,
    "unit": "piece",
    "material": "DTF Film + Powder",
    "temperature": 160,
    "pressure": "Medium",
    "press_time": 15,
    "width_cm": 30,
    "height_cm": 40,
    "image_url": "https://cdn.termostick.uz/products/dtf-1.jpg",
    "gallery_urls": [
      "https://cdn.termostick.uz/products/dtf-1-1.jpg",
      "https://cdn.termostick.uz/products/dtf-1-2.jpg"
    ],
    "is_active": true,
    "is_featured": true,
    "stock_quantity": 500,
    "pricing_tiers": [...],
    "related_products": [...]
  }
}
```

#### POST /products (Admin only)
Создать новый продукт

**Headers:**
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New DTF Transfer",
  "slug": "new-dtf-transfer",
  "description": "Description...",
  "technology": "DTF",
  "category": "Custom Transfers",
  "base_price": 15000,
  "material": "DTF Film + Powder",
  "temperature": 160,
  "pressure": "Medium",
  "press_time": 15,
  "image_url": "https://cdn.termostick.uz/products/new.jpg",
  "is_active": true
}
```

#### PUT /products/{id} (Admin only)
Обновить продукт

#### DELETE /products/{id} (Admin only)
Удалить продукт

---

### 5.3. Cart Endpoints

#### GET /cart
Получить корзину текущего пользователя

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "DTF Transfer - Custom Design",
          "image_url": "https://cdn.termostick.uz/products/dtf-1.jpg",
          "technology": "DTF"
        },
        "quantity": 50,
        "unit_price": 12000,
        "total_price": 600000,
        "custom_width_cm": 30,
        "custom_height_cm": 40,
        "design_file_url": "https://cdn.termostick.uz/uploads/design-123.png",
        "notes": "Срочный заказ"
      }
    ],
    "summary": {
      "subtotal": 600000,
      "discount": 0,
      "tax": 0,
      "shipping": 50000,
      "total": 650000,
      "items_count": 1
    }
  }
}
```

#### POST /cart/items
Добавить товар в корзину

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 50,
  "custom_width_cm": 30,
  "custom_height_cm": 40,
  "design_file_url": "https://cdn.termostick.uz/uploads/design-123.png",
  "notes": "Срочный заказ"
}
```

#### PUT /cart/items/{id}
Обновить количество товара в корзине

**Request Body:**
```json
{
  "quantity": 100
}
```

#### DELETE /cart/items/{id}
Удалить товар из корзины

#### DELETE /cart
Очистить корзину

---

### 5.4. Orders Endpoints

#### GET /orders
Получить список заказов пользователя

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (integer)
- `limit` (integer)
- `status` (string)
- `date_from` (date: YYYY-MM-DD)
- `date_to` (date: YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "order_number": "TS-2024-00001",
        "status": "processing",
        "total_amount": 650000,
        "items_count": 2,
        "created_at": "2024-01-15T10:30:00Z",
        "estimated_completion_date": "2024-01-18"
      }
    ],
    "pagination": {...}
  }
}
```

#### GET /orders/{id}
Получить детальную информацию о заказе

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "TS-2024-00001",
    "status": "processing",
    "subtotal": 600000,
    "discount_amount": 0,
    "tax_amount": 0,
    "shipping_cost": 50000,
    "total_amount": 650000,
    "delivery_method": "courier",
    "delivery_address": "ул. Амира Темура 123, кв. 45",
    "delivery_city": "Ташкент",
    "delivery_phone": "+998901234567",
    "production_days": 3,
    "estimated_completion_date": "2024-01-18",
    "customer_notes": "Срочный заказ",
    "items": [
      {
        "id": 1,
        "product_name": "DTF Transfer - Custom Design",
        "technology": "DTF",
        "quantity": 50,
        "unit_price": 12000,
        "total_price": 600000,
        "custom_width_cm": 30,
        "custom_height_cm": 40,
        "design_file_url": "https://cdn.termostick.uz/uploads/design-123.png"
      }
    ],
    "payment": {
      "method": "payme",
      "status": "completed",
      "amount": 650000,
      "transaction_id": "PAY-123456"
    },
    "status_history": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2024-01-15T11:00:00Z"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-15T14:00:00Z"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T14:00:00Z"
  }
}
```

#### POST /orders
Создать новый заказ из корзины

**Request Body:**
```json
{
  "delivery_method": "courier",
  "delivery_address": "ул. Амира Темура 123, кв. 45",
  "delivery_city": "Ташкент",
  "delivery_phone": "+998901234567",
  "payment_method": "payme",
  "promo_code": "WINTER2024",
  "customer_notes": "Срочный заказ, нужен к пятнице"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "order_number": "TS-2024-00001",
      "status": "pending",
      "total_amount": 650000
    },
    "payment": {
      "payment_url": "https://checkout.payme.uz/...",
      "transaction_id": "PAY-123456"
    }
  }
}
```

#### PUT /orders/{id}/cancel
Отменить заказ (только если статус pending или confirmed)

#### GET /orders/{id}/invoice
Получить счет-фактуру в PDF

---

### 5.5. Payment Endpoints

#### POST /payments/payme/webhook
Webhook для обработки уведомлений от Payme

**Request Body (Payme format):**
```json
{
  "method": "CheckPerformTransaction",
  "params": {
    "amount": 65000000,
    "account": {
      "order_id": "1"
    }
  }
}
```

#### POST /payments/click/webhook
Webhook для обработки уведомлений от Click

#### POST /payments/stripe/webhook
Webhook для обработки уведомлений от Stripe

#### GET /payments/{transaction_id}/status
Проверить статус платежа

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction_id": "PAY-123456",
    "status": "completed",
    "amount": 650000,
    "currency": "UZS",
    "payment_method": "payme",
    "order_id": 1,
    "completed_at": "2024-01-15T10:35:00Z"
  }
}
```

---

### 5.6. File Upload Endpoints

#### POST /uploads/design
Загрузить файл дизайна

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
file: [binary data]
```

**Supported formats:** PNG, PDF, SVG, AI, EPS
**Max file size:** 50 MB
**Min DPI:** 300

**Response (200):**
```json
{
  "success": true,
  "data": {
    "file_id": 123,
    "file_name": "design.png",
    "file_url": "https://cdn.termostick.uz/uploads/design-123.png",
    "file_size": 2048576,
    "mime_type": "image/png",
    "is_validated": true,
    "validation": {
      "dpi": 300,
      "width_px": 3000,
      "height_px": 4000,
      "width_cm": 25.4,
      "height_cm": 33.87,
      "errors": []
    }
  }
}
```

**Response (400) - Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Файл не прошел валидацию",
    "details": {
      "errors": [
        "DPI слишком низкий: 150 (минимум 300)",
        "Размер файла превышает 50 MB"
      ]
    }
  }
}
```

#### DELETE /uploads/{file_id}
Удалить загруженный файл

---

### 5.7. User Profile Endpoints

#### GET /users/me
Получить профиль текущего пользователя

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+998901234567",
    "full_name": "Иван Иванов",
    "role": "user",
    "company_name": "ООО Принт Студия",
    "telegram_username": "@ivanov",
    "city": "Ташкент",
    "address": "ул. Амира Темура 123",
    "avatar_url": "https://cdn.termostick.uz/avatars/1.jpg",
    "language": "ru",
    "is_verified": true,
    "created_at": "2024-01-01T00:00:00Z",
    "stats": {
      "total_orders": 15,
      "total_spent": 9750000,
      "average_order": 650000
    }
  }
}
```

#### PUT /users/me
Обновить профиль

**Request Body:**
```json
{
  "full_name": "Иван Петрович Иванов",
  "company_name": "ООО Новая Принт Студия",
  "city": "Самарканд",
  "address": "ул. Регистан 45",
  "telegram_username": "@ivanov_new",
  "language": "uz"
}
```

#### POST /users/me/avatar
Загрузить аватар

**Request Body (multipart/form-data):**
```
avatar: [binary image data]
```

#### PUT /users/me/password
Изменить пароль

**Request Body:**
```json
{
  "current_password": "OldPass123!",
  "new_password": "NewSecurePass123!"
}
```

---

### 5.8. Notifications Endpoints

#### GET /notifications
Получить список уведомлений

**Query Parameters:**
- `page` (integer)
- `limit` (integer)
- `is_read` (boolean)
- `type` (string)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "order_confirmed",
        "title": "Заказ подтвержден",
        "message": "Ваш заказ #TS-2024-00001 подтвержден и отправлен в производство",
        "is_read": false,
        "order_id": 1,
        "created_at": "2024-01-15T11:00:00Z"
      }
    ],
    "unread_count": 3,
    "pagination": {...}
  }
}
```

#### PUT /notifications/{id}/read
Отметить уведомление как прочитанное

#### PUT /notifications/read-all
Отметить все уведомления как прочитанные

---

### 5.9. Admin Endpoints

#### GET /admin/dashboard
Получить статистику для админ-панели

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_orders": 1250,
      "total_revenue": 87500000,
      "total_customers": 450,
      "pending_orders": 23
    },
    "today": {
      "orders": 15,
      "revenue": 975000,
      "new_customers": 3
    },
    "recent_orders": [...],
    "top_products": [...],
    "revenue_chart": {
      "labels": ["Jan", "Feb", "Mar", ...],
      "data": [5000000, 6500000, 7200000, ...]
    }
  }
}
```

#### GET /admin/orders
Получить все заказы (с фильтрацией)

**Query Parameters:**
- `page`, `limit`
- `status`
- `user_id`
- `date_from`, `date_to`
- `search` (по номеру заказа, имени клиента)

#### PUT /admin/orders/{id}/status
Обновить статус заказа

**Request Body:**
```json
{
  "status": "processing",
  "admin_notes": "Заказ отправлен в печать"
}
```

#### GET /admin/users
Получить список пользователей

#### PUT /admin/users/{id}/role
Изменить роль пользователя

**Request Body:**
```json
{
  "role": "manager"
}
```

#### GET /admin/products
Управление продуктами (CRUD операции)

#### GET /admin/analytics
Получить детальную аналитику

**Query Parameters:**
- `date_from`, `date_to`
- `group_by` (day, week, month)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sales": {
      "total_revenue": 87500000,
      "total_orders": 1250,
      "average_order_value": 70000,
      "growth_rate": 15.5
    },
    "products": {
      "most_popular": [...],
      "revenue_by_technology": {
        "DTF": 45000000,
        "Vinyl": 25000000,
        "UV DTF": 12500000,
        "3D Vinyl": 5000000
      }
    },
    "customers": {
      "total": 450,
      "new_this_period": 67,
      "returning_rate": 42.5
    }
  }
}
```

#### GET /admin/logs
Получить логи действий администраторов

---

### 5.10. Promo Codes Endpoints

#### POST /promo-codes/validate
Проверить промокод

**Request Body:**
```json
{
  "code": "WINTER2024",
  "order_amount": 600000
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "code": "WINTER2024",
    "discount_type": "percent",
    "discount_value": 10,
    "discount_amount": 60000,
    "final_amount": 540000,
    "is_valid": true
  }
}
```

#### POST /admin/promo-codes
Создать промокод (Admin only)

**Request Body:**
```json
{
  "code": "SPRING2024",
  "description": "Весенняя скидка 15%",
  "discount_type": "percent",
  "discount_value": 15,
  "min_order_amount": 500000,
  "max_discount_amount": 200000,
  "usage_limit": 100,
  "valid_from": "2024-03-01T00:00:00Z",
  "valid_until": "2024-03-31T23:59:59Z"
}
```

---

### 5.11. Price Calculator Endpoint

#### POST /calculator/price
Рассчитать стоимость заказа

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 50,
      "custom_width_cm": 30,
      "custom_height_cm": 40
    },
    {
      "product_id": 2,
      "quantity": 100
    }
  ],
  "delivery_method": "courier",
  "delivery_city": "Ташкент",
  "promo_code": "WINTER2024"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product_id": 1,
        "product_name": "DTF Transfer - Custom Design",
        "quantity": 50,
        "unit_price": 12000,
        "subtotal": 600000,
        "discount_applied": 20
      }
    ],
    "subtotal": 1200000,
    "discount": {
      "promo_code": "WINTER2024",
      "amount": 120000
    },
    "tax": 0,
    "shipping": 50000,
    "total": 1130000,
    "production_days": 3,
    "estimated_delivery": "2024-01-20"
  }
}
```

---

## 6. Система аутентификации

### 6.1. JWT Tokens

**Access Token:**
- Срок действия: 1 час
- Используется для всех API запросов
- Содержит: user_id, email, role

**Refresh Token:**
- Срок действия: 30 дней
- Используется для обновления access token
- Хранится в httpOnly cookie или localStorage

**JWT Payload Example:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "user",
  "iat": 1705315200,
  "exp": 1705318800
}
```

### 6.2. Роли и права доступа

**Роли:**
1. **user** (обычный пользователь)
   - Просмотр продуктов
   - Управление корзиной
   - Создание заказов
   - Просмотр своих заказов
   - Управление профилем

2. **manager** (менеджер)
   - Все права user
   - Просмотр всех заказов
   - Изменение статусов заказов
   - Просмотр клиентов

3. **admin** (администратор)
   - Все права manager
   - Управление продуктами (CRUD)
   - Управление пользователями
   - Создание промокодов
   - Доступ к аналитике
   - Просмотр логов

### 6.3. Middleware для защиты роутов

```python
# Пример для FastAPI
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return payload

async def require_admin(current_user = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
```

---

## 7. Интеграция платежных систем

### 7.1. Payme Integration

**Документация:** https://developer.help.paycom.uz/

**Методы для реализации:**

1. **CheckPerformTransaction** - проверка возможности выполнения транзакции
2. **CreateTransaction** - создание транзакции
3. **PerformTransaction** - выполнение транзакции
4. **CancelTransaction** - отмена транзакции
5. **CheckTransaction** - проверка статуса транзакции

**Пример обработки webhook:**

```python
@app.post("/payments/payme/webhook")
async def payme_webhook(request: Request):
    data = await request.json()
    method = data.get("method")
    params = data.get("params")
    
    if method == "CheckPerformTransaction":
        # Проверить существование заказа и возможность оплаты
        order_id = params["account"]["order_id"]
        order = await get_order(order_id)
        
        if not order or order.status != "pending":
            return {
                "error": {
                    "code": -31050,
                    "message": "Order not found or already paid"
                }
            }
        
        return {
            "result": {
                "allow": True
            }
        }
    
    elif method == "CreateTransaction":
        # Создать транзакцию в БД
        transaction = await create_payment_transaction(
            order_id=params["account"]["order_id"],
            amount=params["amount"],
            transaction_id=params["id"]
        )
        
        return {
            "result": {
                "create_time": int(transaction.created_at.timestamp() * 1000),
                "transaction": str(transaction.id),
                "state": 1
            }
        }
    
    # ... остальные методы
```

### 7.2. Click Integration

**Документация:** https://docs.click.uz/

**Endpoints для реализации:**

1. **prepare** - подготовка платежа
2. **complete** - завершение платежа

**Пример:**

```python
@app.post("/payments/click/prepare")
async def click_prepare(
    click_trans_id: int,
    merchant_trans_id: str,
    amount: float,
    action: int,
    sign_time: str,
    sign_string: str
):
    # Проверить подпись
    if not verify_click_signature(click_trans_id, merchant_trans_id, amount, sign_time, sign_string):
        return {
            "error": -1,
            "error_note": "Invalid signature"
        }
    
    # Проверить заказ
    order = await get_order_by_number(merchant_trans_id)
    if not order:
        return {
            "error": -5,
            "error_note": "Order not found"
        }
    
    if order.total_amount != amount:
        return {
            "error": -2,
            "error_note": "Incorrect amount"
        }
    
    return {
        "click_trans_id": click_trans_id,
        "merchant_trans_id": merchant_trans_id,
        "merchant_prepare_id": order.id,
        "error": 0,
        "error_note": "Success"
    }
```

### 7.3. Stripe Integration (опционально)

**Документация:** https://stripe.com/docs/api

**Основные шаги:**

1. Создать Payment Intent
2. Обработать webhook события
3. Подтвердить платеж

```python
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

@app.post("/payments/stripe/create-intent")
async def create_payment_intent(order_id: int, current_user = Depends(get_current_user)):
    order = await get_order(order_id)
    
    intent = stripe.PaymentIntent.create(
        amount=int(order.total_amount * 100),  # в центах
        currency="usd",
        metadata={"order_id": order_id}
    )
    
    return {
        "client_secret": intent.client_secret
    }

@app.post("/payments/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400)
    
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        order_id = payment_intent["metadata"]["order_id"]
        await update_order_payment_status(order_id, "completed")
    
    return {"status": "success"}
```

---

## 8. Система уведомлений

### 8.1. Email уведомления

**Библиотеки:**
- Python: `python-email` + `aiosmtplib`
- Node.js: `nodemailer`

**Типы email:**
1. Подтверждение регистрации
2. Восстановление пароля
3. Подтверждение заказа
4. Изменение статуса заказа
5. Счет-фактура

**Пример шаблона (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Заказ подтвержден - TermoStick</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1a1a1a; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">TermoStick</h1>
    </div>
    
    <div style="padding: 30px; background: #f5f5f5;">
        <h2>Здравствуйте, {{customer_name}}!</h2>
        
        <p>Ваш заказ <strong>{{order_number}}</strong> подтвержден и отправлен в производство.</p>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Детали заказа:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">Номер заказа:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;"><strong>{{order_number}}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">Сумма:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;"><strong>{{total_amount}} UZS</strong></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">Срок изготовления:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">{{production_days}} дней</td>
                </tr>
                <tr>
                    <td style="padding: 10px;">Ожидаемая дата готовности:</td>
                    <td style="padding: 10px; text-align: right;"><strong>{{estimated_date}}</strong></td>
                </tr>
            </table>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
            <a href="{{order_url}}" style="background: #1a1a1a; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Посмотреть заказ
            </a>
        </p>
        
        <p style="color: #666; font-size: 14px;">
            Если у вас есть вопросы, свяжитесь с нами:<br>
            Телефон: +998 90 123 45 67<br>
            Email: info@termostick.uz<br>
            Telegram: @termostick_support
        </p>
    </div>
    
    <div style="background: #1a1a1a; padding: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>&copy; 2024 TermoStick. Все права защищены.</p>
    </div>
</body>
</html>
```

### 8.2. SMS уведомления

**Провайдеры для Узбекистана:**
- SMS.uz (https://sms.uz/)
- Eskiz.uz (https://eskiz.uz/)
- PlayMobile (https://playmobile.uz/)

**Пример интеграции с Eskiz.uz:**

```python
import aiohttp

async def send_sms(phone: str, message: str):
    url = "https://notify.eskiz.uz/api/message/sms/send"
    
    # Получить токен (кэшировать на 30 дней)
    token = await get_eskiz_token()
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    data = {
        "mobile_phone": phone,
        "message": message,
        "from": "4546"  # ваш номер отправителя
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, data=data) as response:
            result = await response.json()
            return result

# Пример использования
await send_sms(
    phone="998901234567",
    message=f"TermoStick: Ваш заказ #{order_number} подтвержден. Срок изготовления: {production_days} дней."
)
```

### 8.3. Telegram уведомления

**Создание бота:**
1. Создать бота через @BotFather
2. Получить API токен
3. Пользователи подключают бота командой `/start`

**Пример реализации:**

```python
import aiohttp

async def send_telegram_message(chat_id: int, message: str):
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    
    data = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=data) as response:
            return await response.json()

# Пример сообщения
message = f"""
<b>🎉 Заказ подтвержден!</b>

Номер заказа: <code>{order_number}</code>
Сумма: <b>{total_amount:,} UZS</b>
Срок изготовления: {production_days} дней
Ожидаемая дата: {estimated_date}

<a href="{order_url}">Посмотреть детали заказа</a>
"""

await send_telegram_message(user.telegram_chat_id, message)
```

**Telegram Bot для поддержки:**

```python
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command

bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    # Сохранить chat_id пользователя
    await link_telegram_account(
        telegram_id=message.from_user.id,
        chat_id=message.chat.id,
        username=message.from_user.username
    )
    
    await message.answer(
        "Добро пожаловать в TermoStick! 🎨\n\n"
        "Теперь вы будете получать уведомления о ваших заказах в Telegram.\n\n"
        "Команды:\n"
        "/orders - Мои заказы\n"
        "/help - Помощь"
    )

@dp.message(Command("orders"))
async def cmd_orders(message: types.Message):
    user = await get_user_by_telegram_id(message.from_user.id)
    if not user:
        await message.answer("Аккаунт не найден. Пожалуйста, зарегистрируйтесь на сайте.")
        return
    
    orders = await get_user_orders(user.id, limit=5)
    
    if not orders:
        await message.answer("У вас пока нет заказов.")
        return
    
    text = "<b>Ваши последние заказы:</b>\n\n"
    for order in orders:
        text += f"📦 <code>{order.order_number}</code>\n"
        text += f"Статус: {get_status_emoji(order.status)} {order.status}\n"
        text += f"Сумма: {order.total_amount:,} UZS\n"
        text += f"Дата: {order.created_at.strftime('%d.%m.%Y')}\n\n"
    
    await message.answer(text, parse_mode="HTML")
```

---

## 9. Требования к безопасности

### 9.1. HTTPS

- **Обязательно** использовать HTTPS для всех API запросов
- Получить SSL сертификат (Let's Encrypt или платный)
- Настроить автоматическое перенаправление с HTTP на HTTPS

### 9.2. CORS (Cross-Origin Resource Sharing)

```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://termostick.uz",
        "https://www.termostick.uz",
        "http://localhost:5173"  # для разработки
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### 9.3. Rate Limiting

Защита от DDoS и брутфорс атак:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Применить к конкретному endpoint
@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest):
    # ...
    pass

# Глобальный лимит
@app.get("/products")
@limiter.limit("100/minute")
async def get_products():
    # ...
    pass
```

### 9.4. Input Validation

- Валидировать все входные данные с помощью Pydantic (FastAPI) или Joi (Node.js)
- Защита от SQL injection (использовать ORM)
- Защита от XSS (экранировать HTML)
- Проверка типов файлов при загрузке

```python
from pydantic import BaseModel, EmailStr, validator
import re

class UserRegisterRequest(BaseModel):
    email: EmailStr
    phone: str
    password: str
    full_name: str
    
    @validator('phone')
    def validate_phone(cls, v):
        # Узбекистанский формат: +998XXXXXXXXX
        pattern = r'^\+998\d{9}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid phone format. Use +998XXXXXXXXX')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain digit')
        return v
```

### 9.5. Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### 9.6. Защита от CSRF

- Использовать CSRF токены для форм
- Проверять Origin и Referer headers
- Использовать SameSite cookies

### 9.7. Логирование и мониторинг

```python
import logging
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Логирование важных событий
@app.post("/auth/login")
async def login(request: Request, credentials: LoginRequest):
    try:
        user = await authenticate_user(credentials.email, credentials.password)
        
        logger.info(f"User login successful: {user.email} from IP {request.client.host}")
        
        return {"access_token": token}
    except Exception as e:
        logger.warning(f"Failed login attempt: {credentials.email} from IP {request.client.host}")
        raise
```

---

## 10. Административная панель

### 10.1. Функционал

**Dashboard:**
- Статистика продаж (сегодня, неделя, месяц)
- График выручки
- Количество заказов по статусам
- Топ продуктов
- Последние заказы

**Управление заказами:**
- Список всех заказов с фильтрацией
- Изменение статуса заказа
- Просмотр деталей заказа
- Добавление комментариев
- Печать счета-фактуры
- Отправка уведомлений клиенту

**Управление продуктами:**
- CRUD операции
- Массовое обновление цен
- Управление категориями
- Загрузка изображений
- Управление ценовыми уровнями

**Управление пользователями:**
- Список клиентов
- Просмотр истории заказов клиента
- Изменение роли
- Блокировка/разблокировка

**Управление промокодами:**
- Создание промокодов
- Отслеживание использования
- Деактивация

**Аналитика:**
- Выручка по периодам
- Продажи по технологиям
- Конверсия
- Средний чек
- Повторные покупки

**Настройки:**
- Настройки доставки
- Настройки платежей
- Email шаблоны
- Общие настройки сайта

### 10.2. Права доступа

**Admin:**
- Полный доступ ко всем функциям

**Manager:**
- Управление заказами
- Просмотр клиентов
- Просмотр аналитики
- Без доступа к настройкам и управлению продуктами

---

## 11. Примеры curl запросов

### Регистрация
```bash
curl -X POST https://api.termostick.uz/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+998901234567",
    "password": "SecurePass123!",
    "full_name": "Иван Иванов",
    "city": "Ташкент"
  }'
```

### Вход
```bash
curl -X POST https://api.termostick.uz/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Получить продукты
```bash
curl -X GET "https://api.termostick.uz/v1/products?technology=DTF&page=1&limit=10" \
  -H "Accept: application/json"
```

### Добавить в корзину
```bash
curl -X POST https://api.termostick.uz/v1/cart/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 50
  }'
```

### Создать заказ
```bash
curl -X POST https://api.termostick.uz/v1/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_method": "courier",
    "delivery_address": "ул. Амира Темура 123",
    "delivery_city": "Ташкент",
    "delivery_phone": "+998901234567",
    "payment_method": "payme"
  }'
```

### Загрузить файл дизайна
```bash
curl -X POST https://api.termostick.uz/v1/uploads/design \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/design.png"
```

### Получить заказы (Admin)
```bash
curl -X GET "https://api.termostick.uz/v1/admin/orders?status=pending&page=1" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Обновить статус заказа (Admin)
```bash
curl -X PUT https://api.termostick.uz/v1/admin/orders/1/status \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "admin_notes": "Заказ отправлен в печать"
  }'
```

---

## 12. Переменные окружения

Создайте файл `.env` со следующими переменными:

```bash
# Application
APP_NAME=TermoStick
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.termostick.uz
FRONTEND_URL=https://termostick.uz

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/termostick
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=termostick-uploads
AWS_S3_REGION=us-east-1
MAX_FILE_SIZE_MB=50

# Payment - Payme
PAYME_MERCHANT_ID=your-merchant-id
PAYME_SECRET_KEY=your-payme-secret-key
PAYME_ENDPOINT=https://checkout.paycom.uz

# Payment - Click
CLICK_MERCHANT_ID=your-merchant-id
CLICK_SECRET_KEY=your-click-secret-key
CLICK_SERVICE_ID=your-service-id

# Payment - Stripe (optional)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@termostick.uz
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@termostick.uz
SMTP_FROM_NAME=TermoStick

# SMS
ESKIZ_EMAIL=your-email@example.com
ESKIZ_PASSWORD=your-eskiz-password

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_SUPPORT_CHAT_ID=your-support-chat-id

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100

# Logging
LOG_LEVEL=INFO
LOG_FILE=app.log

# CORS
CORS_ORIGINS=https://termostick.uz,https://www.termostick.uz
```

---

## 13. Структура проекта

### FastAPI (Python)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Точка входа
│   ├── config.py               # Конфигурация
│   ├── database.py             # Подключение к БД
│   │
│   ├── models/                 # SQLAlchemy модели
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── payment.py
│   │   └── notification.py
│   │
│   ├── schemas/                # Pydantic схемы
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── auth.py
│   │
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependencies
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── products.py
│   │       ├── orders.py
│   │       ├── cart.py
│   │       ├── payments.py
│   │       ├── users.py
│   │       └── admin.py
│   │
│   ├── services/              # Бизнес-логика
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── order_service.py
│   │   ├── payment_service.py
│   │   ├── notification_service.py
│   │   └── file_service.py
│   │
│   ├── integrations/          # Внешние интеграции
│   │   ├── __init__.py
│   │   ├── payme.py
│   │   ├── click.py
│   │   ├── stripe.py
│   │   ├── telegram.py
│   │   └── sms.py
│   │
│   ├── utils/                 # Утилиты
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── validators.py
│   │   └── helpers.py
│   │
│   └── tasks/                 # Celery задачи
│       ├── __init__.py
│       ├── email_tasks.py
│       └── notification_tasks.py
│
├── alembic/                   # Миграции БД
│   ├── versions/
│   └── env.py
│
├── tests/                     # Тесты
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_products.py
│   └── test_orders.py
│
├── .env                       # Переменные окружения
├── .env.example
├── requirements.txt           # Зависимости
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 14. Дополнительные требования

### 14.1. Производительность

- **Response Time:** < 200ms для GET запросов, < 500ms для POST
- **Database Queries:** Использовать индексы, избегать N+1 проблемы
- **Caching:** Кэшировать часто запрашиваемые данные в Redis (продукты, цены)
- **Pagination:** Обязательная пагинация для списков (max 100 items per page)

### 14.2. Масштабируемость

- Использовать connection pooling для БД
- Асинхронные операции для I/O операций
- Фоновые задачи для отправки уведомлений (Celery/Bull)
- Горизонтальное масштабирование (stateless API)

### 14.3. Мониторинг

- Логирование всех ошибок и важных событий
- Метрики производительности (Prometheus + Grafana)
- Health check endpoint: `GET /health`
- Алерты при критических ошибках

### 14.4. Backup

- Ежедневный backup PostgreSQL
- Хранение backup за последние 30 дней
- Тестирование восстановления из backup раз в месяц

### 14.5. Документация API

- Автоматическая генерация Swagger/OpenAPI документации
- Доступна по адресу: `https://api.termostick.uz/docs`
- Примеры запросов для каждого endpoint
- Описание всех параметров и ответов

---

## 15. Этапы разработки (Roadmap)

### Phase 1: MVP (4-6 недель)

**Week 1-2:**
- Настройка проекта и окружения
- Создание схемы БД и миграций
- Базовая аутентификация (register, login, JWT)

**Week 3-4:**
- CRUD для продуктов
- Корзина покупок
- Создание заказов
- Интеграция Payme

**Week 5-6:**
- Email уведомления
- Личный кабинет пользователя
- Базовая админ-панель
- Тестирование и багфиксы

### Phase 2: Расширенный функционал (3-4 недели)

**Week 7-8:**
- Интеграция Click
- SMS уведомления
- Telegram бот
- Система промокодов

**Week 9-10:**
- Расширенная админ-панель
- Аналитика и отчеты
- Загрузка файлов дизайна
- Калькулятор цен

### Phase 3: Оптимизация и масштабирование (2-3 недели)

**Week 11-12:**
- Оптимизация производительности
- Кэширование с Redis
- Rate limiting
- Мониторинг и логирование

**Week 13:**
- Финальное тестирование
- Документация
- Подготовка к production

---

## 16. Контрольный список (Checklist)

### Обязательные функции для MVP:

- [ ] Регистрация и аутентификация пользователей
- [ ] JWT токены (access + refresh)
- [ ] CRUD операции для продуктов
- [ ] Корзина покупок
- [ ] Создание и просмотр заказов
- [ ] Интеграция хотя бы одной платежной системы (Payme или Click)
- [ ] Email уведомления (подтверждение заказа)
- [ ] Личный кабинет пользователя
- [ ] Базовая админ-панель (управление заказами)
- [ ] Загрузка файлов дизайна
- [ ] API документация (Swagger)
- [ ] HTTPS и базовая безопасность
- [ ] Логирование ошибок
- [ ] Health check endpoint

### Дополнительные функции:

- [ ] Интеграция Click
- [ ] SMS уведомления
- [ ] Telegram бот
- [ ] Система промокодов
- [ ] Расширенная аналитика
- [ ] Экспорт отчетов
- [ ] Интеграция Stripe
- [ ] Push уведомления
- [ ] Мультиязычность API

---

## 17. Контакты и поддержка

При возникновении вопросов по техническому заданию, обращайтесь:

**Frontend Team:**
- Email: frontend@termostick.uz
- Telegram: @termostick_frontend

**Project Manager:**
- Email: pm@termostick.uz
- Telegram: @termostick_pm

**Документация:**
- Frontend репозиторий: https://github.com/davronzaripov1-svg/termostik2
- API документация: https://api.termostick.uz/docs (после запуска)

---

## 18. Заключение

Это техническое задание описывает полный backend для проекта TermoStick. Следуйте этому документу при разработке, но не стесняйтесь предлагать улучшения и оптимизации.

**Ключевые принципы разработки:**
1. **Безопасность прежде всего** - защита данных пользователей
2. **Производительность** - быстрые ответы API
3. **Масштабируемость** - готовность к росту
4. **Чистый код** - читаемый и поддерживаемый
5. **Документация** - каждая функция должна быть задокументирована

Удачи в разработке! 🚀