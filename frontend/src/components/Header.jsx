import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, LogOut, User, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/notifications/');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put('/notifications/notifications/', { notification_id: id });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (!user) return null;

  const initials = user.user
    ? (user.user.first_name ? user.user.first_name.charAt(0) : user.user.username.charAt(0)).toUpperCase()
    : 'U';
  const fullName = user.user 
    ? `${user.user.first_name} ${user.user.last_name}`.trim() || user.user.username
    : 'Student User';

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <button className="sidebar-toggle-btn" onClick={onMenuClick} aria-label="Toggle Menu">
          <Menu size={22} />
        </button>
        <div className="search-box-header">
          <Search size={18} className="search-icon-header" />
          <input 
            type="text" 
            placeholder="Search dashboard... (Ctrl+/)" 
            disabled 
            style={{ cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <div className="header-right">
        <ThemeToggle />
        
        {/* Interactive Notifications Bell */}
        <div className="user-dropdown-wrapper">
          <button 
            className="action-btn notifications-btn" 
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setDropdownOpen(false);
            }} 
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {notifDropdownOpen && (
            <>
              <div className="dropdown-overlay" onClick={() => setNotifDropdownOpen(false)}></div>
              <div className="dropdown-menu-header notifications-dropdown glass-panel animate-fade-in">
                <div className="dropdown-notif-header flex-between">
                  <strong>Notifications</strong>
                  {unreadCount > 0 && (
                    <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <hr className="dropdown-divider" style={{ margin: 0 }} />
                
                <div className="notif-list-scroll">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`notif-item-header ${!notif.is_read ? 'unread' : ''}`}>
                      <div className="notif-content-wrapper">
                        <span className="notif-message-text">{notif.message}</span>
                        <div className="notif-meta-row flex-between">
                          <span className="notif-time-text">
                            <Clock size={10} /> {new Date(notif.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                          </span>
                          {!notif.is_read && (
                            <button 
                              className="mark-single-read-btn flex-center"
                              onClick={() => handleMarkAsRead(notif.id)}
                              title="Mark as read"
                            >
                              <CheckCircle size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="notif-empty-text">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="user-dropdown-wrapper">
          <button 
            className="avatar-btn" 
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifDropdownOpen(false);
            }}
            aria-label="User profile menu"
          >
            <div className="header-avatar">{initials}</div>
          </button>

          {dropdownOpen && (
            <>
              <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)}></div>
              <div className="dropdown-menu-header glass-panel animate-fade-in">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">{initials}</div>
                  <div className="user-details">
                    <span className="user-name">{fullName}</span>
                    <span className="user-role">Student</span>
                  </div>
                </div>
                <hr className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <User size={16} /> My Profile
                </Link>
                <hr className="dropdown-divider" />
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
