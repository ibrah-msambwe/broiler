import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Get all reports with batch information
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch_id')
    const reportType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('reports')
      .select(`
        id,
        batch_id,
        batch_name,
        farmer_name,
        report_type,
        fields,
        processed_data,
        auto_calculated,
        batch_updated,
        urgency_level,
        created_at,
        updated_at
      `)

    // Filter by batch if specified
    if (batchId) {
      query = query.eq('batch_id', batchId)
    }

    // Filter by report type if specified
    if (reportType && reportType !== 'all') {
      query = query.eq('report_type', reportType)
    }

    const { data: reports, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      reports: reports || [],
      total: reports?.length || 0
    })

  } catch (error: any) {
    console.error("Error in unified reports API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Submit a new report with automatic batch updates
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const {
      batchId,
      reportType,
      fields,
      farmerName,
      batchName,
      urgencyLevel = 'normal'
    } = body

    // Validate required fields
    if (!batchId || !reportType || !fields) {
      return NextResponse.json({ 
        error: "batchId, reportType, and fields are required" 
      }, { status: 400 })
    }

    console.log(`📊 Processing ${reportType} report for batch ${batchId}`)

    // Get current batch data
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (batchError || !batch) {
      console.error("Error fetching batch:", batchError)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Process the report based on type
    let processedData: any = {}
    let batchUpdates: any = {}

    switch (reportType.toLowerCase()) {
      case 'mortality':
        processedData = await processMortalityReport(fields, batch)
        batchUpdates = {
          total_mortality: processedData.totalMortality,
          remaining_birds: processedData.remainingBirds,
          mortality_rate: processedData.mortalityRate,
          health_score: processedData.healthScore,
          health_status: processedData.healthStatus,
          last_mortality_update: new Date().toISOString()
        }
        break

      case 'daily':
        processedData = await processDailyReport(fields, batch)
        if (processedData.mortality) {
          batchUpdates.total_mortality = processedData.mortality
          batchUpdates.remaining_birds = processedData.remainingBirds
          batchUpdates.mortality_rate = processedData.mortalityRate
        }
        if (processedData.feedUsed) {
          batchUpdates.feed_used = processedData.feedUsed
          batchUpdates.feed_efficiency = processedData.feedEfficiency
        }
        if (processedData.healthStatus) {
          batchUpdates.health_status = processedData.healthStatus
          batchUpdates.health_score = processedData.healthScore
        }
        if (processedData.temperature) batchUpdates.temperature = processedData.temperature
        if (processedData.humidity) batchUpdates.humidity = processedData.humidity
        if (processedData.currentWeight) batchUpdates.current_weight = processedData.currentWeight
        break

      case 'health':
        processedData = await processHealthReport(fields, batch)
        batchUpdates = {
          health_status: processedData.healthStatus,
          health_score: processedData.healthScore,
          temperature: processedData.temperature,
          humidity: processedData.humidity,
          last_health_check: new Date().toISOString()
        }
        break

      case 'feed':
        processedData = await processFeedReport(fields, batch)
        batchUpdates = {
          feed_used: processedData.totalFeedUsed,
          feed_efficiency: processedData.feedEfficiency,
          current_weight: processedData.averageWeight
        }
        break

      case 'vaccination':
        processedData = await processVaccinationReport(fields, batch)
        batchUpdates = {
          vaccinations: processedData.totalVaccinations,
          health_status: processedData.healthStatus,
          health_score: processedData.healthScore
        }
        break

      default:
        console.log(`ℹ️ No specific processing for report type: ${reportType}`)
        processedData = { message: "Report recorded but no batch updates needed" }
    }

    // Update batch with processed data
    if (Object.keys(batchUpdates).length > 0) {
      console.log("🔄 Updating batch with:", batchUpdates)
      
      const { error: updateError } = await supabase
        .from('batches')
        .update({
          ...batchUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId)

      if (updateError) {
        console.error("❌ Error updating batch:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      console.log("✅ Batch updated successfully")
    }

    // Create the report record
    const { data: newReport, error: reportError } = await supabase
      .from('reports')
      .insert({
        batch_id: batchId,
        batch_name: batchName || batch.name,
        farmer_name: farmerName || batch.farmer_name,
        report_type: reportType,
        fields: fields,
        processed_data: processedData,
        auto_calculated: true,
        batch_updated: Object.keys(batchUpdates).length > 0,
        urgency_level: urgencyLevel
      })
      .select()
      .single()

    if (reportError) {
      console.error("❌ Error creating report:", reportError)
      return NextResponse.json({ error: reportError.message }, { status: 500 })
    }

    // Trigger automatic statistics update
    try {
      await supabase.rpc('update_batch_statistics', { batch_uuid: batchId })
    } catch (statsError) {
      console.warn("Could not update batch statistics:", statsError)
    }

    return NextResponse.json({
      success: true,
      message: "Report processed and batch updated automatically",
      report: newReport,
      batchUpdates,
      processedData
    })

  } catch (error: any) {
    console.error("💥 Error in unified reports API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Process Mortality Report
async function processMortalityReport(data: any, batch: any) {
  console.log("💀 Processing mortality report:", data)
  
  const currentMortality = batch.total_mortality || 0
  const newMortality = parseInt(data.mortalityCount || data.deathCount) || 0
  const totalMortality = currentMortality + newMortality
  
  // Calculate remaining birds after deaths
  const originalBirdCount = batch.bird_count || 0
  const remainingBirds = Math.max(0, originalBirdCount - totalMortality)
  
  // Calculate mortality rate
  const mortalityRate = originalBirdCount > 0 ? (totalMortality / originalBirdCount) * 100 : 0
  
  // Calculate health score based on mortality rate
  const healthScore = Math.max(0, 100 - (mortalityRate * 10))
  
  // Determine health status
  const healthStatus = healthScore >= 90 ? 'Excellent' : 
                      healthScore >= 70 ? 'Good' : 
                      healthScore >= 50 ? 'Fair' : 'Poor'

  console.log("📊 Mortality calculations:", {
    originalBirdCount,
    currentMortality,
    newMortality,
    totalMortality,
    remainingBirds,
    mortalityRate: Math.round(mortalityRate * 100) / 100,
    healthScore,
    healthStatus
  })

  return {
    totalMortality,
    newMortality,
    remainingBirds,
    mortalityRate: Math.round(mortalityRate * 100) / 100,
    healthScore: Math.round(healthScore),
    healthStatus,
    originalBirdCount
  }
}

// Process Daily Report
async function processDailyReport(data: any, batch: any) {
  console.log("📊 Processing daily report:", data)
  
  const processed: any = {}
  
  // Process mortality if present
  if (data.mortalityCount || data.deathCount) {
    const currentMortality = batch.total_mortality || 0
    const newMortality = parseInt(data.mortalityCount || data.deathCount) || 0
    const totalMortality = currentMortality + newMortality
    
    const originalBirdCount = batch.bird_count || 0
    const remainingBirds = Math.max(0, originalBirdCount - totalMortality)
    const mortalityRate = originalBirdCount > 0 ? (totalMortality / originalBirdCount) * 100 : 0
    
    processed.mortality = totalMortality
    processed.remainingBirds = remainingBirds
    processed.mortalityRate = Math.round(mortalityRate * 100) / 100
  }
  
  // Process feed if present
  if (data.feedUsed) {
    const currentFeedUsed = batch.feed_used || 0
    const newFeedUsed = parseFloat(data.feedUsed) || 0
    const totalFeedUsed = currentFeedUsed + newFeedUsed
    
    const remainingBirds = processed.remainingBirds || (batch.bird_count || 0) - (batch.total_mortality || 0)
    const averageWeight = parseFloat(data.averageWeight) || batch.current_weight || 0
    const feedEfficiency = (averageWeight * remainingBirds) > 0 ? totalFeedUsed / (averageWeight * remainingBirds) : 0
    
    processed.feedUsed = totalFeedUsed
    processed.feedEfficiency = Math.round(feedEfficiency * 100) / 100
  }
  
  // Process health status
  if (data.overallHealth) {
    const healthScore = data.overallHealth === 'Excellent' ? 100 :
                       data.overallHealth === 'Good' ? 80 :
                       data.overallHealth === 'Fair' ? 60 : 40
    processed.healthStatus = data.overallHealth
    processed.healthScore = healthScore
  }
  
  // Process environment
  if (data.temperature) processed.temperature = parseFloat(data.temperature)
  if (data.humidity) processed.humidity = parseFloat(data.humidity)
  if (data.averageWeight) processed.currentWeight = parseFloat(data.averageWeight)

  return processed
}

// Process Health Report
async function processHealthReport(data: any, batch: any) {
  console.log("🏥 Processing health report:", data)
  
  const temperature = parseFloat(data.temperature) || batch.temperature || 30
  const humidity = parseFloat(data.humidity) || batch.humidity || 65
  
  // Determine health status based on various factors
  let healthScore = 100
  let healthStatus = "Excellent"
  
  if (data.diseaseDetected === "Yes" || data.medicationGiven === "Yes") {
    healthScore = 30
    healthStatus = "Poor"
  } else if (data.healthIssues && data.healthIssues.length > 0) {
    healthScore = 60
    healthStatus = "Fair"
  } else if (temperature >= 35 || temperature <= 25) {
    healthScore = 70
    healthStatus = "Fair"
  } else if (humidity >= 80 || humidity <= 40) {
    healthScore = 80
    healthStatus = "Good"
  }

  return {
    healthStatus,
    healthScore,
    temperature,
    humidity,
    diseaseDetected: data.diseaseDetected === "Yes",
    medicationGiven: data.medicationGiven === "Yes",
    healthIssues: data.healthIssues || []
  }
}

// Process Feed Report
async function processFeedReport(data: any, batch: any) {
  console.log("🌾 Processing feed report:", data)
  
  const currentFeedUsed = batch.feed_used || 0
  const newFeedUsed = parseFloat(data.feedAmount) || 0
  const totalFeedUsed = currentFeedUsed + newFeedUsed
  
  const currentWeight = parseFloat(data.averageWeight) || batch.current_weight || 0
  const remainingBirds = (batch.bird_count || 0) - (batch.total_mortality || 0)
  const totalWeight = currentWeight * remainingBirds
  
  const feedEfficiency = totalWeight > 0 ? totalFeedUsed / totalWeight : 0

  return {
    totalFeedUsed,
    newFeedUsed,
    feedEfficiency: Math.round(feedEfficiency * 100) / 100,
    averageWeight: currentWeight,
    totalWeight
  }
}

// Process Vaccination Report
async function processVaccinationReport(data: any, batch: any) {
  console.log("💉 Processing vaccination report:", data)
  
  const currentVaccinations = batch.vaccinations || 0
  const newVaccinations = parseInt(data.vaccinationCount) || 0
  const totalVaccinations = currentVaccinations + newVaccinations
  
  // Vaccination generally improves health status
  let healthScore = 100
  let healthStatus = "Excellent"
  
  if (totalVaccinations > 5) {
    healthScore = 100
    healthStatus = "Excellent"
  } else if (totalVaccinations > 2) {
    healthScore = 90
    healthStatus = "Good"
  } else if (totalVaccinations > 0) {
    healthScore = 80
    healthStatus = "Good"
  }

  return {
    totalVaccinations,
    newVaccinations,
    healthStatus,
    healthScore,
    vaccinationType: data.vaccinationType || "Unknown"
  }
}
