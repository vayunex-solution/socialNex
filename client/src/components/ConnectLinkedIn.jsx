import { useState, useEffect } from 'react'
import API_URL from '../config/api'

function ConnectLinkedIn({ onSuccess, onClose }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [callbackProcessing, setCallbackProcessing] = useState(false)

    // Check if we landed back from LinkedIn with a code
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        if (code && state && state.startsWith('linkedin_')) {
            setCallbackProcessing(true)
            handleCallback(code)
        }
    }, [])

    const handleCallback = async (code) => {
        setError('')
        setLoading(true)

        try {
            const token = localStorage.getItem('accessToken')
            const frontendUrl = window.location.origin
            const redirectUri = `${frontendUrl}/dashboard`

            const response = await fetch(`${API_URL}/social/linkedin/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code, redirectUri })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Clean the URL (remove LinkedIn code params)
                window.history.replaceState({}, '', '/dashboard')
                onSuccess(data.data)
            } else {
                setError(data.message || 'Failed to connect LinkedIn.')
                window.history.replaceState({}, '', '/dashboard')
            }
        } catch (err) {
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
            const response = await fetch(`${API_URL}/social/linkedin/auth-url`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Save state for CSRF verification
                localStorage.setItem('linkedin_oauth_state', data.data.state)
                // Redirect to LinkedIn
                window.location.href = data.data.authUrl
            } else {
                setError(data.message || 'Failed to get auth URL.')
                setLoading(false)
            }
        } catch (err) {
            setError('Network error. Is the server running?')
            setLoading(false)
        }
    }

    // If processing callback, show spinner
    if (callbackProcessing) {
        return (
            <div className="connect-modal-overlay">
                <div className="connect-modal glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>Connecting LinkedIn...</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Processing your authorization</p>
                </div>
            </div>
        )
    }

    return (
        <div className="connect-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="connect-modal glass-card">
                <div className="modal-header">
                    <h2>🔵 Connect LinkedIn</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-instructions">
                    <h3>📋 How LinkedIn Connection Works:</h3>
                    <ol className="steps-list">
                        <li>
                            Click <strong>"Connect with LinkedIn"</strong> below
                        </li>
                        <li>
                            You'll be <strong>redirected to LinkedIn</strong> to log in
                        </li>
                        <li>
                            <strong>Authorize SocialNex</strong> to post on your behalf
                        </li>
                        <li>
                            You'll be <strong>redirected back</strong> and your account will be connected!
                        </li>
                    </ol>

                    <div className="info-box">
                        <span className="info-icon">🔒</span>
                        <p>We use LinkedIn's official OAuth 2.0. Your password is never shared with us. Access token expires in 60 days.</p>
                    </div>

                    {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>{error}</div>}

                    <button
                        className="btn btn-primary"
                        onClick={handleConnect}
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            background: 'linear-gradient(135deg, #0077B5, #00A0DC)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '16px',
                            padding: '14px'
                        }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                                Redirecting to LinkedIn...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                Connect with LinkedIn
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConnectLinkedIn
