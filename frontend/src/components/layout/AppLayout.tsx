import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';
import ChatWidget from '../chat/ChatWidget';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isPublicPage =
    !isAuthenticated ||
    location.pathname === '/' ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register');

  // If public page, we render a different layout
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-background text-text flex flex-col selection:bg-primary/30">
        <Navbar />
        <main className="flex-1 flex flex-col relative w-full overflow-hidden">
          <Outlet />
        </main>
        <ChatWidget />
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="min-h-screen bg-background text-text flex flex-col selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 lg:p-10">
          <Outlet />
        </div>
      </main>
      <ChatWidget />
    </div>
  );
};

export default AppLayout;
