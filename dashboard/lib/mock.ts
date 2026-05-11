import type {
  AbsenceRequest,
  AttendancePoint,
  AttendanceRecord,
  UpcomingClass,
  Unit,
} from "@/lib/types";

export const lecturer = {
  name: "Dr. Alan Smith",
  department: "Computer Science",
};

export const units: Unit[] = [
  {
    id: "cs101",
    code: "CS101",
    title: "Introduction to Programming",
    semesterLabel: "Semester 1, 2024",
    campusLabel: "Main Campus",
    enrolledCount: 124,
    nextClassLabel: "Today, 10:00 AM",
    locationLabel: "Room 302, Building A",
    avgAttendancePct: 86,
    atRiskCount: 12,
  },
  {
    id: "cs204",
    code: "CS204",
    title: "Data Structures & Algorithms",
    semesterLabel: "Semester 1, 2024",
    campusLabel: "Main Campus",
    enrolledCount: 86,
    nextClassLabel: "Today, 1:00 PM",
    locationLabel: "Online (Zoom)",
    deliveryLabel: "Online (Zoom)",
    avgAttendancePct: 90,
    atRiskCount: 7,
  },
  {
    id: "cs301",
    code: "CS301",
    title: "Advanced Algorithms",
    semesterLabel: "Semester 1, 2024",
    campusLabel: "Main Campus",
    enrolledCount: 62,
    nextClassLabel: "Tomorrow, 9:00 AM",
    locationLabel: "Lab 4, Building B",
    avgAttendancePct: 84,
    atRiskCount: 9,
  },
  {
    id: "cs405",
    code: "CS405",
    title: "Machine Learning",
    semesterLabel: "Semester 1, 2024",
    campusLabel: "City Campus",
    enrolledCount: 45,
    nextClassLabel: "Thu, 2:00 PM",
    locationLabel: "Room 105, Tech Hub",
    avgAttendancePct: 88,
    atRiskCount: 4,
  },
];

export const upcomingClasses: UpcomingClass[] = [
  {
    id: "u1",
    unitCode: "CS101",
    title: "Intro to Programming",
    timeLabel: "10:00 AM",
    durationLabel: "2 hrs",
    metaLabel: "Room 302, Building A",
    actionLabel: "Open",
  },
  {
    id: "u2",
    unitCode: "CS204",
    title: "Data Structures",
    timeLabel: "1:00 PM",
    durationLabel: "1.5 hrs",
    metaLabel: "Online (Zoom)",
    actionLabel: "Join link",
  },
  {
    id: "u3",
    unitCode: "CS301",
    title: "Algorithms",
    timeLabel: "3:30 PM",
    durationLabel: "2 hrs",
    metaLabel: "Lab 4, Building B",
    actionLabel: "Open",
  },
];

export const weeklyAttendance: AttendancePoint[] = [
  { day: "Mon", presentPct: 86, absentPct: 10, latePct: 4 },
  { day: "Tue", presentPct: 89, absentPct: 7, latePct: 4 },
  { day: "Wed", presentPct: 88, absentPct: 8, latePct: 4 },
  { day: "Thu", presentPct: 92, absentPct: 5, latePct: 3 },
  { day: "Fri", presentPct: 89, absentPct: 7, latePct: 4 },
];

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "r1",
    dateLabel: "Oct 24, 2024",
    timeLabel: "10:00 AM - 12:00 PM",
    studentName: "Emma Thompson",
    studentId: "S1029384",
    unitCode: "CS101",
    unitSessionLabel: "Lecture • Week 4",
    status: "Present",
    notes: "",
  },
  {
    id: "r2",
    dateLabel: "Oct 24, 2024",
    timeLabel: "10:00 AM - 12:00 PM",
    studentName: "James Wilson",
    studentId: "S1029385",
    unitCode: "CS101",
    unitSessionLabel: "Lecture • Week 4",
    status: "Absent",
    notes: "No show, unexcused",
  },
  {
    id: "r3",
    dateLabel: "Oct 24, 2024",
    timeLabel: "10:00 AM - 12:00 PM",
    studentName: "Oliver Brown",
    studentId: "S1029386",
    unitCode: "CS101",
    unitSessionLabel: "Lecture • Week 4",
    status: "Late",
    notes: "Arrived 15m late",
  },
  {
    id: "r4",
    dateLabel: "Oct 23, 2024",
    timeLabel: "2:00 PM - 4:00 PM",
    studentName: "Sophia Davis",
    studentId: "S1029387",
    unitCode: "CS202",
    unitSessionLabel: "Lab • Session 2",
    status: "Excused",
    notes: "Medical certificate provided",
  },
];

export const absenceRequests: AbsenceRequest[] = [
  {
    id: "a1",
    studentName: "Emma Thompson",
    studentId: "S1029384",
    unitCode: "CS101",
    unitTitle: "Intro to Programming",
    dateLabel: "Oct 24, 2024",
    timeLabel: "10:00 AM - 12:00 PM",
    reasonTitle: "Medical Appointment",
    reasonBody:
      "I have a scheduled dental surgery that morning (wisdom tooth extraction) and will not be able to attend the lecture or the subsequent lab session. I have attached the appointment confirmation from my oral surgeon.\n\nI will catch up on the lecture recordings and notes.",
    status: "Pending",
    submittedLabel: "Oct 22, 2024",
    attachments: [{ name: "appointment_confirmation.pdf", sizeLabel: "1.2 MB" }],
  },
  {
    id: "a2",
    studentName: "Sophia Davis",
    studentId: "S1029387",
    unitCode: "CS202",
    unitTitle: "Discrete Math",
    dateLabel: "Oct 23, 2024",
    timeLabel: "2:00 PM - 4:00 PM",
    reasonTitle: "Illness",
    reasonBody: "Severe flu symptoms, doctor recommended rest.",
    status: "Approved",
    submittedLabel: "Oct 21, 2024",
    attachments: [{ name: "medical_note.pdf", sizeLabel: "740 KB" }],
  },
  {
    id: "a3",
    studentName: "James Wilson",
    studentId: "S1029385",
    unitCode: "CS101",
    unitTitle: "Intro to Programming",
    dateLabel: "Oct 21, 2024",
    timeLabel: "10:00 AM - 12:00 PM",
    reasonTitle: "Personal Travel",
    reasonBody: "Family vacation booked prior to term start.",
    status: "Rejected",
    submittedLabel: "Oct 19, 2024",
    attachments: [],
  },
];

export function getUnitById(unitId: string) {
  return units.find((u) => u.id === unitId) ?? null;
}

export function getAbsenceRequestById(requestId: string) {
  return absenceRequests.find((r) => r.id === requestId) ?? null;
}
