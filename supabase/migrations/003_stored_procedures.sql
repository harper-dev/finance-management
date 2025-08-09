-- Stored procedure to update account balance
CREATE OR REPLACE FUNCTION update_account_balance(
  account_id UUID,
  amount_change DECIMAL(15,2)
)
RETURNS void AS $$
BEGIN
  UPDATE accounts 
  SET balance = balance + amount_change,
      updated_at = NOW()
  WHERE id = account_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account with id % not found', account_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate account balance from transactions
CREATE OR REPLACE FUNCTION calculate_account_balance(account_uuid UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  balance DECIMAL(15,2) DEFAULT 0;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'income' THEN amount
      WHEN type = 'expense' THEN -amount
      ELSE 0
    END
  ), 0)
  INTO balance
  FROM transactions
  WHERE account_id = account_uuid;
  
  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate all account balances
CREATE OR REPLACE FUNCTION recalculate_all_balances()
RETURNS void AS $$
DECLARE
  account_record RECORD;
  calculated_balance DECIMAL(15,2);
BEGIN
  FOR account_record IN SELECT id FROM accounts WHERE is_active = true
  LOOP
    SELECT calculate_account_balance(account_record.id) INTO calculated_balance;
    
    UPDATE accounts 
    SET balance = calculated_balance,
        updated_at = NOW()
    WHERE id = account_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get workspace summary
CREATE OR REPLACE FUNCTION get_workspace_summary(workspace_uuid UUID)
RETURNS TABLE(
  total_accounts INTEGER,
  total_balance DECIMAL(15,2),
  monthly_income DECIMAL(15,2),
  monthly_expenses DECIMAL(15,2),
  active_budgets INTEGER,
  active_goals INTEGER
) AS $$
DECLARE
  start_of_month DATE;
  end_of_month DATE;
BEGIN
  -- Calculate current month boundaries
  start_of_month := DATE_TRUNC('month', CURRENT_DATE);
  end_of_month := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day';
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM accounts WHERE workspace_id = workspace_uuid AND is_active = true),
    (SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE workspace_id = workspace_uuid AND is_active = true),
    (SELECT COALESCE(SUM(amount), 0) FROM transactions 
     WHERE workspace_id = workspace_uuid 
     AND type = 'income' 
     AND transaction_date >= start_of_month 
     AND transaction_date <= end_of_month),
    (SELECT COALESCE(SUM(amount), 0) FROM transactions 
     WHERE workspace_id = workspace_uuid 
     AND type = 'expense' 
     AND transaction_date >= start_of_month 
     AND transaction_date <= end_of_month),
    (SELECT COUNT(*)::INTEGER FROM budgets WHERE workspace_id = workspace_uuid AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM savings_goals WHERE workspace_id = workspace_uuid AND is_active = true);
END;
$$ LANGUAGE plpgsql;