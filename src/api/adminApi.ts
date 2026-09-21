// 이 파일은 관리자 대시보드가 필요로 하는 API 호출을 한 곳에 모아둔 서비스 레이어입니다.
//
// - /api/locations 처럼 실제 백엔드(Spring Boot, api.nowhere-app.cloud)에 이미 구현된
//   엔드포인트는 apiClient로 호출해요.
// - /api/admin/... 처럼 실제 백엔드에는 아직 없는 "관리자 전용" 엔드포인트는 localApiClient로
//   호출해요. 이건 실제 백엔드가 아니라 이 admin-web 레포 안의 /api 폴더에 있는 Vercel
//   Serverless Functions예요 (실제 백엔드 레포는 전혀 건드리지 않아요). 배포하면 같은
//   도메인에서 자동으로 떠요. 나중에 실제 백엔드팀이 이 엔드포인트들을 정식으로 만들면,
//   localApiClient를 apiClient로 바꿔주기만 하면 돼요.
//
// 로컬 `npm run dev`(순수 Vite)에서는 Serverless Functions가 안 떠 있어서 localApiClient
// 호출이 실패하는데, 그러면 아래 mock 데이터로 자동 대체돼요. 로컬에서도 실제로 함수가
// 응답하는 걸 보고 싶으면 `vercel dev`로 실행하세요.
// (콘솔에 [adminApi] ... mock 데이터로 대체 로그가 남으면 이 경로예요.)

import { apiClient, localApiClient, setStoredToken, clearStoredToken } from './client'
import { demoAdminCredentials } from './config'
import type {
  DashboardSummary,
  LocationStatus,
  HourlyTrendPoint,
  LocationProposal,
  RecentReport,
  LoginResponse,
  CongestionLevel,
} from '../types'
import {
  mockLocations,
  mockHourlyTrend,
  mockProposals,
  mockRecentReports,
} from './mockData'
import { markMocked, markReal } from './mockStatus'

// ---- /api/locations 실제 응답 어댑터 -----------------------------------
// 실제 백엔드 응답은 화면이 기대하는 모양과 달라요 (예: level이 아니라
// congestionLevel, occupancyPercent/updatedAgoMinutes 필드 자체가 없음,
// 아직 제보가 없는 장소는 congestionLevel이 null). 여기서 안전하게 변환합니다.
interface RawLocation {
  id: number | string
  name: string
  category: string
  congestionLevel: string | null
  congestionUpdatedAt: string | null
}

const KNOWN_LEVELS: CongestionLevel[] = ['RELAXED', 'NORMAL', 'CROWDED']

// 백엔드 카테고리 코드 -> 화면 표시용 한글 라벨. 여기 없는 값은 원본 그대로 보여줘요.
const CATEGORY_LABELS: Record<string, string> = {
  SCHOOL: '학교 시설',
}

// 백엔드가 아직 정밀 점유율(%)을 내려주지 않아서, 혼잡도 단계 기준으로 대략적인
// 값을 보여줘요. (정확한 수치가 아니라 화면 표시용 추정치입니다.)
const LEVEL_OCCUPANCY_ESTIMATE: Record<CongestionLevel, number> = {
  RELAXED: 20,
  NORMAL: 55,
  CROWDED: 85,
  UNKNOWN: 0,
}

function toLocationStatus(raw: RawLocation): LocationStatus {
  const level: CongestionLevel =
    raw.congestionLevel && KNOWN_LEVELS.includes(raw.congestionLevel as CongestionLevel)
      ? (raw.congestionLevel as CongestionLevel)
      : 'UNKNOWN'

  // congestionUpdatedAt이 없으면(아직 업데이트 이력 없음) -1을 넣어서
  // 화면에서 "업데이트 기록 없음"으로 구분해서 보여줘요.
  const updatedAgoMinutes = raw.congestionUpdatedAt
    ? Math.max(0, Math.round((Date.now() - new Date(raw.congestionUpdatedAt).getTime()) / 60000))
    : -1

  return {
    id: String(raw.id),
    name: raw.name,
    category: CATEGORY_LABELS[raw.category] ?? raw.category,
    level,
    occupancyPercent: LEVEL_OCCUPANCY_ESTIMATE[level],
    updatedAgoMinutes,
  }
}

// 실제 백엔드(Spring Boot) 호출용. 성공하면 "실제 연동됨"으로, 실패하면 mock으로 표시해요.
async function withRealBackend<T>(label: string, real: () => Promise<T>, mock: T): Promise<T> {
  try {
    const result = await real()
    markReal(label)
    return result
  } catch (err) {
    console.warn(`[adminApi] ${label} 호출 실패 — mock 데이터로 대체합니다.`, err)
    markMocked(label)
    return mock
  }
}

// 이 admin-web 레포 자체의 Vercel Serverless Functions(/api/admin/...) 호출용.
// 이건 실제 스프링 백엔드가 아니라서 응답이 성공하더라도 항상 "예시 데이터"로 표시해요.
// 그 함수 자체가 떠 있지 않은 로컬 `npm run dev` 환경 등에서는 정적 mock으로 한 번 더 대체돼요.
async function withLocalMock<T>(label: string, real: () => Promise<T>, mock: T): Promise<T> {
  markMocked(label)
  try {
    return await real()
  } catch (err) {
    console.warn(`[adminApi] ${label} 호출 실패 — 정적 mock 데이터로 대체합니다.`, err)
    return mock
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const { data } = await localApiClient.post<LoginResponse>('/api/admin/auth/login', { email, password })
    setStoredToken(data.token)
    return data
  } catch (err) {
    // 실제 인증 API가 준비되기 전까지 사용하는 마스터 계정입니다.
    // .env 의 VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD / VITE_ADMIN_NAME 으로 바꿀 수 있어요.
    if (email === demoAdminCredentials.email && password === demoAdminCredentials.password) {
      console.warn('[adminApi] /api/admin/auth/login 호출 실패 — 마스터 계정으로 대체합니다.', err)
      const fallback: LoginResponse = { token: 'demo-token', admin: { name: demoAdminCredentials.name, email } }
      setStoredToken(fallback.token)
      return fallback
    }
    throw err
  }
}

export function logout() {
  clearStoredToken()
}

// 대시보드 요약 통계는 더 이상 별도 API를 부르지 않고, 실제 백엔드 데이터(장소 목록)와
// 아직 로컬 mock인 항목들(제안/제보)을 조합해서 만들어요. 그래서 "전체 등록 장소"/"실시간
// 혼잡 장소"는 실제 서버 값과 항상 같아요.
export async function getSummary(): Promise<DashboardSummary> {
  const [locations, proposals, reports] = await Promise.all([
    getLocationStatuses(),
    getPendingProposals(),
    getRecentReports(),
  ])
  return {
    totalLocations: locations.length,
    crowdedLocations: locations.filter((l) => l.level === 'CROWDED').length,
    reportsToday: reports.length,
    pendingProposals: proposals.length,
  }
}

export function getLocationStatuses(): Promise<LocationStatus[]> {
  return withRealBackend('GET /api/locations', async () => {
    const { data } = await apiClient.get<RawLocation[]>('/api/locations')
    return data.map(toLocationStatus)
  }, mockLocations)
}

export function getHourlyTrend(locationId?: string): Promise<HourlyTrendPoint[]> {
  return withLocalMock('GET /api/admin/stats/hourly', async () => {
    const { data } = await localApiClient.get<HourlyTrendPoint[]>('/api/admin/stats/hourly', {
      params: locationId ? { locationId } : undefined,
    })
    return data
  }, mockHourlyTrend)
}

// ⚠️ 장소 제안(새 장소 등록 요청) 승인/반려는 요청에 따라 아직 실제 백엔드와 연결하지
// 않고, 이 admin-web 레포 자체의 mock 서버(Vercel Serverless Functions)를 그대로 써요.
export function getPendingProposals(): Promise<LocationProposal[]> {
  return withLocalMock('GET /api/admin/proposals?status=pending', async () => {
    const { data } = await localApiClient.get<LocationProposal[]>('/api/admin/proposals', {
      params: { status: 'pending' },
    })
    return data
  }, mockProposals)
}

export async function approveProposal(id: string): Promise<void> {
  await localApiClient.post(`/api/admin/proposals/${id}/approve`)
}

export async function rejectProposal(id: string): Promise<void> {
  await localApiClient.post(`/api/admin/proposals/${id}/reject`)
}

export function getRecentReports(): Promise<RecentReport[]> {
  return withLocalMock('GET /api/admin/reports/recent', async () => {
    const { data } = await localApiClient.get<RecentReport[]>('/api/admin/reports/recent', {
      params: { limit: 20 },
    })
    return data
  }, mockRecentReports)
}
