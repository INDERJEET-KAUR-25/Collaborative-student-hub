import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LayoutDashboard, LogIn, Briefcase, SearchCode, Plus, LogOut } from 'lucide-react';
import './Navbar.css';

import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex-between nav-content">
        <Link to="/" className="nav-brand">
          <div className="logo-icon-gradient">STUDENT HUB</div>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <div className="nav-menu">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                  <LayoutDashboard size={18} /> Projects
                </Link>
                <Link to="/peer-finder" className={`nav-link ${location.pathname === '/peer-finder' ? 'active' : ''}`}>
                  <SearchCode size={18} /> Peers
                </Link>
                <Link to="/workspace" className={`nav-link ${location.pathname.includes('/workspace') ? 'active' : ''}`}>
                  <Briefcase size={18} /> Workspace
                </Link>
                <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                  <User size={18} /> Profile
                </Link>
              </div>

              <div className="nav-actions">
                <ThemeToggle />
                <button className="btn btn-primary" onClick={() => navigate('/create-project')}>
                  <Plus size={18} /> New Project
                </button>
                <button className="btn btn-dark-gray" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-actions">
              <ThemeToggle />
              <Link to="/login" className="btn btn-primary">
                <LogIn size={18} /> Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
