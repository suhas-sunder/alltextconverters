export function AboutBuilder() {
  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Built by Suhas Sunder</h2>
      <p className="leading-relaxed text-slate-700">
        AllTextConverters is built and maintained by Suhas Sunder. He holds a
        bachelor&apos;s degree in Engineering and Management and a master&apos;s degree in
        Electrical and Computer Engineering.
      </p>
      <p className="text-sm leading-relaxed text-slate-600">
        The approved maintainer profile image is not yet present in the repository.
        This page will display it when the supplied asset is added.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href="https://www.suhassunder.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800">
          Portfolio
        </a>
        <a href="https://www.linkedin.com/in/s-sunder/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 transition-colors hover:bg-slate-50">
          LinkedIn
        </a>
      </div>
    </section>
  );
}
