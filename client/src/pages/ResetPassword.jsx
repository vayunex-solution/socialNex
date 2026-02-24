import { useState, useEffect } from 'react'
import API_URL from '../config/api'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import logoImg from '../assets/logo.png'
import './Auth.css'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new one.')
        }
    }, [token])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: formData.password
                })
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                // Redirect to login after 3 seconds
                setTimeout(() => navigate('/login'), 3000)
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
                            <div className="success-animation">
                                <div className="success-checkmark">✓</div>
                            </div>
                            <h1>Password Reset!</h1>
                            <p>Your password has been successfully reset. Redirecting to login...</p>
                        </div>

                        <div className="auth-footer">
                            <Link to="/login" className="btn btn-primary btn-block">Go to Login</Link>
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
                            <img src={logoImg} alt="SocialNex" style={{ height: '36px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
                        </Link>
                        <h1>Reset Password</h1>
                        <p>Enter your new password below.</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <span className="form-hint">Must be at least 8 characters</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading || !token}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

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

export default ResetPassword
