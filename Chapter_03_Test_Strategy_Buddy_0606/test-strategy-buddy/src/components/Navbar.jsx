import { NavLink, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { theme, toggleTheme } = useApp()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Test Strategy Buddy</Link>
      <div className="navbar-actions">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>Home</NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Settings</NavLink>
        <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}
