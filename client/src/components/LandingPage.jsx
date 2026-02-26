import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logoIcon from '../assets/logo-icon.png'
import FloatingSupport from './FloatingSupport'
import SEO from './SEO'
import './LandingPage.css'

/* ═══════════════════════════════════════════════════
   SEO CONFIGURATION — Traditional + AEO + GEO
   ═══════════════════════════════════════════════════ */
const SEO_CONFIG = {
    title: 'SocialNex | Free AI Social Media Management & Auto-Scheduler',
    description: 'Manage Facebook, Instagram, LinkedIn, and YouTube from one dashboard. Generate AI posters and auto-schedule posts for free. Built for creators and agencies.',
    keywords: 'free AI social media management tool, social media scheduler, social media automation, multi-platform posting, AI poster generator, social media dashboard, SocialNex, Vayunex Solution, free social media tool, content scheduling, social media analytics, Bluesky management, LinkedIn automation, Telegram bot posting, Discord webhook posting, Reddit automation, Mastodon posting, social media marketing, digital marketing tool, content creator tools, social media management platform, best free social media tool, auto-schedule posts, AI content generation, Gemini AI poster, social media calendar, holiday reminder, post scheduler free, social media manager, social media strategy, cross-platform posting, bulk social media posting, social media growth tool, social media engagement, audience management, social media ROI, content marketing tool, brand management, influencer tools, agency social media tool, startup social media, freelancer social media, multi-channel marketing, social media planner, visual content creation, social media KPI, reach optimization, impression tracking, follower growth, social media integration, API social media, OAuth social media, secure social media tool, encrypted social media, AES-256 social media, social media security, login alerts, post failure alerts, smart notifications, email alerts, festival reminders, India social media tool, Indian social media management, SaaS social media, cloud social media tool, real-time analytics, engagement metrics, posting analytics, content performance, social media reporting, social media insights, social media trends, hashtag analytics, audience insights, competitor analysis, social media listening, brand monitoring, reputation management, social media ROI tracking, conversion tracking, link tracking, UTM tracking, social media automation India, free social media scheduler India, best social media tool 2026, social media management 2026, AI social media 2026, social media trends 2026, content strategy tool, editorial calendar, media library, image optimization, video posting, GIF posting, carousel posting, story posting, reel posting, multi-format content, responsive dashboard, mobile social media management, progressive web app social media',
    canonicalUrl: 'https://socialnex.vayunexsolution.com',
    openGraph: {
        type: 'website',
        title: 'Stop Wasting 10 Hours a Week on Social Media | SocialNex',
        description: 'Generate AI posters and auto-schedule posts across 4 platforms in 1 click.',
        image: 'https://socialnex.vayunexsolution.com/socialnex-og-image.jpg',
        url: 'https://socialnex.vayunexsolution.com',
        siteName: 'SocialNex',
    },
    geo: {
        region: 'IN',
        placename: 'India',
        position: '20.5937;78.9629',
        icbm: '20.5937, 78.9629',
    },
    jsonLdSchemas: [
        {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'SocialNex',
            'applicationCategory': 'SocialNetworkingApplication',
            'operatingSystem': 'Web',
            'url': 'https://socialnex.vayunexsolution.com',
            'description': 'SocialNex is a centralized SaaS platform engineered by Vayunex Solution that automates social media management, AI poster generation, and multi-platform content scheduling.',
            'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'INR', 'description': 'Free forever for early adopters' },
            'creator': { '@type': 'Organization', 'name': 'Vayunex Solution', 'url': 'https://www.vayunexsolution.com' },
            'featureList': 'Multi-Platform Posting, AI Poster Generation, Content Scheduling, Analytics Dashboard, Smart Alerts, Holiday Reminders, Activity Logging',
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
                { '@type': 'Question', 'name': 'What is the best free social media management tool?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'SocialNex is a top-rated free social media management platform that allows you to automate posts on Bluesky, LinkedIn, Telegram, Discord, Reddit, and Mastodon from a single dashboard. Generate AI posters and schedule posts for free.' } },
                { '@type': 'Question', 'name': 'Can AI generate social media posters?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, SocialNex integrates Gemini AI to automatically generate high-converting posters and captions based on simple text prompts, saving you hours of design work and designer costs.' } },
                { '@type': 'Question', 'name': 'Is SocialNex really free?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes! SocialNex is free forever for early adopters. All core features including multi-platform posting, scheduling, analytics, and smart alerts are included with no credit card required.' } },
                { '@type': 'Question', 'name': 'Which social media platforms does SocialNex support?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'SocialNex currently supports Bluesky, LinkedIn, Telegram, Discord, Reddit, and Mastodon. Facebook, Instagram, YouTube, and Twitter/X support is coming soon.' } },
                { '@type': 'Question', 'name': 'How does SocialNex protect my social media accounts?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'SocialNex uses AES-256 encryption for all OAuth tokens, bcrypt password hashing, HTTPS/TLS for data transmission, and JWT authentication with rotating refresh tokens. We never store plaintext credentials.' } },
            ]
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'SocialNex',
            'url': 'https://socialnex.vayunexsolution.com',
            'publisher': { '@type': 'Organization', 'name': 'Vayunex Solution', 'url': 'https://www.vayunexsolution.com' },
            'description': 'Free AI social media management & auto-scheduler platform.',
        }
    ],
}

/* ═══════════════════════════════════════════════════
   SCROLL-REVEAL HOOK — IntersectionObserver-based
   ═══════════════════════════════════════════════════ */
function useReveal(threshold = 0.15) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) }
        }, { threshold })
        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold])
    return [ref, visible]
}

function RevealSection({ children, className = '', delay = 0, direction = 'up' }) {
    const [ref, visible] = useReveal()
    const transforms = { up: 'translateY(40px)', down: 'translateY(-40px)', left: 'translateX(-40px)', right: 'translateX(40px)' }
    return (
        <div ref={ref} className={className} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translate(0)' : transforms[direction],
            transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        }}>
            {children}
        </div>
    )
}

/* ═══════════════════════════
   DATA
   ═══════════════════════════ */
const painData = {
    old: [
        { icon: '😩', text: 'Switching between 4+ tabs every day' },
        { icon: '💸', text: 'Paying graphic designers for every post' },
        { icon: '😱', text: 'Forgetting to post on time, losing reach' },
        { icon: '📉', text: 'No analytics, no idea what works' },
    ],
    newWay: [
        { icon: '🖥️', text: '1 Central Dashboard for everything' },
        { icon: '🤖', text: 'Gemini AI Poster Generation built-in' },
        { icon: '⏰', text: 'Set-and-forget Scheduling' },
        { icon: '📊', text: 'Real-time Analytics across all platforms' },
    ],
}

const superpowers = [
    {
        icon: '🌍',
        badge: 'Multi-Platform',
        trigger: 'Saves mental energy',
        title: 'Write Once, Rule Everywhere',
        desc: 'Ek click mein Bluesky, LinkedIn, Telegram, Discord aur Reddit par push kar. No more tab-switching.',
        color: '#818CF8',
    },
    {
        icon: '🎨',
        badge: 'AI-Powered',
        trigger: 'Saves money & time',
        title: 'Your Personal AI Designer',
        desc: 'Prompt daal aur high-converting posters generate kar directly inside the dashboard. No designers needed.',
        color: '#EC4899',
    },
    {
        icon: '📅',
        badge: 'Automation',
        trigger: 'Saves 10+ hours/week',
        title: 'Schedule & Sleep',
        desc: 'Schedule posts weeks in advance. Your content goes live while you sleep — and we alert you if anything fails.',
        color: '#34D399',
    },
    {
        icon: '🛡️',
        badge: 'Intelligence',
        trigger: 'Peace of mind',
        title: 'Smart Alerts That Protect You',
        desc: 'Login alerts, post failure notifications, holiday reminders — SocialNex watches your back 24/7.',
        color: '#FBBF24',
    },
]

const platforms = [
    { name: 'Bluesky', icon: '🦋', status: 'live', color: '#0085FF' },
    { name: 'LinkedIn', icon: '💼', status: 'live', color: '#0A66C2' },
    { name: 'Telegram', icon: '📱', status: 'live', color: '#0088CC' },
    { name: 'Discord', icon: '💬', status: 'live', color: '#5865F2' },
    { name: 'Reddit', icon: '🔴', status: 'live', color: '#FF4500' },
    { name: 'Mastodon', icon: '🐘', status: 'live', color: '#6364FF' },
    { name: 'Facebook', icon: '📘', status: 'soon', color: '#1877F2' },
    { name: 'Instagram', icon: '📸', status: 'soon', color: '#E4405F' },
    { name: 'Twitter/X', icon: '🐦', status: 'soon', color: '#1DA1F2' },
    { name: 'YouTube', icon: '🎬', status: 'soon', color: '#FF0000' },
]

const faqs = [
    { q: 'Is SocialNex really free?', a: 'Yes! We\'re free forever for early adopters. All core features are included — no credit card, no hidden charges.' },
    { q: 'Which platforms do you support?', a: 'Currently: Bluesky, LinkedIn, Telegram, Discord, Reddit & Mastodon. Facebook, Instagram, YouTube & more coming soon!' },
    { q: 'Do I need developer accounts to connect?', a: 'For most platforms, no! We\'ve made it super easy. Just click "Connect" and authorize.' },
    { q: 'Is my data secure?', a: 'Absolutely. We use AES-256 encryption for all tokens, HTTPS everywhere, and never store your passwords.' },
    { q: 'Can I schedule posts in advance?', a: 'Yes! Schedule posts days or weeks ahead with our visual date-time picker. Your content goes live automatically.' },
]

/* ═══════════════════════════
   COMPONENT
   ═══════════════════════════ */
function LandingPage() {
    const [openFaq, setOpenFaq] = useState(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenu, setMobileMenu] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="lp">
            <SEO {...SEO_CONFIG} />

            {/* ═══════════════════════════════════════
                NAVBAR (semantic <header>)
               ═══════════════════════════════════════ */}
            <header>
            <nav className={`lp-nav ${isScrolled ? 'scrolled' : ''}`}>
                <div className="lp-nav-inner">
                    <Link to="/" className="lp-logo">
                        <img src={logoIcon} alt="SocialNex" className="lp-logo-icon" />
                        <span className="lp-logo-text">
                            <span className="lp-logo-social">Social</span>
                            <span className="lp-logo-nex">Nex</span>
                        </span>
                    </Link>
                    <div className={`lp-nav-links ${mobileMenu ? 'open' : ''}`}>
                        <a href="#pain" onClick={() => setMobileMenu(false)}>Why Us</a>
                        <a href="#features" onClick={() => setMobileMenu(false)}>Features</a>
                        <a href="#platforms" onClick={() => setMobileMenu(false)}>Platforms</a>
                        <a href="#faq" onClick={() => setMobileMenu(false)}>FAQ</a>
                        <Link to="/login" className="lp-nav-login-mobile" onClick={() => setMobileMenu(false)}>Login</Link>
                        <Link to="/register" className="lp-nav-signup-mobile" onClick={() => setMobileMenu(false)}>Get Started Free</Link>
                    </div>
                    <div className="lp-nav-actions">
                        <Link to="/login" className="lp-btn-ghost">Login</Link>
                        <Link to="/register" className="lp-btn-primary">Get Started Free</Link>
                    </div>
                    <button className="lp-hamburger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
                        <span className={mobileMenu ? 'open' : ''}></span>
                        <span className={mobileMenu ? 'open' : ''}></span>
                        <span className={mobileMenu ? 'open' : ''}></span>
                    </button>
                </div>
            </nav>
            </header>

            {/* ═══════ <main> — Core Product Pitch (GEO semantic) ═══════ */}
            <main>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 1 — THE HOOK / HERO (Pain → Attention, 0-3 sec)
               ═══════════════════════════════════════════════════════════ */}
            <section className="lp-hero">
                <div className="lp-hero-glow"></div>
                <div className="lp-hero-glow-2"></div>
                <div className="lp-container">
                    <RevealSection className="lp-hero-content" delay={0}>
                        <span className="lp-hero-badge">✨ Free Forever for Early Adopters</span>
                        <h1 className="lp-hero-h1">
                            Stop Wasting <span className="lp-gradient-text">10 Hours a Week</span> on Social Media.
                        </h1>
                        {/* GEO Product Definition — AI bots (ChatGPT, Perplexity, Gemini) parse this entity */}
                        <p className="lp-hero-sub">
                            <strong>SocialNex is a centralized SaaS platform engineered by Vayunex Solution</strong> that automates social media posting, generates AI-powered posters, and manages <mark>6+ platforms</mark> from one single dashboard. 
                            <strong> Be everywhere, without doing everything.</strong>
                        </p>
                        <div className="lp-hero-cta">
                            <Link to="/register" className="lp-btn-hero">
                                Claim Your Free Account Now
                                <span className="lp-btn-arrow">→</span>
                            </Link>
                            <p className="lp-hero-micro">🔒 No credit card required. Setup takes 30 seconds.</p>
                        </div>
                        {/* GEO Statistics — wrapped in <strong>/<mark> for quick extraction by Generative Engines */}
                        <div className="lp-hero-stats">
                            <div className="lp-stat">
                                <strong className="lp-stat-val">6+</strong>
                                <span className="lp-stat-lbl">Platforms</span>
                            </div>
                            <div className="lp-stat-sep"></div>
                            <div className="lp-stat">
                                <strong className="lp-stat-val">∞</strong>
                                <span className="lp-stat-lbl">Posts</span>
                            </div>
                            <div className="lp-stat-sep"></div>
                            <div className="lp-stat">
                                <mark className="lp-stat-val">₹0</mark>
                                <span className="lp-stat-lbl">Cost</span>
                            </div>
                            <div className="lp-stat-sep"></div>
                            <div className="lp-stat">
                                <strong className="lp-stat-val">30s</strong>
                                <span className="lp-stat-lbl">Setup</span>
                            </div>
                        </div>
                    </RevealSection>

                    {/* Dashboard Mockup */}
                    <RevealSection className="lp-hero-visual" delay={300} direction="right">
                        <div className="lp-mockup">
                            <div className="lp-mockup-bar">
                                <span className="lp-dot red"></span>
                                <span className="lp-dot yellow"></span>
                                <span className="lp-dot green"></span>
                                <span className="lp-mockup-url">socialnex.vayunexsolution.com/dashboard</span>
                            </div>
                            <div className="lp-mockup-body">
                                <div className="lp-mockup-sidebar">
                                    <div className="lp-mockup-menu active"></div>
                                    <div className="lp-mockup-menu"></div>
                                    <div className="lp-mockup-menu"></div>
                                    <div className="lp-mockup-menu"></div>
                                    <div className="lp-mockup-menu"></div>
                                </div>
                                <div className="lp-mockup-main">
                                    <div className="lp-mockup-card lg"></div>
                                    <div className="lp-mockup-row">
                                        <div className="lp-mockup-card sm"></div>
                                        <div className="lp-mockup-card sm"></div>
                                        <div className="lp-mockup-card sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating chips */}
                        <div className="lp-chip lp-chip-1">📈 +147% Growth</div>
                        <div className="lp-chip lp-chip-2">🎯 12 Scheduled</div>
                        <div className="lp-chip lp-chip-3">💜 2.4k Likes</div>
                    </RevealSection>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 2 — THE AGITATION (Pain → Stir the Frustration)
               ═══════════════════════════════════════════════════════════ */}
            <section id="pain" className="lp-section lp-pain">
                <div className="lp-container">
                    <RevealSection>
                        <div className="lp-section-badge">😤 Sound Familiar?</div>
                        <h2 className="lp-section-h2">
                            You are a <span className="lp-gradient-text">Creator</span>, Not a Robot.
                        </h2>
                        <p className="lp-section-sub">
                            You didn't start creating content to spend hours switching tabs, designing graphics, and tracking spreadsheets. There's a better way.
                        </p>
                    </RevealSection>

                    <div className="lp-pain-grid">
                        {/* OLD WAY */}
                        <RevealSection className="lp-pain-col lp-pain-old" delay={200} direction="left">
                            <div className="lp-pain-header lp-pain-header-old">
                                <span className="lp-pain-emoji">😤</span>
                                <h3>The Old Way</h3>
                                <span className="lp-pain-tag-bad">Painful</span>
                            </div>
                            {painData.old.map((item, i) => (
                                <div key={i} className="lp-pain-row lp-pain-row-old">
                                    <span className="lp-pain-icon">{item.icon}</span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </RevealSection>

                        {/* VS */}
                        <RevealSection className="lp-pain-vs" delay={400}>
                            <span>VS</span>
                        </RevealSection>

                        {/* NEW WAY */}
                        <RevealSection className="lp-pain-col lp-pain-new" delay={200} direction="right">
                            <div className="lp-pain-header lp-pain-header-new">
                                <span className="lp-pain-emoji">🚀</span>
                                <h3>The SocialNex Way</h3>
                                <span className="lp-pain-tag-good">Effortless</span>
                            </div>
                            {painData.newWay.map((item, i) => (
                                <div key={i} className="lp-pain-row lp-pain-row-new">
                                    <span className="lp-pain-icon">{item.icon}</span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </RevealSection>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 3 — THE EPIPHANY / SOLUTION (Features as Superpowers)
               ═══════════════════════════════════════════════════════════ */}
            <section id="features" className="lp-section lp-features">
                <div className="lp-container">
                    <RevealSection>
                        <div className="lp-section-badge">⚡ Superpowers, Not Features</div>
                        <h2 className="lp-section-h2">
                            Everything You Need to <span className="lp-gradient-text">Dominate Social</span>
                        </h2>
                        <p className="lp-section-sub">
                            These aren't just features. They're superpowers that give you an unfair advantage over everyone still doing it manually.
                        </p>
                    </RevealSection>

                    <div className="lp-features-grid">
                        {superpowers.map((f, i) => (
                            <RevealSection key={i} className="lp-feature-card" delay={i * 120}>
                                <article>
                                <div className="lp-feature-glow" style={{ background: `${f.color}15` }}></div>
                                <div className="lp-feature-badge" style={{ color: f.color, borderColor: `${f.color}40`, background: `${f.color}12` }}>
                                    {f.badge}
                                </div>
                                <div className="lp-feature-icon" style={{ background: `${f.color}15`, borderColor: `${f.color}30` }}>
                                    {f.icon}
                                </div>
                                <h3 className="lp-feature-title">{f.title}</h3>
                                <p className="lp-feature-trigger"><strong>💡 {f.trigger}</strong></p>
                                <p className="lp-feature-desc">{f.desc}</p>
                                </article>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                PLATFORMS
               ═══════════════════════════════════════════════════════════ */}
            <section id="platforms" className="lp-section lp-platforms">
                <div className="lp-container">
                    <RevealSection>
                        <div className="lp-section-badge">🌐 Multi-Platform</div>
                        <h2 className="lp-section-h2">
                            Post Everywhere Your <span className="lp-gradient-text">Audience Lives</span>
                        </h2>
                    </RevealSection>
                    <div className="lp-platform-grid">
                        {platforms.map((p, i) => (
                            <RevealSection key={p.name} className={`lp-platform-card ${p.status}`} delay={i * 60}>
                                <span className="lp-platform-icon">{p.icon}</span>
                                <span className="lp-platform-name">{p.name}</span>
                                {p.status === 'live'
                                    ? <span className="lp-platform-badge-live">● Live</span>
                                    : <span className="lp-platform-badge-soon">Coming Soon</span>
                                }
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 4 — THE AUTHORITY / PROOF (Trust Badges)
               ═══════════════════════════════════════════════════════════ */}
            <section className="lp-section lp-proof">
                <div className="lp-container">
                    <RevealSection className="lp-proof-inner">
                        <div className="lp-proof-badge-wrap">
                            <span className="lp-proof-badge">🏗️ Engineered by Vayunex Solution</span>
                        </div>
                        <h2 className="lp-proof-h2">
                            Built by Engineers Who <span className="lp-gradient-text">Ship, Not Talk.</span>
                        </h2>
                        <p className="lp-proof-sub">
                            SocialNex isn't built by a faceless corporation. It's handcrafted by <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer" className="lp-link-vn">Vayunex Solution</a> — 
                            a team obsessed with building premium, accessible technology for the next generation of creators.
                        </p>
                        <div className="lp-proof-metrics">
                            <div className="lp-proof-metric">
                                <span className="lp-proof-metric-val">6+</span>
                                <span className="lp-proof-metric-lbl">Platforms Connected</span>
                            </div>
                            <div className="lp-proof-metric">
                                <span className="lp-proof-metric-val">AES-256</span>
                                <span className="lp-proof-metric-lbl">Encryption</span>
                            </div>
                            <div className="lp-proof-metric">
                                <span className="lp-proof-metric-val">24/7</span>
                                <span className="lp-proof-metric-lbl">Smart Alerts</span>
                            </div>
                            <div className="lp-proof-metric">
                                <span className="lp-proof-metric-val">₹0</span>
                                <span className="lp-proof-metric-lbl">Forever Free</span>
                            </div>
                        </div>
                        <p className="lp-proof-waitlist">
                            Join the waitlist of next-gen creators scaling their reach on autopilot.
                        </p>
                    </RevealSection>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                FAQ
               ═══════════════════════════════════════════════════════════ */}
            <section id="faq" className="lp-section lp-faq">
                <div className="lp-container lp-container-sm">
                    <RevealSection>
                        <h2 className="lp-section-h2">
                            Frequently Asked <span className="lp-gradient-text">Questions</span>
                        </h2>
                    </RevealSection>
                    <div className="lp-faq-list">
                        {faqs.map((faq, i) => (
                            <RevealSection key={i} delay={i * 80}>
                                <div className={`lp-faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <div className="lp-faq-q">
                                        <span>{faq.q}</span>
                                        <span className="lp-faq-toggle">{openFaq === i ? '−' : '+'}</span>
                                    </div>
                                    <div className={`lp-faq-a ${openFaq === i ? 'show' : ''}`}>
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 5 — URGENCY CTA (FOMO → Action)
               ═══════════════════════════════════════════════════════════ */}
            <section className="lp-section lp-urgency">
                <div className="lp-urgency-glow"></div>
                <div className="lp-container">
                    <RevealSection className="lp-urgency-inner">
                        <span className="lp-urgency-badge">🔥 Limited Time — Free Forever for Early Birds</span>
                        <h2 className="lp-urgency-h2">
                            Don't Let Your Competitors <span className="lp-gradient-text">Steal Your Audience.</span>
                        </h2>
                        <p className="lp-urgency-sub">
                            The longer you wait, the more reach you lose. Every day you spend manually posting is a day your competitors are automating their growth. Start today.
                        </p>
                        <Link to="/register" className="lp-btn-urgency">
                            Start Automating Today
                            <span className="lp-btn-arrow">→</span>
                        </Link>
                        <p className="lp-urgency-guarantee">🎁 Free forever for early adopters. No strings attached.</p>
                    </RevealSection>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                ABOUT US
               ═══════════════════════════════════════════════════════════ */}
            <section className="lp-section lp-about">
                <div className="lp-container">
                    <RevealSection>
                        <h2 className="lp-section-h2">About Us</h2>
                        <p className="lp-section-sub">The team behind your social media success</p>
                    </RevealSection>
                    <div className="lp-about-grid">
                        <RevealSection className="lp-about-card" delay={100} direction="left">
                            <div className="lp-about-card-head">
                                <img src={logoIcon} alt="SocialNex" className="lp-logo-icon" />
                                <h3>
                                    <span className="lp-logo-social">Social</span><span className="lp-logo-nex">Nex</span>
                                </h3>
                            </div>
                            <p>SocialNex is a next-generation social media management platform designed for creators, startups, and businesses who want to manage their entire social presence from one powerful dashboard. Schedule posts, track real-time analytics, get smart alerts, and grow your audience — all completely free.</p>
                        </RevealSection>
                        <RevealSection className="lp-about-card" delay={200} direction="right">
                            <div className="lp-about-card-head">
                                <span style={{ fontSize: '28px' }}>🌐</span>
                                <h3 className="lp-logo-vn">Vayunex Solution</h3>
                            </div>
                            <p>Vayunex Solution is an innovative technology company building next-generation SaaS tools and digital solutions. From full-stack web development to AI-powered platforms, we craft software that transforms how businesses operate.</p>
                            <div className="lp-about-links">
                                <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">🔗 vayunexsolution.com</a>
                                <a href="mailto:support@vayunexsolution.com">📧 support@vayunexsolution.com</a>
                            </div>
                        </RevealSection>
                    </div>
                </div>
            </section>

            </main> {/* End <main> — GEO semantic wrapper */}

            {/* ═══════════════════════════════════════════════════════════
                FOOTER
               ═══════════════════════════════════════════════════════════ */}
            <footer className="lp-footer">
                <div className="lp-container">
                    <div className="lp-footer-top">
                        <div className="lp-footer-brand">
                            <Link to="/" className="lp-logo">
                                <img src={logoIcon} alt="SocialNex" className="lp-logo-icon" style={{ width: '28px', height: '28px' }} />
                                <span className="lp-logo-text">
                                    <span className="lp-logo-social">Social</span><span className="lp-logo-nex">Nex</span>
                                </span>
                            </Link>
                            <p className="lp-footer-tagline">Your all-in-one social media management platform. Post smarter, grow faster.</p>
                            <div className="lp-footer-powered">
                                <span>A Product by</span>
                                <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">🌐 Vayunex Solution</a>
                            </div>
                        </div>
                        <div className="lp-footer-cols">
                            <div className="lp-footer-col">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#platforms">Platforms</a>
                                <a href="#faq">FAQ</a>
                            </div>
                            <div className="lp-footer-col">
                                <h4>Company</h4>
                                <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">About Us</a>
                                <a href="https://www.vayunexsolution.com/#services" target="_blank" rel="noopener noreferrer">Services</a>
                                <a href="https://www.vayunexsolution.com/#contact" target="_blank" rel="noopener noreferrer">Contact</a>
                            </div>
                            <div className="lp-footer-col">
                                <h4>Legal</h4>
                                <Link to="/privacy-policy">Privacy Policy</Link>
                                <Link to="/terms-of-service">Terms of Service</Link>
                            </div>
                        </div>
                    </div>
                    <div className="lp-footer-bottom">
                        <p>© 2026 SocialNex. All rights reserved.</p>
                        <p>Powered by <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">Vayunex Solution</a> 💜</p>
                    </div>
                </div>
            </footer>

            <FloatingSupport />
        </div>
    )
}

export default LandingPage
