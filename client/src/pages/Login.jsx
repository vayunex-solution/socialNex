import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import logoIcon from '../assets/logo-icon.png'
import './Auth.css'

import API_URL from '../config/api'

function Login() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await axios.post(`${API_URL}/auth/login`, formData)
            const { accessToken, refreshToken, user } = response.data.data

            // Store tokens
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))

            // Redirect based on verification status
            if (!user.isVerified) {
                navigate('/verify-email')
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass-card">
                    {/* Logo */}
                    <div className="auth-logo">
                        <Link to="/">
                            <img src={logoIcon} alt="SocialNex" style={{ width: '36px', height: '36px', objectFit: 'contain', mixBlendMode: 'lighten' }} />
                            <span className="logo-text"><span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Social</span><span style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nex</span></span>
                        </Link>
                    </div>

                    <h1 className="auth-title">Welcome Back! 👋</h1>
                    <p className="auth-subtitle">Sign in to continue managing your social media</p>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
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
                            />
                        </div>

                        <div className="form-footer">
                            <label className="checkbox-label">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="link-primary">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                            {loading ? (
                                <span className="loading-spinner">⏳</span>
                            ) : (
                                <>Sign In <span>→</span></>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/register" className="link-primary">Create one free</Link>
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="auth-decoration">
                    <div className="floating-element el-1">📱</div>
                    <div className="floating-element el-2">📊</div>
                    <div className="floating-element el-3">🚀</div>
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

export default Login
