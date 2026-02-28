import { useState } from 'react'
import API_URL from '../config/api'
import './ConnectBluesky.css'

function ConnectTelegram({ onSuccess, onClose }) {
    const [formData, setFormData] = useState({
        botToken: '',
        chatId: ''
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
            const response = await fetch(`${API_URL}/social/telegram/connect`, {
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
                    <span className="platform-icon">📱</span>
                    <h2>Connect Telegram</h2>
                    <p>Connect a Telegram channel or group to post messages from SocialNex</p>
                </div>

                {/* Important Pre-requisite Notice */}
                <div className="alert alert-warning" style={{ textAlign: 'left', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <strong>⚠️ IMPORTANT BEFORE CONNECTING:</strong>
                    <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                        <li>Create a bot via <strong>@BotFather</strong> and copy the Token.</li>
                        <li>Add the bot to your Telegram Channel/Group and make it an <strong>Admin</strong>.</li>
                        <li>Send a test message (e.g. "hello") in that channel/group.</li>
                    </ol>
                    <p style={{ marginTop: '8px', fontStyle: 'italic' }}>Only after doing these steps, paste the token below and click Connect.</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="connect-form">
                    <div className="form-group">
                        <label htmlFor="botToken">Telegram Bot Token</label>
                        <input
                            type="password"
                            id="botToken"
                            name="botToken"
                            className="form-input"
                            placeholder="e.g. 123456:ABC-DEF1234ghI..."
                            value={formData.botToken}
                            onChange={handleChange}
                            required
                        />
                        <span className="form-hint">
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                {showInstructions ? 'Hide Instructions' : 'How to connect?'}
                            </button>
                        </span>
                    </div>

                    {showInstructions && (
                        <div className="instructions-box">
                            <h4>🤖 Step 1: Get Bot Token</h4>
                            <ol>
                                <li>Open Telegram and search for <strong>@BotFather</strong></li>
                                <li>Send <code>/newbot</code> to create a bot</li>
                                <li>Copy the HTTP API <strong>token</strong> given to you and paste it above</li>
                            </ol>

                            <h4 style={{ marginTop: '12px' }}>📢 Step 2: Auto-connect Channel</h4>
                            <ol>
                                <li>Add your newly created bot to your Channel or Group</li>
                                <li>Make sure to promote the bot to <strong>Admin</strong></li>
                                <li>Send a test message (like "hello") in the channel</li>
                                <li>Click the <strong>Connect Telegram</strong> button below. We'll find it automatically!</li>
                            </ol>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>📱 Connect Telegram</>
                        )}
                    </button>
                </form>

                <div className="connect-footer">
                    <p>🔒 Your bot token is encrypted and secure</p>
                </div>
            </div>
        </div>
    )
}

export default ConnectTelegram
