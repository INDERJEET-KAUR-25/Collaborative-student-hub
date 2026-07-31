import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Search, 
  Users, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send, 
  Briefcase, 
  BookOpen, 
  Bell,
  Clock,
  Plus
} from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard statistics data
  const [projects, setProjects] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [appliedProjectIds, setAppliedProjectIds] = useState([]);
  const [activities, setActivities] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  
  // Filtering & loading states
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState({ status: 'All', difficulty: 'All', department: 'All' });
  const [showFilters, setShowFilters] = useState(false);
  const [matchOnly, setMatchOnly] = useState(false);

  // Apply Modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccessMsg, setAppSuccessMsg] = useState('');
  const [appErrorMsg, setAppErrorMsg] = useState('');

  // Manage Applications Modal state
  const [showManageModal, setShowManageModal] = useState(false);
  const [incomingApps, setIncomingApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (activeFilter.status !== 'All') params.status = activeFilter.status;
      if (activeFilter.difficulty !== 'All') params.difficulty = activeFilter.difficulty;
      if (activeFilter.department !== 'All') params.department = activeFilter.department;

      // 1. Fetch projects
      const projRes = await api.get('/projects/projects/', { params });
      setProjects(projRes.data);

      if (user) {
        // 2. Fetch student profiles (peers) count
        const studRes = await api.get('/auth/students/');
        setStudentsCount(studRes.data.length);

        // 3. Fetch own profile to check skills match
        try {
          const profileRes = await api.get('/auth/profile/');
          setMySkills(profileRes.data.skills || []);
        } catch (e) {
          console.error('Error fetching profile skills:', e);
        }

        // 4. Fetch assigned pending tasks count
        const taskRes = await api.get('/tasks/tasks/', { params: { assigned: 'true' } });
        const pending = taskRes.data.filter(t => t.status !== 'Completed').length;
        setPendingTasksCount(pending);

        // 5. Fetch my applications
        const appRes = await api.get('/applications/applications/');
        const ids = appRes.data.map(app => app.project);
        setAppliedProjectIds(ids);

        // 6. Fetch activities/notifications
        const notifRes = await api.get('/notifications/notifications/');
        setActivities(notifRes.data.slice(0, 5)); // show latest 5
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    initData();
  }, [searchTerm, activeFilter, user]);

  const handleOpenApplyModal = (project) => {
    setSelectedProject(project);
    setCoverLetter('');
    setAppSuccessMsg('');
    setAppErrorMsg('');
  };

  const handleCloseApplyModal = () => {
    setSelectedProject(null);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    setSubmittingApp(true);
    setAppErrorMsg('');
    setAppSuccessMsg('');

    try {
      const res = await api.post('/applications/applications/', {
        project: selectedProject.id,
        cover_letter: coverLetter
      });

      if (res.status === 201) {
        setAppSuccessMsg('Application submitted successfully!');
        setAppliedProjectIds([...appliedProjectIds, selectedProject.id]);
        // Refresh statistics
        fetchDashboardData();
        setTimeout(() => {
          handleCloseApplyModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setAppErrorMsg(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleOpenManageModal = async (project) => {
    setSelectedProject(project);
    setShowManageModal(true);
    setAppsLoading(true);
    setAppsError('');
    setIncomingApps([]);
    try {
      const res = await api.get('/applications/applications/', {
        params: { project: project.id }
      });
      setIncomingApps(res.data);
    } catch (err) {
      console.error('Error fetching incoming applications:', err);
      setAppsError(err.response?.data?.detail || 'Could not load incoming applications. Please try again.');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setSelectedProject(null);
    setIncomingApps([]);
    setAppsError('');
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      const res = await api.put(`/applications/applications/${appId}/`, { status });
      if (res.status === 200) {
        setIncomingApps(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
        fetchDashboardData(); // update stats
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const fullName = user?.user 
    ? `${user.user.first_name || user.user.username}`
    : 'Developer';

  // Find user-owned projects
  const myOwnedProjects = projects.filter(proj => user && proj.owner === user.user?.id);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Sneat Top Section: Greeting & Stats Grid */}
      <div className="dashboard-layout-grid">
        
        {/* Banner Greeting Widget */}
        <div className="greeting-card">
          <div className="greeting-content">
            <h2>Welcome Back, {fullName}! 🎉</h2>
            <p>
              You have <strong>{pendingTasksCount} pending tasks</strong> assigned in your active workspaces. 
              Find study partners, create teams, and deploy projects from your command center.
            </p>
            <Link to="/workspace" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Go to Workspace
            </Link>
          </div>
          <div className="greeting-illustration">
            <svg viewBox="0 0 200 200" className="illustration-svg">
              <defs>
                <linearGradient id="illustrationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#696cff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7e81ff" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#illustrationGrad)" />
              <path d="M60,140 L140,140 L130,90 L70,90 Z" fill="#2b2c40" stroke="#696cff" strokeWidth="3" />
              <rect x="75" y="100" width="50" height="30" rx="3" fill="#3e405b" />
              <circle cx="100" cy="70" r="18" fill="#ffab00" opacity="0.9" />
              <path d="M100,50 L85,62 L100,74 L115,62 Z" fill="#696cff" />
              <line x1="100" y1="74" x2="100" y2="90" stroke="#696cff" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Small Stats Grid Widgets */}
        <div className="stat-widgets-grid">
          
          {/* Card 1: Active Projects */}
          <div className="stat-widget-card">
            <div className="stat-header">
              <div className="stat-icon-wrapper purple">
                <Briefcase size={20} />
              </div>
              <span className="stat-trend positive">+12%</span>
            </div>
            <span className="stat-label">Active Projects</span>
            <span className="stat-value">{projects.length}</span>
          </div>

          {/* Card 2: Peer Finder Members */}
          <div className="stat-widget-card">
            <div className="stat-header">
              <div className="stat-icon-wrapper blue">
                <Users size={20} />
              </div>
              <span className="stat-trend positive">+8%</span>
            </div>
            <span className="stat-label">Peers Online</span>
            <span className="stat-value">{studentsCount}</span>
          </div>

          {/* Card 3: Pending Tasks */}
          <div className="stat-widget-card">
            <div className="stat-header">
              <div className="stat-icon-wrapper orange">
                <CheckCircle2 size={20} />
              </div>
              <span className={`stat-trend ${pendingTasksCount > 0 ? 'negative' : 'positive'}`}>
                {pendingTasksCount > 0 ? `${pendingTasksCount} Action` : 'Clean'}
              </span>
            </div>
            <span className="stat-label">Pending Tasks</span>
            <span className="stat-value">{pendingTasksCount}</span>
          </div>

          {/* Card 4: Applications Count */}
          <div className="stat-widget-card">
            <div className="stat-header">
              <div className="stat-icon-wrapper green">
                <Send size={20} />
              </div>
              <span className="stat-trend positive">Active</span>
            </div>
            <span className="stat-label">Applications</span>
            <span className="stat-value">{appliedProjectIds.length}</span>
          </div>

        </div>
      </div>

      {/* Sneat Query Toolbar Bar */}
      <div className="toolbar-section">
        <div className="search-bar-modern">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search hub initiatives, stacks, or developers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-center" style={{ gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/create-project')}>
            <Plus size={16} /> Create Project
          </button>
          
          <button 
            className={`btn ${showFilters ? 'btn-primary' : 'btn-dark-gray'}`} 
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Advanced Filters Dropdown */}
      {showFilters && (
        <div className="widget-panel animate-fade-in" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '1.25rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem' }}>Status</label>
            <select 
              className="input select-input" 
              value={activeFilter.status} 
              onChange={(e) => setActiveFilter({...activeFilter, status: e.target.value})}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem' }}>Difficulty</label>
            <select 
              className="input select-input" 
              value={activeFilter.difficulty} 
              onChange={(e) => setActiveFilter({...activeFilter, difficulty: e.target.value})}
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '0.8rem' }}>Department</label>
            <select 
              className="input select-input" 
              value={activeFilter.department} 
              onChange={(e) => setActiveFilter({...activeFilter, department: e.target.value})}
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
            </select>
          </div>

          {user && (
            <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ fontSize: '0.8rem' }}>Preferences</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)', height: '100%' }}>
                <input 
                  type="checkbox" 
                  checked={matchOnly} 
                  onChange={(e) => setMatchOnly(e.target.checked)} 
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <span>Match My Stack</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Main Sections: Cards (Left) & Widgets (Right) */}
      <div className="dashboard-main-section">
        
        {/* Left Column: Projects Grid */}
        <div className="project-list-wrapper">
          {loading ? (
            <div className="loading-state flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
              <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
              <p className="text-muted">Loading projects...</p>
            </div>
          ) : (
            <>
              {(() => {
                const filteredProjects = projects.filter(project => {
                  if (!matchOnly) return true;
                  const currentUserId = user?.user?.id ?? user?.id;
                  const isOwner = currentUserId != null && project.owner == currentUserId;
                  if (isOwner) return true;
                  if (!project.skills || project.skills.length === 0) return true;
                  const userSkillsLower = (mySkills || []).map(s => s.toLowerCase().trim());
                  const projectSkillsLower = (project.skills || []).map(s => s.toLowerCase().trim());
                  return projectSkillsLower.some(s => userSkillsLower.includes(s));
                });

                if (filteredProjects.length === 0) {
                  return (
                    <div className="no-results flex-center" style={{ height: '200px', flexDirection: 'column', gap: '0.5rem' }}>
                      <AlertCircle size={32} className="text-muted" />
                      <p className="text-muted">No projects found matching the criteria.</p>
                    </div>
                  );
                }

                return filteredProjects.map((project, index) => {
                  const hasApplied = appliedProjectIds.includes(project.id);
                  // Use == (loose equality) to handle possible number/string type mismatch from API responses
                  const currentUserId = user?.user?.id ?? user?.id;
                  const isOwner = currentUserId != null && project.owner == currentUserId;
                  
                  // Compare skills for compulsory tech stack check (OR condition: user needs at least one matching skill)
                  const userSkillsLower = (mySkills || []).map(s => s.toLowerCase().trim());
                  const projectSkillsLower = (project.skills || []).map(s => s.toLowerCase().trim());
                  const hasAtLeastOne = project.skills.length === 0 || projectSkillsLower.some(s => userSkillsLower.includes(s));
                  const isMissingSkills = !isOwner && !hasAtLeastOne;

                  const isFull = project.current_member_count >= project.team_size;

                  // Skill match score
                  const totalSkillsCount = project.skills ? project.skills.length : 0;
                  const matchedSkillsCount = project.skills ? project.skills.filter(s => userSkillsLower.includes(s.toLowerCase().trim())).length : 0;
                  const matchPercentage = totalSkillsCount > 0 ? Math.round((matchedSkillsCount / totalSkillsCount) * 100) : 100;

                  // Project Deadline countdown calculation
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const deadlineDate = new Date(project.deadline);
                  deadlineDate.setHours(0, 0, 0, 0);
                  const diffTime = deadlineDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isWithinWeek = diffDays >= 0 && diffDays <= 7;

                  return (
                    <SpotlightCard 
                      key={project.id} 
                      className="project-card-modern animate-fade-in" 
                      style={{ 
                        animationDelay: `${index * 0.05}s`,
                        ...(isFull && !isOwner ? { opacity: 0.55, filter: 'grayscale(0.3)' } : {})
                      }}
                    >
                      <div className="project-card-header">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <h3>{project.title}</h3>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                            {/* Match Percentage Badge */}
                            {user && !isOwner && project.skills.length > 0 && (
                              <span style={{ 
                                fontSize: '0.7rem', 
                                background: matchPercentage > 0 ? 'rgba(105, 108, 255, 0.08)' : 'rgba(255, 62, 29, 0.08)', 
                                color: matchPercentage > 0 ? 'var(--accent-primary)' : '#ff3e1d',
                                border: `1px solid ${matchPercentage > 0 ? 'rgba(105, 108, 255, 0.15)' : 'rgba(255, 62, 29, 0.15)'}`,
                                padding: '0.1rem 0.5rem', 
                                borderRadius: '20px',
                                fontWeight: 600
                              }}>
                                🎯 {matchPercentage}% Match
                              </span>
                            )}
                            {/* Applicant Density Badge */}
                            {project.applications_count !== undefined && (
                              <span style={{ 
                                fontSize: '0.7rem', 
                                background: project.applications_count >= 3 ? 'rgba(255, 171, 0, 0.08)' : 'rgba(113, 221, 55, 0.08)', 
                                color: project.applications_count >= 3 ? '#ffab00' : '#71dd37',
                                border: `1px solid ${project.applications_count >= 3 ? 'rgba(255, 171, 0, 0.15)' : 'rgba(113, 221, 55, 0.15)'}`,
                                padding: '0.1rem 0.5rem', 
                                borderRadius: '20px',
                                fontWeight: 600
                              }}>
                                {project.applications_count >= 3 ? `🔥 High Interest (${project.applications_count} apps)` : `🌱 Opportunity (${project.applications_count} app${project.applications_count === 1 ? '' : 's'})`}
                              </span>
                            )}
                            {/* Deadline Countdown Badge */}
                            {project.status === 'Open' && isWithinWeek && (
                              <span style={{ 
                                fontSize: '0.7rem', 
                                background: diffDays <= 2 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 171, 0, 0.08)', 
                                color: diffDays <= 2 ? '#ef4444' : '#ffab00',
                                border: `1px solid ${diffDays <= 2 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 171, 0, 0.15)'}`,
                                padding: '0.1rem 0.5rem', 
                                borderRadius: '20px',
                                fontWeight: 600
                              }}>
                                ⏳ {diffDays === 0 ? 'Closes Today' : diffDays === 1 ? 'Closes Tomorrow' : `Closes in ${diffDays} days`}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`status-badge-os ${project.status.toLowerCase().replace(' ', '-')}`}>
                          <span className="dot"></span> {project.status}
                        </span>
                      </div>
                      
                      <p className="project-desc">{project.description}</p>
                      
                      {project.skills && project.skills.length > 0 && (
                        <div className="tech-stack">
                          {project.skills.map(tech => (
                            <span key={tech} className="tech-badge">{tech}</span>
                          ))}
                        </div>
                      )}

                      {/* Member Count Badge */}
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        marginTop: '0.5rem', fontSize: '0.8rem', color: isFull ? '#ef4444' : 'var(--text-muted)' 
                      }}>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          background: isFull ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)', 
                          padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600,
                          border: `1px solid ${isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)'}`
                        }}>
                          👥 {project.current_member_count}/{project.team_size} members
                        </span>
                        {isFull && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444' }}>Team Full</span>}
                      </div>

                      {/* Compulsory Skills Warning Badge */}
                      {isMissingSkills && (
                        <div className="missing-skills-warning animate-fade-in" style={{ fontSize: '0.75rem', color: '#ff3e1d', marginTop: '0.5rem', background: 'rgba(255, 62, 29, 0.05)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 62, 29, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>⚠️ Requires at least one skill: {project.skills.join(', ')}</span>
                        </div>
                      )}

                      <div className="project-card-footer">
                        <div className="owner-info">
                          <div className="avatar-os">{project.owner_name ? project.owner_name.charAt(0).toUpperCase() : 'U'}</div>
                          <Link to={`/profile?id=${project.owner}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                            {project.owner_name || 'User'}
                          </Link>
                          {isOwner && <span style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem' }}>Owner</span>}
                        </div>
                        
                        <div className="flex-center" style={{ gap: '0.5rem' }}>
                          {isOwner ? (
                            <button className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }} onClick={() => handleOpenManageModal(project)}>Manage Apps</button>
                          ) : hasApplied ? (
                            <button className="btn btn-full" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', opacity: 0.6, cursor: 'not-allowed' }} disabled>Applied</button>
                          ) : isFull ? (
                            <button className="btn btn-full" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', opacity: 0.6, cursor: 'not-allowed', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} disabled>Capacity Full</button>
                          ) : project.status === 'Open' ? (
                            isMissingSkills ? (
                              <button 
                                className="btn btn-full" 
                                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', opacity: 0.5, cursor: 'not-allowed', color: '#ff3e1d', borderColor: 'rgba(255, 62, 29, 0.2)' }} 
                                title="You do not meet the required skills stack" 
                                disabled
                              >
                                Stack Unmet
                              </button>
                            ) : (
                              <button className="btn btn-electric-blue" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }} onClick={() => handleOpenApplyModal(project)}>Apply</button>
                            )
                          ) : (
                            <button className="btn btn-outline-blue" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }} disabled>Closed</button>
                          )}
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                });
              })()}
            </>
          )}
        </div>

        {/* Right Column: Sidebar Panels */}
        <div className="dashboard-sidebar-widgets">
          
          {/* Notifications Panel */}
          <div className="widget-panel">
            <h3>Recent Activities</h3>
            <div className="widget-list">
              {activities.map(act => (
                <div key={act.id} className="widget-item">
                  <div className="widget-icon-box">
                    <Clock size={14} className="text-secondary" />
                  </div>
                  <div className="widget-info">
                    <span className="widget-title">{act.message}</span>
                    <span className="widget-meta">{new Date(act.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="text-muted" style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  No recent activity updates.
                </div>
              )}
            </div>
          </div>

          {/* User Owned Projects Panel */}
          {myOwnedProjects.length > 0 && (
            <div className="widget-panel">
              <h3>My Initiatives</h3>
              <div className="widget-list">
                {myOwnedProjects.map(proj => (
                  <div key={proj.id} className="widget-item flex-between" style={{ padding: '0.5rem 0' }}>
                    <div className="widget-info">
                      <span className="widget-title">{proj.title}</span>
                      <span className="widget-meta">Capacity: {proj.current_member_count}/{proj.team_size} members</span>
                    </div>
                    <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleOpenManageModal(proj)}>
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Apply Modal */}
      {selectedProject && !showManageModal && (
        <div className="modal-overlay">
          <div className="modal-content-modern">
            <button className="close-btn" onClick={handleCloseApplyModal}>
              <X size={20} />
            </button>
            
            <h2 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Apply to Join</h2>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', fontSize: '1rem' }}>{selectedProject.title}</h4>

            {appSuccessMsg && (
              <div className="success-alert" style={{ background: 'var(--status-open-bg)', color: 'var(--status-open-text)', border: '1px solid var(--status-open-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <CheckCircle2 size={18} />
                <span>{appSuccessMsg}</span>
              </div>
            )}

            {appErrorMsg && (
              <div className="error-alert flex-center" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{appErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div className="input-group">
                <label>Cover Letter / Message *</label>
                <textarea 
                  className="input" 
                  rows="4" 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)} 
                  placeholder="Introduce yourself, your skills, and why you are interested in this project..."
                  required
                ></textarea>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-dark-gray" onClick={handleCloseApplyModal} disabled={submittingApp}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingApp}>
                  {submittingApp ? 'Submitting...' : 'Send Application'} <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Applications Modal */}
      {showManageModal && selectedProject && (
        <div className="modal-overlay">
          <div className="modal-content-modern" style={{ maxWidth: '600px' }}>
            <button className="close-btn" onClick={handleCloseManageModal}>
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Incoming Applications</h2>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', fontSize: '1rem' }}>{selectedProject.title}</h4>

            {appsLoading ? (
              <div className="flex-center" style={{ height: '150px' }}>
                <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : (
              <div style={{ maxHeight: '40vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                {appsError && (
                  <div className="error-alert" role="alert" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    {appsError}
                  </div>
                )}
                {incomingApps.map(app => (
                  <div key={app.id} className="widget-panel" style={{ padding: '1rem' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{app.student_name}</strong>
                      <span className={`status-badge-os ${app.status.toLowerCase()}`}>{app.status}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {app.cover_letter}
                    </p>
                    
                    <div className="flex-between" style={{ gap: '0.5rem', marginTop: '1rem' }}>
                      {/* Check Profile Link Button */}
                      <Link 
                        to={`/profile?id=${app.student}`} 
                        className="btn btn-outline" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', marginRight: 'auto' }}
                      >
                        Check Profile
                      </Link>

                      {app.status === 'Pending' && (
                        <div className="flex-center" style={{ gap: '0.5rem' }}>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #71dd37 0%, #85f048 100%)', boxShadow: 'none' }}
                            onClick={() => handleUpdateAppStatus(app.id, 'Accepted')}
                          >
                            Accept
                          </button>
                          <button 
                            className="btn btn-dark-gray" 
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)' }}
                            onClick={() => handleUpdateAppStatus(app.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {!appsError && incomingApps.length === 0 && (
                  <div className="text-muted" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                    No applications submitted for this project yet.
                  </div>
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-dark-gray" onClick={handleCloseManageModal}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
