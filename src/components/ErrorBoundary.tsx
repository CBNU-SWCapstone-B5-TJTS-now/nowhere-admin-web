import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

// 화면 렌더링 중 예상치 못한 에러(예: 백엔드 응답 형식이 갑자기 바뀌는 경우)가 나도
// 화면 전체가 하얗게 사라지는 대신, 무슨 에러인지 보여주고 새로고침할 수 있게 해줘요.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] 화면 렌더링 중 에러가 발생했어요.', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-slate-50 px-6">
          <div className="max-w-md flex flex-col items-center gap-3 text-center">
            <span className="text-[16px] font-bold text-slate-900">화면을 불러오는 중 문제가 생겼어요</span>
            <span className="text-[13px] text-slate-500 leading-relaxed">
              백엔드에서 받은 데이터 형식이 화면이 기대하는 것과 달라서 생긴 오류일 수 있어요. 개발자 도구
              콘솔(F12)에 자세한 내용이 남아있어요.
            </span>
            <pre className="text-[11px] text-left text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 w-full overflow-x-auto">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-1 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[12.5px] font-bold"
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
