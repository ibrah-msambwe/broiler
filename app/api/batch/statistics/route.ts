import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get("batchId")

    if (!batchId) {
      return NextResponse.json({ error: "batchId required" }, { status: 400 })
    }

    console.log("📊 Fetching batch statistics for:", batchId)

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

    // Calculate derived statistics
    const totalBirds = batch.bird_count || 0
    const totalMortality = batch.mortality || 0
    const remainingBirds = totalBirds - totalMortality
    const mortalityRate = totalBirds > 0 ? (totalMortality / totalBirds) * 100 : 0
    const feedUsed = batch.feed_used || 0
    const currentWeight = batch.current_weight || 0
    const totalWeight = remainingBirds * currentWeight
    const feedConversionRatio = totalWeight > 0 ? feedUsed / totalWeight : 0

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

    // Get recent reports for this batch
    const { data: recentReports, error: reportsError } = await supabase
      .from("reports")
      .select("id, type, title, created_at, priority, status")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (reportsError) {
      console.warn("⚠️ Error fetching recent reports:", reportsError)
    }

    const statistics = {
      // Basic Info
      batchName: batch.name,
      farmerName: batch.farmer_name,
      startDate: batch.start_date,
      status: batch.status,
      
      // Bird Statistics
      totalBirds,
      remainingBirds,
      totalMortality,
      mortalityRate: Math.round(mortalityRate * 100) / 100,
      
      // Feed Statistics
      totalFeedUsed: feedUsed,
      feedConversionRatio: Math.round(feedConversionRatio * 100) / 100,
      currentWeight,
      totalWeight,
      
      // Health Statistics
      healthStatus: batch.health_status,
      temperature: batch.temperature,
      humidity: batch.humidity,
      vaccinations: batch.vaccinations || 0,
      lastHealthCheck: batch.last_health_check,
      
      // Time Statistics
      daysSinceStart,
      age: batch.age || daysSinceStart,
      
      // Recent Activity
      recentReports: recentReports || [],
      
      // Calculated Metrics
      dailyMortalityRate: daysSinceStart > 0 ? mortalityRate / daysSinceStart : 0,
      averageDailyFeed: daysSinceStart > 0 ? feedUsed / daysSinceStart : 0,
      weightGain: currentWeight > 0 ? currentWeight : 0,
      
      // Health Indicators
      healthScore: calculateHealthScore(batch, mortalityRate, daysSinceStart),
      riskLevel: calculateRiskLevel(mortalityRate, batch.health_status, daysSinceStart)
    }

    console.log("✅ Batch statistics calculated:", {
      totalBirds,
      remainingBirds,
      mortalityRate: statistics.mortalityRate,
      healthScore: statistics.healthScore
    })

    return NextResponse.json({ statistics })

  } catch (error: any) {
    console.error("💥 Error fetching batch statistics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Calculate health score based on various factors
function calculateHealthScore(batch: any, mortalityRate: number, daysSinceStart: number): number {
  let score = 100

  // Mortality impact (0-40 points)
  if (mortalityRate > 5) score -= 40
  else if (mortalityRate > 3) score -= 30
  else if (mortalityRate > 1) score -= 20
  else if (mortalityRate > 0.5) score -= 10

  // Health status impact (0-30 points)
  switch (batch.health_status) {
    case "Poor": score -= 30; break
    case "Fair": score -= 20; break
    case "Good": score -= 10; break
    case "Excellent": score -= 0; break
  }

  // Temperature impact (0-15 points)
  const temp = batch.temperature || 30
  if (temp < 25 || temp > 35) score -= 15
  else if (temp < 28 || temp > 32) score -= 10
  else if (temp < 30 || temp > 31) score -= 5

  // Age impact (0-15 points)
  if (daysSinceStart > 50) score -= 15
  else if (daysSinceStart > 40) score -= 10
  else if (daysSinceStart > 30) score -= 5

  return Math.max(0, Math.min(100, score))
}

// Calculate risk level based on various factors
function calculateRiskLevel(mortalityRate: number, healthStatus: string, daysSinceStart: number): "Low" | "Medium" | "High" | "Critical" {
  let riskScore = 0

  // Mortality risk
  if (mortalityRate > 5) riskScore += 40
  else if (mortalityRate > 3) riskScore += 30
  else if (mortalityRate > 1) riskScore += 20
  else if (mortalityRate > 0.5) riskScore += 10

  // Health status risk
  switch (healthStatus) {
    case "Poor": riskScore += 30; break
    case "Fair": riskScore += 20; break
    case "Good": riskScore += 10; break
  }

  // Age risk
  if (daysSinceStart > 50) riskScore += 20
  else if (daysSinceStart > 40) riskScore += 15
  else if (daysSinceStart > 30) riskScore += 10

  if (riskScore >= 60) return "Critical"
  if (riskScore >= 40) return "High"
  if (riskScore >= 20) return "Medium"
  return "Low"
}
