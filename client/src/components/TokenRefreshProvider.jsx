/**
 * TokenRefreshProvider
 * 
 * Wraps the entire app. Intercepts 401 responses globally:
 *   1. Tries to auto-refresh using stored refresh token via /auth/refresh
 *   2. If refresh succeeds → updates accessToken, retries the original request
 *   3. If refresh fails → shows "Session Expired" popup, clears auth, redirects to login
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import API_URL from '../config/api'

const TokenContext = createContext()

// Axios-style interceptor for fetch
const originalFetch = window.fetch

function TokenRefreshProvider({ children }) {
    const [showExpiredPopup, setShowExpiredPopup] = useState(false)
    const isRefreshing = useRef(false)
    const refreshPromise = useRef(null)

    const tryRefresh = useCallback(async () => {
        // Prevent multiple simultaneous refresh calls
        if (isRefreshing.current) return refreshPromise.current

        isRefreshing.current = true
        refreshPromise.current = (async () => {
            try {
                const refreshToken = localStorage.getItem('refreshToken')
                if (!refreshToken) throw new Error('No refresh token')

                const res = await originalFetch(`${API_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                })

                if (!res.ok) throw new Error('Refresh failed')

                const data = await res.json()
                if (data.success && data.data?.accessToken) {
                    localStorage.setItem('accessToken', data.data.accessToken)
                    return data.data.accessToken
                }
                throw new Error('Invalid refresh response')
            } catch (err) {
                // Refresh failed — session is dead
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                setShowExpiredPopup(true)
                return null
            } finally {
                isRefreshing.current = false
                refreshPromise.current = null
            }
        })()

        return refreshPromise.current
    }, [])

    // Patch global fetch to intercept 401s
    useEffect(() => {
        window.fetch = async (...args) => {
            let response = await originalFetch(...args)

            // If 401 and it's NOT the refresh endpoint itself
            if (response.status === 401) {
                const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
                if (!url.includes('/auth/refresh') && !url.includes('/auth/login')) {
                    const newToken = await tryRefresh()
                    if (newToken) {
                        // Retry with new token
                        const [input, init = {}] = args
                        const newInit = {
                            ...init,
                            headers: {
                                ...init.headers,
                                'Authorization': `Bearer ${newToken}`
                            }
                        }
                        response = await originalFetch(input, newInit)
                    }
                }
            }
            return response
        }

        return () => { window.fetch = originalFetch }
    }, [tryRefresh])

    const handleExpiredClose = () => {
        setShowExpiredPopup(false)
        window.location.href = '/login'
    }

    return (
        <TokenContext.Provider value={{ tryRefresh }}>
            {children}

            {/* Session Expired Popup */}
            {showExpiredPopup && (
                <div className="session-expired-overlay" onClick={handleExpiredClose}>
                    <div className="session-expired-popup" onClick={e => e.stopPropagation()}>
                        <div className="sep-icon">🔒</div>
                        <h3>Session Expired</h3>
                        <p>Your session has expired. Please log in again to continue using SocialNex.</p>
                        <button className="btn btn-primary sep-btn" onClick={handleExpiredClose}>
                            Log In Again
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .session-expired-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: sepFadeIn 0.3s ease;
                }
                @keyframes sepFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .session-expired-popup {
                    background: linear-gradient(135deg, rgba(30,30,50,0.98), rgba(20,20,40,0.98));
                    border: 1px solid rgba(139,92,246,0.3);
                    border-radius: 20px;
                    padding: 2.5rem 2rem;
                    text-align: center;
                    max-width: 380px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15);
                    animation: sepSlideUp 0.4s ease;
                }
                @keyframes sepSlideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .sep-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .session-expired-popup h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 0.75rem;
                }
                .session-expired-popup p {
                    color: rgba(255,255,255,0.6);
                    font-size: 0.9rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }
                .sep-btn {
                    width: 100%;
                    padding: 14px;
                    font-size: 1rem;
                    font-weight: 600;
                    border-radius: 12px;
                }
            `}</style>
        </TokenContext.Provider>
    )
}

export default TokenRefreshProvider
export const useTokenRefresh = () => useContext(TokenContext)
