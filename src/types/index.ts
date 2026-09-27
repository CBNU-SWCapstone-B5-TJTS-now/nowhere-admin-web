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
  // 모바일 앱에서 실제로 전송된 제안에만 존재하는 값들 (데모용 고정 데이터에는 없음)
  description?: string
  latitude?: number | null
  longitude?: number | null
  createdAt?: string
}

export interface RecentReport {
  id: string
  locationName: string
  reporterId: string
  level: CongestionLevel
  reportedAt: string
  status: 'ACTIVE' | 'EXPIRED'
}
