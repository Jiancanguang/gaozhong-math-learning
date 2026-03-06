# Growth V2 Data Scripts

## 1. Export from the offline browser version

Important:

- Export from the same browser profile that actually contains your latest offline data.
- The latest data is stored in `IndexedDB`, not just in the HTML file itself.

How to export:

1. Open the offline `筑学工作室-学生成长追踪系统.html` in the original browser.
2. Open DevTools.
3. Paste the contents of `scripts/growth-v2/export-indexeddb.js` into the console.
4. The browser should download:
   - `students.json`
   - `lessons.json`
   - `records.json`
   - `exams.json`
   - `exam_scores.json`
   - `manifest.json`

## 2. Apply the new schema

Run the SQL from:

- `docs/growth-v2-schema.sql`
- or the migration file under `supabase/migrations/20260306143000_growth_v2_schema.sql`

This creates the new `growth_*` tables without touching the old score tracker tables.

If you want to apply it through the Supabase Management API instead of the dashboard SQL editor:

```bash
export SUPABASE_ACCESS_TOKEN="your-personal-access-token"
npm run growth:v2:db:apply -- --yes
```

Notes:

- This requires a Supabase personal access token, not the service role key.
- The script derives the project ref from `SUPABASE_URL`.
- The token can be provided via shell env or `.env.local`.

## 3. Import the exported JSON into Supabase

Place the exported JSON files in one directory, then run:

```bash
npm run growth:v2:import -- --dir /absolute/path/to/exported-json --dry-run
```

If the dry run looks correct, run the real import:

```bash
npm run growth:v2:import -- --dir /absolute/path/to/exported-json
```

Notes:

- The script reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the current environment, and falls back to `.env.local`.
- By default it aborts if any `growth_*` target table already contains data.
- If you intentionally want to import into non-empty tables, add `--allow-nonempty`.

## 4. What the importer does

- Creates new `growth_groups`
- Migrates students into `growth_students`
- Migrates lessons into `growth_lessons`
- Migrates lesson records into `growth_lesson_records`
- Migrates exams into `growth_exams`
- Migrates exam scores into `growth_exam_scores`
- Explodes `weak_tags[]` into `growth_exam_score_tags`
- Normalizes legacy mastery values:
  - `mastered -> lvtk`
  - `partial -> lvbk`
- `weak -> lvzk`

## 5. Recommended order

1. Apply the migration
2. Export IndexedDB JSON from the original browser
3. Dry-run the importer
4. Run the real import
5. Open `/admin/growth-v2` and `/admin/growth-v2/students`
