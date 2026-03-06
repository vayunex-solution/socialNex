import { useEffect, useState } from 'react'
import './FullScreenLoader.css'

/**
 * FullScreenLoader — Premium full-screen loading overlay
 * 
 * Props:
 *   visible    (bool)    — show/hide the loader
 *   statusText (string)  — "Publishing to Facebook..." etc.
 *   progress   (number)  — 0-100, optional progress bar
 *   activePlatform (string) — which platform icon glows (e.g., 'facebook')
 *   platforms  (array)   — array of platform strings to show icons for
 */

const PLATFORM_DATA = {
    bluesky: { icon: '🦋', label: 'Bluesky', color: '#0085FF' },
    telegram: { icon: '✈️', label: 'Telegram', color: '#0088CC' },
    discord: { icon: '🎮', label: 'Discord', color: '#5865F2' },
    linkedin: { icon: '💼', label: 'LinkedIn', color: '#0077B5' },
    facebook: { icon: '📘', label: 'Facebook', color: '#1877F2' },
    instagram: { icon: '📷', label: 'Instagram', color: '#E4405F' },
    youtube: { icon: '▶️', label: 'YouTube', color: '#FF0000' },
}

const DEFAULT_PLATFORMS = ['bluesky', 'telegram', 'discord', 'linkedin', 'facebook', 'instagram', 'youtube']

export default function FullScreenLoader({
    visible = false,
    statusText = 'Loading...',
    progress = -1,
    activePlatform = null,
    platforms = null
}) {
    const [show, setShow] = useState(false)
    const [animateIn, setAnimateIn] = useState(false)

    useEffect(() => {
        if (visible) {
            setShow(true)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setAnimateIn(true))
            })
        } else {
            setAnimateIn(false)
            const timer = setTimeout(() => setShow(false), 400)
            return () => clearTimeout(timer)
        }
    }, [visible])

    if (!show) return null

    const platformList = platforms || DEFAULT_PLATFORMS

    return (
        <div className={`fsl-overlay ${animateIn ? 'fsl-visible' : ''}`}>
            <div className="fsl-content">
                {/* Platform Icons Row */}
                <div className="fsl-icons-row">
                    {platformList.map(p => {
                        const data = PLATFORM_DATA[p]
                        if (!data) return null
                        const isActive = activePlatform === p
                        return (
                            <div
                                key={p}
                                className={`fsl-icon ${isActive ? 'fsl-icon-active' : ''}`}
                                style={isActive ? { '--glow-color': data.color } : {}}
                                title={data.label}
                            >
                                <span className="fsl-icon-emoji">{data.icon}</span>
                                {isActive && <span className="fsl-icon-ring" />}
                            </div>
                        )
                    })}
                </div>

                {/* Status Text */}
                <p className="fsl-status">{statusText}</p>

                {/* Progress Bar */}
                {progress >= 0 && (
                    <div className="fsl-progress-wrap">
                        <div className="fsl-progress-track">
                            <div
                                className="fsl-progress-bar"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <span className="fsl-progress-text">{Math.round(progress)}%</span>
                    </div>
                )}

                {/* Indeterminate pulse when no progress */}
                {progress < 0 && (
                    <div className="fsl-pulse-dots">
                        <span className="fsl-dot" />
                        <span className="fsl-dot" />
                        <span className="fsl-dot" />
                    </div>
                )}
            </div>
        </div>
    )
}
