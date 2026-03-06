import { useState, useEffect, useRef } from 'react'
import API_URL from '../config/api'
import { Link } from 'react-router-dom'
import { generateCaptionFromText, generateCaptionFromImage, improveCaption } from '../services/aiCaptionService'
import { ImagePlus, X, PenSquare, LayoutDashboard, Send, MessageCircle, Linkedin, Globe, Sparkles, Image, RefreshCw, LogIn, ChevronDown, Check, Clock, CalendarDays, BarChart2, Bell, Rocket, AlertCircle, CheckCircle2, Edit3, ImageIcon, SendHorizontal, BarChart3, Camera, Video, Youtube } from 'lucide-react'
import FullScreenLoader from '../components/FullScreenLoader'
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
    const [discordBotName, setDiscordBotName] = useState('SocialNex')
    const [youtubeTitle, setYoutubeTitle] = useState('')
    const [postType, setPostType] = useState('post') // 'post', 'story', 'reel'
    const fileInputRef = useRef(null)

    // Publish progress state
    const [publishProgress, setPublishProgress] = useState(-1)
    const [publishStatus, setPublishStatus] = useState('Publishing...')
    const [publishActivePlatform, setPublishActivePlatform] = useState(null)

    // AI Caption state
    const [showAiPanel, setShowAiPanel] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')
    const [aiTone, setAiTone] = useState('professional')
    const [aiCaptions, setAiCaptions] = useState([])
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState('')
    const [aiMode, setAiMode] = useState('text') // 'text', 'image', 'improve'

    const PLATFORM_LIMITS = {
        bluesky: 300,
        telegram: 4096,
        discord: 2000,
        linkedin: 3000,
        facebook: 63206,
        instagram: 2200,
        youtube: 5000
    }

    const PLATFORM_ICONS = {
        bluesky: <MessageCircle size={16} />,
        telegram: <Send size={16} />,
        discord: <MessageCircle size={16} />,
        linkedin: <Linkedin size={16} />,
        facebook: <Globe size={16} />,
        instagram: <Camera size={16} />,
        youtube: <Youtube size={16} />
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('accessToken')
            const response = await fetch(`${API_URL}/social/accounts`, {
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

    // Media handling (images + videos)
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files)
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm']
        const allAllowed = [...allowedImageTypes, ...allowedVideoTypes]

        const validFiles = files.filter(f => {
            if (!allAllowed.includes(f.type)) return false
            if (f.type.startsWith('video/') && f.size > 50 * 1024 * 1024) return false
            if (f.type.startsWith('image/') && f.size > 10 * 1024 * 1024) return false
            return true
        })

        if (images.length + validFiles.length > 10) {
            setError('Maximum 10 media files allowed.')
            return
        }

        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
            size: file.size >= 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(1) + ' KB',
            isVideo: file.type.startsWith('video/')
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

    // AI Caption handlers
    const getSelectedPlatform = () => {
        const selected = accounts.filter(a => selectedAccounts.includes(a.id))
        if (selected.length === 1) return selected[0].platform
        return 'general'
    }

    const handleGenerateFromText = async () => {
        if (!aiPrompt.trim()) { setAiError('Enter a topic or idea first.'); return }
        setAiLoading(true)
        setAiError('')
        setAiCaptions([])
        const result = await generateCaptionFromText(aiPrompt, {
            tone: aiTone,
            platform: getSelectedPlatform()
        })
        if (result.success) {
            setAiCaptions(result.captions)
        } else {
            setAiError(result.error || 'Failed to generate captions.')
        }
        setAiLoading(false)
    }

    const handleGenerateFromImage = async () => {
        if (images.length === 0) { setAiError('Upload an image first.'); return }
        setAiLoading(true)
        setAiError('')
        setAiCaptions([])
        const result = await generateCaptionFromImage(images[0].file, {
            tone: aiTone,
            platform: getSelectedPlatform()
        })
        if (result.success) {
            setAiCaptions(result.captions)
        } else {
            setAiError(result.error || 'Failed to analyze image.')
        }
        setAiLoading(false)
    }

    const handleImproveText = async () => {
        if (!postText.trim()) { setAiError('Write some text first to improve.'); return }
        setAiLoading(true)
        setAiError('')
        setAiCaptions([])
        const result = await improveCaption(postText, aiPrompt || 'Make it more engaging')
        if (result.success) {
            setAiCaptions([result.caption])
        } else {
            setAiError(result.error || 'Failed to improve text.')
        }
        setAiLoading(false)
    }

    const handleAiGenerate = () => {
        if (aiMode === 'text') handleGenerateFromText()
        else if (aiMode === 'image') handleGenerateFromImage()
        else handleImproveText()
    }

    const useCaption = (caption) => {
        setPostText(caption)
        setShowAiPanel(false)
        setAiCaptions([])
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
        setPublishProgress(0)
        setPublishStatus('Uploading media...')
        setPublishActivePlatform(null)

        try {
            const token = localStorage.getItem('accessToken')

            // Use FormData for multipart upload
            const formData = new FormData()
            formData.append('text', postText)
            formData.append('accountIds', JSON.stringify(selectedAccounts))

            // Pass Discord bot name if Discord is selected
            const hasDiscord = accounts.some(a => selectedAccounts.includes(a.id) && a.platform === 'discord')
            if (hasDiscord && discordBotName.trim()) {
                formData.append('discordBotName', discordBotName.trim())
            }

            // Pass YouTube title if YouTube is selected
            const hasYouTube = accounts.some(a => selectedAccounts.includes(a.id) && a.platform === 'youtube')
            if (hasYouTube && youtubeTitle.trim()) {
                formData.append('youtubeTitle', youtubeTitle.trim())
            }

            images.forEach(img => {
                formData.append('images', img.file)
            })

            // Pass Instagram post type if Instagram is selected
            const hasInstagram = accounts.some(a => selectedAccounts.includes(a.id) && a.platform === 'instagram')
            if (hasInstagram) {
                formData.append('postType', postType)
            }

            // Get selected platform names for cycling status
            const selectedPlatforms = accounts
                .filter(a => selectedAccounts.includes(a.id))
                .map(a => a.platform)

            // Use XMLHttpRequest for upload progress
            const data = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest()

                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded / e.total) * 50) // 0-50% is upload
                        setPublishProgress(pct)
                        setPublishStatus(pct < 50 ? 'Uploading media...' : 'Processing...')
                    }
                }

                xhr.onload = () => {
                    try {
                        const res = JSON.parse(xhr.responseText)
                        resolve(res)
                    } catch {
                        reject(new Error('Invalid response'))
                    }
                }

                xhr.onerror = () => reject(new Error('Network error'))
                xhr.open('POST', `${API_URL}/social/publish`)
                xhr.setRequestHeader('Authorization', `Bearer ${token}`)
                xhr.send(formData)

                // Cycle through platforms while server processes (50-95%)
                let platformIdx = 0
                const cycleInterval = setInterval(() => {
                    if (xhr.readyState === 4) {
                        clearInterval(cycleInterval)
                        setPublishProgress(100)
                        setPublishStatus('Done!')
                        return
                    }
                    const p = selectedPlatforms[platformIdx % selectedPlatforms.length]
                    setPublishActivePlatform(p)
                    setPublishStatus(`Publishing to ${p.charAt(0).toUpperCase() + p.slice(1)}...`)
                    const fakeProgress = 50 + Math.min((platformIdx + 1) * (45 / selectedPlatforms.length), 45)
                    setPublishProgress(Math.round(fakeProgress))
                    platformIdx++
                }, 1500)
            })

            if (data.success) {
                setResult(data.data.results)
                setPublishProgress(100)
                setPublishStatus('All done! ✅')
                // Clear after delay
                setTimeout(() => {
                    setLoading(false)
                    setPublishProgress(-1)
                    setPublishActivePlatform(null)
                    if (data.data.results.every(r => r.success)) {
                        setTimeout(() => {
                            setPostText('')
                            setImages([])
                            setResult(null)
                        }, 3000)
                    }
                }, 1200)
                return
            } else {
                setError(data.message || 'Publishing failed.')
            }
        } catch (err) {
            setError('Network error. Check if server is running.')
        } finally {
            setLoading(false)
            setPublishProgress(-1)
            setPublishActivePlatform(null)
        }
    }

    return (
        <>
            {/* Full-Screen Publish Loader */}
            <FullScreenLoader
                visible={loading}
                statusText={publishStatus}
                progress={publishProgress}
                activePlatform={publishActivePlatform}
                platforms={accounts.filter(a => selectedAccounts.includes(a.id)).map(a => a.platform)}
            />

            {/* Main Content */}
            < main className="dashboard-main w-full" >
                <header className="dashboard-header">
                    <div>
                        <h1>Create Post</h1>
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
                                            <span className="chip-icon flex-center">{PLATFORM_ICONS[acc.platform] || <SendHorizontal size={16} />}</span>
                                            <span className="chip-name">{acc.name}</span>
                                            {selectedAccounts.includes(acc.id) && <span className="chip-check"><CheckCircle2 size={14} /></span>}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Discord Settings */}
                        {accounts.some(a => selectedAccounts.includes(a.id) && a.platform === 'discord') && (
                            <div className="discord-settings">
                                <div className="discord-settings-header">
                                    <span className="discord-logo"><MessageCircle size={18} /></span>
                                    <span>Discord Settings</span>
                                </div>
                                <div className="discord-settings-body">
                                    <div className="discord-preview-row">
                                        <div className="discord-avatar">
                                            {(discordBotName || 'S').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="discord-name-field">
                                            <label htmlFor="discordBotName">Bot Display Name</label>
                                            <input
                                                id="discordBotName"
                                                type="text"
                                                className="form-input discord-name-input"
                                                value={discordBotName}
                                                onChange={(e) => setDiscordBotName(e.target.value)}
                                                placeholder="Enter bot name..."
                                                maxLength={80}
                                            />
                                        </div>
                                    </div>
                                    <p className="discord-hint">This is how your posts will appear in Discord channels</p>
                                </div>
                            </div>
                        )}

                        {/* Instagram Settings */}
                        {accounts.some(a => selectedAccounts.includes(a.id) && a.platform === 'instagram') && (
                            <div className="discord-settings">
                                <div className="discord-settings-header">
                                    <span className="discord-logo"><Camera size={18} /></span>
                                    <span>Instagram Post Type</span>
                                </div>
                                <div className="discord-settings-body">
                                    <div className="platform-chips" style={{ marginBottom: '8px' }}>
                                        <button
                                            className={`platform-chip ${postType === 'post' ? 'selected' : ''}`}
                                            onClick={() => setPostType('post')}
                                            type="button"
                                        >
                                            <span className="chip-icon flex-center"><ImagePlus size={14} /></span>
                                            <span className="chip-name">Photo Post</span>
                                            {postType === 'post' && <span className="chip-check"><CheckCircle2 size={14} /></span>}
                                        </button>
                                        <button
                                            className={`platform-chip ${postType === 'story' ? 'selected' : ''}`}
                                            onClick={() => setPostType('story')}
                                            type="button"
                                        >
                                            <span className="chip-icon flex-center"><Camera size={14} /></span>
                                            <span className="chip-name">Story</span>
                                            {postType === 'story' && <span className="chip-check"><CheckCircle2 size={14} /></span>}
                                        </button>
                                        <button
                                            className={`platform-chip ${postType === 'reel' ? 'selected' : ''}`}
                                            onClick={() => setPostType('reel')}
                                            type="button"
                                        >
                                            <span className="chip-icon flex-center"><Video size={14} /></span>
                                            <span className="chip-name">Reel</span>
                                            {postType === 'reel' && <span className="chip-check"><CheckCircle2 size={14} /></span>}
                                        </button>
                                    </div>
                                    <p className="discord-hint">
                                        {postType === 'post' && '📸 Upload one or more images with a caption'}
                                        {postType === 'story' && '📱 Upload one image or video (disappears after 24hrs)'}
                                        {postType === 'reel' && '🎬 Upload a video (9:16 recommended, max 15 min)'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* YouTube Settings */}
                        {accounts.some(a => selectedAccounts.includes(a.id) && a.platform === 'youtube') && (
                            <div className="discord-settings">
                                <div className="discord-settings-header">
                                    <span className="discord-logo"><Youtube size={18} /></span>
                                    <span>YouTube Settings</span>
                                </div>
                                <div className="discord-settings-body">
                                    <div className="discord-preview-row">
                                        <div className="discord-name-field" style={{ width: '100%' }}>
                                            <label htmlFor="youtubeTitle">Video Title</label>
                                            <input
                                                id="youtubeTitle"
                                                type="text"
                                                className="form-input discord-name-input"
                                                value={youtubeTitle}
                                                onChange={(e) => setYoutubeTitle(e.target.value)}
                                                placeholder="Enter video title..."
                                                maxLength={100}
                                            />
                                        </div>
                                    </div>
                                    <p className="discord-hint">YouTube requires a title and a video file. Your post text will be used as the video description.</p>
                                </div>
                            </div>
                        )}

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
                                            {img.isVideo ? (
                                                <video src={img.preview} muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            ) : (
                                                <img src={img.preview} alt={img.name} />
                                            )}
                                            <button
                                                className="remove-image-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                            <span className="image-size">{img.isVideo ? '🎬 ' : ''}{img.size}</span>
                                        </div>
                                    ))}
                                    {images.length < 10 && (
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
                                    <span className="upload-icon flex-center" style={{ marginBottom: '10px' }}><ImagePlus size={32} /></span>
                                    <p>Drag & drop media here or <strong>click to browse</strong></p>
                                    <small>Images: JPEG, PNG, GIF, WebP (10MB) • Videos: MP4, MOV, WebM (50MB) • Up to 10 files</small>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* AI Caption Generator */}
                        <div className="ai-section">
                            <button
                                className={`ai-toggle-btn ${showAiPanel ? 'active' : ''}`}
                                onClick={() => { setShowAiPanel(!showAiPanel); setAiError(''); }}
                                type="button"
                            >
                                <span className="ai-sparkle"><Sparkles size={16} /></span>
                                <span>AI Caption Generator</span>
                                <span className="ai-badge">Gemini</span>
                            </button>

                            {showAiPanel && (
                                <div className="ai-panel">
                                    {/* Mode Tabs */}
                                    <div className="ai-mode-tabs">
                                        <button
                                            className={`ai-mode-tab flex-center gap-2 ${aiMode === 'text' ? 'active' : ''}`}
                                            onClick={() => setAiMode('text')}
                                        >
                                            <Edit3 size={16} /> From Text
                                        </button>
                                        <button
                                            className={`ai-mode-tab flex-center gap-2 ${aiMode === 'image' ? 'active' : ''}`}
                                            onClick={() => setAiMode('image')}
                                            disabled={images.length === 0}
                                        >
                                            <ImageIcon size={16} /> From Image
                                        </button>
                                        <button
                                            className={`ai-mode-tab flex-center gap-2 ${aiMode === 'improve' ? 'active' : ''}`}
                                            onClick={() => setAiMode('improve')}
                                            disabled={!postText.trim()}
                                        >
                                            <RefreshCw size={16} /> Improve Text
                                        </button>
                                    </div>

                                    {/* Prompt Input */}
                                    {aiMode === 'text' && (
                                        <input
                                            type="text"
                                            className="form-input ai-prompt-input"
                                            placeholder="e.g. New product launch for tech startup..."
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                                        />
                                    )}

                                    {aiMode === 'image' && (
                                        <div className="ai-image-info flex-center gap-2">
                                            <ImageIcon size={16} />
                                            <span>Will analyze: <strong>{images[0]?.name}</strong></span>
                                        </div>
                                    )}

                                    {aiMode === 'improve' && (
                                        <input
                                            type="text"
                                            className="form-input ai-prompt-input"
                                            placeholder="How to improve? e.g. Make it funnier, Add urgency..."
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                                        />
                                    )}

                                    {/* Tone Selector */}
                                    <div className="ai-controls">
                                        <div className="ai-tone-selector">
                                            <label>Tone:</label>
                                            <select
                                                value={aiTone}
                                                onChange={(e) => setAiTone(e.target.value)}
                                                className="ai-tone-select"
                                            >
                                                <option value="professional">💼 Professional</option>
                                                <option value="casual">😎 Casual</option>
                                                <option value="funny">😂 Funny</option>
                                                <option value="inspirational">🌟 Inspirational</option>
                                                <option value="urgent">🔥 Urgent/FOMO</option>
                                                <option value="storytelling">📖 Storytelling</option>
                                            </select>
                                        </div>
                                        <button
                                            className="btn btn-ai flex-center gap-2"
                                            onClick={handleAiGenerate}
                                            disabled={aiLoading}
                                        >
                                            {aiLoading ? (
                                                <><span className="ai-spinner"></span> Generating...</>
                                            ) : (
                                                <><Sparkles size={16} /> Generate</>
                                            )}
                                        </button>
                                    </div>

                                    {/* AI Error */}
                                    {aiError && <div className="alert alert-error" style={{ marginTop: '12px' }}>{aiError}</div>}

                                    {/* Generated Captions */}
                                    {aiCaptions.length > 0 && (
                                        <div className="ai-results">
                                            <p className="ai-results-label">Click to use:</p>
                                            {aiCaptions.map((caption, i) => (
                                                <div
                                                    key={i}
                                                    className="ai-caption-card"
                                                    onClick={() => useCaption(caption)}
                                                >
                                                    <span className="ai-caption-num">{i + 1}</span>
                                                    <p className="ai-caption-text">{caption}</p>
                                                    <span className="ai-use-btn">Use →</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && <div className="alert alert-error">{error}</div>}

                        {/* Results */}
                        {result && (
                            <div className="post-results">
                                {result.map((r, i) => (
                                    <div key={i} className={`result-item ${r.success ? 'success' : 'failed'}`}>
                                        <span className="flex-center">{PLATFORM_ICONS[r.platform]}</span>
                                        <span className="result-name">{r.name}</span>
                                        <span className={`result-status flex-center gap-1 ${r.success ? 'text-success' : 'text-error'}`}>
                                            {r.success ? <><CheckCircle2 size={16} /> Published!</> : <><AlertCircle size={16} /> {r.error || 'Failed'}</>}
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
                                    <><Rocket size={20} style={{ marginRight: '8px' }} /> Publish {images.length > 0 ? `(${images.length} media file${images.length > 1 ? 's' : ''})` : 'Now'}</>
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
                                <span><Edit3 size={14} style={{ marginRight: '4px', display: 'inline' }} /> {postText.length} chars</span>
                                <span><ImageIcon size={14} style={{ marginRight: '4px', display: 'inline' }} /> {images.length} image{images.length !== 1 ? 's' : ''}</span>
                                <span><SendHorizontal size={14} style={{ marginRight: '4px', display: 'inline' }} /> {selectedAccounts.length} platform{selectedAccounts.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="tips-card glass-card">
                            <h3 className="flex-center gap-2"><Sparkles size={18} /> Tips</h3>
                            <ul className="tips-list">
                                <li><MessageCircle size={14} /> <strong>Bluesky:</strong> 300 chars, 4 images (1MB each)</li>
                                <li><Send size={14} /> <strong>Telegram:</strong> 4096 chars, HTML formatting</li>
                                <li><ImageIcon size={14} /> Images auto-sent as photo posts on Telegram</li>
                                <li>Use <code>&lt;b&gt;bold&lt;/b&gt;</code> for Telegram</li>
                                <li><BarChart3 size={14} /> Best time: 9-11 AM or 7-9 PM</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main >
        </>
    )
}

export default CreatePost
