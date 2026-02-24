import { useState, useEffect, useRef } from 'react'
import API_URL from '../config/api'
import { Clock, Send, Trash2, Edit3, CalendarDays, CheckCircle2, AlertCircle, XCircle, Loader2, MessageCircle, Linkedin, Rocket } from 'lucide-react'
import './Scheduler.css'

const PLATFORM_ICONS = {
    bluesky: '🦋',
    telegram: '✈️',
    discord: '🎮',
    linkedin: '💼'
}

function Scheduler() {
    const [accounts, setAccounts] = useState([])
    const [selectedAccounts, setSelectedAccounts] = useState([])
    const [postText, setPostText] = useState('')
    const [scheduledAt, setScheduledAt] = useState('')
    const [scheduledPosts, setScheduledPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingPosts, setLoadingPosts] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchAccounts()
        fetchScheduledPosts()
    }, [])

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(`${API_URL}/social/accounts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) setAccounts(data.data || [])
        } catch (err) {
            console.error('Failed to fetch accounts:', err)
        }
    }

    const fetchScheduledPosts = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const url = filter === 'all'
                ? `${API_URL}/posts/scheduled`
                : `${API_URL}/posts/scheduled?status=${filter}`
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) setScheduledPosts(data.data || [])
        } catch (err) {
            console.error('Failed to fetch scheduled posts:', err)
        } finally {
            setLoadingPosts(false)
        }
    }

    useEffect(() => {
        setLoadingPosts(true)
        fetchScheduledPosts()
    }, [filter])

    const toggleAccount = (accId) => {
        setSelectedAccounts(prev =>
            prev.includes(accId)
                ? prev.filter(id => id !== accId)
                : [...prev, accId]
        )
        setError('')
    }

    const handleSchedule = async (e) => {
        e.preventDefault()
        if (!postText.trim()) return setError('Post text cannot be empty.')
        if (selectedAccounts.length === 0) return setError('Select at least one platform.')
        if (!scheduledAt) return setError('Please select a date and time.')

        const schedDate = new Date(scheduledAt)
        if (schedDate <= new Date()) return setError('Scheduled time must be in the future.')

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(`${API_URL}/posts/scheduled`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: postText,
                    accountIds: selectedAccounts,
                    scheduledAt: scheduledAt,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            })

            const data = await response.json()

            if (data.success) {
                setSuccess(`✅ Post scheduled for ${schedDate.toLocaleString()}`)
                setPostText('')
                setScheduledAt('')
                setSelectedAccounts([])
                fetchScheduledPosts()
                setTimeout(() => setSuccess(''), 4000)
            } else {
                setError(data.message || 'Failed to schedule post.')
            }
        } catch (err) {
            setError('Network error. Check connection.')
        } finally {
            setLoading(false)
        }
    }

    const cancelPost = async (postId) => {
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(`${API_URL}/posts/scheduled/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                fetchScheduledPosts()
            }
        } catch (err) {
            console.error('Cancel failed:', err)
        }
    }

    const getStatusBadge = (status) => {
        const map = {
            scheduled: { cls: 'badge-scheduled', icon: <Clock size={12} />, label: 'Scheduled' },
            publishing: { cls: 'badge-publishing', icon: <Loader2 size={12} className="spin" />, label: 'Publishing...' },
            published: { cls: 'badge-published', icon: <CheckCircle2 size={12} />, label: 'Published' },
            failed: { cls: 'badge-failed', icon: <AlertCircle size={12} />, label: 'Failed' },
            cancelled: { cls: 'badge-cancelled', icon: <XCircle size={12} />, label: 'Cancelled' }
        }
        const s = map[status] || map.scheduled
        return <span className={`sched-badge ${s.cls}`}>{s.icon} {s.label}</span>
    }

    const getMinDateTime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() + 5) // At least 5 min in the future
        return now.toISOString().slice(0, 16)
    }

    const getPlatformsForPost = (post) => {
        const ids = post.account_ids || []
        return accounts.filter(a => ids.includes(a.id)).map(a => a.platform)
    }

    return (
        <main className="dashboard-main w-full">
            <header className="dashboard-header">
                <div>
                    <h1><Rocket size={28} className="inline-icon" /> Post Scheduler</h1>
                    <p>Schedule posts to publish automatically at the perfect time</p>
                </div>
            </header>

            <div className="scheduler-layout">
                {/* Create Scheduled Post Form */}
                <section className="glass-card scheduler-form-card">
                    <h3><CalendarDays size={20} /> Schedule a Post</h3>

                    <form onSubmit={handleSchedule}>
                        {/* Platform selector */}
                        <div className="sched-platforms">
                            <label>Post to:</label>
                            <div className="sched-platform-chips">
                                {accounts.map(acc => (
                                    <button
                                        key={acc.id}
                                        type="button"
                                        className={`sched-chip ${selectedAccounts.includes(acc.id) ? 'active' : ''} platform-${acc.platform}`}
                                        onClick={() => toggleAccount(acc.id)}
                                    >
                                        <span>{PLATFORM_ICONS[acc.platform]}</span>
                                        <span>{acc.name || acc.platform}</span>
                                    </button>
                                ))}
                                {accounts.length === 0 && (
                                    <p className="text-muted text-sm">No accounts connected. Connect from Dashboard first.</p>
                                )}
                            </div>
                        </div>

                        {/* Text area */}
                        <div className="sched-textarea-wrap">
                            <textarea
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                placeholder="What do you want to post?"
                                rows={4}
                                className="sched-textarea"
                            />
                            <span className="sched-char-count">{postText.length} chars</span>
                        </div>

                        {/* Date/Time picker */}
                        <div className="sched-datetime">
                            <label><Clock size={16} /> Schedule for:</label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                min={getMinDateTime()}
                                className="sched-datetime-input"
                            />
                        </div>

                        {error && <div className="sched-error"><AlertCircle size={14} /> {error}</div>}
                        {success && <div className="sched-success"><CheckCircle2 size={14} /> {success}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary sched-submit-btn"
                            disabled={loading || !postText.trim() || selectedAccounts.length === 0 || !scheduledAt}
                        >
                            {loading ? <><Loader2 size={16} className="spin" /> Scheduling...</> : <><CalendarDays size={16} /> Schedule Post</>}
                        </button>
                    </form>
                </section>

                {/* Scheduled Posts List */}
                <section className="glass-card scheduler-list-card">
                    <div className="sched-list-header">
                        <h3><Clock size={20} /> Scheduled Posts</h3>
                        <div className="sched-filters">
                            {['all', 'scheduled', 'published', 'failed', 'cancelled'].map(f => (
                                <button
                                    key={f}
                                    className={`sched-filter-btn ${filter === f ? 'active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingPosts ? (
                        <div className="sched-loading">
                            <div className="loading-spinner-wrap">
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                                <span className="loading-dot"></span>
                            </div>
                            <p>Loading posts...</p>
                        </div>
                    ) : scheduledPosts.length === 0 ? (
                        <div className="sched-empty">
                            <span className="sched-empty-icon">📭</span>
                            <h4>No {filter === 'all' ? '' : filter} posts</h4>
                            <p>Schedule your first post using the form above!</p>
                        </div>
                    ) : (
                        <div className="sched-posts-list">
                            {scheduledPosts.map(post => (
                                <div key={post.id} className={`sched-post-item status-${post.status}`}>
                                    <div className="sched-post-top">
                                        {getStatusBadge(post.status)}
                                        <span className="sched-post-time">
                                            <Clock size={12} />
                                            {new Date(post.scheduled_at).toLocaleString()}
                                        </span>
                                    </div>

                                    <p className="sched-post-content">{post.content}</p>

                                    <div className="sched-post-bottom">
                                        <div className="sched-post-platforms">
                                            {getPlatformsForPost(post).map(p => (
                                                <span key={p} className={`sched-platform-dot platform-${p}`}>
                                                    {PLATFORM_ICONS[p]}
                                                </span>
                                            ))}
                                            {getPlatformsForPost(post).length === 0 && (
                                                <span className="text-muted text-xs">{(post.account_ids || []).length} account(s)</span>
                                            )}
                                        </div>

                                        {post.status === 'scheduled' && (
                                            <button
                                                className="sched-cancel-btn"
                                                onClick={() => cancelPost(post.id)}
                                                title="Cancel this post"
                                            >
                                                <Trash2 size={14} /> Cancel
                                            </button>
                                        )}

                                        {post.status === 'failed' && post.error_message && (
                                            <span className="sched-error-msg" title={post.error_message}>
                                                <AlertCircle size={12} /> {post.error_message.substring(0, 60)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default Scheduler
