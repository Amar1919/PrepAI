import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const TITLES = {
  "/dashboard": "Dashboard",
  "/chat": "AI Assistant",
  "/interviews": "Interview Prep",
  "/mock-interview": "Voice Mock",
  "/resume": "Resume Analyzer",
  "/dsa": "DSA Practice",
  "/companies": "Companies",
  "/profile": "Profile",
};

// This is the persistent app shell. It's mounted ONCE at the router level
// (wrapping an <Outlet/>), not re-created inside every page - that's what
// makes navigation feel like one continuous app instead of separate pages
// reloading their own sidebar/topbar each time.
function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || "PrepAI";

  return (
    <div className="min-h-screen flex bg-base-950">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto overflow-x-hidden">
          <div key={location.pathname} className="animate-page-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
