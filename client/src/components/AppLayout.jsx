import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PenSquare, CalendarDays, Clock, BarChart3, Settings, LogOut, Activity } from 'lucide-react'
import logoIcon from '../assets/logo-icon.png'
import FloatingSupport from './FloatingSupport'
import './AppLayout.css'

function AppLayout({ children }) {
    const location = useLocation()
    const path = location.pathname

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/'
    }

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/create-post', icon: PenSquare, label: 'Create Post' },
        { path: '/scheduler', icon: Clock, label: 'Scheduler' },
        { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/logs', icon: Activity, label: 'Activity Logs' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <div className="app-layout">
            {/* Desktop Sidebar */}
            <aside className="sidebar desktop-only">
                <div className="sidebar-logo">
                    <Link to="/dashboard">
                        <img src={logoIcon} alt="SocialNex" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }} />
                        <span className="logo-text"><span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Social</span><span style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nex</span></span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`nav-item ${path === item.path ? 'active' : ''}`}
                            >
                                <Icon className="nav-icon" size={20} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="btn btn-secondary btn-sm logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {children}
            </main>

            {/* Mobile Bottom Navigation - Premium */}
            <nav className="mobile-bottom-nav mobile-only">
                {/* Left side nav items */}
                <Link to="/dashboard" className={`mobile-nav-item ${path === '/dashboard' ? 'active' : ''}`}>
                    <span className="mobile-nav-icon-wrap">
                        <LayoutDashboard size={22} />
                    </span>
                    <span className="mobile-nav-label">Home</span>
                    {path === '/dashboard' && <span className="mobile-nav-dot"></span>}
                </Link>

                <Link to="/calendar" className={`mobile-nav-item ${path === '/calendar' ? 'active' : ''}`}>
                    <span className="mobile-nav-icon-wrap">
                        <CalendarDays size={22} />
                    </span>
                    <span className="mobile-nav-label">Calendar</span>
                    {path === '/calendar' && <span className="mobile-nav-dot"></span>}
                </Link>

                {/* Center Floating Create Button */}
                <Link to="/create-post" className="mobile-nav-fab">
                    <span className="mobile-nav-fab-inner">
                        <PenSquare size={22} />
                    </span>
                    <span className="mobile-nav-fab-label">Create</span>
                </Link>

                <Link to="/analytics" className={`mobile-nav-item ${path === '/analytics' ? 'active' : ''}`}>
                    <span className="mobile-nav-icon-wrap">
                        <BarChart3 size={22} />
                    </span>
                    <span className="mobile-nav-label">Analytics</span>
                    {path === '/analytics' && <span className="mobile-nav-dot"></span>}
                </Link>

                <Link to="/settings" className={`mobile-nav-item ${path === '/settings' ? 'active' : ''}`}>
                    <span className="mobile-nav-icon-wrap">
                        <Settings size={22} />
                    </span>
                    <span className="mobile-nav-label">Settings</span>
                    {path === '/settings' && <span className="mobile-nav-dot"></span>}
                </Link>
            </nav>
            <FloatingSupport />
        </div>
    )
}

export default AppLayout
