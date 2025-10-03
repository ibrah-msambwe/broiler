import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    console.log("🔄 Processing all mortality reports to update batch statistics...")

    // Get all mortality reports
    const { data: mortalityReports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .eq("report_type", "mortality")
      .order("created_at", { ascending: true })

    if (reportsError) {
      console.error("❌ Error fetching mortality reports:", reportsError)
      return NextResponse.json({ error: reportsError.message }, { status: 500 })
    }

    if (!mortalityReports || mortalityReports.length === 0) {
      return NextResponse.json({ 
        message: "No mortality reports found",
        processed: 0
      })
    }

    console.log(`📊 Found ${mortalityReports.length} mortality reports to process`)

    // Group reports by batch_id
    const reportsByBatch = mortalityReports.reduce((acc, report) => {
      const batchId = report.batch_id
      if (!acc[batchId]) {
        acc[batchId] = []
      }
      acc[batchId].push(report)
      return acc
    }, {} as Record<string, any[]>)

    const results = []
    let totalProcessed = 0

    // Process each batch
    for (const [batchId, reports] of Object.entries(reportsByBatch)) {
      console.log(`🔄 Processing batch ${batchId} with ${reports.length} mortality reports`)

      try {
        // Get current batch data
        const { data: batch, error: batchError } = await supabase
          .from("batches")
          .select("*")
          .eq("id", batchId)
          .single()

        if (batchError || !batch) {
          console.error(`❌ Error fetching batch ${batchId}:`, batchError)
          continue
        }

        // Calculate total mortality from all reports
        const totalMortalityFromReports = reports.reduce((sum, report) => {
          const mortalityCount = report.fields?.mortalityCount || report.fields?.deathCount || 0
          return sum + (parseInt(mortalityCount) || 0)
        }, 0)

        console.log(`📊 Batch ${batchId} - Original: ${batch.bird_count}, Current Mortality: ${batch.mortality}, Reports Total: ${totalMortalityFromReports}`)

        // Update batch with correct values
        const remainingBirds = Math.max(0, (batch.bird_count || 0) - totalMortalityFromReports)
        const mortalityRate = (batch.bird_count || 0) > 0 ? (totalMortalityFromReports / (batch.bird_count || 0)) * 100 : 0

        const { error: updateError } = await supabase
          .from("batches")
          .update({
            mortality: totalMortalityFromReports,
            remaining_birds: remainingBirds,
            mortality_rate: Math.round(mortalityRate * 100) / 100,
            health_status: mortalityRate > 5 ? "Poor" : mortalityRate > 3 ? "Fair" : mortalityRate > 1 ? "Good" : "Excellent",
            updated_at: new Date().toISOString()
          })
          .eq("id", batchId)

        if (updateError) {
          console.error(`❌ Error updating batch ${batchId}:`, updateError)
          results.push({
            batchId,
            success: false,
            error: updateError.message,
            reportsProcessed: reports.length
          })
        } else {
          console.log(`✅ Updated batch ${batchId}: ${remainingBirds} remaining birds, ${totalMortalityFromReports} total mortality`)
          results.push({
            batchId,
            success: true,
            originalBirdCount: batch.bird_count,
            totalMortality: totalMortalityFromReports,
            remainingBirds,
            mortalityRate: Math.round(mortalityRate * 100) / 100,
            reportsProcessed: reports.length
          })
          totalProcessed += reports.length
        }

      } catch (error) {
        console.error(`❌ Error processing batch ${batchId}:`, error)
        results.push({
          batchId,
          success: false,
          error: (error as Error).message,
          reportsProcessed: reports.length
        })
      }
    }

    console.log(`✅ Processing complete. ${totalProcessed} reports processed across ${results.length} batches`)

    return NextResponse.json({
      success: true,
      message: `Processed ${totalProcessed} mortality reports across ${results.length} batches`,
      totalReports: mortalityReports.length,
      totalProcessed,
      results
    })

  } catch (error: any) {
    console.error("💥 Error processing all mortality reports:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
