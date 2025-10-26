-- Baby Sleep Tracker - Seed Data Script
-- This adds dummy sleep data for testing the MVP
-- Run this in Supabase SQL Editor

-- First, let's get the user ID for alecburrett@gmail.com
DO $$
DECLARE
  v_user_id UUID;
  v_child_id UUID;
  v_date DATE;
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
BEGIN
  -- Get the user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'alecburrett@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email alecburrett@gmail.com not found';
  END IF;

  -- Delete existing data for this user (if re-running script)
  DELETE FROM sleep_sessions WHERE child_id IN (SELECT id FROM children WHERE user_id = v_user_id);
  DELETE FROM children WHERE user_id = v_user_id;

  -- Create a child profile (4 months old baby named "Poppy")
  INSERT INTO children (id, user_id, name, birth_date, created_at)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'Poppy',
    CURRENT_DATE - INTERVAL '4 months',
    NOW()
  )
  RETURNING id INTO v_child_id;

  RAISE NOTICE 'Created child with ID: %', v_child_id;

  -- Generate sleep data for the past 7 days
  -- Day 7 (oldest)
  v_date := CURRENT_DATE - INTERVAL '7 days';

  -- Night sleep (7:30 PM - 2:00 AM)
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '19:30:00', v_date + TIME '02:00:00' + INTERVAL '1 day', 'night');

  -- Night wake (2:00 AM - 6:30 AM)
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '02:30:00' + INTERVAL '1 day', v_date + TIME '06:30:00' + INTERVAL '1 day', 'night');

  -- Morning nap (8:00 AM - 9:15 AM)
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '08:00:00' + INTERVAL '1 day', v_date + TIME '09:15:00' + INTERVAL '1 day', 'nap');

  -- Afternoon nap (12:30 PM - 2:00 PM)
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '12:30:00' + INTERVAL '1 day', v_date + TIME '14:00:00' + INTERVAL '1 day', 'nap');

  -- Late afternoon nap (4:00 PM - 4:45 PM)
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '16:00:00' + INTERVAL '1 day', v_date + TIME '16:45:00' + INTERVAL '1 day', 'nap');

  -- Day 6
  v_date := CURRENT_DATE - INTERVAL '6 days';

  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '19:15:00', v_date + TIME '01:30:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '02:00:00' + INTERVAL '1 day', v_date + TIME '06:45:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '08:15:00' + INTERVAL '1 day', v_date + TIME '09:30:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '12:00:00' + INTERVAL '1 day', v_date + TIME '13:45:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '15:45:00' + INTERVAL '1 day', v_date + TIME '16:30:00' + INTERVAL '1 day', 'nap');

  -- Day 5
  v_date := CURRENT_DATE - INTERVAL '5 days';

  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '19:45:00', v_date + TIME '03:00:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '03:30:00' + INTERVAL '1 day', v_date + TIME '07:00:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '08:30:00' + INTERVAL '1 day', v_date + TIME '10:00:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '12:15:00' + INTERVAL '1 day', v_date + TIME '14:15:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '16:15:00' + INTERVAL '1 day', v_date + TIME '16:50:00' + INTERVAL '1 day', 'nap');

  -- Day 4
  v_date := CURRENT_DATE - INTERVAL '4 days';

  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '20:00:00', v_date + TIME '02:30:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '03:00:00' + INTERVAL '1 day', v_date + TIME '06:30:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '08:00:00' + INTERVAL '1 day', v_date + TIME '09:00:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '11:45:00' + INTERVAL '1 day', v_date + TIME '13:30:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '15:30:00' + INTERVAL '1 day', v_date + TIME '16:15:00' + INTERVAL '1 day', 'nap');

  -- Day 3
  v_date := CURRENT_DATE - INTERVAL '3 days';

  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '19:30:00', v_date + TIME '01:45:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '02:15:00' + INTERVAL '1 day', v_date + TIME '06:45:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '08:15:00' + INTERVAL '1 day', v_date + TIME '09:45:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '12:30:00' + INTERVAL '1 day', v_date + TIME '14:00:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '16:00:00' + INTERVAL '1 day', v_date + TIME '16:40:00' + INTERVAL '1 day', 'nap');

  -- Day 2
  v_date := CURRENT_DATE - INTERVAL '2 days';

  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '19:15:00', v_date + TIME '02:00:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '02:30:00' + INTERVAL '1 day', v_date + TIME '07:00:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '08:30:00' + INTERVAL '1 day', v_date + TIME '10:00:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '12:00:00' + INTERVAL '1 day', v_date + TIME '13:45:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '15:45:00' + INTERVAL '1 day', v_date + TIME '16:25:00' + INTERVAL '1 day', 'nap');

  -- Yesterday
  v_date := CURRENT_DATE - INTERVAL '1 day';

  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '19:45:00', v_date + TIME '02:15:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '02:45:00' + INTERVAL '1 day', v_date + TIME '06:30:00' + INTERVAL '1 day', 'night'),
  (v_child_id, v_date + TIME '08:00:00' + INTERVAL '1 day', v_date + TIME '09:15:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '12:15:00' + INTERVAL '1 day', v_date + TIME '14:00:00' + INTERVAL '1 day', 'nap'),
  (v_child_id, v_date + TIME '16:00:00' + INTERVAL '1 day', v_date + TIME '16:45:00' + INTERVAL '1 day', 'nap');

  -- Today (with some completed and maybe one in progress)
  v_date := CURRENT_DATE;

  -- Night sleep from last night
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date - INTERVAL '1 day' + TIME '19:30:00', v_date + TIME '02:00:00', 'night'),
  (v_child_id, v_date + TIME '02:30:00', v_date + TIME '06:45:00', 'night');

  -- Morning nap (completed)
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '08:15:00', v_date + TIME '09:30:00', 'nap');

  -- Afternoon nap (completed)
  INSERT INTO sleep_sessions (child_id, start_time, end_time, sleep_type) VALUES
  (v_child_id, v_date + TIME '12:30:00', v_date + TIME '14:15:00', 'nap');

  RAISE NOTICE 'Successfully created % sleep sessions for child %', 37, v_child_id;
  RAISE NOTICE 'You can now view the dashboard and insights!';

END $$;

-- Verify the data
SELECT
  c.name as child_name,
  COUNT(s.id) as total_sessions,
  COUNT(CASE WHEN s.end_time IS NOT NULL THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN s.end_time IS NULL THEN 1 END) as active_sessions
FROM children c
LEFT JOIN sleep_sessions s ON s.child_id = c.id
WHERE c.user_id = (SELECT id FROM auth.users WHERE email = 'alecburrett@gmail.com')
GROUP BY c.id, c.name;
