import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import * as adminApi from '../api/adminApi'
import { getMockedLabels, subscribeMockStatus } from '../api/mockStatus'

interface AppShellProps {
  title: string
  subtitle?: string
  pendingCount?: number
  children: ReactNode
}

export function AppShell({ title, subtitle, pendingCount, children }: AppShellProps) {
  const [fetchedCount, setFetchedCount] = useState(0)
  const mockedLabels = useSyncExternalStore(subscribeMockStatus, getMockedLabels, getMockedLabels)

  useEffect(() => {
    if (pendingCount !== undefined) return
    let cancelled = false
    adminApi.getPendingProposals().then((list) => {
      if (!cancelled) setFetchedCount(list.length)
    })
    return () => {
      cancelled = true
    }
  }, [pendingCount])

  return (
    <div className="w-full h-screen flex flex-row bg-slate-50">
      <Sidebar pendingCount={pendingCount ?? fetchedCount} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title={title} subtitle={subtitle} />

        {mockedLabels.length > 0 && (
          <div className="px-8 pt-3 shrink-0">
            <div className="flex flex-row items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-semibold rounded-lg px-3.5 py-2">
              <span>⚠️</span>
              <span>
                일부 데이터는 아직 백엔드 API가 준비되지 않아 예시(mock) 데이터로 표시 중이에요. (
                {mockedLabels.length}개 항목)
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-5">{children}</div>
      </div>
    </div>
  )
}
