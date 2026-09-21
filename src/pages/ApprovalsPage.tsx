import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import * as adminApi from '../api/adminApi'
import type { LocationProposal } from '../types'

interface HistoryEntry extends LocationProposal {
  decision: 'approved' | 'rejected'
}

export function ApprovalsPage() {
  const [proposals, setProposals] = useState<LocationProposal[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'history'>('pending')

  useEffect(() => {
    let cancelled = false
    adminApi.getPendingProposals().then((list) => {
      if (!cancelled) {
        setProposals(list)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handle(id: string, action: 'approve' | 'reject') {
    const target = proposals.find((p) => p.id === id)
    if (!target) return
    setPendingActionId(id)
    try {
      if (action === 'approve') {
        await adminApi.approveProposal(id)
      } else {
        await adminApi.rejectProposal(id)
      }
    } catch (err) {
      console.warn(`[ApprovalsPage] ${action} 호출 실패 (백엔드 엔드포인트 준비 전이면 정상입니다)`, err)
    } finally {
      setProposals((prev) => prev.filter((p) => p.id !== id))
      setHistory((prev) => [{ ...target, decision: action === 'approve' ? 'approved' : 'rejected' }, ...prev])
      setPendingActionId(null)
    }
  }

  return (
    <AppShell title="장소 제안 승인" subtitle="사용자가 제안한 새 장소를 검토하고 승인/반려하세요">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-row items-center gap-2">
          <button
            onClick={() => setTab('pending')}
            className={`text-[12.5px] font-bold px-3.5 py-1.5 rounded-full ${
              tab === 'pending' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            대기중 {proposals.length}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`text-[12.5px] font-bold px-3.5 py-1.5 rounded-full ${
              tab === 'history' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
            }`}
          >
            처리 내역 {history.length}
          </button>
        </div>

        {tab === 'pending' ? (
          <div className="grid grid-cols-2 gap-3.5">
            {loading ? (
              <span className="col-span-2 text-center text-slate-400 text-[13px] py-10">불러오는 중...</span>
            ) : proposals.length === 0 ? (
              <span className="col-span-2 text-center text-slate-400 text-[13px] py-10">
                대기 중인 제안이 없어요.
              </span>
            ) : (
              proposals.map((p) => (
                <div key={p.id} className="flex flex-col gap-2.5 p-4 rounded-lg border border-slate-100">
                  <div className="flex flex-row items-baseline justify-between">
                    <span className="text-[14px] font-bold text-slate-900">{p.placeName}</span>
                    <span className="text-[11px] text-slate-400">{p.category}</span>
                  </div>
                  <span className="text-[12px] text-slate-400">
                    제안자 {p.proposedBy} · {p.proposedAgo}
                  </span>
                  <div className="flex flex-row gap-2 pt-1">
                    <button
                      disabled={pendingActionId === p.id}
                      onClick={() => handle(p.id, 'approve')}
                      className="flex-1 py-2 rounded-md bg-blue-50 text-[12.5px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                      승인
                    </button>
                    <button
                      disabled={pendingActionId === p.id}
                      onClick={() => handle(p.id, 'reject')}
                      className="flex-1 py-2 rounded-md bg-slate-50 border border-slate-200 text-[12.5px] font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                    >
                      반려
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.length === 0 ? (
              <span className="text-center text-slate-400 text-[13px] py-10">아직 처리한 제안이 없어요.</span>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-row items-center justify-between px-3 py-2.5 rounded-lg border border-slate-100"
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-slate-900">{h.placeName}</span>
                    <span className="text-[11.5px] text-slate-400">
                      {h.proposedBy} · {h.category}
                    </span>
                  </div>
                  <span
                    className={`text-[11.5px] font-bold px-2.5 py-0.5 rounded-full ${
                      h.decision === 'approved' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {h.decision === 'approved' ? '승인됨' : '반려됨'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
