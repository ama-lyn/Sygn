# Sygn: Database Schema Specification (v1.0)

## 1. Overview
The database uses a **Document-Oriented model**. Data is stored in **BSON format** within **MongoDB Atlas**. To optimize for the geofencing feature, we utilize **GeoJSON objects** and **2dsphere indexing**.


## 2. Collections Reference

### 2.1 Users Collection
Stores identity and authentication data for both students and staff.

| Field         | Type     | Description |
|---------------|----------|-------------|
| _id           | ObjectId | Primary Key (Auto-generated) |
| reg_number    | String   | JKUAT Reg Number (Unique, e.g., SCT211-0000/2022) |
| name          | String   | Full name of the user |
| email         | String   | Official JKUAT email address |
| password_hash | String   | Argon2 or Bcrypt hashed password |
| role          | String   | Enum: `student` or `lecturer` |
| device_id     | String   | Unique hardware ID to prevent multi-device spoofing |
| streak_count  | Integer  | Current consecutive attendance count |
| created_at    | DateTime | Timestamp of account creation |

---

### 2.2 Locations Collection (The Geofences)
Stores the physical boundaries of JKUAT lecture halls.

| Field    | Type     | Description |
|----------|----------|-------------|
| _id      | ObjectId | Primary Key |
| code     | String   | Short code (e.g., NCLB_101) |
| name     | String   | Human-readable name (e.g., New Common Lecture Building) |
| boundary | GeoJSON  | Point `[longitude, latitude]` for the center point |
| radius_m | Integer  | The allowed radius in meters (default: 50) |
| floors   | Array    | List of floor numbers (e.g., `[0, 1, 2]`) |

---

### 2.3 Schedules Collection (The Timetable)
The "heart" of the system; links people, time, and places.

| Field       | Type     | Description |
|-------------|----------|-------------|
| _id         | ObjectId | Primary Key |
| course_id   | String   | JKUAT Course Unit Code (e.g., ICS 2411) |
| lecturer_id | ObjectId | Reference to `Users._id` |
| location_id | ObjectId | Reference to `Locations._id` |
| day         | String   | Enum: Monday, Tuesday, etc. |
| start_time  | String   | 24h format (e.g., 08:00) |
| end_time    | String   | 24h format (e.g., 10:00) |

---

### 2.4 Attendance Collection
The transactional ledger for all check-ins and apologies.

| Field        | Type    | Description |
|--------------|---------|-------------|
| _id          | ObjectId | Primary Key |
| student_id   | ObjectId | Reference to `Users._id` |
| schedule_id  | ObjectId | Reference to `Schedules._id` |
| timestamp    | DateTime | Exact time of the "Sygn-in" |
| status       | String   | Enum: `present`, `absent`, `excused` |
| coordinates  | Object   | Contains `{ lat, lng }` at time of check-in |
| apology_text | String   | Optional: Student's reason for absence |
| is_verified  | Boolean  | System-level confirmation (Time + Location valid) |

---

## 3. Indexing Strategy
To ensure the app remains fast as the student body grows, implement the following indexes:

- **Geo-Spatial Index**
```javascript
db.locations.createIndex({ "boundary": "2dsphere" }) ```

```javascript
db.users.createIndex({ "reg_number": 1 }, { unique: true }) ```

```javascript
db.schedules.createIndex({ "day": 1, "start_time": 1 }) ```