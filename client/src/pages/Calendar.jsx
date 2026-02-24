import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import './Calendar.css'

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

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [calendarData, setCalendarData] = useState({})
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)

    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    useEffect(() => {
        fetchCalendar()
    }, [month, year])

    const fetchCalendar = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(
                `${API_URL}/posts/calendar?month=${month}&year=${year}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            )
            const data = await response.json()
            if (response.ok) {
                setCalendarData(data.data?.calendar || {})
            }
        } catch (err) {
            console.error('Failed to load calendar:', err)
        } finally {
            setLoading(false)
        }
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1))
        setSelectedDate(null)
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month, 1))
        setSelectedDate(null)
    }

    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(null)
    }

    // Generate calendar grid
    const getDaysInMonth = () => {
        const firstDay = new Date(year, month - 1, 1).getDay()
        const daysInMonth = new Date(year, month, 0).getDate()
        const days = []

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null)
        }

        for (let d = 1; d <= daysInMonth; d++) {
            days.push(d)
        }

        return days
    }

    const getDateKey = (day) => {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    const getDayData = (day) => {
        if (!day) return null
        const key = getDateKey(day)
        return calendarData[key] || null
    }

    const isToday = (day) => {
        if (!day) return false
        const today = new Date()
        return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()
    }

    const selectedDayData = selectedDate ? getDayData(selectedDate) : null

    return (
        <main className="dashboard-main w-full">
            <header className="dashboard-header">
                <div>
                    <h1><CalendarDays size={28} className="inline-icon" /> Content Calendar</h1>
                    <p>Visualize your publishing schedule at a glance</p>
                </div>
            </header>

            <div className="calendar-layout">
                {/* Calendar Grid */}
                <section className="glass-card calendar-grid-card">
                    {/* Month Nav */}
                    <div className="cal-month-nav">
                        <button className="cal-nav-btn" onClick={prevMonth}>
                            <ChevronLeft size={20} />
                        </button>
                        <div className="cal-month-title">
                            <h2>{MONTH_NAMES[month - 1]} {year}</h2>
                            <button className="cal-today-btn" onClick={goToToday}>Today</button>
                        </div>
                        <button className="cal-nav-btn" onClick={nextMonth}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="cal-grid cal-header-row">
                        {DAY_NAMES.map(d => (
                            <div key={d} className="cal-day-header">{d}</div>
                        ))}
                    </div>

                    {/* Calendar cells */}
                    <div className="cal-grid">
                        {getDaysInMonth().map((day, idx) => {
                            const data = getDayData(day)
                            const totalPosts = data
                                ? (data.scheduled?.length || 0) + (data.published?.length || 0)
                                : 0

                            return (
                                <div
                                    key={idx}
                                    className={`cal-cell ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${day === selectedDate ? 'selected' : ''} ${totalPosts > 0 ? 'has-posts' : ''}`}
                                    onClick={() => day && setSelectedDate(day === selectedDate ? null : day)}
                                >
                                    {day && (
                                        <>
                                            <span className="cal-day-num">{day}</span>
                                            {totalPosts > 0 && (
                                                <div className="cal-post-dots">
                                                    {data.scheduled?.slice(0, 3).map((p, i) => (
                                                        <span key={`s-${i}`} className={`cal-dot dot-${p.status}`} />
                                                    ))}
                                                    {data.published?.slice(0, 3).map((p, i) => (
                                                        <span key={`p-${i}`} className={`cal-dot dot-${p.status}`} />
                                                    ))}
                                                    {totalPosts > 3 && (
                                                        <span className="cal-dot-more">+{totalPosts - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div className="cal-legend">
                        <span className="cal-legend-item"><span className="cal-dot dot-scheduled" /> Scheduled</span>
                        <span className="cal-legend-item"><span className="cal-dot dot-published" /> Published</span>
                        <span className="cal-legend-item"><span className="cal-dot dot-success" /> Success</span>
                        <span className="cal-legend-item"><span className="cal-dot dot-failed" /> Failed</span>
                    </div>
                </section>

                {/* Day Detail Sidebar */}
                <section className="glass-card calendar-detail-card">
                    {selectedDate ? (
                        <>
                            <h3 className="cal-detail-title">
                                {MONTH_NAMES[month - 1]} {selectedDate}, {year}
                            </h3>

                            {selectedDayData ? (
                                <div className="cal-detail-posts">
                                    {/* Scheduled */}
                                    {selectedDayData.scheduled?.length > 0 && (
                                        <div className="cal-detail-group">
                                            <h4><Clock size={14} /> Scheduled ({selectedDayData.scheduled.length})</h4>
                                            {selectedDayData.scheduled.map((p, i) => (
                                                <div key={`s-${i}`} className={`cal-detail-item status-${p.status}`}>
                                                    <span className={`cal-detail-status badge-${p.status}`}>
                                                        {p.status}
                                                    </span>
                                                    <p>{p.content?.substring(0, 100)}{p.content?.length > 100 ? '...' : ''}</p>
                                                    <span className="cal-detail-time">
                                                        {new Date(p.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Published */}
                                    {selectedDayData.published?.length > 0 && (
                                        <div className="cal-detail-group">
                                            <h4><CheckCircle2 size={14} /> Published ({selectedDayData.published.length})</h4>
                                            {selectedDayData.published.map((p, i) => (
                                                <div key={`p-${i}`} className={`cal-detail-item ${p.status === 'success' ? 'status-published' : 'status-failed'}`}>
                                                    <div className="cal-detail-meta">
                                                        <span>{PLATFORM_ICONS[p.platform]} {p.platform}</span>
                                                        <span className={`cal-detail-status badge-${p.status}`}>
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                    <p>{p.content?.substring(0, 80)}{p.content?.length > 80 ? '...' : ''}</p>
                                                    <span className="cal-detail-time">
                                                        {new Date(p.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="cal-detail-empty">
                                    <span>📝</span>
                                    <p>No posts on this day</p>
                                    <a href="/scheduler" className="btn btn-primary btn-sm">Schedule a Post</a>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="cal-detail-empty">
                            <span>👈</span>
                            <h4>Select a day</h4>
                            <p>Click on any day to see its posts</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default Calendar
