import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import { ChevronLeft, ChevronRight, CalendarDays, Clock, CheckCircle2 } from 'lucide-react'
import './Calendar.css'

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

// Holiday mode options
const HOLIDAY_MODES = [
    { key: 'OFF', label: 'Off', emoji: null },
    { key: 'IN', label: 'India 🇮🇳', emoji: '🇮🇳' },
    { key: 'GLOBAL', label: 'Global 🌏', emoji: '🌏' },
]

// =====================================================
// Hardcoded curated Indian festivals (Nager.Date only
// covers 3 gazette public holidays for India).
// These dates are accurate for 2025 and 2026.
// =====================================================
const INDIA_FESTIVALS = {
    // 2025
    '2025-01-14': 'Makar Sankranti / Pongal',
    '2025-01-23': 'Netaji Subhas Chandra Bose Jayanti',
    '2025-01-26': 'Republic Day',
    '2025-02-19': 'Chhatrapati Shivaji Maharaj Jayanti',
    '2025-02-26': 'Maha Shivratri',
    '2025-03-14': 'Holi (Dhulandi)',
    '2025-03-13': 'Holika Dahan',
    '2025-03-30': 'Ugadi / Gudi Padwa',
    '2025-03-31': 'Eid ul-Fitr',
    '2025-04-06': 'Ram Navami',
    '2025-04-10': 'Mahavir Jayanti',
    '2025-04-14': 'Dr. Ambedkar Jayanti / Tamil New Year',
    '2025-04-18': 'Good Friday',
    '2025-05-12': 'Buddha Purnima',
    '2025-06-07': 'Eid al-Adha (Bakrid)',
    '2025-07-06': 'Muharram',
    '2025-08-09': 'Raksha Bandhan',
    '2025-08-15': 'Independence Day',
    '2025-08-16': 'Janmashtami',
    '2025-09-05': 'Ganesh Chaturthi',
    '2025-10-02': 'Gandhi Jayanti',
    '2025-10-02': 'Gandhi Jayanti / Navratri Start',
    '2025-10-02': 'Dussehra (Vijayadasami)',
    '2025-10-13': 'Dussehra',
    '2025-10-20': 'Diwali (Lakshmi Puja)',
    '2025-10-21': 'Diwali (Govardhan Puja)',
    '2025-10-22': 'Bhai Dooj',
    '2025-11-05': 'Guru Nanak Jayanti',
    '2025-11-10': 'Chhath Puja',
    '2025-12-25': 'Christmas',
    // 2026
    '2026-01-14': 'Makar Sankranti / Pongal',
    '2026-01-26': 'Republic Day',
    '2026-02-17': 'Maha Shivratri',
    '2026-03-21': 'Holika Dahan',
    '2026-03-22': 'Holi (Dhulandi)',
    '2026-03-20': 'Eid ul-Fitr',
    '2026-03-30': 'Ugadi / Gudi Padwa',
    '2026-04-03': 'Good Friday',
    '2026-04-08': 'Mahavir Jayanti',
    '2026-04-14': 'Dr. Ambedkar Jayanti / Baisakhi',
    '2026-04-18': 'Ram Navami',
    '2026-04-30': 'Buddha Purnima',
    '2026-05-27': 'Eid al-Adha (Bakrid)',
    '2026-07-29': 'Raksha Bandhan',
    '2026-08-06': 'Janmashtami',
    '2026-08-15': 'Independence Day',
    '2026-08-25': 'Ganesh Chaturthi',
    '2026-10-02': 'Gandhi Jayanti',
    '2026-10-01': 'Dussehra (Vijayadasami)',
    '2026-10-09': 'Diwali (Lakshmi Puja)',
    '2026-10-10': 'Govardhan Puja',
    '2026-10-11': 'Bhai Dooj',
    '2026-10-14': 'Chhath Puja',
    '2026-11-24': 'Guru Nanak Jayanti',
    '2026-12-25': 'Christmas',
    // 2027 (upcoming)
    '2027-01-14': 'Makar Sankranti',
    '2027-01-26': 'Republic Day',
    '2027-03-11': 'Maha Shivratri',
    '2027-08-15': 'Independence Day',
    '2027-10-02': 'Gandhi Jayanti',
    '2027-10-29': 'Diwali',
}

// Holiday cache: { "US-2026": [...] }
const holidayCache = {}

async function fetchHolidays(countryCode, year) {
    const cacheKey = `${countryCode}-${year}`
    if (holidayCache[cacheKey]) return holidayCache[cacheKey]

    try {
        const res = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
        )
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        holidayCache[cacheKey] = data
        return data
    } catch {
        return []
    }
}

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [calendarData, setCalendarData] = useState({})
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)

    // Holiday state
    const [holidayMode, setHolidayMode] = useState('IN')       // 'OFF' | 'IN' | 'GLOBAL'
    const [holidays, setHolidays] = useState({})               // { "2026-01-26": "Republic Day" }
    const [holidaysLoading, setHolidaysLoading] = useState(false)

    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    // Fetch scheduled posts
    useEffect(() => {
        fetchCalendar()
    }, [month, year])

    // Fetch holidays when mode or month/year changes
    useEffect(() => {
        if (holidayMode === 'OFF') {
            setHolidays({})
            return
        }
        loadHolidays()
    }, [holidayMode, year])

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

    const loadHolidays = async () => {
        setHolidaysLoading(true)
        try {
            const map = {}

            if (holidayMode === 'IN') {
                // 1. Curated Indian festivals (covers Diwali, Holi, Eid, etc.)
                for (const [date, name] of Object.entries(INDIA_FESTIVALS)) {
                    if (date.startsWith(String(year))) {
                        map[date] = name
                    }
                }
                // 2. Also fetch Nager.Date API for any additional official holidays
                const apiHolidays = await fetchHolidays('IN', year)
                for (const h of apiHolidays) {
                    if (!map[h.date]) {
                        map[h.date] = h.localName || h.name
                    }
                }
            } else if (holidayMode === 'GLOBAL') {
                // Fetch US + UK from Nager (reliable global coverage)
                const [usa, uk] = await Promise.all([
                    fetchHolidays('US', year),
                    fetchHolidays('GB', year),
                ])
                // Add curated Indian ones too for Global mode
                for (const [date, name] of Object.entries(INDIA_FESTIVALS)) {
                    if (date.startsWith(String(year)) && !map[date]) {
                        map[date] = name
                    }
                }
                for (const h of [...usa, ...uk]) {
                    if (!map[h.date]) {
                        map[h.date] = h.localName || h.name
                    }
                }
            }

            setHolidays(map)
        } catch {
            setHolidays({})
        } finally {
            setHolidaysLoading(false)
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

    const getDaysInMonth = () => {
        const firstDay = new Date(year, month - 1, 1).getDay()
        const daysInMonth = new Date(year, month, 0).getDate()
        const days = []
        for (let i = 0; i < firstDay; i++) days.push(null)
        for (let d = 1; d <= daysInMonth; d++) days.push(d)
        return days
    }

    const getDateKey = (day) =>
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const getDayData = (day) => {
        if (!day) return null
        return calendarData[getDateKey(day)] || null
    }

    const getHoliday = (day) => {
        if (!day || holidayMode === 'OFF') return null
        return holidays[getDateKey(day)] || null
    }

    const isToday = (day) => {
        if (!day) return false
        const today = new Date()
        return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()
    }

    const selectedDayData = selectedDate ? getDayData(selectedDate) : null
    const selectedHoliday = selectedDate ? getHoliday(selectedDate) : null

    return (
        <main className="dashboard-main w-full">
            <header className="dashboard-header">
                <div>
                    <h1><CalendarDays size={28} className="inline-icon" /> Content Calendar</h1>
                    <p>Visualize your publishing schedule at a glance</p>
                </div>

                {/* Holiday Toggle */}
                <div className="cal-holiday-toggle">
                    {holidayMode !== 'OFF' && holidaysLoading && (
                        <span className="cal-holiday-loading">Loading holidays…</span>
                    )}
                    <div className="cal-holiday-tabs">
                        {HOLIDAY_MODES.map(m => (
                            <button
                                key={m.key}
                                className={`cal-holiday-tab ${holidayMode === m.key ? 'active' : ''}`}
                                onClick={() => setHolidayMode(m.key)}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
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
                            const holiday = getHoliday(day)
                            const totalPosts = data
                                ? (data.scheduled?.length || 0) + (data.published?.length || 0)
                                : 0

                            return (
                                <div
                                    key={idx}
                                    className={`cal-cell
                                        ${!day ? 'empty' : ''}
                                        ${isToday(day) ? 'today' : ''}
                                        ${day === selectedDate ? 'selected' : ''}
                                        ${totalPosts > 0 ? 'has-posts' : ''}
                                        ${holiday ? 'has-holiday' : ''}
                                    `}
                                    onClick={() => day && setSelectedDate(day === selectedDate ? null : day)}
                                >
                                    {day && (
                                        <>
                                            <span className="cal-day-num">{day}</span>

                                            {/* Holiday badge */}
                                            {holiday && (
                                                <div className="cal-holiday-badge">
                                                    <span className="cal-holiday-icon">
                                                        {holidayMode === 'IN' ? '🇮🇳' : '🌏'}
                                                    </span>
                                                    <span className="cal-holiday-name">{holiday}</span>
                                                </div>
                                            )}

                                            {/* Post dots */}
                                            {totalPosts > 0 && (
                                                <div className="cal-post-dots">
                                                    {data.scheduled?.slice(0, 2).map((p, i) => (
                                                        <span key={`s-${i}`} className={`cal-dot dot-${p.status}`} />
                                                    ))}
                                                    {data.published?.slice(0, 2).map((p, i) => (
                                                        <span key={`p-${i}`} className={`cal-dot dot-${p.status}`} />
                                                    ))}
                                                    {totalPosts > 4 && (
                                                        <span className="cal-dot-more">+{totalPosts - 4}</span>
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
                        {holidayMode !== 'OFF' && (
                            <span className="cal-legend-item">
                                <span className="cal-holiday-dot">{holidayMode === 'IN' ? '🇮🇳' : '🌏'}</span>
                                Holiday
                            </span>
                        )}
                    </div>
                </section>

                {/* Day Detail Sidebar */}
                <section className="glass-card calendar-detail-card">
                    {selectedDate ? (
                        <>
                            <h3 className="cal-detail-title">
                                {MONTH_NAMES[month - 1]} {selectedDate}, {year}
                            </h3>

                            {/* Holiday banner in sidebar */}
                            {selectedHoliday && (
                                <div className="cal-detail-holiday">
                                    <span>{holidayMode === 'IN' ? '🇮🇳' : '🌏'}</span>
                                    <div>
                                        <p className="cal-detail-holiday-label">Public Holiday</p>
                                        <p className="cal-detail-holiday-name">{selectedHoliday}</p>
                                    </div>
                                </div>
                            )}

                            {selectedDayData ? (
                                <div className="cal-detail-posts">
                                    {/* Scheduled */}
                                    {selectedDayData.scheduled?.length > 0 && (
                                        <div className="cal-detail-group">
                                            <h4><Clock size={14} /> Scheduled ({selectedDayData.scheduled.length})</h4>
                                            {selectedDayData.scheduled.map((p, i) => (
                                                <div key={`s-${i}`} className={`cal-detail-item status-${p.status}`}>
                                                    <span className={`cal-detail-status badge-${p.status}`}>{p.status}</span>
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
                                                        <span className={`cal-detail-status badge-${p.status}`}>{p.status}</span>
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
                                    {selectedHoliday && (
                                        <p className="cal-detail-hint">
                                            It's {selectedHoliday}! 🎉 A great day to engage your audience.
                                        </p>
                                    )}
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
