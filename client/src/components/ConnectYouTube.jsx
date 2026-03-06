import { useState, useRef, useEffect } from 'react'
import API_URL from '../config/api'
import './ConnectYouTube.css'

function ConnectYouTube({ onSuccess, onClose }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [callbackProcessing, setCallbackProcessing] = useState(false)
    const callbackAttempted = useRef(false)

    // Handle the OAuth redirect back from Google
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        if (code && state && state.startsWith('youtube_')) {
            if (callbackAttempted.current) return
            callbackAttempted.current = true
            setCallbackProcessing(true)
            handleCallback(code)
        }
    }, [])

    const handleCallback = async (code) => {
        setError('')
        setLoading(true)
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(`${API_URL}/social/youtube/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            })
            const data = await response.json()

            if (response.ok && data.success) {
                window.history.replaceState({}, '', '/dashboard')
                onSuccess(data.data)
            } else {
                setError(data.message || 'Failed to connect YouTube channel.')
                window.history.replaceState({}, '', '/dashboard')
            }
        } catch {
            setError('Network error. Is the server running?')
            window.history.replaceState({}, '', '/dashboard')
        } finally {
            setLoading(false)
            setCallbackProcessing(false)
        }
    }

    const handleConnect = async () => {
        setError('')
        setLoading(true)
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(`${API_URL}/social/youtube/auth-url`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()

            if (response.ok && data.success) {
                // Store state for verification on return
                sessionStorage.setItem('yt_oauth_state', data.data.state)
                window.location.href = data.data.url
            } else {
                setError(data.message || 'Could not generate YouTube auth URL.')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (callbackProcessing) {
        return (
            <div className="yt-connect-overlay">
                <div className="yt-connect-modal">
                    <div className="yt-loading-spinner" />
                    <p className="yt-processing-text">Connecting your YouTube channel...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="yt-connect-overlay" onClick={onClose}>
            <div className="yt-connect-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="yt-modal-header">
                    <div className="yt-modal-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF0000">
                            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 className="yt-modal-title">Connect YouTube</h2>
                        <p className="yt-modal-subtitle">Upload videos directly from SocialNex</p>
                    </div>
                    <button className="yt-close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Features */}
                <div className="yt-features-list">
                    {[
                        { icon: '🎬', text: 'Upload videos (up to 4 GB)' },
                        { icon: '📐', text: 'YouTube Shorts support (vertical video)' },
                        { icon: '🖼️', text: 'Custom thumbnail upload' },
                        { icon: '🔒', text: 'Set privacy: Public / Unlisted / Private' },
                        { icon: '📊', text: 'Channel stats: subscribers, views, videos' },
                    ].map(f => (
                        <div key={f.text} className="yt-feature-row">
                            <span>{f.icon}</span>
                            <span>{f.text}</span>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && <div className="yt-error-msg">{error}</div>}

                {/* Action */}
                <button
                    className="yt-connect-btn"
                    onClick={handleConnect}
                    disabled={loading}
                >
                    {loading ? (
                        <><div className="yt-btn-spinner" /> Redirecting to Google...</>
                    ) : (
                        <><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> Connect with Google</>
                    )}
                </button>

                <p className="yt-secure-note">
                    🔒 OAuth 2.0 — We never store your Google password. Tokens are AES-256 encrypted.
                </p>
            </div>
        </div>
    )
}

export default ConnectYouTube
