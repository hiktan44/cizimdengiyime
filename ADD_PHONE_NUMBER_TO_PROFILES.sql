-- Add phone_number column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update the handle_new_user function to include phone_number if available in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, is_admin, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    10,  -- Default credits (consistent with previous migration)
    false, -- Default not admin
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the admin RPC function to include phone_number
CREATE OR REPLACE FUNCTION get_admin_active_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone_number text, -- New column
  credits int,
  is_admin boolean,
  total_generations bigint,
  total_credits_used bigint,
  created_at timestamptz,
  last_activity timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone_number, -- Select phone number
    p.credits,
    p.is_admin,
    COUNT(g.id) as total_generations,
    COALESCE(SUM(g.credits_used), 0) as total_credits_used,
    p.created_at,
    MAX(g.created_at) as last_activity
  FROM profiles p
  LEFT JOIN generations g ON p.id = g.user_id
  GROUP BY p.id
  ORDER BY p.created_at DESC;
END;
$$;
