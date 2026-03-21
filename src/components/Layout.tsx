import { NavLink, Outlet } from "react-router-dom";
import { Activity, BarChart3, Box, Leaf, Network, Menu, X, Map } from "lucide-react";
import { useState } from "react";

// Added /hotspots to match the new route in App.tsx
const NAV_ITEMS = [
  { to: "/", icon: Activity, label: "Mission Control" },
  { to: "/network", icon: Network, label: "Sensor Network" },
  { to: "/twin", icon: Box, label: "3D Digital Twin" },
  { to: "/analysis", icon: BarChart3, label: "Emission Analysis" },
  { to: "/hotspots", icon: Map, label: "Emission Hotspots" }, // New Item
  { to: "/interventions", icon: Leaf, label: "Interventions" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden grid-bg">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-card border-r flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="font-display text-lg font-black neon-text tracking-tighter uppercase">ECO TWIN</h1>
          <p className="text-[10px] text-muted-foreground mt-1 tracking-[0.2em] uppercase font-bold opacity-70">Urban Carbon Intelligence</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary neon-border shadow-[0_0_15px_rgba(0,230,118,0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* System Status Indicator */}
        <div className="p-4 border-t border-border">
          <div className="glass-card p-3 rounded-lg border border-white/5 bg-black/20">
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">System Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00e676]" />
              <span className="text-[10px] text-primary font-black uppercase tracking-tighter">All Systems Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-auto scrollbar-thin">
        <header className="sticky top-0 z-30 glass-card border-b px-6 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-foreground p-1">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="font-display text-sm neon-text font-black uppercase tracking-widest">ECO TWIN</h1>
          <div className="w-5" />
        </header>
        
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}