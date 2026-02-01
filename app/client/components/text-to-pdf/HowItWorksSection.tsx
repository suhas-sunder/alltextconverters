export function HowItWorksSection() {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm px-6 sm:px-8 py-8 space-y-5">
      <header className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          How text to PDF conversion works
        </h2>
        <p className="text-slate-700">
          This page turns the content you type or upload into a downloadable PDF directly in your browser.
          It focuses on speed and readability for common real-world documents like resumes, assignments,
          invoices, and internal documentation.
        </p>
      </header>

      <div className="space-y-4 text-slate-800 leading-relaxed">
        <p>
          A PDF is essentially a fixed-layout snapshot of a document. That is why it is so commonly requested
          for applications, school submissions, receipts, and official files. The tradeoff is that once you
          pick a layout, the result is meant to look the same everywhere, whether someone opens it on a phone,
          a laptop, or a printer. A text editor, on the other hand, is fluid and reflows depending on the app,
          font availability, and screen size. Converting text to PDF is the process of deciding what the
          “final” page should look like and then packaging it as a PDF file.
        </p>

        <p>
          This tool keeps that workflow intentionally simple. You work in one editor box, apply basic formatting
          like bold, underline, headings, alignment, and lists, and then export. The export step renders your
          formatted content onto a clean “paper” surface with a chosen page size and margin. From there, the
          page is captured and placed into a PDF. Because the rendering happens in the browser, your content
          does not need to be sent to a server for PDF generation.
        </p>

        <h3 className="text-lg font-bold text-slate-900">What gets preserved well</h3>
        <p>
          For typical “strong intent” use cases, the most important thing is to keep obvious structure. That
          means headings should still read like headings, paragraphs should keep their spacing, bullet points
          should stay as lists, and tables should still look like tables. This tool is built around that
          expectation. If you paste from a common source (a word processor, email, or web page), the editor
          attempts to keep emphasis (bold and underline), line breaks, and list structure. If you upload
          a plain text file, it converts newlines into visible line breaks so your paragraphs remain readable.
          For DOCX and PDF imports, the goal is to recover the text quickly and keep it usable. Those formats
          can contain a lot of layout instructions, and the import step is deliberately conservative so you can
          review and adjust before exporting.
        </p>

        <h3 className="text-lg font-bold text-slate-900">Why perfect fidelity is hard</h3>
        <p>
          “Text to PDF” sounds straightforward until you consider where the text came from. A resume built in
          a template with custom fonts, multi-column sections, and precisely aligned tab stops depends heavily
          on the original layout engine. Academic assignments can include footnotes, complex tables, or
          diagrams placed next to paragraphs. Invoices might rely on exact column widths and repeated headers.
          Those are all solvable problems, but they are not the same problem as “take text and make a readable
          PDF.” In a browser-based converter, the output quality depends on how well the source formatting can
          be represented as simple HTML and how consistent the rendering is across systems.
        </p>

        <p>
          This is why the tool focuses on “don’t lose the obvious structure” rather than making unrealistic
          promises. You can usually preserve spacing, headings, lists, and many tables. But if the original
          content uses complex grids, multiple columns, floating elements, or footnote systems, the exported
          PDF may need manual cleanup. When you see anything odd, the fix is usually simple: remove extra
          blank lines, reapply heading styles, or rebuild a table with clean rows and columns.
        </p>

        <h3 className="text-lg font-bold text-slate-900">Pagination and page controls</h3>
        <p>
          PDF pages have a fixed size, so pagination matters. The tool provides page size (Letter or A4),
          orientation, and margin controls so you can pick a predictable canvas. Internally, it renders your
          content onto a “paper” area with those dimensions. If the content is longer than one page, it is
          automatically split into multiple PDF pages. This approach is reliable for standard documents because
          it keeps every page consistent. If you need a very specific print layout, use the controls to match
          the target paper size and then adjust spacing in the editor so page breaks fall where you expect.
        </p>

        <h3 className="text-lg font-bold text-slate-900">Uploads and privacy</h3>
        <p>
          Upload support is designed for the common path: drop in a text file, paste from another app, format,
          and export. For PDF and DOCX uploads, the conversion step can run locally if your app includes the
          optional libraries used to extract content. If those libraries are not installed, the tool will tell
          you so. Either way, the editor remains the “source of truth” because you can always paste content
          manually and format it the way you want. Since the conversion happens in your browser, the content
          stays on your device during normal use.
        </p>

        <h3 className="text-lg font-bold text-slate-900">Best practices for clean results</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Use headings for section titles instead of manually enlarging text. It keeps spacing consistent and
            improves readability.
          </li>
          <li>
            Keep lists as lists. If a pasted list becomes plain paragraphs, reapply bullets or numbering from
            the toolbar so indentation stays consistent.
          </li>
          <li>
            For tables, prefer simple rows and columns. Very complex merged cells can render inconsistently in
            browser-based exports.
          </li>
          <li>
            If you are exporting a resume, keep alignment simple. A single column with clear section headings is
            usually more robust than a multi-column layout.
          </li>
          <li>
            If page breaks matter, use the margin and page size controls first, then adjust spacing so headings
            do not end up isolated at the bottom of a page.
          </li>
        </ul>

        <p>
          The intent behind searches like “text to pdf”, “convert text to pdf”, and “txt to pdf” is almost
          always the same: people want usable output fast, and they do not want the basic structure to fall
          apart. That is what this page is built for. If your source content is simple, the export will be
          straightforward. If your content is complex, the editor gives you a practical middle ground: recover
          the text, preserve what is reasonable, and let you make quick edits so the final PDF is presentable.
        </p>
      </div>
    </section>
  );
}
