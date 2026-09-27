// 백엔드에 관리자용 엔드포인트가 아직 없을 때 화면을 확인할 수 있도록 하는 샘플 데이터입니다.
// adminApi.ts 의 각 함수는 실제 API 호출이 실패하면 이 데이터로 자동 대체됩니다.
import type { DashboardSummary, LocationStatus, LocationProposal } from '../types'

export const mockSummary: DashboardSummary = {
  totalLocations: 24,
  crowdedLocations: 2,
  reportsToday: 187,
  pendingProposals: 3,
}

export const mockLocations: LocationStatus[] = [
  { id: 'l1', name: '학생회관 학식당', category: '식음료', level: 'CROWDED', occupancyPercent: 92, updatedAgoMinutes: 2 },
  { id: 'l2', name: '중앙도서관 열람실', category: '학습공간', level: 'CROWDED', occupancyPercent: 88, updatedAgoMinutes: 3 },
  { id: 'l3', name: '중앙도서관 1층 라운지', category: '휴게공간', level: 'NORMAL', occupancyPercent: 61, updatedAgoMinutes: 5 },
  { id: 'l4', name: '체육관 헬스장', category: '운동시설', level: 'NORMAL', occupancyPercent: 55, updatedAgoMinutes: 4 },
  { id: 'l5', name: '공학관 스터디카페', category: '학습공간', level: 'RELAXED', occupancyPercent: 24, updatedAgoMinutes: 1 },
  { id: 'l6', name: '학생회관 편의점 앞', category: '휴게공간', level: 'RELAXED', occupancyPercent: 15, updatedAgoMinutes: 8 },
]

export const mockProposals: LocationProposal[] = [
  { id: 'p1', placeName: '인문대 옥상 정원', category: '휴게공간', proposedBy: '익명의 다람쥐', proposedAgo: '3시간 전' },
  { id: 'p2', placeName: '농생대 온실 앞 벤치', category: '휴게공간', proposedBy: '새싹지킴이', proposedAgo: '어제' },
  { id: 'p3', placeName: '예술대 연습실 복도', category: '학습공간', proposedBy: '피아노건반', proposedAgo: '2일 전' },
]
