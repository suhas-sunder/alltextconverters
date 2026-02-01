import type { ReactNode } from "react";

type ChipButtonProps = {
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "base" | "primary";
  ariaLabel: string;
  children: ReactNode;
  title?: string;
};

export function ChipButton({
  onClick,
  active = false,
  disabled,
  variant = "base",
  ariaLabel,
  children,
  title,
}: ChipButtonProps) {
  const base =
    "cursor-pointer inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 shadow-sm transition select-none";
  const baseEnabled =
    "bg-white text-slate-800 ring-slate-200 hover:ring-sky-200 hover:bg-sky-50";
  const baseActive =
    "bg-sky-50 text-slate-900 ring-sky-300";
  const baseDisabled =
    "bg-white text-slate-400 ring-slate-200 cursor-not-allowed";

  const primaryEnabled =
    "bg-sky-600 text-white ring-sky-600 hover:bg-sky-700 hover:ring-sky-700";
  const primaryDisabled =
    "bg-sky-200 text-white ring-sky-200 cursor-not-allowed";

  const cls =
    variant === "primary"
      ? `${base} ${disabled ? primaryDisabled : primaryEnabled}`
      : `${base} ${disabled ? baseDisabled : active ? baseActive : baseEnabled}`;

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        if (disabled) return;
        // Keep editor selection when clicking toolbar buttons.
        e.preventDefault();
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cls}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}
