-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Workspaces policies
CREATE POLICY "Users can view their workspaces" ON workspaces
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_id = workspaces.id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update workspaces" ON workspaces
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete workspaces" ON workspaces
    FOR DELETE USING (auth.uid() = owner_id);

-- Workspace members policies
CREATE POLICY "Users can view workspace members" ON workspace_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspaces 
            WHERE id = workspace_id 
            AND (owner_id = auth.uid() OR EXISTS (
                SELECT 1 FROM workspace_members wm
                WHERE wm.workspace_id = workspace_id 
                AND wm.user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Owners and admins can manage members" ON workspace_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspaces w
            WHERE w.id = workspace_id 
            AND w.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin')
        )
    );

-- Accounts policies
CREATE POLICY "Users can view workspace accounts" ON accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = accounts.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage accounts with permissions" ON accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = accounts.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin', 'member')
        )
    );

-- Transactions policies
CREATE POLICY "Users can view workspace transactions" ON transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = transactions.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage transactions with permissions" ON transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = transactions.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin', 'member')
        )
    );

-- Budgets policies
CREATE POLICY "Users can view workspace budgets" ON budgets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = budgets.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage budgets with permissions" ON budgets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = budgets.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin', 'member')
        )
    );

-- Savings goals policies
CREATE POLICY "Users can view workspace savings goals" ON savings_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = savings_goals.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage savings goals with permissions" ON savings_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members wm
            WHERE wm.workspace_id = savings_goals.workspace_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('owner', 'admin', 'member')
        )
    );