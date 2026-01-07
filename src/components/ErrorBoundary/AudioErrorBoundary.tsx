import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Audio error caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-ableton-bg flex flex-col items-center justify-center gap-6 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ableton-text mb-4">Audio Error</h1>
            <p className="text-ableton-text-dim mb-2">
              Something went wrong with the audio engine.
            </p>
            <p className="text-ableton-text-muted text-sm mb-6 max-w-md">
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 bg-ableton-accent text-white rounded-lg font-semibold hover:bg-ableton-accent-hover transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
