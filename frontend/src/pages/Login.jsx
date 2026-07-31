import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import Squares from '../components/Squares';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(location.state?.signUp !== true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.signUp === true) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.state?.signUp]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isLogin) {
      const res = await login(formData.username, formData.password);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.error);
      }
    } else {
      const res = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      if (res.success) {
        navigate('/');
      } else {
        // Display validation errors from backend
        if (typeof res.error === 'object') {
          const firstErrorKey = Object.keys(res.error)[0];
          const firstErrorVal = res.error[firstErrorKey];
          const errorMessage = Array.isArray(firstErrorVal) ? firstErrorVal[0] : firstErrorVal;
          setErrorMsg(`${firstErrorKey}: ${errorMessage}`);
        } else {
          setErrorMsg(res.error || 'Registration failed.');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="login-container flex-center" style={{ position: 'relative', overflow: 'hidden' }}>
      <Squares 
        direction="right"
        speed={0.3}
        borderColor="rgba(99, 102, 241, 0.07)"
        squareSize={40}
        hoverFillColor="rgba(99, 102, 241, 0.12)"
      />
      <div className="login-card glass-panel animate-fade-in" style={{ zIndex: 1 }}>
        <div className="login-header flex-center">
          <div className="shield-icon">
            <ShieldCheck size={40} />
          </div>
          <h2>Secure {isLogin ? 'Login' : 'Signup'}</h2>
          <p>Access the Student Project Hub</p>
        </div>

        {errorMsg && (
          <div className="error-alert flex-center animate-fade-in">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username *</label>
            <input 
              type="text" 
              name="username" 
              className="input" 
              placeholder="e.g. johndoe" 
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-row split-2" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ margin: 0, flex: 1 }}>
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    className="input" 
                    placeholder="John" 
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group" style={{ margin: 0, flex: 1 }}>
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    className="input" 
                    placeholder="Doe" 
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>University Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  className="input" 
                  placeholder="student@university.edu" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Password *</label>
            <input 
              type="password" 
              name="password" 
              className="input" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn btn-primary login-btn">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="toggle-link" onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}>
              {isLogin ? 'Sign up here' : 'Login here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
