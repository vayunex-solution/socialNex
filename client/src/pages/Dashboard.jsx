import { useState, useEffect, useRef, useCallback } from 'react'
import API_URL from '../config/api'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Smartphone, PenSquare, CalendarDays, BarChart3, Linkedin, TrendingUp, Zap } from 'lucide-react'
import PlatformIcon from '../components/PlatformIcon'
import ConnectBluesky from '../components/ConnectBluesky'
import ConnectTelegram from '../components/ConnectTelegram'
import ConnectDiscord from '../components/ConnectDiscord'
import ConnectLinkedIn from '../components/ConnectLinkedIn'
import ConnectFacebook from '../components/ConnectFacebook'
import ConnectYouTube from '../components/ConnectYouTube'
import '../components/ConnectBluesky.css'
import './Dashboard.css'

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [showConnectBluesky, setShowConnectBluesky] = useState(false)
    const [showConnectTelegram, setShowConnectTelegram] = useState(false)
    const [showConnectDiscord, setShowConnectDiscord] = useState(false)
    const [showConnectLinkedIn, setShowConnectLinkedIn] = useState(false)
    const [showConnectFacebook, setShowConnectFacebook] = useState(false)
    const [showConnectYouTube, setShowConnectYouTube] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalPosts: 0, successRate: 0, weekPosts: 0, scheduled: 0 })
    const navigate = useNavigate()

    // Animated counter hook
    function useCountUp(target, duration = 1200) {
        const [value, setValue] = useState(0)
        const ref = useRef(null)
        useEffect(() => {
            if (target === 0) { setValue(0); return }
            let start = 0
            const startTime = performance.now()
            function step(now) {
                const elapsed = now - startTime
                const progress = Math.min(elapsed / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
                setValue(Math.round(eased * target))
                if (progress < 1) ref.current = requestAnimationFrame(step)
            }
            ref.current = requestAnimationFrame(step)
            return () => ref.current && cancelAnimationFrame(ref.current)
        }, [target, duration])
        return value
    }

    // Time-of-day greeting
    const getGreeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Good morning'
        if (h < 17) return 'Good afternoon'
        return 'Good evening'
    }

    const animAccounts = useCountUp(accounts.length)
    const animPosts = useCountUp(stats.totalPosts)
    const animScheduled = useCountUp(stats.scheduled)
    const animRate = useCountUp(stats.successRate)

    // Fetch connected accounts
    useEffect(() => {
        fetchAccounts()
        fetchStats()

        // Check for OAuth callback
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        if (code && state && typeof state === 'string') {
            if (state.startsWith('linkedin_')) setShowConnectLinkedIn(true)
            else if (state.startsWith('facebook_')) setShowConnectFacebook(true)
            else if (state.startsWith('youtube_')) setShowConnectYouTube(true)
        }
    }, [])

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const res = await fetch(`${API_URL}/analytics/overview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setStats({
                    totalPosts: data.data.totalPosts || 0,
                    successRate: data.data.successRate || 0,
                    weekPosts: data.data.weekPosts || 0,
                    scheduled: data.data.scheduled || 0
                })
            }
        } catch (err) {
            console.error('Failed to load stats:', err)
        }
    }

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

    const handleFacebookConnected = (newAccount) => {
        setShowConnectFacebook(false)
        fetchAccounts()
    }

    const handleYouTubeConnected = (newAccount) => {
        setShowConnectYouTube(false)
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
        <>
            {/* Main Content */}
            <main className="dashboard-main w-full">
                <header className="dashboard-header">
                    <div>
                        <h1 className="flex-center gap-2"><LayoutDashboard size={28} /> Dashboard</h1>
                        <p>{getGreeting()}, <strong>{user.fullName?.split(' ')[0] || 'Creator'}</strong>! Here's your command center.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/create-post')}>
                        <PenSquare size={18} style={{ marginRight: '6px' }} />
                        Create Post
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card glass-card dash-stagger-1">
                        <div className="stat-icon"><Smartphone size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{animAccounts}</span>
                            <span className="stat-label">Connected Accounts</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card dash-stagger-2">
                        <div className="stat-icon"><TrendingUp size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{animPosts}</span>
                            <span className="stat-label">Posts Published</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card dash-stagger-3">
                        <div className="stat-icon"><CalendarDays size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{animScheduled}</span>
                            <span className="stat-label">Scheduled</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card dash-stagger-4">
                        <div className="stat-icon"><Zap size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{animRate}%</span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                    </div>
                </div>

                {/* Platform Health Strip */}
                {accounts.length > 0 && (
                    <div className="platform-health-strip glass-card">
                        <span className="health-label">Platform Status</span>
                        <div className="health-dots">
                            {accounts.map(acc => (
                                <div key={acc.id} className="health-dot-item" title={`${acc.platform} — ${acc.name}`}>
                                    <span className="health-dot health-active" />
                                    <span className="health-platform-name">{acc.platform}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Connected Accounts */}
                <section className="accounts-section">
                    <div className="section-header">
                        <h2 className="flex-center gap-2"><Smartphone size={24} /> Connected Accounts</h2>
                        <span className="accounts-count">{accounts.length} connected</span>
                    </div>

                    {loading ? (
                        <div className="loading-state glass-card">
                            <div className="loading-spinner-wrap">
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                            </div>
                            <p>Loading your accounts...</p>
                        </div>
                    ) : accounts.length > 0 ? (
                        <div className="accounts-grid">
                            {accounts.map(acc => (
                                <div key={acc.id} className={`account-card glass-card platform-${acc.platform}`}>
                                    <div className="account-card-stripe"></div>
                                    <div className="account-info">
                                        {acc.avatar ? (
                                            <img
                                                src={acc.avatar}
                                                alt={acc.name}
                                                className="account-avatar"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className={`account-avatar-placeholder platform-bg-${acc.platform}`}
                                            style={{ display: acc.avatar ? 'none' : 'flex' }}
                                        >
                                            <PlatformIcon platform={acc.platform} size={22} />
                                        </div>
                                        <div className="account-details">
                                            <span className="account-name">{acc.name}</span>
                                            <span className="account-username">
                                                {acc.username ? (acc.username.startsWith('@') ? acc.username : `@${acc.username}`) : ''}
                                            </span>
                                            <span className={`account-badge platform-badge-${acc.platform}`}>{acc.platform}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-disconnect"
                                        onClick={() => handleDisconnect(acc.id, acc.platform)}
                                        title="Disconnect account"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-card glass-card">
                            <div className="empty-state-icon">🔗</div>
                            <h3>No accounts connected yet</h3>
                            <p>Connect your social media accounts below to start publishing content across all your platforms at once.</p>
                        </div>
                    )}

                    {/* Connect Platform Cards */}
                    <div className="connect-grid">
                        <button className="connect-card bluesky" onClick={() => setShowConnectBluesky(true)}>
                            <div className="connect-card-icon bluesky-icon">
                                <PlatformIcon platform="bluesky" size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Bluesky</span>
                                <span className="connect-card-desc">Decentralized social</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card telegram" onClick={() => setShowConnectTelegram(true)}>
                            <div className="connect-card-icon telegram-icon">
                                <PlatformIcon platform="telegram" size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Telegram</span>
                                <span className="connect-card-desc">Channels & groups</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card discord" onClick={() => setShowConnectDiscord(true)}>
                            <div className="connect-card-icon discord-icon">
                                <PlatformIcon platform="discord" size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Discord</span>
                                <span className="connect-card-desc">Server webhooks</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card linkedin" onClick={() => setShowConnectLinkedIn(true)}>
                            <div className="connect-card-icon linkedin-icon">
                                <PlatformIcon platform="linkedin" size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">LinkedIn</span>
                                <span className="connect-card-desc">Professional network</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card facebook" onClick={() => setShowConnectFacebook(true)}>
                            <div className="connect-card-icon" style={{ background: 'rgba(24, 119, 242, 0.15)' }}>
                                <PlatformIcon platform="facebook" size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Facebook</span>
                                <span className="connect-card-desc">Pages & Groups</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card" onClick={() => setShowConnectFacebook(true)} style={{ borderColor: 'rgba(228, 64, 95, 0.3)' }}>
                            <div className="connect-card-icon" style={{ background: 'rgba(228, 64, 95, 0.15)' }}>
                                <PlatformIcon platform="instagram" size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Instagram</span>
                                <span className="connect-card-desc">Auto-connects via Facebook</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card" onClick={() => setShowConnectYouTube(true)} style={{ borderColor: 'rgba(255, 0, 0, 0.3)' }}>
                            <div className="connect-card-icon" style={{ background: 'rgba(255, 0, 0, 0.15)' }}>
                                <PlatformIcon platform="youtube" size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">YouTube</span>
                                <span className="connect-card-desc">Upload videos & Shorts</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="quick-actions mt-4">
                    <h2>🚀 Quick Actions</h2>
                    <div className="actions-grid">
                        <div className="action-card glass-card" onClick={() => navigate('/create-post')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon">✍️</div>
                            <h3>Draft Post</h3>
                            <p>Write and schedule your first post</p>
                            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/create-post'); }}>Create</button>
                        </div>
                        <div className="action-card glass-card" onClick={() => navigate('/guide')} style={{ cursor: 'pointer' }}>
                            <div className="action-icon">📚</div>
                            <h3>Read Guide</h3>
                            <p>Learn how to use SocialNex effectively</p>
                            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); navigate('/guide'); }}>Read</button>
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

            {/* Connect Facebook Modal */}
            {showConnectFacebook && (
                <ConnectFacebook
                    onSuccess={handleFacebookConnected}
                    onClose={() => setShowConnectFacebook(false)}
                />
            )}

            {/* Connect YouTube Modal */}
            {showConnectYouTube && (
                <ConnectYouTube
                    onSuccess={handleYouTubeConnected}
                    onClose={() => setShowConnectYouTube(false)}
                />
            )}
        </>
    )
}

export default Dashboard
