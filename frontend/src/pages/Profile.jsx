import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Globe, Edit3, Save, X, Calendar, AlertCircle, Star } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const profileUserId = searchParams.get('id');

  const [profileData, setProfileData] = useState(null);
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [createdProjects, setCreatedProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = !profileUserId || (user && parseInt(profileUserId, 10) === user.user?.id);

  // Edit form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    year: '',
    bio: '',
    github: '',
    linkedin: '',
    availability: '',
    interests: '',
    resume: '',
    skills: ''
  });

  const fetchJoinedTeams = async () => {
    try {
      const params = profileUserId ? { user_id: profileUserId } : {};
      const res = await api.get('/teams/teams/my-teams/', { params });
      setJoinedTeams(res.data);
    } catch (err) {
      console.error('Error fetching joined teams:', err);
    }
  };

  const fetchCreatedProjects = async () => {
    try {
      const targetId = profileUserId || (user && user.user?.id);
      if (targetId) {
        const res = await api.get('/projects/projects/', { params: { owner: targetId } });
        setCreatedProjects(res.data);
      }
    } catch (err) {
      console.error('Error fetching created projects:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      if (isOwnProfile) {
        setProfileData(user);
      } else {
        const res = await api.get('/auth/profile/', { params: { user_id: profileUserId } });
        setProfileData(res.data);
      }
    } catch (err) {
      console.error('Error fetching target profile:', err);
      setErrorMsg('Failed to load profile details.');
    }
  };

  const fetchReviews = async () => {
    try {
      const targetId = profileUserId || (user && user.user?.id);
      if (targetId) {
        const res = await api.get('/api/auth/reviews/', { params: { user_id: targetId } });
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Error fetching received reviews:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchJoinedTeams(), fetchCreatedProjects(), fetchReviews()]);
      setLoading(false);
    };
    initData();
  }, [profileUserId, user]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.user?.first_name || '',
        lastName: profileData.user?.last_name || '',
        department: profileData.department || '',
        year: profileData.year || '',
        bio: profileData.bio || '',
        github: studentUrlFormat(profileData.github),
        linkedin: studentUrlFormat(profileData.linkedin),
        availability: profileData.availability || '',
        interests: profileData.interests || '',
        resume: studentUrlFormat(profileData.resume),
        skills: profileData.skills ? profileData.skills.join(', ') : ''
      });
    }
  }, [profileData]);

  const studentUrlFormat = (url) => {
    if (!url) return '';
    return url;
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setErrorMsg('');
    if (profileData) {
      setFormData({
        firstName: profileData.user?.first_name || '',
        lastName: profileData.user?.last_name || '',
        department: profileData.department || '',
        year: profileData.year || '',
        bio: profileData.bio || '',
        github: profileData.github || '',
        linkedin: profileData.linkedin || '',
        availability: profileData.availability || '',
        interests: profileData.interests || '',
        resume: profileData.resume || '',
        skills: profileData.skills ? profileData.skills.join(', ') : ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    const skillsArray = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      user: {
        first_name: formData.firstName,
        last_name: formData.lastName
      },
      department: formData.department,
      year: formData.year,
      bio: formData.bio,
      github: formData.github,
      linkedin: formData.linkedin,
      availability: formData.availability,
      interests: formData.interests,
      resume: formData.resume,
      skills: skillsArray
    };

    const res = await updateProfile(payload);
    if (res.success) {
      setIsEditing(false);
    } else {
      if (typeof res.error === 'object') {
        const firstErrorKey = Object.keys(res.error)[0];
        const firstErrorVal = res.error[firstErrorKey];
        const errMsgText = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
        setErrorMsg(`${firstErrorKey}: ${errMsgText}`);
      } else {
        setErrorMsg(res.error || 'Failed to update profile.');
      }
    }
    setSaving(false);
  };

  if (loading || !profileData) {
    return (
      <div className="container flex-center" style={{ height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  const userFullName = `${profileData.user?.first_name} ${profileData.user?.last_name}`.trim() || profileData.user?.username;
  const initials = (profileData.user?.first_name ? profileData.user?.first_name.charAt(0) : profileData.user?.username?.charAt(0) || 'U').toUpperCase();

  return (
    <div className="container profile-container animate-fade-in">
      {isEditing ? (
        <form onSubmit={handleSaveSubmit} className="glass-panel profile-edit-form" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <h2>Edit Profile</h2>
          
          {errorMsg && (
            <div className="error-alert flex-center">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-row split-2" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>First Name</label>
              <input type="text" className="input" name="firstName" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>Last Name</label>
              <input type="text" className="input" name="lastName" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row split-2" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>Department</label>
              <select className="input select-input" name="department" value={formData.department} onChange={handleChange}>
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
              </select>
            </div>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>Academic Year</label>
              <input type="text" className="input" name="year" placeholder="e.g. 3rd Year" value={formData.year} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Bio</label>
            <textarea className="input" name="bio" rows="3" placeholder="Tell us about yourself..." value={formData.bio} onChange={handleChange}></textarea>
          </div>

          <div className="form-row split-2" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>GitHub Profile URL</label>
              <input type="url" className="input" name="github" placeholder="https://github.com/..." value={formData.github} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>LinkedIn Profile URL</label>
              <input type="url" className="input" name="linkedin" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row split-2" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>Availability Status</label>
              <input type="text" className="input" name="availability" placeholder="e.g. 10 hours/week, Weekends only" value={formData.availability} onChange={handleChange} />
            </div>
            <div className="input-group" style={{ flex: 1, margin: 0 }}>
              <label>Resume URL</label>
              <input type="url" className="input" name="resume" placeholder="Link to PDF/Google Drive..." value={formData.resume} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Interests (comma separated)</label>
            <input type="text" className="input" name="interests" placeholder="e.g. Web Apps, Blockchain, AI/ML" value={formData.interests} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Tech Stack & Skills (comma separated)</label>
            <input type="text" className="input" name="skills" placeholder="e.g. React, Python, Django, CSS" value={formData.skills} onChange={handleChange} />
          </div>

          <div className="form-actions flex-between" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={handleCancelClick} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="profile-header glass-panel">
            <div className="profile-info">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-details">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h1>{userFullName}</h1>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>@{profileData.user?.username}</span>
                </div>
                <p className="bio" style={{ margin: '0.5rem 0' }}>{profileData.bio || "No biography added yet."}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {profileData.github && (
                    <a href={profileData.github} target="_blank" rel="noreferrer" className="github-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                      <Globe size={16} /> GitHub Profile
                    </a>
                  )}
                  {profileData.linkedin && (
                    <a href={profileData.linkedin} target="_blank" rel="noreferrer" className="github-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                      <Globe size={16} /> LinkedIn Profile
                    </a>
                  )}
                  {profileData.resume && (
                    <a href={profileData.resume} target="_blank" rel="noreferrer" className="github-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                      <Globe size={16} /> Resume Link
                    </a>
                  )}
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <button className="btn btn-outline edit-btn" onClick={handleEditClick}>
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>

          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="glass-panel skills-panel">
                <h3>Department & Year</h3>
                <p style={{ marginBottom: '1rem' }}>{profileData.department || 'Not Specified'} &bull; {profileData.year || 'Not Specified'}</p>

                <h3>Availability</h3>
                <p style={{ marginBottom: '1rem' }}>{profileData.availability || 'Not Specified'}</p>

                <h3>Interests</h3>
                <p style={{ marginBottom: '1rem' }}>{profileData.interests || 'Not Specified'}</p>

                <h3>Tech Stack & Skills</h3>
                <div className="skills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {profileData.skills && profileData.skills.length > 0 ? (
                    profileData.skills.map(skill => (
                      <span key={skill} className="tag tag-primary">{skill}</span>
                    ))
                  ) : (
                    <span className="text-muted text-sm">No skills added yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-main" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h2>Created Projects</h2>
                <div className="user-projects" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {createdProjects.map(project => (
                    <div key={project.id} className="card project-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{project.title}</h3>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className={`status-badge-os ${project.status.toLowerCase().replace(' ', '-')}`}>
                            <span className="dot"></span> {project.status}
                          </span>
                          &bull; Difficulty: {project.difficulty}
                        </p>
                      </div>
                    </div>
                  ))}

                  {createdProjects.length === 0 && (
                    <div className="card text-muted flex-center" style={{ height: '100px', flexDirection: 'column', justifyContent: 'center' }}>
                      <p>{isOwnProfile ? "You haven't created any projects yet." : "This student hasn't created any projects yet."}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2>Projects Joined</h2>
                <div className="user-projects" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {joinedTeams.map(team => (
                    <div key={team.id} className="card project-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{team.project_title}</h3>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> Joined: {new Date(team.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {joinedTeams.length === 0 && (
                    <div className="card text-muted flex-center" style={{ height: '100px', flexDirection: 'column', justifyContent: 'center' }}>
                      <p>{isOwnProfile ? "You haven't joined any projects yet." : "This student hasn't joined any projects yet."}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2>Peer Endorsements</h2>
                <div className="user-projects" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {reviews.map(rev => (
                    <div key={rev.id} className="card project-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                      <div className="flex-between">
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Reviewed by: {rev.reviewer_name}</span>
                        <div style={{ display: 'flex', gap: '0.1rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={12} 
                              fill={rev.rating >= star ? 'var(--accent-secondary)' : 'none'} 
                              color={rev.rating >= star ? 'var(--accent-secondary)' : 'var(--text-muted)'} 
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <div className="card text-muted flex-center" style={{ height: '100px', flexDirection: 'column', justifyContent: 'center' }}>
                      <p>No peer reviews received yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
