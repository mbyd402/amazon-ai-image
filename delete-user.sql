-- Delete user zju402@qq.com from users table and auth
-- First delete from our users table
DELETE FROM users WHERE email = 'zju402@qq.com';

-- You need to manually delete in Supabase Auth dashboard:
-- Go to Supabase → Authentication → Users → Find zju402@qq.com → Delete
