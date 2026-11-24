/* ============================================================
   文章后台逻辑 · 纯浏览器端
   通过 GitHub Contents API 读写 content/posts.json
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var TOKEN_KEY = 'blogAdminToken';
  var CFG_KEY = 'blogAdminCfg';
  var THEME_KEY = 'StackColorScheme';
  var SETTINGS_PATH = 'content/settings.json';
  var AUTH_PATH = 'content/auth.json';
  var DATA_JS_PATH = 'assets/data.js';
  var EMBED_BEGIN = '/* === EMBEDDED_POSTS_BEGIN === */';
  var EMBED_END = '/* === EMBEDDED_POSTS_END === */';
  var KDF_ITERATIONS = 210000;
  var UPLOAD_DIR = 'assets/uploads';
  var DEFAULT_CFG = {
    owner: 'yanqizhe',
    repo: 'yanqizhe.github.io',
    branch: 'main',
    path: 'content/posts.json'
  };

  var state = {
    token: '',
    cfg: DEFAULT_CFG,
    posts: [],
    settings: null,
    auth: null,
    sha: null,
    shaMap: {},
    index: -1,
    originalSlug: '',
    editorMode: 'form',
    autoSlug: true,
    dirty: false,
    connected: false,
    toastTimer: null
  };

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function makeSlug(title) {
    var s = String(title || '').toLowerCase().trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (!s || /^[\u4e00-\u9fa5-]+$/.test(s)) {
      return 'post-' + Date.now().toString(36);
    }
    return s.slice(0, 80);
  }

  function splitTags(v) {
    return String(v || '').split(/[,，]/).map(function (x) { return x.trim(); })
      .filter(Boolean).slice(0, 12);
  }

  function safeUrl(u) {
    var s = String(u || '').trim();
    return /^(https?:\/\/|mailto:|#|\/|\.\/|\.\.\/)/i.test(s) ? s : '#';
  }

  function setBusy(btn, on, text) {
    if (!btn) return;
    if (on) {
      btn.dataset.originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = text || '处理中…';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || btn.textContent;
      delete btn.dataset.originalText;
    }
  }

  function toast(msg, type) {
    var el = $('#toast');
    if (!el) return;
    clearTimeout(state.toastTimer);
    el.textContent = msg;
    el.className = 'toast show ' + (type || '');
    state.toastTimer = setTimeout(function () { el.className = 'toast'; }, 4200);
  }

  function setConn(text, type) {
    var el = $('#connectionState');
    var dot = $('#connectionDot');
    if (el) {
      el.textContent = text;
      el.className = 'connection-state ' + (type || '');
    }
    if (dot) dot.className = 'status-dot ' + (type || '');
  }

  function loadCfg() {
    try {
      var saved = JSON.parse(localStorage.getItem(CFG_KEY) || 'null');
      if (saved && saved.owner && saved.repo) {
        return Object.assign({}, DEFAULT_CFG, saved);
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_CFG);
  }

  function saveCfg() {
    state.cfg = {
      owner: $('#cfgOwner').value.trim() || DEFAULT_CFG.owner,
      repo: $('#cfgRepo').value.trim() || DEFAULT_CFG.repo,
      branch: $('#cfgBranch').value.trim() || DEFAULT_CFG.branch,
      path: $('#cfgPath').value.trim() || DEFAULT_CFG.path
    };
    try { localStorage.setItem(CFG_KEY, JSON.stringify(state.cfg)); } catch (e) {}
  }

  function fillCfg() {
    $('#cfgOwner').value = state.cfg.owner;
    $('#cfgRepo').value = state.cfg.repo;
    $('#cfgBranch').value = state.cfg.branch;
    $('#cfgPath').value = state.cfg.path;
  }

  /* ---------------- 主题 ---------------- */
  function applyTheme() {
    var s = 'auto';
    try { s = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) {}
    var dark = s === 'dark' || (s === 'auto' && window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-scheme', dark ? 'dark' : 'light');
    var labels = { auto: '自动', light: '浅色', dark: '深色' };
    $('#themeBtn').textContent = '主题：' + (labels[s] || '自动');
  }

  /* ---------------- GitHub API ---------------- */
  function contentsUrl(path) {
    var p = String(path || state.cfg.path).split('/').map(encodeURIComponent).join('/');
    return 'https://api.github.com/repos/' +
      encodeURIComponent(state.cfg.owner) + '/' +
      encodeURIComponent(state.cfg.repo) + '/contents/' + p;
  }

  function gh(url, options) {
    options = options || {};
    var headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + state.token,
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (options.body) headers['Content-Type'] = 'application/json';
    return fetch(url, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body || undefined,
      cache: 'no-store'
    }).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (body) {
          var err = new Error(body.message || ('GitHub 请求失败（' + r.status + '）'));
          err.status = r.status;
          err.body = body;
          throw err;
        });
      }
      return r.status === 204 ? null : r.json();
    });
  }

  function base64ToUtf8(b64) {
    var bin = atob(String(b64 || '').replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (window.TextDecoder) return new TextDecoder('utf-8').decode(bytes);
    return decodeURIComponent(Array.prototype.map.call(bytes, function (b) {
      return '%' + ('0' + b.toString(16)).slice(-2);
    }).join(''));
  }

  function utf8ToBase64(text) {
    var bytes;
    if (window.TextEncoder) bytes = new TextEncoder().encode(text);
    else {
      var raw = unescape(encodeURIComponent(text));
      bytes = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    }
    var bin = '';
    for (var j = 0; j < bytes.length; j += 8192) {
      bin += String.fromCharCode.apply(null, bytes.subarray(j, j + 8192));
    }
    return btoa(bin);
  }

  function encodePosts(posts) {
    return utf8ToBase64(JSON.stringify(posts, null, 2) + '\n');
  }

  /* ---------------- 密码加密令牌（Web Crypto） ---------------- */
  function bytesToB64(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i += 8192) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    }
    return btoa(bin);
  }
  function b64ToBytes(b64) {
    var bin = atob(String(b64 || '').replace(/\s/g, ''));
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function deriveKey(password, salt, iterations) {
    var base = crypto.subtle.importKey(
      'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return base.then(function (key) {
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: iterations, hash: 'SHA-256' },
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    });
  }
  function encryptToken(token, password) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(password, salt, KDF_ITERATIONS).then(function (key) {
      return crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(token)
      ).then(function (buf) {
        return {
          v: 1,
          salt: bytesToB64(salt),
          iv: bytesToB64(iv),
          cipher: bytesToB64(new Uint8Array(buf)),
          iterations: KDF_ITERATIONS,
          updated: new Date().toISOString()
        };
      });
    });
  }
  function decryptToken(payload, password) {
    if (!payload || payload.v !== 1 || !payload.cipher) {
      return Promise.reject(new Error('登录配置格式不正确'));
    }
    var salt = b64ToBytes(payload.salt);
    var iv = b64ToBytes(payload.iv);
    var data = b64ToBytes(payload.cipher);
    return deriveKey(password, salt, payload.iterations || KDF_ITERATIONS).then(function (key) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);
    }).then(function (buf) {
      return new TextDecoder().decode(buf);
    }).catch(function () {
      throw new Error('密码错误');
    });
  }
  function passwordValid(p) { return String(p || '').length >= 12; }

  function readJson(path, label) {
    return gh(contentsUrl(path) + '?ref=' + encodeURIComponent(state.cfg.branch))
      .then(function (data) {
        if (Array.isArray(data)) throw new Error(label + ' 的路径是目录，请填写文件');
        if (!data || !data.content) throw new Error(label + ' 内容为空或无法读取');
        var json;
        try { json = JSON.parse(base64ToUtf8(data.content)); }
        catch (e) { throw new Error(label + ' 不是合法 JSON'); }
        return { data: json, sha: data.sha };
      });
  }

  /* 公开仓库无需令牌即可读取登录配置 */
  function fetchPublicJson(path) {
    var p = String(path).split('/').map(encodeURIComponent).join('/');
    var url = 'https://api.github.com/repos/' +
      encodeURIComponent(state.cfg.owner) + '/' +
      encodeURIComponent(state.cfg.repo) + '/contents/' + p +
      '?ref=' + encodeURIComponent(state.cfg.branch);
    return fetch(url, {
      headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      cache: 'no-store'
    }).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('读取登录配置失败（' + r.status + '）');
      return r.json();
    }).then(function (data) {
      if (!data || !data.content) return null;
      try { return JSON.parse(base64ToUtf8(data.content)); }
      catch (e) { throw new Error('登录配置不是合法 JSON'); }
    });
  }

  function fetchPosts(notify) {
    if (!state.token) { toast('请先连接 GitHub', 'bad'); return Promise.reject(new Error('no token')); }
    return readJson(state.cfg.path, 'posts.json')
      .then(function (res) {
        if (!Array.isArray(res.data)) throw new Error('posts.json 顶层必须是数组');
        state.posts = res.data;
        state.sha = res.sha;
        state.shaMap[state.cfg.path] = res.sha;
        state.connected = true;
        setConn('已连接：' + state.cfg.owner + '/' + state.cfg.repo, 'ok');
        renderList();
        if (notify) toast('已拉取 ' + res.data.length + ' 篇文章', 'ok');
        return res.data;
      })
      .catch(function (err) {
        if (err.status === 404) {
          state.posts = [];
          state.sha = null;
          state.shaMap[state.cfg.path] = null;
          state.connected = true;
          setConn('已连接，但仓库还没有 ' + state.cfg.path, 'ok');
          renderList();
          if (notify) toast('仓库还没有文章文件，首次保存会自动新建', 'ok');
          return [];
        }
        state.connected = false;
        setConn('连接失败：' + err.message, 'bad');
        toast('拉取失败：' + err.message, 'bad');
        throw err;
      });
  }

  function defaultSettings() {
    return {
      name: '重构博客',
      description: '静态站爱好者 · 写点技术与工程笔记',
      notice: '',
      avatar: '',
      features: {
        math: true, comments: true, analytics: true, wikilink: true,
        footnotes: true, callout: true, backlinks: true, webp: true
      },
      giscus: { repo: '', repoId: '', category: 'General', categoryId: '', mapping: 'pathname' },
      analytics: { provider: 'busuanzi', token: '' }
    };
  }

  function fillSettingsForm() {
    var s = state.settings || defaultSettings();
    $('#sName').value = s.name || '';
    $('#sDescription').value = s.description || '';
    var av = $('#sAvatarPreview');
    var fb = $('#sAvatarFallback');
    if (s.avatar) {
      av.src = s.avatar;
      av.hidden = false;
      fb.hidden = true;
      $('#sAvatarPath').textContent = s.avatar;
      $('#resetAvatarBtn').hidden = false;
    } else {
      av.hidden = true;
      av.removeAttribute('src');
      fb.hidden = false;
      $('#sAvatarPath').textContent = '当前使用默认 R';
      $('#resetAvatarBtn').hidden = true;
    }
    $('#siteState').textContent = state.settings ? '站点设置已加载' : '尚未加载站点设置';
    renderFeatureList();
    fillConfigInputs();
  }

  /* ---------------- 功能清单：既是开关面板，也是「所有功能介绍」 ---------------- */
  var FEATURE_GROUPS = [
    {
      title: '阅读与排版',
      items: [
        { fixed: true, name: '倒排索引搜索 + Ctrl K', desc: '运行时建索引，中文按 bigram 切分；Ctrl K 随时唤起。索引在首屏渲染后构建，不阻塞打开速度。' },
        { fixed: true, name: '三态配色与正文字号', desc: '自动 / 浅色 / 深色跟随系统；文章页可调小中大字号，选择记忆在本机。' },
        { fixed: true, name: '目录跟随与段落锚点', desc: '右栏目录随滚动高亮；标题旁的 # 是锚点，可复制某一段的直达链接。' },
        { fixed: true, name: '代码高亮与一键复制', desc: '自写词法着色，零第三方库；代码块右上角可直接复制全文。' },
        { fixed: true, name: '图片灯箱与懒加载', desc: '正文图片点击放大；滚动到附近才加载，省流量。' },
        { fixed: true, name: '朗读正文', desc: '调用系统语音合成，纯本地完成，不上传正文。' }
      ]
    },
    {
      title: '内容表达',
      items: [
        { id: 'math', name: '数学公式 KaTeX', desc: '正文写 $a^2+b^2=c^2$ 或 $$...$$ 即可排版。只有出现公式的文章才联网取 KaTeX，普通文章零额外请求。' },
        { id: 'callout', name: '提示块', desc: '语法「::: 标签 | 内容」，标签写「注意 / 警告 / 小结」会自动换颜色，适合放易错点与结论。' },
        { id: 'footnotes', name: '脚注', desc: '正文用 [^1] 标记，脚注内容写在编辑器「脚注」框，文末自动编号并能点回原文。' },
        { id: 'wikilink', name: '站内双链 [[...]]', desc: '写 [[某篇的 slug 或标题]] 直接跳到那篇；可写成 [[slug|显示文字]]。' },
        { id: 'backlinks', name: '反向链接', desc: '自动列出「哪些文章引用了本篇」，复习时能顺着标签与引用关系走。' },
        { fixed: true, name: '封面自动生成', desc: '按标题与标签生成 11 种 SVG 插画封面，不用自己配图。' }
      ]
    },
    {
      title: '互动与统计',
      items: [
        { id: 'comments', name: '评论（Giscus）', desc: '读者用 GitHub 账号评论，数据存在仓库 Discussions，不需要服务器和数据库。填好下方参数才算接通。', need: 'giscus' },
        { id: 'analytics', name: '访问统计', desc: '不蒜子或 Cloudflare Web Analytics，显示站点浏览量 / 访客数；脚本在页面空闲后加载，不影响首屏。', need: 'analytics' },
        { fixed: true, name: '点赞 / 收藏 / 继续阅读', desc: '只存本机 localStorage，不上传；首页会提示上次读到哪一篇。' },
        { fixed: true, name: '分享与留言板', desc: '复制链接、系统分享；「关于」页底部是留言板，复用同一套评论。' }
      ]
    },
    {
      title: '写作与发布',
      items: [
        { id: 'webp', name: '上传图片自动压 WebP', desc: '超过 1600px 或 400KB 的图片先在浏览器里压成 WebP 再上传，手机照片不会拖慢页面。' },
        { fixed: true, name: '草稿箱', desc: '状态选「草稿」的文章只留在 posts.json 里，主站列表与搜索都不会出现。' },
        { fixed: true, name: '定时发布', desc: '填一个未来时间，到点前主站自动过滤、到点后自动出现，纯前端判断，不需要额外服务。' },
        { fixed: true, name: '草稿预览', desc: '点「预览草稿」用本机临时数据打开正式文章页，链接发给别人也打不开。' },
        { fixed: true, name: '导出全站备份', desc: '把 posts.json 与 settings.json 打包成一个 JSON 下载，换电脑或出事时能还原。' },
        { fixed: true, name: '首屏内嵌 + 自动同步', desc: '保存文章时同时改写 data.js 的内嵌数组，新文章刷新即出，不再等网络。' }
      ]
    },
    {
      title: '自动化',
      items: [
        { fixed: true, name: 'RSS / sitemap 自动重建', desc: '仓库里的 GitHub Actions 在提交文章后自动跑脚本，重新生成 feed.xml 与 sitemap.xml。' },
        { fixed: true, name: 'Service Worker 分级缓存', desc: 'HTML 走网络优先保证最新，静态资源走缓存优先保证快；版本号一变自动换新。' }
      ]
    }
  ];

  function settingsOf() { return state.settings || defaultSettings(); }
  function featureEnabled(id) {
    var f = settingsOf().features || {};
    return f[id] !== false;
  }
  function renderFeatureList() {
    var box = $('#featureList');
    if (!box) return;
    var s = settingsOf();
    box.innerHTML = FEATURE_GROUPS.map(function (g) {
      return '<div class="feature-group"><h3>' + esc(g.title) + '</h3>' + g.items.map(function (it) {
        var right = it.id
          ? '<span class="switch"><input type="checkbox" data-feature="' + it.id + '"' +
            (featureEnabled(it.id) ? ' checked' : '') + ' aria-label="' + esc(it.name) + '"><i></i></span>'
          : '<span class="pill on">常开</span>';
        var extra = '';
        if (it.need === 'giscus') extra = (s.giscus && s.giscus.repoId) ? ' · 参数已填' : ' · 参数未填，主站会显示提示';
        if (it.need === 'analytics') extra = (s.analytics && s.analytics.provider && s.analytics.provider !== 'none')
          ? ' · 当前使用 ' + s.analytics.provider : ' · 当前关闭';
        return '<div class="feature-row"><span class="feature-main"><strong>' + esc(it.name) +
          '</strong><small>' + esc(it.desc + extra) + '</small></span>' + right + '</div>';
      }).join('') + '</div>';
    }).join('');
  }
  function fillConfigInputs() {
    var s = settingsOf(), g = s.giscus || {}, a = s.analytics || {};
    if ($('#gRepo')) $('#gRepo').value = g.repo || '';
    if ($('#gRepoId')) $('#gRepoId').value = g.repoId || '';
    if ($('#gCategory')) $('#gCategory').value = g.category || 'General';
    if ($('#gCategoryId')) $('#gCategoryId').value = g.categoryId || '';
    if ($('#aProvider')) $('#aProvider').value = a.provider || 'none';
    if ($('#aToken')) $('#aToken').value = a.token || '';
  }
  function saveFeatures() {
    if (!state.token || !state.connected) { toast('请先连接 GitHub', 'bad'); return; }
    var base = defaultSettings();
    var next = Object.assign({}, settingsOf());
    var feats = {};
    $$('#featureList input[data-feature]').forEach(function (el) {
      feats[el.getAttribute('data-feature')] = el.checked;
    });
    next.features = Object.assign({}, base.features, next.features || {}, feats);
    next.giscus = Object.assign({}, base.giscus, next.giscus || {}, {
      repo: $('#gRepo').value.trim(),
      repoId: $('#gRepoId').value.trim(),
      category: $('#gCategory').value.trim() || 'General',
      categoryId: $('#gCategoryId').value.trim(),
      mapping: 'pathname'
    });
    next.analytics = Object.assign({}, base.analytics, next.analytics || {}, {
      provider: $('#aProvider').value,
      token: $('#aToken').value.trim()
    });
    setBusy($('#saveFeaturesBtn'), true, '保存中…');
    putFile(SETTINGS_PATH, utf8ToBase64(JSON.stringify(next, null, 2) + '\n'), 'admin: update feature settings')
      .then(function () {
        state.settings = next;
        fillSettingsForm();
        $('#featureState').textContent = '已发布，主站刷新后生效';
        toast('功能设置已保存并发布', 'ok');
      })
      .catch(function (err) { toast('保存失败：' + err.message, 'bad'); })
      .then(function () { setBusy($('#saveFeaturesBtn'), false); });
  }
  function exportBackup() {
    var data = {
      exportedAt: new Date().toISOString(),
      repo: state.cfg.owner + '/' + state.cfg.repo,
      settings: settingsOf(),
      posts: state.posts || []
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'blog-backup-' + today() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast('已导出 ' + (state.posts || []).length + ' 篇文章与站点设置', 'ok');
  }

  function fetchSettings(notify) {
    if (!state.token) return Promise.resolve(null);
    return readJson(SETTINGS_PATH, 'settings.json')
      .then(function (res) {
        if (!res.data || typeof res.data !== 'object' || Array.isArray(res.data)) {
          throw new Error('settings.json 顶层必须是对象');
        }
        state.settings = Object.assign(defaultSettings(), res.data);
        state.shaMap[SETTINGS_PATH] = res.sha;
        fillSettingsForm();
        if (notify) toast('已读取站点设置', 'ok');
        return state.settings;
      })
      .catch(function (err) {
        if (err.status === 404) {
          state.settings = defaultSettings();
          state.shaMap[SETTINGS_PATH] = null;
          fillSettingsForm();
          return state.settings;
        }
        toast('读取站点设置失败：' + err.message, 'bad');
        return null;
      });
  }

  function connectWithToken(token) {
    state.token = String(token || '').trim();
    if (!state.token) {
      toast('请先输入 GitHub 令牌', 'bad');
      return Promise.reject(new Error('no token'));
    }
    $('#tokenInput').value = state.token;
    try { localStorage.setItem(TOKEN_KEY, state.token); } catch (e) {}
    setBusy($('#connectBtn'), true, '正在连接…');
    setConn('正在验证令牌…', '');
    return gh('https://api.github.com/user')
      .then(function (user) {
        setConn('已验证身份：' + user.login + '，正在读取文章…', 'ok');
        return fetchPosts(false);
      })
      .then(function () { return fetchSettings(false); })
      .then(function () {
        state.connected = true;
        setConn('已连接：' + state.cfg.owner + '/' + state.cfg.repo, 'ok');
        $('#changePwdBtn').hidden = false;
      })
      .catch(function (err) {
        state.connected = false;
        if (err.status === 401 || err.status === 403) {
          setConn('令牌无效或权限不足：' + err.message, 'bad');
          toast('令牌无效或权限不足，请检查 Contents: read/write 权限', 'bad');
        } else {
          setConn('连接失败：' + err.message, 'bad');
          toast('连接失败：' + err.message, 'bad');
        }
      })
      .then(function () { setBusy($('#connectBtn'), false); });
  }

  function connect() {
    var token = $('#tokenInput').value.trim();
    if (!token) { toast('请先粘贴 GitHub 令牌', 'bad'); return Promise.reject(new Error('no token')); }
    saveCfg();
    return connectWithToken(token);
  }

  /* 只读文件 sha，不解析内容：图片等二进制文件不能当 JSON 解析 */
  function readFileSha(path) {
    return gh(contentsUrl(path) + '?ref=' + encodeURIComponent(state.cfg.branch))
      .then(function (data) {
        if (Array.isArray(data) || !data || !data.sha) throw new Error('无法读取文件 sha');
        return data.sha;
      });
  }

  function putFile(path, content, message) {
    var body = { message: message, content: content, branch: state.cfg.branch };
    var sha = state.shaMap[path];
    if (sha) body.sha = sha;
    return gh(contentsUrl(path), { method: 'PUT', body: JSON.stringify(body) })
      .catch(function (err) {
        if (err.status !== 409 && err.status !== 422) throw err;
        return readFileSha(path).then(function (fileSha) {
          state.shaMap[path] = fileSha;
          body.sha = fileSha;
          return gh(contentsUrl(path), { method: 'PUT', body: JSON.stringify(body) });
        });
      })
      .then(function (resp) {
        if (resp && resp.content && resp.content.sha) state.shaMap[path] = resp.content.sha;
        if (path === state.cfg.path) state.sha = state.shaMap[path];
        return resp;
      });
  }

  function putPosts(posts, message) {
    return putFile(state.cfg.path, encodePosts(posts), message);
  }

  /* 把最新文章同步进 data.js 的内嵌数组：主站首屏直接渲染，不再等 fetch，秒开。
     posts.json 仍是权威数据源；这一步失败也不影响发文，只是首屏回退到旧内嵌数据。 */
  function syncEmbeddedPosts(posts) {
    return readTextFile(DATA_JS_PATH).then(function (res) {
      var text = res.text;
      var a = text.indexOf(EMBED_BEGIN);
      var b = text.indexOf(EMBED_END, a < 0 ? 0 : a);
      if (a < 0 || b < 0) throw new Error('data.js 缺少内嵌文章标记');
      var json = JSON.stringify(posts, null, 2);
      var next = text.slice(0, a + EMBED_BEGIN.length) +
        '\n  var POSTS = ' + json + ';\n  ' + text.slice(b);
      if (next === text) return null;
      state.shaMap[DATA_JS_PATH] = res.sha;
      return putFile(DATA_JS_PATH, utf8ToBase64(next), 'admin: sync embedded posts (' + posts.length + ')');
    }).catch(function () { return null; });
  }

  function readTextFile(path) {
    return gh(contentsUrl(path) + '?ref=' + encodeURIComponent(state.cfg.branch))
      .then(function (data) {
        if (Array.isArray(data) || !data || !data.content) throw new Error('无法读取 ' + path);
        return { text: base64ToUtf8(data.content), sha: data.sha };
      });
  }

  /* ---------------- Markdown 风格正文 ↔ sections ---------------- */
  function safeInlineUrl(u) {
    return /^(https?:\/\/|mailto:|#|\/|\.\/|\.\.\/|data:image\/)/i.test(String(u || '')) ? u : '#';
  }
  function isDownloadUrl(u) {
    return /\.(pdf|zip|rar|7z|tar|gz|mp4|webm|mov|m4v|txt|md|docx?|xlsx?|pptx?|csv|json|apk|exe|dmg)$/i.test(String(u || ''));
  }
  function inlineHtml(s) {
    return esc(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, alt, url) {
        return '<img class="inline-img" src="' + safeInlineUrl(url) + '" alt="' + alt + '" loading="lazy">';
      })
      .replace(/@video\[([^\]]*)\]\(([^)\s]+)\)/g, function (m, label, url) {
        var u = safeInlineUrl(url);
        return '<span class="inline-video"><video controls preload="metadata" src="' + u +
          '">您的浏览器不支持视频播放。</video><a class="inline-download" href="' + u +
          '" download>下载' + (label || '视频') + '</a></span>';
      })
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, url) {
        var u = safeInlineUrl(url);
        return '<a href="' + u + '"' + (isDownloadUrl(u) ? ' download' : '') +
          (u === '#' ? '' : ' target="_blank" rel="noopener"') + '>' + text + '</a>';
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/\[\[([^\]]+)\]\]/g, '<kbd>$1</kbd>');
  }

  function parseTable(lines) {
    if (lines.length < 2) return null;
    function cells(line) {
      return String(line).trim().replace(/^\|/, '').replace(/\|$/, '')
        .split('|').map(function (c) { return c.trim(); });
    }
    var head = cells(lines[0]);
    var sep = cells(lines[1]);
    if (!sep.length || !sep.every(function (x) { return /^:?-{3,}:?$/.test(x); })) return null;
    var rows = lines.slice(2).map(cells).filter(function (r) {
      return r.some(function (c) { return c; });
    });
    return { head: head, rows: rows };
  }

  function parseMarkdown(src) {
    var lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
    var sections = [];
    var cur = null;
    var para = [], list = [], quote = [], code = [], tableLines = [], note = null;
    var mode = '';
    var inCode = false;

    function flush() {
      if (!cur) { mode = ''; return; }
      if (para.length) { cur.p = (cur.p || []).concat(para.join('\n')); para = []; }
      if (list.length) { cur.list = (cur.list || []).concat(list); list = []; }
      if (quote.length) { cur.quote = quote.join(' '); quote = []; }
      if (code.length) { cur.code = code.join('\n'); code = []; }
      if (tableLines.length) {
        var t = parseTable(tableLines);
        if (t) cur.table = t;
        else para = para.concat(tableLines);
        tableLines = [];
      }
      if (note) { cur.note = [note.label, note.text]; note = null; }
      mode = '';
    }

    function begin(next) {
      if (mode && mode !== next) flush();
      mode = next;
    }

    lines.forEach(function (line) {
      if (inCode) {
        if (/^\s*```/.test(line)) { inCode = false; flush(); }
        else code.push(line);
        return;
      }

      var h = /^\s*##\s+(.+)$/.exec(line);
      if (h) {
        flush();
        if (cur) sections.push(cur);
        cur = { h: h[1].trim() };
        return;
      }

      if (!cur) cur = { h: '正文' };

      if (/^\s*```/.test(line)) {
        flush();
        inCode = true;
        return;
      }

      var noteM = /^\s*:::\s*(.+?)\s*\|\s*(.*)$/.exec(line);
      if (noteM) {
        flush();
        note = { label: noteM[1].trim(), text: noteM[2].trim() };
        flush();
        return;
      }

      if (/^\s*\|/.test(line)) { begin('table'); tableLines.push(line); return; }

      var listM = /^\s*[-*]\s+(.+)$/.exec(line);
      if (listM) { begin('list'); list.push(listM[1].trim()); return; }

      var quoteM = /^\s*>\s?(.*)$/.exec(line);
      if (quoteM) { begin('quote'); quote.push(quoteM[1].trim()); return; }

      if (!line.trim()) { flush(); return; }

      begin('p');
      para.push(line.trim());
    });

    if (inCode) flush();
    flush();
    if (cur) sections.push(cur);

    if (!sections.length) sections.push({ h: '正文', p: ['（暂无正文）'] });
    sections.forEach(function (s) {
      ['p', 'list'].forEach(function (k) {
        if (Array.isArray(s[k]) && !s[k].length) delete s[k];
      });
      ['quote', 'code', 'table', 'note'].forEach(function (k) {
        if (!s[k]) delete s[k];
      });
    });
    return sections;
  }

  function sectionsToMarkdown(sections) {
    return (sections || []).map(function (s) {
      var out = ['## ' + (s.h || '小标题')];
      (s.p || []).forEach(function (p) { out.push('', p); });
      if (s.list && s.list.length) {
        out.push('');
        s.list.forEach(function (li) { out.push('- ' + li); });
      }
      if (s.quote) {
        out.push('');
        String(s.quote).split('\n').forEach(function (q) { out.push('> ' + q); });
      }
      if (s.code) {
        out.push('', '```', String(s.code).replace(/\n+$/, ''), '```');
      }
      if (s.table && s.table.head) {
        out.push('');
        out.push('| ' + s.table.head.join(' | ') + ' |');
        out.push('| ' + s.table.head.map(function () { return '---'; }).join(' | ') + ' |');
        (s.table.rows || []).forEach(function (r) { out.push('| ' + r.join(' | ') + ' |'); });
      }
      if (s.note && s.note.length >= 2) {
        out.push('', '::: ' + s.note[0] + ' | ' + s.note[1]);
      }
      return out.join('\n');
    }).join('\n\n');
  }

  /* ---------------- 文章表单 ---------------- */
  function normalizePost(raw) {
    var p = Object.assign({}, raw || {});
    p.title = String(p.title || '').trim();
    p.slug = String(p.slug || '').trim() || makeSlug(p.title);
    p.subtitle = String(p.subtitle || '');
    p.category = p.category === 'Repost' ? 'Repost' : 'Original';
    p.date = /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : today();
    p.minutes = Math.max(1, Math.min(120, parseInt(p.minutes, 10) || 6));
    p.tags = Array.isArray(p.tags) ? p.tags.map(String).filter(Boolean).slice(0, 12) : splitTags(p.tags);
    p.cover = String(p.cover || '').trim() || p.category;
    p.draft = p.draft === true || p.draft === 'true';
    p.publishAt = String(p.publishAt || '');
    p.footnotes = Array.isArray(p.footnotes)
      ? p.footnotes.map(function (f) { return String(f).trim(); }).filter(Boolean)
      : [];
    p.sections = Array.isArray(p.sections) && p.sections.length
      ? p.sections.filter(function (s) { return s && s.h; })
      : [{ h: '正文', p: ['（暂无正文）'] }];
    p.lastmod = today();
    return p;
  }

  function validatePost(p) {
    if (!p.title) throw new Error('请填写标题');
    if (!p.slug || /\s/.test(p.slug)) throw new Error('URL 标识不能为空或包含空格');
    if (!Array.isArray(p.sections)) throw new Error('正文章节格式不正确');
    if ($('#fStatus').value === 'scheduled' && !p.publishAt) throw new Error('选了定时发布，请填上线时间');
  }

  function gatherFromForm() {
    var status = $('#fStatus') ? $('#fStatus').value : 'published';
    return normalizePost({
      slug: $('#fSlug').value.trim() || makeSlug($('#fTitle').value),
      title: $('#fTitle').value.trim(),
      subtitle: $('#fSubtitle').value.trim(),
      category: $('#fCategory').value,
      date: $('#fDate').value,
      minutes: $('#fMinutes').value,
      tags: splitTags($('#fTags').value),
      cover: $('#fCover').value.trim(),
      draft: status === 'draft',
      publishAt: status === 'scheduled' ? ($('#fPublishAt').value || '') : '',
      footnotes: String($('#fFootnotes').value || '').split('\n')
        .map(function (x) { return x.trim(); }).filter(Boolean),
      sections: parseMarkdown($('#fBody').value),
      lastmod: today()
    });
  }

  function gatherPost() {
    if (state.editorMode === 'json') {
      var raw;
      try { raw = JSON.parse($('#fJson').value); }
      catch (e) { throw new Error('JSON 格式错误：' + e.message); }
      var p = normalizePost(raw);
      validatePost(p);
      return p;
    }
    var fp = gatherFromForm();
    validatePost(fp);
    return fp;
  }

  function fillForm(post) {
    $('#fTitle').value = post.title || '';
    $('#fSlug').value = post.slug || '';
    $('#fSubtitle').value = post.subtitle || '';
    $('#fCategory').value = post.category === 'Repost' ? 'Repost' : 'Original';
    $('#fDate').value = post.date || today();
    $('#fMinutes').value = post.minutes || 6;
    $('#fTags').value = (post.tags || []).join(', ');
    $('#fCover').value = post.cover || '';
    var isDraft = post.draft === true;
    var scheduled = !isDraft && post.publishAt && Date.parse(post.publishAt) > Date.now();
    if ($('#fStatus')) $('#fStatus').value = isDraft ? 'draft' : (scheduled ? 'scheduled' : 'published');
    if ($('#fPublishAt')) $('#fPublishAt').value = post.publishAt ? String(post.publishAt).slice(0, 16) : '';
    if ($('#fFootnotes')) $('#fFootnotes').value = (post.footnotes || []).join('\n');
    $('#fBody').value = sectionsToMarkdown(post.sections);
    $('#fJson').value = JSON.stringify(post, null, 2);
    $('#fMessage').value = '';
    state.dirty = false;
  }

  function openEditor(index) {
    state.index = index;
    state.originalSlug = index >= 0 ? state.posts[index].slug : '';
    state.autoSlug = index < 0;
    var post;
    if (index >= 0) {
      post = state.posts[index];
      $('#editorTitle').textContent = '编辑文章 · ' + post.title;
      $('#deleteBtn').hidden = false;
    } else {
      post = {
        slug: '', title: '', subtitle: '', category: 'Original',
        date: today(), minutes: 6, tags: [], cover: '',
        sections: [{ h: '小标题', p: ['在这里写正文。'] }]
      };
      $('#editorTitle').textContent = '新建文章';
      $('#deleteBtn').hidden = true;
    }
    fillForm(post);
    state.editorMode = 'form';
    $('#editor').hidden = false;
    switchTab('form');
    $('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeEditor() {
    if (state.dirty && !window.confirm('有未保存的修改，确定关闭编辑器吗？')) return;
    $('#editor').hidden = true;
    state.index = -1;
    state.dirty = false;
  }

  function switchTab(tab) {
    if ($('#editor').hidden) return;
    var from = state.editorMode;

    if (from !== 'json' && tab === 'json') {
      try {
        $('#fJson').value = JSON.stringify(gatherFromForm(), null, 2);
      } catch (e) { toast(e.message, 'bad'); return; }
    }

    if (from === 'json' && tab !== 'json') {
      var p;
      try { p = normalizePost(JSON.parse($('#fJson').value)); }
      catch (e) { toast('JSON 格式错误：' + e.message, 'bad'); return; }
      fillForm(p);
    }

    state.editorMode = tab;
    $$('.editor-tabs .tab').forEach(function (btn) {
      var active = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    $('#paneForm').hidden = tab !== 'form';
    $('#panePreview').hidden = tab !== 'preview';
    $('#paneJson').hidden = tab !== 'json';

    if (tab === 'preview') {
      try { renderPreview(gatherPost()); }
      catch (e) { toast(e.message, 'bad'); }
    }
  }

  function renderPreview(post) {
    var html = ['<h2>' + esc(post.title) + '</h2>'];
    if (post.subtitle) html.push('<p class="muted">' + esc(post.subtitle) + '</p>');

    (post.sections || []).forEach(function (s) {
      html.push('<h3>' + esc(s.h || '小标题') + '</h3>');
      (s.p || []).forEach(function (p) { html.push('<p>' + inlineHtml(p) + '</p>'); });
      if (s.list && s.list.length) {
        html.push('<ul>' + s.list.map(function (li) { return '<li>' + inlineHtml(li) + '</li>'; }).join('') + '</ul>');
      }
      if (s.quote) html.push('<blockquote><p>' + inlineHtml(s.quote) + '</p></blockquote>');
      if (s.code) html.push('<pre><code>' + esc(s.code) + '</code></pre>');
      if (s.table) {
        html.push('<div class="table-wrap"><table><thead><tr>' +
          (s.table.head || []).map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody>' +
          (s.table.rows || []).map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + inlineHtml(c) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table></div>');
      }
      if (s.note && s.note.length >= 2) {
        var ct = /warn|warning|注意|警告|风险|坑/i.test(s.note[0]) ? 'warn'
          : /tip|技巧|建议|提示|经验/i.test(s.note[0]) ? 'tip'
          : /ok|success|结论|小结|要点/i.test(s.note[0]) ? 'ok' : 'info';
        html.push('<aside class="callout callout-' + ct + '"><div class="callout-head">' + esc(s.note[0]) +
          '</div><p>' + inlineHtml(s.note[1]) + '</p></aside>');
      }
    });
    if (post.footnotes && post.footnotes.length) {
      html.push('<section class="post-footnotes"><h2 class="footnotes-title">参考与注释</h2><ol>' +
        post.footnotes.map(function (f, i) {
          return '<li id="fn-' + (i + 1) + '">' + inlineHtml(f) + '</li>';
        }).join('') + '</ol></section>');
    }

    $('#preview').innerHTML = html.join('\n');
  }

  /* ---------------- 列表 / 保存 / 删除 ---------------- */
  function renderList() {
    var q = ($('#listSearch').value || '').trim().toLowerCase();
    var list = state.posts.map(function (p, i) { return { p: p, i: i }; }).filter(function (item) {
      if (!q) return true;
      var hay = [item.p.title, item.p.slug, item.p.subtitle, item.p.category,
        (item.p.tags || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    $('#postCount').textContent = state.posts.length
      ? '共 ' + state.posts.length + ' 篇' + (q ? '，筛选出 ' + list.length + ' 篇' : '')
      : '尚未加载';

    if (!list.length) {
      $('#postList').innerHTML = '<div class="empty-state">' +
        (state.posts.length ? '没有匹配的文章。' :
          (state.connected ? '仓库里还没有文章，点击「新建文章」开始写第一篇。' : '连接 GitHub 后即可管理文章。')) +
        '</div>';
      return;
    }

    $('#postList').innerHTML = list.map(function (item) {
      var p = item.p;
      var st = p.draft === true ? '<span class="badge is-draft">草稿</span>'
        : (p.publishAt && Date.parse(p.publishAt) > Date.now() ? '<span class="badge is-scheduled">定时</span>' : '');
      return '<article class="admin-post">' +
        '<div class="admin-post-head">' +
          '<span class="badge">' + esc(p.category) + '</span>' + st +
          '<span>' + esc(p.date) + '</span>' +
          '<span>·</span><span>' + esc(p.minutes || 0) + ' 分钟</span>' +
          '<span class="badge slug">' + esc(p.slug) + '</span>' +
        '</div>' +
        '<h3><a href="../post.html?slug=' + encodeURIComponent(p.slug) + '" target="_blank" rel="noopener">' +
          esc(p.title) + '</a></h3>' +
        '<p>' + esc(p.subtitle || '（无摘要）') + '</p>' +
        '<div class="post-actions">' +
          '<button class="btn btn-mini" type="button" data-act="edit" data-index="' + item.i + '">编辑</button>' +
          '<button class="btn btn-mini" type="button" data-act="preview" data-index="' + item.i + '">预览</button>' +
          '<button class="btn btn-mini" type="button" data-act="delete" data-index="' + item.i + '">删除</button>' +
          '<a class="btn btn-mini" href="../post.html?slug=' + encodeURIComponent(p.slug) + '" target="_blank" rel="noopener">查看</a>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function savePost() {
    var post;
    try { post = gatherPost(); }
    catch (e) { toast(e.message, 'bad'); return; }

    var next = state.posts.slice();
    var exists = next.some(function (p, i) { return i !== state.index && p.slug === post.slug; });
    if (exists) { toast('slug 已存在：' + post.slug + '，请换一个 URL 标识', 'bad'); return; }

    if (state.index >= 0) next[state.index] = post;
    else next.unshift(post);

    var msg = $('#fMessage').value.trim() ||
      ((state.index >= 0 ? 'admin: update ' : 'admin: add ') + post.slug);

    setBusy($('#saveBtn'), true, '正在提交…');
    putPosts(next, msg)
      .then(function () { return syncEmbeddedPosts(next); })
      .then(function () {
        state.posts = next;
        state.dirty = false;
        $('#editor').hidden = true;
        state.index = -1;
        renderList();
        toast('已保存并同步首屏，刷新主站即可秒开新文章', 'ok');
      })
      .catch(function (err) {
        toast('保存失败：' + err.message, 'bad');
      })
      .then(function () { setBusy($('#saveBtn'), false); });
  }

  function deletePost(index) {
    var p = state.posts[index];
    if (!p) return;
    if (!window.confirm('确定删除《' + p.title + '》吗？此操作会立即提交到 GitHub。')) return;

    var next = state.posts.filter(function (_, i) { return i !== index; });
    setBusy($('#deleteBtn'), true, '正在删除…');
    putPosts(next, 'admin: delete ' + p.slug)
      .then(function () { return syncEmbeddedPosts(next); })
      .then(function () {
        state.posts = next;
        if (state.index === index) $('#editor').hidden = true;
        state.index = -1;
        state.dirty = false;
        renderList();
        toast('已删除文章', 'ok');
      })
      .catch(function (err) { toast('删除失败：' + err.message, 'bad'); })
      .then(function () { setBusy($('#deleteBtn'), false); });
  }

  /* ---------------- 文件上传（图片 / 视频 / 附件 / 头像）---------------- */
  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var s = String(reader.result || '');
        resolve(s.indexOf(',') !== -1 ? s.slice(s.indexOf(',') + 1) : '');
      };
      reader.onerror = function () { reject(new Error('读取文件失败')); };
      reader.readAsDataURL(file);
    });
  }

  function safeAssetName(name) {
    var n = String(name || 'file').replace(/\\/g, '/').split('/').pop();
    n = n.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return (n || 'file').slice(-80).toLowerCase();
  }

  function isImageFile(file) {
    var t = String((file && file.type) || '').toLowerCase();
    var n = String((file && file.name) || '').toLowerCase();
    return t.indexOf('image/') === 0 || /\.(png|jpe?g|gif|webp|bmp|svg|avif|ico)$/.test(n);
  }

  function isVideoFile(file) {
    var t = String((file && file.type) || '').toLowerCase();
    var n = String((file && file.name) || '').toLowerCase();
    return t.indexOf('video/') === 0 || /\.(mp4|webm|mov|m4v|ogv|mkv)$/.test(n);
  }

  /* 浏览器端图片压缩：超过 400KB 或长边 1600px 的图转 WebP，上传前先瘦身 */
  function compressImage(file) {
    var on = settingsOf().features ? settingsOf().features.webp !== false : true;
    if (!on) return Promise.resolve(null);
    if (!/^image\//.test(String(file.type || '')) || /svg|gif|avif/i.test(file.type)) return Promise.resolve(null);
    if (file.size <= 400 * 1024) return Promise.resolve(null);
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var max = 1600, w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, max / Math.max(w, h));
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var c = document.createElement('canvas');
          c.width = cw;
          c.height = ch;
          c.getContext('2d').drawImage(img, 0, 0, cw, ch);
          c.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (!blob || blob.size >= file.size) { resolve(null); return; }
            var r = new FileReader();
            r.onload = function () {
              var s = String(r.result || '');
              resolve({
                b64: s.slice(s.indexOf(',') + 1),
                name: String(file.name).replace(/\.[^.]+$/, '') + '.webp',
                size: blob.size
              });
            };
            r.onerror = function () { resolve(null); };
            r.readAsDataURL(blob);
          }, 'image/webp', 0.82);
        } catch (e) {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  function uploadAsset(file, kind) {
    if (!state.token || !state.connected) {
      toast('请先连接 GitHub', 'bad');
      return Promise.reject(new Error('未连接'));
    }
    if (!file) return Promise.reject(new Error('没有选择文件'));
    var limit = kind === 'image' ? 8 * 1024 * 1024 : 30 * 1024 * 1024;
    if (file.size > limit) {
      toast(kind === 'image' ? '图片不能超过 8 MB' : '视频 / 附件不能超过 30 MB', 'bad');
      return Promise.reject(new Error('文件过大'));
    }
    var d = new Date();
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var prefix = UPLOAD_DIR + '/' + yyyy + '/' + mm + '/' + Date.now().toString(36) + '-';
    return compressImage(file).then(function (opt) {
      if (opt) {
        var path = prefix + safeAssetName(opt.name);
        return putFile(path, opt.b64, 'admin: upload ' + path).then(function () {
          toast('图片已压缩 ' + Math.round(file.size / 1024) + ' KB → ' + Math.round(opt.size / 1024) + ' KB', 'ok');
          return '/' + path;
        });
      }
      return fileToBase64(file).then(function (b64) {
        var path2 = prefix + safeAssetName(file.name);
        return putFile(path2, b64, 'admin: upload ' + path2).then(function () { return '/' + path2; });
      });
    });
  }

  function insertAtCursor(text) {
    var el = $('#fBody');
    var start = el.selectionStart == null ? el.value.length : el.selectionStart;
    var end = el.selectionEnd == null ? el.value.length : el.selectionEnd;
    var before = el.value.slice(0, start);
    var after = el.value.slice(end);
    var sep = before && !/\n$/.test(before) ? '\n\n' : '';
    el.value = before + sep + text + after;
    var pos = (before + sep + text).length;
    el.focus();
    try { el.setSelectionRange(pos, pos); } catch (e) {}
    state.dirty = true;
  }

  function handleMediaUpload(kind, inputId) {
    if ($('#editor').hidden) { toast('请先新建或打开一篇文章', 'bad'); return; }
    if (state.editorMode !== 'form') { toast('请先切到「正文」模式再插入媒体', 'bad'); return; }
    var input = $(inputId);
    input.value = '';
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var activeBtn = kind === 'image' ? $('#insertImageBtn') :
        (kind === 'video' ? $('#insertVideoBtn') : $('#insertFileBtn'));
      setBusy(activeBtn, true, '上传中…');
      var label = file.name.replace(/\.[^.]+$/, '');
      uploadAsset(file, kind)
        .then(function (url) {
          var snippet;
          var imageFile = kind === 'image' || isImageFile(file);
          var videoFile = kind === 'video' || isVideoFile(file);
          if (imageFile) {
            /* 图片一律用 ![](...) 插入，主站才会真正显示出来 */
            snippet = '![' + label + '](' + url + ')';
            if (kind === 'file') snippet += '\n\n[下载原图](' + url + ')';
          } else if (videoFile) {
            snippet = '@video[' + label + '](' + url + ')\n\n[下载视频](' + url + ')';
          } else {
            snippet = '[下载 ' + file.name + '](' + url + ')';
          }
          insertAtCursor(snippet);
          toast('已上传并插入正文，记得点「保存到 GitHub」', 'ok');
        })
        .catch(function (err) { toast('上传失败：' + err.message, 'bad'); })
        .then(function () { setBusy(activeBtn, false); });
    };
    input.click();
  }

  function saveSiteSettings(options) {
    options = options || {};
    if (!state.token || !state.connected) {
      toast('请先连接 GitHub', 'bad');
      return Promise.reject(new Error('未连接'));
    }
    var cfg = Object.assign({}, defaultSettings(), state.settings || {}, {
      name: $('#sName').value.trim() || '重构博客',
      description: $('#sDescription').value.trim()
    });
    delete cfg.sha;
    setBusy($('#saveSiteBtn'), true, '保存中…');
    return putFile(SETTINGS_PATH, utf8ToBase64(JSON.stringify(cfg, null, 2) + '\n'), 'admin: update site settings')
      .then(function () {
        state.settings = cfg;
        fillSettingsForm();
        $('#siteState').textContent = options.auto
          ? '已发布，稍等片刻主站生效'
          : '已保存，稍等片刻主站生效';
        toast(options.auto ? '头像已上传并发布' : '站点设置已保存', 'ok');
      })
      .catch(function (err) { toast('保存失败：' + err.message, 'bad'); throw err; })
      .then(function () { setBusy($('#saveSiteBtn'), false); });
  }

  function handleAvatarUpload() {
    if (!state.token || !state.connected) { toast('请先连接 GitHub', 'bad'); return; }
    var input = $('#avatarInput');
    input.value = '';
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) return;
      setBusy($('#uploadAvatarBtn'), true, '上传中…');
      uploadAsset(file, 'image')
        .then(function (url) {
          state.settings = state.settings || defaultSettings();
          state.settings.avatar = url;
          fillSettingsForm();
          $('#siteState').textContent = '头像已上传，正在发布…';
          return saveSiteSettings({ auto: true });
        })
        .catch(function (err) { toast('头像操作失败：' + err.message, 'bad'); })
        .then(function () { setBusy($('#uploadAvatarBtn'), false); });
    };
    input.click();
  }

  function resetAvatar() {
    if (!state.token || !state.connected) { toast('请先连接 GitHub', 'bad'); return; }
    state.settings = state.settings || defaultSettings();
    state.settings.avatar = '';
    fillSettingsForm();
    $('#siteState').textContent = '正在恢复默认头像…';
    saveSiteSettings({ auto: true });
  }

  /* ---------------- 密码登录流程 ---------------- */
  function initAuth() {
    $('#authSetup').hidden = true;
    $('#authLogin').hidden = true;
    $('#changePwdBtn').hidden = true;
    $('#changePwdBox').hidden = true;
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) {
      setConn('当前环境不支持密码加密，请用 https 打开或走下方令牌方式', 'bad');
      $('#authSetup').hidden = false;
      return;
    }
    fetchPublicJson(AUTH_PATH).then(function (payload) {
      state.auth = payload;
      if (payload && payload.v === 1 && payload.cipher) {
        $('#authLogin').hidden = false;
        setConn('已启用密码登录 · 请输入后台密码', '');
        if (state.token) {
          connectWithToken(state.token).then(function () {
            if (state.connected) {
              $('#authLogin').hidden = true;
              setConn('已自动登录（本机保存的令牌）', 'ok');
            }
          });
        }
      } else {
        $('#authSetup').hidden = false;
        if (state.token) $('#setupTokenInput').value = state.token;
        setConn('首次设置：' + (state.token ? '本机已有令牌，设置密码即可' : '请输入令牌并设置密码'), '');
      }
    }).catch(function (err) {
      setConn('读取登录配置失败：' + err.message + '，可用下方高级令牌方式', 'bad');
      $('#authSetup').hidden = false;
    });
  }

  function setupPassword() {
    var token = $('#setupTokenInput').value.trim() || state.token;
    var pwd = $('#setupPassword').value;
    var pwd2 = $('#setupPassword2').value;
    if (!token) { toast('请先粘贴 GitHub 令牌', 'bad'); return; }
    if (!passwordValid(pwd)) { toast('密码至少 12 位，建议 14 位以上', 'bad'); return; }
    if (pwd !== pwd2) { toast('两次输入的密码不一致', 'bad'); return; }
    var oldToken = state.token;
    state.token = token;
    setBusy($('#setupBtn'), true, '设置中…');
    gh('https://api.github.com/user')
      .then(function () { return encryptToken(token, pwd); })
      .then(function (payload) {
        return putFile(AUTH_PATH, utf8ToBase64(JSON.stringify(payload, null, 2) + '\n'),
          'admin: setup password login').then(function () { return payload; });
      })
      .then(function (payload) {
        state.auth = payload;
        $('#authSetup').hidden = true;
        $('#authLogin').hidden = false;
        $('#setupPassword').value = '';
        $('#setupPassword2').value = '';
        return connectWithToken(token);
      })
      .then(function () { toast('密码已设置，以后输密码即可登录', 'ok'); })
      .catch(function (err) { state.token = oldToken; toast('设置失败：' + err.message, 'bad'); })
      .then(function () { setBusy($('#setupBtn'), false); });
  }

  function loginWithPassword() {
    var pwd = $('#loginPassword').value;
    if (!pwd) { toast('请输入后台密码', 'bad'); return; }
    setBusy($('#loginBtn'), true, '登录中…');
    decryptToken(state.auth, pwd)
      .then(function (token) {
        $('#loginPassword').value = '';
        return connectWithToken(token);
      })
      .then(function () {
        if (state.connected) {
          $('#authLogin').hidden = true;
          toast('登录成功', 'ok');
        }
      })
      .catch(function (err) { toast(err.message, 'bad'); })
      .then(function () { setBusy($('#loginBtn'), false); });
  }

  function changePassword() {
    var token = $('#changeTokenInput').value.trim();
    var pwd = $('#changePassword').value;
    var pwd2 = $('#changePassword2').value;
    if (!token) { toast('请粘贴当前 GitHub 令牌', 'bad'); return; }
    if (!passwordValid(pwd)) { toast('新密码至少 12 位，建议 14 位以上', 'bad'); return; }
    if (pwd !== pwd2) { toast('两次输入的密码不一致', 'bad'); return; }
    var oldToken = state.token;
    state.token = token;
    setBusy($('#changePwdSaveBtn'), true, '保存中…');
    gh('https://api.github.com/user')
      .then(function () { return encryptToken(token, pwd); })
      .then(function (payload) {
        return putFile(AUTH_PATH, utf8ToBase64(JSON.stringify(payload, null, 2) + '\n'),
          'admin: update password login').then(function () { return payload; });
      })
      .then(function (payload) {
        state.auth = payload;
        $('#changeTokenInput').value = '';
        $('#changePassword').value = '';
        $('#changePassword2').value = '';
        $('#changePwdBox').hidden = true;
        return connectWithToken(token);
      })
      .then(function () { toast('密码已更新', 'ok'); })
      .catch(function (err) { state.token = oldToken; toast('更新失败：' + err.message, 'bad'); })
      .then(function () { setBusy($('#changePwdSaveBtn'), false); });
  }

  /* ---------------- 草稿预览 ---------------- */
  function openPreview(raw) {
    if (!raw || !raw.slug) { toast('请先填好标题与 URL 标识', 'bad'); return; }
    try { sessionStorage.setItem('rb-preview', JSON.stringify(raw)); }
    catch (e) { toast('浏览器禁止本地存储，无法预览', 'bad'); return; }
    window.open('../post.html?preview=1&slug=' + encodeURIComponent(raw.slug), '_blank');
  }
  function previewFromEditor() {
    var post;
    try { post = gatherPost(); } catch (e) { toast(e.message, 'bad'); return; }
    openPreview(post);
  }
  function previewSavedPost(index) {
    var p = state.posts[index];
    if (p) openPreview(p);
  }

  /* ---------------- 事件绑定 ---------------- */
  function bind() {
    $('#themeBtn').addEventListener('click', function () {
      var cur = 'auto';
      try { cur = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) {}
      var next = { auto: 'light', light: 'dark', dark: 'auto' }[cur] || 'auto';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme();
    });

    $('#toggleToken').addEventListener('click', function () {
      var el = $('#tokenInput');
      var show = el.type === 'password';
      el.type = show ? 'text' : 'password';
      this.textContent = show ? '隐藏' : '显示';
    });

    $('#connectBtn').addEventListener('click', connect);
    $('#setupBtn').addEventListener('click', setupPassword);
    $('#loginBtn').addEventListener('click', loginWithPassword);
    $('#loginPassword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') loginWithPassword();
    });
    $('#changePwdBtn').addEventListener('click', function () {
      $('#changePwdBox').hidden = !$('#changePwdBox').hidden;
    });
    $('#changePwdSaveBtn').addEventListener('click', changePassword);
    $('#logoutBtn').addEventListener('click', function () {
      state.token = '';
      state.connected = false;
      $('#tokenInput').value = '';
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
      $('#changePwdBtn').hidden = true;
      $('#changePwdBox').hidden = true;
      if (state.auth) $('#authLogin').hidden = false;
      setConn('已退出本机登录，可用密码重新登录', '');
      toast('已退出本机登录', 'ok');
    });

    ['cfgOwner', 'cfgRepo', 'cfgBranch', 'cfgPath'].forEach(function (id) {
      $('#' + id).addEventListener('change', function () {
        saveCfg();
        toast('仓库设置已保存到本机', 'ok');
      });
    });

    $('#uploadAvatarBtn').addEventListener('click', handleAvatarUpload);
    $('#resetAvatarBtn').addEventListener('click', resetAvatar);
    $('#saveSiteBtn').addEventListener('click', saveSiteSettings);
    $('#saveFeaturesBtn').addEventListener('click', saveFeatures);
    $('#exportBtn').addEventListener('click', exportBackup);
    $('#previewBtn').addEventListener('click', previewFromEditor);
    $('#fStatus').addEventListener('change', function () {
      state.dirty = true;
      var el = $('#fPublishAt');
      if (this.value !== 'scheduled' || !el || el.value) return;
      var d = new Date(Date.now() + 3600 * 1000);
      var pad = function (n) { return String(n).padStart(2, '0'); };
      el.value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    });

    $('#insertImageBtn').addEventListener('click', function () { handleMediaUpload('image', '#insertImage'); });
    $('#insertVideoBtn').addEventListener('click', function () { handleMediaUpload('video', '#insertVideo'); });
    $('#insertFileBtn').addEventListener('click', function () { handleMediaUpload('file', '#insertFile'); });

    $('#refreshBtn').addEventListener('click', function () {
      if (!state.token) { toast('请先连接 GitHub', 'bad'); return; }
      setBusy(this, true, '拉取中…');
      fetchPosts(true).catch(function () {}).then(function () {
        setBusy($('#refreshBtn'), false);
      });
    });

    $('#listSearch').addEventListener('input', renderList);
    $('#newBtn').addEventListener('click', function () {
      if (!$('#editor').hidden && state.dirty && !window.confirm('有未保存的修改，确定新建另一篇文章吗？')) return;
      openEditor(-1);
    });

    $('#postList').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var index = parseInt(btn.getAttribute('data-index'), 10);
      if (btn.getAttribute('data-act') === 'edit') openEditor(index);
      if (btn.getAttribute('data-act') === 'preview') previewSavedPost(index);
      if (btn.getAttribute('data-act') === 'delete') deletePost(index);
    });

    $$('.editor-tabs .tab').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
    });

    $('#cancelBtn').addEventListener('click', closeEditor);
    $('#collapseEditor').addEventListener('click', closeEditor);
    $('#saveBtn').addEventListener('click', savePost);
    $('#deleteBtn').addEventListener('click', function () { deletePost(state.index); });

    $('#fTitle').addEventListener('input', function () {
      state.dirty = true;
      if (state.autoSlug && state.index < 0) $('#fSlug').value = makeSlug(this.value);
    });
    $('#fSlug').addEventListener('input', function () {
      state.autoSlug = false;
      state.dirty = true;
    });
    ['fSubtitle', 'fCategory', 'fDate', 'fMinutes', 'fTags', 'fCover', 'fBody', 'fJson', 'fMessage',
      'fStatus', 'fPublishAt', 'fFootnotes']
      .forEach(function (id) {
        $('#' + id).addEventListener('input', function () { state.dirty = true; });
        $('#' + id).addEventListener('change', function () { state.dirty = true; });
      });
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    applyTheme();
    state.cfg = loadCfg();
    fillCfg();
    bind();
    fillSettingsForm();

    try { state.token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) {}
    if (state.token) $('#tokenInput').value = state.token;
    initAuth();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
