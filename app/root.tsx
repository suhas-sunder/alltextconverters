import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect, // ⟵ add this
} from "react-router";

import type { Route } from "./+types/root";
import { useLocation } from "react-router";
import "./app.css";
import { Footer } from "./client/components/navigation/Footer";
import { Navbar } from "./client/components/navigation/NavBar";
import { HelpfulToolsSection } from "./client/components/navigation/HelpfulToolsSection";
import { AdSlot } from "./client/components/advertising/AdSlot";
import {
  ConsentBanner,
  ConsentProvider,
} from "./client/components/consent/ConsentProvider";
import {
  canonicalUrl,
  isCanonicalPath,
  isIndexablePath,
  normalizePathname,
} from "./site-config";

/* ---------- Trailing slash helpers (one place, app-level) ---------- */
function needsStrip(pathname: string) {
  if (pathname === "/") return false;
  if (!/\/+$/.test(pathname)) return false;
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(last);
  return !looksLikeFile;
}
function strip(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

/* ---------- Loader does the canonical 301 ---------- */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  if (needsStrip(url.pathname)) {
    url.pathname = strip(url.pathname);
    return redirect(url.pathname + url.search, { status: 301 });
  }
  return null;
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = ({ location }) => {
  const pathname = normalizePathname(location.pathname);
  if (!isCanonicalPath(pathname)) {
    return [{ name: "robots", content: "noindex,nofollow" }];
  }

  return [
    {
      tagName: "link",
      rel: "canonical",
      href: canonicalUrl(pathname),
    },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-w-[320px]">
        <ConsentProvider>
          <a
            href="#main-content"
            className="sr-only fixed left-4 top-4 z-[60] rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 shadow focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            Skip to content
          </a>
          <Navbar />
          <AdSlot placement="top-banner" className="mx-auto my-4 max-w-[970px]" />
          <SiteFrame>{children}</SiteFrame>
          <HelpfulToolsSection />
          <Footer />
          <ConsentBanner />
          <ScrollRestoration />
          <Scripts />
        </ConsentProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function SiteFrame({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const renderSidebars =
    isIndexablePath(pathname) && pathname !== "/about" && pathname !== "/contact";

  if (!renderSidebars) {
    return (
      <div id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        {children}
      </div>
    );
  }

  return (
    <div className="min-[1800px]:grid min-[1800px]:grid-cols-[minmax(160px,1fr)_minmax(0,1180px)_minmax(160px,1fr)] min-[1800px]:gap-6">
      <aside className="hidden min-[1800px]:block pt-8" aria-label="Left advertisement area">
        <AdSlot placement="left-sidebar" className="sticky top-6 ml-auto" />
      </aside>
      <div id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        {children}
      </div>
      <aside className="hidden min-[1800px]:block pt-8" aria-label="Right advertisement area">
        <AdSlot placement="right-sidebar" className="sticky top-6 mr-auto" />
      </aside>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
