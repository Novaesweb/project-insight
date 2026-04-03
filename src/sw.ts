/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Inject automatic compiled manifest map by Vite PWA
precacheAndRoute(self.__WB_MANIFEST || []);

// Service Worker for Push Notifications - NovaesWeb v2
self.addEventListener('push', function(event) {
  let data: { title: string; body: string; icon: string; url: string; tag?: string } = { title: 'NovaesWeb', body: 'Nova notificação', icon: '/push-icon-192.png', url: '/' };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options: NotificationOptions = {
    body: data.body,
    icon: data.icon || '/push-icon-192.png',
    badge: '/push-icon-192.png',
    data: {
      url: data.url || '/',
    },
    tag: data.tag || 'novaesweb-notification',
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(function() {
      // Notifica o frontend de que a notificação chegou (útil para atualizar UI se App estiver aberto)
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (const client of clientList) {
          client.postMessage({
            type: 'PUSH_NOTIFICATION_RECEIVED',
            title: data.title,
            body: data.body,
          });
        }
      });
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
