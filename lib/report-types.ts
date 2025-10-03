export interface ReportField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'boolean'
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface ReportType {
  id: string
  name: string
  description: string
  icon: string
  color: string
  fields: ReportField[]
  priority: 'Low' | 'Normal' | 'High' | 'Critical'
}

export const REPORT_TYPES: ReportType[] = [
  {
    id: 'daily',
    name: 'Daily Report',
    description: 'Daily batch monitoring and health check',
    icon: '📊',
    color: 'blue',
    priority: 'Normal',
    fields: [
      { id: 'bird_count', label: 'Current Bird Count', type: 'number', required: true, validation: { min: 0 } },
      { id: 'mortality_count', label: 'Mortality Count', type: 'number', required: true, validation: { min: 0 } },
      { id: 'feed_consumed', label: 'Feed Consumed (kg)', type: 'number', required: true, validation: { min: 0 } },
      { id: 'water_consumed', label: 'Water Consumed (liters)', type: 'number', required: true, validation: { min: 0 } },
      { id: 'average_weight', label: 'Average Weight per Bird (kg)', type: 'number', required: false, validation: { min: 0 } },
      { id: 'current_weight', label: 'Current Weight (kg)', type: 'number', required: false, validation: { min: 0 } },
      { id: 'vaccination_count', label: 'Vaccinations Given', type: 'number', required: false, validation: { min: 0 } },
      { id: 'temperature', label: 'Temperature (°C)', type: 'number', required: true, validation: { min: 20, max: 40 } },
      { id: 'humidity', label: 'Humidity (%)', type: 'number', required: true, validation: { min: 30, max: 80 } },
      { id: 'health_status', label: 'Overall Health Status', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: 'behavior_notes', label: 'Behavior Observations', type: 'textarea', required: false, placeholder: 'Any unusual behavior or observations...' },
      { id: 'weather_conditions', label: 'Weather Conditions', type: 'select', required: false, options: ['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Stormy'] }
    ]
  },
  {
    id: 'mortality',
    name: 'Mortality Report',
    description: 'Report bird deaths and health issues',
    icon: '💀',
    color: 'red',
    priority: 'High',
    fields: [
      { id: 'death_count', label: 'Number of Deaths', type: 'number', required: true, validation: { min: 1 } },
      { id: 'age_at_death', label: 'Age at Death (days)', type: 'number', required: true, validation: { min: 0 } },
      { id: 'cause_of_death', label: 'Suspected Cause', type: 'select', required: true, options: ['Disease', 'Injury', 'Heat Stress', 'Cold Stress', 'Predation', 'Unknown', 'Other'] },
      { id: 'symptoms', label: 'Observed Symptoms', type: 'textarea', required: false, placeholder: 'Describe any symptoms observed before death...' },
      { id: 'location', label: 'Location in Coop', type: 'select', required: false, options: ['Near Feeders', 'Near Water', 'Corner', 'Center', 'Near Walls', 'Other'] },
      { id: 'veterinary_consulted', label: 'Veterinary Consulted', type: 'boolean', required: false },
      { id: 'action_taken', label: 'Action Taken', type: 'textarea', required: false, placeholder: 'What actions were taken to address the issue...' }
    ]
  },
  {
    id: 'health',
    name: 'Health Check Report',
    description: 'Detailed health assessment and veterinary findings',
    icon: '🏥',
    color: 'green',
    priority: 'High',
    fields: [
      { id: 'check_type', label: 'Type of Check', type: 'select', required: true, options: ['Routine', 'Sick Bird', 'Post-Treatment', 'Pre-Vaccination', 'Post-Vaccination'] },
      { id: 'birds_checked', label: 'Number of Birds Checked', type: 'number', required: true, validation: { min: 1 } },
      { id: 'overall_health', label: 'Overall Health Status', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'] },
      { id: 'weight_avg', label: 'Average Weight (g)', type: 'number', required: false, validation: { min: 0 } },
      { id: 'vaccination_status', label: 'Vaccination Status', type: 'select', required: false, options: ['Up to Date', 'Overdue', 'Not Applicable'] },
      { id: 'medication_given', label: 'Medication Given', type: 'textarea', required: false, placeholder: 'List any medications administered...' },
      { id: 'veterinary_notes', label: 'Veterinary Notes', type: 'textarea', required: false, placeholder: 'Professional veterinary observations...' },
      { id: 'follow_up_required', label: 'Follow-up Required', type: 'boolean', required: false },
      { id: 'next_check_date', label: 'Next Check Date', type: 'date', required: false }
    ]
  },
  {
    id: 'feed',
    name: 'Feed Report',
    description: 'Feed consumption and quality assessment',
    icon: '🌾',
    color: 'yellow',
    priority: 'Normal',
    fields: [
      { id: 'feed_type', label: 'Feed Type', type: 'select', required: true, options: ['Starter', 'Grower', 'Finisher', 'Layer', 'Custom'] },
      { id: 'quantity_used', label: 'Quantity Used (kg)', type: 'number', required: true, validation: { min: 0 } },
      { id: 'feed_quality', label: 'Feed Quality', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: 'storage_conditions', label: 'Storage Conditions', type: 'select', required: false, options: ['Dry', 'Slightly Moist', 'Wet', 'Contaminated'] },
      { id: 'waste_amount', label: 'Feed Waste (kg)', type: 'number', required: false, validation: { min: 0 } },
      { id: 'feed_conversion_ratio', label: 'Feed Conversion Ratio', type: 'number', required: false, validation: { min: 0 } },
      { id: 'supplier', label: 'Feed Supplier', type: 'text', required: false, placeholder: 'Name of feed supplier...' },
      { id: 'batch_number', label: 'Feed Batch Number', type: 'text', required: false, placeholder: 'Batch or lot number...' },
      { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Any observations about feed quality or consumption...' }
    ]
  },
  {
    id: 'vaccination',
    name: 'Vaccination Report',
    description: 'Vaccination records and health monitoring',
    icon: '💉',
    color: 'purple',
    priority: 'High',
    fields: [
      { id: 'vaccine_name', label: 'Vaccine Name', type: 'text', required: true, placeholder: 'Name of the vaccine administered...' },
      { id: 'vaccination_count', label: 'Number of Birds Vaccinated', type: 'number', required: true, validation: { min: 1 } },
      { id: 'vaccine_type', label: 'Vaccine Type', type: 'select', required: true, options: ['Live', 'Killed', 'Recombinant', 'DNA', 'Other'] },
      { id: 'administration_method', label: 'Administration Method', type: 'select', required: true, options: ['Injection', 'Drinking Water', 'Spray', 'Eye Drop', 'Nasal Drop', 'Other'] },
      { id: 'vaccination_date', label: 'Vaccination Date', type: 'date', required: true },
      { id: 'batch_number', label: 'Vaccine Batch Number', type: 'text', required: false, placeholder: 'Vaccine batch or lot number...' },
      { id: 'expiry_date', label: 'Vaccine Expiry Date', type: 'date', required: false },
      { id: 'veterinarian', label: 'Veterinarian/Administered By', type: 'text', required: false, placeholder: 'Name of person who administered...' },
      { id: 'side_effects', label: 'Side Effects Observed', type: 'textarea', required: false, placeholder: 'Any side effects or reactions observed...' },
      { id: 'next_vaccination', label: 'Next Vaccination Date', type: 'date', required: false },
      { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Any additional observations or notes...' }
    ]
  },
  {
    id: 'equipment',
    name: 'Equipment Report',
    description: 'Equipment status and maintenance issues',
    icon: '🔧',
    color: 'purple',
    priority: 'Normal',
    fields: [
      { id: 'equipment_type', label: 'Equipment Type', type: 'select', required: true, options: ['Feeder', 'Waterer', 'Heater', 'Fan', 'Lighting', 'Ventilation', 'Other'] },
      { id: 'equipment_id', label: 'Equipment ID/Name', type: 'text', required: true, placeholder: 'Equipment identifier...' },
      { id: 'status', label: 'Current Status', type: 'select', required: true, options: ['Working', 'Malfunctioning', 'Broken', 'Under Maintenance', 'Replaced'] },
      { id: 'issue_description', label: 'Issue Description', type: 'textarea', required: false, placeholder: 'Describe the problem or issue...' },
      { id: 'maintenance_required', label: 'Maintenance Required', type: 'boolean', required: false },
      { id: 'urgency', label: 'Urgency Level', type: 'select', required: false, options: ['Low', 'Medium', 'High', 'Critical'] },
      { id: 'estimated_cost', label: 'Estimated Repair Cost', type: 'number', required: false, validation: { min: 0 } },
      { id: 'action_taken', label: 'Action Taken', type: 'textarea', required: false, placeholder: 'What was done to address the issue...' }
    ]
  },
  {
    id: 'environment',
    name: 'Environment Report',
    description: 'Environmental conditions and facility status',
    icon: '🌡️',
    color: 'cyan',
    priority: 'Normal',
    fields: [
      { id: 'temperature_avg', label: 'Average Temperature (°C)', type: 'number', required: true, validation: { min: 15, max: 45 } },
      { id: 'humidity_avg', label: 'Average Humidity (%)', type: 'number', required: true, validation: { min: 20, max: 90 } },
      { id: 'ventilation_status', label: 'Ventilation Status', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: 'lighting_hours', label: 'Lighting Hours', type: 'number', required: false, validation: { min: 0, max: 24 } },
      { id: 'noise_level', label: 'Noise Level', type: 'select', required: false, options: ['Quiet', 'Normal', 'Loud', 'Very Loud'] },
      { id: 'cleanliness', label: 'Facility Cleanliness', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { id: 'weather_impact', label: 'Weather Impact', type: 'select', required: false, options: ['None', 'Minimal', 'Moderate', 'Significant'] },
      { id: 'environmental_issues', label: 'Environmental Issues', type: 'textarea', required: false, placeholder: 'Any environmental concerns or issues...' }
    ]
  },
  {
    id: 'emergency',
    name: 'Emergency Report',
    description: 'Urgent issues requiring immediate attention',
    icon: '🚨',
    color: 'red',
    priority: 'Critical',
    fields: [
      { id: 'emergency_type', label: 'Emergency Type', type: 'select', required: true, options: ['Disease Outbreak', 'Equipment Failure', 'Power Outage', 'Weather Emergency', 'Predator Attack', 'Fire', 'Flood', 'Other'] },
      { id: 'severity', label: 'Severity Level', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'] },
      { id: 'birds_affected', label: 'Number of Birds Affected', type: 'number', required: true, validation: { min: 0 } },
      { id: 'description', label: 'Emergency Description', type: 'textarea', required: true, placeholder: 'Detailed description of the emergency...' },
      { id: 'immediate_action', label: 'Immediate Action Taken', type: 'textarea', required: true, placeholder: 'What immediate actions were taken...' },
      { id: 'authorities_contacted', label: 'Authorities Contacted', type: 'boolean', required: false },
      { id: 'veterinary_contacted', label: 'Veterinary Contacted', type: 'boolean', required: false },
      { id: 'estimated_loss', label: 'Estimated Loss', type: 'number', required: false, validation: { min: 0 } },
      { id: 'follow_up_required', label: 'Follow-up Required', type: 'boolean', required: false }
    ]
  }
]

export const getReportTypeById = (id: string): ReportType | undefined => {
  return REPORT_TYPES.find(type => type.id === id)
}

export const getReportTypeColor = (typeId: string): string => {
  const reportType = getReportTypeById(typeId)
  return reportType?.color || 'gray'
}

export const getReportTypeIcon = (typeId: string): string => {
  const reportType = getReportTypeById(typeId)
  return reportType?.icon || '📄'
}
