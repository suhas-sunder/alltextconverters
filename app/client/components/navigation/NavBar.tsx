import logo from "../../assets/images/all-text-converters-logo.png";

export function Navbar() {
  return (
    <header className="bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
          {/* Brand */}
          <a href="/" className="flex items-center gap-3 cursor-pointer">
            <img
              src={logo}
              alt="All Text Converters logo"
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
            <div className="text-left">
              <div className="text-base font-bold text-white tracking-tight">
                AllTextConverters
              </div>
              <div className="text-xs text-sky-200 font-semibold">
                Fast, private browser-based text tools
              </div>
            </div>
          </a>

          {/* Nav links */}
          <nav className="flex items-center gap-5 text-sm">
            <a
              href="/"
              className="font-semibold transition-colors hover:text-sky-200 cursor-pointer"
            >
              Home
            </a>

            <a
              href="/word-counter"
              className="font-semibold transition-colors hover:text-sky-200 cursor-pointer"
            >
              Word Counter
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
