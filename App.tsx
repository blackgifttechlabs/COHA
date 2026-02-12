import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ApplyPage } from './pages/ApplyPage';
import { AdminDashboard } from './pages/admin/Dashboard';
import { TeachersPage } from './pages/admin/Teachers';
import { StudentsPage } from './pages/admin/Students';
import { StudentDetailsPage } from './pages/admin/StudentDetails';
import { ApplicationsPage } from './pages/admin/Applications';
import { ApplicationDetailsPage } from './pages/admin/ApplicationDetails';
import { SettingsPage } from './pages/admin/Settings';
import { UserRole } from './types';
import { seedAdminUser, getAdminProfile } from './services/dataService';
import { Toast } from './components/ui/Toast';

// Layout Component to wrap protected routes
const AppLayout: React.FC<{ 
  children: React.ReactNode; 
  role: UserRole; 
  user: any; 
  onLogout: () => void 
}> = ({ children, role, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex font-sans overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        role={role}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          role={role}
          userName={user?.name}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{
  isAuthenticated: boolean;
  userRole: UserRole | null;
  allowedRoles: UserRole[];
  children: React.ReactNode;
}> = ({ isAuthenticated, userRole, allowedRoles, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // Seed admin on app load
    seedAdminUser();
    
    // Check if admin is currently active to refresh profile name
    if (user && role === UserRole.ADMIN) {
        getAdminProfile().then(profile => {
            setUser((prev: any) => ({...prev, name: profile.name}));
        });
    }
  }, []);

  const handleLogin = (newRole: UserRole, newUser: any) => {
    setUser(newUser);
    setRole(newRole);
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  return (
    <>
      <Toast 
        message={toastMessage} 
        isVisible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} showToast={showToast} />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute isAuthenticated={!!user} userRole={role} allowedRoles={[UserRole.ADMIN]}>
              <AppLayout role={UserRole.ADMIN} user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="applications" element={<ApplicationsPage />} />
                  <Route path="applications/:id" element={<ApplicationDetailsPage />} />
                  <Route path="teachers" element={<TeachersPage />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="students/:id" element={<StudentDetailsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Teacher Routes - Placeholders */}
          <Route path="/teacher/*" element={
            <ProtectedRoute isAuthenticated={!!user} userRole={role} allowedRoles={[UserRole.TEACHER]}>
              <AppLayout role={UserRole.TEACHER} user={user} onLogout={handleLogout}>
                <div className="p-8 text-center text-gray-500">Teacher Dashboard Content Here</div>
              </AppLayout>
            </ProtectedRoute>
          } />

           {/* Parent Routes - Placeholders */}
           <Route path="/parent/*" element={
            <ProtectedRoute isAuthenticated={!!user} userRole={role} allowedRoles={[UserRole.PARENT]}>
               <AppLayout role={UserRole.PARENT} user={user} onLogout={handleLogout}>
                <div className="p-8 text-center text-gray-500">Parent Dashboard Content Here</div>
              </AppLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </HashRouter>
    </>
  );
};

export default App;