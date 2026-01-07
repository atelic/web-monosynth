import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  name: string
}

interface State {
  hasError: boolean
}

export class VisualizerErrorBoundary extends Component<Props, State> {
  state = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn(`Visualizer error in ${this.props.name}:`, error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-ableton-surface rounded-lg flex items-center justify-center text-ableton-text-muted text-xs p-2">
          {this.props.name} unavailable
        </div>
      )
    }
    return this.props.children
  }
}
