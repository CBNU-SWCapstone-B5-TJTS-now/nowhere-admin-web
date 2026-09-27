import { getAllProposals, getPendingProposals, addProposal, formatProposedAgo, withCors } from '../../_lib/data.js'

function withComputedAgo(list) {
  return list.map((p) =>
    p.createdAt ? { ...p, proposedAgo: formatProposedAgo(p.createdAt) } : p
  )
}

export default async function handler(req, res) {
  withCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method === 'GET') {
    const status = req.query.status
    const list = status === 'pending' ? await getPendingProposals() : await getAllProposals()
    res.status(200).json(withComputedAgo(list))
    return
  }

  if (req.method === 'POST') {
    // 모바일 앱의 "장소 제안하기"에서 들어오는 요청이에요.
    const { placeName, category, description, latitude, longitude, proposedBy } = req.body || {}

    if (!placeName || typeof placeName !== 'string' || !placeName.trim()) {
      res.status(400).json({ message: 'placeName은 필수입니다.' })
      return
    }
    if (!category || typeof category !== 'string') {
      res.status(400).json({ message: 'category는 필수입니다.' })
      return
    }

    const created = await addProposal({
      placeName: placeName.trim(),
      category,
      description,
      latitude,
      longitude,
      proposedBy,
    })
    res.status(201).json(created)
    return
  }

  res.status(405).json({ message: 'Method Not Allowed' })
}
