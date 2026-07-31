import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  User, 
  LogOut, 
  GraduationCap,
  Star
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      {isOpen && <div className="sidebar-overlay-mobile" onClick={onClose}></div>}
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <GraduationCap size={28} className="brand-logo-icon" />
          <span className="brand-name">STUDENT HUB</span>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section-label">MAIN SERVICES</div>
          
          <Link 
            to="/" 
            className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={20} className="menu-item-icon" />
            <span className="menu-item-text">Projects</span>
          </Link>

          <Link 
            to="/peer-finder" 
            className={`menu-item ${location.pathname === '/peer-finder' ? 'active' : ''}`}
            onClick={onClose}
          >
            <Users size={20} className="menu-item-icon" />
            <span className="menu-item-text">Peers</span>
          </Link>

          <Link 
            to="/workspace" 
            className={`menu-item ${location.pathname.includes('/workspace') ? 'active' : ''}`}
            onClick={onClose}
          >
            <Briefcase size={20} className="menu-item-icon" />
            <span className="menu-item-text">Workspace</span>
          </Link>

          <Link 
            to="/peer-reviews" 
            className={`menu-item ${location.pathname === '/peer-reviews' ? 'active' : ''}`}
            onClick={onClose}
          >
            <Star size={20} className="menu-item-icon" />
            <span className="menu-item-text">Reviews</span>
          </Link>

          <div className="menu-section-label" style={{ marginTop: '1.5rem' }}>USER PROFILE</div>

          <Link 
            to="/profile" 
            className={`menu-item ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            <User size={20} className="menu-item-icon" />
            <span className="menu-item-text">My Profile</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="menu-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} className="menu-item-icon" />
            <span className="menu-item-text">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
