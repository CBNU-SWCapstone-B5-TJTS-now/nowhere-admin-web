import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoMark } from '../components/icons'
import { demoAdminCredentials } from '../api/config'

export function LoginPage() {
  const { signIn, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(demoAdminCredentials.email)
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(true)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await signIn(email, password)
      navigate('/')
    } catch {
      // 에러 메시지는 useAuth().error 로 표시됩니다.
    }
  }

  return (
    <div className="w-full h-screen flex flex-row bg-white">
      {/* 좌측 브랜드 패널 */}
      <div className="w-[480px] min-w-[480px] h-full bg-[#0b1730] flex flex-col justify-between p-12 relative overflow-hidden">
        <svg
          className="absolute -right-16 -bottom-16 opacity-50"
          width="360"
          height="360"
          viewBox="0 0 30 30"
          fill="none"
        >
          <path d="M4 9 L15 4 L26 9" stroke="#16233f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17 L15 12 L26 17" stroke="#16233f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 25 L15 20 L26 25" stroke="#16233f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="flex flex-row items-center gap-2.5">
          <LogoMark />
          <span className="text-[16px] font-extrabold text-white">지금어때 Admin</span>
        </div>

        <div className="flex flex-col gap-4 z-10">
          <span className="text-[30px] font-extrabold text-white leading-snug">
            Nowhere 관리자 페이지
          </span>
          <span className="text-[14px] text-[#92a6cc] leading-relaxed">
            충북대학교 하이퍼로컬 혼잡도 서비스
            <br />
            '지금어때' 운영 관리자 전용 콘솔입니다.
          </span>
        </div>

        <span className="text-[12px] text-[#5b6f96] z-10">© 2026 지금어때 (Nowhere) · 태정태새팀</span>
      </div>

      {/* 우측 로그인 폼 */}
      <div className="flex-1 h-full flex items-center justify-center bg-slate-50">
        <form onSubmit={handleSubmit} className="w-[360px] flex flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <span className="text-[22px] font-extrabold text-slate-900">관리자 로그인</span>
            <span className="text-[13px] text-slate-400">운영팀 계정으로 로그인해주세요.</span>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-slate-700">관리자 이메일</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border border-slate-300 rounded-lg px-3.5 text-[13.5px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-slate-700">비밀번호</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border border-slate-300 rounded-lg px-3.5 text-[13.5px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <div className="flex flex-row items-center justify-between pt-0.5">
              <label className="flex flex-row items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-700"
                />
                <span className="text-[12.5px] text-slate-500">로그인 상태 유지</span>
              </label>
              <a href="#" className="text-[12.5px] font-semibold text-blue-700 hover:underline">
                비밀번호 찾기
              </a>
            </div>
          </div>

          {error && <span className="text-[12.5px] font-medium text-red-600">{error}</span>}

          <button
            type="submit"
            disabled={loading}
            className="h-[46px] rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[14px] font-bold disabled:opacity-60"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="flex flex-row items-center gap-2.5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11.5px] text-slate-300">권한 안내</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <span className="text-[12px] text-slate-400 leading-relaxed">
            이 콘솔은 일반 사용자 계정과 분리된 관리자 전용 인증을 사용합니다. 계정 관련 문의는 운영팀에게
            연락해주세요.
          </span>
        </form>
      </div>
    </div>
  )
}
