import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  LineChart,
  MessageSquare,
  UserCircle,
  Settings,
  X,
  House,
  ChartColumnBig,
  LifeBuoy,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarNavItem {
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  path: string;
  end?: boolean;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Lessons', icon: BookOpen, path: '/lessons' },
  { label: 'Practice', icon: Code2, path: '/practice' },
  { label: 'Progress', icon: LineChart, path: '/progress' },
  { label: 'AI Assistant', icon: MessageSquare, path: '/assistant' },
];

const bottomNavItems: SidebarNavItem[] = [
  { label: 'Profile', icon: UserCircle, path: '/profile' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const adminNavItems: SidebarNavItem[] = [
  { label: 'Home', icon: House, path: '/admin/dashboard', end: true },
  { label: 'Statistics', icon: ChartColumnBig, path: '/admin/statistics' },
  { label: 'Courses', icon: BookOpen, path: '/admin/lessons' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Admin', icon: Shield, path: '/admin/users' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdminPage = user?.role === 'admin';

  const primaryItems = isAdminPage ? adminNavItems : navItems;

  const linkClasses = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all
    ${isActive
      ? isAdminPage
        ? 'bg-surface-hover text-text border border-primary/40'
        : 'bg-primary/10 text-primary'
      : 'text-text-muted hover:text-text hover:bg-surface-hover'}
  `;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border lg:hidden">
          <div>
            <span className="font-bold text-xl tracking-tight">
              Algo<span className="text-primary">nova</span>
            </span>
          </div>
          <button title="Close sidebar" onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text rounded-md hover:bg-surface-hover">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <div className="mb-3 px-2">
            <p className="text-lg font-bold">Algonova Dashboard</p>
           <p className="text-[11px] uppercase tracking-wider text-text-muted">Algorithm Architect</p>
          </div>

          <div className="text-xs font-semibold text-text-muted mb-2 px-2 uppercase tracking-wider">
            {isAdminPage ? 'Admin Menu' : 'Learning'}
          </div>
          {primaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={linkClasses}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          {!isAdminPage ? (
            <>
              <div className="mt-8 mb-2 px-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Account</div>
              {bottomNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={linkClasses}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </>
          ) : (
            <div className="mt-auto space-y-1 pt-8">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-text-muted transition-all hover:bg-surface-hover hover:text-text">
                <LifeBuoy size={18} />
                Help
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-text-muted transition-all hover:bg-surface-hover hover:text-text"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
