import { teachingResources } from '@/lib/resources';

export default function ResourcesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/80 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Teaching Resources</p>
        <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">教学资源</h1>
        <p className="mt-4 max-w-2xl text-base text-ink/80">
          这里汇总讲义、练习与专题资料。点击资源即可在新窗口打开原始页面，不影响当前站内浏览。
        </p>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teachingResources.map((resource) => (
          <article key={resource.id} className="rounded-2xl border border-tide/10 bg-white/80 p-5">
            <p className="text-xs font-semibold tracking-wide text-accent">{resource.category}</p>
            <h2 className="mt-2 text-xl font-semibold text-tide">{resource.title}</h2>
            <p className="mt-2 text-sm text-ink/75">{resource.description}</p>
            <p className="mt-3 text-xs text-ink/60">更新于 {resource.updatedAt}</p>
            <a
              href={resource.href}
              target={resource.openInNewTab ? '_blank' : undefined}
              rel={resource.openInNewTab ? 'noopener noreferrer' : undefined}
              className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
            >
              打开资源
            </a>
          </article>
        ))}
      </section>
    </div>
  );
}
