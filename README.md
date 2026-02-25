# 高中数学学习网站（V1）

基于 Next.js App Router + TypeScript + Tailwind CSS + MDX 的课程讲解网站。

## 功能

- 首页：学段入口、学习路径、最新课程
- 课程列表页：按年级 / 章节筛选，支持关键词搜索
- 课程详情页：视频讲解 + MDX 讲义（知识点 / 例题 / 易错点 / 小练）
- 关于页：项目说明与反馈入口

## 内容结构

课程内容放在：

`content/courses/{grade}/{chapter}/{courseId}.mdx`

前置字段（frontmatter）必填：

- `title`
- `grade`
- `chapter`
- `videoUrl`
- `order`
- `summary`
- `duration`
- `updatedAt`

## 本地启动

1. 安装 Node.js 18.17+（当前项目依赖 Next.js 14）
2. 安装依赖

```bash
npm install
```

3. 启动开发环境

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 部署

- 推荐 Vercel，一键导入仓库后直接部署。
- 上线后可配置自定义域名与统计工具（如 Plausible/GA）。
