import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

interface ReportData {
  [key: string]: any
}

interface BatchUpdate {
  mortality?: number
  bird_count?: number
  feed_used?: number
  current_weight?: number
  feed_conversion_ratio?: number
  vaccinations?: number
  health_status?: string
  temperature?: number
  humidity?: number
  last_health_check?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { reportId, batchId, reportType, reportData } = body || {}

    if (!reportId || !batchId || !reportType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("🤖 Processing intelligent report:", { reportId, batchId, reportType, reportData })

    // Get current batch data
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .single()

    if (batchError || !batch) {
      console.error("❌ Error fetching batch:", batchError)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    console.log("📊 Current batch data:", batch)

    // Process report based on type
    const batchUpdate: BatchUpdate = {}
    let processedData: any = {}

    switch (reportType.toLowerCase()) {
      case "mortality":
        processedData = await processMortalityReport(reportData, batch)
        batchUpdate.mortality = processedData.totalMortality
        batchUpdate.bird_count = processedData.remainingBirds
        batchUpdate.health_status = processedData.healthStatus
        break

      case "feed":
        processedData = await processFeedReport(reportData, batch)
        batchUpdate.feed_used = processedData.totalFeedUsed
        batchUpdate.feed_conversion_ratio = processedData.feedConversionRatio
        break

      case "health":
        processedData = await processHealthReport(reportData, batch)
        batchUpdate.health_status = processedData.healthStatus
        batchUpdate.temperature = processedData.temperature
        batchUpdate.humidity = processedData.humidity
        batchUpdate.last_health_check = new Date().toISOString()
        break

      case "vaccination":
        processedData = await processVaccinationReport(reportData, batch)
        batchUpdate.vaccinations = processedData.totalVaccinations
        batchUpdate.health_status = processedData.healthStatus
        break

      case "daily":
        processedData = await processDailyReport(reportData, batch)
        // Daily reports can update multiple fields
        if (processedData.mortality) batchUpdate.mortality = processedData.mortality
        if (processedData.remainingBirds !== undefined) batchUpdate.bird_count = processedData.remainingBirds
        if (processedData.feedUsed) batchUpdate.feed_used = processedData.feedUsed
        if (processedData.healthStatus) batchUpdate.health_status = processedData.healthStatus
        if (processedData.temperature) batchUpdate.temperature = processedData.temperature
        if (processedData.humidity) batchUpdate.humidity = processedData.humidity
        if (processedData.currentWeight) batchUpdate.current_weight = processedData.currentWeight
        break

      case "environment":
        processedData = await processEnvironmentReport(reportData, batch)
        batchUpdate.temperature = processedData.temperature
        batchUpdate.humidity = processedData.humidity
        break

      default:
        console.log("ℹ️ No specific processing for report type:", reportType)
        return NextResponse.json({ 
          success: true, 
          message: "Report processed but no batch updates needed" 
        })
    }

    // Update batch with processed data
    if (Object.keys(batchUpdate).length > 0) {
      console.log("🔄 Updating batch with:", batchUpdate)
      
      const { error: updateError } = await supabase
        .from("batches")
        .update(batchUpdate)
        .eq("id", batchId)

      if (updateError) {
        console.error("❌ Error updating batch:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      console.log("✅ Batch updated successfully")
    }

    // Update the report with processed data
    const { error: reportUpdateError } = await supabase
      .from("reports")
      .update({ 
        fields: { ...reportData, processed: true, processedData },
        updated_at: new Date().toISOString()
      })
      .eq("id", reportId)

    if (reportUpdateError) {
      console.error("❌ Error updating report:", reportUpdateError)
    }

    return NextResponse.json({
      success: true,
      message: "Report processed intelligently",
      batchUpdate,
      processedData
    })

  } catch (error: any) {
    console.error("💥 Error in intelligent report processing:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Process Mortality Report
async function processMortalityReport(data: ReportData, batch: any) {
  console.log("💀 Processing mortality report:", data)
  console.log("📊 Current batch state:", {
    bird_count: batch.bird_count,
    mortality: batch.mortality
  })
  
  const currentMortality = batch.mortality || 0
  const newMortality = parseInt(data.mortalityCount || data.deathCount) || 0
  const totalMortality = currentMortality + newMortality
  
  // Calculate remaining birds after deaths
  const originalBirdCount = batch.bird_count || 0
  const remainingBirds = originalBirdCount - totalMortality
  
  console.log("🔄 Mortality calculations:", {
    originalBirdCount,
    currentMortality,
    newMortality,
    totalMortality,
    remainingBirds
  })
  
  // Calculate health status based on mortality rate (using original count for rate calculation)
  const mortalityRate = originalBirdCount > 0 ? (totalMortality / originalBirdCount) * 100 : 0
  let healthStatus = "Excellent"
  
  if (mortalityRate > 5) healthStatus = "Poor"
  else if (mortalityRate > 3) healthStatus = "Fair"
  else if (mortalityRate > 1) healthStatus = "Good"

  console.log("📈 Health status calculation:", {
    mortalityRate: Math.round(mortalityRate * 100) / 100,
    healthStatus
  })

  return {
    totalMortality,
    newMortality,
    mortalityRate: Math.round(mortalityRate * 100) / 100,
    healthStatus,
    remainingBirds: Math.max(0, remainingBirds), // Ensure we don't go below 0
    originalBirdCount
  }
}

// Process Feed Report
async function processFeedReport(data: ReportData, batch: any) {
  console.log("🌾 Processing feed report:", data)
  
  const currentFeedUsed = batch.feed_used || 0
  const newFeedUsed = parseFloat(data.feedAmount) || 0
  const totalFeedUsed = currentFeedUsed + newFeedUsed
  
  // Calculate feed conversion ratio
  const currentWeight = parseFloat(data.averageWeight) || batch.current_weight || 0
  const totalBirds = (batch.bird_count || 0) - (batch.mortality || 0)
  const totalWeight = currentWeight * totalBirds
  
  const feedConversionRatio = totalWeight > 0 ? totalFeedUsed / totalWeight : 1.5

  return {
    totalFeedUsed,
    newFeedUsed,
    feedConversionRatio: Math.round(feedConversionRatio * 100) / 100,
    averageWeight: currentWeight,
    totalWeight
  }
}

// Process Health Report
async function processHealthReport(data: ReportData, batch: any) {
  console.log("🏥 Processing health report:", data)
  
  const temperature = parseFloat(data.temperature) || batch.temperature || 30
  const humidity = parseFloat(data.humidity) || batch.humidity || 65
  
  // Determine health status based on various factors
  let healthStatus = "Good"
  
  if (data.diseaseDetected === "Yes" || data.medicationGiven === "Yes") {
    healthStatus = "Poor"
  } else if (data.healthIssues && data.healthIssues.length > 0) {
    healthStatus = "Fair"
  } else if (temperature >= 35 || temperature <= 25) {
    healthStatus = "Fair"
  }

  return {
    healthStatus,
    temperature,
    humidity,
    diseaseDetected: data.diseaseDetected === "Yes",
    medicationGiven: data.medicationGiven === "Yes",
    healthIssues: data.healthIssues || []
  }
}

// Process Vaccination Report
async function processVaccinationReport(data: ReportData, batch: any) {
  console.log("💉 Processing vaccination report:", data)
  
  const currentVaccinations = batch.vaccinations || 0
  const newVaccinations = parseInt(data.vaccinationCount) || 0
  const totalVaccinations = currentVaccinations + newVaccinations
  
  // Vaccination generally improves health status
  let healthStatus = "Good"
  if (totalVaccinations > 5) healthStatus = "Excellent"
  else if (totalVaccinations > 2) healthStatus = "Good"

  return {
    totalVaccinations,
    newVaccinations,
    healthStatus,
    vaccinationType: data.vaccinationType || "Unknown"
  }
}

// Process Daily Report
async function processDailyReport(data: ReportData, batch: any) {
  console.log("📊 Processing daily report:", data)
  
  const processed: any = {}
  
  // Process mortality if present
  if (data.mortalityCount || data.deathCount) {
    const currentMortality = batch.mortality || 0
    const newMortality = parseInt(data.mortalityCount || data.deathCount) || 0
    const totalMortality = currentMortality + newMortality
    
    // Calculate remaining birds after deaths
    const originalBirdCount = batch.bird_count || 0
    const remainingBirds = Math.max(0, originalBirdCount - totalMortality)
    
    processed.mortality = totalMortality
    processed.remainingBirds = remainingBirds
    
    console.log("📊 Daily report mortality processing:", {
      originalBirdCount,
      currentMortality,
      newMortality,
      totalMortality,
      remainingBirds
    })
  }
  
  // Process feed if present
  if (data.feedUsed) {
    const currentFeedUsed = batch.feed_used || 0
    const newFeedUsed = parseFloat(data.feedUsed) || 0
    processed.feedUsed = currentFeedUsed + newFeedUsed
  }
  
  // Process health status
  if (data.overallHealth) {
    processed.healthStatus = data.overallHealth
  }
  
  // Process environment
  if (data.temperature) {
    processed.temperature = parseFloat(data.temperature)
  }
  if (data.humidity) {
    processed.humidity = parseFloat(data.humidity)
  }
  
  // Process weight
  if (data.averageWeight) {
    processed.currentWeight = parseFloat(data.averageWeight)
  }

  return processed
}

// Process Environment Report
async function processEnvironmentReport(data: ReportData, batch: any) {
  console.log("🌡️ Processing environment report:", data)
  
  const temperature = parseFloat(data.temperature) || batch.temperature || 30
  const humidity = parseFloat(data.humidity) || batch.humidity || 65
  
  return {
    temperature,
    humidity,
    ventilationStatus: data.ventilationStatus || "Good",
    lightingHours: data.lightingHours || 16
  }
}
