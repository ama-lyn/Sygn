export type Unit = {
  id: string;
  code: string;
  title: string;
  semesterLabel: string;
  campusLabel: string;
  enrolledCount: number;
  nextClassLabel: string;
  locationLabel: string;
  deliveryLabel?: string;
  avgAttendancePct: number;
  atRiskCount: number;
};

export type UpcomingClass = {
  id: string;
  unitCode: string;
  title: string;
  timeLabel: string;
  durationLabel: string;
  metaLabel: string;
  actionLabel: string;
};

export type AttendancePoint = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  presentPct: number;
  absentPct: number;
  latePct: number;
};

export type AttendanceRecord = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  studentName: string;
  studentId: string;
  unitCode: string;
  unitSessionLabel: string;
  status: "Present" | "Absent" | "Late" | "Excused";
  notes: string;
};

export type AbsenceRequest = {
  id: string;
  studentName: string;
  studentId: string;
  unitCode: string;
  unitTitle: string;
  dateLabel: string;
  timeLabel: string;
  reasonTitle: string;
  reasonBody: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedLabel: string;
  attachments: { name: string; sizeLabel: string }[];
};
