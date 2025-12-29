# Документация по интеграции Frontend-Backend
## Проект: TermoStick

---

## 1. Обзор интеграции

Этот документ описывает процесс интеграции React frontend приложения с backend API. Frontend построен на React + TypeScript + Vite, backend должен быть реализован согласно `/workspace/shadcn-ui/docs/backend-requirements.md`.

**Текущее состояние:**
- ✅ Frontend полностью готов с mock данными
- ✅ Все компоненты и страницы реализованы
- ⏳ Требуется подключение к backend API
- ⏳ Требуется замена localStorage на API вызовы

---

## 2. Текущая структура данных Frontend

### 2.1. Products (src/data/products.ts)

**Интерфейс Product:**
```typescript
export interface Product {
  id: string;                    // Уникальный ID продукта
  technology_id: string;         // ID технологии (dtf, vinyl, uv_dtf, 3d_vinyl)
  name: string;                  // Название продукта
  description: string;           // Описание
  base_price: number;            // Базовая цена в UZS
  min_quantity: number;          // Минимальное количество для заказа
  unit: string;                  // Единица измерения (шт, лист)
  available_sizes: string[];     // Доступные размеры
  colors: string[];              // Доступные цвета
  image_url: string;             // URL изображения
  production_time_days: number;  // Срок изготовления в днях
  price_tiers: PriceTier[];      // Ценовые уровни
  specifications: Record<string, string>; // Технические характеристики
}

export interface PriceTier {
  from: number;        // Минимальное количество
  to: number | null;   // Максимальное количество (null = без ограничений)
  price: number;       // Цена за единицу
}
```

**Текущие данные:**
- 8 продуктов (DTF, Vinyl, UV DTF, 3D Vinyl)
- Хранятся в статическом массиве `products`
- Используются напрямую в компонентах

**Требуется:**
- Загрузка из API `GET /products`
- Кэширование в React Query или SWR
- Обновление при изменениях

### 2.2. Technologies (src/data/technologies.ts)

**Интерфейс Technology:**
```typescript
export interface Technology {
  id: string;                    // Уникальный ID технологии
  name: string;                  // Название
  description: string;           // Описание
  icon_url: string;              // URL иконки
  features: string[];            // Список преимуществ
  min_price: number;             // Минимальная цена
  production_time_days: number;  // Срок изготовления
  color: string;                 // Цвет для UI (hex)
}
```

**Текущие данные:**
- 4 технологии (DTF, Vinyl, UV DTF, 3D Vinyl)
- Статический массив
- Используется для фильтрации и отображения

**Требуется:**
- Опционально: загрузка из API `GET /technologies`
- Или оставить статическими (не критично)

### 2.3. Cart (src/hooks/useCart.ts)

**Интерфейс CartItem:**
```typescript
interface CartItem {
  id: string;                    // Уникальный ID позиции в корзине
  product: Product;              // Полная информация о продукте
  quantity: number;              // Количество
  color_mode: string;            // Режим цвета (CMYK, CMYK+White)
  has_white_layer: boolean;      // Наличие белого подслоя
  unit_price: number;            // Цена за единицу (с учетом тиража)
  total: number;                 // Общая стоимость позиции
}
```

**Текущее хранение:**
- localStorage с ключом `termostick-cart`
- Синхронизация через custom hook `useCart`
- Автоматический пересчет цен при изменении количества

**Требуется:**
- Для неавторизованных: оставить localStorage
- Для авторизованных: синхронизация с API
  - `GET /cart` - загрузка корзины
  - `POST /cart/items` - добавление товара
  - `PUT /cart/items/{id}` - обновление количества
  - `DELETE /cart/items/{id}` - удаление товара
  - `DELETE /cart` - очистка корзины

### 2.4. User Authentication

**Текущее состояние:**
- Нет реализации аутентификации
- Страница Profile использует mock данные
- Нет защиты роутов

**Требуется:**
- Реализация AuthContext
- Хранение JWT токенов
- Защита приватных роутов
- Автоматическое обновление токенов

---

## 3. Карта интеграции API

### 3.1. Страница Home (src/pages/Home.tsx)

**Используемые данные:**
- `technologies` - статический массив (опционально из API)
- Статистика - mock данные

**API endpoints:**
- `GET /stats/public` - публичная статистика (опционально)
  ```json
  {
    "total_orders": 5000,
    "happy_clients": 500,
    "technologies_count": 4
  }
  ```

**Приоритет:** Низкий (можно оставить статические данные)

### 3.2. Страница Catalog (src/pages/Catalog.tsx)

**Используемые данные:**
- `products` - список всех продуктов
- `technologies` - для фильтрации

**Текущая логика:**
- Клиентская фильтрация по поиску
- Клиентская фильтрация по технологии
- Клиентская сортировка

**API endpoints:**
```typescript
// Получить список продуктов с фильтрацией
GET /products?page=1&limit=20&technology=DTF&search=термо&sort=price_asc

Response:
{
  "success": true,
  "data": {
    "products": Product[],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 48,
      "items_per_page": 20
    }
  }
}
```

**Требуемые изменения:**
1. Заменить статический массив на API вызов
2. Использовать серверную пагинацию
3. Передавать фильтры в query параметрах
4. Добавить состояния загрузки и ошибок

**Пример кода:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function Catalog() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    technology: 'all',
    sort: 'popular'
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, filters],
    queryFn: () => api.getProducts({ page, ...filters })
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    // ... render products from data.products
  );
}
```

**Приоритет:** Высокий

### 3.3. Страница Cart (src/pages/Cart.tsx)

**Используемые данные:**
- `useCart()` hook - корзина из localStorage

**Текущая логика:**
- Добавление/удаление товаров
- Обновление количества
- Расчет итоговой суммы
- Расчет доставки и НДС

**API endpoints (для авторизованных пользователей):**

```typescript
// Получить корзину
GET /cart
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product": Product,
        "quantity": 50,
        "unit_price": 12000,
        "total_price": 600000,
        "custom_width_cm": 30,
        "custom_height_cm": 40
      }
    ],
    "summary": {
      "subtotal": 600000,
      "discount": 0,
      "tax": 90000,
      "shipping": 50000,
      "total": 740000
    }
  }
}

// Добавить товар в корзину
POST /cart/items
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "product_id": 1,
  "quantity": 50,
  "custom_width_cm": 30,
  "custom_height_cm": 40
}

Response:
{
  "success": true,
  "data": {
    "item": CartItem,
    "cart_summary": { ... }
  }
}

// Обновить количество
PUT /cart/items/{id}
Authorization: Bearer {token}

Request:
{
  "quantity": 100
}

// Удалить товар
DELETE /cart/items/{id}
Authorization: Bearer {token}

// Очистить корзину
DELETE /cart
Authorization: Bearer {token}
```

**Требуемые изменения:**
1. Создать `useAuthCart()` hook для авторизованных
2. Синхронизация localStorage с API при входе
3. Автоматическое обновление при изменениях
4. Оптимистичные обновления UI

**Пример кода:**
```typescript
// src/hooks/useAuthCart.ts
export function useAuthCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Загрузка корзины
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: api.getCart,
    enabled: !!user
  });

  // Добавление товара
  const addItem = useMutation({
    mutationFn: api.addToCart,
    onMutate: async (newItem) => {
      // Оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      
      queryClient.setQueryData(['cart'], (old) => ({
        ...old,
        items: [...old.items, newItem]
      }));

      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Откат при ошибке
      queryClient.setQueryData(['cart'], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  return { cart, addItem, ... };
}
```

**Приоритет:** Высокий

### 3.4. Страница Profile (src/pages/Profile.tsx)

**Используемые данные:**
- Mock данные пользователя
- Mock данные заказов

**API endpoints:**

```typescript
// Получить профиль
GET /users/me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+998901234567",
    "full_name": "Иван Иванов",
    "company_name": "ООО Принт Студия",
    "role": "user",
    "stats": {
      "total_orders": 15,
      "total_spent": 9750000,
      "average_order": 650000
    }
  }
}

// Обновить профиль
PUT /users/me
Authorization: Bearer {token}

Request:
{
  "full_name": "Иван Петрович Иванов",
  "company_name": "ООО Новая Принт Студия",
  "city": "Самарканд"
}

// Получить заказы
GET /orders?page=1&limit=10
Authorization: Bearer {token}

Response:
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
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}

// Получить детали заказа
GET /orders/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "TS-2024-00001",
    "status": "processing",
    "items": [...],
    "payment": {...},
    "delivery": {...}
  }
}
```

**Требуемые изменения:**
1. Загрузка профиля из API
2. Загрузка истории заказов
3. Форма редактирования профиля
4. Детальный просмотр заказа

**Приоритет:** Средний

### 3.5. Страница Calculator (src/pages/Calculator.tsx)

**Используемые данные:**
- `products` - для выбора продукции
- Клиентский расчет цен

**API endpoints:**

```typescript
// Рассчитать стоимость заказа
POST /calculator/price

Request:
{
  "items": [
    {
      "product_id": 1,
      "quantity": 50,
      "custom_width_cm": 30,
      "custom_height_cm": 40
    }
  ],
  "delivery_method": "courier",
  "delivery_city": "Ташкент",
  "promo_code": "WINTER2024"
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "product_id": 1,
        "product_name": "DTF Transfer",
        "quantity": 50,
        "unit_price": 12000,
        "subtotal": 600000,
        "discount_applied": 20
      }
    ],
    "subtotal": 600000,
    "discount": {
      "promo_code": "WINTER2024",
      "amount": 60000
    },
    "tax": 81000,
    "shipping": 50000,
    "total": 671000,
    "production_days": 3,
    "estimated_delivery": "2024-01-20"
  }
}
```

**Требуемые изменения:**
1. Использовать API для точного расчета
2. Валидация промокодов
3. Расчет доставки по городу

**Приоритет:** Средний

### 3.6. Компонент ProductCard (src/components/ProductCard.tsx)

**Функционал:**
- Отображение карточки продукта
- Кнопка "Добавить в корзину"

**Требуемые изменения:**
1. Обработка добавления через API (если авторизован)
2. Показ уведомлений об успехе/ошибке
3. Обновление счетчика корзины

**Пример кода:**
```typescript
export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = user ? useAuthCart() : useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem({
        product_id: product.id,
        quantity: product.min_quantity,
        color_mode: 'CMYK Full Color'
      });
      toast.success('Товар добавлен в корзину');
    } catch (error) {
      toast.error('Ошибка при добавлении товара');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      {/* ... */}
      <Button 
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? 'Добавление...' : 'В корзину'}
      </Button>
    </Card>
  );
}
```

**Приоритет:** Высокий

---

## 4. Система аутентификации

### 4.1. AuthContext

**Создать:** `src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'manager';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверить наличие токена при загрузке
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      // Токен невалидный, удалить
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    setUser(response.user);
    
    // Синхронизировать корзину из localStorage с сервером
    await syncCart();
  };

  const register = async (data: RegisterData) => {
    const response = await api.register(data);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');

    const response = await api.refreshToken(refresh);
    localStorage.setItem('access_token', response.access_token);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 4.2. Защищенные роуты

**Создать:** `src/components/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

**Обновить роутинг:**
```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/catalog" element={<Catalog />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Защищенные роуты */}
  <Route path="/profile" element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } />
  <Route path="/cart" element={
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  } />
  
  {/* Админ роуты */}
  <Route path="/admin/*" element={
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  } />
</Routes>
```

---

## 5. API Client

### 5.1. Axios Instance

**Создать:** `src/lib/api.ts`

```typescript
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - добавить токен
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - обновить токен при 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token невалидный, выйти
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 5.2. API Methods

**Продолжить в:** `src/lib/api.ts`

```typescript
// Authentication
export const api = {
  // Auth
  async login(email: string, password: string) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data.data;
  },

  async register(userData: RegisterData) {
    const { data } = await apiClient.post('/auth/register', userData);
    return data.data;
  },

  async refreshToken(refreshToken: string) {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return data.data;
  },

  async getCurrentUser() {
    const { data } = await apiClient.get('/users/me');
    return data.data;
  },

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    technology?: string;
    search?: string;
    sort?: string;
  }) {
    const { data } = await apiClient.get('/products', { params });
    return data.data;
  },

  async getProduct(id: string) {
    const { data } = await apiClient.get(`/products/${id}`);
    return data.data;
  },

  // Cart
  async getCart() {
    const { data } = await apiClient.get('/cart');
    return data.data;
  },

  async addToCart(item: {
    product_id: number;
    quantity: number;
    custom_width_cm?: number;
    custom_height_cm?: number;
  }) {
    const { data } = await apiClient.post('/cart/items', item);
    return data.data;
  },

  async updateCartItem(id: number, quantity: number) {
    const { data } = await apiClient.put(`/cart/items/${id}`, { quantity });
    return data.data;
  },

  async removeFromCart(id: number) {
    const { data } = await apiClient.delete(`/cart/items/${id}`);
    return data.data;
  },

  async clearCart() {
    const { data } = await apiClient.delete('/cart');
    return data.data;
  },

  // Orders
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const { data } = await apiClient.get('/orders', { params });
    return data.data;
  },

  async getOrder(id: number) {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data.data;
  },

  async createOrder(orderData: {
    delivery_method: string;
    delivery_address: string;
    delivery_city: string;
    delivery_phone: string;
    payment_method: string;
    promo_code?: string;
    customer_notes?: string;
  }) {
    const { data } = await apiClient.post('/orders', orderData);
    return data.data;
  },

  // Calculator
  async calculatePrice(items: Array<{
    product_id: number;
    quantity: number;
    custom_width_cm?: number;
    custom_height_cm?: number;
  }>, options?: {
    delivery_method?: string;
    delivery_city?: string;
    promo_code?: string;
  }) {
    const { data } = await apiClient.post('/calculator/price', { items, ...options });
    return data.data;
  },

  // File Upload
  async uploadDesignFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post('/uploads/design', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },

  // Profile
  async updateProfile(profileData: {
    full_name?: string;
    company_name?: string;
    city?: string;
    address?: string;
    telegram_username?: string;
  }) {
    const { data } = await apiClient.put('/users/me', profileData);
    return data.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },
};
```

---

## 6. Обработка ошибок

### 6.1. Error Handler

**Создать:** `src/lib/errorHandler.ts`

```typescript
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export function handleApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data?.error as ApiError;

    if (apiError) {
      // Обработка специфичных ошибок
      switch (apiError.code) {
        case 'VALIDATION_ERROR':
          toast.error('Ошибка валидации', {
            description: apiError.message,
          });
          break;
        case 'UNAUTHORIZED':
          toast.error('Требуется авторизация');
          break;
        case 'FORBIDDEN':
          toast.error('Доступ запрещен');
          break;
        case 'NOT_FOUND':
          toast.error('Не найдено', {
            description: apiError.message,
          });
          break;
        case 'RATE_LIMIT_EXCEEDED':
          toast.error('Слишком много запросов', {
            description: 'Пожалуйста, подождите немного',
          });
          break;
        default:
          toast.error('Ошибка сервера', {
            description: apiError.message,
          });
      }
    } else {
      // Сетевая ошибка
      if (error.code === 'ERR_NETWORK') {
        toast.error('Ошибка сети', {
          description: 'Проверьте подключение к интернету',
        });
      } else {
        toast.error('Произошла ошибка', {
          description: error.message,
        });
      }
    }
  } else {
    toast.error('Неизвестная ошибка');
  }
}
```

### 6.2. Использование в компонентах

```typescript
import { handleApiError } from '@/lib/errorHandler';

export default function SomeComponent() {
  const handleSubmit = async () => {
    try {
      await api.someMethod();
      toast.success('Успешно!');
    } catch (error) {
      handleApiError(error);
    }
  };
}
```

---

## 7. React Query Setup

### 7.1. Query Client

**Создать:** `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### 7.2. Setup в App

**Обновить:** `src/main.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 7.3. Custom Hooks

**Создать:** `src/hooks/useProducts.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/errorHandler';

export function useProducts(params?: {
  page?: number;
  limit?: number;
  technology?: string;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.getProduct(id),
    enabled: !!id,
  });
}
```

**Создать:** `src/hooks/useOrders.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function useOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.getOrders(params),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createOrder,
    onSuccess: (data) => {
      toast.success('Заказ создан', {
        description: `Номер заказа: ${data.order.order_number}`,
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: handleApiError,
  });
}
```

---

## 8. Переменные окружения

### 8.1. Создать файл .env

**Создать:** `.env`

```bash
# API Configuration
VITE_API_URL=http://localhost:8000/v1
VITE_API_TIMEOUT=30000

# File Upload
VITE_MAX_FILE_SIZE=52428800  # 50MB in bytes
VITE_ALLOWED_FILE_TYPES=image/png,image/jpeg,application/pdf,image/svg+xml

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false

# Payment (Frontend keys)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 8.2. Создать .env.example

```bash
# API Configuration
VITE_API_URL=https://api.termostick.uz/v1
VITE_API_TIMEOUT=30000

# File Upload
VITE_MAX_FILE_SIZE=52428800
VITE_ALLOWED_FILE_TYPES=image/png,image/jpeg,application/pdf,image/svg+xml

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true

# Payment
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 8.3. Использование

```typescript
// src/config/index.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT),
  maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE),
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [],
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
};
```

---

## 9. Состояния загрузки и ошибок

### 9.1. Loading Components

**Создать:** `src/components/LoadingSpinner.tsx`

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]}`} />
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}
```

### 9.2. Error Components

**Создать:** `src/components/ErrorMessage.tsx`

```typescript
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  error: Error;
  retry?: () => void;
}

export function ErrorMessage({ error, retry }: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Ошибка</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error.message}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry}>
            Попробовать снова
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

### 9.3. Использование в компонентах

```typescript
export default function ProductList() {
  const { data, isLoading, error, refetch } = useProducts();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;
  if (!data?.products.length) return <EmptyState />;

  return (
    <div className="grid gap-6">
      {data.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 10. Инструкции по тестированию

### 10.1. Локальное тестирование

**Шаг 1: Запуск Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Шаг 2: Настройка Frontend**
```bash
cd frontend
cp .env.example .env
# Отредактировать .env: VITE_API_URL=http://localhost:8000/v1
npm install
npm run dev
```

**Шаг 3: Проверка подключения**
1. Открыть http://localhost:5173
2. Открыть DevTools → Network
3. Перейти на страницу Catalog
4. Проверить запрос к `/products`
5. Убедиться, что статус 200 и данные загружаются

### 10.2. Тестирование аутентификации

**Тест 1: Регистрация**
1. Перейти на `/register`
2. Заполнить форму
3. Отправить
4. Проверить:
   - Токены сохранены в localStorage
   - Редирект на главную
   - Пользователь отображается в header

**Тест 2: Вход**
1. Перейти на `/login`
2. Ввести email и пароль
3. Отправить
4. Проверить авторизацию

**Тест 3: Обновление токена**
1. Дождаться истечения access token (1 час)
2. Сделать любой API запрос
3. Проверить:
   - Автоматическое обновление токена
   - Повторный запрос с новым токеном

**Тест 4: Выход**
1. Нажать "Выйти"
2. Проверить:
   - Токены удалены из localStorage
   - Редирект на главную
   - Защищенные страницы недоступны

### 10.3. Тестирование корзины

**Тест 1: Добавление товара (неавторизован)**
1. Открыть каталог
2. Добавить товар в корзину
3. Проверить:
   - Товар добавлен в localStorage
   - Счетчик корзины обновлен
   - Уведомление показано

**Тест 2: Добавление товара (авторизован)**
1. Войти в систему
2. Добавить товар
3. Проверить:
   - API запрос `POST /cart/items`
   - Товар добавлен на сервере
   - UI обновлен

**Тест 3: Синхронизация корзины**
1. Добавить товары в localStorage (неавторизован)
2. Войти в систему
3. Проверить:
   - Товары из localStorage отправлены на сервер
   - localStorage очищен
   - Корзина загружена с сервера

**Тест 4: Обновление количества**
1. Изменить количество товара
2. Проверить:
   - API запрос `PUT /cart/items/{id}`
   - Цена пересчитана
   - UI обновлен оптимистично

### 10.4. Тестирование заказов

**Тест 1: Создание заказа**
1. Добавить товары в корзину
2. Перейти в корзину
3. Нажать "Оформить заказ"
4. Заполнить форму доставки
5. Выбрать способ оплаты
6. Отправить
7. Проверить:
   - API запрос `POST /orders`
   - Редирект на страницу оплаты
   - Корзина очищена

**Тест 2: Просмотр заказов**
1. Перейти в профиль → Заказы
2. Проверить:
   - API запрос `GET /orders`
   - Список заказов отображается
   - Пагинация работает

**Тест 3: Детали заказа**
1. Кликнуть на заказ
2. Проверить:
   - API запрос `GET /orders/{id}`
   - Все детали отображаются
   - Статус заказа показан

### 10.5. Тестирование ошибок

**Тест 1: Сетевая ошибка**
1. Отключить backend
2. Попытаться загрузить каталог
3. Проверить:
   - Показано сообщение об ошибке
   - Кнопка "Попробовать снова"
   - Повторный запрос при клике

**Тест 2: Ошибка 401**
1. Удалить access token из localStorage
2. Попытаться открыть защищенную страницу
3. Проверить:
   - Редирект на /login
   - Сообщение "Требуется авторизация"

**Тест 3: Ошибка 404**
1. Открыть несуществующий продукт
2. Проверить:
   - Показано "Не найдено"
   - Кнопка вернуться в каталог

**Тест 4: Ошибка валидации**
1. Отправить форму с невалидными данными
2. Проверить:
   - Показаны ошибки валидации
   - Поля подсвечены красным
   - Подсказки отображаются

### 10.6. Тестирование производительности

**Тест 1: Загрузка каталога**
- Цель: < 2 секунд
- Проверить:
  - Time to First Byte
  - Размер ответа
  - Кэширование

**Тест 2: Добавление в корзину**
- Цель: < 500ms
- Проверить:
  - Оптимистичное обновление UI
  - Время API запроса

**Тест 3: Поиск**
- Цель: < 1 секунда
- Проверить:
  - Debounce работает
  - Минимум символов для поиска

---

## 11. Чеклист интеграции

### 11.1. Подготовка

- [ ] Backend API развернут и доступен
- [ ] Swagger документация доступна
- [ ] Тестовые данные загружены в БД
- [ ] CORS настроен для frontend домена
- [ ] SSL сертификат установлен (production)

### 11.2. Frontend Setup

- [ ] Установлены зависимости:
  - [ ] @tanstack/react-query
  - [ ] axios
  - [ ] sonner (для toast уведомлений)
- [ ] Создан `.env` файл
- [ ] Настроен API client с interceptors
- [ ] Создан AuthContext
- [ ] Настроен React Query

### 11.3. Аутентификация

- [ ] Страница Login создана
- [ ] Страница Register создана
- [ ] AuthContext реализован
- [ ] JWT токены сохраняются
- [ ] Автоматическое обновление токенов работает
- [ ] Защищенные роуты настроены
- [ ] Выход из системы работает

### 11.4. Products

- [ ] Загрузка из API вместо статических данных
- [ ] Фильтрация работает
- [ ] Сортировка работает
- [ ] Поиск работает
- [ ] Пагинация работает
- [ ] Детальная страница продукта
- [ ] Состояния загрузки
- [ ] Обработка ошибок

### 11.5. Cart

- [ ] useAuthCart hook создан
- [ ] Синхронизация localStorage с API
- [ ] Добавление товара работает
- [ ] Обновление количества работает
- [ ] Удаление товара работает
- [ ] Очистка корзины работает
- [ ] Оптимистичные обновления
- [ ] Обработка ошибок

### 11.6. Orders

- [ ] Создание заказа работает
- [ ] Список заказов загружается
- [ ] Детали заказа отображаются
- [ ] Статусы заказов показываются
- [ ] История заказов работает
- [ ] Фильтрация заказов

### 11.7. Profile

- [ ] Загрузка профиля из API
- [ ] Редактирование профиля работает
- [ ] Загрузка аватара работает
- [ ] Смена пароля работает
- [ ] Статистика отображается

### 11.8. File Upload

- [ ] Загрузка файлов дизайна работает
- [ ] Валидация файлов (размер, формат)
- [ ] Прогресс загрузки показывается
- [ ] Превью файлов отображается
- [ ] Обработка ошибок загрузки

### 11.9. Error Handling

- [ ] Сетевые ошибки обрабатываются
- [ ] Ошибки 401/403 обрабатываются
- [ ] Ошибки 404 обрабатываются
- [ ] Ошибки валидации показываются
- [ ] Toast уведомления работают
- [ ] Retry механизм работает

### 11.10. Testing

- [ ] Регистрация протестирована
- [ ] Вход протестирован
- [ ] Обновление токена протестировано
- [ ] Корзина протестирована
- [ ] Заказы протестированы
- [ ] Профиль протестирован
- [ ] Ошибки протестированы
- [ ] Производительность проверена

### 11.11. Production

- [ ] Environment variables настроены
- [ ] API URL указывает на production
- [ ] HTTPS включен
- [ ] Analytics подключен (опционально)
- [ ] Sentry подключен (опционально)
- [ ] Build оптимизирован
- [ ] Кэширование настроено

---

## 12. Troubleshooting

### 12.1. Проблема: CORS ошибки

**Симптомы:**
```
Access to XMLHttpRequest at 'http://localhost:8000/v1/products' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Решение:**
1. Проверить CORS настройки в backend:
```python
# FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. Убедиться, что frontend делает запросы с правильным origin

### 12.2. Проблема: Токен не обновляется

**Симптомы:**
- Пользователь выходит после 1 часа
- Ошибка 401 при каждом запросе

**Решение:**
1. Проверить interceptor в apiClient
2. Убедиться, что refresh token сохранен
3. Проверить endpoint `/auth/refresh` в backend
4. Добавить логирование в interceptor

### 12.3. Проблема: Корзина не синхронизируется

**Симптомы:**
- Товары в localStorage не появляются на сервере
- Корзина пустая после входа

**Решение:**
1. Проверить функцию `syncCart()` в AuthContext
2. Убедиться, что она вызывается после login
3. Проверить формат данных localStorage
4. Добавить логирование синхронизации

### 12.4. Проблема: Медленная загрузка

**Симптомы:**
- Каталог загружается > 3 секунд
- UI зависает при добавлении в корзину

**Решение:**
1. Проверить размер ответа API
2. Включить компрессию на backend (gzip)
3. Использовать React Query для кэширования
4. Оптимизировать изображения (WebP, lazy loading)
5. Использовать оптимистичные обновления

### 12.5. Проблема: Файлы не загружаются

**Симптомы:**
- Ошибка при загрузке файла дизайна
- "File too large" или "Invalid format"

**Решение:**
1. Проверить `MAX_FILE_SIZE` в .env
2. Убедиться, что backend принимает multipart/form-data
3. Проверить валидацию файлов на backend
4. Добавить клиентскую валидацию перед загрузкой

---

## 13. Следующие шаги

### 13.1. Приоритет 1 (Критично)

1. **Реализовать аутентификацию**
   - Создать Login/Register страницы
   - Настроить AuthContext
   - Защитить роуты

2. **Подключить Products API**
   - Заменить статические данные
   - Реализовать фильтрацию/поиск
   - Добавить пагинацию

3. **Интегрировать Cart API**
   - Создать useAuthCart hook
   - Синхронизация с сервером
   - Оптимистичные обновления

### 13.2. Приоритет 2 (Важно)

4. **Реализовать Orders**
   - Создание заказа
   - История заказов
   - Детали заказа

5. **Обработка ошибок**
   - Error boundaries
   - Toast уведомления
   - Retry механизм

6. **File Upload**
   - Загрузка дизайна
   - Валидация файлов
   - Прогресс загрузки

### 13.3. Приоритет 3 (Желательно)

7. **Оптимизация**
   - Кэширование
   - Lazy loading
   - Code splitting

8. **Analytics**
   - Google Analytics
   - Sentry для ошибок
   - Performance monitoring

9. **PWA Features**
   - Offline mode
   - Push notifications
   - Install prompt

---

## 14. Контакты

**При возникновении вопросов:**

**Frontend Team:**
- GitHub: https://github.com/davronzaripov1-svg/termostik2
- Документация: `/workspace/shadcn-ui/docs/`

**Backend Team:**
- API Docs: https://api.termostick.uz/docs
- Backend Requirements: `/workspace/shadcn-ui/docs/backend-requirements.md`

**Project Manager:**
- Telegram: @termostick_pm
- Email: pm@termostick.uz

---

## Заключение

Эта документация описывает полный процесс интеграции frontend с backend API. Следуйте пошаговым инструкциям, используйте чеклист для отслеживания прогресса, и обращайтесь к примерам кода при реализации.

**Ключевые принципы:**
1. **Постепенная интеграция** - начните с критичных функций
2. **Обработка ошибок** - всегда показывайте понятные сообщения
3. **Оптимистичные обновления** - улучшайте UX
4. **Кэширование** - используйте React Query эффективно
5. **Тестирование** - проверяйте каждую функцию

Удачи в интеграции! 🚀