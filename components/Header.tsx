import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  role: UserRole;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, role, userName }) => {
  return (
    <header className="bg-white border-b-2 border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 z-30 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-coha-900 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-coha-900 hidden sm:block">
          Circle of Hope Academy
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-coha-500 relative">
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 border-l-2 border-gray-200 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{userName || 'User'}</p>
            <p className="text-xs text-coha-500 font-medium uppercase tracking-wider">{role}</p>
          </div>
          <div className="w-10 h-10 bg-coha-900 text-white flex items-center justify-center font-bold text-lg">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};