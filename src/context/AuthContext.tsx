import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AdminUser } from '../types'
import { getStoredToken } from '../api/client'
import * as adminApi from '../api/adminApi'

interface AuthContextValue {
  admin: AdminUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ADMIN_STORAGE_KEY = 'nowhere_admin_profile'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 저장된 토큰이 없는데 관리자 정보만 남아있는 경우를 정리합니다.
    if (!getStoredToken() && admin) {
      setAdmin(null)
      localStorage.removeItem(ADMIN_STORAGE_KEY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signIn(email: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.login(email, password)
      setAdmin(res.admin)
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(res.admin))
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않아요. 다시 확인해주세요.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  function signOut() {
    adminApi.logout()
    setAdmin(null)
    localStorage.removeItem(ADMIN_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, loading, error, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있어요.')
  return ctx
}
