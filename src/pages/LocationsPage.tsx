import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { SearchIcon } from '../components/icons'
import * as adminApi from '../api/adminApi'
import type { LocationStatus, CongestionLevel } from '../types'

const levelMeta: Record<CongestionLevel, { text: string; bg: string; label: string }> = {
  CROWDED: { text: 'text-red-600', bg: 'bg-red-50', label: '혼잡' },
  NORMAL: { text: 'text-amber-600', bg: 'bg-amber-50', label: '보통' },
  RELAXED: { text: 'text-green-600', bg: 'bg-green-50', label: '여유' },
}

export function LocationsPage() {
  const [locations, setLocations] = useState<LocationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('전체')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    let cancelled = false
    adminApi.getLocationStatuses().then((list) => {
      if (!cancelled) {
        setLocations(list)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () => ['전체', ...Array.from(new Set(locations.map((l) => l.category)))],
    [locations],
  )

  const filtered = locations.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === '전체' || l.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  function handleAdd() {
    if (!newName.trim()) return
    setLocations((prev) => [
      {
        id: `local-${Date.now()}`,
        name: newName.trim(),
        category: newCategory.trim() || '기타',
        level: 'RELAXED',
        occupancyPercent: 0,
        updatedAgoMinutes: 0,
      },
      ...prev,
    ])
    setNewName('')
    setNewCategory('')
    setShowAddForm(false)
  }

  function handleDelete(id: string) {
    setLocations((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <AppShell title="장소 관리" subtitle="충북대학교 캠퍼스 · 등록된 장소 목록">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-row items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-72">
            <SearchIcon className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="장소명 검색"
              className="bg-transparent outline-none text-[13px] text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>

          <div className="flex flex-row items-center gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-full border ${
                  categoryFilter === c
                    ? 'bg-blue-700 border-blue-700 text-white'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="ml-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[12.5px] font-bold"
          >
            + 새 장소 추가
          </button>
        </div>

        {showAddForm && (
          <div className="flex flex-row items-end gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 flex-wrap">
            <label className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <span className="text-[11.5px] font-semibold text-slate-500">장소명</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 border border-slate-300 rounded-md px-3 text-[13px] outline-none focus:border-blue-600"
                placeholder="예: 예술대 연습실"
              />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <span className="text-[11.5px] font-semibold text-slate-500">카테고리</span>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-9 border border-slate-300 rounded-md px-3 text-[13px] outline-none focus:border-blue-600"
                placeholder="예: 학습공간"
              />
            </label>
            <button
              onClick={handleAdd}
              className="h-9 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-[12.5px] font-bold"
            >
              추가
            </button>
          </div>
        )}

        <span className="text-[11.5px] text-slate-400">
          ⚠️ 장소 추가/삭제는 아직 백엔드 API가 없어 화면에서만 반영돼요 (새로고침하면 초기화됩니다).
        </span>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">장소명</th>
              <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">카테고리</th>
              <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">혼잡도</th>
              <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">점유율</th>
              <th className="text-left py-2 px-1.5 text-[11.5px] font-bold text-slate-400">업데이트</th>
              <th className="text-right py-2 px-1.5 text-[11.5px] font-bold text-slate-400">작업</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-[13px]">
                  불러오는 중...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-[13px]">
                  조건에 맞는 장소가 없어요.
                </td>
              </tr>
            ) : (
              filtered.map((l, i) => {
                const meta = levelMeta[l.level]
                return (
                  <tr key={l.id} className={i !== filtered.length - 1 ? 'border-b border-slate-100' : ''}>
                    <td className="py-2.5 px-1.5 text-[13px] font-semibold text-slate-900">{l.name}</td>
                    <td className="py-2.5 px-1.5 text-[12.5px] text-slate-500">{l.category}</td>
                    <td className="py-2.5 px-1.5">
                      <span className={`text-[11.5px] font-bold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-1.5 text-[12.5px] text-slate-500">{l.occupancyPercent}%</td>
                    <td className="py-2.5 px-1.5 text-[12.5px] text-slate-500">{l.updatedAgoMinutes}분 전</td>
                    <td className="py-2.5 px-1.5 text-right">
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-[12px] font-semibold text-red-500 hover:underline"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  )
}
