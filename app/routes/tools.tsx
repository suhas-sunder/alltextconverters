import { taskGroups, toolCatalog } from "../client/components/navigation/tool-catalog";
import { canonicalPath } from "../url-path";
import type { Route } from "./+types/tools";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "Browse Text Tools by Task | AllTextConverters",
  description: "Choose a browser-based tool for comparing drafts, working with spreadsheet data, cleaning text, counting characters, or converting formats.",
  pathname: "/tools",
  indexable: false,
});

export default function ToolsDirectoryRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold sm:text-4xl">Browse tools by task</h1>
          <p className="text-slate-700">Choose what you want to do, then open the tool that fits your input.</p>
        </header>
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-labelledby="tool-tasks" className="rounded-xl border border-slate-200 bg-white p-3 lg:sticky lg:top-4">
            <h2 id="tool-tasks" tabIndex={-1} className="mb-2 scroll-mt-4 px-2 text-sm font-semibold">Tasks</h2>
            <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {taskGroups.map((group) => (
                <li key={group.id}>
                  <a href={"#task-" + group.id} className="flex min-h-11 items-center rounded-lg px-2 py-1 text-sm font-semibold text-sky-900 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
                    {group.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0 space-y-5">
            {taskGroups.map((group) => (
              <section key={group.id} aria-labelledby={"task-" + group.id} className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <h2 id={"task-" + group.id} tabIndex={-1} className="scroll-mt-4 rounded text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
                  {group.label}
                </h2>
                <p className="text-sm text-slate-700">{group.description}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {toolCatalog.filter((tool) => tool.group === group.id).map((tool) => {
                    const id = "tool-" + tool.href.slice(1);
                    return (
                      <li key={tool.href} className="min-w-0">
                        <a href={canonicalPath(tool.href)} aria-labelledby={id} aria-describedby={tool.purpose ? id + "-purpose" : undefined}
                          className="flex min-h-11 flex-col justify-center gap-1 rounded-lg border border-slate-200 p-3 text-sky-900 hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
                          <span id={id} className="font-semibold">{tool.label}</span>
                          {tool.purpose && <span id={id + "-purpose"} className="text-sm text-slate-700">{tool.purpose}</span>}
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <a href="#tool-tasks" className="inline-flex min-h-11 items-center rounded text-sm font-semibold text-sky-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
                  Back to tasks
                </a>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
