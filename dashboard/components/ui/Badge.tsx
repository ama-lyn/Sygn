import * as React from "react";

type Props = {
  tone?: "neutral" | "success" | "danger" | "warning" | "info";
  className?: string;
  children: React.ReactNode;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({ tone = "neutral", className, children }: Props) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";
  const toneCls =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : tone === "danger"
        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
        : tone === "warning"
          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          : tone === "info"
            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
            : "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200";

  return <span className={cx(base, toneCls, className)}>{children}</span>;
}

