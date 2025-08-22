export type Candidate = {
	id: string
	contactName: string
	email: string
	batchName: string
	username: string
	password: string
	status: "Pending" | "Approved" | "Denied"
	createdAt: string
}

export type DemoBatch = {
	id: string
	name: string
	farmerId: string
	farmerName: string
	startDate: string
	birdCount: number
	age: number
	status: "Active" | "Completed" | "Planning"
	mortality: number
	feedUsed: number
	healthStatus: "Excellent" | "Good" | "Fair" | "Poor"
	temperature: number
	humidity: number
	username: string
	password: string
	color: string
	expectedHarvestDate: string
	currentWeight: number
	feedConversionRatio: number
	vaccinations: number
	lastHealthCheck: string
	notes?: string
}

const baseBatches: DemoBatch[] = [
	{
		id: "B001",
		name: "Alpha Premium Batch",
		farmerId: "F001",
		farmerName: "John Mkulima",
		startDate: "2025-01-01",
		birdCount: 2000,
		age: 21,
		status: "Active",
		mortality: 50,
		feedUsed: 120,
		healthStatus: "Good",
		temperature: 32,
		humidity: 65,
		username: "batch_alpha",
		password: "alpha123",
		color: "bg-blue-500",
		expectedHarvestDate: "2025-02-15",
		currentWeight: 1.8,
		feedConversionRatio: 1.6,
		vaccinations: 3,
		lastHealthCheck: "2025-01-20",
		notes: "High-performance batch with excellent growth rate",
	},
	{
		id: "B002",
		name: "Beta Standard Batch",
		farmerId: "F001",
		farmerName: "John Mkulima",
		startDate: "2025-01-10",
		birdCount: 1500,
		age: 12,
		status: "Active",
		mortality: 30,
		feedUsed: 80,
		healthStatus: "Excellent",
		temperature: 31,
		humidity: 68,
		username: "batch_beta",
		password: "beta123",
		color: "bg-green-500",
		expectedHarvestDate: "2025-02-25",
		currentWeight: 1.2,
		feedConversionRatio: 1.5,
		vaccinations: 2,
		lastHealthCheck: "2025-01-19",
		notes: "Standard batch with good health indicators",
	},
	{
		id: "B003",
		name: "MSAMBWE Elite Batch",
		farmerId: "F003",
		farmerName: "Ibrahim Msambwe",
		startDate: "2025-01-15",
		birdCount: 200000,
		age: 7,
		status: "Active",
		mortality: 2000,
		feedUsed: 8500,
		healthStatus: "Excellent",
		temperature: 30,
		humidity: 70,
		username: "msambwe_elite",
		password: "elite2025",
		color: "bg-purple-500",
		expectedHarvestDate: "2025-03-01",
		currentWeight: 0.8,
		feedConversionRatio: 1.4,
		vaccinations: 1,
		lastHealthCheck: "2025-01-21",
		notes: "Large-scale elite batch with premium genetics",
	},
]

const approvedBatches: DemoBatch[] = []
const candidates: Candidate[] = []

export function getAllBatches(): DemoBatch[] {
	return [...baseBatches, ...approvedBatches]
}

export function listCandidates(): Candidate[] {
	return candidates
}

export function addCandidate(input: Omit<Candidate, "id" | "status" | "createdAt">): Candidate {
	const c: Candidate = {
		id: `C${String(candidates.length + 1).padStart(3, "0")}`,
		status: "Pending",
		createdAt: new Date().toISOString(),
		...input,
	}
	candidates.push(c)
	return c
}

export function approveCandidate(candidateId: string): { approved?: DemoBatch; candidate?: Candidate } {
	const idx = candidates.findIndex((c) => c.id === candidateId)
	if (idx === -1) return {}
	const c = candidates[idx]
	c.status = "Approved"
	// Promote to batch
	const newBatchId = `B${String(getAllBatches().length + 1).padStart(3, "0")}`
	const approved: DemoBatch = {
		id: newBatchId,
		name: c.batchName,
		farmerId: "F-PENDING",
		farmerName: c.contactName,
		startDate: new Date().toISOString().split("T")[0],
		birdCount: 0,
		age: 0,
		status: "Planning",
		mortality: 0,
		feedUsed: 0,
		healthStatus: "Good",
		temperature: 30,
		humidity: 65,
		username: c.username,
		password: c.password,
		color: "bg-indigo-500",
		expectedHarvestDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
		currentWeight: 0,
		feedConversionRatio: 1.5,
		vaccinations: 0,
		lastHealthCheck: new Date().toISOString().split("T")[0],
	}
	approvedBatches.push(approved)
	return { approved, candidate: c }
}

export function denyCandidate(candidateId: string): Candidate | undefined {
	const idx = candidates.findIndex((c) => c.id === candidateId)
	if (idx === -1) return undefined
	candidates[idx].status = "Denied"
	return candidates[idx]
}

export function updateBatch(input: Partial<DemoBatch> & { id: string }): DemoBatch | null {
	const updateIn = (arr: DemoBatch[]) => {
		const i = arr.findIndex((b) => b.id === input.id)
		if (i !== -1) {
			arr[i] = { ...arr[i], ...input }
			return arr[i]
		}
		return null
	}
	return updateIn(baseBatches) || updateIn(approvedBatches)
} 