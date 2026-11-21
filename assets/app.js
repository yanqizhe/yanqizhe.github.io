/* ============================================================
   Refactored Blog · Sample — 交互层
   零依赖；所有数据来自浏览器原生 API 与 assets/data.js
   ============================================================ */
(function () {
  'use strict';

  var D = window.BLOG_DATA;
  if (!D) return;
  var POSTS = D.POSTS, SITE = D.SITE;
  var PAGE = document.body.getAttribute('data-page') || 'home';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /* ---------------- icons (Tabler 风格，全部内联) ---------------- */
  var P = {
    home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
    archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10"/><path d="M10 12h4"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="M21 21l-6 -6"/>',
    link: '<path d="M9 15l6 -6"/><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-1 1"/><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l1 -1"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6l9 -6"/>',
    github: '<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/>',
    rss: '<circle cx="5" cy="19" r="1"/><path d="M4 4a16 16 0 0 1 16 16"/><path d="M4 11a9 9 0 0 1 9 9"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.85 12.15l8.15 -8.15l2 2l-2 2l-2 -2l-2 2l2 2l-3 3l-2 -2l-2 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    code: '<path d="M7 8l-4 4l4 4"/><path d="M17 8l4 4l-4 4"/><path d="M14 4l-4 16"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41 -1.41M6.34 6.34l-1.41 -1.41"/>',
    moon: '<path d="M12 3a9 9 0 1 0 9 9a7 7 0 0 1 -9 -9z"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    hash: '<path d="M5 9h14M5 15h14M11 3l-2 18M17 3l-2 18"/>',
    tag: '<path d="M11 3l9 9a1.5 1.5 0 0 1 0 2l-6 6a1.5 1.5 0 0 1 -2 0l-9 -9v-4a4 4 0 0 1 4 -4h4"/><circle cx="9" cy="9" r="2"/>',
    infinity: '<path d="M9.828 9.172a4 4 0 1 0 0 5.656a10 10 0 0 0 2.172 -2.828a10 10 0 0 1 2.172 -2.828a4 4 0 1 1 0 5.656a10 10 0 0 1 -2.172 -2.828a10 10 0 0 0 -2.172 -2.828"/>',
    left: '<path d="M15 6l-6 6l6 6"/>',
    right: '<path d="M9 6l6 6l-6 6"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    copyright: '<circle cx="12" cy="12" r="9"/><path d="M14 9.75a3.5 3.5 0 0 0 -4 0a3.5 3.5 0 0 0 0 4.5a3.5 3.5 0 0 0 4 0"/>',
    edit: '<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 0 0 -4 -4l-10.5 10.5v4"/><path d="M13.5 6.5l4 4"/>',
    file: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    up: '<path d="M12 5v14M6 11l6 -6l6 6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8 -4M8.6 13.5l6.8 4"/>',
    check: '<path d="M5 12l5 5l9 -9"/>',
    external: '<path d="M12 20h-6a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h6"/><path d="M14 4h6v6M20 4l-9 9"/>',
    command: '<path d="M9 6a3 3 0 1 0 -3 3h12a3 3 0 1 0 -3 -3v12a3 3 0 1 0 3 -3h-12a3 3 0 1 0 3 3z"/>',
    bookmark: '<path d="M6 4h12v16l-6 -4l-6 4z"/>',
    series: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  function icon(name, extra) {
    return '<svg class="icon ' + (extra || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (P[name] || '') + '</svg>';
  }
  function renderIcons(root) {
    $$('[data-icon]', root || document).forEach(function (el) {
      el.innerHTML = icon(el.getAttribute('data-icon'));
      el.removeAttribute('data-icon');
    });
  }

  /* ---------------- theme: auto / light / dark ---------------- */
  var SCHEME_KEY = 'StackColorScheme';
  var schemeLabels = { auto: '自动', light: '浅色', dark: '深色' };
  /* file:// 下 localStorage 会抛错，用会话内变量保证连续切换仍然生效 */
  var currentScheme = null;
  function rawScheme() {
    /* 支持 ?scheme=light|dark 直接预览指定配色，不写入 localStorage */
    var forced = /[?&]scheme=(light|dark)/.exec(location.search);
    if (forced) return forced[1];
    if (currentScheme) return currentScheme;
    try { return localStorage.getItem(SCHEME_KEY) || localStorage.getItem('rb-theme') || 'auto'; }
    catch (e) { return 'auto'; }
  }
  function applyScheme(v) {
    var dark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-scheme', (v === 'dark' || (v === 'auto' && dark)) ? 'dark' : 'light');
    var lab = $('#schemeLabel');
    if (lab) lab.textContent = schemeLabels[v] || '自动';
    var mt = $('#mTheme');
    if (mt) mt.textContent = schemeLabels[v] || '自动';
    var btn = $('#themeBtn');
    if (btn) btn.title = '主题：' + (schemeLabels[v] || '自动') + '（点击切换）';
  }
  function cycleScheme() {
    var order = ['auto', 'light', 'dark'];
    var base = currentScheme || rawScheme();
    var next = order[(order.indexOf(base) + 1) % 3];
    currentScheme = next;
    try { localStorage.setItem(SCHEME_KEY, next); } catch (e) {}
    applyScheme(next);
  }
  applyScheme(rawScheme());
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function () { if (rawScheme() === 'auto') applyScheme('auto'); });
  }

  /* ---------------- shared chrome ---------------- */
  function renderChrome() {
    $('#siteName') && ($('#siteName').textContent = SITE.name);
    $('#siteDescription') && ($('#siteDescription').textContent = SITE.description);
    $('#siteEmoji') && ($('#siteEmoji').textContent = SITE.emoji);
    var avatar = $('#siteAvatar');
    if (avatar) {
      var fallback = avatar.parentNode.querySelector('.avatar-fallback');
      if (SITE.avatar) {
        avatar.src = SITE.avatar;
        avatar.alt = SITE.name + ' 头像';
        avatar.hidden = false;
        if (fallback) fallback.hidden = true;
      } else {
        avatar.hidden = true;
        avatar.removeAttribute('src');
        if (fallback) fallback.hidden = false;
      }
    }
    $('#siteNotice') && ($('#siteNotice').textContent = SITE.notice);
    $('#footerDisclaimer') && ($('#footerDisclaimer').textContent = SITE.disclaimer);
    $('#footerCopyright') && ($('#footerCopyright').textContent = '© ' + SITE.since + ' ' + SITE.name + ' · Sample');
    var pb = $('#footerPowerby');
    if (pb) pb.innerHTML = SITE.powerby.map(function (x) {
      return esc(x[0]) + ': <code class="custom-footer-code">' + esc(x[1]) + '</code>';
    }).join(' ');
    var sl = $('#stackLine');
    if (sl) sl.innerHTML = D.STACK.map(function (s) { return '<span class="chip">' + esc(s) + '</span>'; }).join('');

    $$('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === PAGE) {
        a.parentNode.classList.add('current');
        a.setAttribute('aria-current', 'page');
      }
    });
    renderIcons();

    var toggle = $('#themeBtn');
    if (toggle) toggle.addEventListener('click', cycleScheme);
    var ham = $('#toggleMenu');
    if (ham) ham.addEventListener('click', function () { document.body.classList.toggle('menu-open'); });
    $$('.menu a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
    });
  }

  /* ---------------- inverted index ---------------- */
  var INDEX = Object.create(null), TERM_COUNT = 0;
  function tokenize(text) {
    var out = [], lower = String(text || '').toLowerCase(), m, re = /[a-z0-9]+/g;
    while ((m = re.exec(lower))) out.push(m[0]);
    var cjk = lower.match(/[\u4e00-\u9fff]+/g) || [];
    cjk.forEach(function (seg) {
      if (seg.length === 1) out.push(seg);
      for (var i = 0; i < seg.length - 1; i++) out.push(seg.substr(i, 2));
    });
    return out;
  }
  function buildIndex() {
    POSTS.forEach(function (p, i) { tokenize(p.text).forEach(function (t) {
      if (!INDEX[t]) { INDEX[t] = []; TERM_COUNT++; }
      if (INDEX[t].indexOf(i) < 0) INDEX[t].push(i);
    }); });
  }
  function search(q) {
    var terms = tokenize(q);
    if (!terms.length) return [];
    var score = Object.create(null);
    terms.forEach(function (t) {
      (INDEX[t] || []).forEach(function (i) { score[i] = (score[i] || 0) + 1; });
    });
    return Object.keys(score).map(function (k) {
      var i = +k, p = POSTS[i], lq = q.toLowerCase();
      var bonus = (p.title.toLowerCase().indexOf(lq) >= 0 ? 5 : 0) +
        (p.tags.join(' ').toLowerCase().indexOf(lq) >= 0 ? 3 : 0) +
        (p.subtitle.toLowerCase().indexOf(lq) >= 0 ? 2 : 0);
      return { post: p, score: score[k] + bonus };
    }).sort(function (a, b) {
      return b.score - a.score || (a.post.date < b.post.date ? 1 : -1);
    }).map(function (x) { return x.post; });
  }
  /* 索引在 loadRemotePosts 之后由 start() 统一构建 */
  function rebuildIndex() { INDEX = Object.create(null); TERM_COUNT = 0; buildIndex(); }

  /* ---------------- small render helpers ---------------- */
  function postUrl(p) { return 'post.html?slug=' + encodeURIComponent(p.slug); }
  function catBadge(c) { return '<a class="cat-' + c + '" href="index.html?cat=' + c + '">' + c + '</a>'; }
  function metaHtml(p) {
    return '<footer class="article-meta"><div class="inline-meta">' +
      icon('calendar', 'icon-sm') + '<time class="article-time--published" datetime="' + p.date + '">' + p.date + '</time>' +
      '<span class="sep">·</span>' + icon('clock', 'icon-sm') +
      '<time class="article-time--reading">阅读时长: ' + p.minutes + ' 分钟</time>' +
      (p.words ? '<span class="sep">·</span>' + icon('file', 'icon-sm') + '<span class="article-wordcount">' + p.words + ' 字</span>' : '') +
      '</div></footer>';
  }
  function cardHtml(p) {
    var pin = p.featured ? '<span class="featured-pin" title="置顶"><span data-icon="bookmark"></span>置顶</span>' : '';
    return '<article class="card-with-cover' + (p.featured ? ' is-featured' : '') + '">' +
      '<a class="article-cover-link" href="' + postUrl(p) + '" aria-label="' + esc(p.title) + '的封面">' +
      '<img class="article-cover" src="' + p.coverImage + '" alt="" loading="lazy" decoding="async">' + pin + '</a>' +
      '<header class="article-header"><div class="article-details">' +
      '<header class="article-category">' + catBadge(p.category) + '</header>' +
      '<div class="article-title-wrapper"><h2 class="article-title"><a href="' + postUrl(p) + '">' + esc(p.title) + '</a></h2>' +
      (p.subtitle ? '<h3 class="article-subtitle">' + esc(p.subtitle) + '</h3>' : '') + '</div>' +
      metaHtml(p) + '</div></header></article>';
  }
  function compactHtml(p) {
    return '<article><a href="' + postUrl(p) + '"><div class="article-details">' +
      '<h2 class="article-title">' + esc(p.title) + '</h2>' +
      '<footer class="article-meta"><span class="article-description">' + p.date + ' · ' + p.category +
      ' · ' + p.minutes + ' 分钟</span></footer></div>' +
      '<div class="article-image"><img class="article-cover" src="' + p.coverImage + '" alt="" loading="lazy" decoding="async"></div></a></article>';
  }
  function emptyHtml(msg) {
    return '<div class="card" style="text-align:center;padding:36px 20px;color:var(--card-text-color-secondary)">' + esc(msg) + '</div>';
  }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  /* ---------------- right sidebar widgets ---------------- */
  function renderWidgets() {
    var counts = { Original: 0, Repost: 0 };
    POSTS.forEach(function (p) { counts[p.category]++; });
    if ($('#countOriginal')) $('#countOriginal').textContent = counts.Original;
    if ($('#countRepost')) $('#countRepost').textContent = counts.Repost;
    if ($('#countAll')) $('#countAll').textContent = POSTS.length;

    var years = Object.create(null);
    POSTS.forEach(function (p) { var y = p.date.slice(0, 4); years[y] = (years[y] || 0) + 1; });
    var ys = Object.keys(years).sort().reverse();
    var box = $('#widgetArchives');
    if (box) box.innerHTML = ys.slice(0, 6).map(function (y) {
      return '<div class="archives-year"><a href="archives.html#' + y + '"><span class="year">' + y +
        '</span><span class="count">' + years[y] + '</span></a></div>';
    }).join('') + (ys.length > 6 ? '<div class="archives-year"><a href="archives.html"><span class="year">更多</span></a></div>' : '');

    var cb = $('#widgetCategories');
    if (cb) cb.innerHTML = D.CATEGORIES.map(function (c) {
      return '<a href="index.html?cat=' + c.slug + '">' + esc(c.name) + '</a>';
    }).join('');

    var tagCount = Object.create(null);
    POSTS.forEach(function (p) { p.tags.forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; }); });
    var tags = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a] || a.localeCompare(b, 'zh'); });
    var tb = $('#widgetTags');
    if (tb) tb.innerHTML = tags.slice(0, 10).map(function (t) {
      return '<a href="tags.html?tag=' + encodeURIComponent(t) + '">' + esc(t) + '</a>';
    }).join('');
    window.__TAGS = tags;
    window.__TAGCOUNT = tagCount;
  }

  /* ---------------- search form (right sidebar) ---------------- */
  function bindSearchForm() {
    var form = $('#searchForm'), input = $('#searchInput');
    if (!form || !input) return;
    var q = params.get('q') || '';
    if (q && PAGE !== 'search') input.value = q;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (v) location.href = 'search.html?q=' + encodeURIComponent(v);
    });
    if (PAGE === 'home') {
      input.addEventListener('input', debounce(function () {
        var v = input.value.trim();
        currentQuery = v;
        currentPage = 1;
        renderHome();
      }, 120));
    }
  }

  /* ---------------- home ---------------- */
  var currentQuery = params.get('q') || '', currentPage = Math.max(1, parseInt(params.get('page'), 10) || 1);
  var PER_PAGE = 8;
  function renderHome() {
    var list = $('#postlist');
    if (!list) return;
    var cat = params.get('cat') || '';
    var arr = POSTS.filter(function (p) { return !cat || p.category === cat; });
    if (currentQuery) {
      var hits = search(currentQuery);
      var allowed = {}; hits.forEach(function (p) { allowed[p.slug] = 1; });
      arr = arr.filter(function (p) { return allowed[p.slug]; });
      arr.sort(function (a, b) { return hits.indexOf(a) - hits.indexOf(b); });
    }
    var total = arr.length, pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (currentPage > pages) currentPage = pages;
    var slice = arr.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    $('#pageTitle') && ($('#pageTitle').textContent = cat ? cat + ' 分类文章' : (currentQuery ? '搜索结果' : '最新文章'));
    var meta = $('#searchMeta');
    if (meta) meta.textContent = (currentQuery ? '“' + currentQuery + '” · ' : '') +
      (cat ? cat + ' · ' : '') + '共 ' + total + ' 篇文章' + (pages > 1 ? ' · 第 ' + currentPage + '/' + pages + ' 页' : '');

    list.innerHTML = slice.length ? slice.map(cardHtml).join('') : emptyHtml('没有匹配的文章，换个关键词试试。');
    renderPager(pages, cat);
    if (window.__cvRefresh) window.__cvRefresh();
  }
  function renderPager(pages, cat) {
    var nav = $('#pagination');
    if (!nav) return;
    if (pages <= 1) { nav.innerHTML = ''; return; }
    var link = function (n, label, cls, dis) {
      var qs = [];
      if (cat) qs.push('cat=' + encodeURIComponent(cat));
      if (currentQuery) qs.push('q=' + encodeURIComponent(currentQuery));
      if (n > 1) qs.push('page=' + n);
      var href = 'index.html' + (qs.length ? '?' + qs.join('&') : '');
      return '<a class="page-link ' + (cls || '') + '" ' + (dis ? 'aria-disabled="true"' : 'href="' + href + '"') +
        ' aria-label="Page ' + n + '">' + label + '</a>';
    };
    var html = link(currentPage - 1, icon('left'), 'disabled', currentPage === 1);
    var nums = [];
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - currentPage) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    nums.forEach(function (n) {
      html += n === '…' ? '<button type="button" class="page-link pagination-jump-trigger" aria-label="跳转到页码">' + icon('dots') + '</button>'
        : link(n, String(n), n === currentPage ? 'current' : (Math.abs(n - currentPage) > 2 ? 'hide-on-mobile' : ''));
    });
    html += link(currentPage + 1, icon('right'), '', currentPage === pages);
    nav.innerHTML = html;
    $$('.pagination-jump-trigger', nav).forEach(function (b) {
      b.addEventListener('click', function () { var d = $('#paginationJump'); if (d && d.showModal) d.showModal(); });
    });
    var jump = $('#paginationJump');
    if (jump) {
      var inp = $('#jumpInput');
      if (inp) { inp.max = pages; $('#jumpMax') && ($('#jumpMax').textContent = '(1 - ' + pages + ')'); }
      jump.addEventListener('close', function () {
        var n = parseInt(inp && inp.value, 10);
        if (n && n >= 1 && n <= pages) {
          var qs = [];
          if (cat) qs.push('cat=' + encodeURIComponent(cat));
          if (currentQuery) qs.push('q=' + encodeURIComponent(currentQuery));
          if (n > 1) qs.push('page=' + n);
          location.href = 'index.html' + (qs.length ? '?' + qs.join('&') : '');
        }
      });
    }
  }

  /* ---------------- single post ---------------- */
  function renderPost() {
    var slug = params.get('slug') || 'rebuild-static-blog';
    var idx = -1;
    POSTS.forEach(function (p, i) { if (p.slug === slug) idx = i; });
    if (idx < 0) {
      $('#postContainer') && ($('#postContainer').innerHTML = emptyHtml('没有找到这篇文章。'));
      return;
    }
    var p = POSTS[idx];
    document.title = p.title + ' · ' + SITE.name + ' · Sample';
    $('#postTitle') && ($('#postTitle').textContent = p.title);

    var tocHtml = p.toc.map(function (t) {
      return '<li><a href="#' + t.id + '">' + esc(t.text) + '</a></li>';
    }).join('');
    var wt = $('#widgetToc');
    if (wt) wt.innerHTML = '<ol>' + tocHtml + '</ol>';

    var seriesNav = '';
    if (p.series) {
      var siblings = POSTS.filter(function (o) { return o.series === p.series; });
      seriesNav = '<aside class="series-box"><div class="series-head">' + icon('series', 'icon-sm') +
        '<span>系列文章 · ' + esc(p.series) + '</span><small>' + siblings.length + ' 篇</small></div><ol>' +
        siblings.map(function (o) {
          var cur = o.slug === p.slug;
          return '<li' + (cur ? ' class="current"' : '') + '>' +
            (cur ? '<span>' + esc(o.title) + '</span>' : '<a href="' + postUrl(o) + '">' + esc(o.title) + '</a>') + '</li>';
        }).join('') + '</ol></aside>';
    }
    var coverBanner = '<div class="post-cover"><img src="' + p.coverImage + '" alt="" decoding="async">' +
      '<span class="post-cover-label">' + esc(String(p.cover || '').toUpperCase()) + '</span></div>';
    var crumbs = '<nav class="breadcrumb" aria-label="面包屑导航">' +
      '<a href="index.html">首页</a>' + icon('right', 'icon-sm') +
      '<a href="index.html?cat=' + encodeURIComponent(p.category) + '">' + esc(p.category) + '</a>' +
      icon('right', 'icon-sm') +
      '<span class="breadcrumb-current" title="' + esc(p.title) + '">' + esc(p.title) + '</span></nav>';
    var html = '<article class="main-article">' +
      crumbs + coverBanner +
      '<header class="article-header"><div class="article-details">' +
      '<header class="article-category">' + catBadge(p.category) + '</header>' +
      '<div class="article-title-wrapper"><h2 class="article-title">' + esc(p.title) + '</h2>' +
      (p.subtitle ? '<h3 class="article-subtitle">' + esc(p.subtitle) + '</h3>' : '') + '</div>' +
      metaHtml(p) + '</div></header>' +
      seriesNav +
      '<aside class="article-toc"><details open><summary><div class="article-toc-title">' + icon('list') +
      '<span>目录</span></div></summary><nav class="toc-nav"><ol>' + tocHtml + '</ol></nav></details></aside>' +
      '<section class="article-content">' + p.body + '</section>' +
      '<footer class="article-meta article-footer">' +
      '<section class="article-tags">' + p.tags.map(function (t) {
        return '<a href="tags.html?tag=' + encodeURIComponent(t) + '">' + esc(t) + '</a>';
      }).join('') + '</section>' +
      '<section class="article-copyright inline-meta">' + icon('copyright', 'icon-sm') + '<span>' + esc(SITE.license) + '</span></section>' +
      '<section class="article-lastmod inline-meta">' + icon('edit', 'icon-sm') + '<span>最后更新于 ' + p.lastmod + '（样品值）</span></section>' +
      '<section class="article-source inline-meta">' + icon('file', 'icon-sm') + '<span>正式站由 Hugo 生成 Markdown 源文件；本样品由数据层渲染。</span></section>' +
      '</footer></article>';
    $('#postContainer') && ($('#postContainer').innerHTML = html);
    renderIcons($('#postContainer'));

    /* 相关文章：同标签优先 */
    var scored = POSTS.map(function (o, i) {
      if (i === idx) return null;
      var s = o.tags.reduce(function (a, t) { return a + (p.tags.indexOf(t) >= 0 ? 2 : 0); }, 0) + (o.category === p.category ? 1 : 0);
      return { p: o, s: s };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s || (a.p.date < b.p.date ? 1 : -1); }).slice(0, 5);
    var rel = $('#relatedList');
    if (rel) rel.innerHTML = scored.map(function (x) {
      return '<article><a href="' + postUrl(x.p) + '">' +
        '<img class="related-cover" src="' + x.p.coverImage + '" alt="" loading="lazy" decoding="async">' +
        '<div class="article-details"><h2 class="article-title">' +
        esc(x.p.title) + '</h2><span class="article-time">' + x.p.date + '</span></div></a></article>';
    }).join('');

    var pager = $('#pager');
    if (pager) {
      var prev = POSTS[idx + 1], next = POSTS[idx - 1];
      pager.innerHTML = (prev ? '<a class="prev" href="' + postUrl(prev) + '"><span>← 上一篇</span><strong>' + esc(prev.title) + '</strong></a>' : '<span></span>') +
        (next ? '<a class="next" href="' + postUrl(next) + '"><span>下一篇 →</span><strong>' + esc(next.title) + '</strong></a>' : '<span></span>');
    }
    renderShare(p);
    bindTocHighlight();
  }
  function bindTocHighlight() {
    var links = $$('#widgetToc a, .toc-nav a');
    if (!links.length) return;
    var map = Object.create(null), targets = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      (map[id] = map[id] || []).push(a);
    });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) targets.push({ id: id, el: el });
    });
    if (!targets.length) return;
    targets.sort(function (a, b) {
      return (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });
    var ticking = false, active = '';
    function update() {
      var edge = window.innerHeight * 0.28, current = targets[0].id;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].el.getBoundingClientRect().top <= edge) current = targets[i].id;
        else break;
      }
      if (current !== active) {
        active = current;
        links.forEach(function (a) { a.classList.remove('active'); });
        (map[active] || []).forEach(function (a) { a.classList.add('active'); });
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------------- archives ---------------- */
  function renderArchives() {
    var box = $('#archivesContent');
    if (!box) return;
    var groups = Object.create(null);
    POSTS.forEach(function (p) { var y = p.date.slice(0, 4); (groups[y] = groups[y] || []).push(p); });
    box.innerHTML = Object.keys(groups).sort().reverse().map(function (y) {
      return '<section class="archives-group" id="' + y + '"><h2>' + y + '<small>' + groups[y].length + ' 篇</small></h2>' +
        '<ul class="archives-list">' + groups[y].map(function (p) {
          return '<li><time datetime="' + p.date + '">' + p.date.slice(5) + '</time><a href="' + postUrl(p) + '">' + esc(p.title) + '</a>' +
            '<span class="cat-badge cat-' + p.category + '">' + p.category + '</span></li>';
        }).join('') + '</ul></section>';
    }).join('');
  }

  /* ---------------- categories / tags ---------------- */
  function renderCategories() {
    var box = $('#categoriesContent');
    if (!box) return;
    box.innerHTML = D.CATEGORIES.map(function (c) {
      var n = POSTS.filter(function (p) { return p.category === c.slug; }).length;
      return '<article><a href="index.html?cat=' + c.slug + '"><div class="article-details">' +
        '<h2 class="article-title">' + esc(c.name) + '</h2>' +
        '<footer class="article-meta"><span class="article-description">' + esc(c.desc) + ' · ' + n + ' 篇</span></footer>' +
        '</div><div class="article-image"><span class="thumb ' + c.thumb + '">' + esc(c.slug.charAt(0)) + '</span></div></a></article>';
    }).join('');
  }
  function renderTags() {
    var cloud = $('#tagCloud'), box = $('#tagResults'), head = $('#tagHead');
    if (cloud) cloud.innerHTML = window.__TAGS.map(function (t) {
      return '<a href="tags.html?tag=' + encodeURIComponent(t) + '">' + esc(t) + '<small>' + window.__TAGCOUNT[t] + '</small></a>';
    }).join('');
    if (!box) return;
    var tag = params.get('tag') || '';
    if (!tag) {
      if (head) head.textContent = '全部标签';
      box.innerHTML = emptyHtml('点击上方标签查看对应文章。');
      return;
    }
    if (head) head.textContent = '标签：' + tag;
    var arr = POSTS.filter(function (p) { return p.tags.indexOf(tag) >= 0; });
    box.innerHTML = arr.length ? arr.map(compactHtml).join('') : emptyHtml('该标签下暂无文章。');
  }

  /* ---------------- search page ---------------- */
  function renderSearchPage() {
    var input = $('#searchPageInput'), box = $('#searchResults'), meta = $('#searchPageMeta');
    if (!input || !box) return;
    var q = params.get('q') || '';
    input.value = q;
    function run(v) {
      if (!v.trim()) {
        meta.textContent = '输入关键词开始检索 · 索引含 ' + POSTS.length + ' 篇文章 / ' + TERM_COUNT + ' 个词项';
        box.innerHTML = emptyHtml('试试「性能」「Hugo」「搜索」「字体」。');
        return;
      }
      var arr = search(v);
      meta.textContent = '“' + v + '” · 命中 ' + arr.length + ' 篇 · 倒排索引查表（中文 bigram 分词）';
      box.innerHTML = arr.length ? arr.map(compactHtml).join('') : emptyHtml('没有匹配的文章。');
    }
    run(q);
    var pageForm = $('#searchPageForm');
    if (pageForm) pageForm.addEventListener('submit', function (e) {
      e.preventDefault();
      run(input.value.trim());
      input.focus();
    });
    input.addEventListener('input', debounce(function () {
      var v = input.value.trim();
      var url = 'search.html' + (v ? '?q=' + encodeURIComponent(v) : '');
      try { history.replaceState(null, '', url); } catch (e) {}
      run(v);
    }, 120));
  }

  /* ---------------- friends ---------------- */
  function renderFriends() {
    var box = $('#friendsGrid');
    if (!box) return;
    box.innerHTML = D.FRIENDS.map(function (f) {
      return '<a class="friend-card" href="#"><div class="friend-avatar" style="background:' + f.color + '">' + esc(f.initial) + '</div>' +
        '<h3>' + esc(f.name) + '</h3><p>' + esc(f.desc) + '</p></a>';
    }).join('');
  }

  /* ---------------- debug panel ---------------- */
  /* ---------------- 404：给出可走通的出口 ---------------- */
  function renderNotFound() {
    var box = $('#notfoundSuggest');
    if (box) box.innerHTML = POSTS.slice(0, 6).map(compactHtml).join('');
    var btn = $('#notfoundSearch');
    if (btn) btn.addEventListener('click', function () {
      if (window.__openQuickSearch) window.__openQuickSearch();
    });
  }

  function renderDebug() {
    if (!$('#mFps')) return;
    $('#mPosts').textContent = POSTS.length;
    $('#mTerms').textContent = TERM_COUNT;
    $('#mDom').textContent = document.getElementsByTagName('*').length;
    var fps = 0, frames = 0, last = performance.now();
    function tick(now) {
      frames++;
      if (now - last >= 800) {
        fps = Math.round(frames * 1000 / (now - last));
        $('#mFps').textContent = fps;
        frames = 0; last = now;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var lt = 0, ltMax = 0, loaf = 0;
    try {
      new PerformanceObserver(function (l) {
        l.getEntries().forEach(function (e) { lt++; if (e.duration > ltMax) ltMax = Math.round(e.duration); });
        $('#mLt').textContent = lt; $('#mLtMax').textContent = ltMax;
      }).observe({ type: 'longtask', buffered: true });
    } catch (e) {}
    try {
      new PerformanceObserver(function (l) {
        loaf += l.getEntries().length; $('#mLoaf').textContent = loaf;
      }).observe({ type: 'long-animation-frame', buffered: true });
    } catch (e) {}

    /* ---- Core Web Vitals / Navigation Timing / 资源统计 ---- */
    var set = function (id, v) { var el = $('#' + id); if (el) el.textContent = v; };
    var fmtMs = function (v) { return v == null ? '–' : Math.round(v) + ' ms'; };
    try {
      var fcp = performance.getEntriesByName('first-contentful-paint')[0];
      set('wvFcp', fcp ? fmtMs(fcp.startTime) : '不支持');
    } catch (e) { set('wvFcp', '不支持'); }
    try {
      set('wvLcp', '测量中');
      new PerformanceObserver(function (l) {
        var es = l.getEntries(); if (es.length) set('wvLcp', fmtMs(es[es.length - 1].startTime));
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) { set('wvLcp', '不支持'); }
    var cls = 0;
    try {
      set('wvCls', '0.0000');
      new PerformanceObserver(function (l) {
        l.getEntries().forEach(function (en) { if (!en.hadRecentInput) cls += en.value; });
        set('wvCls', cls.toFixed(4));
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) { set('wvCls', '不支持'); }
    var inp = 0;
    try {
      set('wvInp', '0 ms');
      new PerformanceObserver(function (l) {
        l.getEntries().forEach(function (en) { if (en.duration > inp) inp = en.duration; });
        set('wvInp', inp ? fmtMs(inp) : '0 ms');
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    } catch (e) { set('wvInp', '不支持'); }
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        set('wvDcl', fmtMs(nav.domContentLoadedEventEnd));
        set('wvLoad', fmtMs(nav.loadEventEnd || nav.duration));
        set('wvTransfer', (nav.transferSize / 1024).toFixed(1) + ' KB');
      }
      var rs = performance.getEntriesByType('resource');
      set('wvRes', String(rs.length));
      set('wvBytes', (rs.reduce(function (a, r) { return a + (r.transferSize || 0); }, 0) / 1024).toFixed(1) + ' KB');
    } catch (e) {}
    try {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      set('wvConn', conn ? (conn.effectiveType || '–') + (conn.saveData ? ' · 省流' : '') : '不暴露');
      set('wvHeap', performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + ' MB' : '不暴露');
    } catch (e) {}

    var flags = [
      ['flag-shadow', 'rb-flag-shadow', 'flag-no-shadow'],
      ['flag-anim', 'rb-flag-anim', 'flag-no-anim'],
      ['flag-cv', 'rb-flag-cv', 'flag-no-cv']
    ];
    flags.forEach(function (f) {
      var el = $('#' + f[0]);
      if (!el) return;
      var on = false;
      try { on = localStorage.getItem(f[1]) === '1'; } catch (e) {}
      el.checked = on;
      document.body.classList.toggle(f[2], on);
      el.addEventListener('change', function () {
        document.body.classList.toggle(f[2], el.checked);
        try { localStorage.setItem(f[1], el.checked ? '1' : '0'); } catch (e) {}
      });
    });
  }

  /* ---------------- toast / clipboard ---------------- */
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 1900);
  }
  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:12px;left:12px;width:2px;height:2px;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    var ok = false;
    try { ok = !!document.execCommand('copy'); } catch (e) {}
    if (ok) {
      document.body.removeChild(ta);
      cb();
    } else {
      /* 无剪贴板后端（无头浏览器 / 严格权限）：保留选中态供手动 Ctrl+C */
      toast('剪贴板不可用 · 代码已选中，按 Ctrl+C 复制');
      setTimeout(function () { if (ta.parentNode) ta.parentNode.removeChild(ta); }, 4000);
    }
  }
  function copyText(text, cb) {
    var settled = false;
    var done = function () { if (settled) return; settled = true; cb(); };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      try {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
        /* 部分环境（无头浏览器 / 权限提示被挂起）Promise 既不 resolve 也不 reject */
        setTimeout(function () { if (!settled) fallbackCopy(text, done); }, 500);
      } catch (e) { fallbackCopy(text, done); }
    } else fallbackCopy(text, done);
  }

  /* ---------------- 文章增强：代码复制 / 外链 / 图片放大 ---------------- */
  function enhanceArticle(scope) {
    var root = scope || document;
    renderIcons(root);
    $$('.code-copy', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var block = btn.closest('.codeblock');
        if (!block) return;
        var lines = $$('.line-code', block);
        var text = lines.length ? lines.map(function (n) { return n.textContent; }).join('\n') : '';
        copyText(text, function () {
          btn.classList.add('copied');
          var label = $('.copy-text', btn);
          if (label) label.textContent = '已复制';
          toast('代码已复制 (' + lines.length + ' 行)');
          setTimeout(function () {
            btn.classList.remove('copied');
            if (label) label.textContent = '复制';
          }, 1600);
        });
      });
    });
    $$('.article-content a[href^="http"], .prose a[href^="http"]', root).forEach(function (a) {
      if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
      if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
    });
    $$('.article-content img, .prose img', root).forEach(function (img) {
      img.classList.add('zoomable');
      img.setAttribute('tabindex', '0');
      var open = function () {
        var box = $('#lightbox'), target = $('#lightboxImg');
        if (!box || !target) return;
        target.src = img.currentSrc || img.src;
        target.alt = img.alt || '';
        if (box.showModal) box.showModal(); else box.setAttribute('open', '');
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }
  function bindLightbox() {
    var box = $('#lightbox');
    if (!box) return;
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.id === 'lightboxImg') {
        if (box.close) box.close(); else box.removeAttribute('open');
      }
    });
  }

  /* ---------------- 阅读进度（只改 transform，不触发重排） ---------------- */
  function bindReadingProgress() {
    var bar = $('#readingProgress');
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------------- 分享区 ---------------- */
  function renderShare(p) {
    var box = $('#shareBox');
    if (!box || !p) return;
    var url = location.href, title = p.title;
    box.innerHTML = '<span class="share-label">分享这篇</span>' +
      '<button type="button" class="share-btn" data-share="copy">' + icon('link', 'icon-sm') + '<span>复制链接</span></button>' +
      '<a class="share-btn" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url) + '" target="_blank" rel="noopener noreferrer"><span class="x-mark">𝕏</span><span>Post</span></a>' +
      '<a class="share-btn" href="mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url) + '">' + icon('mail', 'icon-sm') + '<span>邮件</span></a>' +
      (navigator.share ? '<button type="button" class="share-btn" data-share="native">' + icon('share', 'icon-sm') + '<span>系统分享</span></button>' : '');
    var c = $('[data-share="copy"]', box);
    if (c) c.addEventListener('click', function () {
      copyText(url, function () { toast(location.protocol === 'file:' ? '已复制本地预览路径' : '链接已复制'); });
    });
    var n = $('[data-share="native"]', box);
    if (n) n.addEventListener('click', function () {
      navigator.share({ title: title, url: url }).catch(function () {});
    });
  }

  /* ---------------- Ctrl+K 快捷搜索 ---------------- */
  function bindQuickSearch() {
    var dlg = $('#quickSearch'), input = $('#quickSearchInput'), res = $('#quickSearchResults');
    if (!dlg || !input || !res) return;
    var hint = '<p class="qs-hint">输入关键词即时检索 ' + POSTS.length + ' 篇占位文章 · 中文按 bigram 切分 · <kbd>↑↓</kbd> <kbd>Enter</kbd> 打开</p>';
    var sel = -1;
    function run(v) {
      var arr = v ? search(v).slice(0, 8) : [];
      sel = -1;
      if (!v) { res.innerHTML = hint; return; }
      res.innerHTML = arr.length ? arr.map(function (p, i) {
        return '<a class="qs-item" data-idx="' + i + '" href="' + postUrl(p) + '">' +
          '<span class="qs-cat cat-' + p.category + '">' + p.category + '</span>' +
          '<span class="qs-main"><strong>' + esc(p.title) + '</strong><small>' + p.date + ' · ' + esc(p.tags.join(' / ')) + '</small></span>' +
          icon('right', 'icon-sm') + '</a>';
      }).join('') : '<p class="qs-hint">没有匹配结果，换个关键词试试。</p>';
    }
    function open() {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      input.value = '';
      run('');
      setTimeout(function () { input.focus(); }, 20);
    }
    function move(dir) {
      var items = $$('.qs-item', res);
      if (!items.length) return;
      sel = (sel + dir + items.length) % items.length;
      items.forEach(function (a, i) { a.classList.toggle('qs-active', i === sel); });
      items[sel].scrollIntoView({ block: 'nearest' });
    }
    input.addEventListener('input', debounce(function () { run(input.value.trim()); }, 100));
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        var items = $$('.qs-item', res);
        if (sel >= 0 && items[sel]) { e.preventDefault(); location.href = items[sel].href; }
        else if (items.length) { e.preventDefault(); location.href = items[0].href; }
        else if (input.value.trim()) { location.href = 'search.html?q=' + encodeURIComponent(input.value.trim()); }
      }
    });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg && dlg.close) dlg.close();
    });
    window.__openQuickSearch = open;
    $$('[data-action="quick-search"]').forEach(function (b) { b.addEventListener('click', open); });
  }

  /* ---------------- 键盘快捷键 ---------------- */
  function bindShortcuts() {
    var kbIndex = -1;
    function moveCard(dir) {
      var cards = $$('#postlist article');
      if (!cards.length) return;
      kbIndex = Math.max(0, Math.min(cards.length - 1, kbIndex + dir));
      cards.forEach(function (c, i) { c.classList.toggle('kb-focus', i === kbIndex); });
      cards[kbIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    document.addEventListener('keydown', function (e) {
      var t = e.target || {}, tag = (t.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || t.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault();
        if (window.__openQuickSearch) window.__openQuickSearch();
        return;
      }
      if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === '/') {
        e.preventDefault();
        var i = $('#searchInput') || $('#searchPageInput');
        if (i && i.offsetParent !== null) i.focus();
        else if (window.__openQuickSearch) window.__openQuickSearch();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        var h = $('#shortcutHelp');
        if (h && h.showModal) h.showModal();
      } else if (PAGE === 'home' && (e.key === 'j' || e.key === 'k')) {
        e.preventDefault();
        moveCard(e.key === 'j' ? 1 : -1);
      } else if (e.key === 'Enter' && kbIndex >= 0 && PAGE === 'home') {
        var a = $$('#postlist article')[kbIndex];
        var link = a && $(' .article-title a', a) || a && $('a', a);
        if (link) location.href = link.href;
      }
    });
  }

  /* ---------------- back to top ---------------- */
  function bindToTop() {
    var btn = $('#toTop');
    if (!btn) return;
    var ticking = false;
    function update() {
      btn.classList.toggle('show', window.scrollY > 320);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------------- 正文字号调节（三档，持久化） ---------------- */
  var FONT_KEY = 'rb-article-font';
  function bindFontSize() {
    var box = $('#fontSizeControl');
    if (!box) return;
    var steps = [0.9, 1, 1.12], cur = 1;
    try { cur = parseFloat(localStorage.getItem(FONT_KEY)) || 1; } catch (e) {}
    if (steps.indexOf(cur) < 0) cur = 1;
    function apply() {
      document.documentElement.style.setProperty('--article-font-size', (1.6 * cur).toFixed(3) + 'rem');
      var label = $('#fontSizeLabel');
      if (label) label.textContent = cur < 1 ? '小' : cur > 1 ? '大' : '中';
      $$('[data-font]', box).forEach(function (b) {
        b.setAttribute('aria-pressed', String(parseFloat(b.getAttribute('data-font')) === cur));
      });
    }
    $$('[data-font]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        cur = parseFloat(b.getAttribute('data-font'));
        try { localStorage.setItem(FONT_KEY, String(cur)); } catch (e) {}
        apply();
      });
    });
    apply();
  }

  /* ---------------- 远程文章（网页后台发布）----------------
     http(s) 下异步读取 content/posts.json 覆盖内嵌样品；file:// 离线双击时跳过。 */
  function loadRemotePosts(done) {
    function finish() { done(); }
    if (location.protocol === 'file:' || !D.setPosts || typeof fetch !== 'function') { finish(); return; }
    fetch('content/posts.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (list) {
        if (Array.isArray(list) && list.length) {
          D.setPosts(list);
          INDEX = Object.create(null); TERM_COUNT = 0;
          buildIndex();
        }
        finish();
      })
      .catch(finish);
  }

  /* 网页后台「站点设置」：头像 / 站点名 / 描述 */
  function loadRemoteSettings(done) {
    function finish() { done(); }
    if (location.protocol === 'file:' || !D.setSite || typeof fetch !== 'function') { finish(); return; }
    fetch('content/settings.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cfg) { if (cfg && typeof cfg === 'object') D.setSite(cfg); finish(); })
      .catch(finish);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    renderChrome();
    renderWidgets();
    bindSearchForm();
    if (PAGE === 'home') renderHome();
    else if (PAGE === 'post') renderPost();
    else if (PAGE === 'archives') renderArchives();
    else if (PAGE === 'categories') renderCategories();
    else if (PAGE === 'tags') renderTags();
    else if (PAGE === 'search') renderSearchPage();
    else if (PAGE === 'friends') renderFriends();
    else if (PAGE === 'debug') renderDebug();
    else if (PAGE === 'notfound') renderNotFound();
    enhanceArticle(document);
    bindLightbox();
    bindReadingProgress();
    bindFontSize();
    bindQuickSearch();
    bindShortcuts();
    bindToTop();
  }
  function start() {
    rebuildIndex();
    loadRemotePosts(function () { loadRemoteSettings(boot); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
