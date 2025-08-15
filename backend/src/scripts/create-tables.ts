import 'dotenv/config'
import { AppDataSource } from '../config/database'

async function createTables() {
  try {
    console.log('🔌 Creating database tables...')
    
    // Initialize the database connection
    await AppDataSource.initialize()
    console.log('✅ Database connection established')
    
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    
    try {
      // Create tables one by one
      console.log('📋 Creating user_profiles table...')
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL UNIQUE,
          display_name VARCHAR(100),
          preferred_currency VARCHAR(3) DEFAULT 'SGD',
          timezone VARCHAR(50) DEFAULT 'Asia/Singapore',
          language VARCHAR(10) DEFAULT 'en',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ user_profiles table created')
      
      console.log('📋 Creating workspaces table...')
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.workspaces (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('personal', 'family', 'team')),
          owner_id UUID NOT NULL,
          currency VARCHAR(3) DEFAULT 'SGD',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ workspaces table created')
      
      console.log('📋 Creating workspace_members table...')
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.workspace_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
          permissions JSONB DEFAULT '{}',
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(workspace_id, user_id)
        )
      `)
      console.log('✅ workspace_members table created')
      
      console.log('📋 Creating accounts table...')
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.accounts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('cash', 'bank', 'investment', 'asset', 'debt')),
          currency VARCHAR(3) DEFAULT 'SGD',
          balance DECIMAL(15,2) DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_by UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ accounts table created')
      
      console.log('📋 Creating transactions table...')
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
          amount DECIMAL(15,2) NOT NULL,
          currency VARCHAR(3) NOT NULL,
          category VARCHAR(50),
          description TEXT,
          transaction_date DATE NOT NULL,
          created_by UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ transactions table created')
      
      console.log('📋 Creating budgets table...')
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.budgets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'quarterly', 'yearly')),
          start_date DATE NOT NULL,
          end_date DATE,
          is_active BOOLEAN DEFAULT true,
          created_by UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ budgets table created')
      
      console.log('📋 Creating savings_goals table...')
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS public.savings_goals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          target_amount DECIMAL(15,2) NOT NULL,
          current_amount DECIMAL(15,2) DEFAULT 0,
          target_date DATE,
          category VARCHAR(50),
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_by UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✅ savings_goals table created')
      
      // Create indexes
      console.log('📋 Creating indexes...')
      await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)')
      await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id)')
      await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_accounts_workspace_id ON accounts(workspace_id)')
      await queryRunner.query('CREATE INDEX IF NOT EXISTS idx_transactions_workspace_id ON transactions(workspace_id)')
      console.log('✅ Indexes created')
      
      // Verify tables were created
      const tablesResult = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)
      
      console.log('\n📊 Tables in public schema:')
      tablesResult.forEach((table: any) => {
        console.log(`  ✅ ${table.table_name}`)
      })
      
    } finally {
      await queryRunner.release()
    }
    
    // Close the connection
    await AppDataSource.destroy()
    console.log('🔌 Database connection closed')
    console.log('\n🎉 Tables created successfully!')
    
  } catch (error) {
    console.error('❌ Table creation failed:', error)
    process.exit(1)
  }
}

// Run the table creation
createTables() 