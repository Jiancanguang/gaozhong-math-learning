# Growth V2 设计说明

## 1. 背景与目标

当前线上成绩追踪系统基于以下能力：

- 学生档案
- 多次考试记录
- 单科成绩
- 总分 / 排名趋势

离线版 `筑学工作室-学生成长追踪系统.html` 已经超出“成绩台账”范畴，实际是一套更完整的成长追踪产品，包含：

- 课堂记录
- 进门考 / 课后测试
- 课堂表现
- 掌握度分级
- 薄弱点标签
- 班组管理
- 家长成长报告
- 反馈表 / 考试报告图片导出

因此不建议直接覆盖现有 `score-tracker` 表结构，而是新建 `growth-v2` 数据模型并与旧系统并行一段时间。

## 2. 离线版功能清单

### 2.1 总览页

- 展示在读学生总数
- 展示累计课程数
- 展示进门考均分
- 展示课后测试平均得分率
- 展示最近课程列表
- 展示班级平均趋势图

### 2.2 课堂记录录入

- 选择班组
- 填写日期、开始时间、结束时间
- 填写本节课主题
- 填写进门考内容
- 填写课后测试内容与满分
- 填写课后作业
- 填写课堂要点
- 批量录入每个学生的：
  - 进门考分数
  - 课后测试分数
  - 课堂表现星级
  - 掌握度等级
  - 薄弱点 / 评语
- 支持“调课学生”临时加入本次课堂记录

### 2.3 学生管理

- 添加学生
- 学生归档
- 展示学生所属班组
- 展示课次统计
- 展示考试次数统计
- 生成家长查看链接
- 预览家长报告页

### 2.4 学生详情页

- 展示累计课次
- 展示进门考均分
- 展示课后测试平均得分率
- 展示阶段进步趋势
- 展示进门考 / 课后测试趋势图
- 展示考试成绩统计与趋势图
- 展示掌握度分布
- 展示课堂记录明细
- 支持单条课堂记录行内编辑：
  - 课堂表现
  - 掌握度
  - 评语

### 2.5 考试管理

- 新建考试
- 记录考试类型
- 记录考试日期、科目、满分、班组
- 批量录入每个学生的：
  - 分数
  - 班排名
  - 年级排名
  - 掌握度
  - 薄弱知识点标签
  - 备注
- 展示考试历史
- 展开查看单次考试明细
- 删除考试及对应成绩

### 2.6 历史记录与反馈表

- 展示全部课程记录
- 查看每节课的反馈表
- 反馈表支持编辑：
  - 上课时间
  - 课后测试满分
  - 课堂要点
  - 课后作业
  - 学生课后测试分数
  - 学生薄弱点 / 评语
- 删除课程及对应课堂记录

### 2.7 家长报告页

- 基于 `token` 直接访问
- 展示学生基础信息
- 展示进门考 / 课后测试趋势图
- 展示能力雷达图
- 展示知识点掌握情况
- 展示考试成绩与考试薄弱点分析
- 展示教师时间线评语

### 2.8 导出能力

- 导出完整家长报告图片
- 导出家长报告单个模块图片
- 导出课后反馈表图片
- 导出考试分析报告图片

## 3. 离线版现有数据模型

离线版使用 `IndexedDB`，包含 5 个 store：

- `students`
- `lessons`
- `records`
- `exams`
- `exam_scores`

核心字段如下：

### 3.1 students

- `id`
- `name`
- `grade`
- `group_name`
- `parent_token`
- `status`
- `created_at`

### 3.2 lessons

- `id`
- `date`
- `group_name`
- `topic`
- `entry_test_topic`
- `exit_test_topic`
- `test_total`
- `homework`
- `key_points`
- `time_start`
- `time_end`
- `notes`
- `created_at`

### 3.3 records

- `id`
- `student_id`
- `lesson_id`
- `entry_score`
- `exit_score`
- `performance`
- `mastery`
- `comment`
- `created_at`

### 3.4 exams

- `id`
- `name`
- `type`
- `date`
- `subject`
- `total_score`
- `group_name`
- `created_at`

### 3.5 exam_scores

- `id`
- `exam_id`
- `student_id`
- `score`
- `rank`
- `grade_rank`
- `note`
- `exam_mastery`
- `weak_tags`
- `created_at`

## 4. Growth V2 数据设计原则

- 不复用当前 `students` / `student_exam_records` / `student_exam_subject_scores` 三张旧表，避免把旧系统拖进复杂兼容层。
- 新表统一加 `growth_` 前缀，先并行上线。
- 以“课堂记录 + 考试记录 + 家长报告”三条主线组织数据。
- 统计结果尽量动态计算，不额外存冗余汇总表。
- 班组保留为独立实体，避免后续继续用文本字段 `group_name` 串联。
- 薄弱点标签改成明细表，不继续用数组，方便统计和筛选。
- 家长访问采用随机 token，先满足可用性，后续如需更强安全性再升级。

## 5. Supabase 表设计

### 5.1 `growth_groups`

用途：班组主表。

建议字段：

- `id uuid primary key`
- `name text not null unique`
- `subject text not null default 'math'`
- `teacher_name text not null default ''`
- `grade_label text not null default ''`
- `status text not null default 'active'`
- `notes text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

说明：

- `grade_label` 直接存 `高一` / `高二`，不做强校验，兼容历史数据。
- `subject` 保留扩展位，当前网站前台仍只展示数学。

### 5.2 `growth_students`

用途：学生主档案。

建议字段：

- `id uuid primary key`
- `name text not null`
- `grade_label text not null`
- `home_group_id uuid references growth_groups(id)`
- `parent_access_token text not null unique`
- `status text not null default 'active'`
- `notes text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

说明：

- `home_group_id` 表示学生常驻班组。
- 调课不改学生归属，由课堂记录本身体现。

### 5.3 `growth_lessons`

用途：一节课的主记录。

建议字段：

- `id uuid primary key`
- `group_id uuid not null references growth_groups(id)`
- `lesson_date date not null`
- `time_start time`
- `time_end time`
- `topic text not null`
- `entry_test_topic text not null default ''`
- `exit_test_topic text not null default ''`
- `test_total numeric(6,2)`
- `homework text not null default ''`
- `key_points text not null default ''`
- `notes text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

说明：

- 当前离线版是一节课对应一个班组，这个约束保留。

### 5.4 `growth_lesson_records`

用途：学生在某节课上的成长记录。

建议字段：

- `id uuid primary key`
- `lesson_id uuid not null references growth_lessons(id) on delete cascade`
- `student_id uuid not null references growth_students(id) on delete cascade`
- `is_guest boolean not null default false`
- `entry_score numeric(6,2)`
- `exit_score numeric(6,2)`
- `performance smallint`
- `mastery_level text`
- `comment text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (lesson_id, student_id)`

说明：

- `is_guest` 对应离线版“调课学生”。
- `performance` 约束范围为 `1-5`。
- `mastery_level` 建议限制为：
  - `lv985`
  - `lvtk`
  - `lveb`
  - `lvbk`
  - `lvzk`

### 5.5 `growth_exams`

用途：考试主表。

建议字段：

- `id uuid primary key`
- `group_id uuid not null references growth_groups(id)`
- `name text not null`
- `exam_type text not null`
- `exam_date date not null`
- `subject text not null default '数学'`
- `total_score numeric(6,2) not null`
- `notes text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

说明：

- `exam_type` 初版建议保留：
  - `school`
  - `internal`
  - `other`

### 5.6 `growth_exam_scores`

用途：学生某次考试的成绩记录。

建议字段：

- `id uuid primary key`
- `exam_id uuid not null references growth_exams(id) on delete cascade`
- `student_id uuid not null references growth_students(id) on delete cascade`
- `score numeric(6,2) not null`
- `class_rank integer`
- `grade_rank integer`
- `mastery_level text`
- `note text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `unique (exam_id, student_id)`

### 5.7 `growth_exam_score_tags`

用途：考试薄弱点标签明细。

建议字段：

- `id uuid primary key`
- `exam_score_id uuid not null references growth_exam_scores(id) on delete cascade`
- `category text not null default ''`
- `tag_name text not null`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`

说明：

- 系统预置标签可带 `category`。
- 自定义标签 `category` 可留空。
- 统计薄弱点时直接按 `tag_name` 聚合。

### 5.8 可选表：`growth_tag_catalog`

用途：维护系统预置标签，不是必须。

建议字段：

- `id uuid primary key`
- `scope text not null default 'exam'`
- `category text not null`
- `tag_name text not null`
- `sort_order integer not null default 0`
- `is_active boolean not null default true`
- `unique (scope, category, tag_name)`

说明：

- 如果前端想完全从数据库驱动标签弹窗，就加这张表。
- 如果前端仍可接受本地常量，第一阶段可不建。

## 6. 表关系

主关系如下：

1. 一个 `growth_group` 有多个 `growth_students`
2. 一个 `growth_group` 有多节 `growth_lessons`
3. 一节 `growth_lesson` 有多条 `growth_lesson_records`
4. 一个 `growth_group` 有多次 `growth_exams`
5. 一次 `growth_exam` 有多条 `growth_exam_scores`
6. 一条 `growth_exam_score` 有多条 `growth_exam_score_tags`

学生与课堂、考试都是通过记录表关联，不直接把趋势数据落库。

## 7. 统计与页面如何从表中计算

### 7.1 总览页

- 学生总数：`growth_students where status='active'`
- 累计课程：`growth_lessons`
- 进门考均分：`growth_lesson_records.entry_score`
- 课后测试得分率：`exit_score / lessons.test_total`
- 最近课程：`growth_lessons order by lesson_date desc`

### 7.2 学生详情页

- 进门考趋势：按 `lesson_date` 取 `entry_score`
- 课后测试趋势：按 `lesson_date` 取 `exit_score / test_total`
- 掌握度分布：按 `mastery_level` 聚合
- 课堂表现均值：按 `performance` 聚合
- 考试趋势：按 `exam_date` 取 `score / total_score`
- 考试薄弱点：按 `growth_exam_score_tags.tag_name` 聚合

### 7.3 家长报告页

直接复用学生详情的计算逻辑，但只显示允许家长查看的字段，不提供编辑能力。

## 8. 与当前线上旧系统的关系

### 8.1 旧系统保留

现有表：

- `students`
- `student_exam_records`
- `student_exam_subject_scores`

先不删，不改，不迁移。

### 8.2 V2 上线策略

- 先新增 `growth_*` 表
- 先新增 `growth-v2` 页面
- 完成迁移验证后，再把导航入口从旧系统切到新系统
- 旧系统保留只读一段时间，确认无遗漏后再决定是否下线

## 9. 迁移方案

## 9.1 关键事实

**最新数据不在 HTML 文件里，而在你使用该离线系统的浏览器 `IndexedDB` 里。**

HTML 文件里只有：

- 表结构
- 前端逻辑
- 一部分种子数据

如果你线下后来继续录过真实数据，真正要迁移的是“那台电脑、那个浏览器配置文件里的 IndexedDB 数据”，不是单纯拷贝这份 HTML 文件。

## 9.2 推荐迁移路径

### 第 1 步：冻结旧数据入口

- 在正式迁移前，暂停继续在离线版里新增记录。
- 先确定哪一台电脑 / 哪个浏览器保存的是最新版本。

### 第 2 步：导出离线版 IndexedDB

目标是导出 5 份 JSON：

- `students.json`
- `lessons.json`
- `records.json`
- `exams.json`
- `exam_scores.json`

推荐做法：

- 在离线版原浏览器里打开页面
- 用浏览器 DevTools 执行导出脚本
- 把 5 个 store 全部导成 JSON

### 第 3 步：标准化数据

导入 Supabase 前要做一次清洗：

- 把 `group_name` 去重，先生成 `growth_groups`
- 建立旧 `group_name -> new group_id` 映射
- 建立旧 `student.id -> new student.id` 映射
- 建立旧 `lesson.id -> new lesson.id` 映射
- 建立旧 `exam.id -> new exam.id` 映射
- 规范空值：
  - `null` 和空字符串统一
  - 无分数的不导成 `0`
- 规范掌握度旧值：
  - `mastered -> lvtk`
  - `partial -> lvbk`
  - `weak -> lvzk`

### 第 4 步：导入顺序

建议顺序：

1. `growth_groups`
2. `growth_students`
3. `growth_lessons`
4. `growth_lesson_records`
5. `growth_exams`
6. `growth_exam_scores`
7. `growth_exam_score_tags`

### 第 5 步：抽样验证

至少核对以下内容：

- 学生数是否一致
- 课次数是否一致
- 考试次数是否一致
- 指定 3 个学生的课堂记录数是否一致
- 指定 3 个学生的考试成绩数是否一致
- 家长报告页的趋势图是否与离线版一致
- 薄弱点统计是否一致

## 9.3 字段映射

### students -> growth_students

- `name -> name`
- `grade -> grade_label`
- `group_name -> home_group_id`
- `parent_token -> parent_access_token`
- `status -> status`
- `created_at -> created_at`

### lessons -> growth_lessons

- `group_name -> group_id`
- `date -> lesson_date`
- `time_start -> time_start`
- `time_end -> time_end`
- `topic -> topic`
- `entry_test_topic -> entry_test_topic`
- `exit_test_topic -> exit_test_topic`
- `test_total -> test_total`
- `homework -> homework`
- `key_points -> key_points`
- `notes -> notes`
- `created_at -> created_at`

### records -> growth_lesson_records

- `lesson_id -> lesson_id`
- `student_id -> student_id`
- `entry_score -> entry_score`
- `exit_score -> exit_score`
- `performance -> performance`
- `mastery -> mastery_level`
- `comment -> comment`
- `created_at -> created_at`

`is_guest` 规则：

- 如果该学生的 `home_group_id` 与 `lesson.group_id` 不一致，则导为 `true`
- 否则为 `false`

### exams -> growth_exams

- `group_name -> group_id`
- `name -> name`
- `type -> exam_type`
- `date -> exam_date`
- `subject -> subject`
- `total_score -> total_score`
- `created_at -> created_at`

### exam_scores -> growth_exam_scores / growth_exam_score_tags

- `exam_id -> exam_id`
- `student_id -> student_id`
- `score -> score`
- `rank -> class_rank`
- `grade_rank -> grade_rank`
- `exam_mastery -> mastery_level`
- `note -> note`
- `created_at -> created_at`
- `weak_tags[] -> growth_exam_score_tags`

## 10. 实施顺序建议

建议拆 4 个阶段：

### 阶段 A：数据底座

- 建 `growth_*` 表
- 写导出脚本
- 写导入脚本
- 完成历史数据迁移

### 阶段 B：老师后台

- 班组页
- 学生列表页
- 课堂记录录入页
- 考试录入页
- 学生详情页
- 历史记录页

### 阶段 C：家长报告

- token 访问页
- 图表页
- 导出图片页

### 阶段 D：切换入口

- 把网站里的“成绩追踪”替换为 `growth-v2`
- 旧系统变只读或下线

## 11. 风险与注意点

### 11.1 最大风险

最大风险不是建表，而是**你现在真正的离线数据到底在哪**。

如果你平时是在浏览器里反复使用这份 HTML，那么最终数据一定优先以 IndexedDB 导出为准。

### 11.2 token 安全性

当前离线版是明文 token 访问。

V2 第一阶段可以保持这个方案，但至少要：

- token 唯一索引
- token 长度足够
- 归档学生后 token 自动失效

### 11.3 图片导出

离线版靠 `html2canvas` 导出。

V2 第一阶段可以继续沿用客户端截图导出，不必一开始做服务端 PDF。

### 11.4 不要一开始做的事

- 不要先把旧 `score-tracker` 直接删掉
- 不要先强行兼容旧表
- 不要先做复杂权限系统
- 不要先做多角色 RLS 细分

先把数据迁移正确、页面功能对齐，再迭代权限和体验。

## 12. 下一步建议

下一步直接做：

1. 新建 `growth-v2` Supabase 表
2. 写 IndexedDB 导出脚本
3. 在项目里起 `growth-v2` 页面骨架

本仓库已附带 SQL 草案文件：

- [growth-v2-schema.sql](/Users/jiancanguang/Documents/codex项目/docs/growth-v2-schema.sql)
