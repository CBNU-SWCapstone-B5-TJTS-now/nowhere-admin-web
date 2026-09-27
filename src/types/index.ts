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

// "최근 제보 내역"은 실제 백엔드 /api/locations의 장소별 현재 혼잡도 스냅샷을
// 그대로 가져온 것입니다. 제보자 식별자는 개인정보 보호를 싄면이 애초에 받지 않으므로
// 이 타입에도 포함하지 않습니다.
export interface RecentReport {
  id: string
  locationName: string
  level: CongestionLevel
  reportedAt: string
  status: 'ACTIVE' | 'EXPIRED'
}
