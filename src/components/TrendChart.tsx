import type { HourlyTrendPoint } from '../types'

const WIDTH = 380
const HEIGHT = 150
const TOP = 18
const BOTTOM = 129

function toPoint(p: HourlyTrendPoint, i: number, n: number) {
  const x = n <= 1 ? 0 : (i / (n - 1)) * WIDTH
  const y = BOTTOM - (Math.max(0, Math.min(100, p.occupancyPercent)) / 100) * (BOTTOM - TOP)
  return { x, y }
}

export function TrendChart({ data, locationName }: { data: HourlyTrendPoint[]; locationName: string }) {
  const points = data.map((p, i) => toPoint(p, i, data.length))
  const linePath = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPath = `0,${BOTTOM} ${linePath} ${WIDTH},${BOTTOM}`

  const peakIndex = data.reduce((best, p, i) => (p.occupancyPercent > data[best].occupancyPercent ? i : best), 0)
  const peak = points[peakIndex]

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[14.5px] font-bold text-slate-900">시간대별 혼잡도 추이</span>
        <span className="text-[11.5px] text-slate-400">{locationName} · 오늘</span>
      </div>

      <svg width="100%" height="150" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ overflow: 'visible' }}>
        <line x1="0" y1={TOP} x2={WIDTH} y2={TOP} stroke="#f1f5f9" strokeWidth="1" />
        <line x1="0" y1={(TOP + BOTTOM) / 2} x2={WIDTH} y2={(TOP + BOTTOM) / 2} stroke="#f1f5f9" strokeWidth="1" />
        <line x1="0" y1={BOTTOM} x2={WIDTH} y2={BOTTOM} stroke="#e2e8f0" strokeWidth="1" />
        <polygon points={areaPath} fill="#2563eb" opacity="0.08" />
        <polyline points={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {peak && (
          <>
            <circle cx={peak.x} cy={peak.y} r="4" fill="#2563eb" />
            <text
              x={Math.min(Math.max(peak.x - 24, 0), WIDTH - 60)}
              y={Math.max(peak.y - 8, 12)}
              fontSize="10"
              fontWeight="700"
              fill="#1d4ed8"
              fontFamily="Noto Sans KR, sans-serif"
            >
              피크 {data[peakIndex].hour}시
            </text>
          </>
        )}
      </svg>

      <div className="flex flex-row justify-between px-0.5">
        {data
          .filter((_, i) => i % 2 === 0)
          .map((p) => (
            <span key={p.hour} className="text-[10.5px] text-slate-400">
              {p.hour}시
            </span>
          ))}
      </div>
    </div>
  )
}
