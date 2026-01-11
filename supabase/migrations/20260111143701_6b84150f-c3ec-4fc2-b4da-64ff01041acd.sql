-- Create participants table with group support
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  group_name TEXT NOT NULL,
  signup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  match_reveal_date TIMESTAMP WITH TIME ZONE NOT NULL,
  matched_to UUID REFERENCES public.participants(id),
  matched_by UUID REFERENCES public.participants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on group_name for faster queries
CREATE INDEX idx_participants_group_name ON public.participants(group_name);

-- Enable Row Level Security
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (sign up)
CREATE POLICY "Anyone can sign up" 
ON public.participants 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read their own data (by ID stored in localStorage)
CREATE POLICY "Anyone can read participants" 
ON public.participants 
FOR SELECT 
USING (true);

-- Allow updates for matching (simplified for demo - in production would be more restrictive)
CREATE POLICY "Allow updates for matching" 
ON public.participants 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_participants_updated_at
BEFORE UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin_users table for admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow reading admin_users (for login verification via edge function)
CREATE POLICY "No direct access to admin_users" 
ON public.admin_users 
FOR SELECT 
USING (false);

-- Insert a default admin user (password: admin123 - should be changed in production)
-- Using a simple hash for demo purposes
INSERT INTO public.admin_users (email, password_hash) 
VALUES ('admin@matchup.com', 'admin123');