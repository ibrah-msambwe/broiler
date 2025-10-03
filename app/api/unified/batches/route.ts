import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET - Get all batches with statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const farmerId = searchParams.get('farmer_id')
    const includeCompleted = searchParams.get('include_completed') === 'true'

    let query = supabase
      .from('batch_statistics')
      .select('*')

    // Filter by status if specified
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by farmer if specified
    if (farmerId) {
      query = query.eq('farmer_id', farmerId)
    }

    // Filter out completed batches unless specifically requested
    if (!includeCompleted) {
      query = query.neq('status', 'Completed')
    }

    const { data: batches, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching batches:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data for frontend
    const transformedBatches = batches?.map(batch => ({
      id: batch.id,
      name: batch.name,
      farmerName: batch.farmer_name,
      birdCount: batch.bird_count,
      totalMortality: batch.total_mortality,
      remainingBirds: batch.remaining_birds,
      mortalityRate: batch.mortality_rate,
      healthScore: batch.health_score,
      healthStatus: batch.health_status,
      feedEfficiency: batch.feed_efficiency,
      currentWeight: batch.current_weight,
      feedUsed: batch.feed_used,
      vaccinations: batch.vaccinations,
      temperature: batch.temperature,
      humidity: batch.humidity,
      status: batch.status,
      startDate: batch.start_date,
      expectedHarvestDate: batch.expected_harvest_date,
      lastMortalityUpdate: batch.last_mortality_update,
      createdAt: batch.created_at,
      updatedAt: batch.updated_at,
      
      // Calculated fields
      age: batch.start_date ? Math.floor((new Date().getTime() - new Date(batch.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      mortalityTrend: batch.mortality_rate > 5 ? 'High' : batch.mortality_rate > 3 ? 'Medium' : 'Low',
      healthTrend: batch.health_score >= 90 ? 'Excellent' : batch.health_score >= 70 ? 'Good' : batch.health_score >= 50 ? 'Fair' : 'Poor'
    })) || []

    return NextResponse.json({
      batches: transformedBatches,
      total: transformedBatches.length,
      statistics: {
        totalBirds: transformedBatches.reduce((sum, b) => sum + (b.birdCount || 0), 0),
        totalMortality: transformedBatches.reduce((sum, b) => sum + (b.totalMortality || 0), 0),
        totalRemaining: transformedBatches.reduce((sum, b) => sum + (b.remainingBirds || 0), 0),
        averageMortalityRate: transformedBatches.length > 0 
          ? transformedBatches.reduce((sum, b) => sum + (b.mortalityRate || 0), 0) / transformedBatches.length 
          : 0,
        averageHealthScore: transformedBatches.length > 0 
          ? transformedBatches.reduce((sum, b) => sum + (b.healthScore || 0), 0) / transformedBatches.length 
          : 0
      }
    })

  } catch (error: any) {
    console.error("Error in unified batches API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new batch
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const {
      name,
      farmerName,
      farmerId,
      startDate,
      birdCount,
      expectedHarvestDate,
      notes,
      color
    } = body

    // Validate required fields
    if (!name || !farmerName || !birdCount) {
      return NextResponse.json({ 
        error: "name, farmerName, and birdCount are required" 
      }, { status: 400 })
    }

    // Create batch
    const { data: newBatch, error } = await supabase
      .from('batches')
      .insert({
        name,
        farmer_name: farmerName,
        farmer_id: farmerId,
        start_date: startDate,
        bird_count: birdCount,
        remaining_birds: birdCount, // Initially, all birds are remaining
        expected_harvest_date: expectedHarvestDate,
        status: 'Planning',
        total_mortality: 0,
        mortality_rate: 0.00,
        health_score: 100,
        health_status: 'Excellent',
        feed_efficiency: 0.00,
        feed_used: 0,
        current_weight: 0,
        feed_conversion_ratio: 1.5,
        vaccinations: 0,
        temperature: 30,
        humidity: 65,
        color: color || 'bg-blue-500',
        notes: notes,
        last_mortality_update: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating batch:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If farmerId is provided, create a batch_user for this batch
    if (farmerId) {
      try {
        await supabase.rpc('create_unified_user', {
          p_user_type: 'batch_user',
          p_name: `${farmerName} - ${name}`,
          p_email: null,
          p_phone: null,
          p_password_hash: null,
          p_username: `${name.toLowerCase().replace(/\s+/g, '_')}_user`,
          p_batch_id: newBatch.id,
          p_farmer_id: farmerId
        })
      } catch (userError) {
        console.warn("Could not create batch user:", userError)
      }
    }

    return NextResponse.json({
      success: true,
      batch: {
        id: newBatch.id,
        name: newBatch.name,
        farmerName: newBatch.farmer_name,
        farmerId: newBatch.farmer_id,
        birdCount: newBatch.bird_count,
        remainingBirds: newBatch.remaining_birds,
        totalMortality: newBatch.total_mortality,
        mortalityRate: newBatch.mortality_rate,
        healthScore: newBatch.health_score,
        healthStatus: newBatch.health_status,
        status: newBatch.status,
        startDate: newBatch.start_date,
        expectedHarvestDate: newBatch.expected_harvest_date,
        createdAt: newBatch.created_at
      }
    })

  } catch (error: any) {
    console.error("Error creating batch:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update batch
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 })
    }

    // Update batch
    const { data: updatedBatch, error } = await supabase
      .from('batches')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("Error updating batch:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trigger statistics update
    try {
      await supabase.rpc('update_batch_statistics', { batch_uuid: id })
    } catch (statsError) {
      console.warn("Could not update batch statistics:", statsError)
    }

    return NextResponse.json({
      success: true,
      batch: updatedBatch
    })

  } catch (error: any) {
    console.error("Error updating batch:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete batch
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('id')

    if (!batchId) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 })
    }

    // Delete batch (this will cascade to related records)
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchId)

    if (error) {
      console.error("Error deleting batch:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully"
    })

  } catch (error: any) {
    console.error("Error deleting batch:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
