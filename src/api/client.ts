import axios from 'axios'

// 배포된 실제 백엔드(Spring Boot) 주소. .env 파일에서 VITE_API_BASE_URL로 덮어쓸 수 있어요.
// /api/locations 처럼 이미 백엔드에 구현된 엔드포인트는 이 클라이언트로 호출해요.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.nowhere-app.cloud'

export const apiClient = axios.create({
  baseURL,
  timeout: 8000,
})

// /api/admin/... 처럼 실제 백엔드에 아직 없는 "관리자 전용" 엔드포인트는 이 admin-web
// 레포 안의 Vercel Serverless Functions(같은 도메인의 /api/admin/...)로 호출해요.
// baseURL을 비워두면 axios가 현재 페이지와 같은 origin으로 요청을 보내요.
// (배포되지 않은 로컬 `npm run dev`에서는 이 함수들이 안 떠 있어서 실패하고,
// adminApi.ts의 mock fallback으로 자동 대체돼요. `vercel dev`로 실행하면
// 로컬에서도 이 함수들이 같이 떠서 실제로 응답을 받을 수 있어요.)
export const localApiClient = axios.create({
  baseURL: '',
  timeout: 8000,
})

const TOKEN_KEY = 'nowhere_admin_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function attachAuthHeader(client: typeof apiClient) {
  client.interceptors.request.use((config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
}

attachAuthHeader(apiClient)
attachAuthHeader(localApiClient)
