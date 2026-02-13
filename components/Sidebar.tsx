import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, LogOut, X, FileText, Settings } from 'lucide-react';
import { UserRole } from '../types';
import { getPendingActionCounts } from '../services/dataService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, role, onLogout }) => {
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    // Only fetch counts if Admin
    if (role === UserRole.ADMIN) {
      const fetchCounts = async () => {
        const counts = await getPendingActionCounts();
        setBadgeCount(counts.total);
      };
      fetchCounts();
      
      // Optional: Refresh counts every minute
      const interval = setInterval(fetchCounts, 60000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Applications', path: '/admin/applications', icon: <FileText size={20} />, badge: badgeCount },
    { label: 'Teachers', path: '/admin/teachers', icon: <Users size={20} /> },
    { label: 'Students', path: '/admin/students', icon: <GraduationCap size={20} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const teacherLinks = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'My Classes', path: '/teacher/classes', icon: <GraduationCap size={20} /> },
  ];

  const parentLinks = [
    { label: 'Student Info', path: '/parent/dashboard', icon: <Users size={20} /> },
  ];

  let links = parentLinks;
  if (role === UserRole.ADMIN) links = adminLinks;
  if (role === UserRole.TEACHER) links = teacherLinks;

  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-72 bg-coha-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col h-full ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  } lg:translate-x-0 lg:static shadow-xl`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        <div className="flex flex-col items-center justify-center p-6 border-b border-coha-800 shrink-0 text-center relative">
            <button onClick={onClose} className="lg:hidden text-white absolute top-4 right-4">
                <X size={24} />
            </button>
            <div className="bg-white p-2 rounded-full mb-3">
                <img 
                    src="https://i.ibb.co/LzYXwYfX/logo.png" 
                    alt="COHA Logo" 
                    className="w-12 h-12 object-contain"
                />
            </div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">Circle of Hope Academy</h1>
            <p className="text-[10px] uppercase tracking-widest text-coha-300 font-bold mt-1">Accessible Education for All</p>
        </div>

        <nav className="mt-4 px-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 transition-colors ${
                      isActive 
                        ? 'bg-coha-500 text-white font-semibold border-l-4 border-white' 
                        : 'text-gray-300 hover:bg-coha-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {/* Badge */}
                  {(link as any).badge > 0 && (
                     <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {(link as any).badge}
                     </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="w-full p-4 border-t border-coha-800 shrink-0">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-300 hover:text-white hover:bg-coha-800 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};