import Link from "next/link";
import { DashboardShell } from "@/components/shell/DashboardShell";
import { WeeklyAttendanceChart } from "@/components/charts/WeeklyAttendanceChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { absenceRequests, lecturer, upcomingClasses, units, weeklyAttendance } from "@/lib/mock";

export default function DashboardOverviewPage() {
  const totalStudents = units.reduce((sum, u) => sum + u.enrolledCount, 0);
  const avgAttendance = Math.round(
    units.reduce((sum, u) => sum + u.avgAttendancePct, 0) / Math.max(1, units.length),
  );
  const pending = absenceRequests.filter((r) => r.status === "Pending").slice(0, 3);

  return (
    <DashboardShell
      activeHref="/dashboard"
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
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex flex-col">
                  <span className="text-lg">Welcome back, {lecturer.name}</span>
                  <span className="mt-1 text-sm font-normal text-zinc-500">
                    Here's what's happening with your classes today.
                  </span>
                </div>
              }
              right={
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" href="/dashboard/units">
                    View Units
                  </Button>
                  <Button variant="outline" size="sm" href="/dashboard/absence-requests">
                    View Requests
                  </Button>
                </div>
              }
            />
            <CardBody className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon name="user" className="h-5 w-5" />
                  </span>
                  <div className="text-sm font-medium text-zinc-500">Total Students</div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-3xl font-semibold text-zinc-900">{totalStudents}</div>
                  <Badge tone="success">+12%</Badge>
                </div>
                <div className="mt-1 text-xs text-zinc-400">vs last semester</div>
              </div>

              <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon name="attendance" className="h-5 w-5" />
                  </span>
                  <div className="text-sm font-medium text-zinc-500">Avg. Attendance</div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-3xl font-semibold text-zinc-900">{avgAttendance}%</div>
                  <Badge tone="danger">-2.4%</Badge>
                </div>
                <div className="mt-1 text-xs text-zinc-400">vs last week</div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Weekly Attendance Overview"
              right={
                <button className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                  This Week
                </button>
              }
            />
            <CardBody>
              <div className="rounded-2xl bg-orange-50/40 p-4 ring-1 ring-orange-100">
                <WeeklyAttendanceChart data={weeklyAttendance} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  Present (89%)
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  Absent (7%)
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  Late (4%)
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Upcoming Classes"
              right={
                <Link href="/dashboard/units" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  View Schedule
                </Link>
              }
            />
            <CardBody className="space-y-4">
              {upcomingClasses.map((c, idx) => (
                <div key={c.id} className="rounded-2xl border border-zinc-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {idx === 0 ? (
                        <Badge tone="warning" className="mb-2">
                          In 30 mins
                        </Badge>
                      ) : null}
                      <div className="text-sm font-semibold text-zinc-900">
                        {c.unitCode} - {c.title}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-zinc-500">
                        <span className="font-medium text-zinc-900">{c.timeLabel}</span>
                        <span>{c.durationLabel}</span>
                      </div>
                      <div className="mt-2 text-xs text-zinc-500">{c.metaLabel}</div>
                    </div>
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
                      <Icon name={c.actionLabel === "Join link" ? "export" : "play"} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  Pending Requests
                  <Badge tone="warning">{pending.length}</Badge>
                </div>
              }
              right={
                <Link href="/dashboard/absence-requests" className="text-sm font-medium text-zinc-500 hover:text-zinc-700">
                  View All
                </Link>
              }
            />
            <CardBody className="space-y-4">
              {pending.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-zinc-700">
                    {r.studentName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-zinc-900">
                      {r.studentName}
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {r.reasonTitle} • {r.unitCode}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">{r.submittedLabel}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100">
                      <Icon name="check" className="h-4 w-4" />
                    </button>
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-xs text-zinc-400">
                Mock actions only — backend integration will come later.
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

