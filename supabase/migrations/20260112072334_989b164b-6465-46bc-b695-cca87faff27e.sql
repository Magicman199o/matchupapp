-- Create profiles table for user profile information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL UNIQUE REFERENCES public.participants(id) ON DELETE CASCADE,
  photo_url TEXT,
  about TEXT,
  interests TEXT[],
  wishlist TEXT,
  relationship_status TEXT,
  profile_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Anyone can view visible profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create their profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their profile" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('profile-photos', 'profile-photos', true, 614400);

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can upload profile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can update profile photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Anyone can delete their profile photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos');

-- Update the matching function to be one-way (not reciprocal)
CREATE OR REPLACE FUNCTION public.perform_group_matching(p_group_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  unmatched_participant RECORD;
  potential_match RECORD;
  matches_made INTEGER := 0;
BEGIN
  -- Find participants without a matched_to assignment
  FOR unmatched_participant IN 
    SELECT * FROM participants 
    WHERE group_name = p_group_name 
    AND matched_to IS NULL
    ORDER BY signup_date ASC
  LOOP
    -- Find someone who isn't this participant and hasn't been matched BY this person yet
    -- Prefer opposite gender, then same gender
    SELECT * INTO potential_match
    FROM participants
    WHERE group_name = p_group_name
    AND id != unmatched_participant.id
    AND id NOT IN (
      SELECT matched_to FROM participants 
      WHERE group_name = p_group_name 
      AND matched_to IS NOT NULL
    )
    ORDER BY 
      CASE WHEN gender != unmatched_participant.gender THEN 0 ELSE 1 END,
      signup_date ASC
    LIMIT 1;
    
    IF potential_match.id IS NOT NULL THEN
      -- Create one-way match: unmatched_participant matches WITH potential_match
      UPDATE participants SET matched_to = potential_match.id WHERE id = unmatched_participant.id;
      -- Update the matched_by for the target
      UPDATE participants SET matched_by = unmatched_participant.id WHERE id = potential_match.id;
      matches_made := matches_made + 1;
    END IF;
  END LOOP;
  
  RETURN matches_made;
END;
$$;

-- Update shuffle function to preserve one-way matching
CREATE OR REPLACE FUNCTION public.shuffle_group_matches(p_group_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Clear matched_to for users who haven't viewed their match
  UPDATE participants
  SET matched_to = NULL
  WHERE group_name = p_group_name
  AND match_viewed = false
  AND matched_to IS NOT NULL;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Clear matched_by for users whose matcher hasn't viewed yet
  UPDATE participants p1
  SET matched_by = NULL
  WHERE group_name = p_group_name
  AND matched_by IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM participants p2 
    WHERE p2.id = p1.matched_by 
    AND p2.match_viewed = false
  );
  
  -- Re-run matching
  PERFORM perform_group_matching(p_group_name);
  
  RETURN affected_count;
END;
$$;