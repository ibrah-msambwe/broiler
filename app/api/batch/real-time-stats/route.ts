import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Get real-time batch statistics from reports
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get("batchId")

    if (!batchId) {
      return NextResponse.json({ error: "batchId required" }, { status: 400 })
    }

    console.log("📊 Fetching real-time statistics for batch:", batchId)

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

    // Get all reports for this batch (all types)
    const { data: allReports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: true })

    if (reportsError) {
      console.error("❌ Error fetching reports:", reportsError)
      return NextResponse.json({ error: reportsError.message }, { status: 500 })
    }

    // Calculate statistics from all report types
    let totalMortalityFromReports = 0
    let totalFeedFromReports = 0
    let totalVaccinationsFromReports = 0
    let totalTemperatureReadings = 0
    let totalHumidityReadings = 0
    let totalWeightReadings = 0
    let temperatureSum = 0
    let humiditySum = 0
    let weightSum = 0
    let latestWeight = 0
    const mortalityHistory = []
    const feedHistory = []
    const healthHistory = []
    const vaccinationHistory = []
    const weightHistory = []

    if (allReports && allReports.length > 0) {
      console.log(`📊 Processing ${allReports.length} reports for batch ${batch.name}`)

      for (const report of allReports) {
        const fields = report.fields || {}
        
        // Process mortality data from all report types
        if (report.type === "Mortality" || report.type === "mortality" || report.type === "Mortality Report" || 
            (report.type === "Daily" && (fields.mortalityCount || fields.deathCount || fields.death_count))) {
          const mortalityCount = parseInt(fields.mortalityCount || fields.deathCount || fields.death_count || 0)
          if (mortalityCount > 0) {
            totalMortalityFromReports += mortalityCount
            mortalityHistory.push({
              date: report.created_at,
              deaths: mortalityCount,
              cause: fields.deathCause || fields.cause_of_death || fields.cause || "Unknown",
              location: fields.deathLocation || fields.location || "Not specified",
              reportId: report.id
            })
            console.log(`  💀 Report ${report.id}: ${mortalityCount} deaths`)
          }
        }

        // Process feed data from all report types
        if (report.type === "Feed" || report.type === "feed" || report.type === "Feed Report" || 
            (report.type === "Daily" && (fields.feedAmount || fields.feedUsed || fields.feed_amount || fields.quantity_used))) {
          const feedAmount = parseFloat(fields.feedAmount || fields.feedUsed || fields.feed_amount || fields.quantity_used || 0)
          if (feedAmount > 0) {
            totalFeedFromReports += feedAmount
            feedHistory.push({
              date: report.created_at,
              amount: feedAmount,
              type: fields.feedType || fields.feed_type || "Standard",
              reportId: report.id
            })
            console.log(`  🌾 Report ${report.id}: ${feedAmount} feed`)
          }
        }

        // Process vaccination data from all report types
        if (report.type === "Vaccination" || report.type === "vaccination" || 
            (report.type === "Daily" && (fields.vaccinationCount || fields.vaccinations))) {
          const vaccinationCount = parseInt(fields.vaccinationCount || fields.vaccinations || 0)
          if (vaccinationCount > 0) {
            totalVaccinationsFromReports += vaccinationCount
            vaccinationHistory.push({
              date: report.created_at,
              count: vaccinationCount,
              vaccine: fields.vaccineName || fields.vaccine_name || "Unknown",
              reportId: report.id
            })
            console.log(`  💉 Report ${report.id}: ${vaccinationCount} vaccinations`)
          }
        }

        // Process health data from all report types
        if (report.type === "Health" || report.type === "health" || 
            (report.type === "Daily" && (fields.temperature || fields.humidity))) {
          const temperature = parseFloat(fields.temperature || 0)
          const humidity = parseFloat(fields.humidity || 0)
          
          if (temperature > 0) {
            temperatureSum += temperature
            totalTemperatureReadings++
          }
          
          if (humidity > 0) {
            humiditySum += humidity
            totalHumidityReadings++
          }
          
          healthHistory.push({
            date: report.created_at,
            temperature: temperature,
            humidity: humidity,
            healthStatus: fields.overallHealth || fields.health_status || "Good",
            symptoms: fields.symptoms || "",
            reportId: report.id
          })
        }

        // Process environment data
        if (report.type === "Environment" || report.type === "environment" || 
            (report.type === "Daily" && (fields.environmentTemperature || fields.environmentHumidity))) {
          const envTemp = parseFloat(fields.environmentTemperature || fields.temperature || 0)
          const envHumidity = parseFloat(fields.environmentHumidity || fields.humidity || 0)
          
          if (envTemp > 0) {
            temperatureSum += envTemp
            totalTemperatureReadings++
          }
          
          if (envHumidity > 0) {
            humiditySum += envHumidity
            totalHumidityReadings++
          }
        }

        // Process weight data from all report types
        if (fields.averageWeight || fields.currentWeight || fields.weight || fields.birdWeight) {
          const weight = parseFloat(fields.averageWeight || fields.currentWeight || fields.weight || fields.birdWeight || 0)
          if (weight > 0) {
            weightSum += weight
            totalWeightReadings++
            latestWeight = weight // Keep the most recent weight
            
            weightHistory.push({
              date: report.created_at,
              weight: weight,
              reportType: report.type,
              reportId: report.id
            })
            
            console.log(`  ⚖️ Report ${report.id}: ${weight}kg average weight`)
          }
        }
      }
    }

    // Calculate final statistics
    const originalBirdCount = batch.bird_count || 0
    const remainingBirds = Math.max(0, originalBirdCount - totalMortalityFromReports)
    const mortalityRate = originalBirdCount > 0 ? (totalMortalityFromReports / originalBirdCount) * 100 : 0
    
    // Calculate average temperature and humidity from reports
    const avgTemperature = totalTemperatureReadings > 0 ? temperatureSum / totalTemperatureReadings : batch.temperature || 30
    const avgHumidity = totalHumidityReadings > 0 ? humiditySum / totalHumidityReadings : batch.humidity || 65
    
    // Calculate current weight from reports (use latest weight or average)
    const currentWeight = latestWeight || (totalWeightReadings > 0 ? weightSum / totalWeightReadings : batch.current_weight || 0)
    
    // Calculate health status based on mortality rate and other factors
    let healthStatus = "Excellent"
    if (mortalityRate > 5) healthStatus = "Poor"
    else if (mortalityRate > 3) healthStatus = "Fair"
    else if (mortalityRate > 1) healthStatus = "Good"

    // Calculate feed conversion ratio from reports
    const totalFeedUsed = totalFeedFromReports || batch.feed_used || 0
    const totalWeight = currentWeight * remainingBirds
    const feedConversionRatio = totalWeight > 0 ? totalFeedUsed / totalWeight : 0
    
    // Calculate feed efficiency (alternative metric)
    const feedEfficiency = totalWeight > 0 ? totalFeedUsed / totalWeight : 0

    // Calculate days since start
    const daysSinceStart = (() => {
      try {
        const start = new Date(batch.start_date)
        const diffMs = Date.now() - start.getTime()
        return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
      } catch {
        return 0
      }
    })()

    const statistics = {
      // Basic Info
      batchId: batch.id,
      batchName: batch.name,
      farmerName: batch.farmer_name,
      startDate: batch.start_date,
      status: batch.status,
      
      // Real-time Bird Statistics (calculated from reports)
      totalChicks: originalBirdCount,
      remainingBirds: remainingBirds,
      totalMortality: totalMortalityFromReports,
      mortalityRate: Math.round(mortalityRate * 100) / 100,
      
      // Feed Statistics (calculated from reports)
      totalFeedUsed: totalFeedUsed,
      feedEfficiency: Math.round(feedEfficiency * 100) / 100,
      feedConversionRatio: Math.round(feedConversionRatio * 100) / 100,
      currentWeight: currentWeight,
      totalWeight: totalWeight,
      
      // Health Statistics
      healthStatus: healthStatus,
      temperature: avgTemperature,
      humidity: avgHumidity,
      vaccinations: totalVaccinationsFromReports || batch.vaccinations || 0,
      
      // Time Statistics
      daysSinceStart: daysSinceStart,
      age: batch.age || daysSinceStart,
      
      // Report Data
      totalReports: allReports?.length || 0,
      mortalityHistory: mortalityHistory,
      feedHistory: feedHistory,
      healthHistory: healthHistory,
      vaccinationHistory: vaccinationHistory,
      weightHistory: weightHistory,
      
      // Calculated Metrics
      dailyMortalityRate: daysSinceStart > 0 ? mortalityRate / daysSinceStart : 0,
      averageDailyFeed: daysSinceStart > 0 ? totalFeedUsed / daysSinceStart : 0,
      
      // Data Source
      dataSource: "reports_table",
      lastUpdated: new Date().toISOString(),
      
      // Summary for dashboard
      summary: {
        totalBirds: originalBirdCount,
        remainingBirds: remainingBirds,
        totalMortality: totalMortalityFromReports,
        mortalityRate: Math.round(mortalityRate * 100) / 100,
        healthScore: healthStatus === "Excellent" ? 100 : 
                    healthStatus === "Good" ? 80 : 
                    healthStatus === "Fair" ? 60 : 40,
        feedBagsUsed: Math.round(totalFeedUsed / 50), // Assuming 50kg per bag
        daysSinceStart: daysSinceStart
      }
    }

    console.log("✅ Real-time statistics calculated:", {
      totalChicks: statistics.totalChicks,
      remainingBirds: statistics.remainingBirds,
      totalMortality: statistics.totalMortality,
      mortalityRate: statistics.mortalityRate,
      reportsProcessed: statistics.totalReports
    })

    return NextResponse.json({ 
      success: true,
      statistics,
      message: "Real-time statistics calculated from reports"
    })

  } catch (error: any) {
    console.error("💥 Error fetching real-time statistics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
