import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Get all batches with real-time statistics from reports
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    console.log("📊 Fetching batches with real-time statistics...")

    // Get all batches
    const { data: batches, error: batchesError } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false })

    if (batchesError) {
      console.error("❌ Error fetching batches:", batchesError)
      return NextResponse.json({ error: batchesError.message }, { status: 500 })
    }

    if (!batches || batches.length === 0) {
      return NextResponse.json({ batches: [] })
    }

    // Get real-time statistics for each batch
    const batchesWithStats = await Promise.all(
      batches.map(async (batch) => {
        try {
          // Get all reports for this batch
          const { data: reports, error: reportsError } = await supabase
            .from("reports")
            .select("*")
            .eq("batch_id", batch.id)
            .in("type", ["Mortality", "mortality", "Mortality Report", "Daily", "daily", "Feed", "feed", "Feed Report"])
            .order("created_at", { ascending: true })

          if (reportsError) {
            console.warn(`⚠️ Error fetching reports for batch ${batch.id}:`, reportsError)
          }

          // Calculate real-time statistics from reports
          let totalMortalityFromReports = 0
          let totalFeedFromReports = 0
          let totalVaccinationsFromReports = 0
          let totalWeightReadings = 0
          let weightSum = 0
          let latestWeight = 0

          if (reports && reports.length > 0) {
            for (const report of reports) {
              const fields = report.fields || {}
              
              // Process mortality data
              if (report.type === "Mortality" || report.type === "mortality" || report.type === "Mortality Report" || 
                  (report.type === "Daily" && (fields.mortalityCount || fields.deathCount || fields.death_count))) {
                const mortalityCount = parseInt(fields.mortalityCount || fields.deathCount || fields.death_count || 0)
                if (mortalityCount > 0) {
                  totalMortalityFromReports += mortalityCount
                }
              }

              // Process feed data
              if (report.type === "Feed" || report.type === "feed" || report.type === "Feed Report" || 
                  (report.type === "Daily" && (fields.feedAmount || fields.feedUsed || fields.feed_amount || fields.quantity_used))) {
                const feedAmount = parseFloat(fields.feedAmount || fields.feedUsed || fields.feed_amount || fields.quantity_used || 0)
                if (feedAmount > 0) {
                  totalFeedFromReports += feedAmount
                }
              }

              // Process vaccination data
              if (report.type === "Vaccination" || report.type === "vaccination" || 
                  (report.type === "Daily" && fields.vaccinationCount)) {
                const vaccinationCount = parseInt(fields.vaccinationCount || 0)
                if (vaccinationCount > 0) {
                  totalVaccinationsFromReports += vaccinationCount
                }
              }

              // Process weight data
              if (fields.averageWeight || fields.currentWeight || fields.weight || fields.birdWeight) {
                const weight = parseFloat(fields.averageWeight || fields.currentWeight || fields.weight || fields.birdWeight || 0)
                if (weight > 0) {
                  weightSum += weight
                  totalWeightReadings++
                  latestWeight = weight // Keep the most recent weight
                }
              }
            }
          }

          // Calculate final statistics
          const originalBirdCount = batch.bird_count || 0
          const remainingBirds = Math.max(0, originalBirdCount - totalMortalityFromReports)
          const mortalityRate = originalBirdCount > 0 ? (totalMortalityFromReports / originalBirdCount) * 100 : 0
          
          // Calculate current weight from reports
          const currentWeight = latestWeight || (totalWeightReadings > 0 ? weightSum / totalWeightReadings : batch.current_weight || 0)
          
          // Calculate feed conversion ratio from reports
          const totalFeedUsed = totalFeedFromReports || batch.feed_used || 0
          const totalWeight = currentWeight * remainingBirds
          const feedConversionRatio = totalWeight > 0 ? totalFeedUsed / totalWeight : 0
          
          // Calculate health status based on mortality rate
          let healthStatus = "Excellent"
          if (mortalityRate > 5) healthStatus = "Poor"
          else if (mortalityRate > 3) healthStatus = "Fair"
          else if (mortalityRate > 1) healthStatus = "Good"

          // Calculate feed efficiency
          const feedEfficiency = totalWeight > 0 ? totalFeedUsed / totalWeight : 0

          // Calculate age
          const age = (() => {
            try {
              const start = new Date(batch.start_date)
              const diffMs = Date.now() - start.getTime()
              return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
            } catch {
              return 0
            }
          })()

          return {
            // Original batch data
            id: batch.id,
            name: batch.name,
            farmerId: batch.farmer_id || '',
            farmerName: batch.farmer_name || '',
            startDate: batch.start_date || '',
            status: batch.status || 'Planning',
            username: batch.username || '',
            password: batch.password || '',
            color: batch.color || 'bg-blue-500',
            notes: batch.notes || '',
            expectedHarvestDate: batch.expected_harvest_date || '',
            lastHealthCheck: batch.last_health_check || '',
            
            // Real-time statistics from reports
            birdCount: originalBirdCount,
            remainingBirds: remainingBirds,
            mortality: totalMortalityFromReports,
            mortalityRate: Math.round(mortalityRate * 100) / 100,
            feedUsed: totalFeedUsed,
            feedConversionRatio: Math.round(feedConversionRatio * 100) / 100,
            currentWeight: currentWeight,
            totalWeight: totalWeight,
            healthStatus: healthStatus,
            temperature: batch.temperature || 30,
            humidity: batch.humidity || 65,
            vaccinations: totalVaccinationsFromReports || batch.vaccinations || 0,
            age: age,
            
            // Additional metrics
            totalReports: reports?.length || 0,
            dataSource: "reports_table",
            lastUpdated: new Date().toISOString()
          }
        } catch (error) {
          console.error(`❌ Error processing batch ${batch.id}:`, error)
          // Return batch with original data if processing fails
          return {
            id: batch.id,
            name: batch.name,
            farmerId: batch.farmer_id || '',
            farmerName: batch.farmer_name || '',
            startDate: batch.start_date || '',
            status: batch.status || 'Planning',
            username: batch.username || '',
            password: batch.password || '',
            color: batch.color || 'bg-blue-500',
            notes: batch.notes || '',
            expectedHarvestDate: batch.expected_harvest_date || '',
            lastHealthCheck: batch.last_health_check || '',
            birdCount: batch.bird_count || 0,
            remainingBirds: batch.bird_count || 0,
            mortality: batch.mortality || 0,
            mortalityRate: 0,
            feedUsed: batch.feed_used || 0,
            feedConversionRatio: batch.feed_conversion_ratio || 1.5,
            healthStatus: batch.health_status || 'Good',
            temperature: batch.temperature || 30,
            humidity: batch.humidity || 65,
            currentWeight: batch.current_weight || 0,
            vaccinations: batch.vaccinations || 0,
            age: 0,
            totalReports: 0,
            dataSource: "batch_table",
            lastUpdated: new Date().toISOString()
          }
        }
      })
    )

    console.log(`✅ Processed ${batchesWithStats.length} batches with real-time statistics`)

    return NextResponse.json({ 
      batches: batchesWithStats,
      total: batchesWithStats.length,
      message: "Batches loaded with real-time statistics from reports"
    })

  } catch (error: any) {
    console.error("💥 Error fetching batches with stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
