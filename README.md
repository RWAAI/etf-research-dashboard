# 美股分红型ETF研究分析 Dashboard

US Dividend ETF Research Dashboard — 覆盖 84 支分红型 ETF，数据截至 2025.03.31

## 功能模块

| 模块 | 说明 |
|------|------|
| **市场概览** | 统计卡片、类别柱状图、股息率 vs 收益气泡图、类别汇总表 |
| **ETF目录** | Ticker 搜索、类别/派息频率筛选、多列排序、点击查看详情（含税务） |
| **产品比较** | 最多 8 支 ETF 并排对比，柱状图 + 雷达图 + 全量指标表 |
| **组合构建** | 多组合管理，自定义权重，加权指标计算，组合间对比 |

- 🌐 中英文切换
- 📊 11 个 ETF 类别，84 支产品

## 技术栈

- **Vite 5** + **React 18**
- **Recharts** — 图表
- **Lucide React** — 图标
- **React Router** — 路由

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`

## 构建

```bash
npm run build
```

产出在 `dist/` 目录。

## 部署到 GitHub Pages

### 方式一：GitHub Actions 自动部署（推荐）

1. Push 代码到 GitHub 仓库
2. 进入仓库 **Settings → Pages → Source**，选择 **GitHub Actions**
3. Push 到 `main` 分支会自动触发部署

### 方式二：手动部署

```bash
npm install gh-pages --save-dev
npm run deploy
```

> **注意**：如果仓库名不是 `<username>.github.io`，需要修改 `vite.config.js` 中的 `base`：
>
> ```js
> base: '/<仓库名>/'
> ```

## 项目结构

```
src/
├── data/etfData.json          # 84支ETF统一数据（含税务、目录信息）
├── hooks/
│   ├── useETFData.js          # 数据层 hook
│   └── useLang.jsx            # 中英文 Context
├── utils/
│   ├── format.js              # 格式化工具、颜色常量
│   └── i18n.js                # 翻译字典
├── styles/global.css          # 全局样式（CSS变量）
├── pages/
│   ├── Dashboard.jsx          # 市场概览
│   ├── Catalog.jsx            # ETF目录（搜索/筛选/排序/详情）
│   ├── Compare.jsx            # 产品比较
│   └── Portfolio.jsx          # 组合构建（多组合 + 对比）
├── App.jsx                    # 侧栏导航 + 语言切换 + 路由
└── main.jsx                   # 入口
```

## 数据更新

替换 `src/data/etfData.json`，格式参考现有文件结构。

## License

MIT
