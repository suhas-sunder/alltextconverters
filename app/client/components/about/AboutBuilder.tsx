export function AboutBuilder() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-5">
      <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] text-slate-900">
        Built by Suhas Sunder
      </h2>

      <p className="text-slate-700 leading-relaxed">
        AllTextConverters is built and maintained by Suhas Sunder, a full-stack software developer with
        professional experience building and maintaining production web applications across full-time,
        freelance, and consulting roles.
      </p>

      <div className="text-slate-700 leading-relaxed space-y-3">
        <p>
          I recently completed a Master’s degree in Electrical and Computer Engineering (December 2025)
          at Ontario Tech University, with a strong focus on software engineering and applied,
          project-based development. Throughout graduate studies, I continued working in production
          software roles.
        </p>
        <p>
          My work centers on full-stack web development using React, TypeScript, Remix, Node.js, Express,
          PostgreSQL, and Prisma. I care about clean architecture, maintainability, performance,
          accessibility, and building software that holds up beyond the initial release.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-slate-700">
        <ul className="list-disc list-inside space-y-1">
          <li>React, TypeScript, Remix</li>
          <li>Node.js, Express</li>
          <li>PostgreSQL, Prisma</li>
        </ul>
        <ul className="list-disc list-inside space-y-1">
          <li>Clean UX and accessibility</li>
          <li>Performance and reliability</li>
          <li>Shipping in existing codebases</li>
        </ul>
      </div>

      <a
        href="https://www.suhassunder.com"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer transition-colors"
      >
        Portfolio: suhassunder.com
      </a>
    </section>
  );
}
