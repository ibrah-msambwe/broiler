import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// POST - Update batch statistics from all reports
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { batchId, forceUpdate = false } = body

    console.log("🔄 Updating batch statistics from reports...", { batchId, forceUpdate })

    // Get all batches or specific batch
    let batchQuery = supabase.from("batches").select("*")
    if (batchId) {
      batchQuery = batchQuery.eq("id", batchId)
    }

    const { data: batches, error: batchesError } = await batchQuery

    if (batchesError) {
      console.error("❌ Error fetching batches:", batchesError)
      return NextResponse.json({ error: batchesError.message }, { status: 500 })
    }

    if (!batches || batches.length === 0) {
      return NextResponse.json({ 
        message: "No batches found",
        updated: 0
      })
    }

    const results = []
    let totalUpdated = 0

    // Process each batch
    for (const batch of batches) {
      console.log(`🔄 Processing batch: ${batch.name} (${batch.id})`)

      try {
        // Get all mortality reports for this batch
        const { data: mortalityReports, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .eq("batch_id", batch.id)
          .in("type", ["Mortality", "mortality", "Mortality Report", "Daily", "daily"])
          .order("created_at", { ascending: true })

        if (reportsError) {
          console.error(`❌ Error fetching reports for batch ${batch.id}:`, reportsError)
          continue
        }

        // Calculate total mortality from all reports
        let totalMortalityFromReports = 0
        let totalFeedFromReports = 0
        let lastHealthUpdate = batch.updated_at

        if (mortalityReports && mortalityReports.length > 0) {
          console.log(`📊 Found ${mortalityReports.length} reports for batch ${batch.name}`)

          for (const report of mortalityReports) {
            const fields = report.fields || {}
            
            // Process mortality data
            const mortalityCount = parseInt(fields.mortalityCount || fields.deathCount || fields.death_count || 0)
            if (mortalityCount > 0) {
              totalMortalityFromReports += mortalityCount
              console.log(`  💀 Report ${report.id}: ${mortalityCount} deaths`)
            }

            // Process feed data
            const feedAmount = parseFloat(fields.feedAmount || fields.feedUsed || 0)
            if (feedAmount > 0) {
              totalFeedFromReports += feedAmount
              console.log(`  🌾 Report ${report.id}: ${feedAmount} feed`)
            }

            // Update last health update timestamp
            if (report.created_at > lastHealthUpdate) {
              lastHealthUpdate = report.created_at
            }
          }
        }

        // Calculate statistics
        const originalBirdCount = batch.bird_count || 0
        const remainingBirds = Math.max(0, originalBirdCount - totalMortalityFromReports)
        const mortalityRate = originalBirdCount > 0 ? (totalMortalityFromReports / originalBirdCount) * 100 : 0
        
        // Calculate health status based on mortality rate
        let healthStatus = "Excellent"
        if (mortalityRate > 5) healthStatus = "Poor"
        else if (mortalityRate > 3) healthStatus = "Fair"
        else if (mortalityRate > 1) healthStatus = "Good"

        // Calculate feed efficiency
        const currentWeight = batch.current_weight || 0
        const totalFeedUsed = totalFeedFromReports || batch.feed_used || 0
        const feedEfficiency = (currentWeight * remainingBirds) > 0 ? totalFeedUsed / (currentWeight * remainingBirds) : 0

        // Update batch with calculated values (only existing columns)
        const updateData = {
          mortality: totalMortalityFromReports,
          health_status: healthStatus,
          feed_used: totalFeedUsed,
          updated_at: new Date().toISOString()
        }

        // Only update if there are changes or force update is requested
        const hasChanges = 
          batch.mortality !== totalMortalityFromReports ||
          batch.feed_used !== totalFeedUsed ||
          forceUpdate

        if (hasChanges) {
          const { error: updateError } = await supabase
            .from("batches")
            .update(updateData)
            .eq("id", batch.id)

          if (updateError) {
            console.error(`❌ Error updating batch ${batch.id}:`, updateError)
            results.push({
              batchId: batch.id,
              batchName: batch.name,
              success: false,
              error: updateError.message,
              reportsProcessed: mortalityReports?.length || 0
            })
          } else {
            console.log(`✅ Updated batch ${batch.name}:`, {
              originalBirds: originalBirdCount,
              totalMortality: totalMortalityFromReports,
              remainingBirds: remainingBirds,
              mortalityRate: Math.round(mortalityRate * 100) / 100,
              healthStatus
            })
            
            results.push({
              batchId: batch.id,
              batchName: batch.name,
              success: true,
              originalBirds: originalBirdCount,
              totalMortality: totalMortalityFromReports,
              remainingBirds: remainingBirds,
              mortalityRate: Math.round(mortalityRate * 100) / 100,
              healthStatus,
              reportsProcessed: mortalityReports?.length || 0
            })
            totalUpdated++
          }
        } else {
          console.log(`ℹ️ No changes needed for batch ${batch.name}`)
          results.push({
            batchId: batch.id,
            batchName: batch.name,
            success: true,
            message: "No changes needed",
            reportsProcessed: mortalityReports?.length || 0
          })
        }

      } catch (error) {
        console.error(`❌ Error processing batch ${batch.id}:`, error)
        results.push({
          batchId: batch.id,
          batchName: batch.name,
          success: false,
          error: (error as Error).message,
          reportsProcessed: 0
        })
      }
    }

    console.log(`✅ Batch update complete. ${totalUpdated} batches updated out of ${batches.length} total`)

    return NextResponse.json({
      success: true,
      message: `Updated ${totalUpdated} batches from reports data`,
      totalBatches: batches.length,
      totalUpdated,
      results
    })

  } catch (error: any) {
    console.error("💥 Error updating batches from reports:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Get batch statistics with real-time report data
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get("batchId")

    if (!batchId) {
      return NextResponse.json({ error: "batchId required" }, { status: 400 })
    }

    console.log("📊 Fetching real-time batch statistics for:", batchId)

    // Get batch data
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .single()

    if (batchError || !batch) {
      console.error("❌ Error fetching batch:", batchError)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Get all mortality reports for this batch
    const { data: mortalityReports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .eq("batch_id", batchId)
      .in("type", ["Mortality", "mortality", "Daily", "daily"])
      .order("created_at", { ascending: true })

    if (reportsError) {
      console.error("❌ Error fetching reports:", reportsError)
      return NextResponse.json({ error: reportsError.message }, { status: 500 })
    }

    // Calculate real-time statistics from reports
    let totalMortalityFromReports = 0
    let totalFeedFromReports = 0
    const mortalityHistory = []

    if (mortalityReports && mortalityReports.length > 0) {
      for (const report of mortalityReports) {
        const fields = report.fields || {}
        
        // Process mortality data
        const mortalityCount = parseInt(fields.mortalityCount || fields.deathCount || 0)
        if (mortalityCount > 0) {
          totalMortalityFromReports += mortalityCount
          mortalityHistory.push({
            date: report.created_at,
            deaths: mortalityCount,
            cause: fields.deathCause || fields.cause || "Unknown",
            location: fields.deathLocation || fields.location || "Not specified"
          })
        }

        // Process feed data
        const feedAmount = parseFloat(fields.feedAmount || fields.feedUsed || 0)
        if (feedAmount > 0) {
          totalFeedFromReports += feedAmount
        }
      }
    }

    // Calculate final statistics
    const originalBirdCount = batch.bird_count || 0
    const remainingBirds = Math.max(0, originalBirdCount - totalMortalityFromReports)
    const mortalityRate = originalBirdCount > 0 ? (totalMortalityFromReports / originalBirdCount) * 100 : 0
    
    // Calculate health status
    let healthStatus = "Excellent"
    if (mortalityRate > 5) healthStatus = "Poor"
    else if (mortalityRate > 3) healthStatus = "Fair"
    else if (mortalityRate > 1) healthStatus = "Good"

    // Calculate feed efficiency
    const currentWeight = batch.current_weight || 0
    const totalFeedUsed = totalFeedFromReports || batch.feed_used || 0
    const feedEfficiency = (currentWeight * remainingBirds) > 0 ? totalFeedUsed / (currentWeight * remainingBirds) : 0

    const statistics = {
      // Basic Info
      batchId: batch.id,
      batchName: batch.name,
      farmerName: batch.farmer_name,
      startDate: batch.start_date,
      status: batch.status,
      
      // Real-time Bird Statistics (from reports)
      originalBirds: originalBirdCount,
      totalMortality: totalMortalityFromReports,
      remainingBirds: remainingBirds,
      mortalityRate: Math.round(mortalityRate * 100) / 100,
      
      // Feed Statistics (from reports)
      totalFeedUsed: totalFeedUsed,
      feedEfficiency: Math.round(feedEfficiency * 100) / 100,
      currentWeight: currentWeight,
      
      // Health Statistics
      healthStatus: healthStatus,
      temperature: batch.temperature,
      humidity: batch.humidity,
      vaccinations: batch.vaccinations || 0,
      
      // Report Data
      totalReports: mortalityReports?.length || 0,
      mortalityHistory: mortalityHistory,
      
      // Calculated Metrics
      dailyMortalityRate: mortalityRate / Math.max(1, Math.floor((Date.now() - new Date(batch.start_date).getTime()) / (1000 * 60 * 60 * 24))),
      averageDailyFeed: totalFeedUsed / Math.max(1, Math.floor((Date.now() - new Date(batch.start_date).getTime()) / (1000 * 60 * 60 * 24))),
      
      // Data Source
      dataSource: "reports_table",
      lastUpdated: new Date().toISOString()
    }

    console.log("✅ Real-time statistics calculated:", {
      originalBirds: statistics.originalBirds,
      totalMortality: statistics.totalMortality,
      remainingBirds: statistics.remainingBirds,
      mortalityRate: statistics.mortalityRate,
      reportsProcessed: statistics.totalReports
    })

    return NextResponse.json({ statistics })

  } catch (error: any) {
    console.error("💥 Error fetching real-time batch statistics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
