-- ============================================================
-- SYGN — Supabase Schema
-- Run in Supabase SQL Editor in one go (top to bottom)
-- ============================================================


-- ── STEP 1: Extensions ───────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;


-- ── STEP 2: Core Tables ──────────────────────────────────────

-- Students
CREATE TABLE students (
  id          BIGSERIAL PRIMARY KEY,
  auth_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id  text UNIQUE NOT NULL,
  full_name   text NOT NULL,
  email       text UNIQUE NOT NULL,
  year        smallint CHECK (year BETWEEN 1 AND 4),
  course      text,
  device_id   text,
  streak      int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Lecturers
CREATE TABLE lecturers (
  id          BIGSERIAL PRIMARY KEY,
  auth_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id    text UNIQUE NOT NULL,
  full_name   text NOT NULL,
  email       text UNIQUE NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Buildings (replaces classrooms — stores polygon boundary per building)
CREATE TABLE buildings (
  id             BIGSERIAL PRIMARY KEY,
  building_code  text UNIQUE NOT NULL,  -- e.g. 'HRD', 'CLB', 'NCLB'
  building_name  text NOT NULL,
  geofence       geography(Polygon, 4326)
);

-- Rooms (maps specific room codes to their building polygon)
-- building_id is NULL for ONLINE — spatial check is skipped for those
CREATE TABLE rooms (
  id           BIGSERIAL PRIMARY KEY,
  room_code    text UNIQUE NOT NULL,    -- e.g. 'HRD 106', 'CLB 102', 'ONLINE'
  building_id  BIGINT REFERENCES buildings(id) ON DELETE CASCADE,
  floor        smallint
);

-- Units
CREATE TABLE units (
  id          BIGSERIAL PRIMARY KEY,
  unit_code   text UNIQUE NOT NULL,
  unit_name   text NOT NULL,
  lecturer_id BIGINT REFERENCES lecturers(id) ON DELETE SET NULL
);

-- Enrollments
CREATE TABLE enrollments (
  id             BIGSERIAL PRIMARY KEY,
  student_id     BIGINT REFERENCES students(id) ON DELETE CASCADE,
  unit_id        BIGINT REFERENCES units(id) ON DELETE CASCADE,
  semester       smallint,
  academic_year  text,
  enrolled_at    timestamptz DEFAULT now(),
  UNIQUE(student_id, unit_id, semester, academic_year)
);

-- Timetable (references rooms, not buildings directly)
CREATE TABLE timetable (
  id             BIGSERIAL PRIMARY KEY,
  unit_id        BIGINT REFERENCES units(id) ON DELETE CASCADE,
  room_id        BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
  day_of_week    text CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday')),
  start_time     time NOT NULL,
  end_time       time NOT NULL,
  semester       smallint,
  academic_year  text,
  week_number    smallint
);

-- Attendance Records
CREATE TABLE attendance_records (
  id                 BIGSERIAL PRIMARY KEY,
  student_id         BIGINT REFERENCES students(id) ON DELETE CASCADE,
  timetable_id       BIGINT REFERENCES timetable(id) ON DELETE CASCADE,
  unit_id            BIGINT REFERENCES units(id) ON DELETE CASCADE,
  status             text DEFAULT 'present' CHECK (status IN ('present','absent','excused')),
  latitude           float8,
  longitude          float8,
  distance_from_room float4,
  device_id          text,
  marked_at          timestamptz DEFAULT now(),
  temporal_valid     bool DEFAULT false,
  spatial_valid      bool DEFAULT false,
  identity_valid     bool DEFAULT false
);

-- Absence Requests
CREATE TABLE absence_requests (
  id           BIGSERIAL PRIMARY KEY,
  student_id   BIGINT REFERENCES students(id) ON DELETE CASCADE,
  unit_id      BIGINT REFERENCES units(id) ON DELETE CASCADE,
  timetable_id BIGINT REFERENCES timetable(id) ON DELETE CASCADE,
  reason       text,
  document_url text,
  status       text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by  BIGINT REFERENCES lecturers(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);


-- ── STEP 3: Indexes ──────────────────────────────────────────

CREATE INDEX buildings_geofence_idx    ON buildings USING GIST (geofence);
CREATE INDEX rooms_building_idx        ON rooms (building_id);
CREATE INDEX attendance_student_idx    ON attendance_records (student_id);
CREATE INDEX attendance_unit_idx       ON attendance_records (unit_id);
CREATE INDEX timetable_unit_idx        ON timetable (unit_id);
CREATE INDEX timetable_day_idx         ON timetable (day_of_week);
CREATE INDEX enrollments_student_idx   ON enrollments (student_id);


-- ── STEP 4: Row Level Security ───────────────────────────────

ALTER TABLE students           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE units              ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable          ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_requests   ENABLE ROW LEVEL SECURITY;

-- Students
CREATE POLICY "students: read own"   ON students FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "students: update own" ON students FOR UPDATE USING (auth.uid() = auth_id);

-- Lecturers
CREATE POLICY "lecturers: read own"   ON lecturers FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "lecturers: update own" ON lecturers FOR UPDATE USING (auth.uid() = auth_id);

-- Buildings (read-only for all authenticated users, insert via service role only)
CREATE POLICY "buildings: authenticated read" ON buildings
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "buildings: service insert" ON buildings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Rooms
CREATE POLICY "rooms: authenticated read" ON rooms
  FOR SELECT USING (auth.role() = 'authenticated');

-- Units
CREATE POLICY "units: authenticated read" ON units
  FOR SELECT USING (auth.role() = 'authenticated');

-- Enrollments
CREATE POLICY "enrollments: read own" ON enrollments
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE auth_id = auth.uid())
  );

-- Timetable
CREATE POLICY "timetable: enrolled students read" ON timetable
  FOR SELECT USING (
    unit_id IN (
      SELECT unit_id FROM enrollments
      WHERE student_id = (SELECT id FROM students WHERE auth_id = auth.uid())
    )
  );
CREATE POLICY "timetable: lecturer read own units" ON timetable
  FOR SELECT USING (
    unit_id IN (
      SELECT id FROM units
      WHERE lecturer_id = (SELECT id FROM lecturers WHERE auth_id = auth.uid())
    )
  );

-- Attendance Records
CREATE POLICY "attendance: student read own" ON attendance_records
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE auth_id = auth.uid())
  );
CREATE POLICY "attendance: student insert own" ON attendance_records
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM students WHERE auth_id = auth.uid())
  );
CREATE POLICY "attendance: lecturer read own units" ON attendance_records
  FOR SELECT USING (
    unit_id IN (
      SELECT id FROM units
      WHERE lecturer_id = (SELECT id FROM lecturers WHERE auth_id = auth.uid())
    )
  );
CREATE POLICY "attendance: lecturer update own units" ON attendance_records
  FOR UPDATE USING (
    unit_id IN (
      SELECT id FROM units
      WHERE lecturer_id = (SELECT id FROM lecturers WHERE auth_id = auth.uid())
    )
  );

-- Absence Requests
CREATE POLICY "absence: student read own" ON absence_requests
  FOR SELECT USING (
    student_id = (SELECT id FROM students WHERE auth_id = auth.uid())
  );
CREATE POLICY "absence: student insert own" ON absence_requests
  FOR INSERT WITH CHECK (
    student_id = (SELECT id FROM students WHERE auth_id = auth.uid())
  );
CREATE POLICY "absence: lecturer read own units" ON absence_requests
  FOR SELECT USING (
    unit_id IN (
      SELECT id FROM units
      WHERE lecturer_id = (SELECT id FROM lecturers WHERE auth_id = auth.uid())
    )
  );
CREATE POLICY "absence: lecturer update own units" ON absence_requests
  FOR UPDATE USING (
    unit_id IN (
      SELECT id FROM units
      WHERE lecturer_id = (SELECT id FROM lecturers WHERE auth_id = auth.uid())
    )
  );


-- ── STEP 5: Insert Building Polygons ─────────────────────────

INSERT INTO buildings (building_code, building_name, geofence) VALUES

('CLB', 'Common Lecture Building (C.L.B)',
  ST_GeogFromText('POLYGON((37.0139735 -1.0952458,37.0142951 -1.0952461,37.0142953 -1.095128,37.0145461 -1.0951283,37.0145451 -1.0951093,37.0145426 -1.0950021,37.0139738 -1.0950013,37.0139735 -1.0952458))')),

('IPIC', 'IPIC JKUAT',
  ST_GeogFromText('POLYGON((37.0122286 -1.0952227,37.012698 -1.0952254,37.0126972 -1.095361,37.0122279 -1.0953583,37.0122286 -1.0952227))')),

('ITROMID', 'ITROMID Lecture Hall',
  ST_GeogFromText('POLYGON((37.0123254 -1.097265,37.0124313 -1.0972649,37.0124312 -1.0971164,37.0122736 -1.0971162,37.0121187 -1.0971161,37.0121188 -1.0972056,37.0122057 -1.0972056,37.0122057 -1.0972401,37.0122849 -1.0972401,37.0122849 -1.0971897,37.0123254 -1.0971897,37.0123254 -1.097265))')),

('ELB', 'Engineering Lecture Building (E.L.B)',
  ST_GeogFromText('POLYGON((37.0134932 -1.0963602,37.0137791 -1.0963587,37.0137793 -1.096395,37.014008 -1.0963938,37.014007 -1.0961902,37.0134923 -1.0961929,37.0134932 -1.0963602))')),

('EMB', 'Engineering Main Building (E.M.B)',
  ST_GeogFromText('POLYGON((37.0135405 -1.0956338,37.0138725 -1.0956272,37.0138716 -1.0955833,37.0143145 -1.0955744,37.0143114 -1.0954195,37.013862 -1.0954285,37.0138632 -1.0954849,37.013738 -1.0954874,37.0135376 -1.0954914,37.0135405 -1.0956338))')),

('HRD', 'School of Human Resource Development (S.H.R.D)',
  ST_GeogFromText('POLYGON((37.0145406 -1.0949237,37.0149232 -1.094915,37.0149252 -1.0950045,37.0146936 -1.0950097,37.0146958 -1.0951059,37.0145451 -1.0951093,37.0145426 -1.0950021,37.0145406 -1.0949237))')),

('NSC_LT', 'NSC Lecture Theatre',
  ST_GeogFromText('POLYGON((37.0134574 -1.0990681,37.0133601 -1.0989885,37.0133831 -1.0989717,37.0134052 -1.0989522,37.0134353 -1.0989337,37.0134689 -1.0989169,37.0135017 -1.0989089,37.0135415 -1.0989071,37.0135822 -1.0989107,37.0136176 -1.0989204,37.0136512 -1.0989363,37.0136839 -1.0989531,37.0137016 -1.0989726,37.0137131 -1.0989806,37.0136255 -1.0990752,37.0135972 -1.0990575,37.0135404 -1.0989995,37.013537 -1.0990442,37.013491 -1.0990496,37.0134733 -1.0990584,37.0134574 -1.0990681))')),

('COHES', 'College of Health Sciences (COHES)',
  ST_GeogFromText('POLYGON((37.0128366 -1.099606,37.0128302 -1.099496,37.0135576 -1.0994542,37.0135644 -1.0995733,37.013255 -1.099591,37.0132689 -1.0998331,37.0130605 -1.0998451,37.013046 -1.0995939,37.0128366 -1.099606))')),

('IEET', 'Institute of Energy and Environmental Technology (IEET)',
  ST_GeogFromText('POLYGON((37.0117479 -1.0937224,37.0118592 -1.0937247,37.0118586 -1.0937511,37.0119517 -1.093753,37.0119521 -1.0937345,37.0120655 -1.0937368,37.0120671 -1.0936584,37.0117494 -1.0936518,37.0117479 -1.0937224))')),

('JKAC', 'JKUAT Academic Centre (JKAC)',
  ST_GeogFromText('POLYGON((37.0125553 -1.0936188,37.0125563 -1.0937017,37.0121333 -1.0937069,37.0121323 -1.0936241,37.0125553 -1.0936188))')),

('NCLB', 'New Common Lecture Building (NCLB)',
  ST_GeogFromText('POLYGON((37.0132238 -1.0941749,37.0135034 -1.0941765,37.0135023 -1.0943577,37.0132227 -1.094356,37.0132238 -1.0941749))')),

('NSC', 'New Science Complex (N.S.C)',
  ST_GeogFromText('POLYGON((37.0128888 -1.0986043,37.0128953 -1.0987401,37.0129522 -1.0987384,37.0129541 -1.0987768,37.013054 -1.0987735,37.0130522 -1.0987351,37.0132736 -1.0987278,37.0132718 -1.0986894,37.013351 -1.0986867,37.0133491 -1.0986483,37.0132499 -1.0986516,37.013248 -1.0986132,37.0128888 -1.0986043))')),

('LT', 'Lecture Theatre 1',
  ST_GeogFromText('POLYGON((37.01235 -1.1015,37.01255 -1.1015,37.01255 -1.10175,37.01235 -1.10175,37.01235 -1.1015))'));


-- ── STEP 6: Insert Rooms ─────────────────────────────────────
-- Add your known rooms here. All rooms in the same building share one polygon.
-- ONLINE has no building_id — spatial check is skipped for it.

INSERT INTO rooms (room_code, building_id, floor) VALUES
  ('ONLINE', NULL, NULL);

INSERT INTO rooms (room_code, building_id, floor)
SELECT 'CLB 102', id, 1 FROM buildings WHERE building_code = 'CLB';

INSERT INTO rooms (room_code, building_id, floor)
SELECT 'CLB 106', id, 1 FROM buildings WHERE building_code = 'CLB';

INSERT INTO rooms (room_code, building_id, floor)
SELECT 'HRD 106', id, 1 FROM buildings WHERE building_code = 'HRD';

INSERT INTO rooms (room_code, building_id, floor)
SELECT 'HRD 108', id, 1 FROM buildings WHERE building_code = 'HRD';

INSERT INTO rooms (room_code, building_id, floor)
SELECT 'NCLB 101', id, 1 FROM buildings WHERE building_code = 'NCLB';

-- Add more rooms as needed following the same pattern:
-- INSERT INTO rooms (room_code, building_id, floor)
-- SELECT '<ROOM CODE>', id, <FLOOR> FROM buildings WHERE building_code = '<BUILDING CODE>';
