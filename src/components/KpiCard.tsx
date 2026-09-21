import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  unit: string
  note: string
  noteColor?: string
  icon: ReactNode
  iconBg: string
}

export function KpiCard({ label, value, unit, note, noteColor = 'text-slate-400', icon, iconBg }: KpiCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-2.5">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[12.5px] font-semibold text-slate-500">{label}</span>
        <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
      </div>
      <span className="text-[26px] font-extrabold text-slate-900">
        {value}
        <span className="text-[14px] font-semibold text-slate-400 ml-1">{unit}</span>
      </span>
      <span className={`text-[11.5px] font-semibold ${noteColor}`}>{note}</span>
    </div>
  )
}
