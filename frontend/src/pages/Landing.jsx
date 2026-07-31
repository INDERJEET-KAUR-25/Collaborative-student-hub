import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowRight, 
  Code, 
  Users, 
  Trophy, 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Squares from '../components/Squares';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const handleNavToLogin = (isSignUp = false) => {
    navigate('/login', { state: { signUp: isSignUp } });
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      
      {/* Landing Navbar */}
      <nav className="landing-nav glass-panel">
        <div className="landing-nav-brand">
          <GraduationCap size={28} className="brand-logo-icon" />
          <span className="brand-name">STUDENT HUB</span>
        </div>

        <div className="landing-nav-links">
          <button onClick={() => handleScroll('about')} className="landing-nav-link">About Us</button>
          <button onClick={() => handleScroll('contact')} className="landing-nav-link">Contact Us</button>
        </div>

        <div className="landing-nav-actions">
          <ThemeToggle />
          <button onClick={() => handleNavToLogin(false)} className="btn btn-outline">Sign In</button>
          <button onClick={() => handleNavToLogin(true)} className="btn btn-primary">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-bg">
          <Squares 
            direction="down"
            speed={0.2}
            borderColor="rgba(105, 108, 255, 0.06)"
            squareSize={50}
            hoverFillColor="rgba(105, 108, 255, 0.12)"
          />
        </div>
        
        <div className="hero-content animate-fade-in">
          <div className="hero-badge">🎓 COLLABORATIVE STUDENT HUB</div>
          <h1>Connect, Collaborate, and Deploy Student Projects</h1>
          <p>
            Build your team with members containing the exact tech stack you need. Coordinate tasks 
            with responsive Kanban sprint boards and build your academic profile with peer reviews.
          </p>
          <div className="hero-buttons">
            <button onClick={() => handleNavToLogin(true)} className="btn btn-primary hero-btn">
              Get Started <ArrowRight size={18} />
            </button>
            <button onClick={() => handleScroll('about')} className="btn btn-outline hero-btn">
              Learn More
            </button>
          </div>
        </div>
      </header>

      {/* Features/About Section */}
      <section id="about" className="landing-section about-section">
        <div className="section-header text-center">
          <h2>About The Platform</h2>
          <p className="subtitle">Everything you need to showcase, match, and organize group initiatives.</p>
        </div>

        <div className="about-grid">
          
          <div className="about-card glass-panel">
            <div className="about-icon-box purple">
              <Code size={24} />
            </div>
            <h3>Project Matching</h3>
            <p>
              Publish your project ideas and specify required tech stacks. Students with matching skills 
              can apply, enforcing rigorous team standards.
            </p>
          </div>

          <div className="about-card glass-panel">
            <div className="about-icon-box blue">
              <Users size={24} />
            </div>
            <h3>Kanban Workspaces</h3>
            <p>
              Plan sprints and allocate milestones. Drag and drop tasks from "To Do" to "Completed" 
              with real-time progress feedback.
            </p>
          </div>

          <div className="about-card glass-panel">
            <div className="about-icon-box green">
              <Trophy size={24} />
            </div>
            <h3>Peer Reviews</h3>
            <p>
              Give star ratings and submit detailed reviews to your teammates, building a verified 
              history of contributions.
            </p>
          </div>

        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="landing-section contact-section">
        <div className="section-header text-center">
          <h2>Contact Us</h2>
          <p className="subtitle">Have questions or feedback? Drop us a message.</p>
        </div>

        <div className="contact-grid">
          
          {/* Contact Details */}
          <div className="contact-info glass-panel">
            <h3>Get in Touch</h3>
            <p>Reach out directly or visit our student helpdesk on campus.</p>
            
            <div className="info-list">
              <div className="info-item">
                <Mail size={18} className="info-icon" />
                <span>support@studentprojecthub.edu</span>
              </div>
              <div className="info-item">
                <Phone size={18} className="info-icon" />
                <span>+1 (555) 019-2834</span>
              </div>
              <div className="info-item">
                <MapPin size={18} className="info-icon" />
                <span>Academic Block 4, Lab 202, LPU Campus</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-container glass-panel">
            {submitted ? (
              <div className="contact-success animate-fade-in">
                <CheckCircle2 size={48} className="success-icon-green" />
                <h3>Thank You!</h3>
                <p>Your message has been received. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe" 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="input" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@university.edu" 
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>Message</label>
                  <textarea 
                    className="input" 
                    rows="4" 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Enter your message or questions here..." 
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer text-center">
        <p>&copy; {new Date().getFullYear()} Student Project Hub. Built with React & Django.</p>
      </footer>

    </div>
  );
};

export default Landing;
