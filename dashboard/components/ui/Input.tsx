import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Input({
  className,
  left,
  right,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus-within:ring-2 focus-within:ring-orange-400",
        className,
      )}
    >
      {left ? <span className="text-zinc-400">{left}</span> : null}
      <input
        {...props}
        className="h-full w-full bg-transparent outline-none placeholder:text-zinc-400"
      />
      {right ? <span className="text-zinc-400">{right}</span> : null}
    </div>
  );
}

