import type { DashboardSummary } from '../types'
import { KpiCard } from './KpiCard'
import { BuildingIcon, AlertIcon, ListIcon, ApprovalIcon } from './icons'

interface KpiRowProps {
  summary: DashboardSummary
  // 실제 백엔드 데이터 기준으로 지금 혼잡한 장소들의 이름이에요. (전체 등록 장소/실시간
  // 혼잡 장소는 이제 실제 /api/locations 데이터로 계산돼요.)
  crowdedNames: string[]
}

export function KpiRow({ summary, crowdedNames }: KpiRowProps) {
  return (
    <div className="grid grid-cols-4 gap-4.5">
      <KpiCard
        label="전체 등록 장소"
        value={String(summary.totalLocations)}
        unit="개소"
        note="실시간 서버 데이터"
        noteColor="text-slate-400"
        iconBg="bg-blue-50"
        icon={<BuildingIcon className="text-blue-600" />}
      />
      <KpiCard
        label="실시간 혼잡 장소"
        value={String(summary.crowdedLocations)}
        unit="곳"
        note={crowdedNames.length > 0 ? crowdedNames.join(' · ') : '혼잡한 장소 없음'}
        noteColor={crowdedNames.length > 0 ? 'text-red-600' : 'text-slate-400'}
        iconBg="bg-red-50"
        icon={<AlertIcon className="text-red-600" />}
      />
      <KpiCard
        label="오늘 누적 제보"
        value={String(summary.reportsToday)}
        unit="건"
        note="예시 데이터 (백엔드 미연동)"
        noteColor="text-slate-400"
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
