import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
            } else {
                setError(data.message || 'Something went wrong')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card glass-card">
                        <div className="auth-header">
                            <div className="success-icon">✉️</div>
                            <h1>Check Your Email</h1>
                            <p>If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.</p>
                        </div>

                        <div className="auth-footer">
                            <p>
                                <Link to="/login" className="auth-link">← Back to Login</Link>
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="auth-page-footer">
                    <p>Powered by <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">Vayunex Solution</a> 💜</p>
                </footer>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-icon">🚀</span>
                            <span className="logo-text">Social<span className="text-gradient">MRT</span></span>
                        </Link>
                        <h1>Forgot Password?</h1>
                        <p>No worries, we'll send you reset instructions.</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Remember your password? <Link to="/login" className="auth-link">Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            <footer className="auth-page-footer">
                <p>Powered by <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">Vayunex Solution</a> 💜</p>
            </footer>
        </div>
    )
}

export default ForgotPassword
