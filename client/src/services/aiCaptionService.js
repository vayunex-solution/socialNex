/**
 * AI Caption Service
 * Uses Google Gemini to generate social media captions
 * Supports text prompts and image analysis
 * Includes retry logic and fallback models for rate limits
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(API_KEY)

// Models in priority order - if one hits quota, try next
const MODEL_PRIORITY = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
]

/**
 * Smart generate with retry + fallback models
 */
async function generateWithRetry(contents, maxRetries = 2) {
    let lastError = null

    for (const modelName of MODEL_PRIORITY) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                const result = await model.generateContent(contents)
                return result.response.text().trim()
            } catch (error) {
                lastError = error
                const msg = error.message || ''

                // Rate limit / quota error - try next model or retry
                if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
                    // Extract retry delay if available
                    const delayMatch = msg.match(/retry in (\d+)/i)
                    const delay = delayMatch ? Math.min(parseInt(delayMatch[1]), 30) : 5

                    if (attempt < maxRetries) {
                        console.warn(`Rate limited on ${modelName}, retrying in ${delay}s (attempt ${attempt + 1})...`)
                        await sleep(delay * 1000)
                        continue
                    }
                    // Move to next model
                    console.warn(`Quota exhausted for ${modelName}, trying next model...`)
                    break
                }

                // Other errors - don't retry
                throw error
            }
        }
    }

    // All models failed
    throw new Error(formatQuotaError(lastError))
}

function formatQuotaError(error) {
    const msg = error?.message || ''
    if (msg.includes('429') || msg.includes('quota')) {
        return '⏳ API quota exceeded. Please wait a minute and try again, or upgrade your Gemini API plan at ai.google.dev'
    }
    if (msg.includes('API_KEY')) {
        return '🔑 Invalid API key. Please check your VITE_GEMINI_API_KEY in .env'
    }
    return msg
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function parseJsonResponse(text) {
    let cleaned = text
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```(?:json)?\n?/g, '').trim()
    }
    return JSON.parse(cleaned)
}

/**
 * Generate captions from a text prompt
 */
export async function generateCaptionFromText(prompt, options = {}) {
    const { tone = 'professional', platform = 'general', count = 3 } = options

    const systemPrompt = `You are a social media expert copywriter. Generate ${count} unique, engaging social media captions.

RULES:
- Each caption should be different in style and approach
- Use relevant emojis naturally
- Include 2-3 relevant hashtags at the end
- Keep captions concise but impactful
- Match the tone: ${tone}
- Optimize for: ${platform === 'general' ? 'all platforms' : platform}
${platform === 'bluesky' ? '- Keep under 300 characters' : ''}
${platform === 'telegram' ? '- Can be longer, up to 4096 chars. Use HTML formatting like <b>bold</b>' : ''}
${platform === 'discord' ? '- Keep under 2000 characters. Use **bold** markdown' : ''}

FORMAT: Return ONLY a JSON array of strings. No markdown, no code blocks, just the raw JSON array.
Example: ["Caption 1 🚀 #tag1 #tag2", "Caption 2 ✨ #tag1 #tag3", "Caption 3 🔥 #tag2 #tag4"]`

    try {
        const text = await generateWithRetry([
            systemPrompt,
            `Generate captions for this topic/idea: ${prompt}`
        ])
        const captions = parseJsonResponse(text)
        return { success: true, captions }
    } catch (error) {
        console.error('AI caption error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Generate captions from an image
 */
export async function generateCaptionFromImage(imageFile, options = {}) {
    const { tone = 'professional', platform = 'general', count = 3 } = options

    const systemPrompt = `You are a social media expert copywriter. Analyze this image and generate ${count} unique, engaging social media captions for it.

RULES:
- Describe what you see creatively, don't just list objects
- Each caption should take a different creative angle
- Use relevant emojis naturally
- Include 2-3 relevant hashtags at the end
- Match the tone: ${tone}
- Optimize for: ${platform === 'general' ? 'all platforms' : platform}
${platform === 'bluesky' ? '- Keep under 300 characters' : ''}
${platform === 'telegram' ? '- Can be longer. Use HTML formatting' : ''}
${platform === 'discord' ? '- Keep under 2000 characters. Use **bold** markdown' : ''}

FORMAT: Return ONLY a JSON array of strings. No markdown, no code blocks, just the raw JSON array.
Example: ["Caption 1 🚀 #tag1 #tag2", "Caption 2 ✨ #tag1 #tag3", "Caption 3 🔥 #tag2 #tag4"]`

    try {
        const base64 = await fileToBase64(imageFile)
        const text = await generateWithRetry([
            systemPrompt,
            {
                inlineData: {
                    mimeType: imageFile.type,
                    data: base64
                }
            }
        ])
        const captions = parseJsonResponse(text)
        return { success: true, captions }
    } catch (error) {
        console.error('AI image caption error:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Improve/rewrite existing text
 */
export async function improveCaption(text, instruction = 'Make it more engaging') {
    const systemPrompt = `You are a social media copywriting expert. Improve the given text based on the instruction.

RULES:
- Keep the core message intact
- Make it more engaging and shareable
- Add emojis where appropriate
- Add relevant hashtags

Return ONLY the improved text as a single string. No quotes, no explanation.`

    try {
        const improved = await generateWithRetry([
            systemPrompt,
            `Original text: "${text}"\nInstruction: ${instruction}`
        ])
        return { success: true, caption: improved }
    } catch (error) {
        console.error('AI improve error:', error)
        return { success: false, error: error.message }
    }
}

// Helper: File to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}
