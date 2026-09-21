import { recentReports, withCors } from '../../_lib/data.js'

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

  const limit = Number(req.query.limit) || 20
  res.status(200).json(recentReports.slice(0, limit))
}
