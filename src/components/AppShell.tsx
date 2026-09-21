import { useEffect, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import * as adminApi from '../api/adminApi'

interface AppShellProps {
  title: string
  subtitle?: string
  pendingCount?: number
  children: ReactNode
}

export function AppShell({ title, subtitle, pendingCount, children }: AppShellProps) {
  const [fetchedCount, setFetchedCount] = useState(0)

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
        <div className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-5">{children}</div>
      </div>
    </div>
  )
}
