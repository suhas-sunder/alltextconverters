import { useState, useMemo } from "react";
import type { Route } from "./+types/home";

/* ──────────────────────────────
  SEO META
────────────────────────────── */
export const meta: Route.MetaFunction = () => [
  {
    title:
      "AllTextConverters, Convert, Format & Clean Text Online | Case, Base64 & Word Counter",
  },
  {
    name: "description",
    content:
      "Free online text converter for every format, instantly change case, clean text, encode or decode Base64, and count words or characters. Simple, fast, and private.",
  },
  {
    property: "og:title",
    content:
      "AllTextConverters, The Ultimate Free Online Text Converter & Word Counter",
  },
  {
    property: "og:description",
    content:
      "Instantly convert, format, and clean text. Change case, encode Base64, remove spaces, or count words, all done locally for privacy.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://alltextconverters.com" },
  {
    property: "og:image",
    content: "https://alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content:
      "AllTextConverters, Convert, Format & Count Text Instantly (Free Online Tool)",
  },
  {
    name: "twitter:description",
    content:
      "Powerful browser-based text converter with Base64 tools, word counter, and format cleaner, secure, fast, and ad-free.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://alltextconverters.com" },
];

/* ──────────────────────────────
  CONVERTERS
────────────────────────────── */
const converters: Record<string, (t: string) => string> = {
  UPPERCASE: (t) => t.toUpperCase(),
  lowercase: (t) => t.toLowerCase(),
  "Title Case": (t) => {
    const smallWords =
      /\b(a|an|and|as|at|but|by|for|if|in|of|on|or|the|to|with)\b/gi;
    return t
      .replace(
        /\b([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)\b/g,
        (_, first, rest) => first.toUpperCase() + rest.toLowerCase()
      )
      .replace(smallWords, (w) => w.toLowerCase());
  },

  "Capitalized Case": (t) => t.replace(/\b\w/g, (m) => m.toUpperCase()),
  "aLtErNaTiNg cAsE": (t) =>
    t
      .split("")
      .map((c, i) => (i % 2 ? c.toLowerCase() : c.toUpperCase()))
      .join(""),
  "InVeRsE CaSe": (t) =>
    [...t]
      .map((ch) =>
        ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
      )
      .join(""),
  "Sentence case": (t) =>
    t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase()),
  "Encode Base64": (t) => {
    try {
      const binary = new TextEncoder().encode(t);
      const base64 = btoa(String.fromCharCode(...binary));
      return base64;
    } catch {
      return "⚠️ Encoding failed. Check input text.";
    }
  },

  "Decode Base64": (t) => {
    try {
      const binary = atob(t);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return "⚠️ Invalid Base64 string.";
    }
  },
  "Trim & Clean": (t) => t.replace(/\s+/g, " ").trim(),
};

/* ──────────────────────────────
  STATS
────────────────────────────── */
function getStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const lines = text.split(/\r\n|\r|\n/).length;
  return { words, chars, lines };
}

/* ──────────────────────────────
  FAQ SECTION
────────────────────────────── */
function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What does AllTextConverters do?",
      a: "AllTextConverters lets you modify, clean, and count text instantly. You can change case, encode or decode Base64, remove spaces, and count words, all in your browser.",
    },
    {
      q: "Is it free and private?",
      a: "Yes. Everything runs locally on your device. Nothing is uploaded or saved, ensuring complete privacy and free access.",
    },
    {
      q: "What types of conversions can I do?",
      a: "You can convert between uppercase, lowercase, title case, alternating case, inverse case, Base64 encoding/decoding, and more.",
    },
    {
      q: "How do I count words and characters?",
      a: "The counter updates automatically while you type or paste. It shows total words, characters, and lines in real time.",
    },
    {
      q: "What does Trim & Clean do?",
      a: "Trim & Clean removes extra spaces, tabs, and line breaks, perfect for cleaning messy text copied from websites or PDFs.",
    },
    {
      q: "Can I use this on mobile?",
      a: "Yes, the site is fully responsive and works perfectly on phones, tablets, and desktops.",
    },
    {
      q: "Will more tools be added?",
      a: "Yes. JSON formatter, Markdown cleaner, URL encoder, ROT13, and text diff tools are coming soon.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      id="faq"
      className="mt-20 bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-6"
    >
      <h2 className="text-3xl font-bold text-slate-900 font-[Poppins] text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div
            key={i}
            className="border-b border-slate-200 pb-3 cursor-pointer transition-all"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <h3 className="font-semibold text-lg text-slate-800 flex justify-between items-center">
              {item.q}
              <span className="text-slate-500 text-sm">
                {openIndex === i ? "–" : "+"}
              </span>
            </h3>
            {openIndex === i && (
              <p className="mt-2 text-slate-700 leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}

/* ──────────────────────────────
  MAIN COMPONENT
────────────────────────────── */
export default function Index() {
  // ─── State ──────────────────────────────
  const [input, setInput] = useState("");
  const [prev, setPrev] = useState(""); // for undo
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stats = useMemo(() => getStats(input), [input]);

  // ─── Copy ──────────────────────────────
  const handleCopy = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
      setErrorMsg("Copy failed. Please try again.");
    }
  };

  // ─── Clear with undo support ──────────────
  const handleClear = () => {
    if (input) setPrev(input);
    setInput("");
    setErrorMsg(null);
  };

  // ─── Conversion ──────────────────────────────
  const handleConvert = (key: string) => {
    setErrorMsg(null);
    const fn = converters[key];
    if (!fn) return;

    try {
      const result = fn(input);
      if (typeof result === "string" && result.startsWith("⚠️")) {
        setErrorMsg(result.replace("⚠️", "").trim());
        return; // do not overwrite text
      }
      setPrev(input);
      setInput(result);
    } catch {
      setErrorMsg("Conversion failed. Please check your input.");
    }
  };

  // ─── Undo (optional) ──────────────────────────────
  const handleUndo = () => {
    if (prev) {
      setInput(prev);
      setPrev("");
      setErrorMsg(null);
    }
  };

  const btnColors = [
    "bg-sky-600 hover:bg-sky-700",
    "bg-indigo-600 hover:bg-indigo-700",
    "bg-teal-600 hover:bg-teal-700",
    "bg-amber-600 hover:bg-amber-700",
    "bg-fuchsia-600 hover:bg-fuchsia-700",
    "bg-rose-600 hover:bg-rose-700",
    "bg-lime-600 hover:bg-lime-700",
    "bg-cyan-600 hover:bg-cyan-700",
    "bg-blue-600 hover:bg-blue-700",
    "bg-emerald-600 hover:bg-emerald-700",
  ];

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      {/* HEADER */}
      <header className="bg-slate-900 text-white py-8 shadow">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-2">
          <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">
            All Text Converters
          </h1>
          <p className=" text-slate-200 mx-auto px-10 leading-relaxed">
            Clean, format, and count text in one click. Fast, free, and
            privacy-focused, everything runs in your browser.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-14">
        {/* Converter Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 space-y-8">
          {/* Unified Textarea */}
          <div>
            <label
              htmlFor="textInput"
              className="font-semibold text-slate-800 mb-2 block text-lg"
            >
              Text Editor
            </label>
            <textarea
              aria-label="Text editor input"
              id="textInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full min-h-[26rem] max-h-[52rem] p-4 border border-gray-300 rounded-md font-mono text-base leading-relaxed bg-white resize-y
         focus:outline-none focus:border-gray-400 hover:border-gray-400 transition-colors"
            />
          </div>

          {/* Counter Bar */}
          <div className="flex flex-wrap justify-start gap-8 text-base font-semibold bg-gray-50 px-6 py-4 rounded-md border border-gray-200 text-slate-800">
            <span className="flex items-center gap-2">
              📝 <span>Word Count:</span> {stats.words}
            </span>
            <span className="flex items-center gap-2">
              🔠 <span>Character Count:</span> {stats.chars}
            </span>
            <span className="flex items-center gap-2">
              📄 <span>Line Count:</span> {stats.lines}
            </span>
          </div>

          {/* Conversion Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.keys(converters).map((key, i) => (
              <button
                key={key}
                onClick={() => handleConvert(key)}
                className={`${btnColors[i % btnColors.length]} cursor-pointer text-white px-5 py-2 rounded-md text-sm font-semibold transition-all duration-150 active:scale-95 hover:brightness-110`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Error message (for invalid Base64, etc.) */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Utility Buttons */}
          <div className="flex flex-wrap gap-3 mt-3">
            <button
              onClick={handleCopy}
              disabled={!input}
              className={`px-5 py-2 rounded-md text-sm font-semibold text-white transition-all active:scale-95 ${
                input
                  ? "bg-slate-800 hover:bg-slate-900 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {copied ? "✓ Copied!" : "📋 Copy Text"}
            </button>
            <button
              onClick={() => {
                setErrorMsg(null);
                setInput("");
              }}
              className="px-5 py-2 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 cursor-pointer text-slate-800 transition-all active:scale-95"
            >
              🧹 Clear
            </button>
          </div>
        </div>

        {/* Useful Tools Card Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Other Helpful Tools You Might Need
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "📡",
                name: "MorseWords.com",
                url: "https://www.MorseWords.com",
                desc: "Translate text to Morse instantly, hear audio beeps, and learn patterns step by step. Fun learning for all ages.",
              },
              {
                emoji: "⌨️",
                name: "FreeTypingCamp.com",
                url: "https://www.FreeTypingCamp.com",
                desc: "Typing lessons and practice games with live accuracy and WPM tracking. Great for job prep or everyday improvement.",
              },
              {
                emoji: "🧩",
                name: "LearnWordGames.com",
                url: "https://www.LearnWordGames.com",
                desc: "Daily word puzzles, Wordle tips, vocabulary boosters, and skill-building games for brain training.",
              },
              {
                emoji: "💪",
                name: "AllFitnessCalculators.com",
                url: "https://www.AllFitnessCalculators.com",
                desc: "Nutrition, calorie and BMI calculators that help you stay on track with health goals without complicated apps.",
              },
              {
                emoji: "⏱️",
                name: "iLoveTimers.com",
                url: "https://www.iLoveTimers.com",
                desc: "Simple countdowns and Pomodoro focus timers, great for studying, workouts, and productivity sessions.",
              },
              {
                emoji: "🎓",
                name: "AllGPACalculators.com",
                url: "https://www.AllGPACalculators.com",
                desc: "Quick GPA calculators for universities across the world. Helpful for applications, transfers, and planning.",
              },
            ].map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{site.emoji}</span>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-slate-800">
                    {site.name}
                  </h3>
                </div>
                <p className="mt-3 text-slate-700 leading-relaxed text-base">
                  {site.desc}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-6">
          <h2 className="text-3xl font-bold font-[Poppins] text-slate-900">
            About AllTextConverters
          </h2>
          <p className="text-slate-700 leading-relaxed">
            <strong>AllTextConverters.com</strong> is your online toolbox for
            manipulating and analyzing text quickly. Convert cases, clean messy
            text, and count words, all processed locally for maximum privacy.
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
        {/* ──────────────────────────────
   SEO CONTENT SECTIONS
────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-10">
          <h2 className="text-3xl font-bold font-[Poppins] text-slate-900 text-center">
            Explore Every Conversion Tool
          </h2>
          <p className="text-slate-700 leading-relaxed text-center max-w-3xl mx-auto">
            AllTextConverters offers a complete range of tools for formatting,
            cleaning, and analyzing text. Below are all supported conversions,
            how they work, and examples that demonstrate what they do. Every
            conversion happens instantly in your browser, no data leaves your
            device.
          </p>

          {/* Uppercase */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              UPPERCASE Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Converts every letter in your text to uppercase. Commonly used in
              headlines, coding constants, and attention-grabbing text styles.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Input: <br /> "Convert me to uppercase" <br /> Output: <br />{" "}
              "CONVERT ME TO UPPERCASE"
            </p>
          </div>

          {/* Lowercase */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              lowercase Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Turns all text into lowercase, ideal for normalizing user input,
              cleaning email lists, or making data case-insensitive in scripts.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Input: <br /> "SIMPLE CASE FIXER" <br /> Output: <br /> "simple
              case fixer"
            </p>
          </div>

          {/* Title Case */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Title Case Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Capitalizes the first letter of each word. This format is widely
              used in article titles, book names, and UI button labels.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Input: <br /> "welcome to alltextconverters" <br /> Output: <br />{" "}
              "Welcome To Alltextconverters"
            </p>
          </div>

          {/* Capitalized Case */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Capitalized Case Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Similar to Title Case but smarter with spacing and punctuation.
              Great for resumes, headings, and formal writing where proper nouns
              need emphasis.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Input: <br /> "this is a better title example" <br /> Output:{" "}
              <br /> "This Is A Better Title Example"
            </p>
          </div>

          {/* Alternating Case */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              aLtErNaTiNg cAsE Generator
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Alternates between uppercase and lowercase letters for a playful
              or sarcastic effect. Often used in memes, social media captions,
              or stylized text art.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Input: <br /> "mocking text format" <br /> Output: <br /> "MoCkInG
              TeXt FoRmAt"
            </p>
          </div>

          {/* Inverse Case */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              InVeRsE CaSe Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Flips the case of every letter. Useful for toggling between
              stylized text formats or reversing mistakenly applied
              transformations.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Input: <br /> "eXaMpLe TeXt" <br /> Output: <br /> "ExAmPlE tExT"
            </p>
          </div>

          {/* Sentence Case */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Sentence case Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Makes the first letter of each sentence uppercase while keeping
              the rest lowercase. This is the preferred format for paragraphs,
              messages, and formal writing.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Input: <br /> "this is one sentence. this is another." <br />{" "}
              Output: <br /> "This is one sentence. This is another."
            </p>
          </div>

          {/* Base64 Encode */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Encode Base64 Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Base64 encoding converts binary or text data into a set of
              readable ASCII characters. It’s commonly used for embedding small
              files (like images or credentials) into JSON, HTML, or email
              content.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800 overflow-x-auto">
              Input: <br /> "Hello World" <br /> Output: <br />{" "}
              "SGVsbG8gV29ybGQ="
            </p>
          </div>

          {/* Base64 Decode */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Decode Base64 Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Decodes Base64 strings back into their original readable format.
              Essential for developers working with API tokens, encoded data, or
              web requests.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800 overflow-x-auto">
              Input: <br /> "U29mdHdhcmUgVGVzdA==" <br /> Output: <br />{" "}
              "Software Test"
            </p>
          </div>

          {/* Trim & Clean */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Trim & Clean Converter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Removes redundant spaces, tabs, and line breaks to produce clean,
              copy-ready text. This feature is especially helpful when pasting
              from PDFs, web pages, or email drafts.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800 overflow-x-auto">
              Input: <br /> " Too many spaces here. " <br /> Output: <br /> "Too
              many spaces here."
            </p>
          </div>

          {/* Word Counter */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Word & Character Counter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              The built-in word counter tracks the number of words, characters,
              and lines in real time as you type or paste text. Writers,
              students, and developers use it to meet platform limits or analyze
              readability quickly.
            </p>
            <p className="font-mono bg-slate-50 border rounded-lg p-3 text-sm text-slate-800">
              Example: <br /> Paste 200 words of text → shows 200 words, 1,200
              characters, 10 lines.
            </p>
          </div>

          {/* Why This Matters */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Why Text Conversion Matters
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Converting and cleaning text isn’t just about aesthetics, it
              improves readability, consistency, and data accuracy. From writing
              essays to preparing code or cleaning CSV data, the right case or
              spacing can make a big difference in professionalism and clarity.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>AllTextConverters.com</strong> is built to handle all
              these needs instantly, without tracking, ads, or logins. It’s one
              of the few tools that offers everything, case converters,
              formatters, Base64 utilities, and a real-time counter, in one
              place.
            </p>
          </div>
        </section>
        <section className="space-y-6 text-slate-800 leading-relaxed">
          <h2 className="text-3xl font-bold text-slate-900 font-[Poppins]">
            How Text Conversion Tools Simplify Writing and Data Cleaning
          </h2>
          <p>
            Online text converters have become essential for anyone who writes,
            edits, or works with data. Whether you're formatting essays,
            preparing blog posts, managing code snippets, or cleaning up raw
            data, a good text converter saves time and improves clarity.{" "}
            <strong>AllTextConverters.com</strong> was built to provide every
            major text transformation in one place, case conversion, Base64
            encoding and decoding, whitespace cleanup, and real-time word
            counting, all processed privately in your browser.
          </p>
          <p>
            Unlike traditional word processors that require several clicks or
            add-ons, AllTextConverters runs instantly. You can paste unformatted
            text, clean it, and reformat it for web, print, or programming use
            without losing your line breaks or punctuation. This speed and
            precision make it ideal for writers, students, coders, and content
            creators who handle text daily.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Everyday Use-Cases for Text Converters
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Writers and Bloggers:</strong> Convert case styles to
              match publication guidelines or optimize readability.
            </li>
            <li>
              <strong>Students:</strong> Clean essays or assignments before
              submitting, ensuring consistent spacing and professional
              presentation.
            </li>
            <li>
              <strong>Developers:</strong> Encode credentials or assets with
              Base64 for safe storage in JSON, HTML, or environment files.
            </li>
            <li>
              <strong>SEO professionals:</strong> Prepare meta descriptions,
              keyword lists, or content snippets with consistent casing and no
              hidden characters.
            </li>
            <li>
              <strong>Editors and Proofreaders:</strong> Quickly correct
              inconsistent capitalization across articles or manuscripts.
            </li>
            <li>
              <strong>Social media managers:</strong> Create stylized text like
              <em> aLtErNaTiNg cAsE </em> or <em>InVeRsE CaSe</em> for
              eye-catching captions.
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Why Clean and Consistent Text Matters
          </h3>
          <p>
            Every platform, from Google Docs to Twitter, displays and processes
            text differently. Extra spaces, hidden line breaks, or non-standard
            characters can cause formatting errors or reduce readability.
            Converting text ensures consistent casing, spacing, and encoding
            across platforms. For developers, it even prevents bugs caused by
            invisible characters in code or user input.
          </p>
          <p>
            A consistent writing format improves user experience, accessibility,
            and even SEO ranking. Proper casing helps search engines interpret
            titles correctly, while clean text reduces content bloat on web
            pages.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Advanced Conversions Explained
          </h3>
          <p>
            Beyond simple case changes, AllTextConverters supports Base64
            encoding and decoding, trimming, and sentence restructuring. These
            conversions help maintain clean data pipelines and readable
            documents. Here’s a deeper look at what each transformation does and
            when to use it.
          </p>

          <h4 className="text-xl font-semibold">Case Conversion Tools</h4>
          <p>
            Case converters are used to standardize capitalization across text.{" "}
            <strong>UPPERCASE</strong> is often used for emphasis, headers, or
            programming constants. <strong>lowercase</strong> normalizes text,
            making it uniform for data comparison or input processing.{" "}
            <strong>Title Case</strong> capitalizes the first letter of each
            word, perfect for titles and product names.{" "}
            <strong>Sentence case</strong> corrects paragraphs where the first
            word isn’t capitalized, restoring grammatical correctness
            automatically.
          </p>

          <h4 className="text-xl font-semibold">Playful and Visual Styles</h4>
          <p>
            Some converters, like <strong>aLtErNaTiNg cAsE</strong> and{" "}
            <strong>InVeRsE CaSe</strong>, are popular for stylistic social
            media posts, humor, or visual distinction. These formats can make
            otherwise plain messages stand out in chat apps, memes, or digital
            art. They’re fully reversible, so you can switch back to normal text
            at any time.
          </p>

          <h4 className="text-xl font-semibold">Whitespace & Cleaning Tools</h4>
          <p>
            The <strong>Trim & Clean</strong> converter is designed to remove
            redundant spaces, tabs, and stray line breaks, a common issue when
            copying from PDFs, emails, or word processors. Clean text ensures
            that what you paste into a CMS or code editor matches exactly what
            you see. It’s a simple but crucial step before publishing content or
            importing text into databases.
          </p>

          <h4 className="text-xl font-semibold">
            Base64 Encoding and Decoding
          </h4>
          <p>
            <strong>Base64 encoding</strong> transforms text or binary data into
            ASCII format. Developers rely on it for safely transmitting
            credentials, files, and media within systems that only accept text.{" "}
            <strong>Base64 decoding</strong> reverses that process, turning
            encoded strings back into readable data. For example, if an email
            attachment or API response includes a long alphanumeric block, it’s
            likely Base64, you can decode it instantly here to see what it
            contains.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Built for Privacy and Performance
          </h3>
          <p>
            Every conversion on AllTextConverters runs entirely in your browser.
            No text is uploaded, stored, or logged. This privacy-first design
            means you can process sensitive data, such as draft essays, code
            snippets, or business content, without any risk of exposure. The
            lightweight React and Vite architecture ensures everything loads in
            milliseconds, even on mobile.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Tips for Getting the Best Results
          </h3>
          <ul className="list-decimal pl-6 space-y-2">
            <li>
              Paste plain text, not rich text, to avoid hidden formatting.
            </li>
            <li>
              Use “Trim & Clean” before any conversion if the text was copied
              from a web page or PDF.
            </li>
            <li>
              Check word and character counts after trimming to ensure you meet
              limits for essays, tweets, or SEO descriptions.
            </li>
            <li>
              Use “Sentence case” for emails and paragraphs, it automatically
              capitalizes new sentences after punctuation.
            </li>
            <li>
              Encode short Base64 samples only; for large files, use dedicated
              encoders.
            </li>
            <li>
              If a Base64 decoding attempt shows an error, double-check that the
              input doesn’t contain line breaks or padding errors (“=” signs
              missing).
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Who Uses AllTextConverters?
          </h3>
          <p>
            Millions of professionals can benefit from instant text conversion.
            Writers rely on it for case-cleaning drafts. Programmers use Base64
            encoding for secure data exchange. Students use the word counter for
            assignment limits. Editors ensure all their articles follow
            consistent case and spacing rules. Because it runs offline in your
            browser, it’s perfect for quick formatting on the go.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            A Toolbox That Grows With You
          </h3>
          <p>
            The roadmap for <strong>AllTextConverters.com</strong> includes
            upcoming tools such as a JSON formatter, Markdown cleaner, URL
            encoder/decoder, text diff viewer, and ROT13 cipher. These additions
            will expand the platform into a complete suite of web-based writing
            and coding utilities, all without trackers, ads, or paywalls.
          </p>
          <p>
            Whether you’re drafting content, preparing documentation, or
            debugging web code, these tools ensure your text is clean,
            consistent, and ready for publication. Bookmark AllTextConverters
            today as your daily text companion.
          </p>
        </section>

        <section className="space-y-6 text-slate-800 leading-relaxed">
          <h2 className="text-3xl font-bold text-slate-900 font-[Poppins]">
            Beyond Simple Case Conversion, The Future of Universal Text Tools
          </h2>
          <p>
            Text isn’t just about words, it’s data, communication, and
            creativity.
            <strong> AllTextConverters.com </strong> is designed to become the
            internet’s most complete hub for working with any kind of text, from
            plain paragraphs to programming code, encrypted data, and creative
            expression. Over time, this platform will expand beyond formatting
            to include advanced text utilities like code converters,
            text-to-image generators, AI formatting assistants, and even
            real-time language tools.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            The Vision: Every Conversion in One Place
          </h3>
          <p>
            Our goal is simple, build a single, free space where anyone can
            transform text however they need. Instead of juggling different
            tools for uppercase, Morse code, JSON formatting, or Base64
            decoding, everything will live under one roof. This helps students,
            developers, and creators work faster without switching tabs or
            worrying about privacy.
          </p>
          <p>
            From everyday tasks like trimming and counting words to advanced
            operations such as encoding, syntax highlighting, or even converting
            text into imagery, <strong>AllTextConverters</strong> will handle it
            all in the same fast, browser-based environment, no downloads, no
            accounts, and no ads.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Upcoming Tool Categories
          </h3>
          <p>
            The expansion roadmap focuses on merging traditional text utilities
            with creative and technical conversions. Here’s what users can
            expect in the near future:
          </p>

          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>Code Converters:</strong> Transform snippets between
              programming languages, such as converting Python to JavaScript, C
              to C++, or JSON to YAML. Ideal for developers, students, and
              technical writers.
            </li>
            <li>
              <strong>Text to Image Tools:</strong> Generate styled typography,
              handwriting, or graphic posters directly from plain text. Perfect
              for designers and social media creators looking for instant
              visuals.
            </li>
            <li>
              <strong>Morse Code Translator:</strong> Built on the foundation of{" "}
              <em>MorseWords.com</em>, this will include bidirectional
              translation, real-time audio playback, and educational quizzes to
              learn Morse patterns interactively.
            </li>
            <li>
              <strong>Programming Formatters:</strong> Reformat messy code into
              beautiful syntax-highlighted blocks for easier sharing or
              documentation. JSON, HTML, CSS, and XML cleaners will be part of
              this toolkit.
            </li>
            <li>
              <strong>Encryption & Encoding Utilities:</strong> Tools to hash,
              encode, or safely convert strings (MD5, SHA-256, URL
              encode/decode, ROT13, Base32, Base85). Essential for developers
              and cybersecurity learners.
            </li>
            <li>
              <strong>AI-Enhanced Text Processing:</strong> Intelligent
              rewriting, summarizing, and tone-adjustment powered by on-device
              AI or optional secure cloud processing, always transparent and
              privacy-first.
            </li>
            <li>
              <strong>Language Utilities:</strong> Word counters, grammar
              correctors, and sentence-rewriters for improving clarity in
              essays, blog posts, or technical documentation.
            </li>
            <li>
              <strong>Creative Tools:</strong> Text-to-ASCII art, stylized
              letter generators, and meme caption creators for those who want to
              have fun with words.
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Who Benefits From These Expanding Tools?
          </h3>
          <p>
            The future of <strong>AllTextConverters</strong> isn’t just for one
            type of user, it’s built for everyone who interacts with text daily:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Students:</strong> Simplify research papers, citations,
              and essay formatting with sentence case, trimming, and line
              counting.
            </li>
            <li>
              <strong>Developers:</strong> Format, encode, and debug text data
              without leaving the browser. Coming tools like JSON prettifiers
              and Base encoders will streamline debugging.
            </li>
            <li>
              <strong>Writers and Marketers:</strong> Adjust tone and
              capitalization across multiple articles, product descriptions, or
              social captions.
            </li>
            <li>
              <strong>Designers:</strong> Convert text into images or
              typographic art for social posts and thumbnails instantly.
            </li>
            <li>
              <strong>Educators:</strong> Use Morse or code converters to
              demonstrate how information travels between digital formats and
              human-readable text.
            </li>
          </ul>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Privacy-First, Browser-Only Conversion
          </h3>
          <p>
            Just like the current version, every new tool will continue to run
            entirely in your browser. No text, code, or image data is ever
            uploaded or stored on servers. This client-side architecture ensures
            that even sensitive conversions, like passwords, code snippets, or
            proprietary drafts, remain 100% private.
          </p>
          <p>
            The entire site is optimized for speed using modern web technologies
            like React, Remix, and Vite. It’s mobile-friendly, lightweight, and
            fast even on older devices, ensuring accessibility for every user.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Building an Ecosystem of Smart Converters
          </h3>
          <p>
            The ultimate goal of <strong>AllTextConverters.com</strong> is to
            become the web’s{" "}
            <em>one-stop platform for everything text-related</em>. Instead of
            isolated tools, each converter will integrate smoothly with others.
            For example, you’ll be able to clean and format text, then send it
            directly to a code beautifier or text-to-image tool, all without
            losing your data or re-pasting content.
          </p>
          <p>
            This connected ecosystem will make it easy to transition between
            creative, educational, and technical workflows. Imagine typing a
            block of text, generating a stylized image from it, converting it
            into Morse, and sharing it online, all from the same browser tab.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Planned Integrations and Add-Ons
          </h3>
          <p>
            Future versions will feature integration with file uploads (TXT,
            CSV, JSON), downloadable outputs, and even an optional browser
            extension. This will let users clean or format selected text
            directly from context menus, turning AllTextConverters into a
            permanent everyday companion.
          </p>
          <p>
            A mobile app version is also planned to make on-the-go text
            conversion and formatting easier. The app will include offline
            support and a simplified interface focused on quick actions like
            counting, encoding, and trimming.
          </p>

          <h3 className="text-2xl font-semibold text-slate-900 mt-8">
            Why This Matters
          </h3>
          <p>
            The internet runs on text, from social media captions and code to
            emails and metadata. Having a single toolset that can convert,
            clean, visualize, and encode all those forms of text gives people
            more control over how they create and communicate. With more AI and
            automation emerging, the ability to format and verify your content
            manually becomes even more valuable.
          </p>

          <p>
            <strong>AllTextConverters.com</strong> aims to keep that control in
            your hands, fast, local, and free. Whether you’re converting an
            essay, encoding secure data, cleaning messy input, or turning words
            into creative images, it’s all about giving you flexible, powerful
            tools for every kind of text.
          </p>
        </section>

        {/* FAQ Section */}
        <FaqSection />
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 text-center py-8 mt-12">
        <p className="text-sm">
          © {new Date().getFullYear()} AllTextConverters.com, Free Browser
          Tools for Everyone.
        </p>
      </footer>
    </main>
  );
}
