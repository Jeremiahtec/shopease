import { Component } from 'react';

/** Last line of defence: a crash in any component shows a friendly page instead of a blank screen. */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ShopEase crashed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-6 text-center">
        <img src="/logo.png" alt="ShopEase" className="h-9 w-auto" />
        <h1 className="text-2xl font-extrabold text-slate-900">Something went wrong</h1>
        <p className="max-w-sm text-sm text-slate-500">
          An unexpected error stopped this page from loading. Your cart and account are safe. Reloading usually fixes it.
        </p>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Reload page
          </button>
          <a href="/" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Go to marketplace
          </a>
        </div>
      </div>
    );
  }
}
