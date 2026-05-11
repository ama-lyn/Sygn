import Link from "next/link";
import { DashboardShell } from "@/components/shell/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { units } from "@/lib/mock";

export default function UnitsPage() {
  return (
    <DashboardShell
      activeHref="/dashboard/units"
      topRight={
        <>
          <div className="hidden md:block w-[360px]">
            <Input
              placeholder="Search units, students..."
              left={<Icon name="search" className="h-5 w-5" />}
            />
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50">
            <Icon name="bell" className="h-5 w-5" />
          </button>
          <Button variant="secondary" href="/dashboard/attendance">
            Take Attendance
          </Button>
        </>
      }
    >
      <Card>
        <CardHeader
          title="My Units"
          right={
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                <Icon name="filter" className="h-4 w-4" />
                Filters
              </button>
            </div>
          }
        />
        <CardBody>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by unit code or title..."
                left={<Icon name="search" className="h-5 w-5" />}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 lg:w-[520px]">
              <button className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-600 hover:bg-zinc-50">
                All Semesters
              </button>
              <button className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-600 hover:bg-zinc-50">
                All Campuses
              </button>
              <button className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-600 hover:bg-zinc-50">
                Any Day
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {units.map((u) => (
              <div
                key={u.id}
                className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-100">
                      {u.code}
                    </span>
                    <div className="mt-3 text-lg font-semibold text-zinc-900">
                      {u.title}
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      {u.semesterLabel} • {u.campusLabel}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                    <Icon name="user" className="h-4 w-4" />
                    {u.enrolledCount} Enrolled
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200">
                      <Icon name="attendance" className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-xs text-zinc-500">Next Class</div>
                      <div className="font-medium text-zinc-900">
                        {u.nextClassLabel}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200">
                      <Icon name="dashboard" className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-xs text-zinc-500">Location</div>
                      <div className="font-medium text-zinc-900">
                        {u.locationLabel}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    href={`/dashboard/units/${u.id}`}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-xs text-zinc-400">
            Showing {units.length} units (mock data).
            <span className="ml-2">
              Tip: open{" "}
              <Link
                href="/dashboard/units/cs101"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                CS101 details
              </Link>
              .
            </span>
          </div>
        </CardBody>
      </Card>
    </DashboardShell>
  );
}

