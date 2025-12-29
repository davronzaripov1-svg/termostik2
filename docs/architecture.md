# TermoStick - Архитектура системы

## Обзор

TermoStick - это мобильное веб-приложение для онлайн-продажи термостикеров и текстильной продукции с поддержкой B2B и B2C сегментов.

## Архитектура высокого уровня

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Mobile     │  │   Tablet     │  │   Desktop    │      │
│  │   Browser    │  │   Browser    │  │   Browser    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                     React SPA (PWA)                          │
└─────────────────────────────────────────────────────────────┘
                             │
                    HTTPS / REST API
                             │
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY                              │
│                    (FastAPI + JWT)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication  │  Rate Limiting  │  API Versioning │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   Order        │  │   Product       │  │   User         │
│   Service      │  │   Service       │  │   Service      │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Redis      │  │   S3/CDN     │      │
│  │  (Main DB)   │  │   (Cache)    │  │   (Files)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Click/Payme │  │   Telegram   │  │   SMS/Email  │      │
│  │  (Payment)   │  │   (Notify)   │  │   (Notify)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Компоненты системы

### 1. Frontend (React + TypeScript)

**Технологии:**
- React 18+ с TypeScript
- Vite для сборки
- Shadcn-UI компоненты
- Tailwind CSS для стилизации
- React Router для навигации
- TanStack Query для управления состоянием
- Zustand для глобального state
- React Hook Form для форм

**Основные модули:**
- **Authentication Module** - регистрация, вход, JWT токены
- **Catalog Module** - каталог продукции с фильтрами
- **Order Builder Module** - конструктор заказов с загрузкой файлов
- **Cart Module** - корзина и расчет стоимости
- **Profile Module** - личный кабинет пользователя
- **Admin Module** - административная панель

**PWA Features:**
- Service Worker для offline режима
- Push уведомления
- Установка на домашний экран
- Кэширование статики

### 2. Backend (FastAPI)

**Технологии:**
- FastAPI (Python 3.11+)
- Pydantic для валидации
- SQLAlchemy ORM
- Alembic для миграций
- JWT для аутентификации
- Celery для фоновых задач
- Redis для кэширования

**Микросервисы:**

#### User Service
- Регистрация и аутентификация
- Управление профилями
- Роли и права доступа (B2B/B2C/Admin)

#### Product Service
- Управление каталогом
- Технологии печати (DTF, Vinyl, UV, 3D)
- Ценообразование
- Минимальные тиражи

#### Order Service
- Создание заказов
- Загрузка файлов
- Валидация макетов (DPI, формат)
- Расчет стоимости
- Статусы заказов

#### Payment Service
- Интеграция Click
- Интеграция Payme
- Обработка платежей
- История транзакций

#### Notification Service
- Push уведомления
- Telegram уведомления
- Email уведомления
- SMS уведомления

### 3. База данных (PostgreSQL)

**Основные таблицы:**
- users - пользователи
- user_profiles - профили пользователей
- products - продукция
- technologies - технологии печати
- orders - заказы
- order_items - позиции заказов
- files - загруженные файлы
- payments - платежи
- notifications - уведомления

**Индексы:**
- user_id на всех связанных таблицах
- order_status для быстрой фильтрации
- created_at для сортировки по дате
- product_technology для фильтрации каталога

### 4. Хранилище файлов (S3)

**Структура:**
```
/uploads
  /users/{user_id}
    /orders/{order_id}
      /original - оригинальные файлы
      /processed - обработанные файлы
      /preview - превью
  /products
    /images - изображения продукции
    /samples - образцы работ
```

**CDN:**
- CloudFlare для ускорения загрузки
- Оптимизация изображений
- Кэширование статики

## Безопасность

### Аутентификация
- JWT токены (Access + Refresh)
- Access token: 15 минут
- Refresh token: 7 дней
- HttpOnly cookies для refresh токенов

### Авторизация
- Role-based access control (RBAC)
- Роли: Guest, Customer, Business, Admin
- Permissions на уровне API endpoints

### Защита данных
- HTTPS only
- Шифрование паролей (bcrypt)
- Валидация всех входных данных
- Rate limiting (100 req/min)
- CORS настройки

### Загрузка файлов
- Проверка MIME типов
- Ограничение размера (50MB)
- Антивирусная проверка
- Изоляция пользовательских файлов

## Масштабирование

### Горизонтальное масштабирование
- Stateless API серверы
- Load balancer (Nginx)
- Репликация PostgreSQL
- Redis cluster

### Вертикальное масштабирование
- Увеличение ресурсов серверов
- Оптимизация запросов к БД
- Индексирование

### Кэширование
- Redis для сессий
- Redis для каталога продукции
- CDN для статики
- Browser cache для assets

### Очереди задач
- Celery для фоновых задач
- RabbitMQ как message broker
- Обработка файлов в фоне
- Отправка уведомлений

## Мониторинг и логирование

### Метрики
- Prometheus для сбора метрик
- Grafana для визуализации
- Alerting при проблемах

### Логирование
- Structured logging (JSON)
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Уровни: DEBUG, INFO, WARNING, ERROR

### Трейсинг
- OpenTelemetry
- Distributed tracing
- Performance monitoring

## Развертывание

### Окружения
- Development (local)
- Staging (test)
- Production (live)

### CI/CD Pipeline
```
Code Push → GitHub
    ↓
Run Tests (pytest, jest)
    ↓
Build Docker Images
    ↓
Push to Registry
    ↓
Deploy to Kubernetes
    ↓
Health Check
    ↓
Production
```

### Инфраструктура
- Kubernetes для оркестрации
- Docker для контейнеризации
- Helm для управления релизами
- GitOps (ArgoCD)

## Интеграции

### Платежные системы
- Click API v2
- Payme Merchant API
- Webhook обработка

### Мессенджеры
- Telegram Bot API
- Push notifications (FCM)

### CRM (будущее)
- REST API интеграция
- Синхронизация клиентов
- Синхронизация заказов

### Маркетплейс (будущее)
- Multi-vendor поддержка
- Комиссионная модель
- Отдельные кабинеты продавцов

## Производительность

### Целевые метрики
- Time to First Byte: < 200ms
- First Contentful Paint: < 1s
- Time to Interactive: < 3s
- API Response Time: < 100ms (p95)

### Оптимизации
- Code splitting
- Lazy loading компонентов
- Image optimization (WebP)
- Gzip compression
- Database query optimization
- Connection pooling

## Резервное копирование

### База данных
- Ежедневные полные бэкапы
- Hourly incremental бэкапы
- Retention: 30 дней
- Тестирование восстановления

### Файлы
- S3 versioning
- Cross-region replication
- Lifecycle policies

## Disaster Recovery

### RTO (Recovery Time Objective)
- Critical: 1 час
- High: 4 часа
- Medium: 24 часа

### RPO (Recovery Point Objective)
- Database: 1 час
- Files: 24 часа

### Failover Strategy
- Active-Passive для БД
- Multi-region для статики
- Automated health checks
- Manual failover процедуры