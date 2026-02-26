import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import logoIcon from '../assets/logo-icon.png'
import './LegalPages.css'

function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0)
        document.title = 'Privacy Policy | SocialNex — Social Media Management Platform | Vayunex Solution'
        // SEO Meta Tags
        const metas = [
            { name: 'description', content: 'SocialNex Privacy Policy — Learn how we collect, use, store, and protect your personal data. DPDP Act 2023 & IT Act 2000 compliant. AES-256 encryption, zero third-party data selling. Built by Vayunex Solution.' },
            { name: 'keywords', content: 'SocialNex privacy policy, social media management privacy, data protection policy, DPDP Act 2023, IT Act 2000, India privacy law, personal data protection, social media scheduler privacy, Vayunex Solution privacy, social media tool data security, user data protection, cookie policy, GDPR compliance, data encryption policy, social media automation privacy, multi-platform posting privacy, content scheduling privacy, analytics data privacy, social media dashboard privacy, API data handling, OAuth token security, social account data, user consent management, data retention policy, third-party data sharing, social media marketing privacy, digital marketing privacy, online privacy policy India, SaaS privacy policy, cloud platform privacy, social media app privacy, Bluesky privacy, LinkedIn privacy integration, Telegram bot privacy, Discord webhook privacy, Reddit API privacy, Mastodon privacy, social media management platform, content creator privacy, business social media privacy, startup social media tools, free social media tool privacy, social media growth privacy, post scheduler data handling, holiday reminder data, activity log privacy, notification email privacy, login security alerts, password security, JWT token security, refresh token handling, session management privacy, email notification preferences, alert email customization, social media token encryption, AES-256 encryption social media, HTTPS data transmission, SSL certificate security, data breach notification, incident response policy, user rights data access, right to erasure, data portability, consent withdrawal, children privacy protection, minor data protection, age verification policy, third-party service providers, payment data privacy, billing information security, analytics tracking privacy, performance monitoring data, error logging privacy, server log retention, IP address handling, device information collection, browser fingerprinting policy, location data policy, geo-targeting privacy, cookie consent management, first-party cookies, session cookies, persistent cookies, marketing cookies, advertising tracking, social media pixel privacy, cross-platform tracking, user behavior analytics, A/B testing privacy, feature flag data, remote configuration privacy, push notification data, mobile app privacy, web application privacy, progressive web app privacy, offline data storage, local storage privacy, IndexedDB data handling, cache storage policy, CDN data privacy, content delivery privacy, image hosting privacy, media file storage, attachment handling privacy, file upload security, malware scanning policy, spam protection privacy, rate limiting data, API key security, webhook security, integration data privacy, connected account data, social profile data, posting history privacy, scheduled content privacy, draft content storage, content moderation privacy, AI content generation privacy, Gemini AI data handling, machine learning data privacy, automated decision making, algorithmic transparency, content recommendation privacy, trending topic data, hashtag analytics privacy, engagement metrics privacy, follower data handling, audience insights privacy, social listening privacy, competitor analysis data, brand monitoring privacy, reputation management data, crisis management privacy, social media ROI tracking, conversion tracking privacy, link tracking privacy, URL shortener privacy, UTM parameter handling, referral data privacy, attribution model privacy, multi-touch attribution data, customer journey privacy, funnel analytics privacy, lead generation data, CRM integration privacy, email marketing data syncing, newsletter subscriber privacy, mailing list data handling, unsubscribe mechanism, email open tracking, click tracking privacy, bounce rate data, email deliverability data, SMTP server privacy, transactional email privacy, notification system privacy, reminder email data, holiday calendar data, festival reminder privacy, scheduling algorithm data, optimal posting time data, timezone handling privacy, international data transfer, cross-border data flow, data localization, India data sovereignty, regional data storage, backup data retention, disaster recovery data, data archival policy, data minimization principle, purpose limitation, storage limitation, data accuracy maintenance, accountability framework, privacy by design, privacy by default, data protection officer, privacy impact assessment, regular security audits, penetration testing policy, vulnerability disclosure, bug bounty program, security incident logging, access control policy, role-based access control, admin privilege restrictions, employee data access, contractor data handling, vendor data processing, sub-processor management, data processing agreement, standard contractual clauses, privacy shield compliance, adequacy decisions, legitimate interest assessment, consent management platform, cookie banner implementation, opt-in mechanism, opt-out mechanism, do not track signal, global privacy control, California privacy rights, CCPA compliance indicators, Virginia CDPA alignment, Colorado CPA considerations, Connecticut privacy standards, Utah consumer privacy, European data protection, UK GDPR standards, Brazilian LGPD alignment, Australian privacy principles, Canadian PIPEDA standards, Japanese APPI standards, South Korean PIPA compliance, Singapore PDPA alignment, Hong Kong data protection, New Zealand privacy standards, South African POPIA compliance, Nigerian Data Protection standards, Kenyan Data Protection compliance, Egyptian data protection, UAE data protection law, Saudi Arabian data protection, Indonesian data protection, Philippine Data Privacy Act alignment, Thai PDPA standards, Vietnamese cybersecurity law alignment, Malaysian PDPA standards, Taiwan data protection standards, India Digital Personal Data Protection Act 2023, Information Technology Act 2000, IT Rules 2011, Sensitive Personal Data Rules, Reasonable Security Practices, Indian Computer Emergency Response Team CERT-IN, Meity guidelines, Aadhaar data protection, UPI payment data, RBI data localization, SEBI cybersecurity framework, TRAI privacy regulations, social media intermediary guidelines, IT intermediary guidelines 2021, safe harbor provisions, content takedown policy, grievance redressal mechanism, nodal officer appointment, compliance report publishing, user verification requirements, Know Your Customer policy, identity verification privacy, two-factor authentication data, biometric data policy, facial recognition privacy, voice data handling, chat data privacy, direct message privacy, group messaging privacy, forum post privacy, comment data handling, reaction data privacy, share data tracking, repost data handling, quote post privacy, thread data privacy, story content privacy, reel content data, live streaming data, video content privacy, audio content privacy, podcast integration privacy, blog integration data, RSS feed data, news aggregation privacy, content curation data, bookmark data privacy, saved post data, collection data handling, board data privacy, pin data handling, infographic data, chart data privacy, graph analytics data, data visualization privacy, report generation data, export data handling, import data privacy, migration data policy, account transfer data, profile data portability, download your data, data archive format, JSON data export, CSV data export, PDF report data, API data access, developer API privacy, OAuth 2.0 implementation, OpenID Connect privacy, SAML integration data, SSO data handling, federated login privacy, social login data, Google Sign-In data, Apple Sign-In data, Microsoft login data, GitHub login data, Facebook login data, Twitter login data, LinkedIn OAuth data, passwordless authentication data, magic link privacy, one-time password data, SMS verification data, email verification data, CAPTCHA data handling, reCAPTCHA privacy, hCaptcha data, Cloudflare protection data, WAF data handling, DDoS protection data, bot detection privacy, automated access data, scraping protection, intellectual property protection, copyright data handling, DMCA compliance, trademark data, brand asset privacy, logo usage data, content licensing data, creative commons data, fair use policy, content attribution data, plagiarism detection data, duplicate content handling, canonical URL implementation, sitemap data, robots.txt policy, search engine indexing, meta tag data, structured data markup, Schema.org implementation, JSON-LD data, Open Graph data, Twitter Card data, rich snippet data, featured snippet optimization, knowledge panel data, voice search optimization data, natural language processing data, semantic search data, entity recognition data, topic clustering data, content categorization, taxonomy data handling, tag data privacy, category data handling, archive data management' },
            { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large' },
            { name: 'author', content: 'Vayunex Solution' },
            { property: 'og:title', content: 'Privacy Policy | SocialNex — Social Media Management' },
            { property: 'og:description', content: 'How SocialNex protects your data. DPDP Act 2023 & IT Act 2000 compliant. AES-256 encryption. Zero data selling.' },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: 'https://socialnex.vayunexsolution.com/privacy-policy' },
            { name: 'geo.region', content: 'IN' },
            { name: 'geo.placename', content: 'India' },
            { name: 'geo.position', content: '20.5937;78.9629' },
            { name: 'ICBM', content: '20.5937, 78.9629' },
        ]
        const created = []
        metas.forEach(m => {
            const el = document.createElement('meta')
            Object.entries(m).forEach(([k, v]) => el.setAttribute(k, v))
            document.head.appendChild(el)
            created.push(el)
        })
        // JSON-LD
        const jsonLd = document.createElement('script')
        jsonLd.type = 'application/ld+json'
        jsonLd.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy — SocialNex",
            "description": "Privacy Policy for SocialNex social media management platform by Vayunex Solution.",
            "url": "https://socialnex.vayunexsolution.com/privacy-policy",
            "inLanguage": "en-IN",
            "publisher": { "@type": "Organization", "name": "Vayunex Solution", "url": "https://www.vayunexsolution.com" },
            "isPartOf": { "@type": "WebSite", "name": "SocialNex", "url": "https://socialnex.vayunexsolution.com" },
            "dateModified": "2026-02-26"
        })
        document.head.appendChild(jsonLd)
        return () => { created.forEach(el => el.remove()); jsonLd.remove() }
    }, [])

    return (
        <div className="legal-page">
            {/* Nav */}
            <nav className="legal-nav">
                <div className="legal-nav-inner">
                    <Link to="/" className="legal-logo">
                        <img src={logoIcon} alt="SocialNex" style={{ width: '30px', height: '30px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
                        <span className="legal-logo-text">
                            <span className="lg-social">Social</span><span className="lg-nex">Nex</span>
                        </span>
                    </Link>
                    <div className="legal-nav-links">
                        <Link to="/">Home</Link>
                        <Link to="/terms-of-service">Terms of Service</Link>
                        <Link to="/login" className="legal-nav-btn">Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="legal-hero">
                <div className="legal-hero-glow"></div>
                <div className="legal-container">
                    <span className="legal-badge">🔒 Your Privacy Matters</span>
                    <h1 className="legal-h1">Privacy <span className="legal-gradient">Policy</span></h1>
                    <p className="legal-hero-sub">How SocialNex collects, uses, protects, and handles your personal data</p>
                    <div className="legal-meta-bar">
                        <span>📅 Last Updated: February 26, 2026</span>
                        <span>🏢 Vayunex Solution</span>
                        <span>🇮🇳 Governed by Indian Law</span>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="legal-content">
                <div className="legal-container legal-container-sm">
                    {/* TOC */}
                    <div className="legal-toc">
                        <h3>📋 Table of Contents</h3>
                        <ol>
                            <li><a href="#introduction">Introduction & Overview</a></li>
                            <li><a href="#data-collected">Information We Collect</a></li>
                            <li><a href="#usage">How We Use Your Data</a></li>
                            <li><a href="#storage">Data Storage & Security</a></li>
                            <li><a href="#sharing">Data Sharing & Third Parties</a></li>
                            <li><a href="#cookies">Cookies & Tracking</a></li>
                            <li><a href="#social-accounts">Connected Social Accounts</a></li>
                            <li><a href="#rights">Your Rights</a></li>
                            <li><a href="#retention">Data Retention</a></li>
                            <li><a href="#children">Children's Privacy</a></li>
                            <li><a href="#international">International Data Transfers</a></li>
                            <li><a href="#compliance">Indian Law Compliance</a></li>
                            <li><a href="#changes">Policy Changes</a></li>
                            <li><a href="#contact">Contact Us</a></li>
                        </ol>
                    </div>

                    {/* Sections */}
                    <article className="legal-article">
                        <section id="introduction" className="legal-section">
                            <h2>1. Introduction & Overview</h2>
                            <p>Welcome to <strong>SocialNex</strong> — a next-generation social media management platform, social media scheduler, social media automation tool, and multi-platform posting dashboard built and operated by <strong>Vayunex Solution</strong> ("we", "us", "our"), an innovative technology company specializing in SaaS products, digital marketing solutions, cloud-based software, web application development, AI-powered tools, and enterprise-grade social media solutions based in India.</p>
                            <p>This Privacy Policy ("Policy") describes how SocialNex, a social media management platform for content creators, digital marketers, social media managers, small businesses, startups, entrepreneurs, influencers, brand managers, marketing agencies, freelancers, bloggers, and online businesses, collects, uses, stores, processes, protects, and discloses your personal information, user data, social media data, account information, posting data, analytics data, scheduling data, and behavioral data when you use our social media management services, social media scheduling features, multi-platform posting capabilities, content calendar tools, analytics dashboard, activity logging system, notification system, email alert service, holiday reminder service, and all related features of the SocialNex social media management platform.</p>
                            <p>By accessing SocialNex at <strong>socialnex.vayunexsolution.com</strong>, using our social media automation services, connecting your social media accounts including Bluesky, LinkedIn, Telegram, Discord, Reddit, Mastodon, Facebook, Instagram, Twitter/X, YouTube, and other social media platforms, or by creating an account, you agree to the collection and use of information in accordance with this privacy policy, the Indian Digital Personal Data Protection Act 2023, the Information Technology Act 2000, and applicable Indian privacy regulations.</p>
                            <div className="legal-highlight">
                                <span className="legal-highlight-icon">🛡️</span>
                                <div>
                                    <strong>Our Core Privacy Promise</strong>
                                    <p>We will <strong>never sell</strong> your personal data to third parties. Your social media tokens are encrypted with <strong>AES-256 encryption</strong>. All data transmission uses <strong>HTTPS/TLS</strong>. We practice <strong>data minimization</strong> — we only collect what's absolutely necessary to deliver our social media management, scheduling, analytics, and automation services.</p>
                                </div>
                            </div>
                        </section>

                        <section id="data-collected" className="legal-section">
                            <h2>2. Information We Collect</h2>
                            <h3>2.1 Account Registration Data</h3>
                            <p>When you register for a SocialNex account, create a user profile, or sign up for our social media management platform, we collect the following personal information for account creation, identity verification, email verification, and secure authentication:</p>
                            <ul>
                                <li><strong>Full Name</strong> — for personalization, display name, greeting emails, activity logs, analytics attribution, and user identification across the social media management dashboard.</li>
                                <li><strong>Email Address</strong> — for account verification, login authentication, password recovery, security alerts (login success alerts, login failure notifications, failed login attempt notifications), post failure email notifications, holiday reminder emails, marketing communications (with your consent), account communications, service updates, and transactional emails.</li>
                                <li><strong>Password</strong> — securely hashed using industry-standard bcrypt hashing algorithm with salt rounds. We never store plaintext passwords. Password security, password hashing, password encryption, and secure password storage are fundamental to our data protection strategy.</li>
                                <li><strong>Avatar/Profile Picture</strong> — optional profile customization, user avatar, profile image for social media management dashboard display.</li>
                                <li><strong>Gender</strong> — optional, for avatar and personalization preferences.</li>
                            </ul>

                            <h3>2.2 Social Media Account Data</h3>
                            <p>When you connect social media accounts, social media platforms, or social networking services to SocialNex for multi-platform posting, cross-platform publishing, social media scheduling, and content distribution, we collect:</p>
                            <ul>
                                <li><strong>OAuth Access Tokens</strong> — encrypted with AES-256 encryption for secure storage. Used for authorized API access to post content, schedule posts, retrieve analytics, and manage your social media accounts on Bluesky, LinkedIn, Telegram, Discord, Reddit, and Mastodon. Token encryption, secure token storage, and encrypted credential management are core security features.</li>
                                <li><strong>Platform User IDs</strong> — unique identifiers from each connected social media platform for account linking, identity verification, and preventing duplicate connections.</li>
                                <li><strong>Profile Information</strong> — display name, username, profile picture URL, and account metadata from connected social media platforms for dashboard display and account management.</li>
                                <li><strong>Token Expiration Data</strong> — to manage token refresh cycles, automatic re-authentication, connection health monitoring, and proactive expiration alerting.</li>
                            </ul>

                            <h3>2.3 Content & Posting Data</h3>
                            <p>When you create social media posts, schedule content, use our social media scheduler, or publish through our multi-platform posting system, we collect and process:</p>
                            <ul>
                                <li>Post content (text, captions, descriptions), media attachments (images, videos, GIFs), hashtags, mentions, links, and media files uploaded to our social media content management system.</li>
                                <li>Scheduling metadata including scheduled date, scheduled time, timezone, publishing status, platform selection, and cross-posting configuration.</li>
                                <li>Post performance data, publishing results, delivery status, error logs, and platform-specific response data from the social media APIs.</li>
                            </ul>

                            <h3>2.4 Usage & Analytics Data</h3>
                            <p>We automatically collect usage data, behavioral analytics, platform interaction data, and technical information to improve our social media management platform:</p>
                            <ul>
                                <li>Activity logs (login events, post creation, account connections, settings changes, feature usage, social media platform interactions).</li>
                                <li>Browser type and version, operating system, device type, screen resolution, language preferences, and user agent string.</li>
                                <li>IP address (for security monitoring, login alerting, geographic personalization, fraud detection, and abuse prevention).</li>
                                <li>Page views, feature interactions, session duration, navigation paths, click patterns, and engagement metrics within the SocialNex dashboard.</li>
                            </ul>

                            <h3>2.5 Notification & Alert Preferences</h3>
                            <p>We collect your notification settings, email alert preferences, and communication choices:</p>
                            <ul>
                                <li>Alert email address (separate from login email), master notification toggle, per-alert granular controls (login success alerts, login failure alerts, post failure alerts, account disconnect alerts, holiday/festival reminders, marketing communications).</li>
                            </ul>
                        </section>

                        <section id="usage" className="legal-section">
                            <h2>3. How We Use Your Data</h2>
                            <p>SocialNex, as a social media management platform, social media scheduling tool, multi-platform posting system, social media dashboard, social media analytics platform, and content automation service, uses your collected data for the following legitimate purposes:</p>
                            <ul>
                                <li><strong>Social Media Management Services</strong> — to provide multi-platform posting to Bluesky, LinkedIn, Telegram, Discord, Reddit, and Mastodon; content scheduling and automated publishing; social media calendar management; post queue management; and cross-platform content distribution.</li>
                                <li><strong>Analytics & Insights</strong> — to generate social media analytics dashboards, track post performance metrics, engagement analytics, audience growth metrics, platform-specific analytics, content performance reports, and social media ROI tracking.</li>
                                <li><strong>Security & Protection</strong> — to send login security alerts, detect unauthorized access, monitor failed login attempts, protect against brute-force attacks, encrypt sensitive data like social media OAuth tokens, and maintain the integrity of your social media management account.</li>
                                <li><strong>Smart Alerts & Notifications</strong> — to deliver holiday/festival content reminders (India and global holidays), post failure notifications, account connection status alerts, system maintenance notifications, and security advisory emails.</li>
                                <li><strong>Account Management</strong> — user authentication, session management, password recovery, email verification, profile customization, and account preferences.</li>
                                <li><strong>Service Improvement</strong> — to analyze usage patterns, improve social media management features, optimize scheduling algorithms, enhance platform reliability, develop new social media automation tools, and improve user experience.</li>
                            </ul>
                        </section>

                        <section id="storage" className="legal-section">
                            <h2>4. Data Storage & Security</h2>
                            <p>SocialNex takes data security, information security, cybersecurity, and privacy protection extremely seriously. Our security infrastructure for the social media management platform includes:</p>
                            <div className="legal-grid">
                                <div className="legal-grid-card">
                                    <span className="legal-card-icon">🔐</span>
                                    <h4>AES-256 Encryption</h4>
                                    <p>All social media OAuth tokens, API keys, and sensitive credentials are encrypted using AES-256-CBC encryption with unique initialization vectors. Industry-standard encryption protecting your social media account connections.</p>
                                </div>
                                <div className="legal-grid-card">
                                    <span className="legal-card-icon">🔑</span>
                                    <h4>bcrypt Password Hashing</h4>
                                    <p>User passwords are hashed with bcrypt algorithm using 12 salt rounds. Plaintext passwords are never stored, logged, or transmitted. One-way hash ensures password security even in the event of a data breach.</p>
                                </div>
                                <div className="legal-grid-card">
                                    <span className="legal-card-icon">🌐</span>
                                    <h4>HTTPS/TLS Everywhere</h4>
                                    <p>All data transmission between your browser and SocialNex servers uses HTTPS with TLS 1.2+ encryption. API communications with social media platforms are also encrypted end-to-end.</p>
                                </div>
                                <div className="legal-grid-card">
                                    <span className="legal-card-icon">🛡️</span>
                                    <h4>JWT Authentication</h4>
                                    <p>Secure JWT (JSON Web Token) authentication with short-lived access tokens and rotating refresh tokens. Session management with automatic token revocation on logout, password change, or suspicious activity detection.</p>
                                </div>
                            </div>
                        </section>

                        <section id="sharing" className="legal-section">
                            <h2>5. Data Sharing & Third Parties</h2>
                            <p>SocialNex does <strong>NOT sell, trade, rent, or commercialize</strong> your personal data, social media data, analytics data, or any user information to third parties, data brokers, advertising networks, or marketing companies.</p>
                            <p>We share data only with:</p>
                            <ul>
                                <li><strong>Connected Social Media Platforms</strong> — Bluesky, LinkedIn, Telegram, Discord, Reddit, Mastodon (and future platforms) — only the content you explicitly choose to post, publish, or schedule through our social media management dashboard. We act as your authorized publishing agent.</li>
                                <li><strong>Infrastructure Providers</strong> — hosting providers, CDN services, email delivery services (for transactional emails, security alerts, and holiday reminders) — under strict data processing agreements with confidentiality obligations.</li>
                                <li><strong>Legal Requirements</strong> — if required by Indian law, court order, government request, CERT-IN directive, or to protect the rights, property, or safety of Vayunex Solution, SocialNex users, or the public.</li>
                            </ul>
                        </section>

                        <section id="cookies" className="legal-section">
                            <h2>6. Cookies & Tracking Technologies</h2>
                            <p>SocialNex uses minimal, essential cookies and local storage for the social media management platform functionality:</p>
                            <ul>
                                <li><strong>Authentication Tokens</strong> — stored in localStorage for session persistence, JWT access tokens, and refresh tokens for seamless social media dashboard access.</li>
                                <li><strong>User Preferences</strong> — theme settings, notification preferences, dashboard layout preferences, and social media account display order.</li>
                                <li><strong>Security Cookies</strong> — CSRF protection tokens, session identifiers, and anti-forgery measures for secure social media operations.</li>
                            </ul>
                            <p>We do <strong>NOT</strong> use third-party advertising cookies, social media tracking pixels, Google Analytics tracking, Facebook Pixel, or any behavioral advertising trackers. SocialNex does not participate in cross-site tracking, behavioral targeting, or programmatic advertising networks.</p>
                        </section>

                        <section id="social-accounts" className="legal-section">
                            <h2>7. Connected Social Media Accounts</h2>
                            <p>When you connect your social media accounts (Bluesky account, LinkedIn profile, Telegram channel, Discord server, Reddit account, Mastodon instance) to SocialNex:</p>
                            <ul>
                                <li>We only request the <strong>minimum permissions</strong> necessary for posting content and reading basic profile information. For LinkedIn, we use OpenID Connect scopes (openid, profile, email) and Share on LinkedIn (w_member_social). For Bluesky, we use AT Protocol authentication. For Telegram and Discord, we use bot tokens/webhooks.</li>
                                <li>You can <strong>disconnect any social media account</strong> at any time from the SocialNex settings page. Upon disconnection, we securely delete the encrypted access tokens for that social media platform.</li>
                                <li>We <strong>never access</strong> your social media direct messages, private conversations, friend lists, follower lists, or any data beyond what's explicitly needed for the social media management, scheduling, and posting features you use.</li>
                            </ul>
                        </section>

                        <section id="rights" className="legal-section">
                            <h2>8. Your Rights</h2>
                            <p>Under the Indian Digital Personal Data Protection Act 2023 (DPDP Act), Information Technology Act 2000, and global privacy standards, you have the following data rights:</p>
                            <ul>
                                <li><strong>Right to Access</strong> — request a copy of all personal data we hold about you, including social media connection data, posting history, analytics data, and activity logs.</li>
                                <li><strong>Right to Correction</strong> — update or correct your personal information, profile data, email address, or any inaccurate data through the settings page or by contacting us.</li>
                                <li><strong>Right to Erasure</strong> — request complete deletion of your SocialNex account and all associated data including posts, schedules, analytics, activity logs, connected social media accounts, and notification preferences.</li>
                                <li><strong>Right to Data Portability</strong> — export your social media management data in standard formats.</li>
                                <li><strong>Right to Object</strong> — object to processing of your data for specific purposes, withdraw consent for marketing communications, and opt-out of non-essential data collection.</li>
                                <li><strong>Right to Restrict Processing</strong> — request limitation of data processing while disputed accuracy or processing lawfulness is being verified.</li>
                            </ul>
                        </section>

                        <section id="retention" className="legal-section">
                            <h2>9. Data Retention</h2>
                            <p>SocialNex retains your personal data, social media management data, posting data, analytics information, and activity logs only for as long as necessary to provide our social media management services and comply with legal obligations:</p>
                            <ul>
                                <li><strong>Active Account Data</strong> — retained throughout your active use of the SocialNex social media management platform.</li>
                                <li><strong>Activity Logs</strong> — retained for 12 months for security auditing, compliance, and your reference via the activity logs feature.</li>
                                <li><strong>Analytics Data</strong> — aggregated and anonymized analytics data may be retained for service improvement. Individual user analytics data is deleted upon account deletion.</li>
                                <li><strong>Deleted Account Data</strong> — permanently purged within 30 days of account deletion request, including all social media tokens, posting history, and personal information.</li>
                                <li><strong>Server Logs</strong> — error logs and access logs retained for 90 days for debugging, security monitoring, and incident response.</li>
                            </ul>
                        </section>

                        <section id="children" className="legal-section">
                            <h2>10. Children's Privacy</h2>
                            <p>SocialNex social media management platform is not intended for children under the age of 18 years. We do not knowingly collect personal data, social media data, or any information from minors, children, or individuals under 18 years of age. If we discover that a minor has provided personal information to SocialNex, we will immediately delete that information and terminate the associated account. Parents or guardians who believe their child has provided data to SocialNex should contact us immediately at <strong>support@vayunexsolution.com</strong>.</p>
                        </section>

                        <section id="international" className="legal-section">
                            <h2>11. International Data Transfers</h2>
                            <p>SocialNex is operated by Vayunex Solution from India. If you access our social media management platform from outside India, your data may be transferred to and processed in India. By using SocialNex, you consent to this transfer. We ensure that appropriate safeguards are in place for any international data transfers in compliance with the DPDP Act 2023, IT Act 2000, and applicable cross-border data transfer regulations.</p>
                        </section>

                        <section id="compliance" className="legal-section">
                            <h2>12. Indian Law Compliance</h2>
                            <p>SocialNex privacy practices comply with the following Indian laws, regulations, and standards governing data protection, information technology, digital privacy, and social media platforms:</p>
                            <ul>
                                <li><strong>Digital Personal Data Protection Act 2023 (DPDP Act)</strong> — India's comprehensive data protection legislation governing personal data processing, consent management, data principal rights, data fiduciary obligations, and cross-border data transfers.</li>
                                <li><strong>Information Technology Act 2000 (IT Act)</strong> — India's primary legislation governing electronic commerce, digital signatures, cybersecurity, data protection, intermediary liability, and information technology governance.</li>
                                <li><strong>IT (Reasonable Security Practices) Rules 2011</strong> — standards for protecting sensitive personal data including passwords, financial information, health data, biometric data, and sexual orientation data.</li>
                                <li><strong>IT (Intermediary Guidelines) Rules 2021</strong> — compliance with intermediary obligations including grievance redressal, content moderation, and user privacy protections for social media management platforms.</li>
                            </ul>
                        </section>

                        <section id="changes" className="legal-section">
                            <h2>13. Policy Changes</h2>
                            <p>Vayunex Solution reserves the right to update, modify, or revise this Privacy Policy at any time. When we make material changes to this privacy policy, data collection practices, data sharing policies, or security measures for the SocialNex social media management platform, we will notify you through email notification, dashboard announcement, or prominent notice on the SocialNex platform. Your continued use of SocialNex after such modifications constitutes acceptance of the updated privacy policy.</p>
                        </section>

                        <section id="contact" className="legal-section">
                            <h2>14. Contact Us</h2>
                            <p>If you have any questions, concerns, data access requests, data deletion requests, or complaints about this Privacy Policy, SocialNex's data practices, or how your personal data is handled by our social media management platform, please contact us:</p>
                            <div className="legal-contact-card">
                                <p><strong>Vayunex Solution</strong> — Data Protection & Privacy</p>
                                <p>📧 Email: <a href="mailto:support@vayunexsolution.com">support@vayunexsolution.com</a></p>
                                <p>🌐 Website: <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">www.vayunexsolution.com</a></p>
                                <p>📍 Location: India</p>
                                <p>⏰ Response Time: Within 72 hours on business days</p>
                            </div>
                        </section>
                    </article>
                </div>
            </section>

            {/* Footer */}
            <footer className="legal-footer">
                <div className="legal-container">
                    <p>© 2026 SocialNex — A Product by <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">Vayunex Solution</a> 💜</p>
                    <div className="legal-footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/terms-of-service">Terms of Service</Link>
                        <Link to="/register">Get Started</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default PrivacyPolicy
