export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'volunteer';
}

export interface Need {
  _id: string;
  orgId: { _id: string; name: string } | string;
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  schedule: string;
  scheduleDays: string[];
  status: 'open' | 'assigned' | 'fulfilled';
  createdAt: string;
}

export interface VolunteerProfile {
  _id: string;
  userId: string;
  skills: string[];
  availability: string[];
  location: string;
  socialCredits: number;
  active: boolean;
  bio?: string;
}

export interface Badge {
  label: string;
  emoji: string;
}

export interface Assignment {
  _id: string;
  needId: Need;
  volunteerId: string;
  matchScore: number;
  status: 'confirmed' | 'completed';
  assignedAt: string;
}

export interface MatchResult {
  volunteerId: string;
  name: string;
  email: string;
  skills: string[];
  location: string;
  availability: string[];
  socialCredits: number;
  matchScore: number;
  skillScore: number;
  locationScore: number;
  availabilityScore: number;
  urgencyScore: number;
  isAccepted: boolean;
  assignmentStatus: string | null;
}

export interface Message {
  _id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'volunteer';
  content: string;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  open: number;
  fulfilled: number;
  critical: number;
  volunteersHelped: number;
}

export interface ExtractedNeed {
  title: string;
  category: string;
  skillsRequired: string[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  schedule: string;
  scheduleDays: string[];
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'new_need' | 'task_fulfilled';
  title: string;
  message: string;
  needId: string;
  read: boolean;
  createdAt: string;
}
