import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { username, isAdmin, logout } = useAuth();
  const initials = username ? username.slice(0, 2).toUpperCase() : "QM";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.110 200), oklch(0.75 0.120 195))",
            }}
          >
            <Brain
              className="w-4.5 h-4.5"
              style={{ color: "oklch(0.09 0.038 264)" }}
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            QuizMaster
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="text-xs font-semibold tracking-wide text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-md border border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              data-ocid="header.admin_link"
            >
              Admin Panel
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-full py-1.5 px-3 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all focus:outline-none"
              data-ocid="header.user_dropdown"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{
                    background: "oklch(0.82 0.110 200 / 0.2)",
                    color: "oklch(0.82 0.110 200)",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground max-w-[120px] truncate hidden sm:block">
                {username || "User"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 cursor-pointer"
                  data-ocid="header.dashboard_link"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="header.admin_panel_link"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                data-ocid="header.logout_button"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
