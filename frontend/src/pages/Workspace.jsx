import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, Plus, Calendar, Clock, AlertCircle, X, AlignLeft, CheckCircle2 } from 'lucide-react';
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

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeId: '', deadline: '' });

  const fetchMyTeams = async () => {
    try {
      const res = await api.get('/teams/teams/my-teams/');
      setTeams(res.data);
      if (res.data.length > 0) {
        setActiveTeam(res.data[0]);
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
    }
  }, [activeTeam]);

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
    
    // Status mapping from UI to Django choices: 'To Do' -> 'To_do', 'In Progress' -> 'In Progress', 'Completed' -> 'Completed'
    let dbStatus = newStatus;
    if (newStatus === 'To Do') dbStatus = 'To_do';

    try {
      // Update local state optimistic render
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: dbStatus } : t));
      
      await api.put(`/tasks/tasks/${taskId}/`, { status: dbStatus });
      // Refresh notifications/activities
      fetchNotifications();
    } catch (err) {
      console.error('Failed to update task status:', err);
      // Revert if API failed
      fetchTasksAndMembers(activeTeam);
    }
  };

  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title || !activeTeam) return;

    try {
      const payload = {
        team: activeTeam.id,
        title: newTask.title,
        description: newTask.description,
        status: 'To_do',
        deadline: newTask.deadline || null
      };

      if (newTask.assigneeId) {
        payload.assigned_to = parseInt(newTask.assigneeId, 10);
      }

      const res = await api.post('/tasks/tasks/', payload);
      if (res.status === 201) {
        setTasks([res.data, ...tasks]);
        setIsModalOpen(false);
        setNewTask({ title: '', description: '', assigneeId: '', deadline: '' });
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error creating task:', err);
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
      <div className="container flex-center" style={{ height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <p className="text-muted">Loading workspace...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="container flex-center" style={{ height: '400px', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
        <AlertCircle size={48} className="text-muted" />
        <div>
          <h2>No Joined Projects</h2>
          <p className="text-muted">You are not a member of any project teams yet. Apply to projects on the dashboard first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container workspace-kanban animate-fade-in">
      <div className="workspace-header flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h1>Sprint Board:</h1>
            <select 
              className="input select-input" 
              style={{ fontSize: '1.25rem', fontWeight: 600, width: 'auto', background: 'transparent', border: 'none', color: 'var(--accent-primary)', paddingRight: '2rem', cursor: 'pointer' }}
              value={activeTeam ? activeTeam.id : ''} 
              onChange={(e) => setActiveTeam(teams.find(t => t.id === parseInt(e.target.value, 10)))}
            >
              {teams.map(t => (
                <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.project_title}</option>
              ))}
            </select>
          </div>
          <p>Drag and drop tasks across columns to update their status.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Task
        </button>
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

      <div className="kanban-layout">
        {/* Kanban Board */}
        {tasksLoading ? (
          <div className="kanban-board flex-center" style={{ minHeight: '300px', flex: 3 }}>
            <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <div className="kanban-board">
            {uiColumns.map(column => {
              const columnTasks = getTasksForColumn(column);
              
              return (
                <div 
                  key={column} 
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column)}
                >
                  <div className="column-header">
                    <h3>{column}</h3>
                    <span className="task-count">{columnTasks.length}</span>
                  </div>
                  
                  <div className="column-content" style={{ minHeight: '300px' }}>
                    {columnTasks.map(task => {
                      const assigneeInitial = task.assigned_to_name ? task.assigned_to_name.charAt(0).toUpperCase() : 'U';
                      
                      return (
                        <div 
                          key={task.id} 
                          className="task-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                        >
                          <div className="task-badges flex-between">
                            <span className="task-date">
                              <Calendar size={12}/> {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : 'No Deadline'}
                            </span>
                          </div>
                          <h4>{task.title}</h4>
                          {task.description && <p className="task-desc"><AlignLeft size={12}/> {task.description}</p>}
                          <div className="task-footer flex-between">
                            <div className="assignee-tag">
                              <div className="assignee-avatar">{assigneeInitial}</div>
                              {task.assigned_to ? (
                                <Link to={`/profile?id=${task.assigned_to}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                                  {task.assigned_to_name}
                                </Link>
                              ) : (
                                <span>Unassigned</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {columnTasks.length === 0 && (
                      <div className="empty-column-text" style={{ padding: '2rem 1rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Activity Feed Sidebar */}
        <div className="activity-sidebar">
          <h3>Notifications</h3>
          <div className="feed-list" style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {activities.map(act => (
              <div key={act.id} className="feed-item" style={{ alignItems: 'flex-start' }}>
                <div className="feed-avatar" style={{ marginTop: '0.2rem' }}><Clock size={14} /></div>
                <div className="feed-content">
                  <p>{act.message}</p>
                  <span className="feed-time">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-muted" style={{ padding: '1rem 0', textAlign: 'center', fontSize: '0.85rem' }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <div className="modal-header flex-between">
              <h2>Create New Task</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddTaskSubmit}>
              <div className="input-group">
                <label>Task Title *</label>
                <input 
                  type="text" 
                  required 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})} 
                  className="input"
                  placeholder="e.g. Set up API database connections"
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  value={newTask.description} 
                  onChange={e => setNewTask({...newTask, description: e.target.value})} 
                  className="input"
                  placeholder="Detail the work to be done..."
                ></textarea>
              </div>
              <div className="form-row split-2" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ flex: 1, margin: 0 }}>
                  <label>Assignee</label>
                  <select 
                    value={newTask.assigneeId} 
                    onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} 
                    className="input select-input"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.student}>{member.username}</option>
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
