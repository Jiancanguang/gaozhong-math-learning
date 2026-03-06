create extension if not exists pgcrypto;

create table if not exists public.growth_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  subject text not null default 'math',
  teacher_name text not null default '',
  grade_label text not null default '',
  status text not null default 'active' check (status in ('active', 'archived')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.growth_students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade_label text not null,
  home_group_id uuid references public.growth_groups(id) on delete set null,
  parent_access_token text not null unique,
  status text not null default 'active' check (status in ('active', 'archived')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists growth_students_name_idx on public.growth_students (name);
create index if not exists growth_students_home_group_idx on public.growth_students (home_group_id);

create table if not exists public.growth_lessons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.growth_groups(id) on delete restrict,
  lesson_date date not null,
  time_start time,
  time_end time,
  topic text not null,
  entry_test_topic text not null default '',
  exit_test_topic text not null default '',
  test_total numeric(6,2),
  homework text not null default '',
  key_points text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (test_total is null or test_total > 0)
);

create index if not exists growth_lessons_group_date_idx on public.growth_lessons (group_id, lesson_date desc);

create table if not exists public.growth_lesson_records (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.growth_lessons(id) on delete cascade,
  student_id uuid not null references public.growth_students(id) on delete cascade,
  is_guest boolean not null default false,
  entry_score numeric(6,2),
  exit_score numeric(6,2),
  performance smallint,
  mastery_level text,
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, student_id),
  check (performance is null or performance between 1 and 5),
  check (mastery_level is null or mastery_level in ('lv985', 'lvtk', 'lveb', 'lvbk', 'lvzk'))
);

create index if not exists growth_lesson_records_student_idx on public.growth_lesson_records (student_id, created_at desc);
create index if not exists growth_lesson_records_lesson_idx on public.growth_lesson_records (lesson_id);

create table if not exists public.growth_exams (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.growth_groups(id) on delete restrict,
  name text not null,
  exam_type text not null check (exam_type in ('school', 'internal', 'other')),
  exam_date date not null,
  subject text not null default '数学',
  total_score numeric(6,2) not null check (total_score > 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists growth_exams_group_date_idx on public.growth_exams (group_id, exam_date desc);

create table if not exists public.growth_exam_scores (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.growth_exams(id) on delete cascade,
  student_id uuid not null references public.growth_students(id) on delete cascade,
  score numeric(6,2) not null,
  class_rank integer,
  grade_rank integer,
  mastery_level text,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, student_id),
  check (class_rank is null or class_rank > 0),
  check (grade_rank is null or grade_rank > 0),
  check (mastery_level is null or mastery_level in ('lv985', 'lvtk', 'lveb', 'lvbk', 'lvzk'))
);

create index if not exists growth_exam_scores_student_idx on public.growth_exam_scores (student_id, created_at desc);
create index if not exists growth_exam_scores_exam_idx on public.growth_exam_scores (exam_id);

create table if not exists public.growth_exam_score_tags (
  id uuid primary key default gen_random_uuid(),
  exam_score_id uuid not null references public.growth_exam_scores(id) on delete cascade,
  category text not null default '',
  tag_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists growth_exam_score_tags_exam_score_idx on public.growth_exam_score_tags (exam_score_id);
create index if not exists growth_exam_score_tags_tag_name_idx on public.growth_exam_score_tags (tag_name);

create table if not exists public.growth_tag_catalog (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'exam' check (scope in ('exam')),
  category text not null,
  tag_name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (scope, category, tag_name)
);

insert into public.growth_tag_catalog (scope, category, tag_name, sort_order)
values
  ('exam', '函数', '函数概念与性质', 10),
  ('exam', '函数', '指数函数', 20),
  ('exam', '函数', '对数函数', 30),
  ('exam', '函数', '幂函数', 40),
  ('exam', '函数', '函数零点', 50),
  ('exam', '三角', '三角函数', 10),
  ('exam', '三角', '三角恒等变换', 20),
  ('exam', '三角', '正余弦定理', 30),
  ('exam', '三角', '解三角形', 40),
  ('exam', '向量', '向量运算', 10),
  ('exam', '向量', '向量数量积', 20),
  ('exam', '向量', '向量坐标运算', 30),
  ('exam', '数列', '等差数列', 10),
  ('exam', '数列', '等比数列', 20),
  ('exam', '数列', '数列求和', 30),
  ('exam', '数列', '数列递推', 40),
  ('exam', '立体几何', '空间几何体', 10),
  ('exam', '立体几何', '平行与垂直', 20),
  ('exam', '立体几何', '空间向量法', 30),
  ('exam', '解析几何', '直线方程', 10),
  ('exam', '解析几何', '圆的方程', 20),
  ('exam', '解析几何', '椭圆', 30),
  ('exam', '解析几何', '双曲线', 40),
  ('exam', '解析几何', '抛物线', 50),
  ('exam', '概率统计', '古典概型', 10),
  ('exam', '概率统计', '条件概率', 20),
  ('exam', '概率统计', '统计分析', 30),
  ('exam', '概率统计', '正态分布', 40),
  ('exam', '导数', '导数运算', 10),
  ('exam', '导数', '函数单调性', 20),
  ('exam', '导数', '极值与最值', 30),
  ('exam', '通用问题', '计算错误', 10),
  ('exam', '通用问题', '审题不清', 20),
  ('exam', '通用问题', '公式记忆', 30),
  ('exam', '通用问题', '解题思路', 40),
  ('exam', '通用问题', '时间分配', 50),
  ('exam', '通用问题', '步骤不完整', 60)
on conflict (scope, category, tag_name) do nothing;

create or replace function public.touch_growth_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_growth_groups_updated_at on public.growth_groups;
create trigger trg_touch_growth_groups_updated_at
before update on public.growth_groups
for each row execute function public.touch_growth_updated_at();

drop trigger if exists trg_touch_growth_students_updated_at on public.growth_students;
create trigger trg_touch_growth_students_updated_at
before update on public.growth_students
for each row execute function public.touch_growth_updated_at();

drop trigger if exists trg_touch_growth_lessons_updated_at on public.growth_lessons;
create trigger trg_touch_growth_lessons_updated_at
before update on public.growth_lessons
for each row execute function public.touch_growth_updated_at();

drop trigger if exists trg_touch_growth_lesson_records_updated_at on public.growth_lesson_records;
create trigger trg_touch_growth_lesson_records_updated_at
before update on public.growth_lesson_records
for each row execute function public.touch_growth_updated_at();

drop trigger if exists trg_touch_growth_exams_updated_at on public.growth_exams;
create trigger trg_touch_growth_exams_updated_at
before update on public.growth_exams
for each row execute function public.touch_growth_updated_at();

drop trigger if exists trg_touch_growth_exam_scores_updated_at on public.growth_exam_scores;
create trigger trg_touch_growth_exam_scores_updated_at
before update on public.growth_exam_scores
for each row execute function public.touch_growth_updated_at();
