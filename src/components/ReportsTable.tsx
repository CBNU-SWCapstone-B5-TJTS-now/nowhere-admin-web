import type { RecentReport, CongestionLevel } from '../types'
import { DownloadIcon } from './icons'

const levelBadge: Record<CongestionLevel, { bg: string; text: string; label: string }> = {
  CROWDED: { bg: 'bg-red-50', text: 'text-red-600', label: '혼잡' },
  NORMAL: { bg: 'bg-amber-50', text: 'text-amber-600', label: '보통' },
  RELAXED: { bg: 'bg-green-50', text: 'text-green-600', label: '여유' },
}

function toCsv(reports: RecentReport[]): string {
  const header = ['장소', '제보자', '혼잡도', '제보시각', '상태']
  const rows = reports.map((r) => [
    r.locationName,
    r.reporterId,
    levelBadge[r.level].label,
    r.reportedAt,
    r.status === 'ACTIVE' ? '정상' : '만료(TTL)',
  ])
  return [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
}

function downloadCsv(reports: RecentReport[]) {
  const csv = '﻿' + toCsv(reports) // BOM 포함 -> 엑셀에서 한글 깨짐 방지
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const today = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `지금어때_제보내역_${today}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ReportsTable({ reports }: { reports: RecentReport[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3.5">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[14.5px] font-bold text-slate-900">최근 제보 내역</span>
        <button
          onClick={() => downloadCsv(reports)}
          className="flex flex-row items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white"
        >
          <DownloadIcon />
          <span className="text-[12.5px] font-semibold">CSV 내보내기</span>
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">장소</th>
            <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">제보자</th>
            <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">혼잡도</th>
            <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">제보 시각</th>
            <th className="text-right py-2 px-1.5 text-[11.5px] font-bold text-slate-400">상태</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => {
            const badge = levelBadge[r.level]
            return (
              <tr key={r.id} className={i !== reports.length - 1 ? 'border-b border-slate-100' : ''}>
                <td className="py-2.5 px-1.5 text-[13px] font-semibold text-slate-900">{r.locationName}</td>
                <td className="py-2.5 px-1.5 text-[12.5px] text-slate-500">{r.reporterId}</td>
                <td className="py-2.5 px-1.5">
                  <span className={`text-[11.5px] font-bold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="py-2.5 px-1.5 text-[12.5px] text-slate-500">{r.reportedAt}</td>
                <td
                  className={`py-2.5 px-1.5 text-[12.5px] font-semibold text-right ${
                    r.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-400'
                  }`}
                >
                  {r.status === 'ACTIVE' ? '정상' : '만료(TTL)'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
