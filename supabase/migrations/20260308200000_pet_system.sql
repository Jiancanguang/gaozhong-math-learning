-- Pet system schema
-- Provides class pet raising, feeding, leveling, badges and shop features.

create table if not exists public.pet_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  -- level thresholds: JSON array of 10 numbers, e.g. [0,5,12,20,30,40,52,65,80,100]
  level_thresholds jsonb not null default '[0,5,12,20,30,40,52,65,80,100]',
  -- scoring rules: JSON array of {label, value} objects for teacher quick-actions
  scoring_rules jsonb not null default '[]',
  -- shop items: JSON array of {name, cost, stock} objects
  shop_items jsonb not null default '[]',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.pet_classes(id) on delete cascade,
  name text not null,
  access_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  -- pet info
  pet_type text, -- null means not yet chosen
  food_count int not null default 0,
  level int not null default 1,
  badge_count int not null default 0,
  score int not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pet_students_class_idx on public.pet_students (class_id);
create index if not exists pet_students_token_idx on public.pet_students (access_token);

-- History of feeding, scoring, graduation events
create table if not exists public.pet_history (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.pet_classes(id) on delete cascade,
  student_id uuid not null references public.pet_students(id) on delete cascade,
  action text not null check (action in ('feed', 'score', 'graduate', 'exchange')),
  amount int not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists pet_history_student_idx on public.pet_history (student_id, created_at desc);
create index if not exists pet_history_class_idx on public.pet_history (class_id, created_at desc);
