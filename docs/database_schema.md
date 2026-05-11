# Sygn: Database Schema (v2.0)

**Stack:** Supabase (PostgreSQL + PostGIS + Auth)
**Full SQL:** `docs/supabase_schema.sql` — run top to bottom in the Supabase SQL Editor.

---

## Tables Overview

| Table | Purpose |
| :--- | :--- |
| `students` | Student profiles, linked to Supabase Auth |
| `lecturers` | Lecturer profiles, linked to Supabase Auth |
| `buildings` | JKUAT building footprints as GeoJSON polygons |
| `rooms` | Individual room codes mapped to their building |
| `units` | Course units (ICS 2301, SMA 2104, etc.) |
| `enrollments` | Which students are in which units |
| `timetable` | Scheduled classes — links unit, room, day, time |
| `attendance_records` | Every check-in attempt with tri-factor results |
| `absence_requests` | Student apology submissions |

---

## Table Details

### `students`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| auth_id | uuid | FK → `auth.users` |
| student_id | text UNIQUE | e.g. `SCT211-0142/2022` |
| full_name | text | |
| email | text UNIQUE | |
| year | smallint | 1–4 |
| course | text | e.g. `Maths and Computer Science` |
| device_id | text | Bound at first login |
| streak | int | Consecutive attendance count |
| created_at | timestamptz | |

---

### `lecturers`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| auth_id | uuid | FK → `auth.users` |
| staff_id | text UNIQUE | e.g. `JKUAT-L-0042` |
| full_name | text | |
| email | text UNIQUE | |
| created_at | timestamptz | |

---

### `buildings`
One row per physical building. Stores the polygon boundary used for geofencing.

| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| building_code | text UNIQUE | e.g. `HRD`, `CLB`, `NCLB` |
| building_name | text | e.g. `School of Human Resource Development` |
| geofence | geography(Polygon, 4326) | PostGIS polygon — all rooms in this building use this boundary |

**Loaded buildings:**

| building_code | Building |
| :--- | :--- |
| CLB | Common Lecture Building |
| IPIC | IPIC JKUAT |
| ITROMID | ITROMID Lecture Hall |
| ELB | Engineering Lecture Building |
| EMB | Engineering Main Building |
| HRD | School of Human Resource Development |
| NSC_LT | NSC Lecture Theatre |
| COHES | College of Health Sciences |
| IEET | Institute of Energy and Environmental Technology |
| JKAC | JKUAT Academic Centre |
| NCLB | New Common Lecture Building |
| NSC | New Science Complex |
| LT | Lecture Theatre 1 (placeholder polygon — update when confirmed) |

---

| building_code | building_name                                           | polygon_wkt                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLB           | Common Lecture Building (C.L.B)                         | POLYGON((37.0139735 -1.0952458,37.0142951 -1.0952461,37.0142953 -1.095128,37.0145461 -1.0951283,37.0145451 -1.0951093,37.0145426 -1.0950021,37.0139738 -1.0950013,37.0139735 -1.0952458))                                                                                                                                                                                                                                                                                              |
| IPIC          | IPIC JKUAT                                              | POLYGON((37.0122286 -1.0952227,37.012698 -1.0952254,37.0126972 -1.095361,37.0122279 -1.0953583,37.0122286 -1.0952227))                                                                                                                                                                                                                                                                                                                                                                 |
| ITROMID       | ITROMID Lecture Hall                                    | POLYGON((37.0123254 -1.097265,37.0124313 -1.0972649,37.0124312 -1.0971164,37.0122736 -1.0971162,37.0121187 -1.0971161,37.0121188 -1.0972056,37.0122057 -1.0972056,37.0122057 -1.0972401,37.0122849 -1.0972401,37.0122849 -1.0971897,37.0123254 -1.0971897,37.0123254 -1.097265))                                                                                                                                                                                                       |
| ELB           | Engineering Lecture Building (E.L.B)                    | POLYGON((37.0134932 -1.0963602,37.0137791 -1.0963587,37.0137793 -1.096395,37.014008 -1.0963938,37.014007 -1.0961902,37.0134923 -1.0961929,37.0134932 -1.0963602))                                                                                                                                                                                                                                                                                                                      |
| EMB           | Engineering Main Building (E.M.B)                       | POLYGON((37.0135405 -1.0956338,37.0138725 -1.0956272,37.0138716 -1.0955833,37.0143145 -1.0955744,37.0143114 -1.0954195,37.013862 -1.0954285,37.0138632 -1.0954849,37.013738 -1.0954874,37.0135376 -1.0954914,37.0135405 -1.0956338))                                                                                                                                                                                                                                                   |
| HRD           | School of Human Resource Development (S.H.R.D)          | POLYGON((37.0145406 -1.0949237,37.0149232 -1.094915,37.0149252 -1.0950045,37.0146936 -1.0950097,37.0146958 -1.0951059,37.0145451 -1.0951093,37.0145426 -1.0950021,37.0145406 -1.0949237))                                                                                                                                                                                                                                                                                              |
| NSC_LT        | NSC Lecture Theatre                                     | POLYGON((37.0134574 -1.0990681,37.0133601 -1.0989885,37.0133831 -1.0989717,37.0134052 -1.0989522,37.0134353 -1.0989337,37.0134689 -1.0989169,37.0135017 -1.0989089,37.0135415 -1.0989071,37.0135822 -1.0989107,37.0136176 -1.0989204,37.0136512 -1.0989363,37.0136839 -1.0989531,37.0137016 -1.0989726,37.0137131 -1.0989806,37.0136255 -1.0990752,37.0135972 -1.0990575,37.0135404 -1.0989995,37.013537 -1.0990442,37.013491 -1.0990496,37.0134733 -1.0990584,37.0134574 -1.0990681)) |
| COHES         | College of Health Sciences (COHES)                      | POLYGON((37.0128366 -1.099606,37.0128302 -1.099496,37.0135576 -1.0994542,37.0135644 -1.0995733,37.013255 -1.099591,37.0132689 -1.0998331,37.0130605 -1.0998451,37.013046 -1.0995939,37.0128366 -1.099606))                                                                                                                                                                                                                                                                             |
| IEET          | Institute of Energy and Environmental Technology (IEET) | POLYGON((37.0117479 -1.0937224,37.0118592 -1.0937247,37.0118586 -1.0937511,37.0119517 -1.093753,37.0119521 -1.0937345,37.0120655 -1.0937368,37.0120671 -1.0936584,37.0117494 -1.0936518,37.0117479 -1.0937224))                                                                                                                                                                                                                                                                        |
| JKAC          | JKUAT Academic Centre (JKAC)                            | POLYGON((37.0125553 -1.0936188,37.0125563 -1.0937017,37.0121333 -1.0937069,37.0121323 -1.0936241,37.0125553 -1.0936188))                                                                                                                                                                                                                                                                                                                                                               |
| NCLB          | New Common Lecture Building (NCLB)                      | POLYGON((37.0132238 -1.0941749,37.0135034 -1.0941765,37.0135023 -1.0943577,37.0132227 -1.094356,37.0132238 -1.0941749))                                                                                                                                                                                                                                                                                                                                                                |
| NSC           | New Science Complex (N.S.C)                             | POLYGON((37.0128888 -1.0986043,37.0128953 -1.0987401,37.0129522 -1.0987384,37.0129541 -1.0987768,37.013054 -1.0987735,37.0130522 -1.0987351,37.0132736 -1.0987278,37.0132718 -1.0986894,37.013351 -1.0986867,37.0133491 -1.0986483,37.0132499 -1.0986516,37.013248 -1.0986132,37.0128888 -1.0986043))                                                                                                                                                                                  |
| LT            | Lecture Theatre 1                                       | POLYGON((37.01235 -1.1015,37.01255 -1.1015,37.01255 -1.10175,37.01235 -1.10175,37.01235 -1.1015))                                                                                                                                                                                                                                                                                                                                                                                      |

### `rooms`
Maps specific room codes to their building. `building_id` is `NULL` for `ONLINE` — the spatial check is skipped for those timetable entries.

| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| room_code | text UNIQUE | e.g. `HRD 106`, `CLB 102`, `ONLINE` |
| building_id | BIGINT FK | → `buildings.id`, NULL for ONLINE |
| floor | smallint | Optional |

---

### `units`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| unit_code | text UNIQUE | e.g. `ICS 2301` |
| unit_name | text | e.g. `Data Structures` |
| lecturer_id | BIGINT FK | → `lecturers.id` |

---

### `enrollments`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| student_id | BIGINT FK | → `students.id` |
| unit_id | BIGINT FK | → `units.id` |
| semester | smallint | |
| academic_year | text | e.g. `2024/2025` |
| enrolled_at | timestamptz | |

Unique constraint on `(student_id, unit_id, semester, academic_year)`.

---

### `timetable`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| unit_id | BIGINT FK | → `units.id` |
| room_id | BIGINT FK | → `rooms.id` |
| day_of_week | text | Monday – Friday |
| start_time | time | 24h |
| end_time | time | 24h |
| semester | smallint | |
| academic_year | text | |
| week_number | smallint | |

---

### `attendance_records`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| student_id | BIGINT FK | → `students.id` |
| timetable_id | BIGINT FK | → `timetable.id` |
| unit_id | BIGINT FK | → `units.id` |
| status | text | `present` / `absent` / `excused` |
| latitude | float8 | Student GPS at check-in |
| longitude | float8 | Student GPS at check-in |
| distance_from_room | float4 | Informational only |
| device_id | text | |
| marked_at | timestamptz | |
| temporal_valid | bool | Tri-factor: time check |
| spatial_valid | bool | Tri-factor: polygon check |
| identity_valid | bool | Tri-factor: device check |

---

### `absence_requests`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | BIGSERIAL PK | |
| student_id | BIGINT FK | → `students.id` |
| unit_id | BIGINT FK | → `units.id` |
| timetable_id | BIGINT FK | → `timetable.id` |
| reason | text | |
| document_url | text | Supabase Storage URL |
| status | text | `pending` / `approved` / `rejected` |
| reviewed_by | BIGINT FK | → `lecturers.id` |
| created_at | timestamptz | |

---

## Spatial Check (FastAPI)

```sql
-- Returns true if student is inside the building polygon for a given room
SELECT ST_Covers(b.geofence, ST_MakePoint(:lng, :lat)::geography) AS inside
FROM rooms r
JOIN buildings b ON b.id = r.building_id
WHERE r.room_code = :room_code;
```

If `building_id IS NULL` (ONLINE room), skip this query entirely — `spatial_valid = true` by default.
