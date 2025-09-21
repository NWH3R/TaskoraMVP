/*
  # Reset Demo Account to Starting Level

  1. Clean Up
    - Remove all existing demo account data
    - Reset user stats to starting level
    
  2. Starting Setup
    - Basic user profile (free tier, level 1, 0 points)
    - 2-3 simple tasks across different quadrants
    - No tribes initially
    - No achievements earned
    - Clean slate for new user experience
*/

-- Clean up existing demo account data
DELETE FROM task_comments WHERE task_id IN (
  SELECT id FROM tasks WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
  )
);

DELETE FROM task_attachments WHERE task_id IN (
  SELECT id FROM tasks WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
  )
);

DELETE FROM tasks WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
);

DELETE FROM tribe_members WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
);

DELETE FROM tribes WHERE owner_id = (
  SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
);

DELETE FROM user_achievements WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
);

DELETE FROM notifications WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
);

DELETE FROM activity_logs WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
);

-- Reset user profile to starting level
UPDATE users 
SET 
  subscription_tier = 'free',
  points = 0,
  level = 1,
  updated_at = now()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'
);

-- Create a few starter tasks to show the matrix in action
INSERT INTO tasks (title, description, priority, status, user_id, created_at) VALUES
(
  'Complete project proposal',
  'Finish the quarterly project proposal for the client meeting tomorrow',
  'urgent-important',
  'todo',
  (SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'),
  now() - interval '2 hours'
),
(
  'Learn new productivity techniques',
  'Research and implement new productivity methods to improve workflow',
  'not-urgent-important',
  'todo',
  (SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'),
  now() - interval '1 day'
),
(
  'Respond to non-critical emails',
  'Clear out inbox of routine emails and administrative messages',
  'urgent-not-important',
  'todo',
  (SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'),
  now() - interval '3 hours'
);

-- Add one welcome notification
INSERT INTO notifications (user_id, title, message, type, read, created_at) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'),
  'Welcome to Taskora!',
  'Start organizing your tasks using the Eisenhower Matrix for maximum productivity.',
  'info',
  false,
  now()
);

-- Add initial activity log
INSERT INTO activity_logs (user_id, action, resource_type, metadata, created_at) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'demo@taskora.eu'),
  'account_created',
  'user',
  '{"welcome": true}',
  now()
);