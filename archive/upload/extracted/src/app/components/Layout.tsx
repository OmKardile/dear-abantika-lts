import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Flower2, BookOpen, Droplet, Settings } from "lucide-react";
import { motion } from "motion/react";

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/cycle", icon: Flower2, label: "Cycle" },
    { path: "/journal", icon: BookOpen, label: "Journal" },
    { path: "/hydration", icon: Droplet, label: "Water" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div 
      className="min-h-screen pb-24"
      style={{ 
        background: "var(--app-background)",
        color: "var(--app-text)"
      }}
    >
      <Outlet />
      
      {/* Floating Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-6 left-4 right-4 z-50"
      >
        <div 
          className="rounded-[28px] px-4 py-3 shadow-lg backdrop-blur-xl"
          style={{ 
            backgroundColor: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)"
          }}
        >
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl"
                      style={{ backgroundColor: "var(--app-surface-variant)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10">
                    <Icon
                      size={22}
                      style={{
                        color: isActive ? "var(--app-primary)" : "var(--app-secondary)",
                        strokeWidth: isActive ? 2.5 : 2
                      }}
                    />
                  </div>
                  <span
                    className="relative z-10 text-xs transition-colors"
                    style={{
                      color: isActive ? "var(--app-primary)" : "var(--app-secondary)",
                      fontWeight: isActive ? 600 : 500
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </div>
  );
};
