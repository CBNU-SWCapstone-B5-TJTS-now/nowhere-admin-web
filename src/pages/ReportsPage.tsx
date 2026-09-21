import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { TrendChart } from '../components/TrendChart'
import { ReportsTable } from '../components/ReportsTable'
import * as adminApi from '../api/adminApi'
import type { HourlyTrendPoint, RecentReport, LocationStatus } from '../types'

export function ReportsPage() {
  const [trend, setTrend] = useState<HourlyTrendPoint[]>([])
  const [reports, setReports] = useState<RecentReport[]>([])
  const [locations, setLocations] = useState<LocationStatus[]>([])
  const [selectedLocation, setSelectedLocation] = useState('전체')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([adminApi.getHourlyTrend(), adminApi.getRecentReports(), adminApi.getLocationStatuses()]).then(
      ([trendRes, reportsRes, locationsRes]) => {
        if (cancelled) return
        setTrend(trendRes)
        setReports(reportsRes)
        setLocations(locationsRes)
        setLoading(false)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selectedLocation === '전체') return
    let cancelled = false
    adminApi.getHourlyTrend(selectedLocation).then((res) => {
      if (!cancelled) setTrend(res)
    })
    return () => {
      cancelled = true
    }
  }, [selectedLocation])

  const totalReports = reports.length
  const crowdedReports = reports.filter((r) => r.level === 'CROWDED').length
  const activeReports = reports.filter((r) => r.status === 'ACTIVE').length

  return (
    <AppShell title="통계 리포트" subtitle="시간대별 혼잡도 추이와 제보 데이터를 확인하세요">
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

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-row items-center justify-end">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="text-[12.5px] border border-slate-200 rounded-md px-2.5 py-1.5 outline-none text-slate-600 bg-white"
              >
                <option value="전체">전체 장소</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <TrendChart
              data={trend}
              locationName={locations.find((l) => l.id === selectedLocation)?.name ?? '전체'}
            />
          </div>

          <ReportsTable reports={reports} />
        </>
      )}
    </AppShell>
  )
}
