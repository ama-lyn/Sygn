import Link from "next/link";
import { DashboardShell } from "@/components/shell/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { absenceRequests, getAbsenceRequestById } from "@/lib/mock";

function statusTone(status: string) {
  switch (status) {
    case "Pending":
      return "warning";
    case "Approved":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "neutral";
  }
}

export default function AbsenceRequestsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const selectedIdRaw = searchParams?.id;
  const selectedId = Array.isArray(selectedIdRaw) ? selectedIdRaw[0] : selectedIdRaw;
  const fallback = absenceRequests[0]?.id;
  const selected = getAbsenceRequestById(selectedId ?? fallback ?? "") ?? absenceRequests[0] ?? null;

  return (
    <DashboardShell
      activeHref="/dashboard/absence-requests"
      topRight={
        <>
          <div className="hidden md:block w-[360px]">
            <Input
              placeholder="Search requests..."
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
            Absence Requests
          </h1>
          <div className="flex items-center gap-3">
            <button className="h-11 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Status: All
            </button>
            <button className="h-11 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Unit: All Units
            </button>
            <button className="h-11 rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Date: This Week
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Search requests..."
                left={<Icon name="search" className="h-5 w-5" />}
              />
              <button className="hidden md:flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                <Icon name="filter" className="h-4 w-4" />
                Sort
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {absenceRequests.map((r) => {
                const isActive = selected?.id === r.id;
                return (
                  <Link
                    key={r.id}
                    href={`/dashboard/absence-requests?id=${encodeURIComponent(r.id)}`}
                    className={[
                      "block rounded-2xl border p-4 transition-colors",
                      isActive
                        ? "border-orange-200 bg-orange-50/40 ring-1 ring-orange-100"
                        : "border-zinc-100 bg-white hover:bg-zinc-50/50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-zinc-100 text-zinc-700">
                          {r.studentName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-900">
                            {r.studentName}
                          </div>
                          <div className="truncate text-xs text-zinc-500">
                            {r.studentId} • {r.unitCode}
                          </div>
                        </div>
                      </div>
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    </div>

                    <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                      <div className="font-medium text-zinc-900">
                        Reason: {r.reasonTitle}
                      </div>
                      <div className="mt-1 line-clamp-2 text-zinc-600">
                        {r.reasonBody}
                      </div>
                      <div className="mt-2 text-[11px] text-zinc-400">
                        {r.attachments.length ? `${r.attachments.length} attachment${r.attachments.length === 1 ? "" : "s"}` : "No attachments"} • Submitted: {r.submittedLabel}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-zinc-100 text-zinc-700">
                      {selected.studentName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {selected.studentName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {selected.studentId} •{" "}
                        <Link href="#" className="font-medium text-orange-600 hover:text-orange-700">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                  <button className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50">
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-zinc-100 bg-white p-4">
                    <div className="text-[11px] font-semibold text-zinc-500">STATUS</div>
                    <div className="mt-2">
                      <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-100 bg-white p-4">
                    <div className="text-[11px] font-semibold text-zinc-500">SUBMITTED</div>
                    <div className="mt-2 text-sm font-semibold text-zinc-900">
                      {selected.submittedLabel}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-4">
                  <div className="text-[11px] font-semibold text-zinc-500">CLASS SESSION</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">
                    {selected.unitCode} • {selected.unitTitle}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    <div>Date &amp; Time</div>
                    <div className="mt-1 font-medium text-zinc-700">
                      {selected.dateLabel} • {selected.timeLabel}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-4">
                  <div className="text-[11px] font-semibold text-zinc-500">Reason for Absence</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">
                    {selected.reasonTitle}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600">
                    {selected.reasonBody}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-100 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-zinc-500">Evidence Provided</div>
                    <Badge tone="info">{selected.attachments.length} Files</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {selected.attachments.length ? (
                      selected.attachments.map((a) => (
                        <div
                          key={a.name}
                          className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-zinc-900">
                              {a.name}
                            </div>
                            <div className="text-xs text-zinc-500">{a.sizeLabel}</div>
                          </div>
                          <button className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                            View
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-zinc-500">No attachments</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    Reject
                  </Button>
                  <Button className="w-full">Approve</Button>
                </div>

                <div className="text-xs text-zinc-400">
                  Approve/Reject are mock actions for now.
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-500">No request selected.</div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

