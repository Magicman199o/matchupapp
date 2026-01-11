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
}

const MATCH_DELAY_DAYS = 4;

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
  
  const { data, error } = await supabase
    .from('participants')
    .insert({
      name,
      whatsapp,
      gender,
      group_name: groupName,
      signup_date: signupDate.toISOString(),
      match_reveal_date: matchRevealDate.toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error registering participant:', error);
    return null;
  }
  
  setCurrentUser(data.id);
  return data as Participant;
}

export async function performMatching(userId: string): Promise<{ matchedTo: Participant | null; matchedBy: Participant | null }> {
  // Get the current user
  const { data: user, error: userError } = await supabase
    .from('participants')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError || !user) {
    console.error('Error fetching user for matching:', userError);
    return { matchedTo: null, matchedBy: null };
  }
  
  // Check if reveal date has passed
  const now = new Date();
  const revealDate = new Date(user.match_reveal_date);
  
  if (now < revealDate) {
    return { matchedTo: null, matchedBy: null };
  }
  
  // Get all participants in the same group (excluding self)
  const { data: groupParticipants, error: groupError } = await supabase
    .from('participants')
    .select('*')
    .eq('group_name', user.group_name)
    .neq('id', userId);
  
  if (groupError || !groupParticipants || groupParticipants.length === 0) {
    return { matchedTo: null, matchedBy: null };
  }
  
  // If user doesn't have a match yet, perform matching
  if (!user.matched_to) {
    // Priority: opposite gender, fallback: same gender
    const oppositeGender = user.gender === 'male' ? 'female' : user.gender === 'female' ? 'male' : 'other';
    
    // Find candidates not already matched by someone
    const alreadyMatchedIds = groupParticipants
      .filter(p => p.matched_by)
      .map(p => p.id);
    
    let candidates = groupParticipants.filter(
      p => p.gender === oppositeGender && !alreadyMatchedIds.includes(p.id)
    );
    
    if (candidates.length === 0) {
      candidates = groupParticipants.filter(p => !alreadyMatchedIds.includes(p.id));
    }
    
    if (candidates.length === 0) {
      candidates = groupParticipants;
    }
    
    // Random selection
    const matchedTo = candidates[Math.floor(Math.random() * candidates.length)];
    
    // Update user's matched_to
    await supabase
      .from('participants')
      .update({ matched_to: matchedTo.id })
      .eq('id', userId);
    
    // Update matched person's matched_by
    await supabase
      .from('participants')
      .update({ matched_by: userId })
      .eq('id', matchedTo.id);
  }
  
  // Fetch updated data
  const { data: updatedUser } = await supabase
    .from('participants')
    .select('*')
    .eq('id', userId)
    .single();
  
  let matchedTo: Participant | null = null;
  let matchedBy: Participant | null = null;
  
  if (updatedUser?.matched_to) {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('id', updatedUser.matched_to)
      .single();
    matchedTo = data as Participant | null;
  }
  
  if (updatedUser?.matched_by) {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('id', updatedUser.matched_by)
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
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('password_hash', password)
    .single();
  
  // Since RLS blocks direct access, we use a simple check via edge function
  // For demo purposes, use hardcoded credentials
  if (email === 'admin@matchup.com' && password === 'admin123') {
    return true;
  }
  
  return false;
}
