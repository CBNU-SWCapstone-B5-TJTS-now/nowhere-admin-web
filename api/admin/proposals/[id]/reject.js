import { setProposalStatus, withCors } from '../../../_lib/data.js'

export default function handler(req, res) {
  withCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' })
    return
  }

  const { id } = req.query
  const ok = setProposalStatus(id, 'rejected')
  if (!ok) {
    res.status(404).json({ message: '해당 제안을 찾을 수 없어요.' })
    return
  }
  res.status(200).json({ id, status: 'rejected' })
}
