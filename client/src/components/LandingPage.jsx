import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

// Platform data
const platforms = [
    { name: 'Bluesky', icon: '🦋', status: 'available', color: '#0085FF' },
    { name: 'Mastodon', icon: '🐘', status: 'available', color: '#6364FF' },
    { name: 'Telegram', icon: '📱', status: 'available', color: '#0088CC' },
    { name: 'Discord', icon: '💬', status: 'available', color: '#5865F2' },
    { name: 'Reddit', icon: '🔴', status: 'available', color: '#FF4500' },
    { name: 'Facebook', icon: '📘', status: 'coming', color: '#1877F2' },
    { name: 'Instagram', icon: '📸', status: 'coming', color: '#E4405F' },
    { name: 'Twitter/X', icon: '🐦', status: 'coming', color: '#1DA1F2' },
    { name: 'LinkedIn', icon: '💼', status: 'coming', color: '#0A66C2' },
    { name: 'TikTok', icon: '🎵', status: 'coming', color: '#000000' },
]

const features = [
    {
        icon: '🚀',
        title: 'Multi-Platform Posting',
        description: 'Post to Bluesky, Telegram, Discord, LinkedIn & more from one dashboard. Save hours every week.'
    },
    {
        icon: '📅',
        title: 'Smart Post Scheduler',
        description: 'Schedule posts days in advance with a visual date-time picker. Your content goes live while you sleep.'
    },
    {
        icon: '📊',
        title: 'Analytics Dashboard',
        description: 'Track performance across all platforms with beautiful charts. Know what works and double down.'
    },
    {
        icon: '🗓️',
        title: 'Holiday Content Calendar',
        description: 'See India 🇮🇳 and Global 🌏 holidays on your calendar. Never miss a trending festival moment again.'
    },
    {
        icon: '🔔',
        title: 'Smart Holiday Reminders',
        description: 'Get email reminders 3 days before upcoming festivals — only if you haven\'t already scheduled a post.'
    },
    {
        icon: '📋',
        title: 'Activity Logs',
        description: 'A full audit trail of every action: logins, posts published, accounts connected — all in a timeline.'
    },
]

const smartFeatures = [
    {
        icon: '🛡️',
        color: '#818CF8',
        glow: 'rgba(99,102,241,0.15)',
        title: 'Security Email Alerts',
        desc: 'Get instantly notified of failed login attempts or successful logins from new devices. Your account, always protected.',
        tags: ['Login Alerts', 'Device Tracking', 'Failed Attempt Alerts']
    },
    {
        icon: '🎊',
        color: '#FBBF24',
        glow: 'rgba(251,191,36,0.12)',
        title: 'Smart Holiday Reminders',
        desc: 'Our cron job checks for upcoming holidays at 9 AM & 5 PM daily. If you haven\'t scheduled content, we remind you to — and stay quiet if you have.',
        tags: ['India Festivals', 'Global Holidays', '2× Daily Check', 'Smart Filter']
    },
    {
        icon: '❌',
        color: '#F87171',
        glow: 'rgba(239,68,68,0.12)',
        title: 'Post Failure Alerts',
        desc: 'Scheduled a post for 5 AM and the token expired? We email you instantly with the exact error — so you can fix it before it\'s too late.',
        tags: ['Instant Email', 'Error Details', 'Platform Specific']
    },
    {
        icon: '⚙️',
        color: '#34D399',
        glow: 'rgba(16,185,129,0.12)',
        title: 'Custom Notification Settings',
        desc: 'Choose exactly which alerts you want. Set a separate alert email, or turn everything OFF with one master toggle. Your inbox, your rules.',
        tags: ['Custom Alert Email', 'Master Toggle', 'Per-Alert Control']
    },
]

const steps = [
    {
        number: '01',
        title: 'Create Your Account',
        description: 'Sign up in seconds with just your email. No credit card required.'
    },
    {
        number: '02',
        title: 'Connect Your Socials',
        description: 'Link your social media accounts. We support 5+ platforms and growing!'
    },
    {
        number: '03',
        title: 'Create Amazing Content',
        description: 'Use our powerful editor to craft engaging posts with media support.'
    },
    {
        number: '04',
        title: 'Schedule & Publish',
        description: 'Set your posting schedule and let SocialNex handle the rest.'
    },
]

const faqs = [
    {
        question: 'Is SocialNex really free?',
        answer: 'Yes! We offer a generous free tier that includes all core features. Premium plans will be available for power users who need more.'
    },
    {
        question: 'Which platforms do you support?',
        answer: 'Currently we support Bluesky, Mastodon, Telegram, Discord, and Reddit. Facebook, Instagram, and more are coming soon!'
    },
    {
        question: 'Do I need developer accounts?',
        answer: 'For most platforms, no! We\'ve made it super easy. Check our How-to-Use guides for step-by-step instructions.'
    },
    {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use industry-standard encryption and never store your passwords. Your social tokens are encrypted at rest.'
    },
]

function LandingPage() {
    const [activeFeature, setActiveFeature] = useState(0)
    const [openFaq, setOpenFaq] = useState(null)
    const [email, setEmail] = useState('')
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        alert(`Thanks for signing up with ${email}! We'll notify you when we launch.`)
        setEmail('')
    }

    return (
        <div className="app">
            {/* Navigation */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container navbar-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">🚀</span>
                        <span className="logo-text">Social<span className="text-gradient">Nex</span></span>
                    </Link>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#smart-features">✨ Smart Alerts</a>
                        <a href="#platforms">Platforms</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div className="nav-actions">
                        <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-fadeInDown">
                            <span className="badge badge-primary">
                                ✨ Now in Beta - 100% Free
                            </span>
                        </div>
                        <h1 className="hero-title animate-fadeInUp">
                            Manage All Your <span className="text-gradient">Social Media</span> From One Place
                        </h1>
                        <p className="hero-subtitle animate-fadeInUp delay-100">
                            Schedule posts, track analytics, and grow your audience across multiple platforms.
                            Stop juggling apps — start dominating social media.
                        </p>
                        <div className="hero-cta animate-fadeInUp delay-200">
                            <form onSubmit={handleSubmit} className="hero-form">
                                <input
                                    type="email"
                                    className="input-field hero-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary btn-lg">
                                    Get Early Access 🚀
                                </button>
                            </form>
                            <p className="hero-note">🔒 Free forever plan available. No credit card required.</p>
                        </div>
                        <div className="hero-stats animate-fadeInUp delay-300">
                            <div className="stat">
                                <span className="stat-value">5+</span>
                                <span className="stat-label">Platforms</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-value">∞</span>
                                <span className="stat-label">Posts</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat">
                                <span className="stat-value">0</span>
                                <span className="stat-label">Cost</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual animate-scaleIn delay-200">
                        <div className="dashboard-preview">
                            <div className="preview-header">
                                <div className="preview-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <span className="preview-title">Dashboard</span>
                            </div>
                            <div className="preview-content">
                                <div className="preview-sidebar">
                                    <div className="preview-menu-item active"></div>
                                    <div className="preview-menu-item"></div>
                                    <div className="preview-menu-item"></div>
                                    <div className="preview-menu-item"></div>
                                </div>
                                <div className="preview-main">
                                    <div className="preview-card large"></div>
                                    <div className="preview-grid">
                                        <div className="preview-card"></div>
                                        <div className="preview-card"></div>
                                        <div className="preview-card"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="floating-card card-1 animate-float">
                            <span>📈</span> +147% Growth
                        </div>
                        <div className="floating-card card-2 animate-float delay-200">
                            <span>🎯</span> 12 Scheduled
                        </div>
                        <div className="floating-card card-3 animate-float delay-400">
                            <span>💜</span> 2.4k Likes
                        </div>
                    </div>
                </div>
                <div className="hero-gradient"></div>
            </section>

            {/* Platforms Section */}
            <section id="platforms" className="section platforms">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">
                            Connect Your <span className="text-gradient">Favorite Platforms</span>
                        </h2>
                        <p className="section-subtitle">
                            Post everywhere your audience lives. More platforms coming soon!
                        </p>
                    </div>
                    <div className="platforms-grid">
                        {platforms.map((platform, index) => (
                            <div
                                key={platform.name}
                                className={`platform-card glass-card ${platform.status}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="platform-icon">{platform.icon}</span>
                                <span className="platform-name">{platform.name}</span>
                                {platform.status === 'coming' && (
                                    <span className="badge badge-warning">Coming Soon</span>
                                )}
                                {platform.status === 'available' && (
                                    <span className="badge badge-success">Available</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section features">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">
                            Everything You Need to <span className="text-gradient">Dominate Social</span>
                        </h2>
                        <p className="section-subtitle">
                            Powerful features designed to save you time and boost your engagement.
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`feature-card glass-card ${activeFeature === index ? 'active' : ''}`}
                                onMouseEnter={() => setActiveFeature(index)}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                SMART INTELLIGENCE SECTION - NEW FEATURES
                ============================================ */}
            <section id="smart-features" className="section" style={{ background: 'rgba(15,15,26,0.5)' }}>
                <div className="container">
                    <div className="section-header text-center">
                        <span style={{
                            display: 'inline-block', marginBottom: '16px',
                            padding: '6px 18px', borderRadius: '999px',
                            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                            color: '#818CF8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase'
                        }}>
                            ✨ New — Smart Intelligence
                        </span>
                        <h2 className="section-title">
                            Built for <span className="text-gradient">Serious Creators</span>
                        </h2>
                        <p className="section-subtitle">
                            SocialNex goes beyond scheduling. It's your intelligent social media co-pilot —
                            always watching, always alerting you at the right moment.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px',
                        marginTop: '48px'
                    }}>
                        {smartFeatures.map((f, i) => (
                            <div key={i} style={{
                                background: 'rgba(37,37,66,0.45)',
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${f.color}33`,
                                borderRadius: '20px',
                                padding: '32px',
                                boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 60px ${f.glow}`,
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Glow corner */}
                                <div style={{
                                    position: 'absolute', top: '-30px', right: '-30px',
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: f.glow, filter: 'blur(20px)', pointerEvents: 'none'
                                }} />

                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px',
                                    background: `${f.color}18`, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.6rem', marginBottom: '20px',
                                    border: `1px solid ${f.color}30`
                                }}>
                                    {f.icon}
                                </div>

                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '20px' }}>
                                    {f.desc}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {f.tags.map(tag => (
                                        <span key={tag} style={{
                                            padding: '4px 12px', borderRadius: '999px',
                                            background: `${f.color}12`, border: `1px solid ${f.color}30`,
                                            color: f.color, fontSize: '0.7rem', fontWeight: 700,
                                            letterSpacing: '0.04em'
                                        }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Activity Logs mini preview */}
                    <div style={{
                        marginTop: '64px',
                        background: 'rgba(37,37,66,0.35)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '24px',
                        padding: '40px',
                        backdropFilter: 'blur(16px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>📋 Activity Logs</h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: '6px 0 0' }}>Full audit trail of every action on your account</p>
                            </div>
                            <span style={{
                                padding: '6px 18px', borderRadius: '999px',
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                                color: '#818CF8', fontSize: '0.75rem', fontWeight: 700
                            }}>Live Preview</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: '🟢', label: 'Logged In', time: 'Just now', color: '#34D399', detail: 'Login from Windows · Chrome' },
                                { icon: '🟣', label: 'Post Scheduled', time: '2h ago', color: '#818CF8', detail: 'Bluesky · "Wishing everyone a Happy Diwali!"' },
                                { icon: '🔵', label: 'LinkedIn Connected', time: '1d ago', color: '#60A5FA', detail: 'Account linked successfully' },
                                { icon: '🟡', label: 'Password Changed', time: '3d ago', color: '#FBBF24', detail: 'Security update' },
                                { icon: '🔴', label: 'Post Failed', time: '5d ago', color: '#F87171', detail: 'Bluesky · Token expired' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '14px 20px', borderRadius: '12px',
                                    background: 'rgba(15,15,26,0.4)',
                                    border: '1px solid rgba(255,255,255,0.04)'
                                }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${item.color}18`, border: `1px solid ${item.color}30`,
                                        fontSize: '0.9rem'
                                    }}>{item.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{item.time}</span>
                                        </div>
                                        <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{item.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="section how-it-works">
                <div className="container">
                    <div className="section-header text-center">
                        <h2 className="section-title">
                            Get Started in <span className="text-gradient">4 Simple Steps</span>
                        </h2>
                        <p className="section-subtitle">
                            From signup to first post in under 5 minutes. It's that easy!
                        </p>
                    </div>
                    <div className="steps-container">
                        {steps.map((step, index) => (
                            <div key={step.number} className="step-card">
                                <div className="step-number">{step.number}</div>
                                <div className="step-content">
                                    <h3 className="step-title">{step.title}</h3>
                                    <p className="step-description">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && <div className="step-connector"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-card glass-card">
                        <h2 className="cta-title">
                            Ready to <span className="text-gradient">Transform</span> Your Social Media?
                        </h2>
                        <p className="cta-subtitle">
                            Join thousands of creators and businesses using SocialNex to grow their online presence.
                        </p>
                        <div className="cta-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Start Free Today 🚀
                            </Link>
                            <button className="btn btn-secondary btn-lg">
                                Watch Demo 📺
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="section faq">
                <div className="container container-md">
                    <div className="section-header text-center">
                        <h2 className="section-title">
                            Frequently Asked <span className="text-gradient">Questions</span>
                        </h2>
                    </div>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item glass-card ${openFaq === index ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <div className="faq-question">
                                    <span>{faq.question}</span>
                                    <span className="faq-toggle">{openFaq === index ? '−' : '+'}</span>
                                </div>
                                {openFaq === index && (
                                    <div className="faq-answer">{faq.answer}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <Link to="/" className="logo">
                                <span className="logo-icon">🚀</span>
                                <span className="logo-text">Social<span className="text-gradient">Nex</span></span>
                            </Link>
                            <p className="footer-tagline">
                                Your all-in-one social media management platform. Post smarter, grow faster.
                            </p>
                            <div className="powered-by">
                                <span>A Product by</span>
                                <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer" className="vayunex-link">
                                    <span className="vayunex-logo">🌐</span> Vayunex Solution
                                </a>
                            </div>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#platforms">Platforms</a>
                                <a href="#">Pricing</a>
                            </div>
                            <div className="footer-column">
                                <h4>Resources</h4>
                                <a href="#how-it-works">How to Use</a>
                                <a href="#faq">FAQ</a>
                                <a href="#">Blog</a>
                            </div>
                            <div className="footer-column">
                                <h4>Vayunex Solution</h4>
                                <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">About Us</a>
                                <a href="https://www.vayunexsolution.com/#services" target="_blank" rel="noopener noreferrer">Services</a>
                                <a href="https://www.vayunexsolution.com/#contact" target="_blank" rel="noopener noreferrer">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 SocialNex. All rights reserved.</p>
                        <p className="powered-text">
                            Powered by <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer" className="vayunex-inline">Vayunex Solution</a> 💜
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
