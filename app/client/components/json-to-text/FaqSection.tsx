export function FaqSection() {
  return (
    <section
      id="faq"
      className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6 sm:p-10"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          FAQ
        </h2>

        <div className="mt-6 space-y-6 text-slate-700 leading-7">
          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="font-bold text-slate-900">
              Does this tool keep my data private?
            </div>
            <p className="mt-2">
              Yes. Extraction runs locally in your browser. Your JSON is not
              uploaded to a server by this page.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="font-bold text-slate-900">
              What JSON types are supported?
            </div>
            <p className="mt-2">
              Objects and arrays work best, but valid JSON primitives also work.
              The extractor walks arrays and objects, then emits primitive values
              like strings, numbers, booleans, and null.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="font-bold text-slate-900">
              Why does it say “Invalid JSON” for log snippets?
            </div>
            <p className="mt-2">
              Many logs include JSON-like text that is not strict JSON (single
              quotes, trailing commas, comments). This tool requires valid JSON
              so parsing is deterministic. If you convert the snippet to valid
              JSON first, extraction should work immediately.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="font-bold text-slate-900">
              What does the “Keys” toggle do?
            </div>
            <p className="mt-2">
              When enabled, the output includes key paths like{" "}
              <span className="font-semibold">payload.items[0].title:</span>{" "}
              before each value. Leave it off if you only want the readable text.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="font-bold text-slate-900">
              Can I upload a PDF or DOCX?
            </div>
            <p className="mt-2">
              Yes, but PDF and DOCX extraction require optional libraries in your
              app build: <span className="font-semibold">pdfjs-dist</span> for PDF
              and <span className="font-semibold">mammoth</span> for DOCX. If they
              are not installed, the upload step may fail.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
