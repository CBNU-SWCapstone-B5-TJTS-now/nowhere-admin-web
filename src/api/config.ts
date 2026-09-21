// 백엔드에 관리자 인증 API가 생기기 전까지 쓸 "마스터 계정" 설정입니다.
// .env 파일에 VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD / VITE_ADMIN_NAME 을 넣으면
// 코드를 건드리지 않고도 로그인 계정을 바꿀 수 있어요. (.env.example 참고)
export const demoAdminCredentials = {
  email: import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@nowhere-app.cloud',
  password: import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin1234',
  name: import.meta.env.VITE_ADMIN_NAME ?? '관리자',
}
