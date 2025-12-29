# TermoStick API Documentation (Swagger)

## API Overview

**Base URL:** `https://api.termostick.com/v1`

**Authentication:** JWT Bearer Token

**Content-Type:** `application/json`

**API Version:** 1.0.0

---

## Authentication Endpoints

### 1. POST /auth/register
Регистрация нового пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "+998901234567",
  "full_name": "Иван Иванов",
  "user_type": "business",
  "company_name": "ООО Принт",
  "telegram": "@username"
}
```

**Response 201:**
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Errors:**
- 400: Invalid input data
- 409: Email already exists

---

### 2. POST /auth/login
Вход в систему

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Errors:**
- 401: Invalid credentials
- 404: User not found

---

### 3. POST /auth/refresh
Обновление access token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
```

---

## Product Endpoints

### 4. GET /products
Получить список продукции с фильтрами

**Query Parameters:**
- `technology` (string): dtf, vinyl, uv_dtf, 3d_vinyl
- `min_price` (number): минимальная цена
- `max_price` (number): максимальная цена
- `page` (number): номер страницы (default: 1)
- `limit` (number): количество на странице (default: 20)
- `sort` (string): price_asc, price_desc, popular

**Response 200:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "DTF Термостикер",
      "technology": "dtf",
      "description": "Профессиональные DTF стикеры",
      "base_price": 5000,
      "min_quantity": 10,
      "unit": "шт",
      "image_url": "https://cdn.termostick.com/products/dtf-1.jpg",
      "available_sizes": ["10x10", "15x15", "20x20"],
      "colors": ["cmyk", "white"],
      "production_time_days": 3
    }
  ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

---

### 5. GET /products/{product_id}
Получить детали продукта

**Response 200:**
```json
{
  "id": "uuid",
  "name": "DTF Термостикер",
  "technology": "dtf",
  "description": "Детальное описание...",
  "base_price": 5000,
  "price_tiers": [
    {"from": 10, "to": 49, "price": 5000},
    {"from": 50, "to": 99, "price": 4500},
    {"from": 100, "to": null, "price": 4000}
  ],
  "specifications": {
    "material": "PET пленка",
    "adhesive": "Hot melt",
    "durability": "50+ стирок",
    "temperature": "160-180°C"
  },
  "images": [
    "https://cdn.termostick.com/products/dtf-1.jpg",
    "https://cdn.termostick.com/products/dtf-2.jpg"
  ]
}
```

---

### 6. GET /technologies
Получить список доступных технологий

**Response 200:**
```json
{
  "technologies": [
    {
      "id": "dtf",
      "name": "DTF Термостикеры",
      "description": "Direct to Film печать",
      "icon_url": "https://cdn.termostick.com/icons/dtf.png",
      "features": [
        "Яркие цвета",
        "Высокая детализация",
        "Подходит для любых тканей"
      ],
      "min_price": 5000,
      "production_time_days": 3
    },
    {
      "id": "vinyl",
      "name": "Виниловые наклейки",
      "description": "Плоттерная резка винила",
      "icon_url": "https://cdn.termostick.com/icons/vinyl.png",
      "features": [
        "Долговечность",
        "Водостойкость",
        "Разные цвета"
      ],
      "min_price": 3000,
      "production_time_days": 2
    }
  ]
}
```

---

## Order Endpoints

### 7. POST /orders/calculate
Рассчитать стоимость заказа

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 50,
      "width_cm": 15,
      "height_cm": 15,
      "color_mode": "cmyk",
      "has_white_layer": true
    }
  ],
  "delivery_city": "Ташкент",
  "delivery_method": "pickup"
}
```

**Response 200:**
```json
{
  "subtotal": 225000,
  "delivery_cost": 0,
  "vat": 33750,
  "total": 258750,
  "currency": "UZS",
  "production_time_days": 3,
  "items_breakdown": [
    {
      "product_id": "uuid",
      "quantity": 50,
      "unit_price": 4500,
      "total": 225000
    }
  ]
}
```

---

### 8. POST /orders
Создать новый заказ

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 50,
      "width_cm": 15,
      "height_cm": 15,
      "color_mode": "cmyk",
      "has_white_layer": true,
      "file_ids": ["uuid1", "uuid2"]
    }
  ],
  "delivery": {
    "method": "delivery",
    "city": "Ташкент",
    "address": "ул. Амира Темура 123",
    "phone": "+998901234567"
  },
  "payment_method": "click",
  "notes": "Срочный заказ"
}
```

**Response 201:**
```json
{
  "order_id": "uuid",
  "order_number": "TS-2025-001234",
  "status": "pending_payment",
  "total": 258750,
  "payment_url": "https://click.uz/pay/...",
  "created_at": "2025-12-29T10:00:00Z",
  "estimated_completion": "2026-01-01T18:00:00Z"
}
```

---

### 9. GET /orders
Получить список заказов пользователя

**Headers:**
- `Authorization: Bearer {access_token}`

**Query Parameters:**
- `status` (string): pending, processing, completed, cancelled
- `page` (number)
- `limit` (number)

**Response 200:**
```json
{
  "orders": [
    {
      "order_id": "uuid",
      "order_number": "TS-2025-001234",
      "status": "processing",
      "total": 258750,
      "items_count": 1,
      "created_at": "2025-12-29T10:00:00Z",
      "estimated_completion": "2026-01-01T18:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 2
}
```

---

### 10. GET /orders/{order_id}
Получить детали заказа

**Headers:**
- `Authorization: Bearer {access_token}`

**Response 200:**
```json
{
  "order_id": "uuid",
  "order_number": "TS-2025-001234",
  "status": "processing",
  "items": [
    {
      "product_name": "DTF Термостикер",
      "quantity": 50,
      "size": "15x15 см",
      "unit_price": 4500,
      "total": 225000,
      "files": [
        {
          "filename": "logo.png",
          "url": "https://cdn.termostick.com/files/...",
          "preview_url": "https://cdn.termostick.com/previews/..."
        }
      ]
    }
  ],
  "subtotal": 225000,
  "delivery_cost": 0,
  "vat": 33750,
  "total": 258750,
  "payment": {
    "method": "click",
    "status": "paid",
    "paid_at": "2025-12-29T10:05:00Z"
  },
  "delivery": {
    "method": "pickup",
    "address": "г. Ташкент, ул. Производственная 45"
  },
  "timeline": [
    {
      "status": "created",
      "timestamp": "2025-12-29T10:00:00Z",
      "note": "Заказ создан"
    },
    {
      "status": "paid",
      "timestamp": "2025-12-29T10:05:00Z",
      "note": "Оплата получена"
    },
    {
      "status": "processing",
      "timestamp": "2025-12-29T11:00:00Z",
      "note": "Заказ в производстве"
    }
  ]
}
```

---

## File Upload Endpoints

### 11. POST /files/upload
Загрузить файл для заказа

**Headers:**
- `Authorization: Bearer {access_token}`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: File (PNG, PDF, SVG, AI, max 50MB)

**Response 201:**
```json
{
  "file_id": "uuid",
  "filename": "logo.png",
  "size_bytes": 2048576,
  "mime_type": "image/png",
  "url": "https://cdn.termostick.com/files/...",
  "preview_url": "https://cdn.termostick.com/previews/...",
  "validation": {
    "dpi": 300,
    "width_px": 1500,
    "height_px": 1500,
    "color_mode": "CMYK",
    "is_valid": true,
    "warnings": []
  },
  "uploaded_at": "2025-12-29T10:00:00Z"
}
```

**Errors:**
- 400: Invalid file format
- 413: File too large
- 422: Low DPI or quality issues

---

### 12. GET /files/{file_id}
Получить информацию о файле

**Headers:**
- `Authorization: Bearer {access_token}`

**Response 200:**
```json
{
  "file_id": "uuid",
  "filename": "logo.png",
  "url": "https://cdn.termostick.com/files/...",
  "preview_url": "https://cdn.termostick.com/previews/...",
  "validation": {
    "dpi": 300,
    "is_valid": true
  }
}
```

---

## User Profile Endpoints

### 13. GET /profile
Получить профиль пользователя

**Headers:**
- `Authorization: Bearer {access_token}`

**Response 200:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "phone": "+998901234567",
  "full_name": "Иван Иванов",
  "user_type": "business",
  "company_name": "ООО Принт",
  "telegram": "@username",
  "orders_count": 15,
  "total_spent": 3500000,
  "created_at": "2025-01-15T08:00:00Z"
}
```

---

### 14. PUT /profile
Обновить профиль пользователя

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "full_name": "Иван Петрович Иванов",
  "phone": "+998901234567",
  "company_name": "ООО Новый Принт",
  "telegram": "@newusername"
}
```

**Response 200:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "full_name": "Иван Петрович Иванов",
  "updated_at": "2025-12-29T10:00:00Z"
}
```

---

## Admin Endpoints

### 15. GET /admin/orders
Получить все заказы (только для админов)

**Headers:**
- `Authorization: Bearer {admin_access_token}`

**Query Parameters:**
- `status`, `page`, `limit`, `user_id`, `date_from`, `date_to`

**Response 200:**
```json
{
  "orders": [...],
  "total": 1234,
  "page": 1,
  "pages": 62
}
```

---

### 16. PATCH /admin/orders/{order_id}/status
Изменить статус заказа

**Headers:**
- `Authorization: Bearer {admin_access_token}`

**Request Body:**
```json
{
  "status": "completed",
  "note": "Заказ готов к выдаче"
}
```

**Response 200:**
```json
{
  "order_id": "uuid",
  "status": "completed",
  "updated_at": "2025-12-29T10:00:00Z"
}
```

---

## Error Responses

**Standard Error Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 413: Payload Too Large
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

---

## Rate Limiting

- **Anonymous users:** 20 requests/minute
- **Authenticated users:** 100 requests/minute
- **Business users:** 200 requests/minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1735473600
```

---

## Webhooks

### Payment Webhook
**POST /webhooks/payment**

Получение уведомлений от платежных систем (Click, Payme)

### Order Status Webhook
**POST /webhooks/order-status**

Уведомления об изменении статуса заказа для интеграций