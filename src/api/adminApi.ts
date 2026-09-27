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
// "최근 제보 내역"은 별도의 관리자 전용 엔드포인트 없이, 실제 백엔드가 이미 내려주는
// /api/locations의 장소별 현재 혼잡도 스냅샷(congestionLevel, congestionUpdatedAt)을
// 그대로 가져와서 최신순으로 정렬한 목록입니다. 개인정보(제보자 식별자 등)는 애초에
// 받지 않으므로 화면에도 표시하지 않습니다. 다만 이건 "장소별 가장 최근 상태" 한 줄일
// 뿐, 하루 동안 들어온 모든 제보 하나하나의 이력은 아닙니다 — 그건 백엔드에 별도 조회
// 엔드포인트가 있어야 가능합니다.
//
// 로컬 `npm run dev`(순수 Vite)에서는 Serverless Functions가 안 떠 있어서 localApiClient
// 호출이 실패하는데, 그러면 아래 mock 데이터로 자동 대체돼요.
//
// 응답하는 걸 보고 싶으면 `vercel dev`로 실행하세요.
// (햸솔에 [adminApi] ... mock 데이터로 대체 로그가 남으면 이 경로예요.)

import { apiClient, localApiClient, setStoredToken, clearStoredToken } from './client'
import { demoAdminCredentials } from './config'
import type {
  DashboardSummary,
  LocationStatus,
  LocationProposal,
  RecentReport,
  LoginResponse,
  CongestionLevel,
} from '../types'
import { mockLocations, mockProposals } from './mockData'
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

// 실제 백엔드가 내려주는 congestionLevel 원본 값은 'LOW' | 'MEDIUM' | 'HIGH'예요
// (2026-09-27 실제 응답으로 확인: 예) "congestionLevel":"HIGH").
// 화면(뱃지, 필터 등)은 'RELAXED' | 'NORMAL' | 'CROWDED'라는 우리 자체 표기를 쓰므로
// 여기서 한 번 변환해줍니다. 백엔드가 다른 값을 내려주면(예상 밖 값) 매핑에 없으니
// 안전하게 'UNKNOWN'으로 떨어집니다.
const BACKEND_LEVEL_MAP: Record<string, CongestionLevel> = {
  LOW: 'RELAXED',
  MEDIUM: 'NORMAL',
  HIGH: 'CROWDED',
}

function toAppLevel(rawLevel: string | null): CongestionLevel {
  if (!rawLevel) return 'UNKNOWN'
  return BACKEND_LEVEL_MAP[rawLevel] ?? 'UNKNOWN'
}

// 백엔드가 congestionUpdatedAt을 타임존 표시 없이(하지만 실제로는 UTC 기준으로) 내려줘요.
// 예) "2026-09-27T08:40:52.231713197" — 끝에 'Z'나 '+09:00' 같은 표시가 없어요.
// 그런데 자바스크립트의 new Date(...)는 타임존 표시가 없는 날짜/시간 문자열을
// "로컬 시간(브라우저 기준, 한국이면 KST)"으로 해석해버려서(ECMA-262 스펙),
// 실제로는 UTC 08:40인데 한국시간 08:40으로 잘못 해석 -> 실제 시각보다 9시간 늦게
// 계산되는 버그가 있었습니다(2026-09-27 실사용 중 발견). 타임존 표시가 없으면
// 'Z'를 붙여서 이 값이 UTC라는 걸 명시적으로 알려줍니다.
function parseBackendTimestamp(raw: string): Date {
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(raw)
  return new Date(hasTimezone ? raw : `${raw}Z`)
}

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
  const level = toAppLevel(raw.congestionLevel)

  // congestionUpdatedAt이 없으면(아직 업데이트 이력 없음) -1을 넣어서
  // 화면에서 "업데이트 기록 없음"으로 구분해서 보여줘요.
  const updatedAgoMinutes = raw.congestionUpdatedAt
    ? Math.max(0, Math.round((Date.now() - parseBackendTimestamp(raw.congestionUpdatedAt).getTime()) / 60000))
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

// 대시보드 요약 통계는 별도 API를 부르지 않고, 실제 백엔드 데이터(장소 목록 + 최근 제보)와
// admin-web 자체 mock 서버(제안)를 조합해서 만들어요.
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

// "최근 제보 내역" — 별도의 관리자 전용 백엔드 엔드포인트 없이, 실제 백엔드의
// /api/locations 스냅샷(장소별 현재 혼잡도 + 마지막 업데이트 시각)만으로 만든 목록입니다.
// 제보자 식별자는 애초에 받지 않으므로 포함하지 않습니다.
export function getRecentReports(): Promise<RecentReport[]> {
  return withRealBackend('GET /api/locations (최근 제보용)', async () => {
    const { data } = await apiClient.get<RawLocation[]>('/api/locations')

    const withActiveReport = data.filter(
      (loc): loc is RawLocation & { congestionLevel: string; congestionUpdatedAt: string } =>
        !!loc.congestionLevel && !!loc.congestionUpdatedAt && toAppLevel(loc.congestionLevel) !== 'UNKNOWN'
    )

    withActiveReport.sort((a, b) => b.congestionUpdatedAt.localeCompare(a.congestionUpdatedAt))

    return withActiveReport.map((loc) => ({
      id: String(loc.id),
      locationName: loc.name,
      level: toAppLevel(loc.congestionLevel),
      reportedAt: parseBackendTimestamp(loc.congestionUpdatedAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'ACTIVE',
    }))
  }, [])
}

// ⚠️ 장소 제안(새 장소 등록 요청)은 아직 실제 백엔드에는 없어서, 이 admin-web 레포
// 자체의 서버리스 함수(Vercel Serverless Functions)를 그대로 써요. 모바일 앱이 직접
// 이 함수로 제안을 전송하기 때문에, 여기서 보이는 값은 (mock이 아니라) 실제 사용자가
// 제출한 제안입니다. 다만 서버리스 함수가 인메모리 저장소를 쓰기 때문에, 함수 인스턴스가
// 재시작(콜드스타트)되면 목록이 초기화될 수 있습니다.
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
