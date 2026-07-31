import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, Plus, Calendar, Clock, AlertCircle, X, AlignLeft, CheckCircle2 } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import './Workspace.css';

const Workspace = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Tab management: 'created' or 'joined'
  const [activeTab, setActiveTab] = useState('created');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '', deadline: '' });

  const fetchMyTeams = async () => {
    try {
      const res = await api.get('/teams/teams/my-teams/');
      
      // Enrich each team with the project status
      const enrichedTeams = await Promise.all(res.data.map(async (team) => {
        try {
          const projRes = await api.get(`/projects/projects/${team.project}/`);
          return { ...team, projectStatus: projRes.data.status };
        } catch {
          return { ...team, projectStatus: 'Open' };
        }
      }));
      
      setTeams(enrichedTeams);
      
      // Auto-select active tab and active team based on availability
      const createdList = enrichedTeams.filter(t => t.project_owner === user?.user?.id);
      const joinedList = enrichedTeams.filter(t => t.project_owner !== user?.user?.id);
      
      if (createdList.length > 0) {
        setActiveTab('created');
        setActiveTeam(createdList[0]);
      } else if (joinedList.length > 0) {
        setActiveTab('joined');
        setActiveTeam(joinedList[0]);
      } else {
        setActiveTeam(null);
      }
    } catch (err) {
      console.error('Error fetching my teams:', err);
    }
  };

  const fetchTasksAndMembers = async (team) => {
    if (!team) return;
    setTasksLoading(true);
    try {
      // 1. Fetch tasks
      const tasksRes = await api.get('/tasks/tasks/', { params: { project: team.project } });
      setTasks(tasksRes.data);

      // 2. Fetch team members (so we can assign tasks to them)
      const teamDetailRes = await api.get(`/teams/teams/project/${team.project}/`);
      setTeamMembers(teamDetailRes.data.members || []);
    } catch (err) {
      console.error('Error fetching tasks or team details:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/notifications/');
      setActivities(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchMyTeams();
      await fetchNotifications();
      setLoading(false);
    };
    initData();
  }, [user]);

  useEffect(() => {
    if (activeTeam) {
      fetchTasksAndMembers(activeTeam);
    } else {
      setTasks([]);
      setTeamMembers([]);
    }
  }, [activeTeam]);

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnStatus) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = parseInt(taskIdStr, 10);
    if (isNaN(taskId)) return;

    const dbStatusMap = {
      'To Do': 'To_do',
      'In Progress': 'In Progress',
      'Completed': 'Completed'
    };
    const dbStatus = dbStatusMap[columnStatus] || columnStatus;

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: dbStatus } : t));

    try {
      await api.put(`/tasks/tasks/${taskId}/`, { status: dbStatus });
      fetchNotifications(); // reload activities feed
    } catch (err) {
      console.error('Error updating task status via drag-and-drop:', err);
      // Revert if error
      if (activeTeam) fetchTasksAndMembers(activeTeam);
    }
  };

  // Submit new task
  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!activeTeam) return;

    try {
      const res = await api.post('/tasks/tasks/', {
        team: activeTeam.id,
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigneeId || null,
        deadline: newTask.deadline || null
      });

      if (res.status === 201) {
        setTasks(prev => [res.data, ...prev]);
        setIsModalOpen(false);
        setNewTask({ title: '', description: '', assigneeId: '', deadline: '' });
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  // Change task status handler (To_do, In Progress, Completed)
  const handleChangeTaskStatus = async (taskId, newStatus) => {
    const dbStatusMap = { 'To Do': 'To_do', 'In Progress': 'In Progress', 'Completed': 'Completed' };
    const dbStatus = dbStatusMap[newStatus] || newStatus;

    // Optimistic UI update for live progress bar
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: dbStatus } : t));

    try {
      await api.put(`/tasks/tasks/${taskId}/`, { status: dbStatus });
      fetchNotifications();
    } catch (err) {
      console.error('Error updating task status:', err);
      if (activeTeam) fetchTasksAndMembers(activeTeam);
    }
  };

  // Change project status handler (Owner only)
  const handleChangeProjectStatus = async (newStatus) => {
    if (!activeTeam) return;
    try {
      await api.put(`/projects/projects/${activeTeam.project}/`, { status: newStatus });
      // Update local team data to reflect the change
      setTeams(prev => prev.map(t => t.id === activeTeam.id ? { ...t, projectStatus: newStatus } : t));
      fetchNotifications();
    } catch (err) {
      console.error('Error updating project status:', err);
    }
  };

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Status lists
  const uiColumns = ['To Do', 'In Progress', 'Completed'];
  
  const getTasksForColumn = (colName) => {
    const dbColName = colName === 'To Do' ? 'To_do' : colName;
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.assigned_to_name && t.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase()));
      return t.status === dbColName && matchesSearch;
    });
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <p className="text-muted">Loading workspace...</p>
      </div>
    );
  }

  // Filter lists of teams
  const createdTeams = teams.filter(t => t.project_owner === user?.user?.id);
  const joinedTeams = teams.filter(t => t.project_owner !== user?.user?.id);
  const activeTabTeams = activeTab === 'created' ? createdTeams : joinedTeams;
  const isOwnerOfActive = activeTeam && activeTeam.project_owner === user?.user?.id;

  // Compile assignee list: merge teamMembers (from detail fetch) with activeTeam.members (from my-teams)
  const getAssigneeCandidates = () => {
    if (!activeTeam) return [];
    
    // Use teamMembers from the detail fetch; fall back to activeTeam.members from my-teams API
    const membersList = teamMembers.length > 0 ? teamMembers : (activeTeam.members || []);
    
    const seen = new Set();
    const list = [];
    
    // Always include project owner first
    if (activeTeam.project_owner) {
      seen.add(activeTeam.project_owner);
      list.push({
        studentId: activeTeam.project_owner,
        username: `${activeTeam.project_owner_name || 'Owner'} (Owner)`
      });
    }
    
    // Add all team members (skip owner to avoid duplicate)
    membersList.forEach(m => {
      if (!seen.has(m.student)) {
        seen.add(m.student);
        list.push({
          studentId: m.student,
          username: m.username
        });
      }
    });
    return list;
  };
  const assigneeCandidates = getAssigneeCandidates();

  return (
    <div className="workspace-kanban animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Workspace Division Selector (Tabs) */}
      <div className="workspace-tabs-wrapper" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button 
          className={`btn ${activeTab === 'created' ? 'btn-primary' : 'btn-dark-gray'}`}
          onClick={() => {
            setActiveTab('created');
            if (createdTeams.length > 0) {
              setActiveTeam(createdTeams[0]);
            } else {
              setActiveTeam(null);
            }
          }}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
        >
          Projects Created ({createdTeams.length})
        </button>
        <button 
          className={`btn ${activeTab === 'joined' ? 'btn-primary' : 'btn-dark-gray'}`}
          onClick={() => {
            setActiveTab('joined');
            if (joinedTeams.length > 0) {
              setActiveTeam(joinedTeams[0]);
            } else {
              setActiveTeam(null);
            }
          }}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
        >
          Projects Joined ({joinedTeams.length})
        </button>
      </div>

      {/* Main Board Layout */}
      {!activeTeam ? (
        <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <AlertCircle size={48} className="text-muted" />
          <div>
            <h2>No Workspace Sprints</h2>
            <p className="text-muted">
              {activeTab === 'created' 
                ? "You haven't created any projects yet. Go to the dashboard to initiate a project."
                : "You haven't joined any project teams yet. Apply to open projects on the dashboard."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="workspace-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <h1>Sprint Board:</h1>
                <select 
                  className="input select-input" 
                  style={{ fontSize: '1.25rem', fontWeight: 600, width: 'auto', background: 'transparent', border: 'none', color: 'var(--accent-primary)', paddingRight: '2rem', cursor: 'pointer' }}
                  value={activeTeam.id} 
                  onChange={(e) => setActiveTeam(teams.find(t => t.id === parseInt(e.target.value, 10)))}
                >
                  {activeTabTeams.map(t => (
                    <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.project_title}</option>
                  ))}
                </select>
              </div>
              <p>Use the status selector on each task card to update progress.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Project Status Control (Owner only) */}
              {isOwnerOfActive && (
                <select
                  className="input select-input"
                  value={activeTeam.projectStatus || 'Open'}
                  onChange={(e) => handleChangeProjectStatus(e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    color: activeTeam.projectStatus === 'Completed' ? '#71dd37' 
                         : activeTeam.projectStatus === 'Terminated' ? '#ff3e1d' 
                         : activeTeam.projectStatus === 'In Progress' ? '#ffab00' 
                         : 'var(--accent-primary)',
                    borderColor: activeTeam.projectStatus === 'Completed' ? '#71dd37' 
                               : activeTeam.projectStatus === 'Terminated' ? '#ff3e1d' 
                               : activeTeam.projectStatus === 'In Progress' ? '#ffab00' 
                               : 'var(--border-color)'
                  }}
                >
                  <option value="Open">🟢 Open</option>
                  <option value="In Progress">🟡 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                  <option value="Terminated">🔴 Terminated</option>
                </select>
              )}
              {/* Show Add Task ONLY if logged in user is the Project Owner */}
              {isOwnerOfActive && (
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={18} /> Add Task
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-banner">
            <div className="progress-text flex-between">
              <strong>Sprint Progress</strong>
              <span>{progressPercent}% Completed • {completedTasks}/{totalTasks} Tasks Done</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="workspace-toolbar flex-between">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search tasks or assignees..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="kanban-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
            {uiColumns.map(col => {
              const columnTasks = getTasksForColumn(col);
              
              return (
                <div 
                  key={col} 
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col)}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}
                >
                  <div className="column-header flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{col}</span>
                    <span className="count-badge" style={{ fontSize: '0.75rem', background: 'var(--border-color)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>{columnTasks.length}</span>
                  </div>

                  <div className="column-tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                    {tasksLoading ? (
                      <div className="flex-center" style={{ height: '100px' }}>
                        <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <div 
                          key={task.id} 
                          className="kanban-card card animate-fade-in"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          style={{ padding: '1rem', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                        >
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{task.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{task.description}</p>
                          
                          <div className="card-footer" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div className="flex-between">
                              <div className="assignee flex-center" style={{ gap: '0.35rem' }}>
                                <div className="avatar-os" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>
                                  {task.assigned_to_name ? task.assigned_to_name.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.assigned_to_name || 'Unassigned'}</span>
                              </div>
                              {task.deadline && (
                                <div className="deadline flex-center" style={{ gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <Clock size={12} />
                                  <span>{new Date(task.deadline).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                </div>
                              )}
                            </div>
                            {/* Task Status Selector */}
                            <select
                              className="input select-input"
                              value={task.status === 'To_do' ? 'To Do' : task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleChangeTaskStatus(task.id, e.target.value);
                              }}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%',
                                color: task.status === 'Completed' ? '#71dd37' 
                                     : task.status === 'In Progress' ? '#ffab00' 
                                     : 'var(--text-secondary)',
                                background: task.status === 'Completed' ? 'rgba(113, 221, 55, 0.06)' 
                                          : task.status === 'In Progress' ? 'rgba(255, 171, 0, 0.06)' 
                                          : 'transparent'
                              }}
                            >
                              <option value="To Do">📋 To Do</option>
                              <option value="In Progress">🔨 In Progress</option>
                              <option value="Completed">✅ Completed</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Task Creation Modal */}
      {isModalOpen && activeTeam && (
        <div className="modal-overlay">
          <div className="modal-content-modern" style={{ maxWidth: '450px' }}>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Add Sprint Task</h2>
            
            <form onSubmit={handleCreateTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label>Task Title *</label>
                <input 
                  type="text" 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})} 
                  placeholder="e.g. Implement login frontend design" 
                  className="input" 
                  required
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label>Description</label>
                <textarea 
                  value={newTask.description} 
                  onChange={e => setNewTask({...newTask, description: e.target.value})} 
                  placeholder="Describe task details, expected outputs..." 
                  className="input" 
                  rows="3"
                ></textarea>
              </div>

              <div className="flex-between" style={{ gap: '1rem' }}>
                <div className="input-group" style={{ flex: 1, margin: 0 }}>
                  <label>Assignee</label>
                  <select 
                    value={newTask.assigneeId} 
                    onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} 
                    className="input select-input"
                  >
                    <option value="">Select teammate...</option>
                    {assigneeCandidates.map(candidate => (
                      <option key={candidate.studentId} value={candidate.studentId}>{candidate.username}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1, margin: 0 }}>
                  <label>Deadline</label>
                  <input 
                    type="date" 
                    value={newTask.deadline} 
                    onChange={e => setNewTask({...newTask, deadline: e.target.value})} 
                    className="input"
                  />
                </div>
              </div>
              
              <div className="modal-footer flex-end" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-dark-gray" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
