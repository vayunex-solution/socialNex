import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Auth.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

function VerifyEmail() {
    const navigate = useNavigate()
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [verified, setVerified] = useState(false)
    const inputRefs = useRef([])

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        // Focus first input on load
        inputRefs.current[0]?.focus()

        // Cooldown timer
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCooldown])

    const handleChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)
        setError('')

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        if (!/^\d+$/.test(pastedData)) return

        const newOtp = pastedData.split('')
        while (newOtp.length < 6) newOtp.push('')
        setOtp(newOtp)
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const code = otp.join('')

        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code')
            return
        }

        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('accessToken')
            await axios.post(`${API_URL}/auth/verify-email`, { otp: code }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Update stored user
            const updatedUser = { ...user, isVerified: true }
            localStorage.setItem('user', JSON.stringify(updatedUser))

            setVerified(true)

            // Redirect to dashboard after animation
            setTimeout(() => {
                navigate('/dashboard')
            }, 2500)

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code. Please try again.')
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (resendCooldown > 0) return

        setResending(true)
        setError('')

        try {
            const token = localStorage.getItem('accessToken')
            await axios.post(`${API_URL}/auth/resend-verification`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setResendCooldown(120) // 2 minutes cooldown
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend. Please try again.')
        } finally {
            setResending(false)
        }
    }

    if (verified) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card glass-card success-card">
                        <div className="success-animation">
                            <div className="checkmark">✓</div>
                        </div>
                        <h1 className="auth-title">Email Verified! 🎉</h1>
                        <p className="auth-subtitle">Welcome to SocialMRT! Your account is now active.</p>
                        <div className="loading-bar"></div>
                        <p className="redirect-text">Redirecting to dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card glass-card verify-card">
                    {/* Logo */}
                    <div className="auth-logo">
                        <Link to="/">
                            <span className="logo-icon">🚀</span>
                            <span className="logo-text">Social<span className="text-gradient">MRT</span></span>
                        </Link>
                    </div>

                    <div className="verify-icon">📧</div>
                    <h1 className="auth-title">Verify Your Email</h1>
                    <p className="auth-subtitle">
                        We sent a 6-digit code to<br />
                        <strong>{user.email || 'your email'}</strong>
                    </p>

                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    ref={(el) => inputRefs.current[index] = el}
                                    className="otp-input"
                                    disabled={loading}
                                />
                            ))}
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading || otp.join('').length !== 6}>
                            {loading ? (
                                <span className="loading-spinner">⏳</span>
                            ) : (
                                <>Verify Email ✓</>
                            )}
                        </button>
                    </form>

                    <div className="resend-section">
                        <p>Didn't receive the code?</p>
                        <button
                            className="btn-link"
                            onClick={handleResend}
                            disabled={resending || resendCooldown > 0}
                        >
                            {resending ? 'Sending...' :
                                resendCooldown > 0 ? `Resend in ${resendCooldown}s` :
                                    'Resend Code'}
                        </button>
                    </div>

                    <p className="auth-switch">
                        Wrong email? <Link to="/register" className="link-primary">Change it</Link>
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="auth-decoration">
                    <div className="floating-element el-1">✉️</div>
                    <div className="floating-element el-2">🔐</div>
                    <div className="floating-element el-3">✨</div>
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

export default VerifyEmail
