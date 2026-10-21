import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './BhashiniVoiceTranscriber.css';

export default function BhashiniVoiceTranscriber({
  onInsertText,
  initialText = '',
  placeholder = 'Speak or type in your native language...',
  sectionTitle = 'Multilingual AI Voice Recognition (BHASHINI)',
  compact = false,
  autoDetect = true,
}) {
  const { currentLangObj, bhashiniLanguages } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState(initialText);
  const [detectedLang, setDetectedLang] = useState(currentLangObj);
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'recording' | 'processing' | 'error' | 'denied'
  const [micLevel, setMicLevel] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Sync detected language when app language changes if not manually set
  useEffect(() => {
    if (currentLangObj && (!detectedLang || detectedLang.code === 'en')) {
      setDetectedLang(currentLangObj);
    }
  }, [currentLangObj]);

  // Load draft from localStorage if present
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('virasat_voice_draft_current');
      if (savedDraft && !initialText) {
        setTranscription(savedDraft);
      }
    } catch (e) {
      console.warn('Draft load error:', e);
    }
  }, [initialText]);

  // Auto-save transcription draft to localStorage for offline protection
  const handleTextChange = (newVal) => {
    setTranscription(newVal);
    try {
      localStorage.setItem('virasat_voice_draft_current', newVal);
    } catch (e) {
      console.warn('Draft save error:', e);
    }
  };

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Cleanup mic & audio context on unmount
  useEffect(() => {
    return () => {
      stopAudioStreams();
    };
  }, []);

  const stopAudioStreams = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    setIsRecording(false);
    setMicLevel(0);
  };

  // Start Mic & Speech Recognition with Automatic Language Detection
  const startRecording = async () => {
    setErrorMessage('');
    setMicStatus('recording');
    setIsRecording(true);

    // 1. Microphone Volume Visualizer setup
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!mediaStreamRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
          if (audioCtx.state === 'running') {
            requestAnimationFrame(updateVolume);
          }
        };
        updateVolume();
      }
    } catch (err) {
      console.warn('Microphone permission or audio capture error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicStatus('denied');
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else {
        setMicStatus('error');
        setErrorMessage('Unable to access microphone. Please check your recording device.');
      }
      setIsRecording(false);
      return;
    }

    // 2. Web Speech Recognition (Supports 22 Indian Bhashini Languages)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        // BCP-47 Speech recognition language code mapping
        const speechLangCode = getBcp47Code(detectedLang?.code || 'hi');
        recognition.lang = speechLangCode;
        recognition.continuous = true;
        recognition.interimResults = true;

        let finalSpeechText = transcription ? transcription + ' ' : '';

        recognition.onresult = (event) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalSpeechText += transcriptChunk + ' ';
              // Auto-Detect language from native script unicode
              autoDetectLanguageFromText(transcriptChunk);
            } else {
              interimText += transcriptChunk;
            }
          }
          const fullText = (finalSpeechText + interimText).trim();
          handleTextChange(fullText);
        };

        recognition.onerror = (event) => {
          console.warn('Web Speech Recognition event error:', event.error);
          if (event.error === 'not-allowed') {
            setMicStatus('denied');
            setErrorMessage('Microphone permission denied.');
          } else if (event.error === 'no-speech') {
            // Gentle handle no speech
          } else {
            fallbackBackendRecognition();
          }
        };

        recognition.onend = () => {
          if (isRecording) {
            // Restart if continuous recording desired
          }
        };

        recognition.start();
      } catch (e) {
        console.warn('Web Speech API start error, utilizing BHASHINI backend fallback:', e);
        fallbackBackendRecognition();
      }
    } else {
      // Fallback for browsers lacking Web Speech API
      fallbackBackendRecognition();
    }
  };

  const stopRecording = () => {
    stopAudioStreams();
    setMicStatus('idle');
  };

  // Automatic Language Detection helper based on Unicode character analysis
  const autoDetectLanguageFromText = (text) => {
    if (!autoDetect || !text) return;

    for (const char of text) {
      const cp = char.codePointAt(0);
      let foundCode = null;
      if (cp >= 0x0b80 && cp <= 0x0bff) foundCode = 'ta'; // Tamil
      else if (cp >= 0x0c00 && cp <= 0x0c7f) foundCode = 'te'; // Telugu
      else if (cp >= 0x0d00 && cp <= 0x0d7f) foundCode = 'ml'; // Malayalam
      else if (cp >= 0x0c80 && cp <= 0x0cff) foundCode = 'kn'; // Kannada
      else if (cp >= 0x0980 && cp <= 0x09ff) {
        foundCode = (text.includes('ৰ') || text.includes('ৱ')) ? 'as' : 'bn'; // Assamese / Bengali
      } else if (cp >= 0x0a80 && cp <= 0x0aff) foundCode = 'gu'; // Gujarati
      else if (cp >= 0x0a00 && cp <= 0x0a7f) foundCode = 'pa'; // Punjabi
      else if (cp >= 0x0b00 && cp <= 0x0b7f) foundCode = 'or'; // Odia
      else if (cp >= 0x0600 && cp <= 0x06ff) foundCode = 'ur'; // Urdu
      else if (cp >= 0x0900 && cp <= 0x097f) foundCode = 'hi'; // Hindi / Devanagari

      if (foundCode) {
        const matched = bhashiniLanguages.find((l) => l.code === foundCode);
        if (matched && matched.code !== detectedLang?.code) {
          setDetectedLang(matched);
          break;
        }
      }
    }
  };

  // BHASHINI Backend AI Speech-to-Text Fallback Server Call
  const fallbackBackendRecognition = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/voice/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_lang: detectedLang?.code || 'hi',
        }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (data.ok && data.transcription) {
          const newText = transcription ? `${transcription} ${data.transcription}` : data.transcription;
          handleTextChange(newText);
        }
      }
    } catch (err) {
      console.warn('Backend BHASHINI fallback error:', err);
    }
  };

  const getBcp47Code = (code) => {
    const map = {
      hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', as: 'as-IN', bn: 'bn-IN',
      ml: 'ml-IN', kn: 'kn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN',
      or: 'or-IN', ur: 'ur-IN', sa: 'sa-IN', sat: 'sat-IN', mni: 'mni-IN',
      ne: 'ne-IN', brx: 'brx-IN', doi: 'doi-IN', gom: 'gom-IN', mai: 'mai-IN',
      ks: 'ks-IN', sd: 'sd-IN', en: 'en-IN'
    };
    return map[code] || 'hi-IN';
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard?.writeText(transcription);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handleClear = () => {
    setTranscription('');
    localStorage.removeItem('virasat_voice_draft_current');
  };

  const handleInsert = () => {
    if (onInsertText && transcription) {
      onInsertText(transcription);
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bhashini-transcriber-card ${compact ? 'is-compact' : ''}`}>
      {/* Card Header & Detected Language Badge */}
      <div className="transcriber-header">
        <div className="transcriber-title-group">
          <span className="bhashini-badge-glow">BHASHINI AI SPEECH-TO-TEXT</span>
          <h4 className="transcriber-title">{sectionTitle}</h4>
        </div>

        {/* Automatic Language Detection Badge */}
        <div className="detected-lang-pill" title="Automatically Detected Language">
          <span className="lang-icon">🌐</span>
          <span className="lang-text">
            Detected: <strong>{detectedLang?.lang || 'Hindi'}</strong> ({detectedLang?.script || 'हिन्दी'})
          </span>
        </div>
      </div>

      {/* Mic Recording Controls & Visualizer */}
      <div className="mic-recording-stage">
        <button
          type="button"
          className={`mic-primary-btn ${isRecording ? 'is-active-recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          <span className="mic-icon">{isRecording ? '⏹️' : '🎙️'}</span>
        </button>

        <div className="recording-status-box">
          <div className="status-top-row">
            <span className={`status-dot ${isRecording ? 'is-live' : ''}`} />
            <span className="status-text-label">
              {isRecording
                ? `Recording in ${detectedLang?.lang || 'Native Language'}... (${formatTimer(recordingSeconds)})`
                : transcription ? 'Voice Speech Converted to Native Script' : 'Tap Microphone to Speak'}
            </span>
          </div>

          {/* Live Waveform Volume Level Meter */}
          {isRecording && (
            <div className="live-waveform-bar">
              <div className="level-fill" style={{ width: `${Math.max(8, micLevel)}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Error or Permission Denied Notice */}
      {errorMessage && (
        <div className="mic-error-notice">
          <span>⚠️ {errorMessage}</span>
          <button type="button" className="retry-mic-btn" onClick={startRecording}>
            🔄 Retry Mic Access
          </button>
        </div>
      )}

      {/* Editable Native Script Transcription Box */}
      <div className="transcription-editor-box">
        <label htmlFor="transcription-input" className="editor-label">
          ✍️ Speech Transcription in Native Script (Editable):
        </label>
        <textarea
          id="transcription-input"
          className="transcription-textarea"
          value={transcription}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder}
          rows={compact ? 3 : 4}
          lang={detectedLang?.code || 'hi'}
        />
      </div>

      {/* Action Buttons: Insert into Form, Copy, Clear, Retry */}
      <div className="transcriber-actions-bar">
        {onInsertText && (
          <button
            type="button"
            className="action-btn btn-insert-form"
            onClick={handleInsert}
            disabled={!transcription}
          >
            📥 Insert into Form
          </button>
        )}

        <button
          type="button"
          className="action-btn btn-copy"
          onClick={handleCopy}
          disabled={!transcription}
        >
          {copiedNotice ? '✓ Copied!' : '📋 Copy Text'}
        </button>

        <button
          type="button"
          className="action-btn btn-clear"
          onClick={handleClear}
          disabled={!transcription}
        >
          🧹 Clear
        </button>

        <button
          type="button"
          className="action-btn btn-retry"
          onClick={startRecording}
        >
          🔄 Speak Again
        </button>
      </div>
    </div>
  );
}
