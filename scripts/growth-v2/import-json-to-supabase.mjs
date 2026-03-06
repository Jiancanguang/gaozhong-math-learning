import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const REQUIRED_EXPORT_FILES = ['students.json', 'lessons.json', 'records.json', 'exams.json', 'exam_scores.json'];
const DATA_TABLES = [
  'growth_groups',
  'growth_students',
  'growth_lessons',
  'growth_lesson_records',
  'growth_exams',
  'growth_exam_scores',
  'growth_exam_score_tags'
];

const SUBJECT_BY_KEYWORD = [
  ['数学', 'math'],
  ['英语', 'english'],
  ['语文', 'chinese'],
  ['物理', 'physics'],
  ['化学', 'chemistry'],
  ['生物', 'biology']
];

const TAG_CATEGORY_BY_NAME = new Map(
  [
    ['函数', ['函数概念与性质', '指数函数', '对数函数', '幂函数', '函数零点']],
    ['三角', ['三角函数', '三角恒等变换', '正余弦定理', '解三角形']],
    ['向量', ['向量运算', '向量数量积', '向量坐标运算']],
    ['数列', ['等差数列', '等比数列', '数列求和', '数列递推']],
    ['立体几何', ['空间几何体', '平行与垂直', '空间向量法']],
    ['解析几何', ['直线方程', '圆的方程', '椭圆', '双曲线', '抛物线']],
    ['概率统计', ['古典概型', '条件概率', '统计分析', '正态分布']],
    ['导数', ['导数运算', '函数单调性', '极值与最值']],
    ['通用问题', ['计算错误', '审题不清', '公式记忆', '解题思路', '时间分配', '步骤不完整']]
  ].flatMap(([category, tags]) => tags.map((tag) => [tag, category]))
);

function printUsage() {
  console.log(`
Usage:
  node ./scripts/growth-v2/import-json-to-supabase.mjs --dir <export-dir> [--dry-run] [--allow-nonempty]

Options:
  --dir <path>        Directory containing students.json / lessons.json / records.json / exams.json / exam_scores.json
  --dry-run           Build and validate rows locally, but do not write to Supabase
  --allow-nonempty    Skip the safety check that aborts when target tables already contain data
  --help              Show this help text
`);
}

function parseArgs(argv) {
  const args = {
    dir: '',
    dryRun: false,
    allowNonempty: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dir') {
      args.dir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--allow-nonempty') {
      args.allowNonempty = true;
      continue;
    }

    if (arg === '--help') {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function loadDotEnvFile(filePath) {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    const env = {};

    for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      env[key] = value;
    }

    return env;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function loadExportDirectory(dirPath) {
  const resolvedDir = path.resolve(process.cwd(), dirPath);
  const payload = {};

  for (const filename of REQUIRED_EXPORT_FILES) {
    const filePath = path.join(resolvedDir, filename);
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error(`${filename} must contain a JSON array.`);
    }

    payload[filename] = parsed;
  }

  return { resolvedDir, payload };
}

function normalizeMastery(value) {
  if (!value) return null;

  const normalized = String(value).trim();
  const legacyMap = {
    mastered: 'lvtk',
    partial: 'lvbk',
    weak: 'lvzk'
  };

  return legacyMap[normalized] ?? normalized;
}

function normalizeExamType(value) {
  if (!value) return 'other';
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'school' || normalized === 'internal') return normalized;
  return 'other';
}

function inferTeacherName(groupName) {
  if (!groupName) return '';
  const match = String(groupName).match(/^(.+?老师)/);
  return match?.[1] ?? '';
}

function inferSubject(groupName) {
  const raw = String(groupName ?? '');
  const matched = SUBJECT_BY_KEYWORD.find(([keyword]) => raw.includes(keyword));
  return matched?.[1] ?? 'math';
}

function chooseGroupGrade(groupName, students) {
  const counts = new Map();

  for (const student of students) {
    if ((student.group_name ?? '') !== groupName) continue;
    const grade = String(student.grade ?? '').trim();
    if (!grade) continue;
    counts.set(grade, (counts.get(grade) ?? 0) + 1);
  }

  let winner = '';
  let bestCount = -1;
  for (const [grade, count] of counts.entries()) {
    if (count > bestCount) {
      winner = grade;
      bestCount = count;
    }
  }

  return winner;
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toIntegerOrNull(value) {
  const numeric = toNumberOrNull(value);
  return numeric === null ? null : Math.trunc(numeric);
}

function toText(value) {
  return value === null || value === undefined ? '' : String(value);
}

function toTimestamp(value) {
  return value ? String(value) : new Date().toISOString();
}

function toTagArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function buildRows(payload) {
  const students = payload['students.json'];
  const lessons = payload['lessons.json'];
  const records = payload['records.json'];
  const exams = payload['exams.json'];
  const examScores = payload['exam_scores.json'];

  const groupNames = new Set();
  for (const student of students) {
    if (student.group_name) groupNames.add(String(student.group_name));
  }
  for (const lesson of lessons) {
    if (lesson.group_name) groupNames.add(String(lesson.group_name));
  }
  for (const exam of exams) {
    if (exam.group_name) groupNames.add(String(exam.group_name));
  }

  const sortedGroupNames = [...groupNames].sort((left, right) => left.localeCompare(right, 'zh-CN'));
  const groupIdByName = new Map();
  const groups = sortedGroupNames.map((groupName) => {
    const id = crypto.randomUUID();
    groupIdByName.set(groupName, id);

    const createdAtSource =
      students.find((student) => student.group_name === groupName)?.created_at ??
      lessons.find((lesson) => lesson.group_name === groupName)?.created_at ??
      exams.find((exam) => exam.group_name === groupName)?.created_at;

    return {
      id,
      name: groupName,
      subject: inferSubject(groupName),
      teacher_name: inferTeacherName(groupName),
      grade_label: chooseGroupGrade(groupName, students),
      status: 'active',
      notes: '',
      created_at: toTimestamp(createdAtSource),
      updated_at: toTimestamp(createdAtSource)
    };
  });

  const studentIdByLegacyId = new Map();
  const growthStudents = students.map((student) => {
    const id = crypto.randomUUID();
    studentIdByLegacyId.set(String(student.id), id);

    const createdAt = toTimestamp(student.created_at);

    return {
      id,
      name: toText(student.name),
      grade_label: toText(student.grade),
      home_group_id: groupIdByName.get(String(student.group_name ?? '')) ?? null,
      parent_access_token: toText(student.parent_token) || crypto.randomUUID().replaceAll('-', ''),
      status: student.status === 'archived' ? 'archived' : 'active',
      notes: '',
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  const lessonIdByLegacyId = new Map();
  const growthLessons = lessons.map((lesson) => {
    const id = crypto.randomUUID();
    lessonIdByLegacyId.set(String(lesson.id), id);
    const createdAt = toTimestamp(lesson.created_at);

    return {
      id,
      group_id: groupIdByName.get(String(lesson.group_name ?? '')) ?? null,
      lesson_date: toText(lesson.date),
      time_start: toText(lesson.time_start) || null,
      time_end: toText(lesson.time_end) || null,
      topic: toText(lesson.topic),
      entry_test_topic: toText(lesson.entry_test_topic),
      exit_test_topic: toText(lesson.exit_test_topic),
      test_total: toNumberOrNull(lesson.test_total),
      homework: toText(lesson.homework),
      key_points: toText(lesson.key_points),
      notes: toText(lesson.notes),
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  const studentHomeGroupByLegacyId = new Map(students.map((student) => [String(student.id), String(student.group_name ?? '')]));
  const lessonGroupByLegacyId = new Map(lessons.map((lesson) => [String(lesson.id), String(lesson.group_name ?? '')]));

  const growthLessonRecords = records.map((record) => {
    const createdAt = toTimestamp(record.created_at);
    const legacyStudentId = String(record.student_id);
    const legacyLessonId = String(record.lesson_id);

    return {
      id: crypto.randomUUID(),
      lesson_id: lessonIdByLegacyId.get(legacyLessonId) ?? null,
      student_id: studentIdByLegacyId.get(legacyStudentId) ?? null,
      is_guest: studentHomeGroupByLegacyId.get(legacyStudentId) !== lessonGroupByLegacyId.get(legacyLessonId),
      entry_score: toNumberOrNull(record.entry_score),
      exit_score: toNumberOrNull(record.exit_score),
      performance: toIntegerOrNull(record.performance),
      mastery_level: normalizeMastery(record.mastery),
      comment: toText(record.comment),
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  const examIdByLegacyId = new Map();
  const growthExams = exams.map((exam) => {
    const id = crypto.randomUUID();
    examIdByLegacyId.set(String(exam.id), id);
    const createdAt = toTimestamp(exam.created_at);

    return {
      id,
      group_id: groupIdByName.get(String(exam.group_name ?? '')) ?? null,
      name: toText(exam.name),
      exam_type: normalizeExamType(exam.type),
      exam_date: toText(exam.date),
      subject: toText(exam.subject) || '数学',
      total_score: toNumberOrNull(exam.total_score),
      notes: '',
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  const examScoreIdByLegacyId = new Map();
  const growthExamScores = examScores.map((examScore) => {
    const id = crypto.randomUUID();
    examScoreIdByLegacyId.set(String(examScore.id), id);
    const createdAt = toTimestamp(examScore.created_at);

    return {
      id,
      exam_id: examIdByLegacyId.get(String(examScore.exam_id)) ?? null,
      student_id: studentIdByLegacyId.get(String(examScore.student_id)) ?? null,
      score: toNumberOrNull(examScore.score),
      class_rank: toIntegerOrNull(examScore.rank),
      grade_rank: toIntegerOrNull(examScore.grade_rank),
      mastery_level: normalizeMastery(examScore.exam_mastery),
      note: toText(examScore.note),
      created_at: createdAt,
      updated_at: createdAt
    };
  });

  const growthExamScoreTags = examScores.flatMap((examScore) => {
    const examScoreId = examScoreIdByLegacyId.get(String(examScore.id));
    const tags = toTagArray(examScore.weak_tags);
    const createdAt = toTimestamp(examScore.created_at);

    return tags.map((tagName, index) => ({
      id: crypto.randomUUID(),
      exam_score_id: examScoreId ?? null,
      category: TAG_CATEGORY_BY_NAME.get(tagName) ?? '',
      tag_name: tagName,
      sort_order: index + 1,
      created_at: createdAt
    }));
  });

  const allRows = {
    growth_groups: groups,
    growth_students: growthStudents,
    growth_lessons: growthLessons,
    growth_lesson_records: growthLessonRecords,
    growth_exams: growthExams,
    growth_exam_scores: growthExamScores,
    growth_exam_score_tags: growthExamScoreTags
  };

  for (const [tableName, rows] of Object.entries(allRows)) {
    const invalidRow = rows.find((row) => Object.values(row).includes(undefined));
    if (invalidRow) {
      throw new Error(`Table ${tableName} contains undefined values. Fix the mapping before importing.`);
    }
  }

  return allRows;
}

function createSupabaseClient({ supabaseUrl, serviceRoleKey }) {
  const restBaseUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1`;

  async function request(pathname, init = {}) {
    const response = await fetch(`${restBaseUrl}/${pathname}`, {
      ...init,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
        ...init.headers
      }
    });

    if (!response.ok) {
      const reason = await response.text();
      throw new Error(`Supabase request failed for ${pathname}: ${response.status} ${reason}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  return {
    async ensureTableEmpty(tableName) {
      const rows = await request(`${tableName}?select=id&limit=1`, { method: 'GET' });
      if (Array.isArray(rows) && rows.length > 0) {
        throw new Error(`Target table ${tableName} is not empty. Aborting import.`);
      }
    },
    async insertBatch(tableName, rows) {
      if (!rows.length) return;
      await request(tableName, {
        method: 'POST',
        body: JSON.stringify(rows)
      });
    }
  };
}

async function insertInChunks(client, tableName, rows, chunkSize = 200) {
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await client.insertBatch(tableName, chunk);
    console.log(`Inserted ${Math.min(index + chunk.length, rows.length)}/${rows.length} rows into ${tableName}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  if (!args.dir) {
    throw new Error('Missing --dir. Point it to the directory that contains the exported JSON files.');
  }

  const dotEnv = await loadDotEnvFile(path.join(REPO_ROOT, '.env.local'));
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || dotEnv.SUPABASE_URL?.trim() || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || dotEnv.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in the environment or .env.local.');
  }

  const { resolvedDir, payload } = await loadExportDirectory(args.dir);
  const rows = buildRows(payload);

  console.log(`Loaded export data from ${resolvedDir}`);
  console.table(
    Object.fromEntries(
      Object.entries(rows).map(([tableName, tableRows]) => [tableName, tableRows.length])
    )
  );

  if (args.dryRun) {
    console.log('Dry run complete. No rows were written to Supabase.');
    return;
  }

  const client = createSupabaseClient({ supabaseUrl, serviceRoleKey });

  if (!args.allowNonempty) {
    for (const tableName of DATA_TABLES) {
      await client.ensureTableEmpty(tableName);
    }
  }

  for (const tableName of DATA_TABLES) {
    await insertInChunks(client, tableName, rows[tableName]);
  }

  console.log('Growth V2 import completed successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

