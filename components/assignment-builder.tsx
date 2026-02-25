'use client';

import { useMemo, useState } from 'react';

import type { Course } from '@/lib/courses';
import { WEAKNESSES, buildHomeworkPack, buildRecommendedCart, getWeaknessByGrade } from '@/lib/assignment';
import { mapChapterName } from '@/lib/course-meta';

type AssignmentBuilderProps = {
  courses: Course[];
};

type CartItem = {
  course: Course;
  source: 'recommended' | 'manual';
  reasons: string[];
  weaknessIds: string[];
};

function tomorrowPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function AssignmentBuilder({ courses }: AssignmentBuilderProps) {
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState<'10' | '11'>('10');
  const [selectedWeaknessIds, setSelectedWeaknessIds] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dueDate, setDueDate] = useState(tomorrowPlus(3));
  const [manualCourseId, setManualCourseId] = useState('');
  const [pack, setPack] = useState<ReturnType<typeof buildHomeworkPack> | null>(null);

  const weaknessOptions = useMemo(() => getWeaknessByGrade(studentGrade), [studentGrade]);
  const gradeCourses = useMemo(() => courses.filter((course) => course.grade === studentGrade), [courses, studentGrade]);

  const courseCountByWeakness = useMemo(() => {
    return WEAKNESSES.reduce<Record<string, number>>((acc, weakness) => {
      acc[weakness.id] = gradeCourses.filter((course) =>
        weakness.keywords.some((keyword) => [course.title, course.summary, ...course.tags].join(' ').includes(keyword))
      ).length;
      return acc;
    }, {});
  }, [gradeCourses]);

  function toggleWeakness(weaknessId: string) {
    setSelectedWeaknessIds((prev) => {
      if (prev.includes(weaknessId)) return prev.filter((item) => item !== weaknessId);
      return [...prev, weaknessId];
    });
  }

  function handleGenerateCart() {
    const recommended = buildRecommendedCart(courses, selectedWeaknessIds, studentGrade).map((item) => ({
      course: item.course,
      source: 'recommended' as const,
      reasons: item.matchReasons,
      weaknessIds: item.weaknessIds
    }));

    setCart(recommended);
    setPack(null);
    setManualCourseId('');
  }

  function removeFromCart(courseId: string) {
    setCart((prev) => prev.filter((item) => item.course.id !== courseId));
    setPack(null);
  }

  function addManualCourse() {
    if (!manualCourseId) return;

    const target = courses.find((course) => course.id === manualCourseId);
    if (!target) return;

    setCart((prev) => {
      if (prev.some((item) => item.course.id === target.id)) return prev;
      return [
        ...prev,
        {
          course: target,
          source: 'manual',
          reasons: ['教师手动加入'],
          weaknessIds: []
        }
      ];
    });
    setPack(null);
    setManualCourseId('');
  }

  function checkout() {
    const name = studentName.trim() || '未命名学生';
    const coursesInCart = cart.map((item) => item.course);
    const nextPack = buildHomeworkPack({
      studentName: name,
      studentGrade,
      dueDate,
      selectedWeaknessIds,
      courses: coursesInCart
    });
    setPack(nextPack);
  }

  const methodsToMaster = useMemo(() => {
    return WEAKNESSES.filter((item) => selectedWeaknessIds.includes(item.id)).flatMap((item) => item.methods);
  }, [selectedWeaknessIds]);

  const availableManualCourses = gradeCourses.filter((course) => !cart.some((item) => item.course.id === course.id));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-2xl border border-tide/10 bg-white/80 p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-tide">个性化作业布置</h1>
        <p className="mt-2 text-sm text-ink/70">按学生薄弱点自动加入课程到购物车，老师可手动调整后结算下发。</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">学生姓名</span>
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="例如：李明"
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink/80">年级</span>
            <select
              value={studentGrade}
              onChange={(event) => {
                const grade = event.target.value as '10' | '11';
                setStudentGrade(grade);
                setSelectedWeaknessIds([]);
                setCart([]);
                setPack(null);
              }}
              className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 outline-none transition focus:border-accent"
            >
              <option value="10">高一</option>
              <option value="11">高二</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-ink">薄弱点诊断</h2>
          <div className="mt-3 grid gap-3">
            {weaknessOptions.map((weakness) => (
              <label key={weakness.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-tide/10 bg-paper/60 p-3">
                <input
                  type="checkbox"
                  checked={selectedWeaknessIds.includes(weakness.id)}
                  onChange={() => toggleWeakness(weakness.id)}
                  className="mt-1 h-4 w-4 accent-accent"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{weakness.label}</span>
                  <span className="block text-xs text-ink/70">
                    {weakness.description} 可匹配课程 {courseCountByWeakness[weakness.id] ?? 0} 节
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerateCart}
            disabled={selectedWeaknessIds.length === 0}
            className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90 disabled:cursor-not-allowed disabled:bg-tide/40"
          >
            自动生成购物车
          </button>
          <p className="self-center text-xs text-ink/65">已选 {selectedWeaknessIds.length} 个薄弱点</p>
        </div>

        <div className="mt-5 rounded-xl border border-tide/10 bg-white p-4">
          <p className="text-sm font-semibold text-ink">需掌握方法与技巧</p>
          {methodsToMaster.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {methodsToMaster.map((item) => (
                <span key={item} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-ink/60">请先勾选薄弱点。</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-tide/10 bg-white/85 p-6 shadow-card">
        <h2 className="text-xl font-semibold text-tide">作业购物车</h2>
        <p className="mt-2 text-sm text-ink/70">自动推荐后可手动增删，确认后结算下发给学生。</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <select
            value={manualCourseId}
            onChange={(event) => setManualCourseId(event.target.value)}
            className="w-full rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
          >
            <option value="">手动添加课程...</option>
            {availableManualCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addManualCourse}
            disabled={!manualCourseId}
            className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            加入
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {cart.length === 0 ? (
            <p className="rounded-lg border border-dashed border-tide/20 p-4 text-sm text-ink/60">购物车为空，先点击“自动生成购物车”。</p>
          ) : (
            cart.map((item) => (
              <article key={item.course.id} className="rounded-xl border border-tide/10 bg-paper/50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.course.title}</p>
                    <p className="text-xs text-ink/70">
                      高{item.course.grade === '10' ? '一' : '二'} · {mapChapterName(item.course.chapter)} · {item.course.duration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.course.id)}
                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    移除
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      item.source === 'recommended' ? 'bg-tide/10 text-tide' : 'bg-accent/10 text-accent'
                    }`}
                  >
                    {item.source === 'recommended' ? '自动推荐' : '手动添加'}
                  </span>
                  {item.reasons.slice(0, 2).map((reason) => (
                    <span key={reason} className="rounded-full bg-white px-2 py-1 text-xs text-ink/70">
                      {reason}
                    </span>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-5 rounded-xl border border-tide/10 bg-white p-4">
          <label className="block text-sm font-medium text-ink/80">截止日期</label>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="mt-2 rounded-lg border border-tide/20 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={checkout}
            disabled={cart.length === 0}
            className="mt-4 w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/50"
          >
            结算并下发作业包
          </button>
        </div>

        {pack ? (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
            <p className="font-semibold text-green-800">已生成作业包：{pack.id}</p>
            <p className="mt-1 text-green-700">
              已下发给 {pack.studentName}（高{pack.studentGrade === '10' ? '一' : '二'}），截止 {pack.dueDate}
            </p>
            <p className="mt-1 text-green-700">{pack.summary}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
