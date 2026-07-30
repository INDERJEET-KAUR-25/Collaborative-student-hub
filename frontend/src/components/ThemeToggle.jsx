import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle = () => {
  // Check local storage or default to dark mode
  const [isLightMode, setIsLightMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  return (
    <button 
      className="theme-toggle-btn"
      onClick={() => setIsLightMode(!isLightMode)}
      aria-label="Toggle theme"
    >
      {isLightMode ? (
        <Moon size={18} className="theme-icon moon-icon" />
      ) : (
        <Sun size={18} className="theme-icon sun-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;
