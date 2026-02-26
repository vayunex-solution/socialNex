import { useEffect } from 'react'

/**
 * SEO Component — Unified SEO, AEO, and GEO optimization
 * 
 * Injects: <title>, <meta> (description, keywords, robots, author, geo),
 *          Open Graph tags, Twitter Card tags, JSON-LD schemas
 * 
 * Accepts props for Programmatic SEO (dynamic routes in future).
 * 
 * @param {string}  title          - Page title
 * @param {string}  description    - Meta description
 * @param {string}  keywords       - Comma-separated keywords
 * @param {string}  canonicalUrl   - Canonical URL for the page
 * @param {string}  author         - Author/Company name
 * @param {object}  openGraph      - { type, title, description, image, url }
 * @param {object}  twitter        - { card, title, description, image }
 * @param {object}  geo            - { region, placename, position, icbm }
 * @param {array}   jsonLdSchemas  - Array of JSON-LD schema objects
 * @param {string}  robots         - Robots directive
 * @param {object}  extra          - Any extra meta tags { name: content } or { property: content }
 */
function SEO({
    title = 'SocialNex | Free AI Social Media Management & Auto-Scheduler',
    description = 'Manage Facebook, Instagram, LinkedIn, and YouTube from one dashboard. Generate AI posters and auto-schedule posts for free. Built for creators and agencies.',
    keywords = '',
    canonicalUrl = '',
    author = 'Vayunex Solution',
    openGraph = {},
    twitter = {},
    geo = {},
    jsonLdSchemas = [],
    robots = 'index, follow, max-snippet:-1, max-image-preview:large',
    extra = {},
}) {
    useEffect(() => {
        // Track elements we create so we can clean up
        const createdElements = []

        // ── Title ──
        document.title = title

        // ── Helper to create/update meta ──
        const setMeta = (attr, attrValue, content) => {
            let el = document.querySelector(`meta[${attr}="${attrValue}"]`)
            if (el) {
                el.setAttribute('content', content)
            } else {
                el = document.createElement('meta')
                el.setAttribute(attr, attrValue)
                el.setAttribute('content', content)
                document.head.appendChild(el)
                createdElements.push(el)
            }
        }

        // ── Traditional SEO Meta Tags ──
        setMeta('name', 'description', description)
        if (keywords) setMeta('name', 'keywords', keywords)
        if (robots) setMeta('name', 'robots', robots)
        if (author) setMeta('name', 'author', author)

        // ── Canonical URL ──
        if (canonicalUrl) {
            let link = document.querySelector('link[rel="canonical"]')
            if (!link) {
                link = document.createElement('link')
                link.setAttribute('rel', 'canonical')
                document.head.appendChild(link)
                createdElements.push(link)
            }
            link.setAttribute('href', canonicalUrl)
        }

        // ── Open Graph ──
        const og = {
            'og:type': openGraph.type || 'website',
            'og:title': openGraph.title || title,
            'og:description': openGraph.description || description,
            'og:url': openGraph.url || canonicalUrl || '',
            ...(openGraph.image ? { 'og:image': openGraph.image } : {}),
            ...(openGraph.siteName ? { 'og:site_name': openGraph.siteName } : {}),
            'og:locale': openGraph.locale || 'en_IN',
        }
        Object.entries(og).forEach(([prop, content]) => {
            if (content) setMeta('property', prop, content)
        })

        // ── Twitter Card ──
        const tw = {
            'twitter:card': twitter.card || 'summary_large_image',
            'twitter:title': twitter.title || openGraph.title || title,
            'twitter:description': twitter.description || openGraph.description || description,
            ...(twitter.image || openGraph.image ? { 'twitter:image': twitter.image || openGraph.image } : {}),
        }
        Object.entries(tw).forEach(([prop, content]) => {
            if (content) setMeta('name', prop, content)
        })

        // ── GEO Tags ──
        if (geo.region) setMeta('name', 'geo.region', geo.region)
        if (geo.placename) setMeta('name', 'geo.placename', geo.placename)
        if (geo.position) setMeta('name', 'geo.position', geo.position)
        if (geo.icbm) setMeta('name', 'ICBM', geo.icbm)

        // ── Extra Meta ──
        if (extra && typeof extra === 'object') {
            Object.entries(extra).forEach(([key, content]) => {
                const isProperty = key.startsWith('og:') || key.startsWith('article:') || key.startsWith('fb:')
                setMeta(isProperty ? 'property' : 'name', key, content)
            })
        }

        // ── JSON-LD Schemas (AEO) ──
        const scriptElements = jsonLdSchemas.map(schema => {
            const script = document.createElement('script')
            script.type = 'application/ld+json'
            script.textContent = JSON.stringify(schema)
            document.head.appendChild(script)
            createdElements.push(script)
            return script
        })

        // ── Cleanup on unmount ──
        return () => {
            createdElements.forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el)
            })
        }
    }, [title, description, keywords, canonicalUrl, author, openGraph, twitter, geo, jsonLdSchemas, robots, extra])

    // This component doesn't render anything visible
    return null
}

export default SEO
