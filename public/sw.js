// Service Worker for Push Notifications - NovaesWeb v2
// Workbox precache manifest injected by VitePWA at build time
self.__WB_MANIFEST;


self.addEventListener('push', function(event) {
  let data = { title: 'NovaesWeb', body: 'Nova notificação', icon: '/push-icon-192.png', url: '/' };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/push-icon-192.png',
    badge: '/push-icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    tag: data.tag || 'novaesweb-notification',
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(function() {
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
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
