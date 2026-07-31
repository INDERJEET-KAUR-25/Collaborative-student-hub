import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Workspace from './pages/Workspace';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import PeerFinder from './pages/PeerFinder';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/peer-finder" element={<PeerFinder />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
