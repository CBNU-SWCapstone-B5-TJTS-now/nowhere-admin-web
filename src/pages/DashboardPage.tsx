import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { KpiRow } from '../components/KpiRow'
import { CongestionList } from '../components/CongestionList'
import { TrendChart } from '../components/TrendChart'
import { ApprovalList } from '../components/ApprovalList'
import { ReportsTable } from '../components/ReportsTable'
import * as adminApi from '../api/adminApi'
import type {
  DashboardSummary,
  LocationStatus,
  HourlyTrendPoint,
  LocationProposal,
  RecentReport,
} from '../types'

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [locations, setLocations] = useState<LocationStatus[]>([])
  const [trend, setTrend] = useState<HourlyTrendPoint[]>([])
  const [proposals, setProposals] = useState<LocationProposal[]>([])
  const [reports, setReports] = useState<RecentReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const [summaryRes, locationsRes, trendRes, proposalsRes, reportsRes] = await Promise.all([
        adminApi.getSummary(),
        adminApi.getLocationStatuses(),
        adminApi.getHourlyTrend(),
        adminApi.getPendingProposals(),
        adminApi.getRecentReports(),
      ])
      if (cancelled) return
      setSummary(summaryRes)
      setLocations(locationsRes)
      setTrend(trendRes)
      setProposals(proposalsRes)
      setReports(reportsRes)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  function handleProposalChange(id: string) {
    setProposals((prev) => prev.filter((p) => p.id !== id))
    setSummary((prev) => (prev ? { ...prev, pendingProposals: Math.max(0, prev.pendingProposals - 1) } : prev))
  }

  const busiestLocation = [...locations].sort((a, b) => b.occupancyPercent - a.occupancyPercent)[0]

  return (
    <AppShell
      title="대시보드"
      subtitle="충북대학교 캠퍼스 · 실시간 현황"
      pendingCount={summary?.pendingProposals ?? proposals.length}
    >
      {loading || !summary ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">불러오는 중...</div>
      ) : (
        <>
          <KpiRow summary={summary} />

          <div className="grid grid-cols-[1.55fr_1fr] gap-5 items-stretch">
            <CongestionList locations={locations} />
            <div className="flex flex-col gap-5">
              <TrendChart data={trend} locationName={busiestLocation?.name ?? '전체'} />
              <ApprovalList proposals={proposals} onChange={handleProposalChange} />
            </div>
          </div>

          <ReportsTable reports={reports} />
        </>
      )}
    </AppShell>
  )
}
