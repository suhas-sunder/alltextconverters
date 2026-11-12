type WorkedExampleProps = {
  title: string;
  inputLabel: string;
  input: string;
  outputLabel: string;
  output: string;
};

export function WorkedExample({ title, inputLabel, input, outputLabel, output }: WorkedExampleProps) {
  return (
    <figure aria-labelledby="worked-example-title" className="space-y-2">
      <figcaption id="worked-example-title" className="font-semibold text-slate-900">{title}</figcaption>
      <dl className="grid gap-3 sm:grid-cols-2">
        {[[inputLabel, input], [outputLabel, output]].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg border border-slate-200 bg-white p-3">
            <dt className="mb-1 text-sm font-semibold text-slate-900">{label}</dt>
            <dd><pre className="whitespace-pre-wrap [overflow-wrap:anywhere] text-sm"><code>{value}</code></pre></dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
