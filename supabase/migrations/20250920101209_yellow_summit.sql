/*
  # Setup Demo Account with Maximum Everything

  1. Demo User Setup
    - Create demo user profile with premium stats
    - Set maximum subscription tier
    - High level and points

  2. Sample Data
    - Multiple tribes with the demo user as owner
    - Variety of tasks across all priorities and statuses
    - All achievements unlocked
    - Rich activity history
    - Sample notifications

  3. Premium Features
    - Pro Tribe subscription
    - Maximum limits unlocked
    - All features available
*/

-- First, ensure the demo user exists in the users table
INSERT INTO users (
  id,
  email,
  full_name,
  subscription_tier,
  points,
  level,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- Fixed UUID for demo user
  'demo@taskora.eu',
  'Demo User',
  'pro',
  2500,
  15,
  now() - interval '6 months',
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  subscription_tier = EXCLUDED.subscription_tier,
  points = EXCLUDED.points,
  level = EXCLUDED.level,
  updated_at = EXCLUDED.updated_at;

-- Create user settings for demo user
INSERT INTO user_settings (
  user_id,
  theme,
  language,
  notifications,
  timezone,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'light',
  'en',
  '{"push": true, "email": true, "in_app": true}'::jsonb,
  'UTC',
  now() - interval '6 months',
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  theme = EXCLUDED.theme,
  language = EXCLUDED.language,
  notifications = EXCLUDED.notifications,
  timezone = EXCLUDED.timezone,
  updated_at = EXCLUDED.updated_at;

-- Create Stripe customer for demo user
INSERT INTO stripe_customers (
  user_id,
  customer_id,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'cus_demo_customer_123',
  now() - interval '6 months'
) ON CONFLICT (user_id) DO UPDATE SET
  customer_id = EXCLUDED.customer_id;

-- Create premium subscription for demo user
INSERT INTO stripe_subscriptions (
  customer_id,
  subscription_id,
  price_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  payment_method_brand,
  payment_method_last4,
  created_at,
  updated_at
) VALUES (
  'cus_demo_customer_123',
  'sub_demo_subscription_123',
  'price_1S5r7TQ4VdcoVfX8MOrplW47', -- Pro Tribe price ID
  'active',
  extract(epoch from (now() - interval '1 month'))::integer,
  extract(epoch from (now() + interval '1 month'))::integer,
  false,
  'visa',
  '4242',
  now() - interval '6 months',
  now()
) ON CONFLICT (customer_id) DO UPDATE SET
  subscription_id = EXCLUDED.subscription_id,
  price_id = EXCLUDED.price_id,
  status = EXCLUDED.status,
  current_period_start = EXCLUDED.current_period_start,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  payment_method_brand = EXCLUDED.payment_method_brand,
  payment_method_last4 = EXCLUDED.payment_method_last4,
  updated_at = EXCLUDED.updated_at;

-- Create multiple tribes for demo user
INSERT INTO tribes (
  id,
  name,
  description,
  owner_id,
  settings,
  created_at,
  updated_at
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Product Development Team',
    'Our main product development tribe focusing on building amazing features',
    '550e8400-e29b-41d4-a716-446655440000',
    '{"notifications": true, "public": false}'::jsonb,
    now() - interval '5 months',
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Marketing Squad',
    'Creative marketing team driving growth and engagement',
    '550e8400-e29b-41d4-a716-446655440000',
    '{"notifications": true, "public": true}'::jsonb,
    now() - interval '4 months',
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Design Studio',
    'UI/UX design team creating beautiful user experiences',
    '550e8400-e29b-41d4-a716-446655440000',
    '{"notifications": true, "public": false}'::jsonb,
    now() - interval '3 months',
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  settings = EXCLUDED.settings,
  updated_at = EXCLUDED.updated_at;

-- Add demo user as owner of all tribes
INSERT INTO tribe_members (
  tribe_id,
  user_id,
  role,
  joined_at
) VALUES 
  ('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'owner', now() - interval '5 months'),
  ('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'owner', now() - interval '4 months'),
  ('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'owner', now() - interval '3 months')
ON CONFLICT (tribe_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- Create diverse tasks across all priorities and statuses
INSERT INTO tasks (
  id,
  title,
  description,
  priority,
  status,
  due_date,
  user_id,
  tribe_id,
  tags,
  created_at,
  updated_at
) VALUES 
  -- Urgent & Important tasks
  (
    'task-001',
    'Fix Critical Security Vulnerability',
    'Address the security issue reported by our security audit team. This needs immediate attention.',
    'urgent-important',
    'in-progress',
    now() + interval '1 day',
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['security', 'critical', 'backend'],
    now() - interval '2 days',
    now()
  ),
  (
    'task-002',
    'Prepare Investor Presentation',
    'Create compelling presentation for Series A funding round next week.',
    'urgent-important',
    'todo',
    now() + interval '3 days',
    '550e8400-e29b-41d4-a716-446655440000',
    '22222222-2222-2222-2222-222222222222',
    ARRAY['presentation', 'funding', 'strategy'],
    now() - interval '1 day',
    now()
  ),
  (
    'task-003',
    'Launch Marketing Campaign',
    'Deploy the new product marketing campaign across all channels.',
    'urgent-important',
    'completed',
    now() - interval '1 day',
    '550e8400-e29b-41d4-a716-446655440000',
    '22222222-2222-2222-2222-222222222222',
    ARRAY['marketing', 'campaign', 'launch'],
    now() - interval '5 days',
    now() - interval '1 day'
  ),
  
  -- Not Urgent & Important tasks
  (
    'task-004',
    'Implement New Authentication System',
    'Upgrade to OAuth 2.0 with multi-factor authentication support.',
    'not-urgent-important',
    'in-progress',
    now() + interval '2 weeks',
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['auth', 'security', 'oauth'],
    now() - interval '1 week',
    now()
  ),
  (
    'task-005',
    'Design System Documentation',
    'Create comprehensive documentation for our design system components.',
    'not-urgent-important',
    'todo',
    now() + interval '3 weeks',
    '550e8400-e29b-41d4-a716-446655440000',
    '33333333-3333-3333-3333-333333333333',
    ARRAY['design', 'documentation', 'components'],
    now() - interval '3 days',
    now()
  ),
  (
    'task-006',
    'Performance Optimization',
    'Optimize application performance and reduce load times by 50%.',
    'not-urgent-important',
    'completed',
    now() - interval '1 week',
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['performance', 'optimization', 'frontend'],
    now() - interval '3 weeks',
    now() - interval '1 week'
  ),
  
  -- Urgent & Not Important tasks
  (
    'task-007',
    'Update Social Media Profiles',
    'Update company social media profiles with new branding.',
    'urgent-not-important',
    'completed',
    now() - interval '2 days',
    '550e8400-e29b-41d4-a716-446655440000',
    '22222222-2222-2222-2222-222222222222',
    ARRAY['social-media', 'branding', 'marketing'],
    now() - interval '4 days',
    now() - interval '2 days'
  ),
  (
    'task-008',
    'Respond to Customer Inquiries',
    'Reply to pending customer support tickets and inquiries.',
    'urgent-not-important',
    'in-progress',
    now() + interval '1 day',
    '550e8400-e29b-41d4-a716-446655440000',
    NULL,
    ARRAY['support', 'customer', 'communication'],
    now() - interval '1 day',
    now()
  ),
  
  -- Not Urgent & Not Important tasks
  (
    'task-009',
    'Organize Team Building Event',
    'Plan and organize quarterly team building activities.',
    'not-urgent-not-important',
    'todo',
    now() + interval '1 month',
    '550e8400-e29b-41d4-a716-446655440000',
    NULL,
    ARRAY['team', 'event', 'culture'],
    now() - interval '2 days',
    now()
  ),
  (
    'task-010',
    'Research New Technologies',
    'Explore emerging technologies that could benefit our product.',
    'not-urgent-not-important',
    'completed',
    now() - interval '1 week',
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['research', 'technology', 'innovation'],
    now() - interval '2 weeks',
    now() - interval '1 week'
  ),
  (
    'task-011',
    'Clean Up Development Environment',
    'Remove unused dependencies and clean up development setup.',
    'not-urgent-not-important',
    'todo',
    now() + interval '2 weeks',
    '550e8400-e29b-41d4-a716-446655440000',
    '11111111-1111-1111-1111-111111111111',
    ARRAY['cleanup', 'development', 'maintenance'],
    now() - interval '1 day',
    now()
  ),
  (
    'task-012',
    'Update Company Wiki',
    'Add new processes and update existing documentation in company wiki.',
    'not-urgent-not-important',
    'in-progress',
    now() + interval '3 weeks',
    '550e8400-e29b-41d4-a716-446655440000',
    NULL,
    ARRAY['documentation', 'wiki', 'processes'],
    now() - interval '5 days',
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  priority = EXCLUDED.priority,
  status = EXCLUDED.status,
  due_date = EXCLUDED.due_date,
  tribe_id = EXCLUDED.tribe_id,
  tags = EXCLUDED.tags,
  updated_at = EXCLUDED.updated_at;

-- Award ALL achievements to demo user
INSERT INTO user_achievements (
  user_id,
  achievement_id,
  earned_at
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  id,
  now() - (random() * interval '6 months')
FROM achievements
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Create sample notifications
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  read,
  data,
  created_at
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'Achievement Unlocked!',
    'Congratulations! You earned the "Productivity Pro" achievement.',
    'success',
    false,
    '{"achievement_id": "achievement-003", "points": 200}'::jsonb,
    now() - interval '1 hour'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'Task Due Soon',
    'Your task "Fix Critical Security Vulnerability" is due tomorrow.',
    'warning',
    false,
    '{"task_id": "task-001"}'::jsonb,
    now() - interval '2 hours'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'Welcome to Pro Tribe!',
    'Your subscription has been activated. Enjoy all premium features!',
    'success',
    true,
    '{"subscription": "pro"}'::jsonb,
    now() - interval '6 months'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'New Team Member',
    'Sarah Johnson joined your Product Development Team tribe.',
    'info',
    true,
    '{"tribe_id": "11111111-1111-1111-1111-111111111111"}'::jsonb,
    now() - interval '1 week'
  )
ON CONFLICT DO NOTHING;

-- Create activity logs
INSERT INTO activity_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  metadata,
  created_at
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'completed',
    'task',
    'task-003',
    '{"task_title": "Launch Marketing Campaign", "priority": "urgent-important"}'::jsonb,
    now() - interval '1 day'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'created',
    'tribe',
    '33333333-3333-3333-3333-333333333333',
    '{"tribe_name": "Design Studio"}'::jsonb,
    now() - interval '3 months'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'updated',
    'task',
    'task-001',
    '{"task_title": "Fix Critical Security Vulnerability", "status": "in-progress"}'::jsonb,
    now() - interval '1 hour'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'earned',
    'achievement',
    'achievement-001',
    '{"achievement_title": "First Task", "points": 10}'::jsonb,
    now() - interval '5 months'
  )
ON CONFLICT DO NOTHING;

-- Add some task comments
INSERT INTO task_comments (
  task_id,
  user_id,
  content,
  created_at,
  updated_at
) VALUES 
  (
    'task-001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Started working on this. The vulnerability affects the user authentication module.',
    now() - interval '1 hour',
    now() - interval '1 hour'
  ),
  (
    'task-004',
    '550e8400-e29b-41d4-a716-446655440000',
    'Research completed. OAuth 2.0 with PKCE seems like the best approach.',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    'task-006',
    '550e8400-e29b-41d4-a716-446655440000',
    'Performance improvements completed! Load time reduced by 60%.',
    now() - interval '1 week',
    now() - interval '1 week'
  )
ON CONFLICT DO NOTHING;