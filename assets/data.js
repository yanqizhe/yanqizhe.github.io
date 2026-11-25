/* ============================================================
   站点数据层（样品）
   全部内容均为占位，不对应任何真实站点、个人或文章
   结构映射 Hugo: content/post 下各篇 index.md 的 Front Matter + Markdown
   ============================================================ */
(function (global) {
  'use strict';

  var SITE = {
    name: '重构博客',
    suffix: 'Sample',
    description: '静态站爱好者 · 写点技术与工程笔记',
    emoji: '🧪',
    avatar: '',
    since: 2026,
    notice: '演示样品：布局与信息架构参照 hugo-theme-stack，内容与身份均为占位，非任何真实站点的副本。',
    license: '除非另有说明，此内容使用 CC BY-SA 4.0 许可。',
    disclaimer: '本博客内容仅供参考，作者不对其准确性、完整性或适用性作出任何明示或暗示的保证。本站为静态复刻样品，所有文章、作者、声明均为占位内容，不代表任何真实个人或组织的观点。',
    powerby: [
      ['样品', 'static-demo'], ['布局', 'Stack-style'], ['构建', '0-runtime'],
      ['资源', 'local-only'], ['主题', 'auto/light/dark'], ['运行时', '0-dep']
    ],
    /* 以下由网页后台「功能与开发者设置」写入 content/settings.json */
    features: {
      math: true, comments: true, analytics: true, wikilink: true,
      footnotes: true, callout: true, backlinks: true, webp: true
    },
    giscus: { repo: '', repoId: '', category: 'General', categoryId: '', mapping: 'pathname' },
    analytics: { provider: 'busuanzi', token: '' }
  };

  var MENU = [
    { id: 'home',      name: '主页',     href: 'index.html',           icon: 'home' },
    { id: 'archives',  name: '归档',     href: 'archives.html',        icon: 'archive' },
    { id: 'search',    name: '搜索',     href: 'search.html',          icon: 'search' },
    { id: 'friends',   name: '友情链接', href: 'friends.html',         icon: 'link' },
    { id: 'about',     name: '关于',     href: 'about.html',           icon: 'info' },
    { id: 'debug',     name: '开发人员工具', href: 'debug.html',       icon: 'code' }
  ];

  var SOCIAL = [
    { name: 'Domain',  title: 'Domain',  href: '#', icon: 'link' },
    { name: 'Email',   title: 'Email',   href: '#', icon: 'mail' },
    { name: 'GitHub',  title: 'GitHub',  href: '#', icon: 'github' },
    { name: 'RSS',     title: 'RSS',     href: '#', icon: 'rss' },
    { name: 'Key',     title: 'Keybase', href: '#', icon: 'key' }
  ];

  var CATEGORIES = [
    { slug: 'Original', name: 'Original', desc: '原创文章 · 独立思考与一手实践', thumb: 't1', color: '#2a9d8f' },
    { slug: 'Repost',   name: 'Repost',   desc: '转载文章 · 摘抄、翻译与整理',   thumb: 't2', color: '#3d3c0f' }
  ];

  var STACK = ['Hugo', 'Stack v4', 'Pagefind', 'Waline', 'Cloudflare', 'HTML', 'CSS', 'Vanilla JS'];

  var FRIENDS = [
    { name: '样例站点 A', desc: '静态站与构建工具笔记', initial: 'A', color: '#34495e' },
    { name: '样例站点 B', desc: '前端性能工程', initial: 'B', color: '#2a9d8f' },
    { name: '样例站点 C', desc: '开源项目维护记录', initial: 'C', color: '#8e6b4a' },
    { name: '样例站点 D', desc: '设计与排版', initial: 'D', color: '#6b5b95' },
    { name: '样例站点 E', desc: '系统与网络', initial: 'E', color: '#3d3c0f' },
    { name: '样例站点 F', desc: '写作与翻译', initial: 'F', color: '#4a7c8c' }
  ];

  /* sections: h=二级标题, p=段落数组, list=无序列表, quote=引用,
     code=代码块, table={head,rows}。文本支持 **加粗** 与 `行内代码`。 */
  /* === EMBEDDED_POSTS_BEGIN === */
  var POSTS = [
  {
    "slug": "aaa",
    "title": "aaa",
    "subtitle": "",
    "category": "Original",
    "date": "2026-11-25",
    "minutes": 6,
    "tags": [],
    "cover": "Original",
    "draft": false,
    "publishAt": "",
    "footnotes": [],
    "sections": [
      {
        "h": "正文",
        "p": [
          "我喜欢高一三班的杨子涵同学，他实在是太帅气了，当我在看到他的第一眼是就深深的爱上了他。每次路过你们班窗边，我总会下意识往你座位的方向看，看你低头刷化学竞赛题的样子，连草稿纸上的公式都好像在发光。\n上次在实验室看见你专注调试试剂的侧脸，我突然就确定，我不想只做远远看着你的人，我喜欢你很久啦。\n我攒了好多想和你分享的瞬间，想问问你刷竞赛题累不累，也想告诉你，你认真发光的样子，早就悄悄住进我心里了。‌\n注意你很久啦，每次在走廊看见你抱着厚厚的竞赛资料走过，我都忍不住放慢脚步，就想多偷偷看你两眼。\n我知道你在为化学竞赛很努力地准备，不想打扰你，但藏了这么久的心意还是忍不住想告诉你：我喜欢你。\n我没有什么特别的目的，就是想让你知道，有一个人一直在悄悄为你加油，也很想能有机会，多靠近你一点。‌\n我是经常在楼下偶遇你的女生，每次看见你高高的身影走过来，我都紧张得攥紧手里的书，连打招呼的勇气都没有。\n我总听别人说你化学竞赛特别厉害，可对我来说，最厉害的是你随便站在那里，就能让我整个世界的视线都只围着你转。\n今天终于鼓起勇气告诉你：我喜欢你，哪怕你现在满脑子都是竞赛知识点，我也想成为那个能给你递瓶水、陪你歇一小会儿的人。"
        ]
      }
    ],
    "lastmod": "2026-11-25"
  },
  {
    "slug": "post-mwuuiha3",
    "title": "七个葫芦娃重磅上演",
    "subtitle": "汪凌翔神了",
    "category": "Original",
    "date": "2026-11-24",
    "minutes": 6,
    "tags": [],
    "cover": "Original",
    "draft": false,
    "publishAt": "",
    "footnotes": [],
    "sections": [
      {
        "h": "小标题",
        "p": [
          "在这里写正文。"
        ]
      }
    ],
    "lastmod": "2026-11-24"
  },
  {
    "slug": "post-mwpyx3sg",
    "title": "郭逸文好帅",
    "subtitle": "火箭发射",
    "category": "Original",
    "date": "2026-11-21",
    "minutes": 6,
    "tags": [],
    "cover": "Original",
    "sections": [
      {
        "h": "正文",
        "p": [
          "郭逸文发射了一枚火箭"
        ]
      }
    ],
    "lastmod": "2026-11-21"
  },
  {
    "slug": "rebuild-static-blog",
    "title": "从 Hugo 到零运行时：一次静态博客的重构记录",
    "subtitle": "把模板、数据、交互三层拆开，用纯 HTML / CSS / JS 复刻一遍 Stack 主题的信息架构，顺便记录哪些东西其实可以不要。",
    "category": "Original",
    "date": "2026-11-08",
    "minutes": 12,
    "tags": [
      "静态站",
      "前端",
      "重构"
    ],
    "cover": "SSG / REBUILD",
    "sections": [
      {
        "h": "为什么要重构",
        "p": [
          "原站是 **Hugo + hugo-theme-stack v4**，通过 Hugo Modules 引入主题，构建时编译 SCSS、生成索引与 RSS。这套方案很稳，但对只想看页面形态的人来说，本地需要 Go、Hugo extended、Node 与 Sass 四套工具链。",
          "本次样品的目标不是替换 Hugo，而是把「渲染结果」单独抽出来：页面由静态 HTML 直出，数据集中在一份 JS 里，交互全部由原生脚本完成。这样双击文件就能预览，也方便逐项对照原版结构。"
        ],
        "list": [
          "零构建、零依赖、零外部请求，断网可用",
          "结构与原版对齐：左侧栏 / 右侧 widgets / 主内容三栏",
          "保留原版的分类徽章、阅读时长、TOC、相关文章、页脚技术信息",
          "所有身份与内容均为占位，不冒充真实站点"
        ]
      },
      {
        "h": "三层拆分",
        "p": [
          "模板层是各页面 HTML，负责首屏直出；数据层是 `data.js`，等价于 Hugo 的 Front Matter 集合；交互层是 `app.js`，负责列表渲染、搜索、主题与调试面板。",
          "这样做的好处是：改一篇文章不用碰 9 个页面，改一个组件只动一处脚本。代价是首屏文章列表依赖 JS，属于明确的取舍。"
        ],
        "table": {
          "head": [
            "层",
            "对应 Hugo 概念",
            "本样品文件"
          ],
          "rows": [
            [
              "模板",
              "layouts/",
              "index.html 等 9 个页面"
            ],
            [
              "数据",
              "content/ + Front Matter",
              "assets/data.js"
            ],
            [
              "样式",
              "assets/scss/",
              "assets/style.css"
            ],
            [
              "交互",
              "assets/ts/",
              "assets/app.js"
            ]
          ]
        }
      },
      {
        "h": "取舍清单",
        "p": [
          "没有构建期，就没有 Pagefind 的静态索引，也没有 GitInfo 的真实提交号。样品用运行时倒排索引替代 Pagefind，用固定文本替代 GitInfo，并在页脚明确标注为样品值。",
          "评论系统同理：保留 Waline 的容器结构与统计占位，但不发起任何外部请求。"
        ],
        "quote": "计算前移是 SSG 的核心；当没有构建阶段时，就必须在运行时把计算做得足够轻。"
      },
      {
        "h": "小结",
        "p": [
          "重构之后最直观的变化不是变快，而是**可解释**：每一个卡片、每一个 widget 都能在数据层找到来源，每一处交互都能在脚本里定位。"
        ]
      }
    ],
    "lastmod": "2026-11-08"
  },
  {
    "slug": "content-visibility-practice",
    "title": "content-visibility 与 contain-intrinsic-size 实战",
    "subtitle": "长列表滚动掉帧时，先别急着上虚拟滚动；浏览器自带的跳过渲染能力往往够用，而且不会破坏可访问性与查找。",
    "category": "Original",
    "date": "2026-10-27",
    "minutes": 8,
    "tags": [
      "前端",
      "性能",
      "CSS"
    ],
    "cover": "RENDER / SKIP",
    "sections": [
      {
        "h": "它跳过了什么",
        "p": [
          "`content-visibility: auto` 让浏览器跳过屏外元素的样式计算、布局与绘制，但保留 DOM 结构与可访问性树。相比虚拟列表，它不需要接管滚动位置，也不会让 Ctrl+F 失效。",
          "关键是搭配 `contain-intrinsic-size`：给屏外元素一个预估尺寸，否则滚动条会随着元素逐个进入视口而反复伸缩，产生另一种意义上的「跳」。"
        ],
        "code": ".article-list article {\n  content-visibility: auto;\n  contain-intrinsic-size: auto 132px;\n}"
      },
      {
        "h": "怎么验证",
        "p": [
          "在 DevTools 的 Performance 面板录制一段快速滚动，观察 Layout / Paint 的次数；再打开 Rendering → Layout Shift Regions，滚动时不应出现大面积高亮。",
          "样品的调试面板提供「关闭 content-visibility」开关，可以直接对比开关前后的首屏开销与帧率。"
        ],
        "list": [
          "预估尺寸要贴近真实卡片高度，误差过大会导致滚动跳动",
          "不要用在首屏可见元素上，收益为负",
          "与懒加载图片叠加时，注意占位容器的宽高比"
        ]
      },
      {
        "h": "边界",
        "p": [
          "它解决的是 **DOM 规模** 带来的渲染开销，不解决大图解码、长任务或网络抖动。若列表上万条，仍然需要窗口化。"
        ],
        "quote": "优化顺序永远是：先测量，再动手；先排除网络，再谈端侧。"
      }
    ],
    "lastmod": "2026-10-27"
  },
  {
    "slug": "cjk-font-split",
    "title": "中文 Web 字体分片：把首屏字体成本压到 0",
    "subtitle": "一个中文字体动辄数 MB。分片的思想是按 unicode-range 拆成小块，让浏览器只下载这一页真正用到的字。",
    "category": "Original",
    "date": "2026-10-15",
    "minutes": 15,
    "tags": [
      "字体",
      "性能",
      "前端"
    ],
    "cover": "FONT / SPLIT",
    "sections": [
      {
        "h": "问题有多大",
        "p": [
          "拉丁字体只有几十 KB，中文字库覆盖上万字形，完整 woff2 常在 3–10 MB。首屏若阻塞等待字体，LCP 会被直接拖慢；若直接 swap，又会出现字体闪烁。",
          "`cn-font-split` 一类工具把字库按字符使用频率切片，配合 `unicode-range` 让浏览器按需取用，单页实际下载量往往只剩几十 KB。"
        ],
        "code": "@font-face {\n  font-family: \"SplitCJK\";\n  src: url(\"cjk-042.woff2\") format(\"woff2\");\n  unicode-range: U+4E00-4E2F;\n  font-display: optional;\n}"
      },
      {
        "h": "本样品的选择",
        "p": [
          "样品采用**系统字体栈**：`-apple-system / Segoe UI / PingFang SC / Microsoft YaHei`，字体下载量为 0 字节。这比任何分片方案都更省，代价是不同系统下字形不完全一致。",
          "正式站若需要统一视觉，再叠加分片方案，并把 `font-display` 设为 `optional`，让慢网络直接回退系统字体。"
        ],
        "list": [
          "系统字体栈：0 请求，视觉不统一",
          "子集化：只打包含用字，需构建步骤",
          "全量分片 + unicode-range：视觉统一，按需下载"
        ]
      },
      {
        "h": "度量",
        "p": [
          "用 Lighthouse 看 LCP 与 CLS；用 Network 面板按 Font 类型过滤，确认实际传输字节数。"
        ]
      }
    ],
    "lastmod": "2026-10-15"
  },
  {
    "slug": "pagefind-inverted-index",
    "title": "Pagefind 背后的倒排索引",
    "subtitle": "构建期把文章切成词项，生成「词 → 文章」的映射；查询时只做查表，不扫全文。中文需要额外的二元分词。",
    "category": "Repost",
    "date": "2026-10-02",
    "minutes": 6,
    "tags": [
      "搜索",
      "算法",
      "静态站"
    ],
    "cover": "INDEX / FIND",
    "sections": [
      {
        "h": "从 O(n) 到查表",
        "p": [
          "朴素搜索对每篇文章做一次全文包含判断，复杂度随文章数与正文长度线性增长。倒排索引把它变成 `terms[word] -> [docId...]`，查询时取交集即可。",
          "Pagefind 在 `hugo` 构建后扫描 `public/`，生成分片索引文件，前端按需加载分片，因此索引再大也不会一次性压到首屏。"
        ],
        "code": "index[\"静态\"] = [1, 4, 9];\nindex[\"性能\"] = [1, 2, 7];\n// \"静态 性能\" -> 求交集 -> [1]"
      },
      {
        "h": "中文怎么办",
        "p": [
          "中文没有空格分词。样品用 **bigram**（相邻两字切分）近似：`静态博客` → `静态`、`态博`、`博客`；英文与数字按空白和小写化处理。",
          "这是一种精度换召回的折中，配合 120ms 防抖，在几十篇文章的规模下响应仍是毫秒级。"
        ],
        "quote": "把能在构建时算完的东西留到运行时，是静态站最常见的性能债务。"
      },
      {
        "h": "可改进处",
        "p": [
          "正式站可换用 Intl.Segmenter 做分词、加入标题权重与拼音映射，索引本身仍可保持纯静态。"
        ]
      }
    ],
    "lastmod": "2026-10-02"
  },
  {
    "slug": "core-web-vitals",
    "title": "Core Web Vitals：LCP / INP / CLS 的测量方法",
    "subtitle": "三个指标分别对应「首屏快不快」「点了卡不卡」「页面跳不跳」，目标值分别是 2.5s、200ms 与 0.1。",
    "category": "Repost",
    "date": "2026-09-22",
    "minutes": 9,
    "tags": [
      "性能",
      "指标",
      "前端"
    ],
    "cover": "METRICS / CWV",
    "sections": [
      {
        "h": "三个指标",
        "p": [
          "**LCP** 记录最大内容元素的渲染时刻，通常受图片、字体与服务端响应影响；**INP** 统计交互到下一帧的延迟，长任务是主要敌人；**CLS** 累计非预期布局偏移。"
        ],
        "table": {
          "head": [
            "指标",
            "含义",
            "目标"
          ],
          "rows": [
            [
              "LCP",
              "最大内容渲染",
              "< 2.5s"
            ],
            [
              "INP",
              "交互到下一帧",
              "< 200ms"
            ],
            [
              "CLS",
              "累计布局偏移",
              "< 0.1"
            ]
          ]
        }
      },
      {
        "h": "工具",
        "p": [
          "实验室数据用 Lighthouse，线上真实用户数据用 web-vitals 库上报；Long Animation Frames API 可以直接定位掉帧对应的脚本。",
          "样品的调试面板用 `requestAnimationFrame` 采样 FPS，`PerformanceObserver` 统计 longtask 与 long-animation-frame。"
        ],
        "code": "new PerformanceObserver(function (list) {\n  for (var e of list.getEntries()) if (e.duration > 50) count++;\n}).observe({ type: \"longtask\", buffered: true });"
      },
      {
        "h": "别凭感觉优化",
        "p": [
          "先建立基线，再逐项改动并复测。很多「优化」改的是根本不在关键路径上的代码。"
        ],
        "quote": "凭感觉优化必然翻车：先测量，再动手。"
      }
    ],
    "lastmod": "2026-09-22"
  },
  {
    "slug": "long-task-loaf",
    "title": "Long Task 与 LoAF：怎样量化「卡」",
    "subtitle": "60Hz 屏幕每帧只有 16.6ms。任何超过 50ms 的主线程任务都会推迟输入响应，Long Animation Frames 能告诉你卡在哪段脚本。",
    "category": "Original",
    "date": "2026-09-10",
    "minutes": 11,
    "tags": [
      "性能",
      "浏览器",
      "前端"
    ],
    "cover": "FRAME / 16MS",
    "sections": [
      {
        "h": "一帧的预算",
        "p": [
          "一帧内浏览器要完成 JS → 样式计算 → 布局 → 绘制 → 合成。任一环节超时，就会掉帧。流畅感的敌人其实是「忽快忽慢」，而不是单纯的慢。",
          "`PerformanceObserver` 的 `longtask` 条目统计 >50ms 的任务；`long-animation-frame` 进一步给出渲染阶段与脚本归因。"
        ],
        "code": "var po = new PerformanceObserver(function (l) {\n  l.getEntries().forEach(function (e) { frames++; });\n});\ntry { po.observe({ type: \"long-animation-frame\", buffered: true }); } catch (e) {}"
      },
      {
        "h": "常见处方",
        "p": [
          "大任务切片、重计算移入 Web Worker、密集计算用 WASM、动画只改 transform 与 opacity。"
        ],
        "list": [
          "避免读写交替导致的强制同步布局",
          "滚动监听使用 passive: true，回调用 rAF 节流",
          "列表 DOM 用一次性 innerHTML 写入，避免逐节点 append"
        ]
      },
      {
        "h": "样品实现",
        "p": [
          "调试面板展示当前 FPS、Long Task 数量、最长任务时长、LoAF 帧数与 DOM 节点数，全部来自浏览器原生 API。"
        ]
      }
    ],
    "lastmod": "2026-09-10"
  },
  {
    "slug": "hugo-modules-theme",
    "title": "Hugo Modules 与主题版本管理",
    "subtitle": "用 Go Modules 引入主题，可以让主题升级变成一次依赖更新；但 v4 及以上的大版本需要手工改配置。",
    "category": "Repost",
    "date": "2026-08-28",
    "minutes": 5,
    "tags": [
      "Hugo",
      "构建",
      "工具链"
    ],
    "cover": "HUGO / MODULE",
    "sections": [
      {
        "h": "工作方式",
        "p": [
          "`config/_default/module.toml` 声明主题仓库与版本，Hugo 通过 Go Modules 拉取到本地缓存，构建时把主题 layouts 合并进站点。",
          "本地需要 Hugo **extended** 版，因为主题要编译 SCSS；CI 里应显式设置 `HUGO_VERSION`，否则容易用到不含 SCSS 支持的版本。"
        ],
        "code": "hugo mod get -u github.com/CaiJimmy/hugo-theme-stack/v4\nhugo mod tidy\nhugo --gc --logLevel info"
      },
      {
        "h": "升级坑点",
        "p": [
          "受 Go Module 语义限制，v4 之后的大版本升级需要手工修改 `module.toml`，不能只靠 `-u`。"
        ],
        "quote": "构建工具链一旦超过三层，可复现性就比新特性更值钱。"
      },
      {
        "h": "本样品",
        "p": [
          "样品没有构建期，因此不引入 Go / Hugo / Sass，页面直接交付静态文件。"
        ]
      }
    ],
    "lastmod": "2026-08-28"
  },
  {
    "slug": "waline-privacy",
    "title": "Waline 评论系统的隐私边界",
    "subtitle": "评论是全站唯一有状态的部分。把「收集什么、公开什么、交给谁」写清楚，比选哪个后端更重要。",
    "category": "Original",
    "date": "2026-08-14",
    "minutes": 7,
    "tags": [
      "评论",
      "隐私",
      "Serverless"
    ],
    "cover": "COMMENT / PRIVACY",
    "sections": [
      {
        "h": "最小必要",
        "p": [
          "为提供评论服务会收集 IP、User-Agent 等技术信息，但不应以任何方式公开；不使用基于 Cookie 的评论功能；除 OAuth API 调用外不向第三方提供信息。",
          "反垃圾交给 Akismet 自动过滤，必要时人工审核；审核只针对垃圾与网络攻击，不涉及观点过滤。"
        ],
        "list": [
          "鼓励使用隐私保护邮箱注册评论身份，便于自行删除评论",
          "匿名昵称默认填充随机 UUID，便于区分不同发言者",
          "评论数据存于第三方数据库，须定期导出备份"
        ]
      },
      {
        "h": "样品实现",
        "p": [
          "保留 Waline 的容器、浏览量与评论数占位，但不加载任何远程脚本，也不产生外部请求。"
        ],
        "quote": "全站唯一的单点风险，通常是那个看起来最不起眼的第三方服务。"
      },
      {
        "h": "部署形态",
        "p": [
          "正式版本常见组合是 Waline 服务端部署在 Vercel，数据库用 LeanCloud / Supabase / Neon 之一，前端只连一个 serverURL。"
        ]
      }
    ],
    "lastmod": "2026-08-14"
  },
  {
    "slug": "pages-to-workers",
    "title": "从 Cloudflare Pages 迁往 Workers",
    "subtitle": "构建产物仍是静态文件，变化在于请求如何被路由与处理；迁移说明通常写在 README 里而不是配置里。",
    "category": "Repost",
    "date": "2026-07-30",
    "minutes": 4,
    "tags": [
      "Cloudflare",
      "部署",
      "静态站"
    ],
    "cover": "EDGE / ROUTE",
    "sections": [
      {
        "h": "变与不变",
        "p": [
          "不变的：Hugo 构建出的 `public/` 目录、CDN 缓存、自定义域名。变化的：入口从 Pages 的静态托管变为 Workers 的路由处理，可以插入自定义响应头与重定向逻辑。"
        ],
        "code": "git fetch --unshallow && hugo --gc --logLevel info"
      },
      {
        "h": "文件体积限制",
        "p": [
          "Pages 对单文件有 25 MiB 硬限制，音视频入库前需压缩；迁移后仍建议保留这条约束，避免边缘缓存异常。"
        ]
      },
      {
        "h": "可回滚性",
        "p": [
          "保留原 Pages 构建命令与 `_headers` / `_redirects`，两条路径并存一段时间再切换 DNS。"
        ]
      }
    ],
    "lastmod": "2026-07-30"
  },
  {
    "slug": "media-compression",
    "title": "Cloudflare Pages 单文件 25 MiB 限制与媒体压缩",
    "subtitle": "音频转 Opus、视频转 VP9 + Opus 的 WebM，是让媒体文件稳定落在限制内的常用做法。",
    "category": "Repost",
    "date": "2026-07-12",
    "minutes": 6,
    "tags": [
      "媒体",
      "工具",
      "部署"
    ],
    "cover": "MEDIA / 25M",
    "sections": [
      {
        "h": "音频",
        "p": [
          "无损格式转码到 320k MP3 或 160k Opus，同时保留必要元数据。"
        ],
        "code": "ffmpeg -i input.flac -ab 320k -map_metadata 0 \\\n  -id3v2_version 3 output.mp3\nffmpeg -i input.wav -c:a libopus -b:a 160k output.opus"
      },
      {
        "h": "视频",
        "p": [
          "VP9 720P + Opus 160k WebM 是兼容性较好的组合；按设备性能选择 24FPS 或原帧率预设。"
        ],
        "list": [
          "现代设备：VP9_720P_OrigFPS_40CQ + Opus 160k",
          "老设备：VP9_720P_24FPS_50CQ + Opus 160k",
          "折中：VP9_720P_30FPS_45CQ + Opus 160k"
        ]
      },
      {
        "h": "构建时检查",
        "p": [
          "在 CI 里扫描超过 25 MiB 的文件并删除或报警，比部署后失败更省时间。"
        ],
        "code": "find public -type f -size +25M -print -exec rm -vf {} \\;"
      }
    ],
    "lastmod": "2026-07-12"
  },
  {
    "slug": "content-governance",
    "title": "原创与转载：一套可执行的内容治理规则",
    "subtitle": "判定标准从严，难以判断时一律从宽标为转载；引用、翻译排版与读者不可见的代码不计入主要内容。",
    "category": "Original",
    "date": "2026-06-25",
    "minutes": 10,
    "tags": [
      "写作",
      "治理",
      "AIGC"
    ],
    "cover": "RULE / ORIGINAL",
    "sections": [
      {
        "h": "判定标准",
        "p": [
          "仅当文章主要内容的绝大部分来源于撰稿者的独立思考、独创性表达、实操经验或一手调研时，才标记为「原创」。"
        ],
        "quote": "难以判断时，一律从宽标记为「转载」。"
      },
      {
        "h": "明确归入转载",
        "p": [],
        "list": [
          "直接转载、仅由 LLM 翻译或排版的产物",
          "仅来自逆向工程的产物",
          "引用文段、翻译排版部分、读者不可见的程序代码"
        ]
      },
      {
        "h": "AIGC 标注",
        "p": [
          "主要内容中基于 GenAI 生成的图片或文本会明确标注；目标是把全站 AIGC 占比保持在低水平且不再提高。",
          "LLM 的生成结果不保证正确性，必须由具备相关知识的人人工检查与事实核查。"
        ],
        "quote": "更多地假定它一定会犯错，会更有利于使用它。"
      },
      {
        "h": "为什么值得写",
        "p": [
          "这类规则成本极低，但决定了一个博客长期是否可信。它比主题、CDN 与构建速度都更难补。"
        ]
      }
    ],
    "lastmod": "2026-06-25"
  },
  {
    "slug": "feature-flags-static",
    "title": "Feature Flags 在静态站里的轻量实现",
    "subtitle": "没有服务端也能做开关：localStorage 存状态，body 上加 class，CSS 负责阉割特性。",
    "category": "Original",
    "date": "2026-06-03",
    "minutes": 8,
    "tags": [
      "前端",
      "调试",
      "CSS"
    ],
    "cover": "FLAG / TOGGLE",
    "sections": [
      {
        "h": "三个开关",
        "p": [
          "样品提供「关闭卡片阴影」「关闭全部动画」「关闭 content-visibility」，用于对比开关前后的绘制开销与帧率。"
        ],
        "code": "document.body.classList.toggle(\"flag-no-shadow\", on);"
      },
      {
        "h": "为什么不引入 SDK",
        "p": [
          "静态站没有用户态与灰度发布，需要的只是本地 A/B 对比。一个 class 就够，加 SDK 反而带来额外请求与解析成本。"
        ]
      },
      {
        "h": "与 reduced-motion 的关系",
        "p": [
          "「关闭全部动画」等价于手动触发 `prefers-reduced-motion`；系统级偏好由媒体查询处理，手动开关由 class 覆盖。"
        ]
      }
    ],
    "lastmod": "2026-06-03"
  },
  {
    "slug": "theme-fouc",
    "title": "深浅主题切换如何避免 FOUC",
    "subtitle": "主题决定必须在样式生效前完成，否则首屏会先闪一下浅色再变暗。",
    "category": "Original",
    "date": "2026-05-18",
    "minutes": 5,
    "tags": [
      "CSS",
      "主题",
      "前端"
    ],
    "cover": "SCHEME / FOUC",
    "sections": [
      {
        "h": "预置脚本",
        "p": [
          "在 `<head>` 里、样式表之前读 localStorage 并写到 `<html data-scheme>`，让首帧就带上正确主题。"
        ],
        "code": "(function () {\n  var t = localStorage.getItem(\"StackColorScheme\") || \"auto\";\n  var dark = matchMedia(\"(prefers-color-scheme: dark)\").matches;\n  document.documentElement.dataset.scheme =\n    t === \"dark\" || (t === \"auto\" && dark) ? \"dark\" : \"light\";\n})();"
      },
      {
        "h": "三态",
        "p": [
          "`auto / light / dark` 三态循环，auto 跟随系统偏好并监听 change 事件；状态持久化，跨页面一致。"
        ]
      },
      {
        "h": "过渡",
        "p": [
          "只对 `background-color` 与 `color` 做短过渡，主题切换时不触发布局；`prefers-reduced-motion` 下全部关闭。"
        ]
      }
    ],
    "lastmod": "2026-05-18"
  },
  {
    "slug": "print-and-motion",
    "title": "打印样式与 prefers-reduced-motion",
    "subtitle": "两个常被忽略的媒体查询，却能显著改善可访问性；实现成本通常不到二十行 CSS。",
    "category": "Repost",
    "date": "2026-04-29",
    "minutes": 3,
    "tags": [
      "CSS",
      "可访问性"
    ],
    "cover": "A11Y / PRINT",
    "sections": [
      {
        "h": "打印",
        "p": [
          "隐藏侧栏、分页、评论与回到顶部；卡片去阴影改细边框；链接保留可读的黑色文本。"
        ],
        "code": "@media print {\n  .left-sidebar, .right-sidebar { display: none; }\n  body { background: #fff; color: #000; }\n}"
      },
      {
        "h": "减少动效",
        "p": [
          "`prefers-reduced-motion: reduce` 下把动画与过渡时长压到近乎 0，并关闭平滑滚动。"
        ],
        "quote": "可访问性通常不是新功能，而是把已有的东西别做太满。"
      },
      {
        "h": "验证",
        "p": [
          "DevTools 的 Rendering 面板可以直接模拟两种媒体特性。"
        ]
      }
    ],
    "lastmod": "2026-04-29"
  },
  {
    "slug": "search-bigram",
    "title": "静态站点的搜索：从 O(n) 扫描到 bigram 倒排索引",
    "subtitle": "几十篇文章的规模下，构建期索引可以用一份极简的运行时索引替代，代价是几百行脚本。",
    "category": "Original",
    "date": "2026-03-16",
    "minutes": 14,
    "tags": [
      "搜索",
      "算法",
      "前端"
    ],
    "cover": "SEARCH / BIGRAM",
    "sections": [
      {
        "h": "朴素实现的问题",
        "p": [
          "每次输入都遍历全部文章的标题、摘要、标签与正文，输入一快就会连续触发长任务，直接体现为输入卡顿。"
        ]
      },
      {
        "h": "索引结构",
        "p": [
          "把每篇文章切词后写入 `Map<term, Set<docId>>`；查询时对多词取交集，再按标题命中加权排序。"
        ],
        "code": "function add(doc, text) {\n  for (var term of tokenize(text)) {\n    if (!index[term]) index[term] = [];\n    if (index[term].indexOf(doc) < 0) index[term].push(doc);\n  }\n}"
      },
      {
        "h": "中文切分",
        "p": [
          "相邻两字构成 bigram，配合英文按词切分；这样「静态性能」与「性能静态」都能命中，代价是索引词数变多。"
        ],
        "list": [
          "标题命中权重最高",
          "标签与摘要次之",
          "正文命中权重最低"
        ]
      },
      {
        "h": "防抖",
        "p": [
          "输入事件用 120ms 防抖压缩，结果一次性 `innerHTML` 写入 DOM，避免逐节点操作触发布局抖动。"
        ],
        "quote": "把十几次输入压成一次查询，比优化查询本身更有效。"
      }
    ],
    "lastmod": "2026-03-16"
  },
  {
    "slug": "gitinfo-shallow-clone",
    "title": "GitInfo 与浅克隆：页脚时间为什么不准",
    "subtitle": "CI 默认浅克隆时，GitInfo 取到的是最新提交而非文件最后修改提交，页脚时间会集体变成同一天。",
    "category": "Repost",
    "date": "2026-02-20",
    "minutes": 3,
    "tags": [
      "Hugo",
      "CI",
      "Git"
    ],
    "cover": "GIT / INFO",
    "sections": [
      {
        "h": "现象",
        "p": [
          "启用 `enableGitInfo = true` 后，页脚显示的是文件最后修改时间。浅克隆仓库里没有完整历史，所有文件都会回退到当前 HEAD 的提交时间。"
        ]
      },
      {
        "h": "对策",
        "p": [
          "构建命令前加 `git fetch --unshallow`，让 CI 拉取完整历史。"
        ],
        "code": "git fetch --unshallow && hugo --gc --logLevel info"
      },
      {
        "h": "代价",
        "p": [
          "历史越长，拉取越慢。若不需要 GitInfo，直接关掉这个特性更划算。"
        ],
        "quote": "页脚的一行时间戳，可能藏着一整套 CI 假设。"
      }
    ],
    "lastmod": "2026-02-20"
  }
];
  /* === EMBEDDED_POSTS_END === */
  /* ---------- 轻量 Markdown 渲染（零依赖） ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeInlineUrl(u) {
    return /^(https?:\/\/|mailto:|#|\/|\.\/|\.\.\/|data:image\/)/i.test(String(u || '')) ? u : '#';
  }
  function isDownloadUrl(u) {
    return /\.(pdf|zip|rar|7z|tar|gz|mp4|webm|mov|m4v|txt|md|docx?|xlsx?|pptx?|csv|json|apk|exe|dmg)$/i.test(String(u || ''));
  }
  /* 双链索引：slug / 标题 → slug。文章还在依次 hydrate 时也能解析到后面的文章 */
  var REF = Object.create(null);
  function buildRef(list) {
    REF = Object.create(null);
    (list || []).forEach(function (p) {
      if (!p) return;
      if (p.slug) REF[p.slug] = p.slug;
      if (p.title) REF[p.title] = p.slug;
    });
  }
  function wikiLink(key, label) {
    var slug = REF[String(key || '').trim()];
    if (!slug) return '<kbd>' + key + (label ? '|' + label : '') + '</kbd>';
    return '<a class="wikilink" href="post.html?slug=' + encodeURIComponent(slug) + '">' +
      (label || key) + '</a>';
  }
  function inline(s) {
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
      .replace(/\[\^(\d+)\]/g, '<sup class="fn-ref"><a href="#fn-$1" id="fnref-$1">$1</a></sup>')
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (m, key, label) {
        return wikiLink(key, label);
      });
  }

  /* 极简语法着色：按词法分组一次性扫描，不引入 highlight.js / Prism */
  var TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(\d+(?:\.\d+)?(?:px|em|rem|ms|s|%|vh|vw)?)\b|(@[a-z-]+|\.[A-Za-z_][\w-]*|#[a-fA-F0-9]{3,8}\b|<\/?[A-Za-z][\w-]*|\/\*)|\b(var|let|const|function|return|if|else|for|while|new|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|this|null|true|false|undefined|def|print|echo|sudo|git|hugo|npm|auto|inherit|important)\b/g;
  var KEYWORDS = /^(var|let|const|function|return|if|else|for|while|new|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|this|null|true|false|undefined|def|print|echo|sudo|git|hugo|npm|auto|inherit|important)$/;
  function highlight(line) {
    if (/^\s*#/.test(line)) return '<span class="tok-cm">' + esc(line) + '</span>';
    var out = '', last = 0, m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(line)) !== null) {
      out += esc(line.slice(last, m.index));
      var cls = m[1] ? 'cm' : m[2] ? 'st' : m[3] ? 'nu' : m[4] ? 'at' : KEYWORDS.test(m[5]) ? 'kw' : '';
      out += cls ? '<span class="tok-' + cls + '">' + esc(m[0]) + '</span>' : esc(m[0]);
      last = TOKEN_RE.lastIndex;
    }
    return out + esc(line.slice(last));
  }
  function detectLang(src) {
    if (/^\s*(\$\s|git\s|npm\s|hugo\s|sudo\s|curl\s|pnpm\s)/.test(src)) return 'bash';
    if (/\[[^\]\n]+\]\s*$/m.test(src) && /^\s*\w+\s*=/.test(src)) return 'toml';
    if (/<\/?[a-z][^>]*>/i.test(src)) return 'html';
    if (/\b(function|const|let|var)\b|=>|\bfor\s*\(/.test(src)) return 'javascript';
    if (/[.#][\w-]+\s*\{|:\s*[^;]+;/.test(src)) return 'css';
    return 'text';
  }
  function codeBlock(src) {
    var lang = detectLang(src), lines = String(src).replace(/\n+$/, '').split('\n');
    var body = lines.map(function (l, i) {
      return '<span class="code-line"><span class="line-no" aria-hidden="true">' + (i + 1) +
        '</span><span class="line-code">' + (highlight(l) || '&nbsp;') + '</span></span>';
    }).join('');
    return '<div class="codeblock" data-lang="' + lang + '">' +
      '<div class="codeblock-head"><span class="code-lang">' + lang + '</span>' +
      '<span class="code-lines">' + lines.length + ' 行</span>' +
      '<button class="code-copy" type="button" aria-label="复制代码"><span data-icon="copy"></span><span class="copy-text">复制</span></button>' +
      '</div><pre><code>' + body + '</code></pre></div>';
  }

  function calloutType(label) {
    var s = String(label || '').toLowerCase();
    if (/warn|warning|注意|警告|风险|坑|danger/.test(s)) return 'warn';
    if (/tip|技巧|建议|提示|实践|经验/.test(s)) return 'tip';
    if (/ok|success|结论|小结|要点|完成/.test(s)) return 'ok';
    return 'info';
  }

  function buildBody(post) {
    var html = [], toc = [], n = 0;
    post.sections.forEach(function (sec) {
      n += 1;
      var id = 'sec-' + n;
      toc.push({ id: id, text: sec.h, level: 2 });
      html.push('<h2 id="' + id + '" class="heading-anchor">' + esc(sec.h) +
        '<a class="anchor-link" href="#' + id + '" aria-label="锚点链接">#</a></h2>');
      (sec.p || []).forEach(function (p) { html.push('<p>' + inline(p) + '</p>'); });
      if (sec.list && sec.list.length) {
        html.push('<ul>' + sec.list.map(function (li) {
          var task = /^\[([ xX])\]\s+(.+)$/.exec(li);
          if (task) return '<li class="task"><span class="task-box' + (task[1] !== ' ' ? ' done' : '') +
            '" aria-hidden="true"></span>' + inline(task[2]) + '</li>';
          return '<li>' + inline(li) + '</li>';
        }).join('') + '</ul>');
      }
      if (sec.quote) html.push('<blockquote><p>' + inline(sec.quote) + '</p></blockquote>');
      if (sec.code) html.push(codeBlock(sec.code));
      if (sec.table) {
        html.push('<div class="table-wrap"><table><thead><tr>' + sec.table.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          sec.table.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
      }
      var cal = sec.callout;
      if (!cal && sec.note && sec.note.length >= 2) cal = { title: sec.note[0], text: sec.note[1] };
      if (cal && cal.text) {
        var ct = calloutType(cal.type || cal.title);
        var paras = String(cal.text).split('\n').filter(function (x) { return x.trim(); });
        html.push('<aside class="callout callout-' + ct + '">' +
          (cal.title ? '<div class="callout-head">' + esc(cal.title) + '</div>' : '') +
          paras.map(function (t) { return '<p>' + inline(t) + '</p>'; }).join('') +
          '</aside>');
      }
    });
    if (post.footnotes && post.footnotes.length) {
      html.push('<section class="post-footnotes"><h2 class="footnotes-title">参考与注释</h2><ol>' +
        post.footnotes.map(function (f, i) {
          return '<li id="fn-' + (i + 1) + '">' + inline(f) +
            ' <a class="fn-back" href="#fnref-' + (i + 1) + '" aria-label="回到正文">\u21a9</a></li>';
        }).join('') + '</ol></section>');
    }
    return { html: html.join('\n'), toc: toc };
  }

  /* ---------- 主题化程序化封面 v2（SVG data URI，零外部请求） ----------
     按文章 cover / 标签匹配 11 种主题插画，8 组低饱和配色；网格纹理 + 顶部色条，
     风格克制、辨识度高，贴合 Stack 简约调性，深浅模式皆宜。 */
  var COVER_PALETTES = [
    ['#334e68', '#5b7c99', '#e9eff5'],  // 石板蓝
    ['#1f7a6d', '#4fb3a3', '#e6f4f1'],  // 青绿
    ['#8a6b45', '#c19a6b', '#f7f0e6'],  // 暖沙
    ['#5a4b86', '#8b7cba', '#f0edf8'],  // 灰紫
    ['#2b5a72', '#5c93ad', '#e9f1f6'],  // 深海
    ['#96545c', '#c98b94', '#f8eef0'],  // 玫瑰
    ['#3f6648', '#6fa076', '#eaf2ea'],  // 苔绿
    ['#3d4c7d', '#6d7cb0', '#edf0f8']   // 靛蓝
  ];
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  /* 按主题词匹配插画类型；先用 cover 标签，再回退到 tags / title */
  function coverKind(post) {
    var t = String(post.cover || '').toUpperCase() + ' ' +
      (post.tags || []).join(' ') + ' ' + String(post.title || '');
    if (/GIT|分支/.test(t)) return 'branch';
    if (/FONT|A11Y|PRINT|FOUC|字体|可访问/.test(t)) return 'glyph';
    if (/SEARCH|INDEX|FIND|BIGRAM|搜索|索引/.test(t)) return 'lens';
    if (/METRICS|CWV|16MS|FRAME|指标|帧/.test(t)) return 'chart';
    if (/FLAG|TOGGLE|调试/.test(t)) return 'toggle';
    if (/COMMENT|PRIVACY|评论|隐私/.test(t)) return 'bubble';
    if (/EDGE|ROUTE|CLOUDFLARE|部署|边缘/.test(t)) return 'route';
    if (/MEDIA|25M|媒体|图床/.test(t)) return 'media';
    if (/RULE|ORIGINAL|AIGC|写作|原创/.test(t)) return 'doc';
    if (/RENDER|SKIP|VISIBILITY|渲染|视口/.test(t)) return 'viewport';
    if (/REBUILD|HUGO|MODULE|构建|重构|STACK/.test(t)) return 'layers';
    return 'wave';
  }
  function coverArt(kind, a, b) {
    var s = '';
    if (kind === 'branch') {
      s = '<path d="M96 48 V146" stroke="' + a + '" stroke-width="3" opacity=".7"/>' +
        '<path d="M96 76 C150 76 150 108 210 108" fill="none" stroke="' + b + '" stroke-width="3" opacity=".85"/>' +
        '<path d="M96 118 C140 118 160 72 224 72" fill="none" stroke="' + a + '" stroke-width="2" opacity=".4" stroke-dasharray="4 4"/>' +
        '<circle cx="96" cy="56" r="9" fill="' + a + '"/><circle cx="96" cy="100" r="8" fill="' + b + '"/>' +
        '<circle cx="96" cy="142" r="8" fill="' + a + '" opacity=".7"/>' +
        '<circle cx="214" cy="108" r="9" fill="' + a + '"/><circle cx="228" cy="72" r="8" fill="' + b + '"/>';
    } else if (kind === 'glyph') {
      s = '<text x="160" y="128" text-anchor="middle" font-family="Georgia,serif" font-size="88" font-weight="700" fill="' + a + '" opacity=".78">Aa</text>' +
        '<line x1="72" y1="140" x2="248" y2="140" stroke="' + b + '" stroke-width="2" opacity=".65"/>' +
        '<line x1="72" y1="62" x2="248" y2="62" stroke="' + b + '" stroke-width="2" opacity=".3"/>' +
        '<circle cx="160" cy="54" r="3" fill="' + a + '" opacity=".5"/>';
    } else if (kind === 'lens') {
      s = '<circle cx="146" cy="90" r="44" fill="#fff" stroke="' + a + '" stroke-width="4" opacity=".82"/>' +
        '<circle cx="146" cy="90" r="30" fill="' + b + '" opacity=".18"/>' +
        '<path d="M178 122 L220 164" stroke="' + a + '" stroke-width="10" stroke-linecap="round" opacity=".85"/>' +
        '<g fill="' + a + '" opacity=".5"><rect x="128" y="82" width="36" height="5" rx="2"/><rect x="128" y="94" width="24" height="5" rx="2"/></g>';
    } else if (kind === 'chart') {
      s = '<line x1="60" y1="150" x2="272" y2="150" stroke="' + a + '" stroke-width="2" opacity=".6"/>' +
        '<line x1="60" y1="48" x2="60" y2="150" stroke="' + a + '" stroke-width="2" opacity=".6"/>' +
        '<g fill="' + b + '" opacity=".6">' +
        '<rect x="76" y="112" width="22" height="38" rx="2"/><rect x="110" y="88" width="22" height="62" rx="2"/>' +
        '<rect x="144" y="98" width="22" height="52" rx="2"/><rect x="178" y="64" width="22" height="86" rx="2"/>' +
        '<rect x="212" y="78" width="22" height="72" rx="2"/><rect x="246" y="54" width="22" height="96" rx="2"/></g>' +
        '<polyline points="87,106 121,82 155,92 189,58 223,72 257,48" fill="none" stroke="' + a + '" stroke-width="2.5" opacity=".8"/>';
    } else if (kind === 'toggle') {
      s = '<rect x="62" y="70" width="92" height="46" rx="23" fill="' + b + '" opacity=".75"/>' +
        '<circle cx="108" cy="93" r="17" fill="#fff" opacity=".92"/>' +
        '<rect x="170" y="70" width="92" height="46" rx="23" fill="' + a + '" opacity=".25"/>' +
        '<circle cx="216" cy="93" r="17" fill="' + a + '" opacity=".6"/>' +
        '<text x="62" y="142" font-family="monospace" font-size="11" letter-spacing="2" fill="' + a + '" opacity=".7">ON / OFF</text>';
    } else if (kind === 'bubble') {
      s = '<path d="M56 52 a10 10 0 0 1 10 -10 h150 a10 10 0 0 1 10 10 v58 a10 10 0 0 1 -10 10 h-92 l-24 20 v-20 h-34 a10 10 0 0 1 -10 -10 Z" fill="' + b + '" opacity=".45" stroke="' + a + '" stroke-width="2" stroke-opacity=".7"/>' +
        '<g fill="' + a + '" opacity=".72"><circle cx="92" cy="80" r="4"/><circle cx="116" cy="80" r="4"/><circle cx="140" cy="80" r="4"/></g>' +
        '<rect x="196" y="124" width="36" height="30" rx="5" fill="' + a + '" opacity=".6"/>' +
        '<path d="M204 124 v-6 a10 10 0 0 1 20 0 v6" fill="none" stroke="' + a + '" stroke-width="3" opacity=".75"/>';
    } else if (kind === 'route') {
      s = '<circle cx="160" cy="96" r="21" fill="' + b + '" opacity=".6" stroke="' + a + '" stroke-width="2"/>' +
        '<circle cx="80" cy="60" r="10" fill="' + a + '" opacity=".75"/><circle cx="248" cy="62" r="10" fill="' + a + '" opacity=".75"/>' +
        '<circle cx="86" cy="140" r="10" fill="' + a + '" opacity=".75"/><circle cx="244" cy="142" r="10" fill="' + a + '" opacity=".75"/>' +
        '<g stroke="' + a + '" stroke-width="2" opacity=".5" stroke-dasharray="5 4"><path d="M90 64 L146 88"/><path d="M242 66 L176 88"/>' +
        '<path d="M94 136 L148 104"/><path d="M238 138 L174 106"/></g>';
    } else if (kind === 'media') {
      s = '<rect x="52" y="50" width="216" height="90" rx="8" fill="' + a + '" opacity=".2" stroke="' + a + '" stroke-width="2" stroke-opacity=".6"/>' +
        '<circle cx="160" cy="95" r="27" fill="' + b + '" opacity=".85"/>' +
        '<path d="M154 83 L154 107 L177 95 Z" fill="#fff"/>' +
        '<g fill="' + a + '" opacity=".45"><rect x="66" y="150" width="24" height="6" rx="3"/><rect x="98" y="150" width="16" height="6" rx="3"/><rect x="122" y="150" width="30" height="6" rx="3"/></g>';
    } else if (kind === 'doc') {
      s = '<path d="M96 44 h84 l26 26 v76 a6 6 0 0 1 -6 6 H96 a6 6 0 0 1 -6 -6 V50 a6 6 0 0 1 6 -6 Z" fill="#fff" stroke="' + a + '" stroke-width="2" opacity=".85"/>' +
        '<path d="M180 44 v26 h26" fill="none" stroke="' + a + '" stroke-width="2" opacity=".6"/>' +
        '<g stroke="' + b + '" stroke-width="3" opacity=".75" stroke-linecap="round"><path d="M104 92 h68"/><path d="M104 106 h78"/><path d="M104 120 h56"/></g>' +
        '<path d="M206 70 l34 34" stroke="' + a + '" stroke-width="4" opacity=".6" stroke-linecap="round"/>';
    } else if (kind === 'viewport') {
      s = '<rect x="52" y="42" width="216" height="106" rx="6" fill="#fff" stroke="' + a + '" stroke-width="2" opacity=".8"/>' +
        '<rect x="52" y="42" width="216" height="18" rx="6" fill="' + a + '" opacity=".8"/>' +
        '<circle cx="64" cy="51" r="2.5" fill="#fff"/><circle cx="74" cy="51" r="2.5" fill="#fff"/>' +
        '<rect x="66" y="76" width="86" height="8" rx="3" fill="' + b + '" opacity=".65"/>' +
        '<rect x="66" y="92" width="124" height="6" rx="3" fill="' + a + '" opacity=".2"/>' +
        '<rect x="66" y="104" width="104" height="6" rx="3" fill="' + a + '" opacity=".2"/>' +
        '<path d="M198 122 L232 86 L266 122 Z" fill="' + b + '" opacity=".55"/>' +
        '<path d="M198 136 L216 118 L234 136 Z" fill="' + a + '" opacity=".4"/>';
    } else if (kind === 'layers') {
      s = '<path d="M160 40 L272 72 L160 104 L48 72 Z" fill="' + b + '" opacity=".5"/>' +
        '<path d="M48 72 L160 104 L160 118 L48 86 Z" fill="' + a + '" opacity=".6"/>' +
        '<path d="M272 72 L160 104 L160 118 L272 86 Z" fill="' + a + '" opacity=".4"/>' +
        '<path d="M160 88 L272 120 L160 152 L48 120 Z" fill="' + b + '" opacity=".32"/>' +
        '<path d="M48 120 L160 152 L160 164 L48 132 Z" fill="' + a + '" opacity=".42"/>';
    } else { // wave — 默认
      s = '<path d="M0 130 Q40 90 80 130 T160 130 T240 130 T320 130 V192 H0 Z" fill="' + b + '" opacity=".38"/>' +
        '<path d="M0 150 Q40 110 80 150 T160 150 T240 150 T320 150 V192 H0 Z" fill="' + a + '" opacity=".42"/>' +
        '<circle cx="252" cy="56" r="20" fill="' + b + '" opacity=".45"/>';
    }
    return s;
  }
  function makeCover(post) {
    var h = hashStr(post.slug);
    var pal = COVER_PALETTES[h % COVER_PALETTES.length];
    var a = pal[0], b = pal[1], c = pal[2];
    var kind = coverKind(post);
    var label = esc(String(post.cover || post.category).toUpperCase());
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 192">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + c + '"/><stop offset="1" stop-color="#ffffff"/></linearGradient>' +
      '<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">' +
      '<path d="M20 0H0V20" fill="none" stroke="' + a + '" stroke-width="1" opacity=".07"/></pattern></defs>' +
      '<rect width="320" height="192" fill="url(#g)"/>' +
      '<rect width="320" height="192" fill="url(#grid)"/>' +
      '<rect x="0" y="0" width="320" height="5" fill="' + a + '"/>' +
      coverArt(kind, a, b) +
      '<text x="18" y="179" font-family="ui-monospace,SFMono-Regular,monospace" font-size="11" letter-spacing="2.2" fill="' + a + '" opacity=".88">' + label + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* 发布状态：草稿 / 定时 / 已发布。草稿和未到点的定时稿不进主站列表。 */
  function publishState(p) {
    if (p && (p.draft === true || p.draft === 'true')) return 'draft';
    var at = p && p.publishAt ? Date.parse(p.publishAt) : 0;
    if (at && at > Date.now()) return 'scheduled';
    return 'published';
  }
  function pruneUnpublished() {
    for (var i = POSTS.length - 1; i >= 0; i--) {
      if (POSTS[i].status !== 'published') POSTS.splice(i, 1);
    }
  }

  /* 把一篇「源文章」补全为可渲染文章；后台新增/编辑的文章同样走这里 */
  function hydrate(p) {
    if (!Array.isArray(p.tags)) p.tags = [];
    if (!Array.isArray(p.sections) || !p.sections.length) p.sections = [{ h: '正文', p: [''] }];
    var b = buildBody(p);
    p.body = b.html;
    p.toc = b.toc;
    p.coverImage = makeCover(p);
    p.lastmod = p.lastmod || p.date;
    p.excerpt = p.subtitle;
    p.status = publishState(p);
    p.publishAt = p.publishAt || '';
    var t = (p.tags || []).join(' ');
    if (/性能|指标|浏览器|CSS|调试/.test(t)) p.series = '前端性能工程笔记';
    else if (/Hugo|构建|工具链|静态站|部署|Cloudflare|Serverless/.test(t)) p.series = '静态站构建手记';
    else p.series = '';
    p.featured = p.slug === 'rebuild-static-blog';
    p.words = (p.sections || []).reduce(function (acc, s) {
      return acc + [s.h, (s.p || []).join(''), (s.list || []).join(''), s.quote || '', s.code || '']
        .join('').replace(/[\s*`#\[\]]/g, '').length;
    }, 0) + (p.footnotes || []).join('').length;
    p.text = [p.title, p.subtitle, p.tags.join(' '), p.category, p.cover, p.sections.map(function (s) {
      return s.h + ' ' + (s.p || []).join(' ') + ' ' + (s.list || []).join(' ') + ' ' +
        (s.quote || '') + ' ' + (s.code || '') + ' ' + (s.note ? s.note.join(' ') : '') + ' ' +
        (s.callout ? [s.callout.title, s.callout.text].join(' ') : '') + ' ' +
        (s.table ? s.table.rows.map(function (r) { return r.join(' '); }).join(' ') : '');
    }).join(' ') + ' ' + (p.footnotes || []).join(' ')].join(' ').toLowerCase();
    return p;
  }
  function sortPosts() {
    POSTS.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }
  buildRef(POSTS);
  POSTS.forEach(hydrate);
  pruneUnpublished();
  sortPosts();
  /* 网页后台保存后，主站用远程源数据整体替换（数组保持同一引用，app.js 无需重新取） */
  function setPosts(rawList) {
    POSTS.length = 0;
    buildRef(rawList);
    (rawList || []).forEach(function (raw) {
      try { POSTS.push(hydrate(raw)); } catch (e) {}
    });
    pruneUnpublished();
    sortPosts();
    return POSTS;
  }
  /* 后台「预览」：把本机草稿临时插到列表最前面，只在这个标签页可见 */
  function addPreviewPost(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var copy = JSON.parse(JSON.stringify(raw));
    copy.draft = false;
    copy.publishAt = '';
    var p = hydrate(copy);
    p.status = 'preview';
    POSTS.unshift(p);
    if (!REF[p.slug]) REF[p.slug] = p.slug;
    if (p.title) REF[p.title] = p.slug;
    return p;
  }
  POSTS.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });

  /* 网页后台「站点设置」保存后，主站用远程配置覆盖占位站点信息 */
  function setSite(patch) {
    if (!patch || typeof patch !== 'object') return SITE;
    ['name', 'description', 'notice', 'avatar', 'license'].forEach(function (key) {
      if (typeof patch[key] === 'string') SITE[key] = patch[key];
    });
    ['features', 'giscus', 'analytics'].forEach(function (key) {
      if (patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
        SITE[key] = Object.assign({}, SITE[key] || {}, patch[key]);
      }
    });
    return SITE;
  }

  global.BLOG_DATA = {
    SITE: SITE, MENU: MENU, SOCIAL: SOCIAL, CATEGORIES: CATEGORIES,
    STACK: STACK, FRIENDS: FRIENDS, POSTS: POSTS,
    setPosts: setPosts, setSite: setSite, addPreviewPost: addPreviewPost,
    pagefindPlaceholder: 'Pagefind 在正式站由构建期生成索引；本样品使用运行时倒排索引。'
  };
})(window);
