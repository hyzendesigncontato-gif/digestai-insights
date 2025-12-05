import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Activity, 
  Apple,
  Utensils,
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat DigestAI' },
  { to: '/reports', icon: FileText, label: 'Relatórios' },
  { to: '/symptoms', icon: Activity, label: 'Meus Sintomas' },
  { to: '/food-log', icon: Utensils, label: 'Diário Alimentar' },
  { to: '/foods', icon: Apple, label: 'Alimentos Seguros' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export function AppSidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden bg-background/80 backdrop-blur-sm shadow-sm border border-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="DigestAI" className="w-10 h-10 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg text-sidebar-foreground">DigestAI</h1>
              <p className="text-xs text-sidebar-foreground/60">Sistema Intestinal</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle (Desktop) */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute -right-3 top-20 hidden lg:flex bg-sidebar border border-sidebar-border rounded-full shadow-md hover:bg-sidebar-accent"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-3 w-3 text-sidebar-foreground" />
        </Button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "sidebar-item",
                  isActive && "sidebar-item-active"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
                {!isCollapsed && (
                  <span className="animate-fade-in truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 mb-4 animate-fade-in">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-sidebar-foreground">
                    {user.fullName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
              isCollapsed && "justify-center px-0"
            )}
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
