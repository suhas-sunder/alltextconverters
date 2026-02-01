export function AboutHowItWorksCard() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-5">
      <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] text-slate-900">
        How the tools work
      </h2>

      <p className="text-slate-700 leading-relaxed">
        AllTextConverters tools are designed to be immediate and predictable.
        Paste text, apply a transformation, and copy the result. Most tools
        operate entirely in your browser, which keeps them fast and avoids
        unnecessary data transfer.
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <ol className="list-decimal list-inside text-slate-700 space-y-1">
          <li>Paste or type your text</li>
          <li>Select the conversion or cleanup you need</li>
          <li>Copy the output and continue your work</li>
        </ol>
      </div>

      <p className="text-slate-700 leading-relaxed">
        Popular tools include the{" "}
        <a href="/word-counter" className="text-blue-600 underline cursor-pointer">
          Word Counter
        </a>
        ,{" "}
        <a
          href="/case-converter"
          className="text-blue-600 underline cursor-pointer"
        >
          Case Converter
        </a>
        , and{" "}
        <a
          href="/text-cleaner"
          className="text-blue-600 underline cursor-pointer"
        >
          Text Cleaner
        </a>
        .
      </p>
    </section>
  );
}
