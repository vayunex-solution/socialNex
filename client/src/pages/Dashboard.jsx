import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Smartphone, PenSquare, CalendarDays, BarChart3, MessageCircle, Send, Linkedin, Globe } from 'lucide-react'
import ConnectBluesky from '../components/ConnectBluesky'
import ConnectTelegram from '../components/ConnectTelegram'
import ConnectDiscord from '../components/ConnectDiscord'
import ConnectLinkedIn from '../components/ConnectLinkedIn'
import ConnectFacebook from '../components/ConnectFacebook'
import '../components/ConnectBluesky.css'
import './Dashboard.css'

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const [showConnectBluesky, setShowConnectBluesky] = useState(false)
    const [showConnectTelegram, setShowConnectTelegram] = useState(false)
    const [showConnectDiscord, setShowConnectDiscord] = useState(false)
    const [showConnectLinkedIn, setShowConnectLinkedIn] = useState(false)
    const [showConnectFacebook, setShowConnectFacebook] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch connected accounts
    useEffect(() => {
        fetchAccounts()

        // Check for LinkedIn OAuth callback
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        if (code && state) {
            if (state.startsWith('linkedin_')) {
                setShowConnectLinkedIn(true)
            } else if (state.startsWith('facebook_')) {
                setShowConnectFacebook(true)
            }
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

    const handleFacebookConnected = (newAccount) => {
        setShowConnectFacebook(false)
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

    const navigate = useNavigate()

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
                        <p>Here's what's happening with your social media.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/create-post')}>
                        <PenSquare size={18} style={{ marginRight: '6px' }} />
                        Create Post
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card glass-card">
                        <div className="stat-icon"><Smartphone size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">{accounts.length}</span>
                            <span className="stat-label">Connected Accounts</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon"><PenSquare size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Posts Created</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon"><CalendarDays size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Scheduled</span>
                        </div>
                    </div>
                    <div className="stat-card glass-card">
                        <div className="stat-icon"><BarChart3 size={24} /></div>
                        <div className="stat-info">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Total Reach</span>
                        </div>
                    </div>
                </div>

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
                                            <img src={acc.avatar} alt={acc.name} className="account-avatar" />
                                        ) : (
                                            <div className={`account-avatar-placeholder platform-bg-${acc.platform}`}>
                                                {acc.platform === 'bluesky' ? <MessageCircle size={22} /> :
                                                    acc.platform === 'linkedin' ? <Linkedin size={22} /> :
                                                        acc.platform === 'telegram' ? <Send size={22} /> :
                                                            <MessageCircle size={22} />}
                                            </div>
                                        )}
                                        <div className="account-details">
                                            <span className="account-name">{acc.name}</span>
                                            <span className="account-username">
                                                {acc.username.startsWith('@') ? acc.username : `@${acc.username}`}
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
                                <MessageCircle size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Bluesky</span>
                                <span className="connect-card-desc">Decentralized social</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card telegram" onClick={() => setShowConnectTelegram(true)}>
                            <div className="connect-card-icon telegram-icon">
                                <Send size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Telegram</span>
                                <span className="connect-card-desc">Channels & groups</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card discord" onClick={() => setShowConnectDiscord(true)}>
                            <div className="connect-card-icon discord-icon">
                                <MessageCircle size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Discord</span>
                                <span className="connect-card-desc">Server webhooks</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card linkedin" onClick={() => setShowConnectLinkedIn(true)}>
                            <div className="connect-card-icon linkedin-icon">
                                <Linkedin size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">LinkedIn</span>
                                <span className="connect-card-desc">Professional network</span>
                            </div>
                            <span className="connect-card-arrow">→</span>
                        </button>

                        <button className="connect-card facebook" onClick={() => setShowConnectFacebook(true)}>
                            <div className="connect-card-icon facebook-icon" style={{ background: 'rgba(24, 119, 242, 0.15)', color: '#1877F2' }}>
                                <Globe size={24} />
                            </div>
                            <div className="connect-card-info">
                                <span className="connect-card-name">Facebook</span>
                                <span className="connect-card-desc">Pages & Groups</span>
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
        </>
    )
}

export default Dashboard
