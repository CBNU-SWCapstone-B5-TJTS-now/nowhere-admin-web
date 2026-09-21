import { useState } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuth } from '../context/AuthContext'

export function SettingsPage() {
  const { admin, signOut } = useAuth()
  const [notifyReports, setNotifyReports] = useState(true)
  const [notifyProposals, setNotifyProposals] = useState(true)
  const [saved, setSaved] = useState(false)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.nowhere-app.cloud'

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppShell title="설정" subtitle="관리자 계정과 알림, 연동 정보를 확인하세요">
      <div className="grid grid-cols-2 gap-5 items-start">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <span className="text-[14.5px] font-bold text-slate-900">관리자 계정</span>
          <div className="flex flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-700 flex items-center justify-center text-[13px] font-bold text-white">
              {admin?.name ? admin.name.slice(0, 2) : '관리'}
            </div>
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold text-slate-900">{admin?.name ?? '관리자'}</span>
              <span className="text-[12px] text-slate-400">{admin?.email ?? '-'}</span>
            </div>
          </div>
          <span className="text-[11.5px] text-slate-400">
            계정 정보 수정은 백엔드 인증 API 연동 후 지원될 예정이에요.
          </span>
          <button onClick={signOut} className="self-start text-[12.5px] font-bold text-red-500 hover:underline">
            로그아웃
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <span className="text-[14.5px] font-bold text-slate-900">API 연동 정보</span>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-semibold text-slate-500">서버 주소 (VITE_API_BASE_URL)</span>
            <span className="text-[13px] font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
              {apiBaseUrl}
            </span>
          </div>
          <span className="text-[11.5px] text-slate-400">
            변경하려면 프로젝트의 .env 파일에서 VITE_API_BASE_URL 값을 수정한 뒤 다시 빌드/배포하세요.
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 col-span-2">
          <span className="text-[14.5px] font-bold text-slate-900">알림 설정</span>
          <label className="flex flex-row items-center justify-between py-2 border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-800">새 제보 알림</span>
              <span className="text-[11.5px] text-slate-400">혼잡 제보가 접수되면 알림을 받아요.</span>
            </div>
            <input
              type="checkbox"
              checked={notifyReports}
              onChange={(e) => setNotifyReports(e.target.checked)}
              className="w-4 h-4 accent-blue-700"
            />
          </label>
          <label className="flex flex-row items-center justify-between py-2">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-800">장소 제안 알림</span>
              <span className="text-[11.5px] text-slate-400">새 장소 제안이 등록되면 알림을 받아요.</span>
            </div>
            <input
              type="checkbox"
              checked={notifyProposals}
              onChange={(e) => setNotifyProposals(e.target.checked)}
              className="w-4 h-4 accent-blue-700"
            />
          </label>
          <div className="flex flex-row items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[12.5px] font-bold"
            >
              저장
            </button>
            {saved && <span className="text-[12px] font-semibold text-green-600">저장됐어요.</span>}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
