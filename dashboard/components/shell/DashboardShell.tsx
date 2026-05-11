import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SidebarNav } from "@/components/shell/SidebarNav";
import { lecturer } from "@/lib/mock";

export function DashboardShell({
  activeHref,
  topRight,
  children,
}: {
  activeHref: "/dashboard" | "/dashboard/units" | "/dashboard/attendance" | "/dashboard/absence-requests";
  topRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  const items = [
    { href: "/dashboard", label: "Dashboard\nOverview", icon: "dashboard" as const },
    { href: "/dashboard/units", label: "My Units", icon: "units" as const },
    { href: "/dashboard/attendance", label: "Attendance Records", icon: "attendance" as const },
    { href: "/dashboard/absence-requests", label: "Absence Requests", icon: "requests" as const },
  ].map((i) => ({ ...i, label: i.label.replace("\n", " "), active: i.href === activeHref }));

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6">
        <aside className="hidden w-[260px] shrink-0 lg:block">
          <div className="sticky top-6 rounded-3xl border border-zinc-100 bg-white px-3 py-4 shadow-sm">
            <div className="flex items-center gap-3 px-3">
              <span className="grid h-10 w-10 place-items-center">
                <Icon name="logo" className="h-10 w-10" />
              </span>
              <div className="text-sm font-semibold text-zinc-900">Sygn</div>
            </div>

            <SidebarNav items={items} />

            <div className="mt-8 px-3 pb-2">
              <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-zinc-200">
                  <Icon name="user" className="h-5 w-5 text-zinc-700" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900">
                    {lecturer.name}
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {lecturer.department}
                  </div>
                </div>
                <span className="ml-auto text-zinc-400">
                  <Icon name="chevronRight" className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <Link href="/dashboard" className="grid h-10 w-10 place-items-center">
                <Icon name="logo" className="h-10 w-10" />
              </Link>
              <div className="text-sm font-semibold text-zinc-900">Sygn</div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {topRight}
            </div>
          </div>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

