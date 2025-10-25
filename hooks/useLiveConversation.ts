import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';

// --- Audio Helper Functions ---

// From Base64 to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// From Uint8Array to Base64
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Custom PCM decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useLiveConversation = (onTranscriptionUpdate: (text: string) => void) => {
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const stopConversation = useCallback(async () => {
    if (!sessionPromiseRef.current) return;

    try {
      const session = await sessionPromiseRef.current;
      session.close();
    } catch (e) {
      console.error("Error closing session:", e);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close();
    }
     if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      await outputAudioContextRef.current.close();
    }
    
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    setIsLive(false);
    sessionPromiseRef.current = null;
    nextStartTimeRef.current = 0;
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';

  }, []);

  const startConversation = useCallback(async () => {
    if (isLive) return;

    setError(null);
    setIsLive(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const localInputAudioContext = inputAudioContextRef.current;
        const localOutputAudioContext = outputAudioContextRef.current;

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: "You are Chloe, a helpful AI assistant. Keep your answers concise and conversational."
            },
            callbacks: {
                onopen: () => {
                    const source = localInputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = localInputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        
                        // FIX: Per docs, rely on promise resolution instead of conditional checks.
                        // Using optional chaining to safely call .then()
                        sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                        }).catch(e => console.error("Error sending audio data", e));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(localInputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscription.current += message.serverContent.inputTranscription.text;
                        onTranscriptionUpdate(currentInputTranscription.current);
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                    }

                    if (message.serverContent?.turnComplete) {
                        currentInputTranscription.current = '';
                        currentOutputTranscription.current = '';
                    }

                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64EncodedAudioString) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, localOutputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(
                            decode(base64EncodedAudioString),
                            localOutputAudioContext,
                            24000,
                            1,
                        );
                        const source = localOutputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(localOutputAudioContext.destination);
                        source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                    
                    // FIX: Added interruption handling to stop audio playback when the user interrupts.
                    const interrupted = message.serverContent?.interrupted;
                    if (interrupted) {
                      for (const source of sourcesRef.current.values()) {
                        source.stop();
                        sourcesRef.current.delete(source);
                      }
                      nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Live session error:", e);
                    setError("A connection error occurred.");
                    stopConversation();
                },
                onclose: (e: CloseEvent) => {
                    stopConversation();
                },
            }
        });
        
        await sessionPromiseRef.current;

      } else {
        throw new Error("API_KEY is not set.");
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError("Failed to start live conversation. Check microphone permissions.");
      setIsLive(false);
    }
  }, [isLive, stopConversation, onTranscriptionUpdate]);

  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  return { isLive, error, startConversation, stopConversation };
};
