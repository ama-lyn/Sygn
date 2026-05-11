# Sygn Backend Documentation

[![Stack](https://img.shields.io/badge/Stack-FastAPI_%7C_Snowflake-blue.svg)]()

## Architecture

```
Mobile App (Expo)
      │
      │ HTTPS + JWT
      ▼
FastAPI on Render
      │
      ├── /auth        → Login, Register, Device Binding
      ├── /attendance  → GPS validation + mark attendance
      ├── /timetable   → Fetch schedule per student
      ├── /progress    → Attendance stats per course
      └── /profile     → Student info
      │
      ▼
Snowflake (Cloud Data Warehouse)
```

---

## GPS Attendance Logic

### Step 1 — Student taps "Ready to Sygn"
The app requests location permission. If denied, the button stays in the `searching` state and shows a prompt to enable location in Settings.

### Step 2 — App sends GPS packet to server

```json
{
  "student_id": "SCT211-0142/2022",
  "unit_code": "ICS 2301",
  "latitude": -1.09145,
  "longitude": 37.01267,
  "device_id": "uuid-of-phone",
  "timestamp": "2024-10-27T09:03:00Z"
}
```

### Step 3 — Server runs Tri-Factor Validation

```
1. TEMPORAL  → Is ICS 2301 scheduled right now for this student?
2. SPATIAL   → Is (lat, lng) inside the building's polygon boundary?
3. IDENTITY  → Does device_id match the registered device for this student?
```

All 3 must pass. If any fails → rejected with reason code.

### Spatial Check — Point-in-Polygon (Shapely)

Since classrooms are now stored as **GeoJSON Polygons** (not center points + radius), the spatial check uses a point-in-polygon test instead of Haversine distance:

```python
from shapely.geometry import Point, shape

def is_inside_polygon(student_lat: float, student_lng: float, geofence_polygon: dict) -> bool:
    """Returns True if the student's GPS coordinate falls inside the building polygon."""
    point = Point(student_lng, student_lat)   # Shapely uses (lng, lat)
    polygon = shape(geofence_polygon)         # GeoJSON dict → Shapely geometry
    return polygon.contains(point)
```

> **Note:** `shapely` must be added to `requirements.txt`. GeoJSON coordinates are `[longitude, latitude]` — note the order.

---

## Database — Snowflake

### Schema: `ATTENDANCE_DB.CORE`

#### `DIM_STUDENT`
| Column | Type | Description |
| :--- | :--- | :--- |
| STUDENT_ID | VARCHAR PK | JKUAT reg number (e.g. SCT211-0142/2022) |
| FULL_NAME | VARCHAR | Student's full name |
| EMAIL | VARCHAR | Official JKUAT email |
| PASSWORD_HASH | VARCHAR | Bcrypt hash |
| DEVICE_ID | VARCHAR | Hardware UUID bound at registration |
| DEPARTMENT | VARCHAR | e.g. Computer Science |
| YEAR | INTEGER | Academic year |
| STREAK_COUNT | INTEGER | Current consecutive attendance streak |
| CREATED_AT | TIMESTAMP_NTZ | Account creation time |

---

#### `DIM_CLASSROOM`
Stores **building-level** polygon boundaries. One row per building.

| Column | Type | Description |
| :--- | :--- | :--- |
| CLASS_ID | VARCHAR PK | e.g. `CLB_01`, `HRD_01` |
| BUILDING_NAME | VARCHAR | Full building name |
| ROOM_NUMBER | VARCHAR | Legacy room identifier (e.g. `CLB-01`) |
| GEOFENCE_POLYGON | GEOGRAPHY | GeoJSON Polygon covering the building footprint |
| CREATED_AT | TIMESTAMP_NTZ | Row creation time |

**Current buildings loaded:**

| CLASS_ID | Building |
| :--- | :--- |
| CLB_01 | Common Lecture Building (C.L.B) |
| IPIC_01 | IPIC JKUAT |
| ITROMID_01 | ITROMID Lecture Hall |
| ELB_01 | Engineering Lecture Building (E.L.B) |
| EMB_01 | Engineering Main Building (E.M.B) |
| HRD_01 | School of Human Resource Development (S.H.R.D) |
| NSC_LT | NSC Lecture Theatre |
| COHES_01 | College of Health Sciences (COHES) |
| IEET_01 | Institute of Energy and Environmental Technology (IEET) |
| JKAC_01 | JKUAT Academic Centre (JKAC) |
| NCLB_01 | New Common Lecture Building (NCLB) |
| NSC_MAIN | New Science Complex — PAM LAB B |
| LT_01 | Lecture Theatre 1 (legacy compatibility) |

---

#### `DIM_ROOM` ← **New table**
Maps individual room codes (e.g. `HRD 106`) to their building polygon in `DIM_CLASSROOM`. This avoids duplicating polygon data per room.

| Column | Type | Description |
| :--- | :--- | :--- |
| ROOM_CODE | VARCHAR PK | e.g. `HRD 106`, `CLB 102` |
| CLASS_ID | VARCHAR FK | References `DIM_CLASSROOM.CLASS_ID` |
| FLOOR | INTEGER | Floor number (optional) |

**Example rows:**
```sql
INSERT INTO DIM_ROOM (ROOM_CODE, CLASS_ID, FLOOR) VALUES
  ('HRD 106', 'HRD_01', 1),
  ('HRD 108', 'HRD_01', 1),
  ('CLB 102', 'CLB_01', 1),
  ('CLB 106', 'CLB_01', 1),
  ('NCLB 101', 'NCLB_01', 1);
```

The timetable stores `ROOM_CODE`. At check-in, the backend joins `DIM_ROOM → DIM_CLASSROOM` to get the polygon.

---

#### `DIM_TIMETABLE`
| Column | Type | Description |
| :--- | :--- | :--- |
| TIMETABLE_ID | VARCHAR PK | |
| UNIT_CODE | VARCHAR | e.g. `ICS 2301` |
| UNIT_NAME | VARCHAR | e.g. `Data Structures` |
| LECTURER_ID | VARCHAR FK | References `DIM_LECTURER` |
| ROOM_CODE | VARCHAR FK | References `DIM_ROOM.ROOM_CODE` |
| DAY_OF_WEEK | VARCHAR | Monday – Friday |
| START_TIME | TIME | 24h format |
| END_TIME | TIME | 24h format |
| SEMESTER | INTEGER | |

---

#### `FACT_ATTENDANCE`
| Column | Type | Description |
| :--- | :--- | :--- |
| ATTENDANCE_ID | VARCHAR PK | |
| STUDENT_ID | VARCHAR FK | |
| TIMETABLE_ID | VARCHAR FK | |
| STATUS | VARCHAR | `present` / `absent` / `excused` |
| STUDENT_LAT | FLOAT | GPS latitude at check-in |
| STUDENT_LNG | FLOAT | GPS longitude at check-in |
| ACCURACY_METERS | FLOAT | Device-reported GPS accuracy |
| IS_INSIDE_POLYGON | BOOLEAN | Result of point-in-polygon check |
| DEVICE_ID | VARCHAR | Device used at check-in |
| MARKED_AT | TIMESTAMP_NTZ | Exact check-in time |
| TEMPORAL_PASS | BOOLEAN | Tri-factor: time check |
| SPATIAL_PASS | BOOLEAN | Tri-factor: polygon check |
| IDENTITY_PASS | BOOLEAN | Tri-factor: device check |

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # Snowflake connector
│   ├── models/
│   │   ├── student.py       # Pydantic schemas
│   │   ├── attendance.py
│   │   ├── timetable.py
│   │   └── classroom.py
│   ├── routes/
│   │   ├── auth.py          # /auth/login, /auth/register
│   │   ├── attendance.py    # /attendance/mark, /attendance/history
│   │   ├── timetable.py     # /timetable/today, /timetable/week
│   │   └── progress.py      # /progress/stats
│   └── utils/
│       ├── geofence.py      # Point-in-polygon (Shapely)
│       ├── jwt.py           # Token generation/verification
│       └── device.py        # Device binding logic
├── tests/
│   └── test_geofence.py
├── requirements.txt
└── .env                     # SNOWFLAKE_* credentials, SECRET_KEY
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/auth/register` | Register student + bind device |
| POST | `/auth/login` | Login → returns JWT |
| GET | `/timetable/today` | Today's classes for student |
| GET | `/timetable/week` | Full week schedule |
| POST | `/attendance/mark` | Submit GPS + mark attendance |
| GET | `/attendance/history/{unit_code}` | Past records |
| GET | `/progress/stats` | Overall + per-unit stats |
| GET | `/profile/me` | Student profile data |

---

## On Location Permissions (Mobile Side)

When the student taps the Sygn button, the app will:

1. Call `expo-location` → `requestForegroundPermissionsAsync()`
2. If denied → show modal: *"Sygn needs your location to verify you're in class."* with a deep link to phone Settings
3. If granted → `getCurrentPositionAsync({ accuracy: Location.Accuracy.High })`
4. Send GPS packet to `/attendance/mark`

> `expo-location` must be installed before backend integration begins.
