export type CongestionLevel = 'RELAXED' | 'NORMAL' | 'CROWDED' | 'UNKNOWN'

export interface AdminUser {
  name: string
  email: string
}

export interface LoginResponse {
  token: string
  admin: AdminUser
}

export interface LocationStatus {
  id: string
  name: string
  category: string
  level: CongestionLevel
  occupancyPercent: number
  updatedAgoMinutes: number
}

export interface DashboardSummary {
  totalLocations: number
  crowdedLocations: number
  reportsToday: number
  pendingProposals: number
}

export interface HourlyTrendPoint {
  hour: number
  occupancyPercent: number
}

export interface LocationProposal {
  id: string
  placeName: string
  category: string
  proposedBy: string
  proposedAgo: string
}

export interface RecentReport {
  id: string
  locationName: string
  reporterId: string
  level: CongestionLevel
  reportedAt: string
  status: 'ACTIVE' | 'EXPIRED'
}
