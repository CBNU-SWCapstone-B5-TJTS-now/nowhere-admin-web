import axios from 'axios'

// 배포된 백엔드 주소. .env 파일에서 VITE_API_BASE_URL로 덮어쓸 수 있어요.
// (frontend 앱과 동일하게 https://api.nowhere-app.cloud 를 기본값으로 사용합니다.)
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.nowhere-app.cloud'

export const apiClient = axios.create({
  baseURL,
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

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
