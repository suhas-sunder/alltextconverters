import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8">
      <div className="mx-auto max-w-[1180px] px-4">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <nav aria-label="Footer links" className="text-sm">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <p className="text-sm text-slate-300">
            © {new Date().getFullYear()} AllTextConverters.com, Free Browser
            Tools for Everyone.
          </p>
        </div>
      </div>
    </footer>
  );
}
