import { useState, useRef, useEffect, useCallback } from 'react';
import { EmotionMode } from '../types';

export interface LiveTranscriptItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

export type LiveConnectionState = 'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'interrupted' | 'error';

export function useGeminiLive(currentEmotionMode: EmotionMode) {
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const [currentInputText, setCurrentInputText] = useState('');
  const [currentOutputText, setCurrentOutputText] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<LiveTranscriptItem[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Audio & WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);
  const animFrameRef = useRef<any>(null);
  const isMicMutedRef = useRef(false);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  // Convert Float32Array from microphone to 16-bit PCM ArrayBuffer
  const floatTo16BitPCM = (input: Float32Array): ArrayBuffer => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output.buffer;
  };

  // Convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Stop and clear all currently playing output audio chunks (e.g. on interruption)
  const stopOutputAudio = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
  }, []);

  // Play incoming 24kHz PCM chunk with gapless scheduling
  const playAudioChunk = useCallback((base64Pcm: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;

    try {
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      if (outputAnalyserRef.current) {
        source.connect(outputAnalyserRef.current);
      } else {
        source.connect(ctx.destination);
      }

      const now = ctx.currentTime;
      if (nextStartTimeRef.current < now) {
        nextStartTimeRef.current = now + 0.03; // small initial jitter cushion
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setConnectionState(prev => prev === 'speaking' ? 'listening' : prev);
        }
      };

      setConnectionState('speaking');
    } catch (err) {
      console.error('Error playing live audio chunk:', err);
    }
  }, []);

  // Visualizer loop
  const updateAudioLevels = useCallback(() => {
    if (inputAnalyserRef.current && !isMicMutedRef.current) {
      const array = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
      inputAnalyserRef.current.getByteFrequencyData(array);
      let sum = 0;
      for (let i = 0; i < array.length; i++) sum += array[i];
      const avg = sum / array.length;
      setMicVolume(Math.min(100, Math.round((avg / 255) * 140)));
    } else {
      setMicVolume(0);
    }

    if (outputAnalyserRef.current && activeSourcesRef.current.length > 0) {
      const array = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
      outputAnalyserRef.current.getByteFrequencyData(array);
      let sum = 0;
      for (let i = 0; i < array.length; i++) sum += array[i];
      const avg = sum / array.length;
      setOutputVolume(Math.min(100, Math.round((avg / 255) * 160)));
    } else {
      setOutputVolume(0);
    }

    animFrameRef.current = requestAnimationFrame(updateAudioLevels);
  }, []);

  // Connect to Gemini Live API via WebSocket
  const startLiveSession = useCallback(async (customVoice?: string) => {
    try {
      setErrorMessage(null);
      setConnectionState('connecting');
      setSessionDuration(0);
      setCurrentInputText('');
      setCurrentOutputText('');
      const voiceToUse = customVoice || selectedVoice;

      // 1. Initialize Web Audio Contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('Tu navegador no soporta Web Audio API para llamadas en vivo.');
      }

      // Input 16kHz Audio Context
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      // Output 24kHz Audio Context
      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      if (outputCtx.state === 'suspended') {
        await outputCtx.resume();
      }

      nextStartTimeRef.current = outputCtx.currentTime;

      // Analysers
      const inAnalyser = inputCtx.createAnalyser();
      inAnalyser.fftSize = 64;
      inputAnalyserRef.current = inAnalyser;

      const outAnalyser = outputCtx.createAnalyser();
      outAnalyser.fftSize = 64;
      outAnalyser.connect(outputCtx.destination);
      outputAnalyserRef.current = outAnalyser;

      // 2. Request Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      mediaStreamRef.current = stream;

      const source = inputCtx.createMediaStreamSource(stream);
      source.connect(inAnalyser);

      // ScriptProcessor to capture raw PCM
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;
      source.connect(processor);
      processor.connect(inputCtx.destination);

      // 3. Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const startTime = Date.now();

      ws.onopen = () => {
        setLatencyMs(Date.now() - startTime);
        // Send setup configuration
        ws.send(JSON.stringify({
          type: 'setup',
          emotionMode: currentEmotionMode,
          voice: voiceToUse,
          userTime: new Date().toLocaleTimeString('es-ES', { timeZone: 'Atlantic/Canary', hour: '2-digit', minute: '2-digit' }),
          userDate: new Date().toLocaleDateString('es-ES', { timeZone: 'Atlantic/Canary', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        }));
      };

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isMicMutedRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBuffer = floatTo16BitPCM(inputData);
          const base64Audio = arrayBufferToBase64(pcmBuffer);
          ws.send(JSON.stringify({
            type: 'audio',
            audio: base64Audio
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ready') {
            setConnectionState('listening');
            // Start session timer
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = setInterval(() => {
              setSessionDuration(prev => prev + 1);
            }, 1000);
          } else if (data.type === 'audio' && data.audio) {
            playAudioChunk(data.audio);
          } else if (data.type === 'input_transcript' && data.text) {
            setCurrentInputText(prev => {
              const updated = prev ? `${prev} ${data.text}` : data.text;
              return updated;
            });
          } else if (data.type === 'output_transcript' && data.text) {
            setCurrentOutputText(prev => {
              const updated = prev ? `${prev}${data.text}` : data.text;
              return updated;
            });
          } else if (data.type === 'interrupted') {
            stopOutputAudio();
            setConnectionState('interrupted');
            setTimeout(() => {
              setConnectionState('listening');
            }, 400);
          } else if (data.type === 'turn_complete') {
            // Commit to transcript history if we have content
            setCurrentInputText(currIn => {
              setCurrentOutputText(currOut => {
                if (currIn.trim() || currOut.trim()) {
                  const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  setTranscriptHistory(prev => [
                    ...prev,
                    ...(currIn.trim() ? [{
                      id: `user-${Date.now()}`,
                      sender: 'user' as const,
                      text: currIn.trim(),
                      timestamp: nowStr,
                      isFinal: true
                    }] : []),
                    ...(currOut.trim() ? [{
                      id: `asst-${Date.now() + 1}`,
                      sender: 'assistant' as const,
                      text: currOut.trim(),
                      timestamp: nowStr,
                      isFinal: true
                    }] : [])
                  ]);
                }
                return '';
              });
              return '';
            });
          } else if (data.type === 'error') {
            setErrorMessage(data.error || 'Error en la conexión Gemini Live');
            setConnectionState('error');
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket Live error:', e);
        setErrorMessage('No se pudo establecer conexión en tiempo real con Gemini Live.');
        setConnectionState('error');
      };

      ws.onclose = () => {
        stopSession();
      };

      // Start visualizer animation
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(updateAudioLevels);

    } catch (err: any) {
      console.error('Error starting live session:', err);
      setErrorMessage(err?.message || 'Error al iniciar la llamada en vivo');
      setConnectionState('error');
      stopSession();
    }
  }, [currentEmotionMode, selectedVoice, playAudioChunk, stopOutputAudio, updateAudioLevels]);

  // Stop session
  const stopSession = useCallback(() => {
    // 1. Close WebSocket
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'close' }));
        }
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    // 2. Stop microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
      } catch (e) {}
      processorNodeRef.current = null;
    }

    // 3. Close Audio Contexts
    stopOutputAudio();

    if (inputAudioCtxRef.current) {
      try { inputAudioCtxRef.current.close(); } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try { outputAudioCtxRef.current.close(); } catch (e) {}
      outputAudioCtxRef.current = null;
    }

    // 4. Clear timers
    clearInterval(timerIntervalRef.current);
    cancelAnimationFrame(animFrameRef.current);

    setConnectionState('disconnected');
    setMicVolume(0);
    setOutputVolume(0);
  }, [stopOutputAudio]);

  // Send instant text message over Live session
  const sendLiveText = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && text.trim()) {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: text.trim()
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    connectionState,
    errorMessage,
    selectedVoice,
    setSelectedVoice,
    isMicMuted,
    setIsMicMuted,
    micVolume,
    outputVolume,
    currentInputText,
    currentOutputText,
    transcriptHistory,
    sessionDuration,
    latencyMs,
    startLiveSession,
    stopSession,
    sendLiveText,
    clearTranscripts: () => setTranscriptHistory([]),
  };
}
