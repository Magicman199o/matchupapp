import { supabase } from "@/integrations/supabase/client";

export interface Participant {
  id: string;
  name: string;
  whatsapp: string;
  gender: 'male' | 'female' | 'other';
  group_name: string;
  signup_date: string;
  match_reveal_date: string;
  matched_to?: string | null;
  matched_by?: string | null;
  match_viewed?: boolean;
}

export interface Profile {
  id?: string;
  participant_id: string;
  photo_url?: string | null;
  about?: string | null;
  interests?: string[] | null;
  wishlist?: string | null;
  relationship_status?: string | null;
  profile_visible: boolean;
}

const MATCH_DELAY_DAYS = 1; // Changed to 24 hours

// Normalize group name: remove spaces, convert to lowercase, letters only
export function normalizeGroupName(name: string): string {
  return name.replace(/[^a-zA-Z]/g, '').toLowerCase();
}

export async function getParticipants(): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('signup_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
  
  return data as Participant[];
}

export async function getParticipantsByGroup(groupName: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('group_name', groupName)
    .order('signup_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching participants by group:', error);
    return [];
  }
  
  return data as Participant[];
}

export async function getGroups(): Promise<{ name: string; count: number }[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('group_name');
  
  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
  
  const groupCounts: Record<string, number> = {};
  data.forEach(p => {
    groupCounts[p.group_name] = (groupCounts[p.group_name] || 0) + 1;
  });
  
  return Object.entries(groupCounts).map(([name, count]) => ({ name, count }));
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem('matchup_current_user');
}

export async function getCurrentUser(): Promise<Participant | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
  
  return data as Participant;
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem('matchup_current_user', userId);
}

export function clearCurrentUser(): void {
  localStorage.removeItem('matchup_current_user');
}

export async function registerParticipant(
  name: string, 
  whatsapp: string, 
  gender: 'male' | 'female' | 'other',
  groupName: string
): Promise<Participant | null> {
  const signupDate = new Date();
  const matchRevealDate = new Date(signupDate.getTime() + MATCH_DELAY_DAYS * 24 * 60 * 60 * 1000);
  
  // Normalize group name for consistency
  const normalizedGroupName = normalizeGroupName(groupName);
  
  const { data, error } = await supabase
    .from('participants')
    .insert({
      name,
      whatsapp,
      gender,
      group_name: normalizedGroupName,
      signup_date: signupDate.toISOString(),
      match_reveal_date: matchRevealDate.toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error registering participant:', error);
    return null;
  }
  
  // Trigger matching for the new user's group
  await performGroupMatching(normalizedGroupName);
  
  setCurrentUser(data.id);
  return data as Participant;
}

// Use database function for atomic matching
export async function performGroupMatching(groupName: string): Promise<number> {
  const { data, error } = await supabase.rpc('perform_group_matching', {
    p_group_name: groupName
  });
  
  if (error) {
    console.error('Error performing group matching:', error);
    return 0;
  }
  
  return data || 0;
}

// Shuffle matches for a group (only affects users who haven't viewed their match)
export async function shuffleGroupMatches(groupName: string): Promise<number> {
  const { data, error } = await supabase.rpc('shuffle_group_matches', {
    p_group_name: groupName
  });
  
  if (error) {
    console.error('Error shuffling group matches:', error);
    return 0;
  }
  
  return data || 0;
}

// Mark match as viewed (prevents shuffle from affecting this user)
export async function markMatchViewed(userId: string): Promise<void> {
  const { error } = await supabase
    .from('participants')
    .update({ match_viewed: true })
    .eq('id', userId);
  
  if (error) {
    console.error('Error marking match as viewed:', error);
  }
}

export async function getMatchDetails(userId: string): Promise<{ matchedTo: Participant | null; matchedBy: Participant | null }> {
  // Get the current user
  const { data: user, error: userError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError || !user) {
    console.error('Error fetching user:', userError);
    return { matchedTo: null, matchedBy: null };
  }
  
  let matchedTo: Participant | null = null;
  let matchedBy: Participant | null = null;
  
  if (user.matched_to) {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('id', user.matched_to)
      .single();
    matchedTo = data as Participant | null;
  }
  
  if (user.matched_by) {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('id', user.matched_by)
      .single();
    matchedBy = data as Participant | null;
  }
  
  return { matchedTo, matchedBy };
}

export function formatWhatsAppLink(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}`;
}

// Admin functions
export function getAdminSession(): boolean {
  return localStorage.getItem('matchup_admin_session') === 'true';
}

export function setAdminSession(isLoggedIn: boolean): void {
  if (isLoggedIn) {
    localStorage.setItem('matchup_admin_session', 'true');
  } else {
    localStorage.removeItem('matchup_admin_session');
  }
}

export async function verifyAdminLogin(email: string, password: string): Promise<boolean> {
  // Admin credentials verification
  if (email === 'admin@matchuppapp.co' && password === 'Fola#Matchup2026') {
    return true;
  }
  
  return false;
}

// Login participant by name, group, and whatsapp
export async function loginParticipant(
  name: string, 
  whatsapp: string, 
  groupName: string
): Promise<Participant | null> {
  const normalizedGroupName = normalizeGroupName(groupName);
  
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('name', name)
    .eq('whatsapp', whatsapp)
    .eq('group_name', normalizedGroupName)
    .single();
  
  if (error || !data) {
    console.error('Login failed:', error);
    return null;
  }
  
  setCurrentUser(data.id);
  return data as Participant;
}

// Profile functions
export async function getProfile(participantId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('participant_id', participantId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile | null;
}

export async function upsertProfile(profile: Omit<Profile, 'id'>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        participant_id: profile.participant_id,
        photo_url: profile.photo_url,
        about: profile.about,
        interests: profile.interests,
        wishlist: profile.wishlist,
        relationship_status: profile.relationship_status,
        profile_visible: profile.profile_visible,
      },
      { onConflict: 'participant_id' }
    );
  
  if (error) {
    console.error('Error upserting profile:', error);
    return false;
  }
  
  return true;
}

export async function uploadProfilePhoto(participantId: string, file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${participantId}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file, { upsert: true });
  
  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    return null;
  }
  
  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
}
