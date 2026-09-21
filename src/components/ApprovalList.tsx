import { useState } from 'react'
import type { LocationProposal } from '../types'
import * as adminApi from '../api/adminApi'

interface ApprovalListProps {
  proposals: LocationProposal[]
  onChange: (id: string) => void
}

export function ApprovalList({ proposals, onChange }: ApprovalListProps) {
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

  async function handle(id: string, action: 'approve' | 'reject') {
    setPendingActionId(id)
    try {
      if (action === 'approve') {
        await adminApi.approveProposal(id)
      } else {
        await adminApi.rejectProposal(id)
      }
    } catch (err) {
      console.warn(`[ApprovalList] ${action} 호출 실패 (백엔드 엔드포인트 준비 전이면 정상입니다)`, err)
    } finally {
      onChange(id)
      setPendingActionId(null)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 flex-1">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[14.5px] font-bold text-slate-900">장소 제안 승인 대기</span>
        <a href="#" className="text-[12px] font-semibold text-blue-700 hover:underline">
          전체 보기
        </a>
      </div>

      <div className="flex flex-col gap-2.5">
        {proposals.length === 0 && (
          <span className="text-[13px] text-slate-400 py-4 text-center">대기 중인 제안이 없어요.</span>
        )}
        {proposals.map((p) => (
          <div key={p.id} className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100">
            <div className="flex flex-row items-baseline justify-between">
              <span className="text-[13px] font-semibold text-slate-900">{p.placeName}</span>
              <span className="text-[10.5px] text-slate-400">{p.category}</span>
            </div>
            <span className="text-[11.5px] text-slate-400">
              제안자 {p.proposedBy} · {p.proposedAgo}
            </span>
            <div className="flex flex-row gap-2">
              <button
                disabled={pendingActionId === p.id}
                onClick={() => handle(p.id, 'approve')}
                className="flex-1 text-center py-1.5 rounded-md bg-blue-50 text-[12px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                승인
              </button>
              <button
                disabled={pendingActionId === p.id}
                onClick={() => handle(p.id, 'reject')}
                className="flex-1 text-center py-1.5 rounded-md bg-slate-50 border border-slate-200 text-[12px] font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                반려
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
