import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import { Bell, Mail, Shield, AlertCircle, CheckCircle2, Loader2, Save, Calendar, Globe } from 'lucide-react'
import './Settings.css'

const DEFAULT_SETTINGS = {
    alertEmail: '',
    masterToggle: true,
    emailOnLoginSuccess: false,
    emailOnLoginFail: true,
    emailOnPostFail: true,
    emailOnAccountDisconnect: true,
    emailMarketingReminders: true,
}

export default function Settings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null) // { type: 'success'|'error', text }

    const token = localStorage.getItem('accessToken')

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const res = await fetch(`${API_URL}/settings/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setSettings({
                    alertEmail: data.data.alertEmail || '',
                    masterToggle: data.data.masterToggle,
                    emailOnLoginSuccess: data.data.emailOnLoginSuccess,
                    emailOnLoginFail: data.data.emailOnLoginFail,
                    emailOnPostFail: data.data.emailOnPostFail,
                    emailOnAccountDisconnect: data.data.emailOnAccountDisconnect,
                    emailMarketingReminders: data.data.emailMarketingReminders,
                })
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load settings.' })
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch(`${API_URL}/settings/notifications`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    alertEmail: settings.alertEmail || null,
                    masterToggle: settings.masterToggle,
                    emailOnLoginSuccess: settings.emailOnLoginSuccess,
                    emailOnLoginFail: settings.emailOnLoginFail,
                    emailOnPostFail: settings.emailOnPostFail,
                    emailOnAccountDisconnect: settings.emailOnAccountDisconnect,
                    emailMarketingReminders: settings.emailMarketingReminders,
                }),
            })
            const data = await res.json()
            if (data.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' })
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to save.' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error. Try again.' })
        } finally {
            setSaving(false)
        }
    }

    function toggle(key) {
        setSettings(s => ({ ...s, [key]: !s[key] }))
    }

    if (loading) return (
        <div className="settings-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading settings...</p>
        </div>
    )

    const notifDisabled = !settings.masterToggle

    return (
        <div className="settings-page">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Settings</h1>
                    <p className="dashboard-subtitle">Manage your notification preferences and alerts</p>
                </div>
                <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Flash message */}
            {message && (
                <div className={`settings-msg settings-msg-${message.type}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <div className="settings-grid">

                {/* Alert Email Card */}
                <div className="glass-card settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon icon-blue">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h3>Alert Email</h3>
                            <p>Where should we send alerts? Leave blank to use your registration email.</p>
                        </div>
                    </div>
                    <div className="settings-email-input-wrap">
                        <input
                            type="email"
                            className="settings-email-input"
                            placeholder="e.g. alerts@yourcompany.com (optional)"
                            value={settings.alertEmail}
                            onChange={e => setSettings(s => ({ ...s, alertEmail: e.target.value }))}
                        />
                        <span className="settings-email-hint">
                            💡 Useful if you want alerts on a work email, keeping your personal inbox clean.
                        </span>
                    </div>
                </div>

                {/* Master Toggle Card */}
                <div className="glass-card settings-card settings-card-master">
                    <div className="settings-card-header">
                        <div className="settings-card-icon icon-purple">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3>All Email Notifications</h3>
                            <p>Master switch. Turning this OFF will disable all email alerts at once.</p>
                        </div>
                        <div className="settings-toggle-wrap">
                            <button
                                className={`settings-toggle ${settings.masterToggle ? 'active' : ''}`}
                                onClick={() => toggle('masterToggle')}
                                aria-label="Toggle all notifications"
                            >
                                <span className="settings-toggle-thumb" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification Toggles */}
                <div className="glass-card settings-card">
                    <div className="settings-section-title">
                        <Shield size={16} />
                        Security Alerts
                    </div>
                    <div className={`settings-toggles-list ${notifDisabled ? 'disabled' : ''}`}>
                        <ToggleRow
                            label="Login Attempt Failed"
                            sub="Get alerted when someone tries to log in with wrong credentials."
                            checked={settings.emailOnLoginFail}
                            disabled={notifDisabled}
                            onChange={() => toggle('emailOnLoginFail')}
                            accent="red"
                        />
                        <ToggleRow
                            label="Every Successful Login"
                            sub="High security mode — get a notification on every login."
                            checked={settings.emailOnLoginSuccess}
                            disabled={notifDisabled}
                            onChange={() => toggle('emailOnLoginSuccess')}
                            accent="blue"
                        />
                    </div>
                </div>

                <div className="glass-card settings-card">
                    <div className="settings-section-title">
                        <Globe size={16} />
                        Content Alerts
                    </div>
                    <div className={`settings-toggles-list ${notifDisabled ? 'disabled' : ''}`}>
                        <ToggleRow
                            label="Scheduled Post Failed"
                            sub="Instant alert if a scheduled post couldn't be published."
                            checked={settings.emailOnPostFail}
                            disabled={notifDisabled}
                            onChange={() => toggle('emailOnPostFail')}
                            accent="red"
                        />
                        <ToggleRow
                            label="Social Account Disconnected"
                            sub="Alert when an account token expires or is revoked."
                            checked={settings.emailOnAccountDisconnect}
                            disabled={notifDisabled}
                            onChange={() => toggle('emailOnAccountDisconnect')}
                            accent="yellow"
                        />
                    </div>
                </div>

                <div className="glass-card settings-card">
                    <div className="settings-section-title">
                        <Calendar size={16} />
                        Smart Reminders
                    </div>
                    <div className={`settings-toggles-list ${notifDisabled ? 'disabled' : ''}`}>
                        <ToggleRow
                            label="Holiday Post Reminders (9 AM & 5 PM)"
                            sub="Get reminded 3 days before upcoming holidays to schedule content — only if you haven't already!"
                            checked={settings.emailMarketingReminders}
                            disabled={notifDisabled}
                            onChange={() => toggle('emailMarketingReminders')}
                            accent="green"
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

function ToggleRow({ label, sub, checked, disabled, onChange, accent = 'purple' }) {
    return (
        <div className={`settings-toggle-row ${disabled ? 'is-disabled' : ''}`}>
            <div className="settings-toggle-info">
                <span className="settings-toggle-label">{label}</span>
                <span className="settings-toggle-sub">{sub}</span>
            </div>
            <button
                className={`settings-toggle settings-toggle-${accent} ${checked ? 'active' : ''}`}
                onClick={onChange}
                disabled={disabled}
                aria-label={label}
            >
                <span className="settings-toggle-thumb" />
            </button>
        </div>
    )
}
