self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Daily Buddy';
  const options = {
    body: data.body || 'You have a new notification.',
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
