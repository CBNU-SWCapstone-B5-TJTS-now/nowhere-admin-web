import type { DashboardSummary } from '../types'
import { KpiCard } from './KpiCard'
import { BuildingIcon, AlertIcon, ListIcon, ApprovalIcon } from './icons'

export function KpiRow({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-4 gap-4.5">
      <KpiCard
        label="전체 등록 장소"
        value={String(summary.totalLocations)}
        unit="개소"
        note="지난주 대비 +2개소"
        noteColor="text-green-600"
        iconBg="bg-blue-50"
        icon={<BuildingIcon className="text-blue-600" />}
      />
      <KpiCard
        label="실시간 혼잡 장소"
        value={String(summary.crowdedLocations)}
        unit="곳"
        note="학식당 · 열람실"
        noteColor="text-red-600"
        iconBg="bg-red-50"
        icon={<AlertIcon className="text-red-600" />}
      />
      <KpiCard
        label="오늘 누적 제보"
        value={String(summary.reportsToday)}
        unit="건"
        note="어제 대비 +23건"
        noteColor="text-green-600"
        iconBg="bg-blue-50"
        icon={<ListIcon className="text-blue-600" />}
      />
      <KpiCard
        label="대기 중인 장소 제안"
        value={String(summary.pendingProposals)}
        unit="건"
        note="검토 필요"
        iconBg="bg-amber-50"
        icon={<ApprovalIcon className="text-amber-600" />}
      />
    </div>
  )
}
