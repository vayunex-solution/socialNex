import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import logoImg from '../assets/logo.png'
import './Auth.css'

import API_URL from '../config/api'

function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            })

            const { accessToken, refreshToken, user } = response.data.data

            // Store tokens
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            // Show success message
            setShowSuccess(true)

            // Redirect to verify email after 2 seconds
            setTimeout(() => {
                navigate('/verify-email')
            }, 2000)

        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (showSuccess) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card glass-card success-card">
                        <div className="success-icon">🎉</div>
                        <h1 className="auth-title">Account Created!</h1>
                        <p className="auth-subtitle">
                            We've sent a verification code to <strong>{formData.email}</strong>
                        </p>
                        <div className="loading-bar"></div>
                        <p className="redirect-text">Redirecting to verification...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass-card">
                    {/* Logo */}
                    <div className="auth-logo">
                        <Link to="/">
                            <img src={logoImg} alt="SocialNex" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                            <span className="logo-text">Social<span className="text-gradient">Nex</span></span>
                        </Link>
                    </div>

                    <h1 className="auth-title">Create Account 🚀</h1>
                    <p className="auth-subtitle">Join thousands of creators managing their social presence</p>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-footer">
                            <label className="checkbox-label">
                                <input type="checkbox" required />
                                <span>I agree to the <a href="#">Terms</a> & <a href="#">Privacy Policy</a></span>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                            {loading ? (
                                <span className="loading-spinner">⏳</span>
                            ) : (
                                <>Create Account ✨</>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login" className="link-primary">Sign in</Link>
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="auth-decoration">
                    <div className="floating-element el-1">✨</div>
                    <div className="floating-element el-2">📈</div>
                    <div className="floating-element el-3">💜</div>
                </div>
            </div>

            {/* Footer */}
            <div className="auth-footer">
                <p>
                    Powered by <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer">Vayunex Solution</a> 💜
                </p>
            </div>
        </div>
    )
}

export default Register
