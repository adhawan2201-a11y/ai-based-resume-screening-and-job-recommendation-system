import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobListPage from './pages/JobListPage';
import JobDetailPage from './pages/JobDetailPage';
import ChatbotPage from './pages/ChatbotPage';
import AdminDashboard from './pages/AdminDashboard';
import TeamPage from './pages/TeamPage';

/**
 * Global Loading Screen
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 text-lg font-medium">Initializing AI System...</p>
      </div>
    </div>
  );
}

/**
 * Protects routes that require authentication
 */
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  
  return children;
}

/**
 * Redirects logged-in users away from auth pages
 */
function RedirectIfLoggedIn({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'recruiter') return <Navigate to="/recruiter-dashboard" replace />;
    return <Navigate to="/candidate-dashboard" replace />;
  }
  
  return children;
}

import { useLocation } from 'react-router-dom';

function AppRoutes() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={`bg-[#0f172a] ${showNavbar ? 'min-h-[calc(100vh-72px)]' : 'min-h-screen'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={
            <RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>
          } />
          
          <Route path="/register" element={
            <RedirectIfLoggedIn><RegisterPage /></RedirectIfLoggedIn>
          } />
          
          <Route path="/candidate-dashboard" element={
            <ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>
          } />
          
          <Route path="/recruiter-dashboard" element={
            <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
          } />
          
          <Route path="/jobs" element={
            <ProtectedRoute><JobListPage /></ProtectedRoute>
          } />
          
          <Route path="/jobs/:id" element={
            <ProtectedRoute><JobDetailPage /></ProtectedRoute>
          } />
          
          <Route path="/chatbot" element={
            <ProtectedRoute><ChatbotPage /></ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          
          <Route path="/team" element={<TeamPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
