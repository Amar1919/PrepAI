import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiMessageSquare,
  FiFileText,
  FiCode,
  FiBriefcase,
  FiMic,
  FiUser,
  FiLogOut,
  FiZap,
  FiMessageCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/chat", label: "AI Assistant", icon: FiMessageCircle },
  { to: "/interviews", label: "Interview Prep", icon: FiMessageSquare },
  { to: "/mock-interview", label: "Voice Mock", icon: FiMic },
  { to: "/resume", label: "Resume Analyzer", icon: FiFileText },
  { to: "/dsa", label: "DSA Practice", icon: FiCode },
  { to: "/companies", label: "Companies", icon: FiBriefcase },
  { to: "/profile", label: "Profile", icon: FiUser },
];

function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 shrink-0 z-40
          bg-base-900 border-r border-base-700 flex flex-col
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-base-700">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-violet-glow flex items-center justify-center shrink-0">
            <FiZap className="text-white" size={16} />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">PrepAI</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-accent-500/15 text-accent-400 border border-accent-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-base-800 border border-transparent"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-base-700">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: user?.avatarColor || "#6366f1" }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150"
          >
            <FiLogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
