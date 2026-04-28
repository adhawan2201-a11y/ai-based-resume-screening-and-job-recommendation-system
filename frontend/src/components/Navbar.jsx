import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { FiLogOut, FiUser, FiBriefcase, FiMessageSquare, FiHome } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center border border-white/10 group-hover:border-primary-500/50 transition-colors">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-white tracking-tight">AI Resume System</h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {user.role === 'candidate' && (
                <>
                  <NavLink to="/candidate-dashboard" icon={<FiHome />} label="Dashboard" />
                  <NavLink to="/jobs" icon={<FiBriefcase />} label="Jobs" />
                  <NavLink to="/chatbot" icon={<FiMessageSquare />} label="AI Chat" />
                </>
              )}
              {user.role === 'recruiter' && (
                <>
                  <NavLink to="/recruiter-dashboard" icon={<FiHome />} label="Dashboard" />
                  <NavLink to="/jobs" icon={<FiBriefcase />} label="All Jobs" />
                  <NavLink to="/chatbot" icon={<FiMessageSquare />} label="AI Chat" />
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <NavLink to="/admin-dashboard" icon={<FiHome />} label="Admin Panel" />
                  <NavLink to="/jobs" icon={<FiBriefcase />} label="Jobs" />
                  <NavLink to="/chatbot" icon={<FiMessageSquare />} label="AI Chat" />
                </>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-dark-800/60 rounded-xl px-3 py-2 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-dark-400 leading-tight capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-dark-400 hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10"
                >
                  <FiLogOut />
                  <span className="hidden sm:inline text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/" className="text-sm text-dark-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5">
                  Home
                </Link>
                <Link to="/team" className="text-sm text-dark-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5">
                  Team
                </Link>
                <Link to="/login" className="text-sm text-dark-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5">
                  Login
                </Link>
                <Link to="/register" className="gradient-btn text-sm !py-2 !px-4 ml-2">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-dark-300 hover:text-white p-2"
              >
                {mobileOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && user && (
          <div className="md:hidden pb-4 border-t border-white/5 pt-4 animate-fade-in">
            {user.role === 'candidate' && (
              <>
                <MobileNavLink to="/candidate-dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/jobs" label="Browse Jobs" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/chatbot" label="AI Chat" onClick={() => setMobileOpen(false)} />
              </>
            )}
            {user.role === 'recruiter' && (
              <>
                <MobileNavLink to="/recruiter-dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/jobs" label="All Jobs" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/chatbot" label="AI Chat" onClick={() => setMobileOpen(false)} />
              </>
            )}
            {user.role === 'admin' && (
              <>
                <MobileNavLink to="/admin-dashboard" label="Admin Panel" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/jobs" label="All Jobs" onClick={() => setMobileOpen(false)} />
                <MobileNavLink to="/chatbot" label="AI Chat" onClick={() => setMobileOpen(false)} />
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 text-sm text-dark-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block text-dark-300 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
    >
      {label}
    </Link>
  );
}
