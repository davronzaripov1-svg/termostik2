# TermoStick - Структура базы данных PostgreSQL

## Обзор

База данных спроектирована для поддержки B2B и B2C операций с масштабируемостью и производительностью.

---

## Схема базы данных

### 1. users
Таблица пользователей системы

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'business', 'admin')),
    company_name VARCHAR(255),
    telegram VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_created ON users(created_at DESC);
```

---

### 2. user_sessions
Сессии пользователей для JWT токенов

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
```

---

### 3. technologies
Технологии печати

```sql
CREATE TABLE technologies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    features JSONB,
    min_price INTEGER NOT NULL,
    production_time_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Данные по умолчанию
INSERT INTO technologies (id, name, description, min_price, production_time_days) VALUES
('dtf', 'DTF Термостикеры', 'Direct to Film печать высокого качества', 5000, 3),
('vinyl', 'Виниловые наклейки', 'Плоттерная резка винила', 3000, 2),
('uv_dtf', 'UV DTF', 'UV печать на пленке', 7000, 4),
('3d_vinyl', '3D Винил 1мм', 'Объемные виниловые наклейки', 8000, 5);
```

---

### 4. products
Продукция

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technology_id VARCHAR(50) NOT NULL REFERENCES technologies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price INTEGER NOT NULL,
    min_quantity INTEGER NOT NULL DEFAULT 1,
    unit VARCHAR(20) NOT NULL DEFAULT 'шт',
    available_sizes JSONB NOT NULL,
    colors JSONB NOT NULL,
    specifications JSONB,
    images JSONB,
    production_time_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_technology ON products(technology_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_price ON products(base_price);
CREATE INDEX idx_products_popular ON products(orders_count DESC);
```

---

### 5. price_tiers
Ценовые уровни для оптовых скидок

```sql
CREATE TABLE price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_from INTEGER NOT NULL,
    quantity_to INTEGER,
    price INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_tiers_product ON price_tiers(product_id);
CREATE INDEX idx_price_tiers_quantity ON price_tiers(quantity_from, quantity_to);
```

---

### 6. orders
Заказы

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending_payment' 
        CHECK (status IN ('pending_payment', 'paid', 'processing', 'ready', 'completed', 'cancelled')),
    subtotal INTEGER NOT NULL,
    delivery_cost INTEGER DEFAULT 0,
    vat INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'UZS',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_method VARCHAR(50) NOT NULL,
    delivery_city VARCHAR(255),
    delivery_address TEXT,
    delivery_phone VARCHAR(20),
    notes TEXT,
    estimated_completion TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Функция для генерации номера заказа
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'TS-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                        LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();
```

---

### 7. order_items
Позиции заказов

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    technology_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    width_cm DECIMAL(10,2),
    height_cm DECIMAL(10,2),
    color_mode VARCHAR(50),
    has_white_layer BOOLEAN DEFAULT false,
    unit_price INTEGER NOT NULL,
    total INTEGER NOT NULL,
    specifications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

---

### 8. files
Загруженные файлы

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    preview_path VARCHAR(500),
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    validation_data JSONB,
    is_valid BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_order ON files(order_id);
CREATE INDEX idx_files_order_item ON files(order_item_id);
```

---

### 9. payments
Платежи

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    payment_method VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'UZS',
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    payment_url VARCHAR(500),
    provider_response JSONB,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
```

---

### 10. order_timeline
История изменений статуса заказа

```sql
CREATE TABLE order_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeline_order ON order_timeline(order_id);
CREATE INDEX idx_timeline_created ON order_timeline(created_at DESC);

-- Триггер для автоматического добавления в timeline
CREATE OR REPLACE FUNCTION add_order_timeline()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_timeline (order_id, status, note)
    VALUES (NEW.id, NEW.status, 'Статус изменен');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION add_order_timeline();
```

---

### 11. notifications
Уведомления

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    sent_via JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

### 12. admin_settings
Настройки системы

```sql
CREATE TABLE admin_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Настройки по умолчанию
INSERT INTO admin_settings (key, value, description) VALUES
('vat_rate', '0.15', 'Ставка НДС (15%)'),
('delivery_tashkent', '0', 'Стоимость доставки по Ташкенту'),
('delivery_regions', '50000', 'Стоимость доставки по регионам'),
('min_order_amount', '100000', 'Минимальная сумма заказа'),
('working_hours', '{"start": "09:00", "end": "18:00"}', 'Рабочие часы');
```

---

## Связи между таблицами

```
users (1) ──→ (N) orders
users (1) ──→ (N) files
users (1) ──→ (N) notifications
users (1) ──→ (N) user_sessions

technologies (1) ──→ (N) products

products (1) ──→ (N) price_tiers
products (1) ──→ (N) order_items

orders (1) ──→ (N) order_items
orders (1) ──→ (N) files
orders (1) ──→ (N) payments
orders (1) ──→ (N) order_timeline

order_items (1) ──→ (N) files
```

---

## Индексы для оптимизации

### Композитные индексы
```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_products_tech_active ON products(technology_id, is_active);
```

### Full-text search
```sql
CREATE INDEX idx_products_search ON products 
USING gin(to_tsvector('russian', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_users_search ON users 
USING gin(to_tsvector('russian', full_name || ' ' || COALESCE(company_name, '')));
```

---

## Партиционирование (для масштабирования)

### Партиционирование orders по дате
```sql
CREATE TABLE orders_2025 PARTITION OF orders
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE orders_2026 PARTITION OF orders
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

---

## Представления (Views)

### Популярные продукты
```sql
CREATE VIEW popular_products AS
SELECT 
    p.*,
    t.name as technology_name,
    COUNT(oi.id) as total_orders,
    SUM(oi.quantity) as total_quantity
FROM products p
JOIN technologies t ON p.technology_id = t.id
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.is_active = true
GROUP BY p.id, t.name
ORDER BY total_orders DESC;
```

### Статистика пользователей
```sql
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.user_type,
    COUNT(o.id) as orders_count,
    COALESCE(SUM(o.total), 0) as total_spent,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
GROUP BY u.id;
```

---

## Миграции (Alembic)

### Пример миграции
```python
"""add_3d_vinyl_technology

Revision ID: 001
Revises: 
Create Date: 2025-12-29

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.execute("""
        INSERT INTO technologies (id, name, description, min_price, production_time_days)
        VALUES ('3d_vinyl', '3D Винил 1мм', 'Объемные виниловые наклейки', 8000, 5)
    """)

def downgrade():
    op.execute("DELETE FROM technologies WHERE id = '3d_vinyl'")
```

---

## Резервное копирование

### Ежедневный бэкап
```bash
pg_dump -h localhost -U postgres -d termostick \
  --format=custom --file=backup_$(date +%Y%m%d).dump
```

### Восстановление
```bash
pg_restore -h localhost -U postgres -d termostick backup_20251229.dump
```

---

## Производительность

### Статистика запросов
```sql
-- Медленные запросы
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Размер таблиц
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```