export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 sm:p-10">
      <h2 className="text-2xl font-extrabold text-slate-900">How to join wrapped text</h2>
      <p className="mt-2 leading-7 text-slate-700">
        Paste your text, choose how to join the lines, and select Convert. Use Copy or Download TXT to save the result.
        Windows (CRLF), Unix (LF), and older Mac (CR) breaks are treated as line breaks. Any breaks kept in the output use LF.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="font-bold">Before</h3>
          <pre className="mt-2 whitespace-pre-wrap break-words text-sm">{"The first paragraph\nwraps here.\n\nThe second paragraph\nwraps here too."}</pre>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="font-bold">After using Preserve paragraphs</h3>
          <pre className="mt-2 whitespace-pre-wrap break-words text-sm">{"The first paragraph wraps here.\n\nThe second paragraph wraps here too."}</pre>
        </div>
      </div>
      <p className="mt-4 leading-7 text-slate-700">
        Joining trims spaces at line edges by default and preserves spacing inside each line. To keep bullets or other intentional breaks on their own lines, choose Remove blank lines only.
      </p>
    </section>
  );
}
