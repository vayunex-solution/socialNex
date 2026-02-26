import { useState, useRef, useEffect } from 'react'
import API_URL from '../config/api'

function ConnectFacebook({ onSuccess, onClose }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [callbackProcessing, setCallbackProcessing] = useState(false)
    const callbackAttempted = useRef(false)

    // Check if we landed back from Facebook with a code
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')

        if (code && state && state.startsWith('facebook_')) {
            if (callbackAttempted.current) return;
            callbackAttempted.current = true;

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
            // For OAuth we redirected the user from /dashboard, so they return to /dashboard
            const redirectUri = `${frontendUrl}/dashboard`

            const response = await fetch(`${API_URL}/social/facebook/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code, redirectUri })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Clean the URL (remove Facebook code params)
                window.history.replaceState({}, '', '/dashboard')
                onSuccess(data.data)
            } else {
                setError(data.message || 'Failed to connect Facebook Page.')
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
            const response = await fetch(`${API_URL}/social/facebook/auth-url`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Save state for CSRF verification (optional, backend verifies via code exchange anyway in some setups)
                localStorage.setItem('facebook_oauth_state', data.data.state)
                // Redirect to Facebook
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
                    <h3 style={{ color: '#fff', marginBottom: '10px' }}>Connecting Facebook Page...</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Processing your authorization</p>
                </div>
            </div>
        )
    }

    return (
        <div className="connect-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="connect-modal glass-card">
                <div className="modal-header">
                    <h2>📘 Connect Facebook Page</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-instructions">
                    <h3>📋 How Facebook Connection Works:</h3>
                    <ol className="steps-list">
                        <li>
                            Click <strong>"Connect with Facebook"</strong> below
                        </li>
                        <li>
                            You'll be <strong>redirected to Facebook</strong> to log in
                        </li>
                        <li>
                            <strong>Authorize SocialNex</strong> to post to the Pages you manage
                        </li>
                        <li>
                            You'll be <strong>redirected back</strong> and your primary Page will be connected!
                        </li>
                    </ol>

                    <div className="info-box facebook-info">
                        <span className="info-icon">💡</span>
                        <p><strong>Note:</strong> You must be an administrator or editor of a <strong>Facebook Page</strong>. Personal profiles cannot be connected due to Meta API restrictions.</p>
                    </div>

                    {error && (
                        <div className="error-message" style={{ marginTop: '20px' }}>
                            {error}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button
                        className="btn-connect facebook-bg"
                        onClick={handleConnect}
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> Connecting...
                            </>
                        ) : (
                            'Connect with Facebook'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConnectFacebook
