import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Code2,
  LineChart,
  Download,
  ListChecks,
  UserCircle,
  Settings,
  LogOut,
  ChartColumnBig,
  Shield,
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarMenuOpen]);

  const studentNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Lessons', path: '/lessons', icon: BookOpen },
    { name: 'Exercises', path: '/exercises', icon: ListChecks },
    { name: 'Practice', path: '/practice', icon: Code2 },
    { name: 'Progress', path: '/progress', icon: LineChart },
    { name: 'Downloads', path: '/downloads', icon: Download },
  ];

  const adminNavLinks = [
    { name: 'Statistics', path: '/admin/statistics', icon: ChartColumnBig },
    { name: 'Courses', path: '/admin/lessons', icon: BookOpen },
    { name: 'Practice', path: '/admin/practice', icon: Code2 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Users', path: '/admin/users', icon: Shield },
  ];

  const navLinks = user?.role === 'admin' ? adminNavLinks : studentNavLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1f2838] bg-[#0f1117] text-text">
      <div className="mx-auto flex h-[76px] w-full max-w-[1400px] items-center px-4 md:px-6">
        <Link to="/" className="select-none">
          <p className="text-lg font-extrabold tracking-wide text-[#00e5cc]">Algonova </p>
        </Link>

        {!isAuthenticated ? (
          <div className="ml-auto flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-text-muted transition-colors hover:text-text">
              Login
            </Link>
            <Button
              to="/register"
              className="h-9 min-h-0 rounded-md bg-[#00e5cc] px-5 py-1.5 text-sm font-bold tracking-wide text-[#0f1117] shadow-none hover:bg-[#00cbb4]"
            >
              Sign Up
            </Button>
          </div>
        ) : (
          <>
            <nav className="ml-8 hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-[#00e5cc]/15 text-[#00e5cc]' : 'text-text-muted hover:bg-surface-hover hover:text-text'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="relative ml-auto hidden lg:block" ref={avatarRef}>
              <button
                onClick={() => setAvatarMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e5cc]/20 text-sm font-bold text-[#00e5cc] ring-1 ring-[#00e5cc]/40 transition-all hover:bg-[#00e5cc]/30 hover:ring-[#00e5cc]/60 focus:outline-none focus:ring-2 focus:ring-[#00e5cc]"
                aria-label="User menu"
              >
                {getInitials(user?.name ?? 'User')}
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[#1f2838] bg-[#0f1117] py-1 shadow-lg shadow-black/30">
                  <Link
                    to="/profile"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-[#1f2838] hover:text-[#00e5cc]"
                  >
                    <UserCircle size={16} />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-[#1f2838] hover:text-[#00e5cc]"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <hr className="my-1 border-[#1f2838]" />
                  <button
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-text-muted transition-colors hover:bg-[#1f2838] hover:text-red-400"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {isAuthenticated && (
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="ml-auto rounded-md p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>

      {isAuthenticated && mobileOpen && (
        <div className="border-t border-[#1f2838] bg-[#0f1117] px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#00e5cc]/15 text-[#00e5cc]' : 'text-text-muted hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  <link.icon size={16} />
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-2 flex flex-col gap-1 border-t border-[#1f2838] pt-2">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-[#1f2838] hover:text-[#00e5cc]"
              >
                <UserCircle size={16} />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-[#1f2838] hover:text-[#00e5cc]"
              >
                <Settings size={16} />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-text-muted transition-colors hover:bg-[#1f2838] hover:text-red-400"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
