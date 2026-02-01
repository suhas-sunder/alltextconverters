function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-4">
      <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] text-slate-900">
        {title}
      </h2>
      <div className="text-slate-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function AboutScope() {
  return (
    <Card title="What this is, and what it is not">
      <p>
        <strong>What this is:</strong> a collection of practical text utilities you can use instantly.
        Tools are designed around common tasks like case conversion (uppercase, lowercase, title case,
        sentence case), whitespace cleanup, line break removal, list sorting and deduplication, encoding
        and decoding (Base64, URL encode/decode), and working with structured formats like JSON, XML, and HTML.
      </p>
      <p>
        <strong>What this is not:</strong> a course platform, an AI writing app, or a blog disguised as a tool.
        The site avoids “content farm” behavior (pages padded with filler, gated results, or aggressive popups).
        If a page exists, it exists to run a tool.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <ul className="list-disc list-inside space-y-1">
          <li>Case converters and text formatters</li>
          <li>Word and character counters</li>
          <li>Whitespace and line cleanup tools</li>
          <li>List, table, and CSV-style helpers</li>
        </ul>
        <ul className="list-disc list-inside space-y-1">
          <li>Base64 and URL encoding/decoding</li>
          <li>JSON/XML/HTML conversion helpers</li>
          <li>Sorting and deduplication tools</li>
          <li>Simple, predictable copy in → copy out</li>
        </ul>
      </div>
      <p>
        If you ever feel like a tool site is trying to “trap” you with unnecessary steps, that’s the exact opposite of the design
        goal here.
      </p>
    </Card>
  );
}
