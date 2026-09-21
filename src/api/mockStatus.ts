// 어떤 API 호출이 지금 mock(예시) 데이터로 대체되고 있는지 앱 전체에서 공유하는
// 아주 작은 store예요. adminApi.ts의 withMockFallback이 성공/실패할 때마다
// 여기에 기록하고, AppShell이 이걸 구독해서 화면 위에 배너로 알려줘요.
type Listener = () => void

const mockedLabels = new Set<string>()
const listeners = new Set<Listener>()

// useSyncExternalStore는 getSnapshot()이 매 렌더마다 "같은 값이면 같은 참조"를
// 돌려주길 기대해요. 매번 새 배열을 만들면 참조가 계속 달라져서 무한 리렌더에
// 빠지기 때문에, 변경이 있을 때만 새 배열을 만들어서 캐싱해둬요.
let cachedLabels: string[] = []

function notify() {
  cachedLabels = Array.from(mockedLabels)
  listeners.forEach((listener) => listener())
}

export function markMocked(label: string) {
  if (!mockedLabels.has(label)) {
    mockedLabels.add(label)
    notify()
  }
}

export function markReal(label: string) {
  if (mockedLabels.delete(label)) {
    notify()
  }
}

export function getMockedLabels(): string[] {
  return cachedLabels
}

export function subscribeMockStatus(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
