import { useState } from 'react'

function ConnectDiscord({ onSuccess, onClose }) {
    const [webhookUrl, setWebhookUrl] = useState('')
    const [channelName, setChannelName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState(1)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!webhookUrl.trim()) {
            setError('Please enter a Discord webhook URL.')
            return
        }

        // Basic validation
        if (!webhookUrl.includes('discord.com/api/webhooks/') && !webhookUrl.includes('discordapp.com/api/webhooks/')) {
            setError('Invalid webhook URL. It should start with https://discord.com/api/webhooks/')
            return
        }

        setLoading(true)

        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch('http://localhost:5000/api/v1/social/discord/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    webhookUrl: webhookUrl.trim(),
                    channelName: channelName.trim() || undefined
                })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                onSuccess(data.data)
            } else {
                setError(data.message || 'Failed to connect Discord.')
            }
        } catch (err) {
            setError('Network error. Is the server running?')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="connect-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="connect-modal glass-card">
                <div className="modal-header">
                    <h2>💬 Connect Discord</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {step === 1 ? (
                    <div className="modal-instructions">
                        <h3>📋 How to get a Webhook URL:</h3>
                        <ol className="steps-list">
                            <li>
                                <strong>Open Discord</strong> → Go to your server
                            </li>
                            <li>
                                <strong>Right-click</strong> the channel you want to post to
                            </li>
                            <li>
                                Click <strong>"Edit Channel"</strong> → <strong>"Integrations"</strong>
                            </li>
                            <li>
                                Click <strong>"Webhooks"</strong> → <strong>"New Webhook"</strong>
                            </li>
                            <li>
                                Give it a name (e.g. "SocialMRT Bot")
                            </li>
                            <li>
                                Click <strong>"Copy Webhook URL"</strong>
                            </li>
                        </ol>
                        <div className="info-box">
                            <span className="info-icon">💡</span>
                            <p>Webhooks let SocialMRT post messages to your channel. No bot or OAuth needed!</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%', marginTop: '16px' }}>
                            I have my Webhook URL →
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="connect-form">
                        <div className="form-group">
                            <label>Webhook URL *</label>
                            <input
                                type="url"
                                placeholder="https://discord.com/api/webhooks/..."
                                value={webhookUrl}
                                onChange={(e) => { setWebhookUrl(e.target.value); setError('') }}
                                required
                                className="form-input"
                                autoFocus
                            />
                            <small className="form-hint">Paste the webhook URL copied from Discord</small>
                        </div>

                        <div className="form-group">
                            <label>Channel Name (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. #general, #announcements"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                className="form-input"
                            />
                            <small className="form-hint">A friendly name to identify this channel in SocialMRT</small>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                                ← Back
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Connecting...' : '🔗 Connect Discord'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ConnectDiscord
