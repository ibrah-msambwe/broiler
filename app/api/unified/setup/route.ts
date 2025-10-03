import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// POST - Initialize the complete unified system
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    console.log("🚀 Initializing Unified Broiler Management System...")

    const results = {
      database: { success: false, message: "" },
      tables: { success: false, message: "" },
      functions: { success: false, message: "" },
      triggers: { success: false, message: "" },
      sampleData: { success: false, message: "" },
      overall: { success: false, message: "" }
    }

    // Step 1: Create/Update Database Tables
    try {
      console.log("📊 Creating/updating database tables...")
      
      // Create unified_users table
      const { error: usersTableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS unified_users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'farmer', 'batch_user')),
            name VARCHAR(200) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20),
            password_hash TEXT,
            username VARCHAR(100) UNIQUE,
            batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
            batch_name VARCHAR(200),
            farmer_id UUID,
            farmer_name VARCHAR(200),
            is_active BOOLEAN DEFAULT TRUE,
            is_online BOOLEAN DEFAULT FALSE,
            last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'away', 'offline')),
            avatar_url TEXT,
            address TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT check_farmer_batch CHECK (
              (user_type = 'admin' AND batch_id IS NULL) OR
              (user_type = 'farmer' AND batch_id IS NULL) OR
              (user_type = 'batch_user' AND batch_id IS NOT NULL)
            )
          );
        `
      })

      if (usersTableError) {
        throw new Error(`Users table error: ${usersTableError.message}`)
      }

      // Add missing columns to batches table
      const { error: batchesUpdateError } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'total_mortality') THEN
              ALTER TABLE batches ADD COLUMN total_mortality INTEGER DEFAULT 0;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'mortality_rate') THEN
              ALTER TABLE batches ADD COLUMN mortality_rate DECIMAL(5,2) DEFAULT 0.00;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'remaining_birds') THEN
              ALTER TABLE batches ADD COLUMN remaining_birds INTEGER DEFAULT 0;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'health_score') THEN
              ALTER TABLE batches ADD COLUMN health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100);
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'feed_efficiency') THEN
              ALTER TABLE batches ADD COLUMN feed_efficiency DECIMAL(5,2) DEFAULT 0.00;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'last_mortality_update') THEN
              ALTER TABLE batches ADD COLUMN last_mortality_update TIMESTAMP WITH TIME ZONE;
            END IF;
          END $$;
        `
      })

      if (batchesUpdateError) {
        throw new Error(`Batches update error: ${batchesUpdateError.message}`)
      }

      // Add missing columns to reports table
      const { error: reportsUpdateError } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'processed_data') THEN
              ALTER TABLE reports ADD COLUMN processed_data JSONB;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'auto_calculated') THEN
              ALTER TABLE reports ADD COLUMN auto_calculated BOOLEAN DEFAULT FALSE;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'batch_updated') THEN
              ALTER TABLE reports ADD COLUMN batch_updated BOOLEAN DEFAULT FALSE;
            END IF;
          END $$;
        `
      })

      if (reportsUpdateError) {
        throw new Error(`Reports update error: ${reportsUpdateError.message}`)
      }

      results.tables = { success: true, message: "All tables created/updated successfully" }
      console.log("✅ Database tables ready")

    } catch (error: any) {
      results.tables = { success: false, message: error.message }
      console.error("❌ Database tables error:", error)
    }

    // Step 2: Create Functions
    try {
      console.log("⚙️ Creating database functions...")
      
      const { error: functionsError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Function to update batch statistics automatically
          CREATE OR REPLACE FUNCTION update_batch_statistics(batch_uuid UUID)
          RETURNS VOID AS $$
          DECLARE
            batch_record RECORD;
            new_mortality_rate DECIMAL(5,2);
            new_health_score INTEGER;
            new_feed_efficiency DECIMAL(5,2);
          BEGIN
            -- Get current batch data
            SELECT * INTO batch_record FROM batches WHERE id = batch_uuid;
            
            IF batch_record IS NULL THEN
              RETURN;
            END IF;
            
            -- Calculate remaining birds
            UPDATE batches 
            SET remaining_birds = GREATEST(0, bird_count - total_mortality)
            WHERE id = batch_uuid;
            
            -- Calculate mortality rate
            IF batch_record.bird_count > 0 THEN
              new_mortality_rate := (batch_record.total_mortality::DECIMAL / batch_record.bird_count::DECIMAL) * 100;
            ELSE
              new_mortality_rate := 0;
            END IF;
            
            -- Calculate health score based on mortality rate
            new_health_score := CASE
              WHEN new_mortality_rate <= 1 THEN 100
              WHEN new_mortality_rate <= 3 THEN 80
              WHEN new_mortality_rate <= 5 THEN 60
              WHEN new_mortality_rate <= 10 THEN 40
              ELSE 20
            END;
            
            -- Calculate feed efficiency (if we have feed data)
            IF batch_record.feed_used > 0 AND batch_record.current_weight > 0 AND batch_record.remaining_birds > 0 THEN
              new_feed_efficiency := batch_record.feed_used / (batch_record.current_weight * batch_record.remaining_birds);
            ELSE
              new_feed_efficiency := 0;
            END IF;
            
            -- Update batch with calculated values
            UPDATE batches 
            SET 
              mortality_rate = new_mortality_rate,
              health_score = new_health_score,
              feed_efficiency = new_feed_efficiency,
              health_status = CASE
                WHEN new_health_score >= 90 THEN 'Excellent'
                WHEN new_health_score >= 70 THEN 'Good'
                WHEN new_health_score >= 50 THEN 'Fair'
                ELSE 'Poor'
              END,
              last_mortality_update = NOW(),
              updated_at = NOW()
            WHERE id = batch_uuid;
          END;
          $$ LANGUAGE plpgsql;

          -- Function to create unified user
          CREATE OR REPLACE FUNCTION create_unified_user(
            p_user_type VARCHAR(20),
            p_name VARCHAR(200),
            p_email VARCHAR(255),
            p_phone VARCHAR(20) DEFAULT NULL,
            p_password_hash TEXT DEFAULT NULL,
            p_username VARCHAR(100) DEFAULT NULL,
            p_batch_id UUID DEFAULT NULL,
            p_farmer_id UUID DEFAULT NULL
          )
          RETURNS UUID AS $$
          DECLARE
            new_user_id UUID;
            batch_info RECORD;
            farmer_info RECORD;
          BEGIN
            -- Validate user type and required fields
            IF p_user_type NOT IN ('admin', 'farmer', 'batch_user') THEN
              RAISE EXCEPTION 'Invalid user type: %', p_user_type;
            END IF;
            
            IF p_user_type = 'batch_user' AND p_batch_id IS NULL THEN
              RAISE EXCEPTION 'Batch ID required for batch_user';
            END IF;
            
            -- Get batch information if provided
            IF p_batch_id IS NOT NULL THEN
              SELECT name INTO batch_info FROM batches WHERE id = p_batch_id;
              IF batch_info IS NULL THEN
                RAISE EXCEPTION 'Batch not found: %', p_batch_id;
              END IF;
            END IF;
            
            -- Get farmer information if provided
            IF p_farmer_id IS NOT NULL THEN
              SELECT name INTO farmer_info FROM unified_users WHERE id = p_farmer_id AND user_type = 'farmer';
              IF farmer_info IS NULL THEN
                RAISE EXCEPTION 'Farmer not found: %', p_farmer_id;
              END IF;
            END IF;
            
            -- Insert new user
            INSERT INTO unified_users (
              user_type, name, email, phone, password_hash, username,
              batch_id, batch_name, farmer_id, farmer_name
            ) VALUES (
              p_user_type, p_name, p_email, p_phone, p_password_hash, p_username,
              p_batch_id, batch_info.name, p_farmer_id, farmer_info.name
            ) RETURNING id INTO new_user_id;
            
            RETURN new_user_id;
          END;
          $$ LANGUAGE plpgsql;

          -- Function to get communication users
          CREATE OR REPLACE FUNCTION get_communication_users()
          RETURNS TABLE (
            id UUID,
            name VARCHAR(200),
            email VARCHAR(255),
            user_type VARCHAR(20),
            batch_name VARCHAR(200),
            farmer_name VARCHAR(200),
            is_online BOOLEAN,
            last_seen TIMESTAMP WITH TIME ZONE,
            status VARCHAR(20)
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              u.id,
              u.name,
              u.email,
              u.user_type,
              u.batch_name,
              u.farmer_name,
              u.is_online,
              u.last_seen,
              u.status
            FROM unified_users u
            WHERE u.is_active = TRUE
            ORDER BY u.user_type, u.name;
          END;
          $$ LANGUAGE plpgsql;
        `
      })

      if (functionsError) {
        throw new Error(`Functions error: ${functionsError.message}`)
      }

      results.functions = { success: true, message: "All functions created successfully" }
      console.log("✅ Database functions ready")

    } catch (error: any) {
      results.functions = { success: false, message: error.message }
      console.error("❌ Functions error:", error)
    }

    // Step 3: Create Triggers
    try {
      console.log("🔗 Creating database triggers...")
      
      const { error: triggersError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Trigger function for automatic batch updates
          CREATE OR REPLACE FUNCTION trigger_update_batch_statistics()
          RETURNS TRIGGER AS $$
          BEGIN
            -- Update statistics for the affected batch
            PERFORM update_batch_statistics(COALESCE(NEW.batch_id, OLD.batch_id));
            RETURN COALESCE(NEW, OLD);
          END;
          $$ LANGUAGE plpgsql;

          -- Create trigger on reports table for mortality reports
          DROP TRIGGER IF EXISTS trigger_mortality_update ON reports;
          CREATE TRIGGER trigger_mortality_update
            AFTER INSERT OR UPDATE ON reports
            FOR EACH ROW
            WHEN (NEW.report_type = 'mortality' OR NEW.report_type = 'daily')
            EXECUTE FUNCTION trigger_update_batch_statistics();
        `
      })

      if (triggersError) {
        throw new Error(`Triggers error: ${triggersError.message}`)
      }

      results.triggers = { success: true, message: "All triggers created successfully" }
      console.log("✅ Database triggers ready")

    } catch (error: any) {
      results.triggers = { success: false, message: error.message }
      console.error("❌ Triggers error:", error)
    }

    // Step 4: Create Indexes
    try {
      console.log("📇 Creating database indexes...")
      
      const { error: indexesError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Indexes for unified_users table
          CREATE INDEX IF NOT EXISTS idx_unified_users_type ON unified_users(user_type);
          CREATE INDEX IF NOT EXISTS idx_unified_users_batch ON unified_users(batch_id);
          CREATE INDEX IF NOT EXISTS idx_unified_users_farmer ON unified_users(farmer_id);
          CREATE INDEX IF NOT EXISTS idx_unified_users_email ON unified_users(email);
          CREATE INDEX IF NOT EXISTS idx_unified_users_username ON unified_users(username);

          -- Indexes for batches table
          CREATE INDEX IF NOT EXISTS idx_batches_mortality ON batches(total_mortality);
          CREATE INDEX IF NOT EXISTS idx_batches_health ON batches(health_score);
          CREATE INDEX IF NOT EXISTS idx_batches_remaining ON batches(remaining_birds);

          -- Indexes for reports table
          CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
          CREATE INDEX IF NOT EXISTS idx_reports_batch ON reports(batch_id);
          CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
        `
      })

      if (indexesError) {
        console.warn("Indexes warning:", indexesError.message)
      } else {
        console.log("✅ Database indexes ready")
      }

    } catch (error: any) {
      console.warn("Indexes warning:", error)
    }

    // Step 5: Create Sample Data
    try {
      console.log("📝 Creating sample data...")
      
      // Create sample admin user
      const { data: adminUser, error: adminError } = await supabase.rpc('create_unified_user', {
        p_user_type: 'admin',
        p_name: 'System Administrator',
        p_email: 'admin@broiler.com'
      })

      if (adminError) {
        console.warn("Admin user creation warning:", adminError.message)
      } else {
        console.log("✅ Sample admin user created")
      }

      // Create sample farmer
      const { data: farmerUser, error: farmerError } = await supabase.rpc('create_unified_user', {
        p_user_type: 'farmer',
        p_name: 'John Farmer',
        p_email: 'john@farmer.com',
        p_phone: '+1234567890'
      })

      if (farmerError) {
        console.warn("Farmer user creation warning:", farmerError.message)
      } else {
        console.log("✅ Sample farmer user created")
      }

      results.sampleData = { success: true, message: "Sample data created successfully" }

    } catch (error: any) {
      results.sampleData = { success: false, message: error.message }
      console.error("❌ Sample data error:", error)
    }

    // Step 6: Create Views
    try {
      console.log("👁️ Creating database views...")
      
      const { error: viewsError } = await supabase.rpc('exec_sql', {
        sql: `
          -- View for batch statistics
          CREATE OR REPLACE VIEW batch_statistics AS
          SELECT 
            b.id,
            b.name,
            b.farmer_name,
            b.bird_count,
            b.total_mortality,
            b.remaining_birds,
            b.mortality_rate,
            b.health_score,
            b.health_status,
            b.feed_efficiency,
            b.current_weight,
            b.feed_used,
            b.vaccinations,
            b.temperature,
            b.humidity,
            b.status,
            b.start_date,
            b.expected_harvest_date,
            b.last_mortality_update,
            b.created_at,
            b.updated_at
          FROM batches b
          WHERE b.status != 'Completed';

          -- View for user communication list
          CREATE OR REPLACE VIEW communication_users_view AS
          SELECT 
            u.id,
            u.name,
            u.email,
            u.user_type,
            u.batch_name,
            u.farmer_name,
            u.is_online,
            u.last_seen,
            u.status,
            u.avatar_url,
            CASE 
              WHEN u.user_type = 'admin' THEN 'Admin'
              WHEN u.user_type = 'farmer' THEN 'Farmer'
              WHEN u.user_type = 'batch_user' THEN CONCAT('Batch: ', COALESCE(u.batch_name, 'Unknown'))
              ELSE 'Unknown'
            END as display_name
          FROM unified_users u
          WHERE u.is_active = TRUE
          ORDER BY u.user_type, u.name;
        `
      })

      if (viewsError) {
        console.warn("Views warning:", viewsError.message)
      } else {
        console.log("✅ Database views ready")
      }

    } catch (error: any) {
      console.warn("Views warning:", error)
    }

    // Determine overall success
    const allStepsSuccessful = Object.values(results).every(step => step.success)
    results.overall = {
      success: allStepsSuccessful,
      message: allStepsSuccessful 
        ? "Unified Broiler Management System initialized successfully!" 
        : "System partially initialized. Check individual step results."
    }

    console.log("🎉 System initialization complete!")
    console.log("Results:", results)

    return NextResponse.json({
      success: allStepsSuccessful,
      message: results.overall.message,
      results,
      nextSteps: [
        "1. Test user creation via /api/unified/users",
        "2. Test batch creation via /api/unified/batches", 
        "3. Test report submission via /api/unified/reports",
        "4. Verify automatic calculations are working",
        "5. Check communication system integration"
      ]
    })

  } catch (error: any) {
    console.error("💥 Error in unified system setup:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      message: "System setup failed. Please check the logs and try again."
    }, { status: 500 })
  }
}

// GET - Check system status
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if unified_users table exists
    const { data: usersTable, error: usersError } = await supabase
      .from('unified_users')
      .select('id')
      .limit(1)

    // Check if functions exist
    const { data: functions, error: functionsError } = await supabase.rpc('exec_sql', {
      sql: "SELECT routine_name FROM information_schema.routines WHERE routine_name IN ('update_batch_statistics', 'create_unified_user', 'get_communication_users');"
    })

    // Check if triggers exist
    const { data: triggers, error: triggersError } = await supabase.rpc('exec_sql', {
      sql: "SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'trigger_mortality_update';"
    })

    return NextResponse.json({
      systemReady: !usersError && !functionsError && !triggersError,
      components: {
        unifiedUsersTable: !usersError,
        databaseFunctions: !functionsError,
        databaseTriggers: !triggersError
      },
      message: (!usersError && !functionsError && !triggersError) 
        ? "System is ready" 
        : "System needs initialization"
    })

  } catch (error: any) {
    return NextResponse.json({ 
      systemReady: false,
      error: error.message 
    }, { status: 500 })
  }
}
