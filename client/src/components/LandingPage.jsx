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
        description: 'Post to multiple social networks from one dashboard. Save hours every week.'
    },
    {
        icon: '📅',
        title: 'Smart Scheduling',
        description: 'Schedule posts for optimal engagement times. Never miss the perfect moment.'
    },
    {
        icon: '📊',
        title: 'Analytics Dashboard',
        description: 'Track performance across all platforms with beautiful, actionable insights.'
    },
    {
        icon: '🎯',
        title: 'Campaign Management',
        description: 'Organize your content into campaigns. Stay focused and consistent.'
    },
    {
        icon: '✨',
        title: 'Content Calendar',
        description: 'Visualize your content strategy with an intuitive drag-and-drop calendar.'
    },
    {
        icon: '🔔',
        title: 'Smart Notifications',
        description: 'Get notified when posts go live, perform well, or need attention.'
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
