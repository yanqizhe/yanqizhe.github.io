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
    sha: null,
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
  function contentsUrl() {
    var p = state.cfg.path.split('/').map(encodeURIComponent).join('/');
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

  function fetchPosts(notify) {
    if (!state.token) { toast('请先连接 GitHub', 'bad'); return Promise.reject(new Error('no token')); }
    return gh(contentsUrl() + '?ref=' + encodeURIComponent(state.cfg.branch))
      .then(function (data) {
        if (Array.isArray(data)) throw new Error('配置的文章路径是目录，请填写 posts.json 文件');
        if (!data || !data.content) throw new Error('文件内容为空或无法读取');
        var list;
        try { list = JSON.parse(base64ToUtf8(data.content)); }
        catch (e) { throw new Error('posts.json 不是合法 JSON'); }
        if (!Array.isArray(list)) throw new Error('posts.json 顶层必须是数组');
        state.posts = list;
        state.sha = data.sha;
        state.connected = true;
        setConn('已连接：' + state.cfg.owner + '/' + state.cfg.repo, 'ok');
        renderList();
        if (notify) toast('已拉取 ' + list.length + ' 篇文章', 'ok');
        return list;
      })
      .catch(function (err) {
        if (err.status === 404) {
          state.posts = [];
          state.sha = null;
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

  function connect() {
    state.token = $('#tokenInput').value.trim();
    if (!state.token) { toast('请先粘贴 GitHub 令牌', 'bad'); return; }
    saveCfg();
    try { localStorage.setItem(TOKEN_KEY, state.token); } catch (e) {}
    setBusy($('#connectBtn'), true, '正在连接…');
    setConn('正在验证令牌…', '');
    gh('https://api.github.com/user')
      .then(function (user) {
        setConn('已验证身份：' + user.login + '，正在读取文章…', 'ok');
        return fetchPosts(false);
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

  function putPosts(posts, message, retried) {
    var body = {
      message: message,
      content: encodePosts(posts),
      branch: state.cfg.branch
    };
    if (state.sha) body.sha = state.sha;
    return gh(contentsUrl(), {
      method: 'PUT',
      body: JSON.stringify(body)
    }).catch(function (err) {
      if (err.status === 409 && !retried) {
        return fetchPosts(false).then(function () {
          return putPosts(posts, message, true);
        });
      }
      throw err;
    }).then(function (resp) {
      if (resp && resp.content && resp.content.sha) state.sha = resp.content.sha;
      return resp;
    });
  }

  /* ---------------- Markdown 风格正文 ↔ sections ---------------- */
  function inlineHtml(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, url) {
        return '<a href="' + esc(safeUrl(url)) + '" target="_blank" rel="noopener">' + text + '</a>';
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
  }

  function gatherFromForm() {
    return normalizePost({
      slug: $('#fSlug').value.trim() || makeSlug($('#fTitle').value),
      title: $('#fTitle').value.trim(),
      subtitle: $('#fSubtitle').value.trim(),
      category: $('#fCategory').value,
      date: $('#fDate').value,
      minutes: $('#fMinutes').value,
      tags: splitTags($('#fTags').value),
      cover: $('#fCover').value.trim(),
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
        html.push('<aside class="note-card"><span class="note-label">' + esc(s.note[0]) +
          '</span><p>' + inlineHtml(s.note[1]) + '</p></aside>');
      }
    });

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
      return '<article class="admin-post">' +
        '<div class="admin-post-head">' +
          '<span class="badge">' + esc(p.category) + '</span>' +
          '<span>' + esc(p.date) + '</span>' +
          '<span>·</span><span>' + esc(p.minutes || 0) + ' 分钟</span>' +
          '<span class="badge slug">' + esc(p.slug) + '</span>' +
        '</div>' +
        '<h3><a href="../post.html?slug=' + encodeURIComponent(p.slug) + '" target="_blank" rel="noopener">' +
          esc(p.title) + '</a></h3>' +
        '<p>' + esc(p.subtitle || '（无摘要）') + '</p>' +
        '<div class="post-actions">' +
          '<button class="btn btn-mini" type="button" data-act="edit" data-index="' + item.i + '">编辑</button>' +
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
    putPosts(next, msg, false)
      .then(function () {
        state.posts = next;
        state.dirty = false;
        $('#editor').hidden = true;
        state.index = -1;
        renderList();
        toast('已保存到 GitHub，稍等片刻主站即可生效', 'ok');
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
    putPosts(next, 'admin: delete ' + p.slug, false)
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
    $('#logoutBtn').addEventListener('click', function () {
      state.token = '';
      state.connected = false;
      $('#tokenInput').value = '';
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
      setConn('已清除令牌，未连接', '');
      toast('已清除本机保存的令牌', 'ok');
    });

    ['cfgOwner', 'cfgRepo', 'cfgBranch', 'cfgPath'].forEach(function (id) {
      $('#' + id).addEventListener('change', function () {
        saveCfg();
        toast('仓库设置已保存到本机', 'ok');
      });
    });

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
    ['fSubtitle', 'fCategory', 'fDate', 'fMinutes', 'fTags', 'fCover', 'fBody', 'fJson', 'fMessage']
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

    try { state.token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) {}
    if (state.token) {
      $('#tokenInput').value = state.token;
      connect();
    } else {
      setConn('未连接 · 请粘贴 GitHub 令牌', '');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
