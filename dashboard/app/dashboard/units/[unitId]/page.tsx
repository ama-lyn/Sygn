import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/shell/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { getUnitById } from "@/lib/mock";

type Params = {
  unitId: string;
};

const enrolledStudents = [
  { name: "Emma Thompson", id: "S1029384", attendancePct: 95, status: "Good Standing" as const },
  { name: "James Wilson", id: "S1029385", attendancePct: 82, status: "Good Standing" as const },
  { name: "Oliver Brown", id: "S1029386", attendancePct: 45, status: "At Risk" as const },
];

const upcomingSessions = [
  {
    kind: "Lecture",
    title: "Introduction & Setup",
    when: "Today",
    time: "10:00 AM - 12:00 PM",
    where: "Room 302, Building A",
  },
  {
    kind: "Tutorial",
    title: "Lab Session 1",
    when: "Tomorrow",
    time: "2:00 PM - 4:00 PM",
    where: "Computer Lab 4",
  },
];

export default function UnitDetailsPage({ params }: { params: Params }) {
  const unit = getUnitById(params.unitId);
  if (!unit) notFound();

  return (
    <DashboardShell
      activeHref="/dashboard/units"
      topRight={
        <>
          <div className="hidden md:block w-[360px]">
            <Input
              placeholder="Search students..."
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
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/dashboard/units"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-700"
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
              My Units
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-100">
                {unit.code}
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {unit.title}
              </h1>
            </div>
            <div className="mt-1 text-sm text-zinc-500">
              {unit.semesterLabel} • {unit.campusLabel}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" leftIcon={<Icon name="export" className="h-4 w-4" />}>
              Export
            </Button>
            <Button leftIcon={<Icon name="attendance" className="h-4 w-4" />}>
              Take Attendance
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <CardBody className="grid gap-4 pt-6 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon name="user" className="h-5 w-5" />
                    </span>
                    <div className="text-sm font-medium text-zinc-500">Total Enrolled</div>
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-900">{unit.enrolledCount}</div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon name="attendance" className="h-5 w-5" />
                    </span>
                    <div className="text-sm font-medium text-zinc-500">Avg. Attendance</div>
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-900">{unit.avgAttendancePct}%</div>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon name="dashboard" className="h-5 w-5" />
                    </span>
                    <div className="text-sm font-medium text-zinc-500">At Risk</div>
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-zinc-900">{unit.atRiskCount}</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Enrolled Students"
                right={
                  <Link href="#" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                    View All
                  </Link>
                }
              />
              <CardBody>
                <div className="overflow-hidden rounded-2xl border border-zinc-100">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 text-xs font-semibold text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Student</th>
                        <th className="px-4 py-3 text-left">Student ID</th>
                        <th className="px-4 py-3 text-left">Attendance</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {enrolledStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-4 font-medium text-zinc-900">{s.name}</td>
                          <td className="px-4 py-4 text-zinc-500">{s.id}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100">
                                <div
                                  className="h-full rounded-full bg-orange-500"
                                  style={{ width: `${s.attendancePct}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-zinc-600">{s.attendancePct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge tone={s.status === "At Risk" ? "danger" : "success"}>
                              {s.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Upcoming Sessions" />
              <CardBody>
                <div className="relative pl-4">
                  <div className="absolute left-2 top-2 h-[calc(100%-8px)] w-px bg-zinc-200" />
                  <div className="space-y-5">
                    {upcomingSessions.map((s) => (
                      <div key={s.title} className="relative rounded-2xl border border-zinc-100 bg-white p-4">
                        <div className="absolute -left-[7px] top-6 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <Badge tone="info">{s.kind}</Badge>
                          <span>{s.when}</span>
                        </div>
                        <div className="mt-2 text-sm font-semibold text-zinc-900">{s.title}</div>
                        <div className="mt-2 text-xs text-zinc-500">{s.time}</div>
                        <div className="mt-1 text-xs text-zinc-500">{s.where}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <Button variant="outline" className="w-full">
                    View Full Schedule
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

