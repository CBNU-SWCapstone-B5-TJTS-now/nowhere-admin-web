// 실제 백엔드(Spring Boot)에 아직 없는 "관리자 전용" API들을 위한 데모용 데이터예요.
// Vercel Serverless Function은 요청마다(또는 콜드스타트마다) 새 인스턴스로 뜰 수 있어서
// 여기 값은 100% 영구 저장되지 않아요 — 데모/발표용으로는 충분하지만, 실제 서비스에서는
// 백엔드팀이 DB(PostgreSQL 등) 기반으로 정식 구현해야 합니다.
// 주의: 이 파일은 nowhere-admin-web 레포 안에서만 쓰이고, 실제 백엔드 레포와는 무관해요.
// (프로젝트 package.json이 "type": "module"이라 이 폴더 전체를 ESM으로 작성해요.)

export const proposals = [
  {
    id: 'p1',
    placeName: '인문대 옥상 정원',
    category: '휴게공간',
    proposedBy: '익명의 다람쥐',
    proposedAgo: '3시간 전',
    status: 'pending',
  },
  {
    id: 'p2',
    placeName: '농생대 온실 앞 벤치',
    category: '휴게공간',
    proposedBy: '새싹지킴이',
    proposedAgo: '어제',
    status: 'pending',
  },
  {
    id: 'p3',
    placeName: '예술대 연습실 복도',
    category: '학습공간',
    proposedBy: '피아노건반',
    proposedAgo: '2일 전',
    status: 'pending',
  },
]

export const recentReports = [
  { id: 'r1', locationName: '학생회관 학식당', reporterId: 'user_2841', level: 'CROWDED', reportedAt: '14:32', status: 'ACTIVE' },
  { id: 'r2', locationName: '공학관 스터디카페', reporterId: 'user_1092', level: 'RELAXED', reportedAt: '14:28', status: 'ACTIVE' },
  { id: 'r3', locationName: '중앙도서관 열람실', reporterId: 'user_3387', level: 'CROWDED', reportedAt: '14:20', status: 'EXPIRED' },
  { id: 'r4', locationName: '체육관 헬스장', reporterId: 'user_0456', level: 'NORMAL', reportedAt: '14:15', status: 'ACTIVE' },
  { id: 'r5', locationName: '학생회관 편의점 앞', reporterId: 'user_2210', level: 'RELAXED', reportedAt: '14:05', status: 'EXPIRED' },
]

export const hourlyTrend = [
  { hour: 10, occupancyPercent: 22 },
  { hour: 11, occupancyPercent: 18 },
  { hour: 12, occupancyPercent: 74 },
  { hour: 13, occupancyPercent: 96 },
  { hour: 14, occupancyPercent: 60 },
  { hour: 15, occupancyPercent: 28 },
  { hour: 16, occupancyPercent: 12 },
  { hour: 17, occupancyPercent: 34 },
  { hour: 18, occupancyPercent: 88 },
  { hour: 19, occupancyPercent: 70 },
  { hour: 20, occupancyPercent: 30 },
]

export function getPendingProposals() {
  return proposals.filter((p) => p.status === 'pending')
}

export function setProposalStatus(id, status) {
  const target = proposals.find((p) => p.id === id)
  if (!target) return false
  target.status = status
  return true
}

export function getSummary() {
  return {
    totalLocations: 24,
    crowdedLocations: 2,
    reportsToday: recentReports.length,
    pendingProposals: getPendingProposals().length,
  }
}

export function withCors(res) {
  // 같은 도메인(Vercel)에서 호출하는 게 기본이라 원래는 필요 없지만,
  // 로컬에서 다른 포트로 테스트할 때를 대비한 안전장치예요.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
