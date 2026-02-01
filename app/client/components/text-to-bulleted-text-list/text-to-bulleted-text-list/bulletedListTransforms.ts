export type SplitMode = "lines" | "commas";

export type BulletMode =
  | "-"
  | "*"
  | "•"
  | "–"
  | "—"
  | ">"
  | "custom";

export type ConvertOptions = {
  splitMode: SplitMode;
  bullet: BulletMode;
  customBullet: string;
  trimItems: boolean;
  ignoreEmpty: boolean;
};

export type ConvertResult = {
  output: string;
  itemsIn: number;
  itemsOut: number;
  removedEmpty: number;
  splitMode: SplitMode;
  bulletUsed: string;
};

const PRINTABLE_BULLET_MAX = 6;

function normalizeLineEndings(s: string) {
  return s.replace(/\r\n?/g, "\n");
}

function safeBullet(bullet: BulletMode, customBullet: string) {
  if (bullet !== "custom") return bullet;
  const raw = (customBullet ?? "").trim();
  if (!raw) return "-";
  // Avoid long/ugly bullets. Keep it small and predictable.
  return raw.slice(0, PRINTABLE_BULLET_MAX);
}

function splitItems(input: string, mode: SplitMode) {
  const normalized = normalizeLineEndings(input || "");

  if (mode === "lines") {
    return normalized.split("\n");
  }

  // Comma mode: tolerant of pasted CSV-ish content.
  // Treat commas and newlines as separators.
  return normalized.split(/[,\n]/g);
}

export function toBulletedList(input: string, options: ConvertOptions): ConvertResult {
  const parts = splitItems(input, options.splitMode);
  const bullet = safeBullet(options.bullet, options.customBullet);

  let removedEmpty = 0;

  const cleaned = parts
    .map((p) => {
      const v = String(p ?? "");
      return options.trimItems ? v.trim() : v;
    })
    .filter((v) => {
      const keep = options.ignoreEmpty ? v.length > 0 : true;
      if (!keep) removedEmpty += 1;
      return keep;
    });

  const prefix = bullet ? `${bullet} ` : "";

  const output = cleaned.map((v) => `${prefix}${v}`).join("\n");

  return {
    output,
    itemsIn: parts.length,
    itemsOut: cleaned.length,
    removedEmpty,
    splitMode: options.splitMode,
    bulletUsed: bullet,
  };
}
