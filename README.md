# 高中数学学习网站（V1）

基于 Next.js App Router + TypeScript + Tailwind CSS + MDX 的课程讲解网站，同时包含老师后台可用的成绩追踪系统。

## 功能

- 首页：学段入口、学习路径、最新课程
- 课程列表页：按年级 / 章节筛选，支持关键词搜索
- 课程详情页：视频讲解 + MDX 讲义（知识点 / 例题 / 易错点 / 小练）
- 成绩追踪页：公开说明老师如何追踪学生成绩变化
- 成绩追踪后台：管理学生名单、考试成绩、班排/年排和总分趋势
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

## 线上后台（Supabase）

如果部署在 Vercel，建议使用 Supabase 存后台数据，不直接改仓库文件。

### 1. 视频后台建表

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

### 2. 成绩追踪后台建表

```sql
create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text not null check (grade in ('10', '11', '12')),
  class_name text not null,
  head_teacher text not null default '',
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_name_idx on public.students (name);
create index if not exists students_grade_class_idx on public.students (grade, class_name);

create table if not exists public.student_exam_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  exam_name text not null,
  exam_type text not null check (exam_type in ('monthly', 'midterm', 'final', 'mock', 'weekly', 'joint', 'other')),
  exam_date date not null,
  total_score numeric(6,2) not null,
  total_full_score numeric(6,2),
  class_rank integer,
  grade_rank integer,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_exam_records_student_date_idx
  on public.student_exam_records (student_id, exam_date desc, created_at desc);

create table if not exists public.student_exam_subject_scores (
  id uuid primary key default gen_random_uuid(),
  exam_record_id uuid not null references public.student_exam_records(id) on delete cascade,
  subject text not null check (subject in ('chinese', 'math', 'english', 'physics', 'chemistry', 'biology', 'politics', 'history', 'geography')),
  score numeric(6,2) not null,
  full_score numeric(6,2),
  created_at timestamptz not null default now(),
  unique (exam_record_id, subject)
);

create index if not exists student_exam_subject_scores_exam_idx
  on public.student_exam_subject_scores (exam_record_id);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_students_updated_at on public.students;
create trigger trg_touch_students_updated_at
before update on public.students
for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_student_exam_records_updated_at on public.student_exam_records;
create trigger trg_touch_student_exam_records_updated_at
before update on public.student_exam_records
for each row execute function public.touch_updated_at();

alter table public.students add column if not exists head_teacher text not null default '';
alter table public.students add column if not exists is_active boolean not null default true;
```

### 3. 环境变量

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_TOKEN`（推荐使用的后台口令）
- `COURSE_ADMIN_TOKEN`（兼容旧视频后台，可作为回退）

### 4. 发布后访问后台

- `/admin/videos`
- `/admin/score-tracker`
- `/score-tracker`

### 5. 视频后台使用说明

- 保存后立即生效到课程详情页
- 留空或点击“清空覆盖”会回退到 MDX 里的 `videoUrl`

### 6. 成绩追踪后台使用说明

1. 先进入 `/admin/score-tracker`，输入后台口令登录。
2. 新建学生时可填写姓名、年级、班级、班主任、是否在读和备注。
3. 进入学生详情页后，手动新增一次考试记录。
4. 每次考试可录入总分、总分满分、班排、年排，以及已参加科目的单科分数。
5. 系统会自动生成：
   - 成绩时间线台账
   - 分数 / 排名 / 得分率趋势图
   - 最近两次考试的变化结论
6. 学生列表支持按姓名、年级、班级、班主任和是否在读筛选。

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
