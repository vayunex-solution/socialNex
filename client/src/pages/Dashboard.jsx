import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import { Link } from 'react-router-dom'
import ConnectBluesky from '../components/ConnectBluesky'
import ConnectTelegram from '../components/ConnectTelegram'
import ConnectDiscord from '../components/ConnectDiscord'
import ConnectLinkedIn from '../components/ConnectLinkedIn'
import '../components/ConnectBluesky.css'
import './Dashboard.css'

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [showConnectBluesky, setShowConnectBluesky] = useState(false)
    const [showConnectTelegram, setShowConnectTelegram] = useState(false)
    const [showConnectDiscord, setShowConnectDiscord] = useState(false)
    const [showConnectLinkedIn, setShowConnectLinkedIn] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch connected accounts
    useEffect(() => {
        fetchAccounts()

        // Check for LinkedIn OAuth callback
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        if (code && state && state.startsWith('linkedin_')) {
            setShowConnectLinkedIn(true)
        }
    }, [])

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(`${API_URL}/social/accounts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                setAccounts(data.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch accounts:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleBlueskyConnected = (newAccount) => {
        setShowConnectBluesky(false)
        fetchAccounts()
    }

    const handleTelegramConnected = (newAccount) => {
        setShowConnectTelegram(false)
        fetchAccounts()
    }

    const handleDiscordConnected = (newAccount) => {
        setShowConnectDiscord(false)
        fetchAccounts()
    }

    const handleLinkedInConnected = (newAccount) => {
        setShowConnectLinkedIn(false)
        fetchAccounts()
    }

    const handleDisconnect = async (accountId, platform) => {
        if (!confirm('Are you sure you want to disconnect this account?')) return

        try {
            const token = localStorage.getItem('accessToken')
            await fetch(`${API_URL}/social/${platform}/${accountId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            fetchAccounts()
        } catch (err) {
            console.error('Failed to disconnect:', err)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/'
    }

    return (
        <div className="dashboard-page">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Link to="/">
                        <span className="logo-icon">🚀</span>
                        <span className="logo-text">Social<span className="text-gradient">Nex</span></span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active">
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </a>
                    <Link to="/create-post" className="nav-item">
                        <span className="nav-icon">✍️</span>
                        <span>Create Post</span>
                    </Link>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">📅</span>
                        <span>Calendar</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">📱</span>
                        <span>Accounts</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">📈</span>
                        <span>Analytics</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        <span>Settings</span>
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Welcome back, {user.fullName || 'User'}! 👋</h1>
                        <p>Here's what's happening with your social media.</p>
                    </div>
                    <button className="btn btn-primary">
                        Create Post ✍️
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📱</div>
                        <div className="stat-info">
                            <span className="stat-value">{accounts.length}</span>
                            <span className="stat-label">Connected Accounts</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Posts Created</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Scheduled</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Total Reach</span>
                        </div>
                    </div>
                </div>

                {/* Connected Accounts */}
                <section className="accounts-section">
                    <div className="section-header">
                        <h2>📱 Connected Accounts</h2>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading...</div>
                    ) : accounts.length > 0 ? (
                        <div className="accounts-grid">
                            {accounts.map(acc => (
                                <div key={acc.id} className="account-card glass-card">
                                    <div className="account-info">
                                        {acc.avatar ? (
                                            <img src={acc.avatar} alt={acc.name} className="account-avatar" />
                                        ) : (
                                            <div className="account-avatar-placeholder">
                                                {acc.platform === 'bluesky' ? '🦋' : acc.platform === 'linkedin' ? '🔵' : '📱'}
                                            </div>
                                        )}
                                        <div className="account-details">
                                            <span className="account-name">{acc.name}</span>
                                            <span className="account-username">@{acc.username}</span>
                                            <span className="account-platform">{acc.platform}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDisconnect(acc.id, acc.platform)}
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state glass-card">
                            <p>No accounts connected yet.</p>
                        </div>
                    )}

                    {/* Connect Buttons */}
                    <div className="connect-buttons">
                        <button
                            className="connect-platform-btn bluesky"
                            onClick={() => setShowConnectBluesky(true)}
                        >
                            <span className="platform-icon">🦋</span>
                            <span>Connect Bluesky</span>
                        </button>
                        <button className="connect-platform-btn mastodon" disabled>
                            <span className="platform-icon">🐘</span>
                            <span>Mastodon (Coming Soon)</span>
                        </button>
                        <button
                            className="connect-platform-btn telegram"
                            onClick={() => setShowConnectTelegram(true)}
                        >
                            <span className="platform-icon">📱</span>
                            <span>Connect Telegram</span>
                        </button>
                        <button
                            className="connect-platform-btn discord"
                            onClick={() => setShowConnectDiscord(true)}
                        >
                            <span className="platform-icon">💬</span>
                            <span>Connect Discord</span>
                        </button>
                        <button
                            className="connect-platform-btn linkedin"
                            onClick={() => setShowConnectLinkedIn(true)}
                            style={{ background: 'linear-gradient(135deg, rgba(0,119,181,0.15), rgba(0,160,220,0.15))', borderColor: 'rgba(0,119,181,0.4)' }}
                        >
                            <span className="platform-icon">🔵</span>
                            <span>Connect LinkedIn</span>
                        </button>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="quick-actions">
                    <h2>Get Started</h2>
                    <div className="actions-grid">
                        <div className="action-card glass-card">
                            <div className="action-icon">🔗</div>
                            <h3>Connect Account</h3>
                            <p>Link your social media accounts to start posting</p>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setShowConnectBluesky(true)}
                            >
                                Connect
                            </button>
                        </div>
                        <div className="action-card glass-card">
                            <div className="action-icon">✍️</div>
                            <h3>Create Post</h3>
                            <p>Write and schedule your first post</p>
                            <button className="btn btn-secondary btn-sm">Create</button>
                        </div>
                        <div className="action-card glass-card">
                            <div className="action-icon">📚</div>
                            <h3>Read Guide</h3>
                            <p>Learn how to use SocialNex effectively</p>
                            <button className="btn btn-secondary btn-sm">Read</button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Connect Bluesky Modal */}
            {showConnectBluesky && (
                <ConnectBluesky
                    onSuccess={handleBlueskyConnected}
                    onClose={() => setShowConnectBluesky(false)}
                />
            )}

            {/* Connect Telegram Modal */}
            {showConnectTelegram && (
                <ConnectTelegram
                    onSuccess={handleTelegramConnected}
                    onClose={() => setShowConnectTelegram(false)}
                />
            )}

            {/* Connect Discord Modal */}
            {showConnectDiscord && (
                <ConnectDiscord
                    onSuccess={handleDiscordConnected}
                    onClose={() => setShowConnectDiscord(false)}
                />
            )}

            {/* Connect LinkedIn Modal */}
            {showConnectLinkedIn && (
                <ConnectLinkedIn
                    onSuccess={handleLinkedInConnected}
                    onClose={() => setShowConnectLinkedIn(false)}
                />
            )}
        </div>
    )
}

export default Dashboard
