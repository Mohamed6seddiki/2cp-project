import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Code2,
  LineChart,
  Download,
  UserCircle,
  Settings,
} from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, getHomePath } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Lessons', path: '/lessons', icon: BookOpen },
    { name: 'Practice', path: '/practice', icon: Code2 },
    { name: 'Progress', path: '/progress', icon: LineChart },
    { name: 'Downloads', path: '/downloads', icon: Download },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

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
            <Link to="/auth/login" className="text-sm font-semibold text-text-muted transition-colors hover:text-text">
              Login
            </Link>
            <Button
              to="/auth/register"
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

            <div className="ml-auto hidden items-center gap-3 lg:flex">
              <button
                onClick={() => navigate(getHomePath())}
                className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#00e5cc]" />
                {user?.name ?? 'User'}
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
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
            <button
              onClick={handleLogout}
              className="mt-2 rounded-md border border-border px-3 py-2 text-left text-sm font-semibold text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
