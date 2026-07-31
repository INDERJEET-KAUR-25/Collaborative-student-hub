import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Globe, Mail, AlertCircle } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import './PeerFinder.css';

const PeerFinder = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const fetchCurrentUserProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setCurrentUserProfile(res.data);
    } catch (e) {
      // Unauthenticated views should handle silently
      console.error('Error fetching current user profile:', e);
    }
  };

  const fetchStudents = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterDept) params.department = filterDept;

      const res = await api.get('/auth/students/', { params });
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      fetchStudents().then(() => setLoading(false));
    }, 300); // debounce API requests

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterDept]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="peer-header">
        <h1>Peer Finder</h1>
        <p>Discover talented students to collaborate with on your next big idea.</p>
      </div>

      <div className="filters-bar glass-panel flex-between">
        <div className="search-bar-peer">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, bio or interests..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select className="input select-input" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Business">Business</option>
          <option value="Design">Design</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
          <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          <p className="text-muted">Loading peers...</p>
        </div>
      ) : (
        <div className="peer-grid">
          {students.map((student, index) => {
            const fullName = student.user 
              ? `${student.user.first_name} ${student.user.last_name}`.trim() || student.user.username
              : 'Unknown User';
            const initials = student.user 
              ? (student.user.first_name ? student.user.first_name.charAt(0) : student.user.username.charAt(0)).toUpperCase()
              : 'U';

            // Calculate common stack crossover
            const parseInterests = (instr) => {
              if (!instr) return [];
              return instr.split(',').map(item => item.trim().toLowerCase()).filter(Boolean);
            };
            const isSelf = currentUserProfile && currentUserProfile.user?.id === student.user?.id;
            const myInterestsSet = new Set(parseInterests(currentUserProfile?.interests));
            const peerInterestsList = parseInterests(student.interests);
            const matchingInterests = peerInterestsList.filter(interest => myInterestsSet.has(interest));

            const mySkillsSet = new Set((currentUserProfile?.skills || []).map(s => s.trim().toLowerCase()));
            const peerSkillsList = (student.skills || []).map(s => s.trim().toLowerCase());
            const matchingSkills = peerSkillsList.filter(skill => mySkillsSet.has(skill));

            const commonList = [...new Set([...matchingInterests, ...matchingSkills])];
            const hasCommon = !isSelf && commonList.length > 0;
            const displayCommon = commonList.map(word => 
              word.split(' ').map(w => w.charAt(0).toUpperCase() + w.substring(1)).join(' ')
            );
            
            return (
              <SpotlightCard 
                key={student.id} 
                className="card peer-card" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="peer-card-header flex-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
                  <div className="peer-avatar">{initials}</div>
                  <h3 style={{ margin: '0.5rem 0 0.2rem 0' }}>
                    {student.user ? (
                      <Link to={`/profile?id=${student.user.id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                        {fullName}
                      </Link>
                    ) : fullName}
                  </h3>
                  <p className="peer-meta">{student.department || 'No Department'} &bull; {student.year || 'N/A'}</p>
                </div>
                
                <p className="peer-bio">{student.bio || "This user hasn't written a bio yet."}</p>

                {student.interests && (
                  <p className="peer-interests" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Interests: <em>{student.interests}</em>
                  </p>
                )}
                
                {student.skills && student.skills.length > 0 && (
                  <div className="peer-skills flex-center" style={{ flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
                    {student.skills.map(skill => (
                      <span key={skill} className="tag tag-primary" style={{ margin: 0 }}>{skill}</span>
                    ))}
                  </div>
                )}

                {hasCommon && (
                  <div className="animate-fade-in" style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    background: 'rgba(105, 108, 255, 0.08)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(105, 108, 255, 0.15)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    fontWeight: 600
                  }}>
                    🤝 Common Stack: {displayCommon.slice(0, 3).join(', ')}
                  </div>
                )}

                <div className="peer-actions flex-center mt-4" style={{ gap: '0.5rem' }}>
                  {student.user?.email && (
                    <a href={`mailto:${student.user.email}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
                      <Mail size={16} /> Connect
                    </a>
                  )}
                  {student.github ? (
                    <a href={student.github.startsWith('http') ? student.github : `https://${student.github}`} className="btn btn-outline" target="_blank" rel="noreferrer">
                      <Globe size={16} /> Portfolio
                    </a>
                  ) : (
                    <button className="btn btn-outline" disabled style={{ opacity: 0.4 }}>No Portfolio</button>
                  )}
                </div>
              </SpotlightCard>
            );
          })}

          {students.length === 0 && (
            <div className="no-results text-muted flex-center" style={{ gridColumn: '1 / -1', height: '200px', flexDirection: 'column', gap: '0.5rem' }}>
              <AlertCircle size={32} />
              <p>No students found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeerFinder;
