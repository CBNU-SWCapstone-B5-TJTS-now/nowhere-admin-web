// 실제 백엔드(Spring Boot)에 아직 없는 "관리자 전용" API들을 위한 데이터 계층이에요.
// 주의: 이 파일은 nowhere-admin-web 레포 안에서만 쓰이고, 실제 백엔드 레포와는 무관해요.
// (프로젝트 package.json이 "type": "module"이라 이 폴더 전체를 ESM으로 작성해요.)
//
// "최근 제보 내역"과 "시간대별 추이"는 이 파일의 데이터를 쓰지 않아요. 최근 제보 내역은
// 실제 백엔드의 /api/locations 스냅샷에서 바로 계산합니다(src/api/adminApi.ts의
// getRecentReports 참고). 시간대별 추이는 백엔드에 이력 조회 엔드포인트가 없어서
// 정확하게 만들 수 없으므로 화면에서 아예 제거했어요.
//
// [2026-09-27] 장소 제안 목록은 예전엔 이 파일의 인메모리 배열(export const proposals = [])에
// 저장했었는데, Vercel Serverless Function은 요청마다(또는 콜드스타트마다) 완전히 다른
// 인스턴스에서 뜰 수 있어서 그 배열이 요청 간에 공유가 안 됐어요. 그래서 모바일 앱에서
// 보낸 제안이 관리자 페이지 조회에서는 거의 항상 안 보이는 문제가 있었습니다(실사용
// 중 확인됨). 이제는 Vercel Storage로 연결한 Upstash Redis에 저장해서, 어느 인스턴스가
// 요청을 처리하든 항상 같은 곳을 읽고 쓰도록 고쳤어요.

import { Redis } from '@upstash/redis'

// Vercel의 "Storage" 탭에서 Upstash Redis를 프로젝트에 연결하면 KV_REST_API_URL /
// KV_REST_API_TOKEN 환경변수가 자동으로 추가돼요(2026-09-27 확인).
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// 제안 목록 전체를 이 하나의 키에 JSON 배열로 저장해요. 양이 아주 많지 않은
// 데이터라(제안 몇 십~몇 백 건) 굳이 여러 키로 쪼개지 않고 단순하게 갑니다.
const PROPOSALS_KEY = 'nowhere:proposals'

async function readProposals() {
  const data = await redis.get(PROPOSALS_KEY)
  return Array.isArray(data) ? data : []
}

async function writeProposals(list) {
  await redis.set(PROPOSALS_KEY, list)
}

export async function getAllProposals() {
  return readProposals()
}

export async function getPendingProposals() {
  const list = await readProposals()
  return list.filter((p) => p.status === 'pending')
}

// 상대 시간 문자열("n분 전" 등)을 만들어줘요. Redis 접근이 필요 없는 순수 함수라
// 그대로 동기 함수예요.
export function formatProposedAgo(createdAtIso) {
  const createdAt = new Date(createdAtIso).getTime()
  const diffMinutes = Math.max(0, Math.round((Date.now() - createdAt) / 60000))
  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}일 전`
}

// 모바일 앱(장소 제안하기)에서 들어온 새 제안을 Redis에 추가해요.
export async function addProposal({ placeName, category, description, latitude, longitude, proposedBy }) {
  const createdAt = new Date().toISOString()
  const proposal = {
    id: `p_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    placeName,
    category,
    description: description || '',
    latitude: typeof latitude === 'number' ? latitude : null,
    longitude: typeof longitude === 'number' ? longitude : null,
    proposedBy: proposedBy || '익명',
    proposedAgo: '방금 전',
    createdAt,
    status: 'pending',
  }
  const list = await readProposals()
  list.unshift(proposal)
  await writeProposals(list)
  return proposal
}

export async function setProposalStatus(id, status) {
  const list = await readProposals()
  const target = list.find((p) => p.id === id)
  if (!target) return false
  target.status = status
  await writeProposals(list)
  return true
}

export function withCors(res) {
  // 같은 도메인(Vercel)에서 호출하는 게 기본이라 원래는 필요 없지만,
  // 로컬에서 다른 포트로 테스트할 때를 대비한 안전장치예요.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
