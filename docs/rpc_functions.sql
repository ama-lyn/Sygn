-- Run this in Supabase SQL Editor
-- Called by FastAPI attendance route to check if student GPS is inside building polygon

CREATE OR REPLACE FUNCTION check_student_inside_building(
  p_room_id  BIGINT,
  p_lat      FLOAT,
  p_lng      FLOAT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT ST_Covers(
    b.geofence,
    ST_MakePoint(p_lng, p_lat)::geography
  )
  FROM rooms r
  JOIN buildings b ON b.id = r.building_id
  WHERE r.id = p_room_id
    AND r.building_id IS NOT NULL;
$$;
