import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Building2, FileText, Bot, Settings, LogOut, LogIn, Menu, User, ChevronRight, Shield } from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Properties", path: "/properties" },
  { icon: FileText, label: "Transactions", path: "/transactions" },
  { icon: Bot, label: "AI Assistant", path: "/assistant" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const loginUrl = `/api/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/oauth/callback`)}&response_type=code&scope=profile&state=${btoa(`${window.location.origin}/api/oauth/callback`)}`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Transfer.app</h1>
          <p className="text-xs text-gray-500">UK Property Transactions</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
              <item.icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-gray-400"}`} />
              {item.label}
              {active && <ChevronRight className="w-4 h-4 ml-auto text-emerald-500" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t">
        {isLoading ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1"><div className="h-3 bg-gray-200 rounded animate-pulse w-20" /></div>
          </div>
        ) : isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                {user.avatar ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : <User className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email || "No email"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500 hover:text-gray-700" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </div>
        ) : (
          <a href={loginUrl}><Button variant="default" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
            <LogIn className="w-4 h-4 mr-2" /> Sign in
          </Button></a>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0"><SidebarContent /></SheetContent>
      </Sheet>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
