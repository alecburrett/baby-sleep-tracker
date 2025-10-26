-- Baby Sleep Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sleep sessions table
CREATE TABLE IF NOT EXISTS sleep_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  sleep_type TEXT CHECK (sleep_type IN ('nap', 'night')),
  location TEXT,
  wake_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_child_id ON sleep_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_start_time ON sleep_sessions(start_time);

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children table
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sleep_sessions table
CREATE POLICY "Users can view sleep sessions for their children"
  ON sleep_sessions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sleep sessions for their children"
  ON sleep_sessions FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sleep sessions for their children"
  ON sleep_sessions FOR UPDATE
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sleep sessions for their children"
  ON sleep_sessions FOR DELETE
  USING (
    child_id IN (
      SELECT id FROM children WHERE user_id = auth.uid()
    )
  );
