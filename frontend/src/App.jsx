import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import PeerFinder from './pages/PeerFinder';
import Landing from './pages/Landing';
import PeerReviews from './pages/PeerReviews';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-state flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" style={{ border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '45px', height: '45px', animation: 'spin 1s linear infinite' }}></div>
        <p className="text-muted" style={{ fontWeight: 500 }}>Initializing Student Hub...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {user ? (
        <div className="app-layout">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="main-content">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="content-container">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-project" element={<CreateProject />} />
                <Route path="/peer-finder" element={<PeerFinder />} />
                <Route path="/peer-reviews" element={<PeerReviews />} />
                {/* Fallback to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          {/* Catch-all redirects to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
