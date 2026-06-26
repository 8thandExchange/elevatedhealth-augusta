import { useNavigate, useLocation } from "react-router-dom";
import { Home, Heart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", path: "/patient/dashboard" },
  { icon: Heart, label: "My Care", path: "/patient/hormone-journey" },
  { icon: MessageCircle, label: "Messages", path: "/consult" },
  { icon: User, label: "Profile", path: "/patient/dashboard" },
];

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-95",
              isActive(tab.path) 
                ? "text-accent" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className={cn(
              "w-5 h-5 transition-all",
              isActive(tab.path) && "scale-110"
            )} />
            <span className={cn(
              "text-[10px] font-inter font-medium",
              isActive(tab.path) && "font-semibold"
            )}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomTabBar;
