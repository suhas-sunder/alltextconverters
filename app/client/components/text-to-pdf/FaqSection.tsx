export function FaqSection() {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm px-6 sm:px-8 py-8 space-y-5">
      <header className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          FAQ
        </h2>
        <p className="text-slate-700">
          Common questions about converting text to PDF in the browser.
        </p>
      </header>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900">
            Does this run in my browser or on your servers?
          </h3>
          <p className="text-slate-800 leading-relaxed">
            The editor and PDF generation run client-side in your browser. If you use PDF or DOCX upload,
            the extraction also runs locally when the optional libraries are installed in your app.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-900">
            Will it preserve formatting perfectly?
          </h3>
          <p className="text-slate-800 leading-relaxed">
            It aims to preserve obvious structure like headings, lists, spacing, and many tables. Complex
            layouts (multi-column documents, elaborate templates, footnotes) may need manual cleanup after
            import or before export.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-900">
            What file types can I upload?
          </h3>
          <p className="text-slate-800 leading-relaxed">
            Plain text-like files are supported directly. PDF and DOCX imports can work locally if your
            site includes optional libraries for extraction. You can also upload simple HTML.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-900">
            Why do some PDFs import with weird spacing?
          </h3>
          <p className="text-slate-800 leading-relaxed">
            Many PDFs store text in positioned fragments rather than true paragraphs. Extraction often
            reconstructs content by reading those fragments in order, which can introduce extra spaces or
            line breaks. It is normal to do a quick pass and fix obvious artifacts.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-900">
            How do I control page breaks?
          </h3>
          <p className="text-slate-800 leading-relaxed">
            Choose the page size, orientation, and margin first. Then adjust spacing in the editor so
            sections flow naturally. For highly controlled print layouts, keep the structure simple and
            avoid multi-column formatting.
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-900">
            Why does the PDF look blurry sometimes?
          </h3>
          <p className="text-slate-800 leading-relaxed">
            The export renders your document to an image before placing it into a PDF. Increase the
            “Quality” setting to produce a sharper result, especially for small text.
          </p>
        </div>
      </div>
    </section>
  );
}
