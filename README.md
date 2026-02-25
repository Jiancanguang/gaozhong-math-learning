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

`videoUrl` 支持以下格式（推荐 B 站）：

- B 站完整链接：`https://www.bilibili.com/video/BV...`
- B 站 BV 号：`BV...`
- B 站 av 号：`av123456`

示例：

```mdx
---
title: 函数概念与定义域入门
grade: '10'
chapter: functions
videoUrl: https://www.bilibili.com/video/BV1xx411c7mD
duration: 18分钟
updatedAt: 2026-02-25
order: 1
summary: 从对应关系出发理解函数，掌握定义域和值域的判定方法。
---
```

## 线上视频后台（Supabase）

如果部署在 Vercel，建议使用 Supabase 存课程视频链接覆盖值，不直接改仓库文件。

1. 在 Supabase SQL Editor 执行建表：

```sql
create table if not exists public.course_video_overrides (
  course_id text primary key,
  video_url text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_course_video_overrides_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_course_video_overrides_updated_at on public.course_video_overrides;
create trigger trg_touch_course_video_overrides_updated_at
before update on public.course_video_overrides
for each row execute function public.touch_course_video_overrides_updated_at();
```

2. 在 Vercel 项目里配置环境变量：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `COURSE_ADMIN_TOKEN`（你自定义的后台口令）

3. 发布后访问后台：

- `/admin/videos`

4. 在后台输入口令登录后，按课程填写/清空视频覆盖链接：

- 保存后立即生效到课程详情页
- 留空或点击“清空覆盖”会回退到 MDX 里的 `videoUrl`

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
