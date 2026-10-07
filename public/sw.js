self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Daily Buddy';
  const options = {
    body: data.body || '새로운 알림이 도착했습니다.',
    icon: 'https://buddy.glideos.app/favicon.ico',
    badge: 'https://buddy.glideos.app/favicon.ico',
    data: { url: data.url || 'https://buddy.glideos.app' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
