// Dedicated Service Worker for Push Notifications - NovaesWeb
self.addEventListener('push', function(event) {
  let data = { title: 'NovaesWeb', body: 'Nova notificação', icon: '/push-logo.png' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/push-logo.png',
    badge: '/push-logo.png',
    vibrate: [200, 100, 200, 100, 200],
    sound: '/notification-sound.mp3',
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [],
    tag: data.tag || 'novaesweb-notification',
    renotify: true,
    requireInteraction: false,
    silent: false,
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
