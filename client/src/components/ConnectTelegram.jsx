import { useState } from 'react'
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
            const response = await fetch('http://localhost:5000/api/v1/social/telegram/connect', {
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
                    <p>Connect a Telegram channel or group to post messages from SocialMRT</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="connect-form">
                    <div className="form-group">
                        <label htmlFor="botToken">Bot Token</label>
                        <input
                            type="password"
                            id="botToken"
                            name="botToken"
                            className="form-input"
                            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                            value={formData.botToken}
                            onChange={handleChange}
                            required
                        />
                        <span className="form-hint">Token from @BotFather</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="chatId">Channel / Group ID</label>
                        <input
                            type="text"
                            id="chatId"
                            name="chatId"
                            className="form-input"
                            placeholder="@channelname or -1001234567890"
                            value={formData.chatId}
                            onChange={handleChange}
                            required
                        />
                        <span className="form-hint">
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                {showInstructions ? 'Hide' : 'How to get Bot Token & Chat ID?'}
                            </button>
                        </span>
                    </div>

                    {showInstructions && (
                        <div className="instructions-box">
                            <h4>🤖 Step 1: Create a Bot</h4>
                            <ol>
                                <li>Open Telegram and search for <strong>@BotFather</strong></li>
                                <li>Send <code>/newbot</code></li>
                                <li>Choose a name (e.g., "My SocialMRT Bot")</li>
                                <li>Choose a username ending in "bot" (e.g., <code>mysocialmrt_bot</code>)</li>
                                <li>Copy the <strong>token</strong> and paste above</li>
                            </ol>

                            <h4 style={{ marginTop: '12px' }}>📢 Step 2: Get Channel/Group ID</h4>
                            <ol>
                                <li><strong>For channels:</strong> Use <code>@channelname</code> format</li>
                                <li>Add your bot as <strong>Admin</strong> to the channel/group</li>
                                <li><strong>For groups:</strong> Add the bot, send a message, then visit:<br />
                                    <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code><br />
                                    and find the <code>chat.id</code> field
                                </li>
                            </ol>

                            <p className="warning-text">⚠️ Bot must be admin of the channel/group to post!</p>
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
