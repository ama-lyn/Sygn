import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

// ── Token helpers ─────────────────────────────────────────────
export const getToken = () => AsyncStorage.getItem('token');
export const clearSession = () => AsyncStorage.multiRemove(['token', 'student_id', 'full_name']);

async function authHeaders() {
  const token = await getToken();
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function get(path: string) {
  const res = await fetch(`${API_URL}${path}`, { headers: await authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? 'Request failed');
  return data;
}

async function post(path: string, body: object) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? 'Request failed');
  return data;
}

// ── Auth ──────────────────────────────────────────────────────
export async function login(email: string, password: string, device_id: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, device_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? 'Login failed');
  return data as { access_token: string; student_id: string; full_name: string };
}

// ── Timetable ─────────────────────────────────────────────────
export type TimetableEntry = {
  id: number;
  unit_code: string;
  unit_name: string;
  room_code: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  semester: number | null;
  academic_year: string | null;
  week_number: number | null;
};

export const getTodayTimetable  = (): Promise<TimetableEntry[]> => get('/timetable/today');
export const getWeekTimetable   = (): Promise<TimetableEntry[]> => get('/timetable/week');
export const getDayTimetable    = (day: string): Promise<TimetableEntry[]> => get(`/timetable/day/${day}`);

// ── Progress ──────────────────────────────────────────────────
export type UnitStat = {
  unit_code: string;
  unit_name: string;
  attended: number;
  total: number;
  percentage: number;
  color: string;
};

export type ProgressStats = {
  overall_percentage: number;
  total_attended: number;
  total_classes: number;
  streak: number;
  units: UnitStat[];
  alerts: string[];
};

export const getProgressStats = (): Promise<ProgressStats> => get('/progress/stats');

// ── Profile ───────────────────────────────────────────────────
export type ProfileData = {
  student_id: string;
  full_name: string;
  email: string;
  year: number;
  course: string;
  streak: number;
  stats: { enrolled_count: number; attendance_percentage: number };
  enrolled_classes: { unit_code: string; unit_name: string }[];
};

export const getProfile = (): Promise<ProfileData> => get('/profile/me');

// ── Attendance ────────────────────────────────────────────────
export type AttendanceResult = {
  success: boolean;
  status: string;
  message: string;
  marked_at: string;
  validation: { temporal_valid: boolean; spatial_valid: boolean; identity_valid: boolean };
};

// ── Absence Requests ────────────────────────────────────────
export const submitAbsenceRequest = (
  timetable_id: number,
  reason: string,
  document_url: string | null,
): Promise<{ success: boolean; message: string }> =>
  post('/absence/request', { timetable_id, reason, document_url });

export const markAttendance = (
  timetable_id: number,
  latitude: number,
  longitude: number,
  device_id: string,
): Promise<AttendanceResult> =>
  post('/attendance/mark', { timetable_id, latitude, longitude, device_id });
