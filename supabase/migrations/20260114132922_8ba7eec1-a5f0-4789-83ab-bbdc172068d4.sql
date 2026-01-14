-- Create groups table for admin-managed groups
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Anyone can read groups
CREATE POLICY "Anyone can read groups"
  ON public.groups FOR SELECT
  USING (true);

-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Anyone can read sponsors
CREATE POLICY "Anyone can read sponsors"
  ON public.sponsors FOR SELECT
  USING (true);

-- Anyone can insert sponsors (admin will handle via UI)
CREATE POLICY "Anyone can insert sponsors"
  ON public.sponsors FOR INSERT
  WITH CHECK (true);

-- Anyone can update sponsors
CREATE POLICY "Anyone can update sponsors"
  ON public.sponsors FOR UPDATE
  USING (true);

-- Anyone can delete sponsors
CREATE POLICY "Anyone can delete sponsors"
  ON public.sponsors FOR DELETE
  USING (true);

-- Add insert/update/delete for groups
CREATE POLICY "Anyone can insert groups"
  ON public.groups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update groups"
  ON public.groups FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete groups"
  ON public.groups FOR DELETE
  USING (true);

-- Update perform_group_matching to do 3-way circular matching (A→B, B→C, C→A)
CREATE OR REPLACE FUNCTION public.perform_group_matching(p_group_name text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  participant_ids UUID[];
  i INTEGER;
  n INTEGER;
  matches_made INTEGER := 0;
BEGIN
  -- Get all unmatched participants in the group, ordered by signup_date
  SELECT ARRAY_AGG(id ORDER BY signup_date ASC) INTO participant_ids
  FROM participants
  WHERE group_name = p_group_name
  AND matched_to IS NULL;
  
  IF participant_ids IS NULL THEN
    RETURN 0;
  END IF;
  
  n := array_length(participant_ids, 1);
  
  IF n IS NULL OR n < 2 THEN
    RETURN 0;
  END IF;
  
  -- Create circular matching: participant[i] matched_to participant[(i+1) mod n]
  FOR i IN 1..n LOOP
    UPDATE participants 
    SET matched_to = participant_ids[((i % n) + 1)]
    WHERE id = participant_ids[i];
    
    -- Update matched_by for the target
    UPDATE participants 
    SET matched_by = participant_ids[i]
    WHERE id = participant_ids[((i % n) + 1)];
    
    matches_made := matches_made + 1;
  END LOOP;
  
  RETURN matches_made;
END;
$function$;

-- Update shuffle_group_matches to work with circular matching
CREATE OR REPLACE FUNCTION public.shuffle_group_matches(p_group_name text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
  
  -- Re-run matching with circular algorithm
  PERFORM perform_group_matching(p_group_name);
  
  RETURN affected_count;
END;
$function$;

-- Add name to profiles table for users to update their display name
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;