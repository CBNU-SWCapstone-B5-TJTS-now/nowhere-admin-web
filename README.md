# nowhere-admin-web

지금어때(Nowhere) 관리자 대시보드 — React + Vite + TypeScript + Tailwind CSS.

## 시작하기

```bash
npm install
cp .env.example .env   # 필요하면 VITE_API_BASE_URL 수정
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있어요.

## 로그인 (마스터 계정)

백엔드에 관리자 인증 API가 아직 없어도 로그인할 수 있도록, `.env`에서 설정하는 마스터 계정을
지원해요.

- `.env`에 아무것도 안 적으면 기본값은 이메일 `admin@nowhere-app.cloud` / 비밀번호 `admin1234` 예요.
- 바꾸고 싶으면 `.env`에 아래처럼 적으면 돼요 (코드 수정 필요 없음):
  ```
  VITE_ADMIN_EMAIL=your-email@example.com
  VITE_ADMIN_PASSWORD=원하는비밀번호
  VITE_ADMIN_NAME=표시될이름
  ```
- 실제 인증 API(`POST /api/admin/auth/login`)가 백엔드에 생기면 로그인 시 그 쪽을 먼저 시도하고,
  실패할 때만(아직 없거나 네트워크 오류일 때만) 이 마스터 계정으로 자동 대체돼요. 즉 백엔드가 준비되면
  별도 코드 수정 없이 자연스럽게 실제 인증으로 넘어갑니다.
- 마스터 계정 로직은 `src/api/config.ts` + `src/api/adminApi.ts`의 `login()` 함수에 있어요.

## 폴더 구조

```
src/
  api/          axios 클라이언트 + 관리자 API 서비스 레이어 + 샘플(mock) 데이터
  components/   Sidebar, Header, KPI 카드, 혼잡도 리스트, 차트, 승인 리스트, 제보 테이블
  context/      로그인 상태(AuthContext)
  pages/        LoginPage, DashboardPage
  routes/       ProtectedRoute (로그인 안 하면 /login 으로 이동)
  types/        공용 타입 정의
```

## 백엔드 연동 관련 — 꼭 읽어주세요

`src/api/adminApi.ts` 한 곳에 모든 API 호출이 모여 있어요. 화면 컴포넌트는 이 파일의 함수만 호출하기
때문에, 실제 엔드포인트 경로/응답 형식이 정해지면 **이 파일만** 고치면 됩니다.

현재 가정하고 있는 엔드포인트 (아직 백엔드에 없을 수 있어요):

| 용도 | 메서드 | 경로 |
|---|---|---|
| 관리자 로그인 | POST | `/api/admin/auth/login` |
| 대시보드 요약 통계 | GET | `/api/admin/stats/summary` |
| 장소별 실시간 혼잡도 | GET | `/api/locations` (기존 API 재사용) |
| 시간대별 혼잡도 추이 | GET | `/api/admin/stats/hourly` |
| 대기 중인 장소 제안 목록 | GET | `/api/admin/proposals?status=pending` |
| 장소 제안 승인 / 반려 | POST | `/api/admin/proposals/:id/approve`, `/reject` |
| 최근 제보 내역 | GET | `/api/admin/reports/recent` |

**해당 엔드포인트 호출이 실패하면(404, 네트워크 오류 등) 자동으로 `src/api/mockData.ts`의 샘플
데이터로 대체돼서 화면이 비지 않아요.** 개발자 도구 콘솔에 `[adminApi] ... mock 데이터로 대체합니다`
경고가 뜨면 아직 그 API가 없다는 뜻이에요. 백엔드 팀과 위 표의 엔드포인트/응답 형식을 맞추면 실제
데이터로 자연스럽게 전환됩니다.

## 다음에 하면 좋은 것

- [ ] 백엔드팀과 위 엔드포인트 스펙 확정 (요청/응답 JSON 형식)
- [ ] CSV 내보내기(`ReportsTable.tsx`)를 실제 제보 데이터 기준으로 검증
- [ ] 배포: Vercel / Netlify 등에 정적 사이트로 올리고, 관리자 도메인(예: `admin.nowhere-app.cloud`) 연결
- [ ] 관리자 계정 관리(초대, 권한) 화면 — 기능명세서 EX-4-4 참고
