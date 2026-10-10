// 새 서비스 워커가 다운로드되면 즉시 대기 상태를 건너뛰고 활성화되도록 설정
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Daily Buddy';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: 'https://daily-buddy.glideos.app/favicon.ico',
    badge: 'https://daily-buddy.glideos.app/favicon.ico',
    data: { url: data.url || 'https://daily-buddy.glideos.app' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || 'https://daily-buddy.glideos.app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 이미 글라이드 창이 열려있다면 새로 띄우지 않고 해당 창으로 이동
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('daily-buddy') && 'focus' in client) {
          return client.focus();
        }
      }
      // 창이 닫혀있다면 새 창으로 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
