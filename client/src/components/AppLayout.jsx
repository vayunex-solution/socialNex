import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, PenSquare, CalendarDays, Clock, BarChart3,
    Settings, LogOut, Activity, MoreHorizontal, X, Bell,
    HelpCircle, ChevronRight, User
} from 'lucide-react'
import logoIcon from '../assets/logo-icon.png'
import FloatingSupport from './FloatingSupport'
import './AppLayout.css'

function AppLayout({ children }) {
    const location = useLocation()
    const path = location.pathname
    const [moreOpen, setMoreOpen] = useState(false)
    const [user, setUser] = useState({})

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}')
            setUser(u)
        } catch { setUser({}) }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/'
    }

    const sidebarNavItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/create-post', icon: PenSquare, label: 'Create Post' },
        { path: '/scheduler', icon: Clock, label: 'Scheduler' },
        { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/logs', icon: Activity, label: 'Activity Logs' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ]

    const moreDrawerItems = [
        { path: '/scheduler', icon: Clock, label: 'Scheduler' },
        { path: '/logs', icon: Activity, label: 'Activity Logs' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ]

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const firstName = user?.fullName?.split(' ')[0] || 'User'

    return (
        <div className="app-layout">
            {/* ==================== DESKTOP SIDEBAR ==================== */}
            <aside className="sidebar desktop-only">
                <div className="sidebar-logo">
                    <Link to="/dashboard">
                        <img src={logoIcon} alt="SocialNex" style={{ width: '34px', height: '34px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
                        <span className="logo-text">
                            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Social</span>
                            <span style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nex</span>
                        </span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {sidebarNavItems.map(item => {
                        const Icon = item.icon
                        return (
                            <Link key={item.label} to={item.path} className={`nav-item ${path === item.path ? 'active' : ''}`}>
                                <Icon className="nav-icon" size={20} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user-card">
                        <div className="sidebar-user-avatar">
                            {user?.avatar
                                ? <img src={user.avatar} alt="" />
                                : <span>{getInitials(user?.fullName)}</span>
                            }
                        </div>
                        <div className="sidebar-user-info">
                            <p className="sidebar-user-name">{user?.fullName || 'User'}</p>
                            <p className="sidebar-user-role">{user?.role || 'Member'}</p>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ==================== MAIN AREA ==================== */}
            <div className="main-wrapper">
                {/* Desktop Top Header */}
                <header className="top-header desktop-only">
                    <div className="header-left">
                        <h2 className="header-page-title">
                            {sidebarNavItems.find(i => i.path === path)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="header-right">
                        <button className="header-icon-btn" title="Notifications">
                            <Bell size={20} />
                            <span className="header-notif-dot"></span>
                        </button>
                        <div className="header-user">
                            <div className="header-user-avatar">
                                {user?.avatar
                                    ? <img src={user.avatar} alt="" />
                                    : <span>{getInitials(user?.fullName)}</span>
                                }
                            </div>
                            <div className="header-user-info">
                                <p className="header-user-name">{firstName}</p>
                                <p className="header-user-role">{user?.role || 'Member'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Top Header */}
                <header className="mobile-header mobile-only">
                    <Link to="/dashboard" className="mobile-header-logo">
                        <img src={logoIcon} alt="SocialNex" style={{ width: '30px', height: '30px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
                        <span className="mobile-logo-text">
                            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Social</span>
                            <span style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nex</span>
                        </span>
                    </Link>
                    <div className="mobile-header-right">
                        <button className="header-icon-btn mobile-notif" title="Notifications">
                            <Bell size={18} />
                        </button>
                        <Link to="/settings" className="mobile-header-user">
                            <div className="mobile-user-avatar">
                                {user?.avatar
                                    ? <img src={user.avatar} alt="" />
                                    : <span>{getInitials(user?.fullName)}</span>
                                }
                            </div>
                            <span className="mobile-user-name">{firstName}</span>
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="main-content">
                    {children}
                </main>
            </div>

            {/* ==================== MOBILE BOTTOM NAV ==================== */}
            <nav className="mobile-bottom-nav mobile-only">
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

                {/* More Button */}
                <button className={`mobile-nav-item mobile-nav-more-btn ${moreOpen ? 'active' : ''}`} onClick={() => setMoreOpen(true)}>
                    <span className="mobile-nav-icon-wrap">
                        <MoreHorizontal size={22} />
                    </span>
                    <span className="mobile-nav-label">More</span>
                </button>
            </nav>

            {/* ==================== MORE DRAWER (MOBILE) ==================== */}
            {moreOpen && (
                <>
                    <div className="more-overlay" onClick={() => setMoreOpen(false)}></div>
                    <div className="more-drawer">
                        <div className="more-drawer-handle" onClick={() => setMoreOpen(false)}>
                            <span className="more-drawer-bar"></span>
                        </div>
                        <div className="more-drawer-header">
                            <div className="more-drawer-user">
                                <div className="more-drawer-avatar">
                                    {user?.avatar
                                        ? <img src={user.avatar} alt="" />
                                        : <span>{getInitials(user?.fullName)}</span>
                                    }
                                </div>
                                <div>
                                    <p className="more-drawer-name">{user?.fullName || 'User'}</p>
                                    <p className="more-drawer-email">{user?.email || ''}</p>
                                </div>
                            </div>
                            <button className="more-drawer-close" onClick={() => setMoreOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="more-drawer-nav">
                            {moreDrawerItems.map(item => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className={`more-drawer-item ${path === item.path ? 'active' : ''}`}
                                        onClick={() => setMoreOpen(false)}
                                    >
                                        <div className="more-drawer-icon-wrap">
                                            <Icon size={20} />
                                        </div>
                                        <span>{item.label}</span>
                                        <ChevronRight size={16} className="more-drawer-chevron" />
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="more-drawer-divider"></div>
                        <a href="mailto:support@vayunexsolution.com" className="more-drawer-item" onClick={() => setMoreOpen(false)}>
                            <div className="more-drawer-icon-wrap help-icon">
                                <HelpCircle size={20} />
                            </div>
                            <span>Help & Support</span>
                            <ChevronRight size={16} className="more-drawer-chevron" />
                        </a>
                        <button className="more-drawer-logout" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                        <div className="more-drawer-footer">
                            Powered by <strong>VayuNex Solution</strong> 💜
                        </div>
                    </div>
                </>
            )}

            <FloatingSupport />
        </div>
    )
}

export default AppLayout
