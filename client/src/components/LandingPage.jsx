import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import logoIcon from '../assets/logo-icon.png'
import FloatingSupport from './FloatingSupport'
import SEO from './SEO'
import DemoDashboard from './DemoDashboard'
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

/* Platform SVG Icons */
const PlatformIcons = {
    Bluesky: (c) => <svg width="32" height="32" viewBox="0 0 568 501" fill={c}><path d="M123.121 33.664C188.241 82.553 258.281 181.68 284 234.873c25.719-53.192 95.759-152.32 160.879-201.21C491.866-1.611 568-28.906 568 57.947c0 17.346-9.945 145.713-15.778 166.555-20.275 72.453-94.155 90.933-159.875 79.748C507.222 323.8 536.444 388.56 473.333 453.32c-119.86 122.992-172.272-30.859-185.702-70.281-2.462-7.227-3.614-10.608-3.631-7.733-.017-2.875-1.169.506-3.631 7.733-13.43 39.422-65.842 193.273-185.702 70.28-63.111-64.76-33.89-129.52 80.986-149.07-65.72 11.185-139.6-7.295-159.875-79.748C9.945 203.659 0 75.291 0 57.946 0-28.906 76.135-1.612 123.121 33.664z"/></svg>,
    LinkedIn: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    Telegram: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    Discord: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>,
    Reddit: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/></svg>,
    Mastodon: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 00.023-.043v-1.809a.052.052 0 00-.02-.041.053.053 0 00-.046-.01 20.282 20.282 0 01-4.709.547c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 01-.319-1.433.053.053 0 01.066-.054 19.648 19.648 0 004.636.536c.281 0 .563 0 .844-.01 1.555-.042 3.198-.122 4.73-.378 .038-.007.077-.013.115-.022 2.236-.422 4.368-1.746 4.588-3.993.074-.754.11-1.543.11-2.318 0-.677.042-1.89-.192-3.126zM18.89 15.27h-2.406v-5.47c0-1.15-.482-1.733-1.45-1.733-1.069 0-1.604.693-1.604 2.063v2.986h-2.392v-2.986c0-1.37-.536-2.063-1.604-2.063-.967 0-1.45.583-1.45 1.733v5.47H5.578V9.57c0-1.15.293-2.064.879-2.74.605-.676 1.397-1.022 2.38-1.022.136 0 1.321-.187 2.238.702.43.417.576.988.576.988s.145-.571.576-.988c.917-.889 2.102-.702 2.238-.702.983 0 1.775.346 2.38 1.022.586.676.879 1.59.879 2.74v5.7z"/></svg>,
    Facebook: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    Instagram: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg>,
    'Twitter/X': (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    YouTube: (c) => <svg width="32" height="32" viewBox="0 0 24 24" fill={c}><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
}

const platforms = [
    { name: 'Bluesky', icon: PlatformIcons.Bluesky('#0085FF'), status: 'live', color: '#0085FF' },
    { name: 'LinkedIn', icon: PlatformIcons.LinkedIn('#0A66C2'), status: 'live', color: '#0A66C2' },
    { name: 'Telegram', icon: PlatformIcons.Telegram('#26A5E4'), status: 'live', color: '#26A5E4' },
    { name: 'Discord', icon: PlatformIcons.Discord('#5865F2'), status: 'live', color: '#5865F2' },
    { name: 'Reddit', icon: PlatformIcons.Reddit('#FF4500'), status: 'live', color: '#FF4500' },
    { name: 'Mastodon', icon: PlatformIcons.Mastodon('#6364FF'), status: 'live', color: '#6364FF' },
    { name: 'Facebook', icon: PlatformIcons.Facebook('#1877F2'), status: 'soon', color: '#1877F2' },
    { name: 'Instagram', icon: PlatformIcons.Instagram('#E4405F'), status: 'soon', color: '#E4405F' },
    { name: 'Twitter/X', icon: PlatformIcons['Twitter/X']('#fff'), status: 'soon', color: '#000' },
    { name: 'YouTube', icon: PlatformIcons.YouTube('#FF0000'), status: 'soon', color: '#FF0000' },
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

                    {/* Real Dashboard Screenshot */}
                    <RevealSection className="lp-hero-visual" delay={300} direction="right">
                        <div className="lp-mockup">
                            <img 
                                src="/dashboard-preview.png" 
                                alt="SocialNex Dashboard — Analytics, Scheduling, Multi-Platform Posting" 
                                className="lp-dashboard-img"
                                loading="lazy"
                            />
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
                LIVE DEMO — Interactive Dashboard
               ═══════════════════════════════════════════════════════════ */}
            <section className="lp-section lp-demo-section">
                <div className="lp-container">
                    <RevealSection>
                        <div className="lp-section-badge">🖥️ Live Demo</div>
                        <h2 className="lp-section-h2">
                            Experience the <span className="lp-gradient-text">Dashboard</span>
                        </h2>
                        <p className="lp-section-sub">Click around. Explore every feature. No signup needed — this is a fully interactive preview of your future dashboard.</p>
                    </RevealSection>
                    <RevealSection delay={200}>
                        <div className="lp-demo-container">
                            <DemoDashboard />
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                HOW IT WORKS — Visual Guide for Gen-Z
               ═══════════════════════════════════════════════════════════ */}
            <section className="lp-section lp-guide">
                <div className="lp-container">
                    <RevealSection>
                        <div className="lp-section-badge">📖 Super Simple</div>
                        <h2 className="lp-section-h2">
                            How It <span className="lp-gradient-text">Works</span>
                        </h2>
                        <p className="lp-section-sub">4 steps. Under 30 seconds. No tutorial needed.</p>
                    </RevealSection>

                    <div className="lp-guide-steps">
                        {[
                            { num: '01', icon: '🚀', title: 'Sign Up Free', desc: 'One click. No credit card. Your dashboard is ready in 30 seconds.', accent: '#6366F1' },
                            { num: '02', icon: '🔗', title: 'Connect Platforms', desc: 'Link your Bluesky, LinkedIn, Discord, Telegram & more — OAuth, no passwords shared.', accent: '#8B5CF6' },
                            { num: '03', icon: '✍️', title: 'Create & Schedule', desc: 'Write once, post everywhere. Use AI to generate posters. Schedule for the perfect time.', accent: '#C084FC' },
                            { num: '04', icon: '📈', title: 'Track & Grow', desc: 'Real-time analytics across all platforms. See what works. Repeat. Scale.', accent: '#EC4899' },
                        ].map((step, i) => (
                            <RevealSection key={step.num} delay={i * 120}>
                                <div className="lp-guide-card">
                                    <div className="lp-guide-num" style={{ background: `${step.accent}15`, color: step.accent, borderColor: `${step.accent}30` }}>
                                        {step.num}
                                    </div>
                                    <div className="lp-guide-icon">{step.icon}</div>
                                    <h3 className="lp-guide-title">{step.title}</h3>
                                    <p className="lp-guide-desc">{step.desc}</p>
                                    {i < 3 && <div className="lp-guide-arrow" style={{ color: step.accent }}>→</div>}
                                </div>
                            </RevealSection>
                        ))}
                    </div>

                    <RevealSection delay={500}>
                        <div className="lp-guide-cta">
                            <Link to="/register" className="lp-btn-hero">
                                Start in 30 Seconds <span className="lp-btn-arrow">→</span>
                            </Link>
                            <p className="lp-hero-micro">🔒 No credit card • Free forever • Cancel anytime</p>
                        </div>
                    </RevealSection>
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

                    {/* Giant Footer Branding */}
                    <div className="lp-footer-giant-brand">
                        <div className="lp-giant-title">SOCIALNEX</div>
                        <div className="lp-giant-subtitle">P L A T F O R M</div>
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
