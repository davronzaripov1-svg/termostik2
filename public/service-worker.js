const CACHE_NAME = 'termostick-v1.0.0';
const RUNTIME_CACHE = 'termostick-runtime';

// Ресурсы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/photo1767009117.jpg',
  '/images/ServiceWorker.jpg'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Обработка fetch запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') {
    return;
  }

  // Пропускаем запросы к внешним API
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          // Кэшируем только успешные GET запросы
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          // Возвращаем офлайн страницу при отсутствии соединения
          return caches.match('/index.html');
        });
      });
    })
  );
});

// Обработка push уведомлений (для будущего использования)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TermoStick';
  const options = {
    body: data.body || 'Новое уведомление от TermoStick',
    icon: '/images/photo1767009117.jpg',
    badge: '/images/Notification.jpg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Обработка синхронизации в фоне (для будущего использования)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // Логика синхронизации заказов
  console.log('[Service Worker] Syncing orders...');
}