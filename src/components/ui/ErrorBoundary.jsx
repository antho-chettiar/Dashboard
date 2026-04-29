import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Swap this for Sentry / Datadog when you have error monitoring set up
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="flex items-center justify-center p-6 rounded-xl border"
            style={{
              borderColor: 'rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.06)',
              minHeight: '120px',
            }}
          >
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                This section failed to load
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                className="text-xs mt-3 px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary