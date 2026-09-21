import { proposals, getPendingProposals, withCors } from '../../_lib/data.js'

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

  const status = req.query.status
  const list = status === 'pending' ? getPendingProposals() : proposals
  res.status(200).json(list)
}
