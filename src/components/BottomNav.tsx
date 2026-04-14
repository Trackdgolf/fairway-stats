import { useState } from "react";
import { Home, BarChart3, Target, MapPin, Menu, GraduationCap, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "./NavLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const BottomNav = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/stats", icon: BarChart3, label: "Stats" },
    { to: "/clubs", icon: Target, label: "Clubs" },
    { to: "/courses", icon: MapPin, label: "Courses" },
  ];

  const moreItems = [
    { to: "/golf-school", icon: GraduationCap, label: "Golf School" },
    { to: "/achievements", icon: Trophy, label: "Achievements" },
  ];

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50"
        style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center flex-1 py-2 text-muted-foreground transition-colors"
              activeClassName="text-primary"
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 text-muted-foreground transition-colors"
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-1">
            {moreItems.map((item) => (
              <button
                key={item.to}
                onClick={() => {
                  setMoreOpen(false);
                  navigate(item.to);
                }}
                className="flex items-center gap-4 w-full px-4 py-4 rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <item.icon className="w-6 h-6 text-primary" />
                <span className="text-base font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNav;
