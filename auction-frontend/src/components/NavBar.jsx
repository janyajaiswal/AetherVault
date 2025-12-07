import React from 'react'
import './styles/NavBar.css'
import { Link, useMatch, useResolvedPath } from 'react-router-dom'

const NavBar = ({account}) => {

  return (
    <nav className='sidebar-nav'>
        <Link to="/" className='site-title'>
            <div className="logo-container">
              <div className="logo-glow"></div>
              <div className="logo-text">AetherVault</div>
              <div className="logo-accent"></div>
            </div>
        </Link>
        <ul className="nav-menu">
            <CustomLink to="/" className="nav-button">
              <span className="nav-icon">🛸</span>
              <span className="nav-label">Marketplace</span>
            </CustomLink>
            <CustomLink to="/auction" className="nav-button">
              <span className="nav-icon">⚡</span>
              <span className="nav-label">Bidding</span>
            </CustomLink>
            <CustomLink to="/deed" className="nav-button">
              <span className="nav-icon">✨</span>
              <span className="nav-label">Mint</span>
            </CustomLink>
            <CustomLink to="/stats" className="nav-button">
              <span className="nav-icon">📊</span>
              <span className="nav-label">Analytics</span>
            </CustomLink>
            <CustomLink to="/profile" className="nav-button">
              <span className="nav-icon">👤</span>
              <span className="nav-label">Account</span>
            </CustomLink>
        </ul>
        {account && (
          <div className="account-info">
            <div className="account-label">Connected Account</div>
            <div className="account-address">{account}</div>
          </div>
        )}
    </nav>
  )
}

function CustomLink({to, children, ...props}) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })
    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    )
}

export default NavBar