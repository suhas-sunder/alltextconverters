export function AboutSection() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-6">
      <h2 className="text-3xl font-bold font-[Poppins] text-slate-900">
        About AllTextConverters
      </h2>
      <p className="text-slate-700 leading-relaxed">
        <strong>AllTextConverters.com</strong> is your online toolbox for manipulating and analyzing text quickly.
        Convert cases, clean messy text, and count words, all processed locally for maximum privacy.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 text-slate-700">
        <ul className="list-disc list-inside space-y-1">
          <li>Convert text to uppercase, lowercase, or title case</li>
          <li>Encode or decode Base64 instantly</li>
          <li>Trim and clean extra spaces and newlines</li>
          <li>Real-time word and character count</li>
        </ul>
        <ul className="list-disc list-inside space-y-1">
          <li>No signups, ads, or tracking</li>
          <li>Fast and lightweight design</li>
          <li>Optimized for desktop and mobile</li>
          <li>Free forever, no hidden fees</li>
        </ul>
      </div>
    </section>
  );
}
