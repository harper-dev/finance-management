-- Sample data for development/testing
-- Note: This should only be run in development environment

-- Insert sample user profile (requires actual user to exist in auth.users)
-- This will be created automatically when users sign up

-- Sample workspace types and default categories
INSERT INTO public.workspaces (name, type, owner_id, currency) VALUES
  ('Personal Finance', 'personal', '00000000-0000-0000-0000-000000000000', 'SGD'),
  ('Family Budget', 'family', '00000000-0000-0000-0000-000000000000', 'SGD')
ON CONFLICT DO NOTHING;

-- Common expense categories for reference
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(7)
);

INSERT INTO expense_categories (name, icon, color) VALUES
  ('Food & Dining', '🍽️', '#FF6B6B'),
  ('Transportation', '🚗', '#4ECDC4'),
  ('Shopping', '🛒', '#45B7D1'),
  ('Entertainment', '🎬', '#96CEB4'),
  ('Bills & Utilities', '💡', '#FFEAA7'),
  ('Healthcare', '🏥', '#FDA7DF'),
  ('Education', '📚', '#74B9FF'),
  ('Travel', '✈️', '#A29BFE'),
  ('Housing', '🏠', '#6C5CE7'),
  ('Insurance', '🛡️', '#FD79A8'),
  ('Savings', '💰', '#00B894'),
  ('Investment', '📈', '#E17055'),
  ('Other', '📝', '#636E72')
ON CONFLICT (name) DO NOTHING;

-- Common income categories
CREATE TABLE IF NOT EXISTS income_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(7)
);

INSERT INTO income_categories (name, icon, color) VALUES
  ('Salary', '💼', '#00B894'),
  ('Freelance', '💻', '#74B9FF'),
  ('Investment Returns', '📈', '#A29BFE'),
  ('Rental Income', '🏠', '#6C5CE7'),
  ('Business Income', '🏪', '#E17055'),
  ('Gift/Bonus', '🎁', '#FFEAA7'),
  ('Other Income', '💰', '#636E72')
ON CONFLICT (name) DO NOTHING;