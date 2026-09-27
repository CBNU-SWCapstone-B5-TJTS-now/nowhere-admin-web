import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { ReportsTable } from '../components/ReportsTable'
import * as adminApi from '../api/adminApi'
import type { RecentReport } from '../types'

export function ReportsPage() {
  const [reports, setReports] = useState<RecentReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    adminApi.getRecentReports().then((reportsRes) => {
      if (cancelled) return
      setReports(reportsRes)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const totalReports = reports.length
  const crowdedReports = reports.filter((r) => r.level === 'CROWDED').length
  const activeReports = reports.filter((r) => r.status === 'ACTIVE').length

  return (
    <AppShell title="통계 리포트" subtitle="최근 제보 데이터를 확인하세요">
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">불러오는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4.5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-slate-500">오늘 누적 제보</span>
              <span className="text-[24px] font-extrabold text-slate-900">{totalReports}건</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-slate-500">혼잡 제보 비율</span>
              <span className="text-[24px] font-extrabold text-red-600">
                {totalReports ? Math.round((crowdedReports / totalReports) * 100) : 0}%
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-slate-500">유효(만료 전) 제보</span>
              <span className="text-[24px] font-extrabold text-green-600">{activeReports}건</span>
            </div>
          </div>

          <ReportsTable reports={reports} />
        </>
      )}
    </AppShell>
  )
}
