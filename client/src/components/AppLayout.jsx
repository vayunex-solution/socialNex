import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PenSquare, CalendarDays, Smartphone, BarChart3, Settings, LogOut, Rocket } from 'lucide-react'
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
        { path: '#', icon: CalendarDays, label: 'Calendar' },
        { path: '#', icon: Smartphone, label: 'Accounts' },
        { path: '#', icon: BarChart3, label: 'Analytics' },
        { path: '#', icon: Settings, label: 'Settings' }
    ]

    return (
        <div className="app-layout">
            {/* Desktop Sidebar */}
            <aside className="sidebar desktop-only">
                <div className="sidebar-logo">
                    <Link to="/">
                        <Rocket className="logo-icon" size={24} />
                        <span className="logo-text">Social<span className="text-gradient">Nex</span></span>
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

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav mobile-only">
                {navItems.map(item => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`mobile-nav-item ${path === item.path ? 'active' : ''}`}
                        >
                            <Icon size={24} />
                            <span className="mobile-nav-label">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}

export default AppLayout
