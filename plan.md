# Growth V2 系统优化计划

## Phase 1: 代码整理（基础工作，后续改动都依赖干净的基础）

### 1.1 提取重复工具函数
- 新建 `lib/growth-v2-format.ts`，集中定义 `fmt`, `fmtPct`, `fmtRank`, `fmtTime`, `firstValue` 等工具函数
- 更新所有引用方（lessons/page.tsx, exams/page.tsx, groups/page.tsx, students/page.tsx, exams/[examId]/page.tsx, lessons/[lessonId]/page.tsx）改为从统一模块 import

### 1.2 统一表格样式 token
- lesson-batch-form.tsx 和 exam-batch-form.tsx 中仍残留 `border-tide/10`, `bg-paper/60`, `text-tide` 等旧 token
- 统一替换为设计系统 token：`border-border-light`, `bg-surface-alt`, `text-ink` 等

## Phase 2: 性能与分页

### 2.1 列表分页
- 给 `listGrowthLessons`, `listGrowthExams`, `listGrowthStudents` 加 `page` + `pageSize` 参数，返回 `{ items, total }`
- 在 growth-v2-store.ts 的 Supabase 查询中添加 `range` 支持
- 在 lessons/page.tsx, exams/page.tsx, students/page.tsx 的列表区域底部添加分页组件
- 新建 `components/growth-v2/ui/pagination.tsx` 分页组件（上一页/下一页 + 页码显示），基于 searchParams 驱动

### 2.2 班组统计查询优化
- groups/page.tsx 当前拉取全量 lessons 和 exams 只为 count — 改为在 store 层用 `select=id,group_id` 只取必要字段，或更好的方案：新增 `getGrowthGroupSummaries()` 函数，用单条 SQL 聚合

### 2.3 添加 loading.tsx 骨架屏
- 给 `app/admin/growth-v2/lessons/`, `exams/`, `students/`, `groups/` 各加一个 `loading.tsx`
- 骨架屏复用统一样式：灰色脉冲条模拟表头 + 5 行表体

## Phase 3: 录入体验优化

### 3.1 拆分录入和列表
- 课堂页面当前同时包含"新建录入表单"和"历史列表"，页面太长
- 把新建表单拆到独立路由 `/admin/growth-v2/lessons/new`
- 课堂列表页只保留统计卡片 + 筛选 + 表格 + 顶部"+ 新建课堂"按钮
- 考试页面同理，拆到 `/admin/growth-v2/exams/new`

### 3.2 手机端录入表单适配
- lesson-batch-form.tsx 和 exam-batch-form.tsx 的录入表格在小屏幕上改为卡片式布局
- 使用 `md:` 断点：桌面端保持表格，移动端每个学生一张卡片，字段垂直排列
- 具体方案：添加一个 `<div className="hidden md:block">` 包裹桌面表格，加一个 `<div className="md:hidden">` 包裹移动端卡片列表

## Phase 4: 家长报告增强

### 4.1 日期范围筛选
- parent/[token]/page.tsx 添加 searchParams: `from`, `to`
- 在页面顶部添加日期范围选择器（两个 date input + 筛选按钮）
- store 层 `getGrowthParentReport` 添加日期过滤支持

### 4.2 阶段性总结卡片
- 在家长报告页顶部添加"本阶段总结"区域
- 计算并展示：本阶段课堂次数、平均课后得分率变化趋势、掌握度分布、高频薄弱点标签
- 用简洁的 stat card + 小型柱状图/趋势线展示

### 4.3 成绩趋势图表
- 添加一个轻量图表组件，展示课后测得分率随时间的变化折线
- 可以用纯 CSS/SVG 实现（避免引入 chart 库增加包体积），或用 recharts
- 考试成绩也添加类似的趋势折线

---

## 实施顺序

1. **Phase 1**（代码整理）— 先清理基础，避免后续改动在脏代码上叠加
2. **Phase 3.1**（拆分录入页面）— 这是结构性改动，越早做越好
3. **Phase 2**（性能与分页）— 加分页、优化查询、加骨架屏
4. **Phase 3.2**（手机端适配）— 在新结构上优化移动端
5. **Phase 4**（家长报告）— 最后增强面向家长的展示层
