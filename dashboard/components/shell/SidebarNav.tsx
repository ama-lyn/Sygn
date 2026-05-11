import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

type Item = {
  href: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  active?: boolean;
};

export function SidebarNav({ items }: { items: Item[] }) {
  return (
    <nav className="mt-6 space-y-1 px-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cx(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            item.active
              ? "bg-orange-50 text-orange-600"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
          )}
        >
          <span
            className={cx(
              "grid h-9 w-9 place-items-center rounded-xl",
              item.active ? "bg-orange-100" : "bg-transparent",
            )}
          >
            <Icon name={item.icon} className="h-5 w-5" />
          </span>
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

