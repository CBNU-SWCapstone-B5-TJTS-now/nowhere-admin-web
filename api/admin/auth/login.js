import { withCors } from '../../_lib/data.js'

// 마스터 관리자 계정. Vercel 프로젝트의 Environment Variables에서
// ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME 을 설정하면 바꿀 수 있어요.
// (프론트의 VITE_ADMIN_EMAIL 등과는 별개예요 — 이 값은 서버 쪽에서만 쓰여요.)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nowhere-app.cloud'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Nowhere2026!'
const ADMIN_NAME = process.env.ADMIN_NAME || '관리자'

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

  const { email, password } = req.body || {}

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.status(200).json({
      token: 'nowhere-admin-demo-token',
      admin: { name: ADMIN_NAME, email },
    })
    return
  }

  res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
}
