// 桌遊 App 離線快取（資料版本 20261121-223248）
// 看過的東西都存起來，沒網路也能看；按「檢查並更新」時只換掉有變的部分（圖片與文件網址帶內容指紋，沒變就沿用）。
const C = 'bgapp-cache';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.pathname.endsWith('/version.json') || u.pathname.endsWith('/key.json')) return;  // 檢查更新、密碼核對一律走網路
  const keep = u.host === 'raw.githubusercontent.com' || u.host === 'cdnjs.cloudflare.com';  // 規則書檔與 PDF 閱讀器：內容固定，存在不會被清掉的快取
  e.respondWith(caches.open(keep ? 'bgapp-books' : C).then(async c => {
    const hit = await c.match(req);
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r.ok || r.type === 'opaque') c.put(req, r.clone());
      return r;
    } catch (err) {
      if (req.mode === 'navigate') {
        const i = (await c.match('./')) || (await c.match('index.html'));
        if (i) return i;
      }
      throw err;
    }
  }));
});
