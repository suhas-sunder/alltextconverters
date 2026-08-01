import { useMemo, useState } from "react";

const faqs = [
  ["What does AllTextConverters do?", "AllTextConverters provides focused utilities for text cleanup, case changes, structured text, encodings, lists, and counts. Each route explains its accepted input and output."],
  ["How is converter text processed?", "Conversions run in the current browser session. Copy and download happen only when you choose those actions; the Privacy Policy explains the surrounding site practices."],
  ["Which tool should I use for formatting removal?", "Use Plain Text Converter for presentational markup, Whitespace Cleaner for whitespace categories, or Line Break Remover when you need to join lines predictably."],
  ["How do character and byte counts differ?", "Character Counter reports visible-character metrics, while UTF-8 Byte Counter also reports bytes, code points, and UTF-16 code units for technical limits."],
  ["Where can I find every available tool?", "The complete canonical tool directory is in the footer. It lists the tools currently available rather than a speculative roadmap."],
] as const;

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const schema = useMemo(() => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }), []);
  return <section id="faq" className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8" aria-labelledby="home-faq-title"><h2 id="home-faq-title" className="text-2xl font-extrabold tracking-tight text-slate-900">Frequently asked questions</h2><div className="mt-4 divide-y divide-slate-200">{faqs.map(([question, answer], index) => <div key={question}><button type="button" className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}><span>{question}</span><span aria-hidden="true">{open === index ? "−" : "+"}</span></button>{open === index && <p className="pb-4 leading-7 text-slate-700">{answer}</p>}</div>)}</div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /></section>;
}
