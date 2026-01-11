-- Add match_viewed field to track when a user has viewed their match (prevents shuffle after viewing)
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS match_viewed BOOLEAN DEFAULT FALSE;

-- Create atomic matching function for admin to match all users in a group
CREATE OR REPLACE FUNCTION perform_group_matching(p_group_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_matched_count INTEGER := 0;
  v_participant RECORD;
  v_candidate RECORD;
BEGIN
  -- Loop through all unmatched participants in the group
  FOR v_participant IN 
    SELECT * FROM participants 
    WHERE group_name = p_group_name 
    AND matched_to IS NULL
    ORDER BY created_at
    FOR UPDATE
  LOOP
    -- Find an available candidate (prioritize opposite gender)
    SELECT * INTO v_candidate
    FROM participants
    WHERE group_name = p_group_name
      AND id != v_participant.id
      AND matched_by IS NULL
      AND gender = CASE 
        WHEN v_participant.gender = 'male' THEN 'female'
        WHEN v_participant.gender = 'female' THEN 'male'
        ELSE v_participant.gender
      END
    ORDER BY random()
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    -- If no opposite gender, try same gender
    IF v_candidate IS NULL THEN
      SELECT * INTO v_candidate
      FROM participants
      WHERE group_name = p_group_name
        AND id != v_participant.id
        AND matched_by IS NULL
      ORDER BY random()
      LIMIT 1
      FOR UPDATE SKIP LOCKED;
    END IF;
    
    -- If still no candidate, skip this participant
    IF v_candidate IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Perform the match
    UPDATE participants SET matched_to = v_candidate.id WHERE id = v_participant.id;
    UPDATE participants SET matched_by = v_participant.id WHERE id = v_candidate.id;
    
    v_matched_count := v_matched_count + 1;
  END LOOP;
  
  RETURN v_matched_count;
END;
$$;

-- Create shuffle function that only affects users who haven't viewed their match
CREATE OR REPLACE FUNCTION shuffle_group_matches(p_group_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cleared_count INTEGER := 0;
BEGIN
  -- Clear all matches for participants who haven't viewed their match yet
  UPDATE participants
  SET matched_to = NULL, matched_by = NULL
  WHERE group_name = p_group_name
    AND match_viewed = FALSE;
  
  GET DIAGNOSTICS v_cleared_count = ROW_COUNT;
  
  -- Re-run matching for the group
  PERFORM perform_group_matching(p_group_name);
  
  RETURN v_cleared_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION perform_group_matching TO anon, authenticated;
GRANT EXECUTE ON FUNCTION shuffle_group_matches TO anon, authenticated;