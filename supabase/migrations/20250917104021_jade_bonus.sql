/*
  # Reset Database - Complete Schema Recreation

  This migration will:
  1. Drop all existing tables and their dependencies
  2. Recreate the complete Taskora database schema
  3. Set up all security policies and indexes
  4. Pre-populate achievements data

  ## Tables Created:
  - users (user profiles with gamification)
  - tasks (Eisenhower Matrix task management)
  - tribes (team collaboration)
  - tribe_members (membership management)
  - achievements (gamification system)
  - user_achievements (progress tracking)
  - notifications (in-app notifications)
  - activity_logs (user activity tracking)
  - task_comments (task discussions)
  - task_attachments (file uploads)
  - tribe_invitations (invitation system)
  - user_settings (user preferences)
  - stripe_customers (payment integration)
  - stripe_subscriptions (subscription management)
  - stripe_orders (one-time payments)
  - stripe_user_subscriptions (subscription view)

  ## Security:
  - Row Level Security enabled on all tables
  - Proper access policies for data isolation
  - Role-based permissions for tribes
*/

-- Drop all existing tables (in reverse dependency order)
DROP TABLE IF EXISTS stripe_user_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_orders CASCADE;
DROP TABLE IF EXISTS stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_customers CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS tribe_invitations CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS tribe_members CASCADE;
DROP TABLE IF EXISTS tribes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table (extends auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free',
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table (Eisenhower Matrix)
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority text NOT NULL CHECK (priority IN ('urgent-important', 'not-urgent-important', 'urgent-not-important', 'not-urgent-not-important')),
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  due_date timestamptz,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tribe_id uuid,
  assigned_to uuid REFERENCES users(id),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tribes table (team collaboration)
CREATE TABLE tribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tribe members table
CREATE TABLE tribe_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id uuid NOT NULL REFERENCES tribes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(tribe_id, user_id)
);

-- Achievements table (gamification)
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏆',
  points integer DEFAULT 0,
  category text DEFAULT 'general',
  requirements jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User achievements table
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Task comments table
CREATE TABLE task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task attachments table
CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now()
);

-- Tribe invitations table
CREATE TABLE tribe_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id uuid NOT NULL REFERENCES tribes(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- User settings table
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme text DEFAULT 'light',
  language text DEFAULT 'en',
  notifications jsonb DEFAULT '{"email": true, "push": true, "in_app": true}',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stripe customers table
CREATE TABLE stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Stripe subscriptions table
CREATE TABLE stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text UNIQUE NOT NULL,
  subscription_id text UNIQUE,
  price_id text,
  status text DEFAULT 'not_started',
  current_period_start integer,
  current_period_end integer,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stripe orders table (for one-time payments)
CREATE TABLE stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id text UNIQUE NOT NULL,
  payment_intent_id text,
  customer_id text NOT NULL,
  amount_subtotal integer,
  amount_total integer,
  currency text DEFAULT 'eur',
  payment_status text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Stripe user subscriptions view (for easy querying)
CREATE VIEW stripe_user_subscriptions AS
SELECT 
  u.id as user_id,
  sc.customer_id,
  ss.subscription_id,
  ss.price_id,
  ss.status,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end
FROM users u
LEFT JOIN stripe_customers sc ON u.id = sc.user_id AND sc.deleted_at IS NULL
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id;

-- Add foreign key constraint for tasks.tribe_id
ALTER TABLE tasks ADD CONSTRAINT tasks_tribe_id_fkey 
  FOREIGN KEY (tribe_id) REFERENCES tribes(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_tribe_id ON tasks(tribe_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tribe_members_tribe_id ON tribe_members(tribe_id);
CREATE INDEX idx_tribe_members_user_id ON tribe_members(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tribes_updated_at BEFORE UPDATE ON tribes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at BEFORE UPDATE ON stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tribe_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to OR
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid()
    )
  );

-- Tribes policies
CREATE POLICY "Users can read tribes they belong to" ON tribes
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tribe owners can manage their tribes" ON tribes
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id);

-- Tribe members policies
CREATE POLICY "Users can read tribe memberships" ON tribe_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tribe owners and admins can manage members" ON tribe_members
  FOR ALL TO authenticated
  USING (
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Achievements policies (public read)
CREATE POLICY "Anyone can read achievements" ON achievements
  FOR SELECT TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can read own achievements" ON user_achievements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can read own activity" ON activity_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can log user activity" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Task comments policies
CREATE POLICY "Users can read comments on accessible tasks" ON task_comments
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE 
        user_id = auth.uid() OR 
        assigned_to = auth.uid() OR
        tribe_id IN (
          SELECT tribe_id FROM tribe_members 
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can manage own comments" ON task_comments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Task attachments policies
CREATE POLICY "Users can read attachments on accessible tasks" ON task_attachments
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE 
        user_id = auth.uid() OR 
        assigned_to = auth.uid() OR
        tribe_id IN (
          SELECT tribe_id FROM tribe_members 
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can manage own attachments" ON task_attachments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Tribe invitations policies
CREATE POLICY "Users can read invitations for their tribes" ON tribe_invitations
  FOR SELECT TO authenticated
  USING (
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Tribe admins can manage invitations" ON tribe_invitations
  FOR ALL TO authenticated
  USING (
    tribe_id IN (
      SELECT tribe_id FROM tribe_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- User settings policies
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Stripe policies
CREATE POLICY "Users can read own stripe data" ON stripe_customers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own subscription data" ON stripe_subscriptions
  FOR SELECT TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own order data" ON stripe_orders
  FOR SELECT TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = auth.uid()
    )
  );

-- Insert default achievements
INSERT INTO achievements (title, description, icon, points, category, requirements) VALUES
  ('First Task', 'Create your first task', '🎯', 10, 'tasks', '{"tasks_created": 1}'),
  ('Task Master', 'Complete 10 tasks', '🏆', 50, 'tasks', '{"tasks_completed": 10}'),
  ('Productivity Pro', 'Complete 100 tasks', '⭐', 200, 'tasks', '{"tasks_completed": 100}'),
  ('Team Player', 'Join your first tribe', '👥', 25, 'collaboration', '{"tribes_joined": 1}'),
  ('Tribe Leader', 'Create your first tribe', '👑', 50, 'collaboration', '{"tribes_created": 1}'),
  ('Social Butterfly', 'Join 5 tribes', '🦋', 100, 'social', '{"tribes_joined": 5}'),
  ('Week Warrior', 'Complete 7 tasks in a week', '📅', 75, 'productivity', '{"weekly_tasks": 7}'),
  ('Early Bird', 'Complete a task before 9 AM', '🌅', 30, 'productivity', '{"early_completion": 1}'),
  ('Night Owl', 'Complete a task after 10 PM', '🦉', 30, 'productivity', '{"late_completion": 1}'),
  ('Streak Master', 'Complete tasks for 7 consecutive days', '🔥', 150, 'productivity', '{"daily_streak": 7}');