import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// POST - Setup database triggers for automatic batch updates
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    console.log("🔗 Setting up batch update triggers...")

    // Create trigger function for automatic batch updates
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Function to update batch statistics from all report types
        CREATE OR REPLACE FUNCTION update_batch_from_reports()
        RETURNS TRIGGER AS $$
        DECLARE
          batch_record RECORD;
          total_mortality INTEGER := 0;
          total_feed DECIMAL := 0;
          total_vaccinations INTEGER := 0;
          remaining_birds INTEGER;
          mortality_rate DECIMAL;
          health_status TEXT;
          avg_temperature DECIMAL;
          avg_humidity DECIMAL;
        BEGIN
          -- Get the batch record
          SELECT * INTO batch_record FROM batches WHERE id = NEW.batch_id;
          
          IF batch_record IS NULL THEN
            RETURN NEW;
          END IF;
          
          -- Calculate total mortality from all mortality reports for this batch
          SELECT COALESCE(SUM(
            CASE 
              WHEN (fields->>'mortalityCount') IS NOT NULL THEN (fields->>'mortalityCount')::INTEGER
              WHEN (fields->>'deathCount') IS NOT NULL THEN (fields->>'deathCount')::INTEGER
              WHEN (fields->>'death_count') IS NOT NULL THEN (fields->>'death_count')::INTEGER
              ELSE 0
            END
          ), 0) INTO total_mortality
          FROM reports 
          WHERE batch_id = NEW.batch_id 
            AND type IN ('Mortality', 'mortality', 'Mortality Report', 'Daily', 'daily');
          
          -- Calculate total feed from all feed reports for this batch
          SELECT COALESCE(SUM(
            CASE 
              WHEN (fields->>'feedAmount') IS NOT NULL THEN (fields->>'feedAmount')::DECIMAL
              WHEN (fields->>'feedUsed') IS NOT NULL THEN (fields->>'feedUsed')::DECIMAL
              WHEN (fields->>'feed_amount') IS NOT NULL THEN (fields->>'feed_amount')::DECIMAL
              ELSE 0
            END
          ), 0) INTO total_feed
          FROM reports 
          WHERE batch_id = NEW.batch_id 
            AND type IN ('Feed', 'feed', 'Daily', 'daily');
          
          -- Calculate total vaccinations from all vaccination reports for this batch
          SELECT COALESCE(SUM(
            CASE 
              WHEN (fields->>'vaccinationCount') IS NOT NULL THEN (fields->>'vaccinationCount')::INTEGER
              WHEN (fields->>'vaccinations') IS NOT NULL THEN (fields->>'vaccinations')::INTEGER
              ELSE 0
            END
          ), 0) INTO total_vaccinations
          FROM reports 
          WHERE batch_id = NEW.batch_id 
            AND type IN ('Vaccination', 'vaccination', 'Daily', 'daily');
          
          -- Calculate average temperature from health reports
          SELECT COALESCE(AVG(
            CASE 
              WHEN (fields->>'temperature') IS NOT NULL THEN (fields->>'temperature')::DECIMAL
              ELSE NULL
            END
          ), batch_record.temperature) INTO avg_temperature
          FROM reports 
          WHERE batch_id = NEW.batch_id 
            AND type IN ('Health', 'health', 'Daily', 'daily')
            AND (fields->>'temperature') IS NOT NULL;
          
          -- Calculate average humidity from health reports
          SELECT COALESCE(AVG(
            CASE 
              WHEN (fields->>'humidity') IS NOT NULL THEN (fields->>'humidity')::DECIMAL
              ELSE NULL
            END
          ), batch_record.humidity) INTO avg_humidity
          FROM reports 
          WHERE batch_id = NEW.batch_id 
            AND type IN ('Health', 'health', 'Daily', 'daily')
            AND (fields->>'humidity') IS NOT NULL;
          
          -- Calculate remaining birds
          remaining_birds := GREATEST(0, batch_record.bird_count - total_mortality);
          
          -- Calculate mortality rate
          mortality_rate := CASE 
            WHEN batch_record.bird_count > 0 THEN (total_mortality::DECIMAL / batch_record.bird_count::DECIMAL) * 100
            ELSE 0
          END;
          
          -- Determine health status based on mortality rate and other factors
          health_status := CASE
            WHEN mortality_rate > 5 THEN 'Poor'
            WHEN mortality_rate > 3 THEN 'Fair'
            WHEN mortality_rate > 1 THEN 'Good'
            ELSE 'Excellent'
          END;
          
          -- Update the batch with calculated values
          UPDATE batches 
          SET 
            mortality = total_mortality,
            health_status = health_status,
            feed_used = total_feed,
            vaccinations = total_vaccinations,
            temperature = COALESCE(avg_temperature, batch_record.temperature),
            humidity = COALESCE(avg_humidity, batch_record.humidity),
            last_mortality_update = NOW(),
            updated_at = NOW()
          WHERE id = NEW.batch_id;
          
          -- Log the update
          RAISE NOTICE 'Updated batch %: % remaining birds, % total mortality, % mortality rate, % vaccinations, % feed used', 
            NEW.batch_id, remaining_birds, total_mortality, ROUND(mortality_rate, 2), total_vaccinations, total_feed;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (functionError) {
      console.error("❌ Error creating trigger function:", functionError)
      return NextResponse.json({ error: functionError.message }, { status: 500 })
    }

    // Create trigger on reports table
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing trigger if it exists
        DROP TRIGGER IF EXISTS trigger_update_batch_from_reports ON reports;
        
        -- Create new trigger
        CREATE TRIGGER trigger_update_batch_from_reports
          AFTER INSERT OR UPDATE ON reports
          FOR EACH ROW
          WHEN (NEW.type IN ('Mortality', 'mortality', 'Mortality Report', 'Feed', 'feed', 'Health', 'health', 'Vaccination', 'vaccination', 'Daily', 'daily'))
          EXECUTE FUNCTION update_batch_from_reports();
      `
    })

    if (triggerError) {
      console.error("❌ Error creating trigger:", triggerError)
      return NextResponse.json({ error: triggerError.message }, { status: 500 })
    }

    // Create indexes for better performance
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_reports_batch_type ON reports(batch_id, type);
        CREATE INDEX IF NOT EXISTS idx_reports_mortality_fields ON reports USING GIN ((fields->>'mortalityCount'), (fields->>'deathCount'));
        CREATE INDEX IF NOT EXISTS idx_reports_feed_fields ON reports USING GIN ((fields->>'feedAmount'), (fields->>'feedUsed'));
        CREATE INDEX IF NOT EXISTS idx_batches_mortality ON batches(mortality);
        CREATE INDEX IF NOT EXISTS idx_batches_remaining ON batches(remaining_birds);
      `
    })

    if (indexError) {
      console.warn("⚠️ Warning creating indexes:", indexError.message)
    }

    console.log("✅ Batch update triggers setup complete!")

    return NextResponse.json({
      success: true,
      message: "Batch update triggers setup successfully",
      features: [
        "Automatic batch updates when mortality reports are submitted",
        "Real-time calculation of remaining birds",
        "Automatic mortality rate calculation",
        "Health status updates based on mortality rate",
        "Feed tracking from reports",
        "Performance optimized with indexes"
      ]
    })

  } catch (error: any) {
    console.error("💥 Error setting up batch triggers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Check trigger status
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if trigger function exists
    const { data: functionExists, error: functionError } = await supabase.rpc('exec_sql', {
      sql: "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'update_batch_from_reports';"
    })

    // Check if trigger exists
    const { data: triggerExists, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: "SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'trigger_update_batch_from_reports';"
    })

    return NextResponse.json({
      triggersReady: !functionError && !triggerError && functionExists?.length > 0 && triggerExists?.length > 0,
      components: {
        triggerFunction: !functionError && functionExists?.length > 0,
        trigger: !triggerError && triggerExists?.length > 0
      },
      message: (!functionError && !triggerError && functionExists?.length > 0 && triggerExists?.length > 0) 
        ? "Triggers are ready" 
        : "Triggers need setup"
    })

  } catch (error: any) {
    return NextResponse.json({ 
      triggersReady: false,
      error: error.message 
    }, { status: 500 })
  }
}
