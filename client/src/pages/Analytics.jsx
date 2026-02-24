import { useState, useEffect, useRef, useCallback } from 'react'
import API_URL from '../config/api'
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, Calendar, Globe, Clock, Activity } from 'lucide-react'
import './Analytics.css'

const PLATFORM_COLORS = {
    bluesky: '#0085FF',
    telegram: '#0088CC',
    discord: '#5865F2',
    linkedin: '#0077B5'
}

const PLATFORM_ICONS = {
    bluesky: '🦋',
    telegram: '✈️',
    discord: '🎮',
    linkedin: '💼'
}

function Analytics() {
    const [overview, setOverview] = useState(null)
    const [dailyStats, setDailyStats] = useState([])
    const [platformStats, setPlatformStats] = useState([])
    const [recentPosts, setRecentPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState(30)
    const chartRef = useRef(null)
    const platformChartRef = useRef(null)

    useEffect(() => {
        fetchAll()
    }, [period])

    const fetchAll = async () => {
        setLoading(true)
        const token = localStorage.getItem('accessToken')
        const headers = { 'Authorization': `Bearer ${token}` }

        try {
            const [ovRes, dayRes, platRes, recRes] = await Promise.all([
                fetch(`${API_URL}/analytics/overview`, { headers }),
                fetch(`${API_URL}/analytics/daily?days=${period}`, { headers }),
                fetch(`${API_URL}/analytics/platforms?days=${period}`, { headers }),
                fetch(`${API_URL}/analytics/recent?limit=15`, { headers })
            ])

            const [ovData, dayData, platData, recData] = await Promise.all([
                ovRes.json(), dayRes.json(), platRes.json(), recRes.json()
            ])

            if (ovData.success) setOverview(ovData.data)
            if (dayData.success) setDailyStats(dayData.data)
            if (platData.success) setPlatformStats(platData.data)
            if (recData.success) setRecentPosts(recData.data)
        } catch (err) {
            console.error('Analytics error:', err)
        } finally {
            setLoading(false)
        }
    }

    // Draw line chart on canvas
    const drawLineChart = useCallback(() => {
        const canvas = chartRef.current
        if (!canvas || dailyStats.length === 0) return

        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()

        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)

        const W = rect.width
        const H = rect.height
        const padding = { top: 20, right: 20, bottom: 30, left: 40 }
        const chartW = W - padding.left - padding.right
        const chartH = H - padding.top - padding.bottom

        ctx.clearRect(0, 0, W, H)

        const maxVal = Math.max(...dailyStats.map(d => d.total), 1)
        const stepX = chartW / Math.max(dailyStats.length - 1, 1)

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 1
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(W - padding.right, y)
            ctx.stroke()

            // Y labels
            ctx.fillStyle = 'rgba(255,255,255,0.3)'
            ctx.font = '10px Inter, sans-serif'
            ctx.textAlign = 'right'
            ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), padding.left - 6, y + 4)
        }

        // X labels (show every 7th)
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.textAlign = 'center'
        ctx.font = '9px Inter, sans-serif'
        dailyStats.forEach((d, i) => {
            if (i % 7 === 0 || i === dailyStats.length - 1) {
                const x = padding.left + stepX * i
                const label = d.date.substring(5) // MM-DD
                ctx.fillText(label, x, H - 8)
            }
        })

        // Draw success area
        const gradient = ctx.createLinearGradient(0, padding.top, 0, H - padding.bottom)
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

        ctx.beginPath()
        ctx.moveTo(padding.left, H - padding.bottom)
        dailyStats.forEach((d, i) => {
            const x = padding.left + stepX * i
            const y = padding.top + chartH - (d.total / maxVal) * chartH
            if (i === 0) ctx.lineTo(x, y)
            else ctx.lineTo(x, y)
        })
        ctx.lineTo(padding.left + stepX * (dailyStats.length - 1), H - padding.bottom)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw line
        ctx.beginPath()
        ctx.strokeStyle = '#8B5CF6'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        dailyStats.forEach((d, i) => {
            const x = padding.left + stepX * i
            const y = padding.top + chartH - (d.total / maxVal) * chartH
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        })
        ctx.stroke()

        // Draw dots on last 7 points
        dailyStats.slice(-7).forEach((d, i) => {
            const idx = dailyStats.length - 7 + i
            const x = padding.left + stepX * idx
            const y = padding.top + chartH - (d.total / maxVal) * chartH

            ctx.beginPath()
            ctx.arc(x, y, 3, 0, Math.PI * 2)
            ctx.fillStyle = '#8B5CF6'
            ctx.fill()
            ctx.strokeStyle = '#1a1a2e'
            ctx.lineWidth = 2
            ctx.stroke()
        })
    }, [dailyStats])

    // Draw platform bar chart
    const drawPlatformChart = useCallback(() => {
        const canvas = platformChartRef.current
        if (!canvas || platformStats.length === 0) return

        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()

        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        ctx.scale(dpr, dpr)

        const W = rect.width
        const H = rect.height
        const padding = { top: 10, right: 20, bottom: 30, left: 10 }
        const chartW = W - padding.left - padding.right
        const chartH = H - padding.top - padding.bottom

        ctx.clearRect(0, 0, W, H)

        const maxVal = Math.max(...platformStats.map(p => p.total), 1)
        const barWidth = Math.min(chartW / platformStats.length * 0.6, 60)
        const gap = (chartW - barWidth * platformStats.length) / (platformStats.length + 1)

        platformStats.forEach((p, i) => {
            const x = padding.left + gap * (i + 1) + barWidth * i
            const barH = (p.total / maxVal) * chartH
            const y = padding.top + chartH - barH
            const color = PLATFORM_COLORS[p.platform] || '#8B5CF6'

            // Bar with rounded top
            ctx.beginPath()
            const radius = Math.min(6, barWidth / 2)
            ctx.moveTo(x, y + radius)
            ctx.arcTo(x, y, x + barWidth, y, radius)
            ctx.arcTo(x + barWidth, y, x + barWidth, y + barH, radius)
            ctx.lineTo(x + barWidth, padding.top + chartH)
            ctx.lineTo(x, padding.top + chartH)
            ctx.closePath()

            const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH)
            grad.addColorStop(0, color)
            grad.addColorStop(1, color + '44')
            ctx.fillStyle = grad
            ctx.fill()

            // Label
            ctx.fillStyle = 'rgba(255,255,255,0.5)'
            ctx.font = '10px Inter, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(p.platform, x + barWidth / 2, H - 8)

            // Value on top
            ctx.fillStyle = 'rgba(255,255,255,0.7)'
            ctx.font = 'bold 11px Inter, sans-serif'
            ctx.fillText(p.total, x + barWidth / 2, y - 6)
        })
    }, [platformStats])

    useEffect(() => {
        drawLineChart()
        drawPlatformChart()
    }, [drawLineChart, drawPlatformChart])

    useEffect(() => {
        const handleResize = () => {
            drawLineChart()
            drawPlatformChart()
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [drawLineChart, drawPlatformChart])

    if (loading && !overview) {
        return (
            <main className="dashboard-main w-full">
                <div className="analytics-loading">
                    <div className="loading-spinner-wrap">
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                    </div>
                    <p>Loading analytics...</p>
                </div>
            </main>
        )
    }

    return (
        <main className="dashboard-main w-full">
            <header className="dashboard-header">
                <div>
                    <h1><BarChart3 size={28} className="inline-icon" /> Analytics</h1>
                    <p>Track your social media performance across all platforms</p>
                </div>
                <div className="analytics-period-toggle">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            className={`period-btn ${period === d ? 'active' : ''}`}
                            onClick={() => setPeriod(d)}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="analytics-stats-grid">
                <div className="glass-card stat-card stat-total">
                    <div className="stat-icon"><Activity size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{overview?.totalPosts || 0}</span>
                        <span className="stat-label">Total Posts</span>
                    </div>
                </div>

                <div className="glass-card stat-card stat-success">
                    <div className="stat-icon"><TrendingUp size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{overview?.successRate || 0}%</span>
                        <span className="stat-label">Success Rate</span>
                    </div>
                </div>

                <div className="glass-card stat-card stat-week">
                    <div className="stat-icon"><Calendar size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{overview?.weekPosts || 0}</span>
                        <span className="stat-label">This Week</span>
                    </div>
                </div>

                <div className="glass-card stat-card stat-platform">
                    <div className="stat-icon"><Globe size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-value">{overview?.topPlatform ? `${PLATFORM_ICONS[overview.topPlatform]} ${overview.topPlatform}` : '—'}</span>
                        <span className="stat-label">Top Platform</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="analytics-charts-grid">
                <section className="glass-card chart-card">
                    <h3>Posts Over Time <span className="chart-period">(Last {period} days)</span></h3>
                    <div className="chart-container">
                        <canvas
                            ref={chartRef}
                            className="analytics-canvas"
                        />
                    </div>
                    {dailyStats.length === 0 && (
                        <div className="chart-empty">
                            <p>No data yet. Start posting to see your chart!</p>
                        </div>
                    )}
                </section>

                <section className="glass-card chart-card">
                    <h3>Posts by Platform</h3>
                    <div className="chart-container chart-container-sm">
                        <canvas
                            ref={platformChartRef}
                            className="analytics-canvas"
                        />
                    </div>
                    {platformStats.length === 0 && (
                        <div className="chart-empty">
                            <p>No platform data yet.</p>
                        </div>
                    )}

                    {/* Platform stats list */}
                    {platformStats.length > 0 && (
                        <div className="platform-stats-list">
                            {platformStats.map(p => (
                                <div key={p.platform} className="platform-stat-row">
                                    <span className="platform-stat-icon">{PLATFORM_ICONS[p.platform]}</span>
                                    <span className="platform-stat-name">{p.platform}</span>
                                    <div className="platform-stat-bar-wrap">
                                        <div
                                            className="platform-stat-bar"
                                            style={{
                                                width: `${(p.total / Math.max(...platformStats.map(x => x.total), 1)) * 100}%`,
                                                background: PLATFORM_COLORS[p.platform]
                                            }}
                                        />
                                    </div>
                                    <span className="platform-stat-count">{p.success}/{p.total}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Recent Posts Table */}
            <section className="glass-card recent-posts-card">
                <h3><Clock size={18} /> Recent Activity</h3>
                {recentPosts.length === 0 ? (
                    <div className="chart-empty">
                        <p>No posts yet. Your recent activity will appear here.</p>
                    </div>
                ) : (
                    <div className="recent-posts-table-wrap">
                        <table className="recent-posts-table">
                            <thead>
                                <tr>
                                    <th>Platform</th>
                                    <th>Content</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPosts.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <span className="recent-platform">
                                                {PLATFORM_ICONS[p.platform]} {p.account_name || p.platform}
                                            </span>
                                        </td>
                                        <td className="recent-content">
                                            {p.content?.substring(0, 60)}{p.content?.length > 60 ? '...' : ''}
                                        </td>
                                        <td>
                                            <span className={`recent-type type-${p.post_type}`}>
                                                {p.post_type === 'scheduled' ? '⏰' : '⚡'} {p.post_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`recent-status status-${p.status}`}>
                                                {p.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="recent-time">
                                            {new Date(p.published_at).toLocaleDateString()} {new Date(p.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}

export default Analytics
