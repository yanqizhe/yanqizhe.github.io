/* 样品站 Service Worker：仅在 http(s) 部署时由页面注册，file:// 预览不生效
   策略：本地资源 stale-while-revalidate；导航请求离线回退首页 */
const CACHE = 'rb-sample-v6';
const CORE = [
  './', './index.html', './404.html',
  './assets/style.css', './assets/data.js', './assets/app.js', './assets/icon.svg',
  './manifest.webmanifest', './feed.xml', './sitemap.xml'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* 后台页面与可变数据必须走网络：避免旧缓存遮住刚发布的文章和头像 */
  if (url.pathname.indexOf('/admin/') !== -1 ||
      url.pathname.indexOf('/content/posts.json') !== -1 ||
      url.pathname.indexOf('/content/settings.json') !== -1 ||
      url.pathname.indexOf('/assets/uploads/') !== -1) return;

  /* data.js 内嵌了全部文章：网络优先拿最新数据（首屏秒开新文章），离线回退缓存 */
  if (url.pathname.indexOf('/assets/data.js') !== -1) {
    event.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => {
      const network = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
      return hit || network;
    })
  );
});
