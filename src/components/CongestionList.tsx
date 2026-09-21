import type { LocationStatus, CongestionLevel } from '../types'

const levelMeta: Record<CongestionLevel, { dot: string; bar: string; barBg: string; text: string; rowBg: string; label: string }> = {
  CROWDED: { dot: 'bg-red-600', bar: 'bg-red-600', barBg: 'bg-red-200', text: 'text-red-600', rowBg: 'bg-red-50', label: '혼잡' },
  NORMAL: { dot: 'bg-amber-600', bar: 'bg-amber-600', barBg: 'bg-amber-200', text: 'text-amber-600', rowBg: '', label: '보통' },
  RELAXED: { dot: 'bg-green-600', bar: 'bg-green-600', barBg: 'bg-green-200', text: 'text-green-600', rowBg: '', label: '여유' },
}

export function CongestionList({ locations }: { locations: LocationStatus[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3.5">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[14.5px] font-bold text-slate-900">건물별 실시간 혼잡도 현황</span>
        <span className="text-[12px] text-slate-400">10초마다 자동 갱신</span>
      </div>

      <div className="flex flex-col gap-2">
        {locations.map((loc) => {
          const meta = levelMeta[loc.level]
          return (
            <div key={loc.id} className={`flex flex-row items-center gap-3.5 px-2.5 py-3 rounded-lg ${meta.rowBg}`}>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[13.5px] font-semibold text-slate-900 truncate">{loc.name}</span>
                <span className="text-[11.5px] text-slate-400">
                  {loc.category} · {loc.updatedAgoMinutes}분 전 업데이트
                </span>
              </div>
              <div className={`w-32 h-1.5 rounded-full shrink-0 ${meta.barBg}`}>
                <div className={`h-1.5 rounded-full ${meta.bar}`} style={{ width: `${loc.occupancyPercent}%` }} />
              </div>
              <span className={`text-[12.5px] font-bold w-16 text-right ${meta.text}`}>
                {meta.label} {loc.occupancyPercent}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
