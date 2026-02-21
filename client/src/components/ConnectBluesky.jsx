import { useState } from 'react'
import './ConnectBluesky.css'

function ConnectBluesky({ onSuccess, onClose }) {
    const [formData, setFormData] = useState({
        handle: '',
        appPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showInstructions, setShowInstructions] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch('http://localhost:5000/api/v1/social/bluesky/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                onSuccess && onSuccess(data.data)
            } else {
                setError(data.message || 'Connection failed')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="connect-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
            <div className="connect-modal glass-card">
                <button className="modal-close" onClick={onClose}>×</button>

                <div className="connect-header">
                    <span className="platform-icon">🦋</span>
                    <h2>Connect Bluesky</h2>
                    <p>Link your Bluesky account to post directly from SocialMRT</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="connect-form">
                    <div className="form-group">
                        <label htmlFor="handle">Bluesky Handle</label>
                        <input
                            type="text"
                            id="handle"
                            name="handle"
                            className="form-input"
                            placeholder="yourname.bsky.social"
                            value={formData.handle}
                            onChange={handleChange}
                            required
                        />
                        <span className="form-hint">e.g., username.bsky.social or custom domain</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="appPassword">App Password</label>
                        <input
                            type="password"
                            id="appPassword"
                            name="appPassword"
                            className="form-input"
                            placeholder="xxxx-xxxx-xxxx-xxxx"
                            value={formData.appPassword}
                            onChange={handleChange}
                            required
                        />
                        <span className="form-hint">
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                {showInstructions ? 'Hide' : 'How to get App Password?'}
                            </button>
                        </span>
                    </div>

                    {showInstructions && (
                        <div className="instructions-box">
                            <h4>📱 How to create an App Password:</h4>
                            <ol>
                                <li>Open <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer">Bluesky Settings</a></li>
                                <li>Go to <strong>Settings → App Passwords</strong></li>
                                <li>Click <strong>"Add App Password"</strong></li>
                                <li>Name it "SocialMRT" and click Create</li>
                                <li>Copy the password (xxxx-xxxx-xxxx-xxxx) and paste above</li>
                            </ol>
                            <p className="warning-text">⚠️ Never use your main password! App passwords are safer.</p>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>🦋 Connect Bluesky</>
                        )}
                    </button>
                </form>

                <div className="connect-footer">
                    <p>🔒 Your credentials are encrypted and secure</p>
                </div>
            </div>
        </div>
    )
}

export default ConnectBluesky
