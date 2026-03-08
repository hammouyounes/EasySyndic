/**
 * groqService.ts
 * ─────────────────────────────────────────────────────
 * Handles communication with the Groq API.
 *  - Chat completions (LLaMA 3.1)
 *  - Audio transcription (Whisper)
 */

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TRANSCRIPTION_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

/**
 * Sends a chat completion request to Groq API.
 */
export async function askGroq(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        throw new Error('Clé API Groq manquante. Vérifiez votre fichier .env');
    }

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
    ];

    try {
        const response = await fetch(GROQ_CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages,
                temperature: 0.6,
                max_tokens: 300,
                top_p: 0.9,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Erreur Groq API (${response.status}): ${errorData?.error?.message || response.statusText
                }`
            );
        }

        const data: GroqResponse = await response.json();
        return (
            data.choices?.[0]?.message?.content ||
            "Désolé, je n'ai pas pu générer de réponse."
        );
    } catch (error: any) {
        if (error.message.includes('Groq API')) throw error;
        throw new Error(`Erreur réseau: ${error.message}`);
    }
}

/**
 * Transcribes an audio blob using Groq's Whisper API.
 * @param audioBlob - The recorded audio blob
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        throw new Error('Clé API Groq manquante. Vérifiez votre fichier .env');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'fr');
    formData.append('response_format', 'json');

    try {
        const response = await fetch(GROQ_TRANSCRIPTION_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Erreur Whisper API (${response.status}): ${errorData?.error?.message || response.statusText}`
            );
        }

        const data = await response.json();
        return data.text || '';
    } catch (error: any) {
        if (error.message.includes('Whisper API')) throw error;
        throw new Error(`Erreur transcription: ${error.message}`);
    }
}

