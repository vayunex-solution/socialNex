import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './CreatePost.css'

function CreatePost() {
    const [accounts, setAccounts] = useState([])
    const [selectedAccounts, setSelectedAccounts] = useState([])
    const [postText, setPostText] = useState('')
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingAccounts, setLoadingAccounts] = useState(true)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    const PLATFORM_LIMITS = {
        bluesky: 300,
        telegram: 4096,
        mastodon: 500
    }

    const PLATFORM_ICONS = {
        bluesky: '🦋',
        telegram: '📱',
        mastodon: '🐘',
        discord: '💬'
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch('http://localhost:5000/api/v1/social/accounts', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
                setAccounts(data.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch accounts:', err)
        } finally {
            setLoadingAccounts(false)
        }
    }

    const toggleAccount = (accId) => {
        setSelectedAccounts(prev =>
            prev.includes(accId)
                ? prev.filter(id => id !== accId)
                : [...prev, accId]
        )
        setError('')
        setResult(null)
    }

    const getCharLimit = () => {
        const selected = accounts.filter(a => selectedAccounts.includes(a.id))
        if (selected.length === 0) return 4096
        return Math.min(...selected.map(a => PLATFORM_LIMITS[a.platform] || 4096))
    }

    const charLimit = getCharLimit()
    const charsLeft = charLimit - postText.length
    const isOverLimit = charsLeft < 0

    // Image handling
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter(f => {
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(f.type)) return false
            if (f.size > 5 * 1024 * 1024) return false
            return true
        })

        if (images.length + validFiles.length > 4) {
            setError('Maximum 4 images allowed.')
            return
        }

        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
        }))

        setImages(prev => [...prev, ...newImages])
        setError('')
        e.target.value = '' // Reset file input
    }

    const removeImage = (index) => {
        setImages(prev => {
            const updated = [...prev]
            URL.revokeObjectURL(updated[index].preview)
            updated.splice(index, 1)
            return updated
        })
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.currentTarget.classList.add('drag-over')
    }

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over')
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove('drag-over')
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
        if (files.length > 0) {
            const event = { target: { files }, preventDefault: () => { } }
            handleImageSelect(event)
        }
    }

    const handlePost = async () => {
        if (!postText.trim()) {
            setError('Post text cannot be empty.')
            return
        }
        if (selectedAccounts.length === 0) {
            setError('Please select at least one platform.')
            return
        }
        if (isOverLimit) {
            setError(`Post exceeds character limit by ${Math.abs(charsLeft)} characters.`)
            return
        }

        setLoading(true)
        setError('')
        setResult(null)

        try {
            const token = localStorage.getItem('accessToken')

            // Use FormData for multipart upload
            const formData = new FormData()
            formData.append('text', postText)
            formData.append('accountIds', JSON.stringify(selectedAccounts))

            images.forEach(img => {
                formData.append('images', img.file)
            })

            const response = await fetch('http://localhost:5000/api/v1/social/publish', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                setResult(data.data.results)
                // Clear on full success
                if (data.data.results.every(r => r.success)) {
                    setTimeout(() => {
                        setPostText('')
                        setImages([])
                        setResult(null)
                    }, 3000)
                }
            } else {
                setError(data.message || 'Publishing failed.')
            }
        } catch (err) {
            setError('Network error. Check if server is running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard-page">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Link to="/">
                        <span className="logo-icon">🚀</span>
                        <span className="logo-text">Social<span className="text-gradient">MRT</span></span>
                    </Link>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/create-post" className="nav-item active">
                        <span className="nav-icon">✍️</span>
                        <span>Create Post</span>
                    </Link>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">📅</span>
                        <span>Calendar</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">📱</span>
                        <span>Accounts</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">📈</span>
                        <span>Analytics</span>
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">⚙️</span>
                        <span>Settings</span>
                    </a>
                </nav>
                <div className="sidebar-footer">
                    <button className="btn btn-secondary btn-sm" onClick={() => {
                        localStorage.clear()
                        window.location.href = '/'
                    }}>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <h1>Create Post ✍️</h1>
                        <p>Compose and publish to your connected platforms</p>
                    </div>
                </header>

                <div className="create-post-layout">
                    {/* Composer */}
                    <div className="composer-section glass-card">
                        <h3>What's on your mind?</h3>

                        {/* Platform selector */}
                        <div className="platform-selector">
                            <label>Post to:</label>
                            <div className="platform-chips">
                                {loadingAccounts ? (
                                    <span className="loading-text">Loading accounts...</span>
                                ) : accounts.length === 0 ? (
                                    <Link to="/dashboard" className="no-accounts-link">
                                        No accounts connected. Connect one →
                                    </Link>
                                ) : (
                                    accounts.map(acc => (
                                        <button
                                            key={acc.id}
                                            className={`platform-chip ${selectedAccounts.includes(acc.id) ? 'selected' : ''}`}
                                            onClick={() => toggleAccount(acc.id)}
                                        >
                                            <span className="chip-icon">{PLATFORM_ICONS[acc.platform] || '📱'}</span>
                                            <span className="chip-name">{acc.name}</span>
                                            {selectedAccounts.includes(acc.id) && <span className="chip-check">✓</span>}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Text area */}
                        <div className="composer-textarea-wrapper">
                            <textarea
                                className="composer-textarea"
                                placeholder="Write your post here... Supports HTML for Telegram (bold, italic, links)"
                                value={postText}
                                onChange={(e) => {
                                    setPostText(e.target.value)
                                    setError('')
                                    setResult(null)
                                }}
                                rows={8}
                            />
                            <div className={`char-counter ${isOverLimit ? 'over-limit' : charsLeft < 50 ? 'warning' : ''}`}>
                                {charsLeft} / {charLimit}
                            </div>
                        </div>

                        {/* Image Upload Area */}
                        <div
                            className="image-upload-area"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {images.length > 0 ? (
                                <div className="image-previews">
                                    {images.map((img, index) => (
                                        <div key={index} className="image-preview-item">
                                            <img src={img.preview} alt={img.name} />
                                            <button
                                                className="remove-image-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                            <span className="image-size">{img.size}</span>
                                        </div>
                                    ))}
                                    {images.length < 4 && (
                                        <button
                                            className="add-more-images"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <span>+</span>
                                            <small>Add More</small>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="upload-placeholder"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="upload-icon">🖼️</span>
                                    <p>Drag & drop images here or <strong>click to browse</strong></p>
                                    <small>JPEG, PNG, GIF, WebP • Max 5MB • Up to 4 images</small>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Error */}
                        {error && <div className="alert alert-error">{error}</div>}

                        {/* Results */}
                        {result && (
                            <div className="post-results">
                                {result.map((r, i) => (
                                    <div key={i} className={`result-item ${r.success ? 'success' : 'failed'}`}>
                                        <span>{PLATFORM_ICONS[r.platform]}</span>
                                        <span className="result-name">{r.name}</span>
                                        <span className={`result-status ${r.success ? 'text-success' : 'text-error'}`}>
                                            {r.success ? '✅ Published!' : `❌ ${r.error || 'Failed'}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="composer-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handlePost}
                                disabled={loading || !postText.trim() || selectedAccounts.length === 0}
                            >
                                {loading ? (
                                    <span className="loading-spinner"></span>
                                ) : (
                                    <>🚀 Publish {images.length > 0 ? `(${images.length} image${images.length > 1 ? 's' : ''})` : 'Now'}</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="preview-section">
                        <div className="preview-card glass-card">
                            <h3>📋 Preview</h3>
                            <div className="preview-content">
                                {postText ? (
                                    <div className="preview-text" dangerouslySetInnerHTML={{
                                        __html: postText
                                            .replace(/\n/g, '<br/>')
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    }} />
                                ) : (
                                    <p className="preview-placeholder">Your post preview will appear here...</p>
                                )}
                                {images.length > 0 && (
                                    <div className="preview-images">
                                        {images.map((img, i) => (
                                            <img key={i} src={img.preview} alt="" className="preview-thumb" />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="preview-meta">
                                <span>📏 {postText.length} chars</span>
                                <span>🖼️ {images.length} image{images.length !== 1 ? 's' : ''}</span>
                                <span>📱 {selectedAccounts.length} platform{selectedAccounts.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="tips-card glass-card">
                            <h3>💡 Tips</h3>
                            <ul className="tips-list">
                                <li>🦋 <strong>Bluesky:</strong> 300 chars, 4 images (1MB each)</li>
                                <li>📱 <strong>Telegram:</strong> 4096 chars, HTML formatting</li>
                                <li>🖼️ Images auto-sent as photo posts on Telegram</li>
                                <li>Use <code>&lt;b&gt;bold&lt;/b&gt;</code> for Telegram</li>
                                <li>📊 Best time: 9-11 AM or 7-9 PM</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CreatePost
