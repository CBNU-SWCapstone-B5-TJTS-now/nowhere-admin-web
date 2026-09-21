import { SearchIcon, BellIcon } from './icons'

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = '대시보드', subtitle = '충북대학교 캠퍼스 · 실시간 현황' }: HeaderProps) {
  return (
    <div className="h-[72px] min-h-[72px] flex flex-row items-center justify-between px-8 border-b border-slate-200 bg-white">
      <div className="flex flex-col leading-tight">
        <span className="text-[18px] font-bold text-slate-900">{title}</span>
        <span className="text-[12px] text-slate-400">{subtitle}</span>
      </div>
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-64">
          <SearchIcon className="text-slate-400" />
          <span className="text-[13px] text-slate-400">장소, 제보 검색</span>
        </div>
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100">
          <BellIcon className="text-slate-600" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-600 border border-slate-100" />
        </div>
      </div>
    </div>
  )
}
