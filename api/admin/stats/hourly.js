import { hourlyTrend, withCors } from '../../_lib/data.js'

export default function handler(req, res) {
  withCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' })
    return
  }

  // locationId 쿼리 파라미터는 아직 장소별로 다른 추이를 만들 데이터가 없어서
  // 지금은 무시하고 항상 같은 전체 추이를 돌려줘요.
  res.status(200).json(hourlyTrend)
}
