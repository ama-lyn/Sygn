import { DashboardShell } from "@/components/shell/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { attendanceRecords, units } from "@/lib/mock";

function statusTone(status: string) {
  switch (status) {
    case "Present":
      return "success";
    case "Absent":
      return "danger";
    case "Late":
      return "warning";
    case "Excused":
      return "info";
    default:
      return "neutral";
  }
}

export default function AttendanceRecordsPage() {
  const totalStudents = units.reduce((sum, u) => sum + u.enrolledCount, 0);
  const avgPresent = Math.round(
    units.reduce((sum, u) => sum + u.avgAttendancePct, 0) / Math.max(1, units.length),
  );
  const avgAbsent = 8;
  const avgLate = 3;

  return (
    <DashboardShell
      activeHref="/dashboard/attendance"
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
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Attendance Records
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-medium text-zinc-500">Total Students</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-900">{totalStudents}</div>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-medium text-zinc-500">Avg. Present</div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-3xl font-semibold text-zinc-900">{avgPresent}%</div>
              <Badge tone="success">✓</Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-medium text-zinc-500">Avg. Absent</div>
            <div className="mt-2 flex items-end gap-2">
              <div className="text-3xl font-semibold text-zinc-900">{avgAbsent}%</div>
              <Badge tone="danger">×</Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-medium text-zinc-500">Late / Excused</div>
            <div className="mt-2 text-3xl font-semibold text-zinc-900">{avgLate}%</div>
          </div>
        </div>

        <Card>
          <CardBody className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200">
                {["All Records", "Pending Update", "At Risk"].map((t, idx) => (
                  <button
                    key={t}
                    className={[
                      "px-4 py-2 text-sm font-medium rounded-2xl transition-colors",
                      idx === 0 ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon name="upload" className="h-4 w-4" />}
                >
                  Upload CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon name="download" className="h-4 w-4" />}
                >
                  Export
                </Button>
                <Button size="sm" leftIcon={<Icon name="check" className="h-4 w-4" />}>
                  Mark Present
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
              <Input
                placeholder="Search by student, ID..."
                left={<Icon name="search" className="h-5 w-5" />}
              />
              <button className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-600 hover:bg-zinc-50">
                All Units
              </button>
              <button className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-600 hover:bg-zinc-50">
                Date Range
              </button>
              <button className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm text-zinc-600 hover:bg-zinc-50">
                Status
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-100">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-xs font-semibold text-zinc-500">
                  <tr>
                    <th className="w-10 px-4 py-3 text-left">
                      <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
                    </th>
                    <th className="px-4 py-3 text-left">Date &amp; Time</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Unit / Session</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {attendanceRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-zinc-900">{r.dateLabel}</div>
                        <div className="text-xs text-zinc-500">{r.timeLabel}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-zinc-900">{r.studentName}</div>
                        <div className="text-xs text-zinc-500">{r.studentId}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-zinc-900">{r.unitCode}</div>
                        <div className="text-xs text-zinc-500">{r.unitSessionLabel}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-4 text-zinc-500">{r.notes || "—"}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <button className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50">
                            <span className="text-lg leading-none">⋮</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing 1 to {attendanceRecords.length} of 482 records</div>
              <div className="flex items-center gap-2">
                <button className="h-9 rounded-full border border-zinc-200 bg-white px-4 font-medium text-zinc-700 hover:bg-zinc-50">
                  Previous
                </button>
                <button className="h-9 rounded-full border border-zinc-200 bg-white px-4 font-medium text-zinc-700 hover:bg-zinc-50">
                  Next
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}

