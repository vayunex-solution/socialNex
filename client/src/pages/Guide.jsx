import { Link } from 'react-router-dom'
import { BookOpen, Zap, CalendarDays, BarChart3, Bell, PenSquare, Settings, ArrowRight, Rocket } from 'lucide-react'
import './Dashboard.css'

const GUIDE_SECTIONS = [
    {
        icon: <Zap size={24} />,
        title: 'Connect Your Accounts',
        desc: 'Head to the Dashboard and click on any platform card (Bluesky, Telegram, Discord, LinkedIn) to link your social accounts. This is your first step to cross-platform posting.',
        link: '/dashboard',
        action: 'Go to Dashboard'
    },
    {
        icon: <PenSquare size={24} />,
        title: 'Create & Draft Posts',
        desc: 'Click "Create Post" to compose content. You can write once and publish to multiple platforms simultaneously. Add images, format text, and preview before posting.',
        link: '/create-post',
        action: 'Create a Post'
    },
    {
        icon: <CalendarDays size={24} />,
        title: 'Schedule Content',
        desc: 'Use the Scheduler to queue posts for the future. Pick a date and time, and SocialNex will auto-publish. Perfect for maintaining a consistent posting cadence.',
        link: '/scheduler',
        action: 'Open Scheduler'
    },
    {
        icon: <CalendarDays size={24} />,
        title: 'Content Calendar',
        desc: 'Visualize your entire month at a glance. Toggle Indian 🇮🇳 or Global 🌏 holiday overlays to plan your content around festivals and trending occasions.',
        link: '/calendar',
        action: 'View Calendar'
    },
    {
        icon: <BarChart3 size={24} />,
        title: 'Analytics & Insights',
        desc: 'Track your reach, engagement, and audience growth across all platforms. Use data to understand what\'s working and optimize your strategy.',
        link: '/analytics',
        action: 'View Analytics'
    },
    {
        icon: <Bell size={24} />,
        title: 'Smart Festival Alerts',
        desc: 'SocialNex automatically reminds you 3 days before major Indian festivals via email, so you never miss a high-engagement posting opportunity.',
        link: '/settings',
        action: 'Manage Alerts'
    },
    {
        icon: <Settings size={24} />,
        title: 'Settings & Notifications',
        desc: 'Customize your notification preferences, manage your alert email, update your profile, change your password, and configure your account security.',
        link: '/settings',
        action: 'Open Settings'
    }
]

function Guide() {
    return (
        <main className="dashboard-main w-full">
            <header className="dashboard-header">
                <div>
                    <h1 className="flex-center gap-2"><BookOpen size={28} /> SocialNex Guide</h1>
                    <p>Everything you need to master your social media game</p>
                </div>
                <Link to="/create-post" className="btn btn-primary">
                    <PenSquare size={18} style={{ marginRight: '6px' }} />
                    Start Posting
                </Link>
            </header>

            {/* Welcome Card */}
            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                <h2 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 700 }}>Welcome to SocialNex!</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '600px', marginInline: 'auto', lineHeight: 1.6 }}>
                    SocialNex is your all-in-one social media command center. Connect your accounts, create stunning posts,
                    schedule them across platforms, and track your growth — all from one beautiful dashboard.
                </p>
            </div>

            {/* Guide Sections */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {GUIDE_SECTIONS.map((section, i) => (
                    <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                        }}>
                            {section.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600 }}>
                                <span style={{ color: 'var(--text-muted)', marginRight: '8px', fontSize: '14px' }}>0{i + 1}</span>
                                {section.title}
                            </h3>
                            <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                                {section.desc}
                            </p>
                            <Link to={section.link} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                {section.action} <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help Footer */}
            <div className="glass-card" style={{ padding: '24px', marginTop: '24px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                    💬 Need help? Contact us at <a href="mailto:support@vayunexsolution.com" style={{ color: 'var(--accent)' }}>support@vayunexsolution.com</a>
                    &nbsp;or reply to any SocialNex email.
                </p>
            </div>
        </main>
    )
}

export default Guide
