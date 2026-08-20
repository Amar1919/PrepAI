import { FiMenu, FiZap, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function Topbar({ onMenuClick, title }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-base-950/80 backdrop-blur-md border-b border-base-700">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white p-1.5 -ml-1.5 rounded-lg hover:bg-base-800"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-slate-100 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="badge">
          <FiTrendingUp className="text-orange-400" size={14} />
          <span>{user?.streak?.current || 0} day streak</span>
        </div>
        <div className="badge">
          <FiZap className="text-accent-400" size={14} />
          <span>{user?.xp || 0} XP</span>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
