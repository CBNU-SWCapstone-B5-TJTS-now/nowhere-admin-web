import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LogoMark,
  DashboardIcon,
  BuildingIcon,
  ApprovalIcon,
  ChartIcon,
  SettingsIcon,
  LogoutIcon,
} from './icons'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
}

function NavItem({ icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        active ? 'bg-[#16233f]' : 'hover:bg-[#141f38]'
      }`}
    >
      <span className={active ? 'text-white' : 'text-[#8ea3c9]'}>{icon}</span>
      <span className={`text-[13.5px] ${active ? 'font-semibold text-white' : 'font-medium text-[#b7c4e0]'}`}>
        {label}
      </span>
      {badge ? (
        <span className="ml-auto text-[11px] font-bold text-[#0b1730] bg-amber-500 rounded-full px-2 py-0.5">
          {badge}
        </span>
      ) : null}
    </div>
  )
}

const NAV_ITEMS = [
  { path: '/', label: '대시보드', icon: DashboardIcon },
  { path: '/locations', label: '장소 관리', icon: BuildingIcon },
  { path: '/approvals', label: '장소 제안 승인', icon: ApprovalIcon },
  { path: '/reports', label: '통계 리포트', icon: ChartIcon },
  { path: '/settings', label: '설정', icon: SettingsIcon },
]

export function Sidebar({ pendingCount }: { pendingCount: number }) {
  const { admin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    signOut()
    navigate('/login')
  }

  const initials = admin?.name ? admin.name.slice(0, 2) : '관리'

  return (
    <div className="w-60 min-w-60 h-full bg-[#0b1730] flex flex-col p-4 gap-1">
      <div
        className="flex flex-row items-center gap-2.5 px-2 pb-7 pt-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <LogoMark size={30} />
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-extrabold text-white tracking-tight">지금어때</span>
          <span className="text-[11px] font-medium text-[#7c9bd6]">Admin Console</span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          return (
            <NavItem
              key={item.path}
              icon={<Icon />}
              label={item.label}
              active={active}
              badge={item.path === '/approvals' ? pendingCount || undefined : undefined}
              onClick={() => navigate(item.path)}
            />
          )
        })}
      </div>

      <div className="mt-auto flex flex-row items-center gap-2.5 px-2 py-3 border-t border-[#1c2c4c]">
        <div className="w-8 h-8 rounded-full bg-[#1d4ed8] flex items-center justify-center text-[12px] font-bold text-white">
          {initials}
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="text-[12.5px] font-semibold text-white truncate">{admin?.name ?? '관리자'}</span>
          <span className="text-[11px] text-[#8ea3c9]">운영 관리자</span>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto text-[#8ea3c9] hover:text-white transition-colors"
          title="로그아웃"
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  )
}
