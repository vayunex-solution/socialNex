import { useState } from 'react'
import { MessageCircle, X, Mail, ExternalLink } from 'lucide-react'

const styles = {
    wrapper: {
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
        fontFamily: "'Inter', sans-serif",
    },
    fab: {
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'all 0.3s ease',
        color: '#fff',
    },
    panel: {
        position: 'absolute', bottom: '70px', right: '0', width: '320px',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
        animation: 'fadeInUp 0.3s ease',
    },
    header: {
        padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    headerTitle: {
        margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff',
    },
    headerSub: {
        margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px',
    },
    closeBtn: {
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer', padding: '4px', borderRadius: '6px',
    },
    body: { padding: '16px' },
    card: {
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: '12px', marginBottom: '10px', cursor: 'pointer',
        textDecoration: 'none', color: '#fff', transition: 'all 0.2s',
    },
    iconBox: {
        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    cardLabel: { fontSize: '14px', fontWeight: 600, margin: 0 },
    cardDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' },
    footer: {
        padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.35)',
    },
}

function FloatingSupport() {
    const [open, setOpen] = useState(false)

    return (
        <div style={styles.wrapper}>
            {/* Panel */}
            {open && (
                <div style={styles.panel}>
                    <div style={styles.header}>
                        <div>
                            <p style={styles.headerTitle}>💬 Need Help?</p>
                            <p style={styles.headerSub}>We're here to assist you</p>
                        </div>
                        <button style={styles.closeBtn} onClick={() => setOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div style={styles.body}>
                        <a href="mailto:support@vayunexsolution.com" style={styles.card}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)' }}
                        >
                            <div style={styles.iconBox}><Mail size={18} color="#fff" /></div>
                            <div>
                                <p style={styles.cardLabel}>Email Support</p>
                                <p style={styles.cardDesc}>support@vayunexsolution.com</p>
                            </div>
                        </a>
                        <a href="https://www.vayunexsolution.com" target="_blank" rel="noopener noreferrer" style={styles.card}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)' }}
                        >
                            <div style={{ ...styles.iconBox, background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}><ExternalLink size={18} color="#fff" /></div>
                            <div>
                                <p style={styles.cardLabel}>VayuNex Solution</p>
                                <p style={styles.cardDesc}>Visit our website</p>
                            </div>
                        </a>
                    </div>
                    <div style={styles.footer}>
                        Powered by <strong>VayuNex Solution</strong> 💜
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <button
                style={styles.fab}
                onClick={() => setOpen(!open)}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Need help?"
            >
                {open ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default FloatingSupport
