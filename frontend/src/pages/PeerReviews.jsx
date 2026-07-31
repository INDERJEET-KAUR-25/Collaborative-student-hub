import { useState, useEffect } from 'react';
import { Star, AlertCircle, CheckCircle2, MessageSquare, Award } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SpotlightCard from '../components/SpotlightCard';
import './PeerReviews.css';

const PeerReviews = () => {
  const { user } = useAuth();
  
  // Teams and candidate peers
  const [peers, setPeers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [selectedPeerId, setSelectedPeerId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPeersAndReviews = async () => {
    try {
      if (!user) return;
      
      // 1. Fetch user's teams to find coworkers/peers
      const teamsRes = await api.get('/teams/teams/my-teams/');
      
      // Collect unique members from all teams, excluding myself
      const peersMap = new Map();
      teamsRes.data.forEach(team => {
        team.members.forEach(member => {
          if (member.student !== user.user?.id) {
            peersMap.set(member.student, {
              id: member.student,
              username: member.username,
              projectTitle: team.project_title
            });
          }
        });
      });
      setPeers(Array.from(peersMap.values()));

      // 2. Fetch reviews received by me
      const reviewsRes = await api.get('/auth/reviews/');
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error('Error loading peers or reviews:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchPeersAndReviews();
      setLoading(false);
    };
    initData();
  }, [user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedPeerId) {
      setErrorMsg('Please select a team member to review.');
      return;
    }
    
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/auth/reviews/', {
        reviewee: selectedPeerId,
        rating: rating,
        comment: comment
      });

      setSuccessMsg('Review submitted successfully!');
      setComment('');
      setRating(5);
      setSelectedPeerId('');
      // Reload lists
      fetchPeersAndReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit review. You might have already reviewed this student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="peer-reviews-container animate-fade-in">
      <div className="peer-header">
        <h1>Peer Reviews</h1>
        <p>Give feedback and rate your team members to build a constructive collaboration culture.</p>
      </div>

      <div className="reviews-layout-grid">
        
        {/* Left Side: Submit Peer Review Form */}
        <div className="widget-panel">
          <h3>Leave a Peer Review</h3>
          {successMsg && (
            <div className="success-alert" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--status-open-bg)', color: 'var(--status-open-text)', border: '1px solid var(--status-open-border)' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="error-alert" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="input-group">
              <label>Select Team Member</label>
              <select 
                className="input select-input"
                value={selectedPeerId} 
                onChange={(e) => setSelectedPeerId(e.target.value)}
                required
              >
                <option value="">Choose coworker...</option>
                {peers.map(p => (
                  <option key={p.id} value={p.id}>{p.username} ({p.projectTitle})</option>
                ))}
              </select>
            </div>

            {/* Clickable Star Rating Widget */}
            <div className="input-group">
              <label>Star Rating</label>
              <div className="star-rating-selector" style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star 
                      size={28} 
                      fill={(hoverRating || rating) >= star ? 'var(--accent-secondary)' : 'none'} 
                      color={(hoverRating || rating) >= star ? 'var(--accent-secondary)' : 'var(--text-muted)'} 
                      style={{ transition: 'transform 0.1s ease' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Review Comments</label>
              <textarea 
                className="input"
                rows="4" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was this member's contribution, reliability, and communication during the project?"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Endorsement'}
            </button>
          </form>
        </div>

        {/* Right Side: Received Reviews History */}
        <div className="received-reviews-column">
          <div className="widget-panel" style={{ height: '100%' }}>
            <h3>My Endorsements & Reviews</h3>
            
            {loading ? (
              <div className="flex-center" style={{ height: '200px' }}>
                <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : (
              <div className="reviews-scroll-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {reviews.map(rev => (
                  <SpotlightCard key={rev.id} className="review-history-card" style={{ padding: '1rem' }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Reviewed by: {rev.reviewer_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="stars-row" style={{ display: 'flex', gap: '0.1rem', marginBottom: '0.5rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={14} 
                          fill={rev.rating >= star ? 'var(--accent-secondary)' : 'none'} 
                          color={rev.rating >= star ? 'var(--accent-secondary)' : 'var(--text-muted)'} 
                        />
                      ))}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>
                  </SpotlightCard>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center text-muted" style={{ padding: '3rem 1rem' }}>
                    <Award size={32} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                    <p>No peer reviews received yet. Teammates can endorse you once you join a workspace project.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PeerReviews;
