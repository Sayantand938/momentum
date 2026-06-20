-- Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_sessions_end_at ON sessions(end_at);
CREATE INDEX idx_sessions_start_at ON sessions(start_at);

-- Disable RLS (Row Level Security) for personal app
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;