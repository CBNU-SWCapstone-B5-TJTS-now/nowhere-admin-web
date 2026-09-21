// 이 파일은 관리자 대시보드가 필요로 하는 API 호출을 한 곳에 모아둔 서비스 레이어입니다.
//
// ⚠️ 아래 엔드포인트 경로(/api/admin/...)는 아직 백엔드에 존재하지 않을 수 있는
// "가정된" 경로입니다. 실제 명세가 정해지면 이 파일만 고치면 되도록
// 화면 컴포넌트에서는 이 파일의 함수만 호출하게 되어 있어요.
//
// 아직 백엔드 엔드포인트가 준비되지 않았거나 호출이 실패하면 mockData.ts의
// 샘플 데이터로 자동 대체되어, 화면 작업은 백엔드와 상관없이 계속 진행할 수 있습니다.
// (콘솔에 [adminApi] ... mock 데이터로 대체 로그가 남습니다.)

import { apiClient, setStoredToken, clearStoredToken } from './client'
import { demoAdminCredentials } from './config'
import type {
  DashboardSummary,
  LocationStatus,
  HourlyTrendPoint,
  LocationProposal,
  RecentReport,
  LoginResponse,
} from '../types'
import {
  mockSummary,
  mockLocations,
  mockHourlyTrend,
  mockProposals,
  mockRecentReports,
} from './mockData'

async function withMockFallback<T>(label: string, real: () => Promise<T>, mock: T): Promise<T> {
  try {
    return await real()
  } catch (err) {
    console.warn(`[adminApi] ${label} 호출 실패 — mock 데이터로 대체합니다.`, err)
    return mock
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>('/api/admin/auth/login', { email, password })
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

export function getSummary(): Promise<DashboardSummary> {
  return withMockFallback('GET /api/admin/stats/summary', async () => {
    const { data } = await apiClient.get<DashboardSummary>('/api/admin/stats/summary')
    return data
  }, mockSummary)
}

export function getLocationStatuses(): Promise<LocationStatus[]> {
  return withMockFallback('GET /api/locations', async () => {
    const { data } = await apiClient.get<LocationStatus[]>('/api/locations')
    return data
  }, mockLocations)
}

export function getHourlyTrend(locationId?: string): Promise<HourlyTrendPoint[]> {
  return withMockFallback('GET /api/admin/stats/hourly', async () => {
    const { data } = await apiClient.get<HourlyTrendPoint[]>('/api/admin/stats/hourly', {
      params: locationId ? { locationId } : undefined,
    })
    return data
  }, mockHourlyTrend)
}

export function getPendingProposals(): Promise<LocationProposal[]> {
  return withMockFallback('GET /api/admin/proposals?status=pending', async () => {
    const { data } = await apiClient.get<LocationProposal[]>('/api/admin/proposals', {
      params: { status: 'pending' },
    })
    return data
  }, mockProposals)
}

export async function approveProposal(id: string): Promise<void> {
  await apiClient.post(`/api/admin/proposals/${id}/approve`)
}

export async function rejectProposal(id: string): Promise<void> {
  await apiClient.post(`/api/admin/proposals/${id}/reject`)
}

export function getRecentReports(): Promise<RecentReport[]> {
  return withMockFallback('GET /api/admin/reports/recent', async () => {
    const { data } = await apiClient.get<RecentReport[]>('/api/admin/reports/recent', {
      params: { limit: 20 },
    })
    return data
  }, mockRecentReports)
}
