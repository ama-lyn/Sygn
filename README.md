# Sygn | The Digital Signature of Place

[![JKUAT](https://img.shields.io/badge/University-JKUAT-green.svg)](https://www.jkuat.ac.ke/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Stack-React_Native_%7C_FastAPI_%7C_MongoDB-blue.svg)]()

## 1. Executive Summary
**Sygn** is a mobile-first attendance ecosystem developed for **Jomo Kenyatta University of Agriculture and Technology (JKUAT)**. Unlike traditional roll-calls, Sygn leverages high-precision GPS geofencing and biometric verification to ensure that a student’s physical presence is authenticated and logged in real-time.

---

## 2. The Problem Statement
Traditional attendance methods (physical sign-in sheets) at JKUAT are prone to:
*   **Buddy Punching:** Students signing in for absent colleagues (Proxy attendance).
*   **Administrative Friction:** Significant time lost in manual data entry and Excel reconciliation.
*   **Data Latency:** Lecturers lack immediate visibility into attendance trends during or after a lecture.

---

## 3. The "Sygn" Logic: Tri-Factor Validation
To ensure 100% data integrity and eliminate proxies, Sygn utilizes a **Zero-Trust** verification handshake:

1.  **Temporal Validation (When):** The server cross-references the student’s registered units against the active timetable. Attendance is only "Open" during the scheduled slot.
2.  **Spatial Validation (Where):** The app captures GPS coordinates and calculates the distance $d$ from the classroom’s center using the **Haversine Formula**.
    *   *Constraint:* Access is granted only if $d \leq$ Classroom Radius (e.g., 30m).
3.  **Identity Validation (Who):** 
    *   **Device Binding:** Accounts are locked to a unique hardware ID (IMEI/UUID).
    *   **Biometric Handshake:** Requires FaceID/Fingerprint authentication before the GPS packet is transmitted.

---

## 4. Technical Architecture
### System Design & HCI Focus
| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend** | **React Native (Expo)** | Cross-platform compatibility with native access to GPS and Biometric APIs. |
| **Backend API** | **FastAPI (Python)** | Asynchronous execution for high-concurrency during peak attendance windows. |
| **Database** | **MongoDB Atlas** | Native **Geospatial Indexing** ($centerSphere) for mapping JKUAT building boundaries. |
| **HCI/UX** | **Minimalist Dashboard** | "One-Tap" check-in UI with haptic feedback to maximize usability and speed. |

---

## 5. System Features
### Student Experience
*   **Smart Timetable:** Automatic fetching of daily class schedules.
*   **Dynamic Geofencing:** Visual feedback (Red/Green) indicating if the student is within the valid attendance zone.
*   **The Apology Portal:** Formal UI to submit absence justifications with document attachment support.

### Lecturer Dashboard (Streamlit)
*   **Live Attendance Feed:** Real-time visualization of students entering the geofence.
*   **One-Click Analytics:** Export official JKUAT-formatted attendance sheets in `.xlsx` or `.pdf`.
*   **Override Control:** Ability to manually adjust status for students with technical hardware issues.

---

## 6. Database Schema Preview
To represent JKUAT building boundaries, locations are stored as **GeoJSON** objects:

```json
{
  "building_name": "CLB 102",
  "center_point": { 
    "type": "Point", 
    "coordinates": [37.01234, -1.09123] 
  },
  "radius_meters": 30,
  "last_updated": "2023-10-27T10:00:00Z"
}

sygn-project/
├── backend/                # FastAPI Application
│   ├── app/                # Core logic
│   │   ├── main.py         # Entry point (FastAPI instance)
│   │   ├── database.py     # MongoDB Atlas connection (Motor/PyMongo)
│   │   ├── models/         # Pydantic models (Schema validation)
│   │   ├── routes/         # API Endpoints (attendance, auth, users)
│   │   └── utils/          # Geofencing (Haversine) & Security logic
│   ├── tests/              # Unit tests for geofencing math
│   ├── requirements.txt    # Python dependencies (fastapi, uvicorn, pymongo)
│   └── .env                # MONGO_URI, SECRET_KEY (Keep out of GitHub!)
├── mobile/                 # React Native / Expo Application
│   ├── src/
│   │   ├── components/     # UI Buttons, Inputs, Cards
│   │   ├── screens/        # Login, Timetable, CheckIn, Profile
│   │   ├── services/       # API calling logic (Axios/Fetch)
│   │   └── hooks/          # Custom hooks for GPS & Auth
│   ├── app.json            # Expo configuration
│   └── package.json        # JS dependencies
├── dashboard/              # Streamlit Application (Lecturer Portal)
│   ├── app.py              # Streamlit UI
│   ├── requirements.txt    # pandas, streamlit, pymongo
│   └── .env                # Shared DB access
├── docs/                   # Markdown files, API Contract, DB Schema
├── .gitignore              # Ignores node_modules, .env, and __pycache__
└── README.md               # The project overview we just wrote