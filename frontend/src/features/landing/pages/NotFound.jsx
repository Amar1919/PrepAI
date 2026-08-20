import { Link } from "react-router-dom";
import { FiHome, FiAlertCircle } from "react-icons/fi";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 bg-grid-fade px-4">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-base-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <FiAlertCircle size={26} />
        </div>
        <h1 className="text-2xl font-bold text-white">404</h1>
        <p className="text-slate-400 mt-1 mb-6">This page doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <FiHome size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
