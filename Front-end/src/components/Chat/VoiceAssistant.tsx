/**
 * VoiceAssistant.tsx
 * ─────────────────────────────────────────────────────
 * Premium floating AI Chat + Voice assistant widget.
 *
 * States: idle → listening → thinking → speaking
 *
 * Features:
 *  ✅ Text chat with Groq (LLaMA 3)
 *  ✅ Voice input  — Web Speech API (SpeechRecognition)
 *  ✅ Voice output — Web Speech API (SpeechSynthesis)
 *  ✅ Building data context injected from Redux store
 *  ✅ Security: refuses to share private financial data
 *  ✅ Streaming-like typing animation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    useGetBuildingsQuery,
    useGetApartmentsQuery,
    useGetChargesQuery,
    useGetAppelChargesQuery,
    useGetUsersQuery,
    useGetPaiementsQuery,
} from '../../features/api/apiSlice';
import { formatAdminContext, formatProprietaireContext } from '../../data/buildingData';
import { buildAdminPrompt, buildProprietairePrompt } from '../../utils/voicePrompt';
import { askGroq, transcribeAudio } from '../../services/groqService';
import './VoiceAssistant.css';

/* ── Types ── */
type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
}

/* ── SVG Icons (inline, no deps) ── */
const IconChat = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const IconX = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconMic = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const IconSend = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const IconSquare = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
);

const QUICK_ACTIONS_ADMIN = [
    'Combien y a-t-il d\'appartements vides ?',
    'Quels propriétaires ont des retards de paiement ?',
    'Donne-moi le total des paiements ce mois',
    'Quel est l\'appartement le plus cher ?',
];

const QUICK_ACTIONS_PROP = [
    'Combien dois-je payer ce mois-ci ?',
    'Ai-je des charges en retard ?',
    'Est-ce que mon dernier paiement a été reçu ?',
    'Quel est le montant total que j\'ai payé cette année ?',
];

/* ── Component ── */
const VoiceAssistant: React.FC = () => {
    // ── Panel open / close ──
    const [isOpen, setIsOpen] = useState(false);

    // ── Chat state ──
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [state, setState] = useState<AssistantState>('idle');

    // ── Refs ──
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Data from Redux store ──
    const { data: buildings = [], isFetching: isFetchingB } = useGetBuildingsQuery({});
    const { data: apartments = [], isFetching: isFetchingA } = useGetApartmentsQuery({});
    const { data: charges = [], isFetching: isFetchingC } = useGetChargesQuery({});
    const { data: appelCharges = [], isFetching: isFetchingAC } = useGetAppelChargesQuery({});
    const { data: users = [], isFetching: isFetchingU } = useGetUsersQuery({});
    const { data: paiements = [], isFetching: isFetchingP } = useGetPaiementsQuery({});

    const isLoadingData = isFetchingB || isFetchingA || isFetchingC || isFetchingAC || isFetchingU || isFetchingP;

    // ── Determine user role ──
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userRole = user?.role?.toLowerCase() === 'admin' ? 'admin' : 'proprietaire';
    const userId = user?.id;
    const userName = user ? `${user.prenom} ${user.nom}` : 'Propriétaire';

    // ── Build context & prompt ──
    let systemPrompt = '';

    if (userRole === 'admin') {
        const adminContext = formatAdminContext(buildings, apartments, charges, appelCharges, paiements, users);
        systemPrompt = buildAdminPrompt(adminContext);
    } else {
        const propContext = formatProprietaireContext(buildings, apartments, charges, appelCharges, paiements, userId);
        systemPrompt = buildProprietairePrompt(propContext, userName);
    }

    const QUICK_ACTIONS = userRole === 'admin' ? QUICK_ACTIONS_ADMIN : QUICK_ACTIONS_PROP;

    // TODO: debug prompt missing context
    console.log("=== AI SYSTEM PROMPT ===", systemPrompt);

    // ── Handle Send Wrapper Reference ──
    // This prevents stale closures inside the MediaRecorder callbacks
    const handleSendRef = useRef<((text?: string) => void) | undefined>(undefined);

    // ── Auto-scroll messages ──
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, state]);

    // ── Voice Input: MediaRecorder + Groq Whisper ──
    // Click once = start recording, click again = stop, transcribe & send
    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop the microphone stream
                stream.getTracks().forEach((track) => track.stop());
                mediaStreamRef.current = null;

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                if (audioBlob.size < 1000) {
                    setMessages((prev) => [
                        ...prev,
                        { id: `${Date.now()}-${Math.random()}`, role: 'system', text: '🔇 Enregistrement trop court. Réessayez en parlant plus longtemps.' },
                    ]);
                    setState('idle');
                    return;
                }

                // Transcribe with Groq Whisper
                setState('thinking');
                try {
                    const transcript = await transcribeAudio(audioBlob);
                    const text = transcript.trim();
                    if (text && handleSendRef.current) {
                        handleSendRef.current(text);
                    } else if (handleSendRef.current) {
                        setMessages((prev) => [
                            ...prev,
                            { id: `${Date.now()}-${Math.random()}`, role: 'system', text: '🔇 Aucune voix détectée. Réessayez en parlant plus fort.' },
                        ]);
                        setState('idle');
                    }
                } catch (err: any) {
                    console.error('Transcription error:', err);
                    setMessages((prev) => [
                        ...prev,
                        { id: `${Date.now()}-${Math.random()}`, role: 'system', text: `⚠️ Erreur transcription: ${err.message}` },
                    ]);
                    setState('idle');
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(250); // Collect data every 250ms
            setState('listening');
        } catch (err: any) {
            console.error('Microphone access error:', err);
            const errMsg = err.name === 'NotAllowedError'
                ? '🎤 Accès au microphone refusé. Autorisez le micro dans votre navigateur.'
                : `⚠️ Erreur micro: ${err.message}`;

            setMessages((prev) => [
                ...prev,
                { id: `${Date.now()}-${Math.random()}`, role: 'system', text: errMsg },
            ]);
            setState('idle');
        }
    }, []);

    // ── Stop recording ──
    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        // Fallback: stop stream if recorder didn't
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }
    }, []);

    // ── Text to Speech (Speaking) ──
    const speakResponse = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to find a good French voice
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(
            (v) =>
                v.lang.startsWith('fr') &&
                (v.name.toLowerCase().includes('google') ||
                    v.name.toLowerCase().includes('microsoft') ||
                    v.name.toLowerCase().includes('amelie') ||
                    v.name.toLowerCase().includes('thomas'))
        ) || voices.find((v) => v.lang.startsWith('fr'));

        if (frenchVoice) utterance.voice = frenchVoice;

        utterance.onstart = () => setState('speaking');
        utterance.onend = () => setState('idle');
        utterance.onerror = () => setState('idle');

        synthRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, []);

    // ── Stop speaking ──
    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setState('idle');
    };

    // ── Add message helper ──
    const addMessage = (role: Message['role'], text: string) => {
        setMessages((prev) => [
            ...prev,
            { id: `${Date.now()}-${Math.random()}`, role, text },
        ]);
    };

    // ── Send message to Groq ──
    const handleSend = async (text?: string) => {
        const message = text || inputText.trim();
        // If triggered manually (no text arg), abort if no input or already thinking
        if (!text) {
            if (!message || state === 'thinking') return;
        }

        addMessage('user', message);
        setInputText('');
        setState('thinking');

        // Build conversation history (last 6 messages for context)
        const historyForGroq = messages.slice(-6).map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.text,
        })).filter((m) => m.role === 'user' || m.role === 'assistant');

        try {
            const response = await askGroq(systemPrompt, message, historyForGroq);
            addMessage('assistant', response);
            setState('idle');

            // Auto-speak the response if the query came from voice
            if (text) {
                // Small delay for smoother UX
                setTimeout(() => speakResponse(response), 300);
            }
        } catch (err: any) {
            console.error('Groq error:', err);
            addMessage(
                'assistant',
                `⚠️ Erreur: ${err.message || 'Impossible de contacter l\'IA.'}`
            );
            setState('idle');
        }
    };

    // Keep ref in sync
    useEffect(() => {
        handleSendRef.current = handleSend;
    }, [handleSend]);

    // ── Handle keyboard submit ──
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Handle quick action ──
    const handleQuickAction = (question: string) => {
        handleSend(question);
    };

    // ── Preload voices ──
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
            window.speechSynthesis?.cancel();
        };
    }, []);

    // ── State-based status rendering ──
    const renderVoiceStatus = () => {
        if (state === 'listening') {
            return (
                <div className="va-voice-status listening">
                    <div className="va-soundwave">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="va-soundwave-bar" />
                        ))}
                    </div>
                    <span>Parlez maintenant...</span>
                    <button className="va-icon-btn va-stop-btn" onClick={stopListening} title="Arrêter">
                        <IconSquare />
                    </button>
                </div>
            );
        }
        if (state === 'speaking') {
            return (
                <div className="va-voice-status speaking">
                    <div className="va-soundwave">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="va-soundwave-bar" />
                        ))}
                    </div>
                    <span>Réponse en cours...</span>
                    <button className="va-icon-btn va-stop-btn" onClick={stopSpeaking} title="Arrêter">
                        <IconSquare />
                    </button>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            {/* ── Floating Trigger Button ── */}
            {!isOpen && (
                <button
                    className="va-trigger"
                    onClick={() => setIsOpen(true)}
                    title="Assistant IA EasySyndic"
                    id="voice-assistant-trigger"
                >
                    <IconChat />
                </button>
            )}

            {/* ── Chat Panel ── */}
            {isOpen && (
                <div className="va-panel" id="voice-assistant-panel">
                    {/* Header */}
                    <div className="va-header">
                        <div className="va-header-avatar">🤖</div>
                        <div className="va-header-info">
                            <p className="va-header-title">Assistant EasySyndic</p>
                            <p className="va-header-status">
                                <span className="va-status-dot" />
                                En ligne — IA Vocale
                            </p>
                        </div>
                        <button
                            className="va-close-btn"
                            onClick={() => {
                                setIsOpen(false);
                                stopSpeaking();
                                stopListening();
                            }}
                            title="Fermer"
                        >
                            <IconX />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="va-messages">
                        {messages.length === 0 && (
                            <>
                                <div className="va-welcome">
                                    <div className="va-welcome-emoji">👋</div>
                                    <h4>Bonjour{user?.prenom ? `, ${user.prenom}` : ''} !</h4>
                                    <p>
                                        Je suis votre assistant IA. Posez-moi une question ou
                                        utilisez le micro pour parler.
                                    </p>
                                </div>
                                <div className="va-quick-actions">
                                    {QUICK_ACTIONS.map((q) => (
                                        <button
                                            key={q}
                                            className="va-quick-btn"
                                            onClick={() => handleQuickAction(q)}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} className={`va-msg ${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}

                        {state === 'thinking' && (
                            <div className="va-typing">
                                <div className="va-typing-dot" />
                                <div className="va-typing-dot" />
                                <div className="va-typing-dot" />
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Voice Status Bar */}
                    {renderVoiceStatus()}

                    {/* Input Area */}
                    <div className="va-input-area">
                        <button
                            className={`va-icon-btn va-mic-btn ${state === 'listening' ? 'recording' : ''
                                }`}
                            onClick={state === 'listening' ? stopListening : startListening}
                            disabled={state === 'thinking' || state === 'speaking' || isLoadingData}
                            title={state === 'listening' ? 'Arrêter' : 'Parler (Désactivé si chargement)'}
                            id="voice-assistant-mic"
                        >
                            <IconMic />
                        </button>
                        <input
                            ref={inputRef}
                            className="va-text-input"
                            type="text"
                            placeholder="Posez votre question..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={state === 'thinking'}
                            id="voice-assistant-input"
                        />
                        <button
                            className="va-icon-btn va-send-btn"
                            onClick={() => handleSend()}
                            disabled={!inputText.trim() || state === 'thinking'}
                            title="Envoyer"
                            id="voice-assistant-send"
                        >
                            <IconSend />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceAssistant;
