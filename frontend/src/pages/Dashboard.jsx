import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, Users, ChevronDown, CheckCircle2, AlertCircle, X, Send } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState({ status: 'All', difficulty: 'All', department: 'All' });
  const [showFilters, setShowFilters] = useState(false);

  // Apply Modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccessMsg, setAppSuccessMsg] = useState('');
  const [appErrorMsg, setAppErrorMsg] = useState('');

  const fetchProjects = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (activeFilter.status !== 'All') params.status = activeFilter.status;
      if (activeFilter.difficulty !== 'All') params.difficulty = activeFilter.difficulty;
      if (activeFilter.department !== 'All') params.department = activeFilter.department;
      
      const res = await api.get('/projects/projects/', { params });
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchApplications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/applications/applications/');
      // Map to project IDs that current user has already applied to
      const ids = res.data.map(app => app.project);
      setAppliedProjectIds(ids);
    } catch (err) {
      console.error('Error fetching user applications:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchApplications()]);
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
        setTimeout(() => {
          handleCloseApplyModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Application submission error:', err);
      setAppErrorMsg(err.response?.data?.detail || 'Failed to submit application. You may have already applied.');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Manage Applications state
  const [showManageModal, setShowManageModal] = useState(false);
  const [incomingApps, setIncomingApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const handleOpenManageModal = async (project) => {
    setSelectedProject(project);
    setShowManageModal(true);
    setAppsLoading(true);
    try {
      const res = await api.get('/applications/applications/', {
        params: { project: project.id }
      });
      setIncomingApps(res.data);
    } catch (err) {
      console.error('Error fetching incoming applications:', err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setSelectedProject(null);
    setIncomingApps([]);
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      const res = await api.put(`/applications/applications/${appId}/`, { status });
      if (res.status === 200) {
        // Update local list status
        setIncomingApps(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  return (
    <div className="container animate-fade-in dashboard-os">
      <div className="dashboard-header flex-between">
        <div>
          <h1>Active Projects</h1>
          <p>Find and collaborate on cutting-edge student initiatives.</p>
        </div>
      </div>

      <div className="query-section">
        <div className="search-bar-os">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by project title, description, or required skills..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-chips">
          <div className="chip dropdown-chip" onClick={() => setShowFilters(!showFilters)}>
            Filters & Sorting {showFilters ? '▲' : '▼'}
          </div>

          {activeFilter.status !== 'All' && (
            <div className="chip active-chip" onClick={() => setActiveFilter({...activeFilter, status: 'All'})}>
              Status: {activeFilter.status} ✕
            </div>
          )}
          {activeFilter.difficulty !== 'All' && (
            <div className="chip active-chip" onClick={() => setActiveFilter({...activeFilter, difficulty: 'All'})}>
              Difficulty: {activeFilter.difficulty} ✕
            </div>
          )}
          {activeFilter.department !== 'All' && (
            <div className="chip active-chip" onClick={() => setActiveFilter({...activeFilter, department: 'All'})}>
              Dept: {activeFilter.department} ✕
            </div>
          )}
        </div>

        {showFilters && (
          <div className="filters-dropdown glass-panel animate-fade-in" style={{ display: 'flex', gap: '1rem', padding: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem' }}>Project Status</label>
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
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
          <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          <p className="text-muted">Loading projects...</p>
        </div>
      ) : (
        <div className="project-grid-os">
          {projects.map((project, index) => {
            const hasApplied = appliedProjectIds.includes(project.id);
            const isOwner = user && project.owner === user.user?.id;
            
            return (
              <div key={project.id} className="card-os project-card animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="project-card-header flex-between">
                  <h3>{project.title}</h3>
                  <span className={`status-badge-os ${project.status.toLowerCase().replace(' ', '-')}`}>
                    <span className="dot"></span> {project.status}
                  </span>
                </div>
                
                <p className="project-desc">{project.description}</p>
                
                {project.skills && project.skills.length > 0 && (
                  <div className="tech-stack-os">
                    {project.skills.map(tech => (
                      <span key={tech} className="tag-os">{tech}</span>
                    ))}
                  </div>
                )}

                <div className="project-metadata" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  <div className="team-capacity" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} className="capacity-icon" />
                    <span>Capacity: {project.current_member_count || 0}/{project.team_size} members</span>
                  </div>
                  <div className="difficulty-badge">
                    <span>Difficulty: <strong>{project.difficulty}</strong></span>
                  </div>
                </div>

                <div className="project-card-footer flex-between">
                  <div className="owner-info">
                    <div className="avatar-os">{project.owner_name ? project.owner_name.charAt(0).toUpperCase() : 'U'}</div>
                    <Link to={`/profile?id=${project.owner}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                      {project.owner_name || 'User'}
                    </Link>
                    {isOwner && <span style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem' }}>Owner</span>}
                  </div>
                  
                  {isOwner ? (
                    <button className="btn btn-primary" onClick={() => handleOpenManageModal(project)}>Manage Apps</button>
                  ) : hasApplied ? (
                    <button className="btn btn-full" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>Applied</button>
                  ) : project.current_member_count >= project.team_size ? (
                    <button className="btn btn-full" style={{ opacity: 0.6, cursor: 'not-allowed', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} disabled>Capacity Full</button>
                  ) : project.status === 'Open' ? (
                    <button className="btn btn-electric-blue" onClick={() => handleOpenApplyModal(project)}>Apply</button>
                  ) : (
                    <button className="btn btn-outline-blue" disabled>Closed</button>
                  )}
                </div>
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="no-results flex-center" style={{ gridColumn: '1 / -1', height: '200px', flexDirection: 'column', gap: '0.5rem' }}>
              <AlertCircle size={32} className="text-muted" />
              <p className="text-muted">No projects found matching the criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {selectedProject && !showManageModal && (
        <div className="modal-overlay flex-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button className="btn-icon" onClick={handleCloseApplyModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ marginBottom: '0.5rem' }}>Apply to Join</h2>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>{selectedProject.title}</h4>

            {appSuccessMsg && (
              <div className="success-alert" style={{ background: 'var(--status-emerald-bg)', color: 'var(--status-emerald-text)', border: '1px solid var(--status-emerald-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={18} />
                <span>{appSuccessMsg}</span>
              </div>
            )}

            {appErrorMsg && (
              <div className="error-alert flex-center" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} />
                <span>{appErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div className="input-group">
                <label>Cover Letter / Message *</label>
                <textarea 
                  className="input" 
                  rows="5" 
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
        <div className="modal-overlay flex-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content glass-panel animate-fade-in manage-apps-modal" style={{ width: '90%', maxWidth: '600px', padding: '2rem', position: 'relative', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <button className="btn-icon" onClick={handleCloseManageModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            
            <h2 style={{ marginBottom: '0.25rem' }}>Project Applications</h2>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>{selectedProject.title}</h4>

            {appsLoading ? (
              <div className="flex-center" style={{ padding: '3rem 0' }}>
                <div className="spinner" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : (
              <div className="applications-list" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
                {incomingApps.map(app => (
                  <div key={app.id} className="card-os" style={{ margin: 0, padding: '1.25rem', gap: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="avatar-os">{app.student_name ? app.student_name.charAt(0).toUpperCase() : 'U'}</div>
                        <div>
                          <Link to={`/profile?id=${app.student}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
                            {app.student_name}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <span className={`status-badge-os ${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                      {app.cover_letter || 'No message provided.'}
                    </div>

                    {app.status === 'Pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                          onClick={() => handleUpdateAppStatus(app.id, 'Rejected')}
                        >
                          Reject
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => handleUpdateAppStatus(app.id, 'Accepted')}
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {incomingApps.length === 0 && (
                  <div className="text-muted flex-center" style={{ padding: '3rem 0', flexDirection: 'column', gap: '0.5rem' }}>
                    <Users size={24} />
                    <p>No applications received for this project yet.</p>
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
