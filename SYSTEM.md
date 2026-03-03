# 系统说明 — 高中数学学习网站 (V1)

> 本文档面向开发者和维护者，详细说明系统的技术架构、功能模块、数据库设计、部署运维等内容。

---

## 目录

1. [系统概述](#1-系统概述)
2. [技术架构](#2-技术架构)
3. [功能模块详解](#3-功能模块详解)
4. [数据库设计](#4-数据库设计)
5. [认证与权限](#5-认证与权限)
6. [内容管理](#6-内容管理)
7. [前端设计规范](#7-前端设计规范)
8. [环境变量与配置](#8-环境变量与配置)
9. [本地开发指南](#9-本地开发指南)
10. [部署说明](#10-部署说明)
11. [项目现状与待办](#11-项目现状与待办)

---

## 1. 系统概述

### 1.1 项目定位

高中数学教学主页，为高中学生（高一至高三）提供同步课程视频讲解、高考真题讲解、成绩追踪、个性化作业方案和提分方法论等功能。同时为老师提供后台管理工具。

### 1.2 核心功能一览

| 功能 | 路由 | 面向对象 |
|------|------|----------|
| 同步课程 | `/courses` | 学生 |
| 真题讲解 | `/gaokao` | 学生 |
| 提分专区 | `/gaokao-system` | 学生 |
| 成绩追踪（公开页） | `/score-tracker` | 学生/家长 |
| 作业方案 | `/assignment` | 老师 |
| 学习路径 | `/roadmap` | 学生 |
| 资料库 | `/resources` | 学生/老师 |
| 难度分级 | `/gaokao-system/difficulty-grading` | 学生 |
| 视频管理后台 | `/admin/videos` | 老师 |
| 成绩追踪后台 | `/admin/score-tracker` | 老师 |

### 1.3 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 14.2.5 |
| UI 库 | React | 18.3.1 |
| 语言 | TypeScript | 5.5.2 |
| 样式 | Tailwind CSS | 3.4.4 |
| 内容渲染 | next-mdx-remote | 6.0.0 |
| 前置字段解析 | gray-matter | 4.0.3 |
| 数据库 | Supabase (PostgreSQL) | — |
| CSS 处理 | PostCSS + Autoprefixer | 8.4.39 / 10.4.19 |
| 代码检查 | ESLint (next config) | 8.57.0 |
| Node.js | 最低要求 | >= 18.17.0 |

---

## 2. 技术架构

### 2.1 整体架构

```
浏览器
  │
  ▼
Next.js App Router (SSR / RSC)
  │
  ├── MDX 文件（文件系统）── 课程内容
  │     content/courses/{grade}/{chapter}/{courseId}.mdx
  │
  ├── Supabase REST API ── 后台数据
  │     - course_video_overrides（视频覆盖）
  │     - students（学生）
  │     - student_exam_records（考试记录）
  │     - student_exam_subject_scores（科目成绩）
  │
  └── 静态资源
        public/
```

- **前端渲染**：Next.js 服务端渲染 (RSC)，所有页面默认为 Server Component
- **内容层**：MDX 文件通过 gray-matter 解析 frontmatter，通过 next-mdx-remote 编译渲染
- **数据层**：Supabase REST API，通过 `lib/supabase-admin.ts` 封装，使用 Service Role Key 进行服务端调用
- **认证层**：基于环境变量的 Token 比对，Cookie 存储会话

### 2.2 目录结构

```
gaozhong-math-learning/
├── app/                        # Next.js App Router 页面
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页
│   ├── not-found.tsx           # 404 页
│   ├── globals.css             # 全局样式
│   ├── courses/                # 课程列表与详情
│   ├── gaokao/                 # 高考真题讲解
│   ├── gaokao-system/          # 提分专区（含子模块）
│   ├── assignment/             # 作业方案
│   ├── score-tracker/          # 成绩追踪公开页
│   ├── roadmap/                # 学习路径
│   ├── resources/              # 资料库
│   ├── about/                  # 关于页
│   └── admin/                  # 管理后台
│       ├── auth-actions.ts     # 认证 Server Actions
│       ├── videos/             # 视频覆盖管理
│       └── score-tracker/      # 成绩追踪管理
│
├── components/                 # 可复用组件
│   ├── header.tsx              # 导航栏
│   ├── footer.tsx              # 页脚
│   ├── course-card.tsx         # 课程卡片
│   ├── admin-auth-panels.tsx   # 后台登录/退出 UI
│   ├── assignment-builder.tsx  # 作业方案构建器（客户端组件）
│   └── score-tracker/          # 成绩追踪相关组件
│       ├── admin-access.tsx    # 后台权限守卫
│       ├── student-form.tsx    # 学生表单
│       ├── exam-form.tsx       # 考试表单
│       └── trend-chart.tsx     # 趋势图表
│
├── lib/                        # 业务逻辑与工具函数
│   ├── courses.ts              # 课程文件收集、解析、排序、视频 URL 转换
│   ├── course-meta.ts          # 章节英文→中文名称映射
│   ├── assignment.ts           # 薄弱点定义、课程推荐、作业包生成
│   ├── score-tracker.ts        # 成绩追踪类型定义与数据库操作
│   ├── score-tracker-display.ts # 成绩展示格式化与趋势标签
│   ├── video-overrides.ts      # 视频 URL 覆盖的增删查
│   ├── supabase-admin.ts       # Supabase 客户端封装
│   ├── admin-auth.ts           # Token 验证与 Cookie 管理
│   └── resources.ts            # 教学资源静态数据
│
├── content/
│   └── courses/                # MDX 课程内容
│       ├── 10/                 # 高一
│       │   ├── functions/
│       │   ├── sequences/
│       │   ├── trigonometry/
│       │   └── analytic-geometry/
│       └── 11/                 # 高二
│           ├── calculus/
│           ├── probability/
│           └── solid-geometry/
│
├── public/                     # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
└── .eslintrc.json
```

### 2.3 关键技术选型说明

| 选型 | 理由 |
|------|------|
| **MDX** | 课程讲义需要混排 Markdown 文本与 React 交互组件（如练习区域），MDX 天然支持 |
| **gray-matter** | 从 MDX 文件中提取 frontmatter 元数据（标题、年级、时长等），无需额外数据库存课程元信息 |
| **Supabase** | 提供托管 PostgreSQL + REST API，无需自建后端，适合小团队快速部署 |
| **Bilibili 嵌入** | 目标用户在中国大陆，B 站是最合适的视频托管平台 |
| **Tailwind CSS** | 实用优先的原子化 CSS，快速迭代 UI，与 Next.js 生态高度集成 |
| **App Router (RSC)** | 利用 React Server Components 减少客户端 JS 体积，改善首屏加载 |

---

## 3. 功能模块详解

### 3.1 同步课程

| 项目 | 说明 |
|------|------|
| 路由 | `/courses`（列表）、`/courses/[courseId]`（详情） |
| 核心文件 | `app/courses/page.tsx`、`app/courses/[courseId]/page.tsx`、`lib/courses.ts`、`lib/course-meta.ts`、`components/course-card.tsx` |

**功能描述**：
- 课程列表支持按年级（高一/高二）、章节筛选，以及关键词搜索（匹配标题和标签）
- 课程详情页包含 B 站视频嵌入播放器和 MDX 渲染的讲义内容
- 页面底部展示相关课程推荐（同章节或同年级，最多 3 门）

**数据流**：
```
content/courses/*.mdx → gray-matter 解析 → Course 对象数组
  → 列表页：筛选 + 搜索 → CourseCard 渲染
  → 详情页：compileMDX 编译 → 视频嵌入 + MDX 内容渲染
  → 视频覆盖：Supabase course_video_overrides 表优先
```

**课程排序规则**：按年级升序 → 章节中文排序 → order 字段升序

**章节名称映射**（`lib/course-meta.ts`）：

| 英文标识 | 中文名称 |
|---------|---------|
| functions | 函数 |
| trigonometry | 三角函数 |
| sequences | 数列 |
| analytic-geometry | 解析几何基础 |
| vectors | 平面向量及其应用 |
| complex | 复数 |
| solid-geometry | 立体几何 |
| statistics | 统计 |
| probability | 概率统计 |
| calculus | 导数初步 |

### 3.2 真题讲解

| 项目 | 说明 |
|------|------|
| 路由 | `/gaokao` |
| 核心文件 | `app/gaokao/page.tsx` |

**功能描述**：
- 按年份（2023–2025）和题型分类展示高考真题讲解
- 覆盖题型：导数压轴、圆锥曲线、立体几何、概率统计
- 主要以视频链接形式呈现

### 3.3 提分专区

| 项目 | 说明 |
|------|------|
| 路由 | `/gaokao-system`（总览）及多个子路由 |
| 核心文件 | `app/gaokao-system/page.tsx`、`app/gaokao-system/layout.tsx` 及子目录 |

**功能描述**：
- 提供系统化的高考提分方法论，分为四个层次：
  1. **认知层**：长期思维、系统思维、优化思维、成长心态
  2. **执行层**：时间块、专注启动、每日复盘
  3. **训练层**：解题策略、知识体系、错题升级、遗忘管理
  4. **冲刺层**：场景稳定、节奏控制、考试状态管理

**四大工具**（`/gaokao-system/tools/`）：

| 工具 | 路由 | 用途 |
|------|------|------|
| 时间块表 | `/tools/time-block` | 每日时间规划 |
| 每日复盘表 | `/tools/daily-review` | 每日回顾与巩固 |
| 遗忘管理计划 | `/tools/forgetting-plan` | 间隔重复安排 |
| 错题卡片 | `/tools/error-card` | 错题记录与升级 |

**其他子模块**：
- `/framework` — 学习框架详解
- `/architecture` — 信息架构
- `/methods` — 学习方法
- `/subjects` — 分科目策略
- `/diagnosis` — 自我诊断
- `/30days` — 30 天提分计划
- `/difficulty-grading` — 难度分级体系

### 3.4 成绩追踪系统

| 项目 | 说明 |
|------|------|
| 公开页路由 | `/score-tracker` |
| 后台路由 | `/admin/score-tracker` |
| 核心文件 | `app/admin/score-tracker/page.tsx`、`app/admin/score-tracker/actions.ts`、`lib/score-tracker.ts`、`lib/score-tracker-display.ts`、`components/score-tracker/*.tsx` |

**功能描述**：

**公开页**（`/score-tracker`）：向学生和家长介绍追踪系统的功能和使用方式。

**管理后台**（`/admin/score-tracker`）：
- **学生管理**：新建、编辑、停用学生记录（姓名、年级、班级、班主任、备注）
- **考试管理**：为学生添加考试记录（考试名称、类型、日期、总分、班排、年排）
- **科目成绩**：每次考试可录入最多 9 科成绩（语数英物化生政史地）
- **趋势分析**：自动生成分数/排名/得分率趋势图
- **变化结论**：比较最近两次考试，输出总分差、排名变化、进步最大和退步最大的科目
- **筛选功能**：按姓名、年级、班级、班主任、是否在读筛选学生

**考试类型**：

| 标识 | 中文 |
|------|------|
| monthly | 月考 |
| midterm | 期中 |
| final | 期末 |
| mock | 模考 |
| weekly | 周测 |
| joint | 联考 |
| other | 其他 |

**趋势标签**（`StudentTrendLabel`）：
- `up` — 上升（最近一次总分高于前一次）
- `down` — 下降
- `flat` — 持平
- `watch` — 待观察（不足两次考试）

**数据流**：
```
管理后台 UI → Server Actions (actions.ts)
  → lib/score-tracker.ts → Supabase REST API
  → 返回数据 → lib/score-tracker-display.ts 格式化
  → 趋势图 (trend-chart.tsx) + 变化结论
```

### 3.5 作业方案

| 项目 | 说明 |
|------|------|
| 路由 | `/assignment` |
| 核心文件 | `app/assignment/page.tsx`、`components/assignment-builder.tsx`、`lib/assignment.ts` |

**功能描述**：
- 老师选择学生姓名和年级
- 系统展示该年级对应的薄弱点清单（8 个预定义项）
- 点击"生成推荐"后，根据关键词匹配算法自动推荐相关课程
- 老师可手动增删课程
- 设置截止日期后生成 `HomeworkPack` 对象

**薄弱点定义**（`lib/assignment.ts`）：

| ID | 名称 | 年级 |
|----|------|------|
| function-domain | 函数定义域易错 | 高一 |
| trig-radian | 角度弧度转换不稳 | 高一 |
| sequence-model | 数列建模不清晰 | 高一 |
| line-equation | 直线方程选择困难 | 高一 |
| space-line-plane | 空间线面关系混乱 | 高二 |
| classical-prob | 古典概型计数不完整 | 高二 |
| derivative-base | 基础求导公式不熟 | 高二 |
| derivative-extreme | 导数求极值断点遗漏 | 高二 |

**推荐算法**（`scoreCourseByWeakness`）：
- 年级匹配：+2 分
- 每命中一个关键词（在标签、标题或摘要中）：+3 分
- 按总分降序排列，取前 2 门课程
- 同一课程被多个薄弱点命中时，自动合并原因

### 3.6 学习路径

| 项目 | 说明 |
|------|------|
| 路由 | `/roadmap` |
| 核心文件 | `app/roadmap/page.tsx` |

**功能描述**：展示学习路径可视化，帮助学生了解知识点之间的关联和学习顺序。

### 3.7 资料库

| 项目 | 说明 |
|------|------|
| 路由 | `/resources` |
| 核心文件 | `app/resources/page.tsx`、`lib/resources.ts` |

**功能描述**：
- 集中展示教学资源（练习题、专题训练等）
- 资源数据定义在 `lib/resources.ts`，为静态数组
- 每个资源包含：标题、描述、分类、更新日期、链接

**资源类型定义**（`TeachingResource`）：
```typescript
{
  id: string;
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  href: string;
  openInNewTab: boolean;
}
```

### 3.8 视频管理后台

| 项目 | 说明 |
|------|------|
| 路由 | `/admin/videos` |
| 核心文件 | `app/admin/videos/page.tsx`、`lib/video-overrides.ts` |

**功能描述**：
- 在不修改 MDX 源文件的情况下，覆盖课程的视频 URL
- 保存后立即生效到课程详情页
- 清空覆盖后自动回退到 MDX 文件中的 `videoUrl`
- 数据存储在 Supabase `course_video_overrides` 表中

**操作**：
- `upsertVideoOverride(courseId, videoUrl)` — 新增或更新覆盖
- `deleteVideoOverride(courseId)` — 删除覆盖（回退到 MDX 原始链接）
- `getVideoOverrideByCourseId(courseId)` — 查询单条覆盖
- `listVideoOverrides()` — 列出全部覆盖

---

## 4. 数据库设计

系统使用 Supabase 托管的 PostgreSQL 数据库，共 4 张表。

### 4.1 表关系

```
course_video_overrides          （独立表，按 course_id 关联 MDX 文件）

students
  │
  └── student_exam_records      （一对多，student_id 外键，级联删除）
        │
        └── student_exam_subject_scores  （一对多，exam_record_id 外键，级联删除）
```

### 4.2 表结构详解

#### course_video_overrides

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| course_id | text | PRIMARY KEY | 对应 MDX 文件名（不含扩展名） |
| video_url | text | NOT NULL | 覆盖的视频 URL |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 自动更新时间戳（通过触发器） |

#### students

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | 学生 ID |
| name | text | NOT NULL | 姓名 |
| grade | text | NOT NULL, CHECK ('10','11','12') | 年级 |
| class_name | text | NOT NULL | 班级 |
| head_teacher | text | NOT NULL, DEFAULT '' | 班主任 |
| is_active | boolean | NOT NULL, DEFAULT true | 是否在读 |
| notes | text | NOT NULL, DEFAULT '' | 备注 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 创建时间 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新时间（触发器自动维护） |

**索引**：
- `students_name_idx` — name
- `students_grade_class_idx` — (grade, class_name)

#### student_exam_records

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PRIMARY KEY | 考试记录 ID |
| student_id | uuid | NOT NULL, FK → students(id) ON DELETE CASCADE | 学生 ID |
| exam_name | text | NOT NULL | 考试名称 |
| exam_type | text | NOT NULL, CHECK 枚举值 | 考试类型 |
| exam_date | date | NOT NULL | 考试日期 |
| total_score | numeric(6,2) | NOT NULL | 总分 |
| total_full_score | numeric(6,2) | — | 满分 |
| class_rank | integer | — | 班级排名 |
| grade_rank | integer | — | 年级排名 |
| notes | text | NOT NULL, DEFAULT '' | 备注 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 创建时间 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新时间 |

**索引**：
- `student_exam_records_student_date_idx` — (student_id, exam_date DESC, created_at DESC)

#### student_exam_subject_scores

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PRIMARY KEY | 科目成绩 ID |
| exam_record_id | uuid | NOT NULL, FK → student_exam_records(id) ON DELETE CASCADE | 考试记录 ID |
| subject | text | NOT NULL, CHECK 枚举值 | 科目标识 |
| score | numeric(6,2) | NOT NULL | 得分 |
| full_score | numeric(6,2) | — | 该科满分 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 创建时间 |

**约束**：UNIQUE (exam_record_id, subject) — 同一考试同一科目不可重复
**索引**：
- `student_exam_subject_scores_exam_idx` — exam_record_id

### 4.3 触发器

| 触发器 | 表 | 作用 |
|--------|---|------|
| trg_touch_course_video_overrides_updated_at | course_video_overrides | 更新时自动刷新 updated_at |
| trg_touch_students_updated_at | students | 更新时自动刷新 updated_at |
| trg_touch_student_exam_records_updated_at | student_exam_records | 更新时自动刷新 updated_at |

所有触发器调用 `touch_updated_at()` 函数（`course_video_overrides` 使用独立的 `touch_course_video_overrides_updated_at()` 函数）。

---

## 5. 认证与权限

### 5.1 认证机制

系统使用 **Token 比对** 方式进行管理后台认证，不使用 OAuth 或 JWT。

**核心文件**：`lib/admin-auth.ts`

**流程**：
1. 管理员在后台页面输入口令
2. Server Action 调用 `validateAdminToken(input)` 比对输入与环境变量 `ADMIN_TOKEN`
3. 验证通过后调用 `setAdminSessionCookie(value)` 将 Token 写入 Cookie
4. 后续请求通过 `isAdminAuthorized()` 读取 Cookie 判断是否已登录

### 5.2 Cookie 配置

| 属性 | 值 |
|------|---|
| Cookie 名称 | `admin_token`（主）、`course_admin_token`（兼容旧版） |
| httpOnly | true |
| sameSite | lax |
| secure | 仅生产环境为 true |
| path | / |
| maxAge | 7 天（604800 秒） |

### 5.3 Token 优先级

`getAdminToken()` 读取顺序：
1. `ADMIN_TOKEN` 环境变量
2. `COURSE_ADMIN_TOKEN` 环境变量（回退兼容）

### 5.4 受保护路由

| 路由 | 保护方式 |
|------|----------|
| `/admin/videos` | AdminAuthPanels 组件守卫 |
| `/admin/score-tracker` | AdminAccess 组件守卫 |
| `/admin/score-tracker/students/*` | 同上（layout 层级保护） |

### 5.5 特殊行为

- 导航栏中"视频后台"入口仅在 `NODE_ENV === 'production'` 时显示（`components/header.tsx:13`）
- 后台登录和退出操作通过 `app/admin/auth-actions.ts` 中的 Server Actions 处理

---

## 6. 内容管理

### 6.1 MDX 课程文件结构

课程文件存放路径：`content/courses/{grade}/{chapter}/{courseId}.mdx`

示例路径：`content/courses/10/functions/function-concept.mdx`

### 6.2 Frontmatter 规范

**必填字段**：

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| title | string | 课程标题 | 函数概念与定义域入门 |
| grade | string | 年级（'10' 或 '11'） | '10' |
| chapter | string | 章节标识 | functions |
| videoUrl | string | 视频链接 | BV1xx411c7mD |
| order | number | 章节内排序序号 | 1 |
| summary | string | 课程摘要 | 从对应关系出发理解函数... |
| duration | string | 时长 | 18分钟 |
| updatedAt | string | 更新日期 | 2026-02-25 |

**可选字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| tags | string[] | 标签（用于搜索和推荐匹配） |

### 6.3 添加新课程流程

1. 在对应目录创建 `.mdx` 文件（文件名即 courseId）
2. 编写 frontmatter（必填全部 8 个字段）
3. 编写讲义正文（标准 Markdown + React 组件）
4. 部署后自动生效，无需额外操作

### 6.4 视频 URL 格式支持

`lib/courses.ts` 中的 `toEmbedVideoUrl()` 支持以下输入格式，统一转换为 B 站播放器嵌入地址：

| 输入格式 | 示例 |
|---------|------|
| BV 号 | `BV1xx411c7mD` |
| av 号 | `av123456` |
| B 站视频页完整链接 | `https://www.bilibili.com/video/BV1xx411c7mD` |
| B 站播放器直链 | `https://player.bilibili.com/player.html?bvid=...` |
| 带分 P 参数的链接 | `https://www.bilibili.com/video/BV...?p=2` |

**输出格式**：`https://player.bilibili.com/player.html?bvid={BV号}&page={页码}`

### 6.5 视频覆盖机制

- 课程详情页加载时，先查询 Supabase `course_video_overrides` 表
- 若存在覆盖记录，使用覆盖 URL；否则使用 MDX frontmatter 中的 `videoUrl`
- 可通过 `/admin/videos` 后台管理覆盖

---

## 7. 前端设计规范

### 7.1 颜色体系

在 `tailwind.config.ts` 中定义的自定义颜色：

| 名称 | 色值 | 用途 |
|------|------|------|
| ink | `#0f172a` | 正文文字（深色） |
| paper | `#fef9f2` | 页面背景（奶白色） |
| accent | `#ff6b35` | 强调色 / 链接 hover（橙色） |
| tide | `#0d3b66` | 主色调 / 标题（深蓝） |
| sky | `#79c7ff` | 辅助色 / 装饰（浅蓝） |

### 7.2 特殊样式

| 名称 | 说明 |
|------|------|
| shadow-card | `0 12px 30px rgba(13, 59, 102, 0.14)` — 卡片投影 |
| bg-hero | 双圆径向渐变背景 — 用于首页 Hero 区域 |

### 7.3 响应式策略

- 采用 mobile-first 设计
- 使用 Tailwind 断点：`sm:` (640px)、`lg:` (1024px)
- 最大内容宽度：`max-w-6xl`（1152px）
- 导航栏和内容区使用 `px-4 sm:px-6 lg:px-8` 统一间距

### 7.4 组件清单

| 组件 | 文件 | 类型 | 用途 |
|------|------|------|------|
| Header | `components/header.tsx` | Server | 全站导航栏 |
| Footer | `components/footer.tsx` | Server | 全站页脚 |
| CourseCard | `components/course-card.tsx` | Server | 课程列表卡片 |
| AssignmentBuilder | `components/assignment-builder.tsx` | Client | 作业方案交互式构建器 |
| AdminAuthPanels | `components/admin-auth-panels.tsx` | Client | 后台登录/退出面板 |
| AdminAccess | `components/score-tracker/admin-access.tsx` | Server | 成绩后台权限守卫 |
| StudentForm | `components/score-tracker/student-form.tsx` | Client | 学生信息表单 |
| ExamForm | `components/score-tracker/exam-form.tsx` | Client | 考试记录表单 |
| TrendChart | `components/score-tracker/trend-chart.tsx` | Client | 成绩趋势可视化 |

---

## 8. 环境变量与配置

### 8.1 必需环境变量

| 变量 | 用途 | 说明 |
|------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | 如 `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | 用于服务端数据库操作 |
| `ADMIN_TOKEN` | 后台管理口令 | 用于视频后台和成绩后台登录验证 |
| `COURSE_ADMIN_TOKEN` | 旧版视频后台口令 | 兼容回退，优先使用 ADMIN_TOKEN |

所有环境变量仅在服务端使用（`server-only` 模块），不会暴露到客户端。

### 8.2 Next.js 配置（`next.config.mjs`）

```javascript
{
  eslint: { ignoreDuringBuilds: true },  // 构建时跳过 ESLint
  experimental: { typedRoutes: true }     // 启用类型安全路由
}
```

### 8.3 TypeScript 配置要点（`tsconfig.json`）

- Target: `ES2017`
- 严格模式：`strict: true`
- 模块解析：`bundler`
- 路径别名：`@/*` → 项目根目录
- Next.js 插件启用

---

## 9. 本地开发指南

### 9.1 环境要求

- Node.js >= 18.17.0
- npm（项目使用 npm 管理依赖）

### 9.2 安装与启动

```bash
# 1. 克隆仓库
git clone <repo-url>
cd gaozhong-math-learning

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选，不配置则后台功能不可用）
# 创建 .env.local 文件，填入：
# SUPABASE_URL=https://xxxx.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-key
# ADMIN_TOKEN=your-token

# 4. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 9.3 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run build` | 生产构建 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | ESLint 代码检查 |
| `npm run typecheck` | TypeScript 类型检查（`tsc --noEmit`） |

---

## 10. 部署说明

### 10.1 推荐方案：Vercel

1. 在 Vercel 控制台导入 Git 仓库
2. 框架自动识别为 Next.js
3. 在 Vercel 项目设置中配置环境变量：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_TOKEN`
4. 部署完成后配置自定义域名（可选）

### 10.2 Supabase 数据库初始化

首次部署前，在 Supabase SQL Editor 中依次执行以下 SQL：

**视频覆盖表**：

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

**成绩追踪表**：

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
```

---

## 11. 项目现状与待办

### 11.1 当前内容覆盖

| 年级 | 已有章节 | 课程数量 |
|------|----------|----------|
| 高一 (10) | 函数、数列、三角函数、解析几何基础 | 约 4-5 门 |
| 高二 (11) | 导数初步、概率统计、立体几何 | 约 3 门 |
| 高三 (12) | 暂无 | 0 |

总计约 8 门 MDX 课程，内容持续扩充中。

### 11.2 已知限制

- **无自动化测试**：项目中没有测试框架（无 Jest / Vitest），仅依赖 ESLint 和 TypeScript 类型检查
- **无 CI/CD 流水线**：没有 GitHub Actions 或其他 CI 配置，依赖 Vercel 自动部署
- **无 .env.example**：环境变量需手动配置，缺少示例文件
- **无数据库迁移工具**：Schema 变更需手动在 Supabase 控制台执行 SQL
- **客户端状态管理**：仅使用组件级 `useState`，无全局状态管理方案

### 11.3 后续扩展方向

- 补充高三 (12) 年级课程内容
- 新增更多章节（平面向量、复数、统计等）
- 添加自动化测试
- 配置 CI/CD 流水线
- 添加 .env.example 文件
