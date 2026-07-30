import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PlusCircle, Save, AlertCircle } from 'lucide-react';
import './CreateProject.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Computer Science', // default select value
    deadline: '',
    team_size: 2,
    difficulty: 'Beginner',
    required_skills: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    // Format skills from string list (comma-separated) to a JSON array list of strings
    const skillsList = formData.required_skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      title: formData.title,
      description: formData.description,
      department: formData.department,
      deadline: formData.deadline || null,
      team_size: parseInt(formData.team_size, 10),
      difficulty: formData.difficulty,
      skills_list: skillsList
    };

    try {
      const res = await api.post('/projects/projects/', payload);
      if (res.status === 201) {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      if (typeof err.response?.data === 'object') {
        const firstErrorKey = Object.keys(err.response.data)[0];
        const firstErrorVal = err.response.data[firstErrorKey];
        const errorContent = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
        setErrorMsg(`${firstErrorKey}: ${errorContent}`);
      } else {
        setErrorMsg('Failed to create project. Please verify the input values.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="create-project-header">
        <h1>Create a New Project</h1>
        <p>Start a new initiative and recruit talented peers from your university.</p>
      </div>

      <div className="glass-panel form-card">
        {errorMsg && (
          <div className="error-alert flex-center" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-row">
            <div className="input-group full-width">
              <label>Project Title *</label>
              <input type="text" className="input" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. AI Study Assistant" />
            </div>
          </div>
          
          <div className="input-group">
            <label>Description *</label>
            <textarea className="input" name="description" value={formData.description} onChange={handleChange} required rows="4" placeholder="Describe the problem, goals, and what you are building..."></textarea>
          </div>

          <div className="form-row split-2">
            <div className="input-group">
              <label>Department *</label>
              <select className="input select-input" name="department" value={formData.department} onChange={handleChange} required>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
              </select>
            </div>
            <div className="input-group">
              <label>Difficulty</label>
              <select className="input select-input" name="difficulty" value={formData.difficulty} onChange={handleChange}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-row split-2">
            <div className="input-group">
              <label>Deadline *</label>
              <input type="date" className="input" name="deadline" value={formData.deadline} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Team Size *</label>
              <input type="number" className="input" name="team_size" value={formData.team_size} onChange={handleChange} min="1" max="10" required />
            </div>
          </div>

          <div className="input-group">
            <label>Required Skills (comma separated)</label>
            <input type="text" className="input" name="required_skills" value={formData.required_skills} onChange={handleChange} placeholder="e.g. React, Python, UI/UX" />
          </div>

          <div className="form-actions flex-between mt-4">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={18} /> {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
