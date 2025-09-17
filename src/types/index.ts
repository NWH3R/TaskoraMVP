export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  status: 'todo' | 'in-progress' | 'completed';
  due_date?: string;
  user_id: string;
  tribe_id?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  tags?: string[];
}

export interface Tribe {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  members?: TribeMember[];
}

export interface TribeMember {
  id: string;
  tribe_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: User;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirements: Record<string, any>;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  trialDays?: number;
  features: string[];
  stripe_price_id: string;
  max_tasks: number;
  max_tribes: number;
}