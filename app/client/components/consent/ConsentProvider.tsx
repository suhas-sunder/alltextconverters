import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ConsentCategory = "essential" | "analytics" | "advertising";

type ConsentChoices = Record<ConsentCategory, boolean>;

type ConsentContextValue = {
  choices: ConsentChoices;
  ready: boolean;
  preferencesOpen: boolean;
  canLoad: (category: Exclude<ConsentCategory, "essential">) => boolean;
  saveChoices: (choices: Partial<ConsentChoices>) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const STORAGE_KEY = "atc-consent-v1";
const defaultChoices: ConsentChoices = {
  essential: true,
  analytics: false,
  advertising: false,
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choices, setChoices] = useState<ConsentChoices>(defaultChoices);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ConsentChoices>;
        setChoices({ ...defaultChoices, ...parsed, essential: true });
      } else {
        setPreferencesOpen(true);
      }
    } catch {
      setPreferencesOpen(true);
    } finally {
      setReady(true);
    }
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      choices,
      ready,
      preferencesOpen,
      canLoad: (category) => choices[category] === true,
      saveChoices: (next) => {
        const saved = { ...choices, ...next, essential: true };
        setChoices(saved);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch {
          // Essential local tools remain usable if local storage is unavailable.
        }
        setPreferencesOpen(false);
      },
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [choices, preferencesOpen, ready],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used inside ConsentProvider");
  return context;
}

export function ConsentBanner() {
  const { choices, preferencesOpen, ready, saveChoices, closePreferences } = useConsent();
  const [analytics, setAnalytics] = useState(choices.analytics);
  const [advertising, setAdvertising] = useState(choices.advertising);

  useEffect(() => {
    setAnalytics(choices.analytics);
    setAdvertising(choices.advertising);
  }, [choices]);

  if (!ready || !preferencesOpen) return null;

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
    >
      <h2 id="consent-title" className="text-base font-semibold text-slate-900">
        Privacy preferences
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        Converter text stays in your browser for supported local tools. Optional
        analytics and advertising are off unless you choose them. You can change
        this choice later from the footer.
      </p>
      <fieldset className="mt-4 space-y-3 text-sm text-slate-700">
        <legend className="sr-only">Optional privacy choices</legend>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked disabled className="mt-1" />
          <span><strong>Essential storage</strong><br />Keeps the site and your saved consent choice working.</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1" />
          <span><strong>Analytics</strong><br />Optional technical measurement. It must never include converter input or output.</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={advertising} onChange={(event) => setAdvertising(event.target.checked)} className="mt-1" />
          <span><strong>Advertising</strong><br />Allows future advertising integrations. No ad-network code is loaded today.</span>
        </label>
      </fieldset>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => saveChoices({ analytics: false, advertising: false })} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Essential only</button>
        <button type="button" onClick={() => saveChoices({ analytics, advertising })} className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">Save choices</button>
        <button type="button" onClick={closePreferences} className="min-h-11 px-2 text-sm font-medium text-slate-600 underline underline-offset-4">Close</button>
      </div>
    </section>
  );
}

export function ConsentPreferencesButton() {
  const { openPreferences } = useConsent();
  return (
    <button type="button" onClick={openPreferences} className="hover:text-white hover:underline underline-offset-4">
      Privacy choices
    </button>
  );
}
