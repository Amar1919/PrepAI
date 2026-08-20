import { Component } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

// Catches render-time errors anywhere below it in the tree so a bug in one
// page shows a recovery screen instead of a blank white page - important
// for a live demo where you can't just check the console.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <FiAlertTriangle size={24} />
            </div>
            <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              An unexpected error occurred. Reloading usually fixes this.
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary mx-auto">
              <FiRefreshCw size={15} /> Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
