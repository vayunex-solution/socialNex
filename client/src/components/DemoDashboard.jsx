import { useState } from 'react'
import './DemoDashboard.css'

/* ═══════════════════════════════════════
   FAKE DATA
   ═══════════════════════════════════════ */
const STATS = [
    { icon: '📊', value: '2,847', label: 'Total Posts', change: '+12%', up: true },
    { icon: '👥', value: '18.5K', label: 'Followers', change: '+8.3%', up: true },
    { icon: '💜', value: '94.2K', label: 'Engagements', change: '+23%', up: true },
    { icon: '📈', value: '67%', label: 'Success Rate', change: '+5%', up: true },
]

const POSTS = [
    { id: 1, platform: 'LinkedIn', platformIcon: '💼', platformColor: '#0A66C2', text: '🚀 Excited to announce our new AI-powered analytics dashboard! Track your social media growth like never before...', time: '2 hours ago', likes: 142, comments: 23, status: 'published' },
    { id: 2, platform: 'Bluesky', platformIcon: '🦋', platformColor: '#0085FF', text: 'Just shipped a major update to SocialNex! Now supporting 6+ platforms with one-click posting ✨', time: '5 hours ago', likes: 89, comments: 12, status: 'published' },
    { id: 3, platform: 'Discord', platformIcon: '🎮', platformColor: '#5865F2', text: '📢 Community Update: New scheduler feature is live! Set it and forget it — your posts go out on autopilot.', time: '1 day ago', likes: 234, comments: 45, status: 'published' },
    { id: 4, platform: 'Telegram', platformIcon: '✈️', platformColor: '#26A5E4', text: '🎯 Pro tip: Use our AI poster generator to create stunning visuals in seconds. No designer needed!', time: 'Scheduled • Tomorrow 9:00 AM', likes: '-', comments: '-', status: 'scheduled' },
]

const SCHEDULE = [
    { time: '09:00 AM', platform: 'LinkedIn', text: 'Weekly industry insights thread...', color: '#0A66C2' },
    { time: '12:30 PM', platform: 'Bluesky', text: 'Product update announcement...', color: '#0085FF' },
    { time: '03:00 PM', platform: 'Discord', text: 'Community engagement post...', color: '#5865F2' },
    { time: '06:00 PM', platform: 'Telegram', text: 'Evening tips & tricks...', color: '#26A5E4' },
    { time: '09:00 PM', platform: 'Reddit', text: 'AMA session announcement...', color: '#FF4500' },
]

const ANALYTICS_BARS = [
    { day: 'Mon', val: 65 }, { day: 'Tue', val: 82 }, { day: 'Wed', val: 45 },
    { day: 'Thu', val: 93 }, { day: 'Fri', val: 71 }, { day: 'Sat', val: 55 }, { day: 'Sun', val: 88 },
]

const PLATFORMS_ANALYTICS = [
    { name: 'LinkedIn', posts: 847, engagement: '4.2%', color: '#0A66C2' },
    { name: 'Bluesky', posts: 623, engagement: '6.8%', color: '#0085FF' },
    { name: 'Discord', posts: 534, engagement: '8.1%', color: '#5865F2' },
    { name: 'Telegram', posts: 445, engagement: '3.9%', color: '#26A5E4' },
    { name: 'Reddit', posts: 298, engagement: '5.4%', color: '#FF4500' },
    { name: 'Mastodon', posts: 100, engagement: '7.2%', color: '#6364FF' },
]

const SIDEBAR_ITEMS = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'create', icon: '✏️', label: 'Create Post' },
    { id: 'scheduler', icon: '📅', label: 'Scheduler' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'activity', icon: '📋', label: 'Activity Logs' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
]

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */
function DemoDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [createText, setCreateText] = useState('')
    const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin', 'bluesky'])
    const [aiLoading, setAiLoading] = useState(false)

    const togglePlatform = (p) => {
        setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
    }

    const handleAiGenerate = () => {
        setAiLoading(true)
        setTimeout(() => {
            setCreateText('🚀 Exciting news! We just launched our AI-powered social media management tool that saves you 10+ hours every week. Try it free today!\n\n#SocialMedia #AI #Marketing #ContentCreation #SaaS')
            setAiLoading(false)
        }, 1500)
    }

    return (
        <div className="demo-wrap">
            {/* Sidebar */}
            <aside className="demo-sidebar">
                <div className="demo-sidebar-logo">
                    <span className="demo-logo-s">S</span>
                    <span className="demo-logo-text">Social<span className="demo-logo-nex">Nex</span></span>
                </div>
                <nav className="demo-sidebar-nav">
                    {SIDEBAR_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`demo-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="demo-nav-icon">{item.icon}</span>
                            <span className="demo-nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="demo-sidebar-user">
                    <div className="demo-user-avatar">Y</div>
                    <div className="demo-user-info">
                        <span className="demo-user-name">Yash</span>
                        <span className="demo-user-role">Admin</span>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="demo-main">
                {/* Header */}
                <header className="demo-header">
                    <div>
                        <h2 className="demo-header-title">
                            {activeTab === 'dashboard' && '🏠 Dashboard'}
                            {activeTab === 'create' && '✏️ Create Post'}
                            {activeTab === 'scheduler' && '📅 Scheduler'}
                            {activeTab === 'analytics' && '📊 Analytics'}
                            {activeTab === 'activity' && '📋 Activity Logs'}
                            {activeTab === 'settings' && '⚙️ Settings'}
                        </h2>
                        <p className="demo-header-sub">
                            {activeTab === 'dashboard' && 'Welcome back! Here\'s your social media overview.'}
                            {activeTab === 'create' && 'Create and publish across all platforms.'}
                            {activeTab === 'scheduler' && 'Your upcoming scheduled posts.'}
                            {activeTab === 'analytics' && 'Track performance across all platforms.'}
                            {activeTab === 'activity' && 'Recent activity and logs.'}
                            {activeTab === 'settings' && 'Manage your account settings.'}
                        </p>
                    </div>
                    <div className="demo-header-actions">
                        <span className="demo-bell">🔔</span>
                        <span className="demo-badge-live">● Live Demo</span>
                    </div>
                </header>

                {/* ═══ DASHBOARD VIEW ═══ */}
                {activeTab === 'dashboard' && (
                    <div className="demo-content">
                        <div className="demo-stats-grid">
                            {STATS.map((s, i) => (
                                <div key={i} className="demo-stat-card">
                                    <div className="demo-stat-icon">{s.icon}</div>
                                    <div className="demo-stat-info">
                                        <span className="demo-stat-value">{s.value}</span>
                                        <span className="demo-stat-label">{s.label}</span>
                                    </div>
                                    <span className={`demo-stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span>
                                </div>
                            ))}
                        </div>
                        <div className="demo-posts-section">
                            <h3 className="demo-section-title">📋 Recent Posts</h3>
                            <div className="demo-posts-list">
                                {POSTS.map(post => (
                                    <div key={post.id} className="demo-post-card">
                                        <div className="demo-post-header">
                                            <span className="demo-post-platform" style={{ background: `${post.platformColor}20`, color: post.platformColor }}>
                                                {post.platformIcon} {post.platform}
                                            </span>
                                            <span className={`demo-post-status ${post.status}`}>
                                                {post.status === 'published' ? '✅ Published' : '⏰ Scheduled'}
                                            </span>
                                        </div>
                                        <p className="demo-post-text">{post.text}</p>
                                        <div className="demo-post-footer">
                                            <span className="demo-post-time">{post.time}</span>
                                            <div className="demo-post-metrics">
                                                <span>❤️ {post.likes}</span>
                                                <span>💬 {post.comments}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ CREATE POST VIEW ═══ */}
                {activeTab === 'create' && (
                    <div className="demo-content">
                        <div className="demo-create-card">
                            <div className="demo-create-platforms">
                                <span className="demo-create-label">Post to:</span>
                                {[{ id: 'linkedin', icon: '💼', name: 'LinkedIn' }, { id: 'bluesky', icon: '🦋', name: 'Bluesky' }, { id: 'discord', icon: '🎮', name: 'Discord' }, { id: 'telegram', icon: '✈️', name: 'Telegram' }, { id: 'reddit', icon: '🔴', name: 'Reddit' }].map(p => (
                                    <button key={p.id} className={`demo-plat-btn ${selectedPlatforms.includes(p.id) ? 'selected' : ''}`} onClick={() => togglePlatform(p.id)}>
                                        {p.icon} {p.name}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="demo-create-textarea"
                                placeholder="What's on your mind? Write your post here..."
                                value={createText}
                                onChange={(e) => setCreateText(e.target.value)}
                                rows={5}
                            />
                            <div className="demo-create-actions">
                                <button className="demo-ai-btn" onClick={handleAiGenerate} disabled={aiLoading}>
                                    {aiLoading ? '⏳ Generating...' : '🤖 AI Generate'}
                                </button>
                                <div className="demo-create-right">
                                    <button className="demo-schedule-btn">📅 Schedule</button>
                                    <button className="demo-publish-btn">🚀 Publish Now</button>
                                </div>
                            </div>
                        </div>
                        <div className="demo-create-preview">
                            <h3 className="demo-section-title">👀 Live Preview</h3>
                            <div className="demo-preview-card">
                                <div className="demo-preview-header">
                                    <div className="demo-preview-avatar">Y</div>
                                    <div>
                                        <span className="demo-preview-name">Yash • Vayunex Solution</span>
                                        <span className="demo-preview-time">Just now</span>
                                    </div>
                                </div>
                                <p className="demo-preview-text">{createText || 'Your post preview will appear here...'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ SCHEDULER VIEW ═══ */}
                {activeTab === 'scheduler' && (
                    <div className="demo-content">
                        <div className="demo-schedule-header">
                            <h3 className="demo-section-title">📅 Today's Schedule</h3>
                            <span className="demo-schedule-date">Wed, Feb 26, 2026</span>
                        </div>
                        <div className="demo-schedule-timeline">
                            {SCHEDULE.map((s, i) => (
                                <div key={i} className="demo-schedule-item">
                                    <div className="demo-schedule-time">{s.time}</div>
                                    <div className="demo-schedule-line">
                                        <div className="demo-schedule-dot" style={{ background: s.color }}></div>
                                    </div>
                                    <div className="demo-schedule-card">
                                        <span className="demo-schedule-plat" style={{ color: s.color }}>{s.platform}</span>
                                        <p className="demo-schedule-text">{s.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══ ANALYTICS VIEW ═══ */}
                {activeTab === 'analytics' && (
                    <div className="demo-content">
                        <div className="demo-analytics-chart">
                            <h3 className="demo-section-title">📈 Weekly Engagement</h3>
                            <div className="demo-chart-bars">
                                {ANALYTICS_BARS.map((b, i) => (
                                    <div key={i} className="demo-bar-col">
                                        <div className="demo-bar" style={{ height: `${b.val}%` }}>
                                            <span className="demo-bar-val">{b.val}</span>
                                        </div>
                                        <span className="demo-bar-label">{b.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="demo-platform-table">
                            <h3 className="demo-section-title">🌐 Platform Breakdown</h3>
                            <div className="demo-table">
                                <div className="demo-table-head">
                                    <span>Platform</span><span>Posts</span><span>Engagement</span>
                                </div>
                                {PLATFORMS_ANALYTICS.map((p, i) => (
                                    <div key={i} className="demo-table-row">
                                        <span className="demo-table-plat"><span className="demo-table-dot" style={{ background: p.color }}></span>{p.name}</span>
                                        <span>{p.posts}</span>
                                        <span className="demo-table-eng">{p.engagement}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ ACTIVITY LOGS VIEW ═══ */}
                {activeTab === 'activity' && (
                    <div className="demo-content">
                        <h3 className="demo-section-title">📋 Recent Activity</h3>
                        {[
                            { icon: '🚀', text: 'Published post to LinkedIn', time: '2 min ago', type: 'success' },
                            { icon: '📅', text: 'Scheduled post for Bluesky', time: '15 min ago', type: 'info' },
                            { icon: '🔗', text: 'Connected Reddit account', time: '1 hour ago', type: 'success' },
                            { icon: '🤖', text: 'AI generated poster for Instagram', time: '2 hours ago', type: 'info' },
                            { icon: '⚠️', text: 'Telegram post failed — retrying', time: '3 hours ago', type: 'warning' },
                            { icon: '✅', text: 'Telegram post retry successful', time: '3 hours ago', type: 'success' },
                            { icon: '🔐', text: 'Login from new device detected', time: '5 hours ago', type: 'warning' },
                            { icon: '📊', text: 'Weekly analytics report generated', time: '1 day ago', type: 'info' },
                        ].map((log, i) => (
                            <div key={i} className={`demo-activity-item ${log.type}`}>
                                <span className="demo-activity-icon">{log.icon}</span>
                                <span className="demo-activity-text">{log.text}</span>
                                <span className="demo-activity-time">{log.time}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══ SETTINGS VIEW ═══ */}
                {activeTab === 'settings' && (
                    <div className="demo-content">
                        <h3 className="demo-section-title">⚙️ Account Settings</h3>
                        <div className="demo-settings-grid">
                            <div className="demo-setting-card">
                                <h4>👤 Profile</h4>
                                <div className="demo-setting-row"><span>Name</span><span className="demo-setting-val">Yash</span></div>
                                <div className="demo-setting-row"><span>Email</span><span className="demo-setting-val">yash@vayunexsolution.com</span></div>
                                <div className="demo-setting-row"><span>Role</span><span className="demo-setting-val">Admin</span></div>
                            </div>
                            <div className="demo-setting-card">
                                <h4>🔗 Connected Accounts</h4>
                                <div className="demo-setting-row"><span>💼 LinkedIn</span><span className="demo-connected">● Connected</span></div>
                                <div className="demo-setting-row"><span>🦋 Bluesky</span><span className="demo-connected">● Connected</span></div>
                                <div className="demo-setting-row"><span>🎮 Discord</span><span className="demo-connected">● Connected</span></div>
                                <div className="demo-setting-row"><span>✈️ Telegram</span><span className="demo-connected">● Connected</span></div>
                                <div className="demo-setting-row"><span>🔴 Reddit</span><span className="demo-pending">○ Pending</span></div>
                            </div>
                            <div className="demo-setting-card">
                                <h4>🔔 Notifications</h4>
                                <div className="demo-setting-row"><span>Login Alerts</span><span className="demo-toggle on">ON</span></div>
                                <div className="demo-setting-row"><span>Post Failure Alerts</span><span className="demo-toggle on">ON</span></div>
                                <div className="demo-setting-row"><span>Holiday Reminders</span><span className="demo-toggle on">ON</span></div>
                                <div className="demo-setting-row"><span>Weekly Report</span><span className="demo-toggle off">OFF</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default DemoDashboard
