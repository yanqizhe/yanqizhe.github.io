#!/usr/bin/env node
/* 由 content/posts.json 生成 feed.xml 与 sitemap.xml
   用法：node scripts/build-feeds.js [--base https://example.com]
   也可以在环境变量 SITE_BASE 里给域名；默认读 settings.json 的 baseUrl，再退回 GitHub Pages 地址。 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = (p, fallback) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8')); }
  catch (e) { return fallback; }
};

const settings = readJson('content/settings.json', {});
const posts = readJson('content/posts.json', []);

const argBase = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1] : '';
})();
const BASE = String(argBase || process.env.SITE_BASE || settings.baseUrl || 'https://yanqizhe.github.io')
  .replace(/\/+$/, '');

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const isPublished = (p) => {
  if (!p) return false;
  if (p.draft === true || p.draft === 'true') return false;
  if (p.publishAt) {
    const at = Date.parse(p.publishAt);
    if (at && at > Date.now()) return false;
  }
  return true;
};

const live = posts.filter(isPublished)
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const rfc822 = (ymd) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(ymd || ''));
  if (!m) return new Date().toUTCString();
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return weekday[d.getUTCDay()] + ', ' + String(d.getUTCDate()).padStart(2, '0') + ' ' +
    months[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' 00:00:00 GMT';
};

const postUrl = (p) => BASE + '/post.html?slug=' + encodeURIComponent(p.slug);

const newest = live[0] ? live[0].date : new Date().toISOString().slice(0, 10);

const feed = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '<channel>',
  '  <title>' + esc((settings.name || 'Blog') + (settings.suffix ? ' · ' + settings.suffix : '')) + '</title>',
  '  <link>' + esc(BASE + '/') + '</link>',
  '  <atom:link href="' + esc(BASE + '/feed.xml') + '" rel="self" type="application/rss+xml"/>',
  '  <description>' + esc(settings.description || '') + '</description>',
  '  <language>zh-CN</language>',
  '  <lastBuildDate>' + rfc822(newest) + '</lastBuildDate>',
  ...live.map((p) => [
    '  <item>',
    '    <title>' + esc(p.title) + '</title>',
    '    <link>' + esc(postUrl(p)) + '</link>',
    '    <guid isPermaLink="false">' + esc('post:' + p.slug) + '</guid>',
    '    <pubDate>' + rfc822(p.date) + '</pubDate>',
    '    <description>' + esc(p.subtitle || '') + '</description>',
    '    <category>' + esc(p.category || 'Original') + '</category>',
    ...(Array.isArray(p.tags) ? p.tags : []).map((t) => '    <category>' + esc(t) + '</category>'),
    '  </item>'
  ].join('\n')),
  '</channel>',
  '</rss>',
  ''
].join('\n');

const staticPages = [
  ['index.html', '1.0', 'daily'],
  ['archives.html', '0.7', 'weekly'],
  ['categories.html', '0.6', 'weekly'],
  ['tags.html', '0.6', 'weekly'],
  ['search.html', '0.5', 'monthly'],
  ['friends.html', '0.4', 'monthly'],
  ['about.html', '0.5', 'monthly']
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticPages.map(([p, pr, freq]) => [
    '  <url>',
    '    <loc>' + esc(BASE + '/' + p) + '</loc>',
    '    <lastmod>' + newest + '</lastmod>',
    '    <changefreq>' + freq + '</changefreq>',
    '    <priority>' + pr + '</priority>',
    '  </url>'
  ].join('\n')),
  ...live.map((p) => [
    '  <url>',
    '    <loc>' + esc(postUrl(p)) + '</loc>',
    '    <lastmod>' + esc(p.lastmod || p.date) + '</lastmod>',
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.8</priority>',
    '  </url>'
  ].join('\n')),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(root, 'feed.xml'), feed, 'utf8');
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
console.log('feed.xml / sitemap.xml updated · ' + live.length + ' posts · base ' + BASE);
