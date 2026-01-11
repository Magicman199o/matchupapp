export interface Participant {
  id: string;
  name: string;
  whatsapp: string;
  gender: 'male' | 'female' | 'other';
  signupDate: string;
  matchRevealDate: string;
  matchedTo?: string; // ID of person they matched with
  matchedBy?: string; // ID of person who matched with them
}

const STORAGE_KEY = 'matchup_participants';
const MATCH_DELAY_DAYS = 4;

export function getParticipants(): Participant[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveParticipants(participants: Participant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
}

export function getCurrentUser(): Participant | null {
  const userId = localStorage.getItem('matchup_current_user');
  if (!userId) return null;
  const participants = getParticipants();
  return participants.find(p => p.id === userId) || null;
}

export function setCurrentUser(userId: string): void {
  localStorage.setItem('matchup_current_user', userId);
}

export function clearCurrentUser(): void {
  localStorage.removeItem('matchup_current_user');
}

export function registerParticipant(name: string, whatsapp: string, gender: 'male' | 'female' | 'other'): Participant {
  const participants = getParticipants();
  
  const signupDate = new Date();
  const matchRevealDate = new Date(signupDate.getTime() + MATCH_DELAY_DAYS * 24 * 60 * 60 * 1000);
  
  const newParticipant: Participant = {
    id: crypto.randomUUID(),
    name,
    whatsapp,
    gender,
    signupDate: signupDate.toISOString(),
    matchRevealDate: matchRevealDate.toISOString(),
  };
  
  participants.push(newParticipant);
  saveParticipants(participants);
  setCurrentUser(newParticipant.id);
  
  return newParticipant;
}

export function performMatching(userId: string): { matchedTo: Participant | null; matchedBy: Participant | null } {
  const participants = getParticipants();
  const user = participants.find(p => p.id === userId);
  
  if (!user) return { matchedTo: null, matchedBy: null };
  
  // Check if reveal date has passed
  const now = new Date();
  const revealDate = new Date(user.matchRevealDate);
  
  if (now < revealDate) {
    return { matchedTo: null, matchedBy: null };
  }
  
  // Get eligible participants (excluding self)
  const eligible = participants.filter(p => p.id !== userId);
  
  if (eligible.length === 0) {
    return { matchedTo: null, matchedBy: null };
  }
  
  // If user doesn't have a match yet, perform matching
  if (!user.matchedTo) {
    // Priority: opposite gender, fallback: same gender
    const oppositeGender = user.gender === 'male' ? 'female' : user.gender === 'female' ? 'male' : 'other';
    
    let candidates = eligible.filter(p => p.gender === oppositeGender && !isMatchedBy(p.id, participants));
    
    if (candidates.length === 0) {
      candidates = eligible.filter(p => !isMatchedBy(p.id, participants));
    }
    
    if (candidates.length === 0) {
      candidates = eligible;
    }
    
    // Random selection
    const matchedTo = candidates[Math.floor(Math.random() * candidates.length)];
    
    // Update user's matchedTo
    user.matchedTo = matchedTo.id;
    
    // Update matched person's matchedBy
    const matchedPerson = participants.find(p => p.id === matchedTo.id);
    if (matchedPerson) {
      matchedPerson.matchedBy = user.id;
    }
    
    saveParticipants(participants);
  }
  
  // Get updated participants
  const updatedParticipants = getParticipants();
  const updatedUser = updatedParticipants.find(p => p.id === userId);
  
  const matchedTo = updatedUser?.matchedTo 
    ? updatedParticipants.find(p => p.id === updatedUser.matchedTo) || null 
    : null;
    
  const matchedBy = updatedUser?.matchedBy
    ? updatedParticipants.find(p => p.id === updatedUser.matchedBy) || null
    : null;
  
  return { matchedTo, matchedBy };
}

function isMatchedBy(participantId: string, participants: Participant[]): boolean {
  return participants.some(p => p.matchedTo === participantId);
}

export function formatWhatsAppLink(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}`;
}
