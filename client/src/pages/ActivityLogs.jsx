import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import {
    LogIn, LogOut, Key, CheckCircle2, XCircle, Link2, Link2Off,
    Calendar, Settings, Loader2, Activity
} from 'lucide-react'
import './ActivityLogs.css'

// Map action strings to icon + label + accent
const ACTION_META = {
    LOGIN_SUCCESS: { icon: LogIn, label: 'Logged In', accent: 'green' },
    LOGIN_FAILED: { icon: XCircle, label: 'Login Failed', accent: 'red' },
    LOGOUT: { icon: LogOut, label: 'Logged Out', accent: 'muted' },
    PASSWORD_CHANGED: { icon: Key, label: 'Password Changed', accent: 'yellow' },
    PASSWORD_RESET: { icon: Key, label: 'Password Reset', accent: 'yellow' },
    EMAIL_VERIFIED: { icon: CheckCircle2, label: 'Account Created', accent: 'purple' },
    ACCOUNT_CONNECTED: { icon: Link2, label: 'Account Connected', accent: 'blue' },
    ACCOUNT_REMOVED: { icon: Link2Off, label: 'Account Removed', accent: 'red' },
    POST_CREATED: { icon: Calendar, label: 'Post Created', accent: 'blue' },
    POST_PUBLISHED: { icon: CheckCircle2, label: 'Post Published', accent: 'green' },
    POST_FAILED: { icon: XCircle, label: 'Post Failed', accent: 'red' },
    POST_SCHEDULED: { icon: Calendar, label: 'Post Scheduled', accent: 'purple' },
    POST_CANCELLED: { icon: XCircle, label: 'Post Cancelled', accent: 'muted' },
    SETTINGS_UPDATED: { icon: Settings, label: 'Settings Updated', accent: 'muted' },
}

function formatRelative(dateStr) {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffS = Math.floor(diffMs / 1000)
    const diffM = Math.floor(diffS / 60)
    const diffH = Math.floor(diffM / 60)
    const diffD = Math.floor(diffH / 24)

    if (diffS < 60) return 'Just now'
    if (diffM < 60) return `${diffM}m ago`
    if (diffH < 24) return `${diffH}h ago`
    if (diffD < 7) return `${diffD}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDetail(details) {
    if (!details) return null
    const parts = []
    if (details.platform) parts.push(`Platform: ${details.platform}`)
    if (details.ip && details.ip !== 'Unknown') parts.push(`IP: ${details.ip}`)
    if (details.accountName) parts.push(details.accountName)
    if (details.error) parts.push(`Error: ${details.error}`)
    return parts.length ? parts.join(' · ') : null
}

export default function ActivityLogs() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [filter, setFilter] = useState('ALL')
    const token = localStorage.getItem('accessToken')

    const FILTERS = ['ALL', 'LOGIN', 'POST', 'ACCOUNT', 'SECURITY']

    useEffect(() => {
        fetchLogs(1)
    }, [])

    async function fetchLogs(p = 1) {
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/settings/activity?page=${p}&limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setLogs(data.data)
                setTotal(data.pagination.total)
                setPage(p)
            }
        } catch (err) {
            console.error('Failed to load logs:', err)
        } finally {
            setLoading(false)
        }
    }

    // Client-side filter
    const filteredLogs = logs.filter(log => {
        if (filter === 'ALL') return true
        if (filter === 'LOGIN') return log.action.startsWith('LOGIN') || log.action === 'LOGOUT'
        if (filter === 'POST') return log.action.startsWith('POST')
        if (filter === 'ACCOUNT') return log.action.startsWith('ACCOUNT')
        if (filter === 'SECURITY') return ['PASSWORD_CHANGED', 'PASSWORD_RESET', 'EMAIL_VERIFIED'].includes(log.action)
        return true
    })

    // Group by date
    const grouped = filteredLogs.reduce((acc, log) => {
        const date = new Date(log.createdAt).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
        if (!acc[date]) acc[date] = []
        acc[date].push(log)
        return acc
    }, {})

    return (
        <div className="logs-page">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Activity Logs</h1>
                    <p className="dashboard-subtitle">A full history of everything that happened on your account</p>
                </div>
                <div className="logs-total-badge">
                    <Activity size={14} />
                    {total} Events
                </div>
            </div>

            {/* Filters */}
            <div className="logs-filters">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className={`logs-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="logs-loading">
                    <Loader2 size={32} className="spin" />
                    <p>Loading activity...</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="glass-card logs-empty">
                    <span>📋</span>
                    <h3>No activity yet</h3>
                    <p>Your actions will appear here as you use SocialNex.</p>
                </div>
            ) : (
                <div className="logs-timeline">
                    {Object.entries(grouped).map(([date, dayLogs]) => (
                        <div key={date} className="logs-day-group">
                            <div className="logs-day-label">{date}</div>
                            <div className="logs-day-items">
                                {dayLogs.map(log => {
                                    const meta = ACTION_META[log.action] || { icon: Activity, label: log.action, accent: 'muted' }
                                    const Icon = meta.icon
                                    const detail = formatDetail(log.details)
                                    return (
                                        <div key={log.id} className={`logs-item accent-${meta.accent}`}>
                                            <div className={`logs-item-icon accent-${meta.accent}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="logs-item-connector" />
                                            <div className="logs-item-body">
                                                <div className="logs-item-header">
                                                    <span className="logs-item-label">{meta.label}</span>
                                                    <span className="logs-item-time">{formatRelative(log.createdAt)}</span>
                                                </div>
                                                {detail && (
                                                    <p className="logs-item-detail">{detail}</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
