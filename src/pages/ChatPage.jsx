import { useState, useRef, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion, AnimatePresence } from 'framer-motion';

import Avatar from '../components/Avatar';
import VideoAvatar from '../components/VideoAvatar';
import LoadingScreen from '../components/LoadingScreen';
import ChatHeader from '../components/ChatHeader';
import ChatInputBar from '../components/ChatInputBar';
import MessageBubble from '../components/MessageBubble';

import { API_URL, LOTTIE_URLS } from '../constants';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [avatarState, setAvatarState] = useState('idle');
  const [isResponseActive, setIsResponseActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showRobot, setShowRobot] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('SYSTEM_INIT...');
  const [isRobotVisualReady, setIsRobotVisualReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('uz');
  const [isDark, setIsDark] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('style1');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark && selectedStyle === 'style1');
  }, [isDark, selectedStyle]);

  const menuRef = useRef(null);
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isMenuOpen]);

  const mediaRecorderRef = useRef(null);
  const chatEndRef = useRef(null);
  const audioPlayerRef = useRef(new Audio());
  const soundEnabledRef = useRef(true);
  const stopSignalRef = useRef(false);
  const hasGreetedRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const currentAudioUrlRef = useRef(null);
  const activeTtsRequestRef = useRef(null);
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingStreamRef = useRef(false);
  const activeSourceRef = useRef(null);
  const streamTextRef = useRef('');

  const clearCurrentAudioUrl = () => {
    if (!currentAudioUrlRef.current) return;
    try { URL.revokeObjectURL(currentAudioUrlRef.current); } catch (e) {}
    currentAudioUrlRef.current = null;
  };

  const abortActiveTtsRequest = () => {
    if (!activeTtsRequestRef.current) return;
    activeTtsRequestRef.current.abort();
    activeTtsRequestRef.current = null;
  };

  const stopHtmlAudio = () => {
    audioPlayerRef.current.pause();
    audioPlayerRef.current.currentTime = 0;
    audioPlayerRef.current.onended = null;
    audioPlayerRef.current.onpause = null;
    audioPlayerRef.current.onerror = null;
    clearCurrentAudioUrl();
  };

  const finalizeResponseIfSettled = () => {
    if (stopSignalRef.current) return;
    if (wsRef.current || activeTtsRequestRef.current || isPlayingStreamRef.current || activeSourceRef.current || audioQueueRef.current.length > 0) return;
    setIsResponseActive(false);
    setAvatarState('idle');
  };

  const upsertLastAiMessage = (text) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === 'ai') {
        next[next.length - 1] = { ...last, text };
        return next;
      }
      next.push({ role: 'ai', text });
      return next;
    });
  };

  const playBlobUntilEnded = async (audioBlob) => {
    if (!soundEnabledRef.current) return;
    stopHtmlAudio();
    const audioUrl = URL.createObjectURL(audioBlob);
    currentAudioUrlRef.current = audioUrl;
    audioPlayerRef.current.src = audioUrl;
    await new Promise((resolve, reject) => {
      let settled = false;
      const cleanupAudioEvents = () => {
        audioPlayerRef.current.onended = null;
        audioPlayerRef.current.onpause = null;
        audioPlayerRef.current.onerror = null;
      };
      const finalizePlayback = () => {
        if (settled) return;
        settled = true;
        cleanupAudioEvents();
        clearCurrentAudioUrl();
        resolve();
      };
      audioPlayerRef.current.onended = finalizePlayback;
      audioPlayerRef.current.onpause = () => { if (!stopSignalRef.current) return; finalizePlayback(); };
      audioPlayerRef.current.onerror = () => {
        if (settled) return;
        settled = true;
        cleanupAudioEvents();
        clearCurrentAudioUrl();
        reject(new Error('[Audio] Playback failed'));
      };
      audioPlayerRef.current.play().catch((error) => {
        if (settled) return;
        settled = true;
        cleanupAudioEvents();
        clearCurrentAudioUrl();
        reject(error);
      });
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const handleResize = () => {
      const viewport = window.visualViewport;
      const keyboardH = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardHeight(keyboardH);
    };
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
      window.visualViewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    if (autoScroll) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, autoScroll]);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    if (!isAtBottom) {
      setAutoScroll(false);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setAutoScroll(true), 5000);
    } else {
      setAutoScroll(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const waitForBackend = async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      setLoadingStatus('CONNECTING...');
      const statusMessages = [
        { delay: 3000, text: 'WAKING_UP_SERVER...' },
        { delay: 8000, text: 'LOADING_AI_MODELS...' },
        { delay: 18000, text: 'INITIALIZING_RAG...' },
        { delay: 30000, text: 'ALMOST_READY...' },
      ];
      const timers = statusMessages.map(({ delay, text }) => setTimeout(() => setLoadingStatus(text), delay));
      let backendReady = false;
      const deadline = Date.now() + 60000;
      while (!backendReady && Date.now() < deadline) {
        try {
          const res = await fetch(`${API_URL}/health`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
          if (res.ok) { backendReady = true; break; }
          await sleep(1500);
        } catch (e) { await sleep(2000); }
      }
      timers.forEach((t) => clearTimeout(t));
      if (!backendReady) {
        setLoadingStatus('SERVER_TIMEOUT');
        await sleep(400);
        setIsLoading(false);
        setMessages([{ role: 'ai', text: "Server hozircha javob bermayapti. Birozdan so'ng sahifani yangilang yoki qayta urinib ko'ring." }]);
        setAvatarState('idle');
        return;
      }
      setLoadingStatus('READY');
      await sleep(400);
      setIsLoading(false);
      setAvatarState('idle');
    };
    waitForBackend();
  }, []);

  const stopGeneration = () => {
    stopSignalRef.current = true;
    abortActiveTtsRequest();
    stopHtmlAudio();
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) {}
      wsRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingStreamRef.current = false;
    setIsResponseActive(false);
    setAvatarState('idle');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setAvatarState('thinking');
    setIsResponseActive(true);
    setAutoScroll(true);

    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendHost = import.meta.env.VITE_API_URL
      ? window.location.host
      : window.location.host;
    const wsUrl = `${wsProto}//${backendHost}/api/ws/text-stream`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      stopSignalRef.current = false;
      streamTextRef.current = '';
      audioQueueRef.current = [];
      isPlayingStreamRef.current = false;
      abortActiveTtsRequest();
      stopHtmlAudio();
      if (activeSourceRef.current) {
        try { activeSourceRef.current.stop(); } catch (e) {}
        activeSourceRef.current = null;
      }

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'text_query', text: userText, lang: selectedLang }));
        setMessages((prev) => [...prev, { role: 'ai', text: '' }]);
      };

      ws.onmessage = (event) => {
        if (stopSignalRef.current) { ws.close(); return; }
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'llm':
            streamTextRef.current += msg.text;
            upsertLastAiMessage(streamTextRef.current);
            break;
          case 'tts':
            if (soundEnabledRef.current && msg.audio) {
              setAvatarState('speaking');
              const binaryStr = atob(msg.audio);
              const bytes = new Uint8Array(binaryStr.length);
              for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
              audioQueueRef.current.push(bytes);
              playNextAudioChunk();
            }
            break;
          case 'done':
            wsRef.current = null;
            ws.close();
            finalizeResponseIfSettled();
            break;
          case 'error':
            setIsResponseActive(false);
            setAvatarState('idle');
            wsRef.current = null;
            break;
        }
      };

      ws.onerror = () => { wsRef.current = null; sendTextFallback(userText); };
      ws.onclose = () => { wsRef.current = null; };
    } catch (e) {
      sendTextFallback(userText);
    }
  };

  const sendTextFallback = async (userText) => {
    try {
      const formData = new FormData();
      formData.append('text', userText);
      formData.append('lang', selectedLang);
      const res = await fetch(`${API_URL}/text-chat`, { method: 'POST', body: formData });
      const data = await res.json();
      await handleAiResponse(data.answer, soundEnabled);
    } catch (e) {
      setIsResponseActive(false);
      setAvatarState('idle');
    }
  };

  const handleAiResponse = async (text, playSound = true) => {
    stopSignalRef.current = false;
    setIsResponseActive(true);
    upsertLastAiMessage(text);
    if (!playSound || !soundEnabledRef.current) {
      setIsResponseActive(false);
      setAvatarState('idle');
      return;
    }
    const controller = new AbortController();
    activeTtsRequestRef.current = controller;
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('lang', selectedLang);
      const audioRes = await fetch(`${API_URL}/tts`, { method: 'POST', body: formData, signal: controller.signal });
      if (!audioRes.ok) throw new Error(`[TTS] Request failed: ${audioRes.status}`);
      const audioBlob = await audioRes.blob();
      if (activeTtsRequestRef.current === controller) activeTtsRequestRef.current = null;
      if (stopSignalRef.current || !soundEnabledRef.current) { finalizeResponseIfSettled(); return; }
      setAvatarState('speaking');
      await playBlobUntilEnded(audioBlob);
    } catch (e) {
      if (e.name !== 'AbortError') console.error('[TTS] Playback failed:', e);
    } finally {
      if (activeTtsRequestRef.current === controller) activeTtsRequestRef.current = null;
      finalizeResponseIfSettled();
    }
  };

  const playNextAudioChunk = async () => {
    if (isPlayingStreamRef.current) return;
    if (audioQueueRef.current.length === 0) return;
    isPlayingStreamRef.current = true;
    const audioData = audioQueueRef.current.shift();
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioContextRef.current;
      const buffer = await ctx.decodeAudioData(audioData.buffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      activeSourceRef.current = source;
      source.onended = () => {
        activeSourceRef.current = null;
        isPlayingStreamRef.current = false;
        playNextAudioChunk();
        finalizeResponseIfSettled();
      };
      source.start(0);
    } catch (e) {
      isPlayingStreamRef.current = false;
      playNextAudioChunk();
      finalizeResponseIfSettled();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
        sendVoiceStream(audioBlob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAvatarState('listening');
    } catch (err) { alert('Mikrofonga ruxsat bering!'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAvatarState('thinking');
    }
  };

  const sendVoiceStream = async (audioBlob) => {
    stopSignalRef.current = false;
    setIsResponseActive(true);
    streamTextRef.current = '';
    audioQueueRef.current = [];
    isPlayingStreamRef.current = false;
    abortActiveTtsRequest();
    stopHtmlAudio();
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch (e) {}
      activeSourceRef.current = null;
    }

    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//${window.location.host}/api/ws/voice-stream`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        ws.send(JSON.stringify({ type: 'lang_hint', lang: selectedLang }));
        const arrayBuffer = await audioBlob.arrayBuffer();
        ws.send(arrayBuffer);
      };

      ws.onmessage = (event) => {
        if (stopSignalRef.current) { ws.close(); return; }
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'stt':
            if (msg.is_final && msg.text) {
              setMessages((prev) => [...prev, { role: 'user', text: msg.text }]);
              setAvatarState('thinking');
              setAutoScroll(true);
              setMessages((prev) => [...prev, { role: 'ai', text: '' }]);
            }
            break;
          case 'llm':
            streamTextRef.current += msg.text;
            upsertLastAiMessage(streamTextRef.current);
            break;
          case 'tts':
            if (soundEnabledRef.current && msg.audio) {
              setAvatarState('speaking');
              const binaryStr = atob(msg.audio);
              const bytes = new Uint8Array(binaryStr.length);
              for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
              audioQueueRef.current.push(bytes);
              playNextAudioChunk();
            }
            break;
          case 'done':
            wsRef.current = null;
            ws.close();
            finalizeResponseIfSettled();
            break;
          case 'error':
            setIsResponseActive(false);
            setAvatarState('idle');
            wsRef.current = null;
            break;
        }
      };

      ws.onerror = () => { wsRef.current = null; sendVoiceFallback(audioBlob); };
      ws.onclose = () => { wsRef.current = null; };
    } catch (e) {
      sendVoiceFallback(audioBlob);
    }
  };

  const sendVoiceFallback = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice.webm');
    try {
      const res = await fetch(`${API_URL}/voice-chat`, { method: 'POST', body: formData });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'user', text: data.text }]);
      await handleAiResponse(data.answer, soundEnabled);
    } catch (e) {
      setIsResponseActive(false);
      setAvatarState('idle');
    }
  };

  const toggleRobot = () => setShowRobot((prev) => !prev);
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newState = !prev;
      if (!newState) {
        abortActiveTtsRequest();
        stopHtmlAudio();
        if (activeSourceRef.current) {
          try { activeSourceRef.current.stop(); } catch (e) {}
          activeSourceRef.current = null;
        }
        audioQueueRef.current = [];
        isPlayingStreamRef.current = false;
        finalizeResponseIfSettled();
      }
      return newState;
    });
  };

  const isKeyboardOpen = isFocused || keyboardHeight > 100;
  const shouldEnterFocusMode = isMobile && isKeyboardOpen;
  const isWelcomeView = messages.length === 0;
  const isImg = selectedStyle !== 'style1';
  const bgFile = selectedStyle === 'style2' ? 'style2.jpg' : 'style3.png';

  return (
    <div
      className={`flex flex-col h-full w-full font-sans overflow-hidden relative ${
        isImg ? 'text-white' : 'bg-[#f7f7f8] dark:bg-[#111113] text-gray-900 dark:text-gray-100'
      }`}
      style={isImg ? { backgroundImage: `url(/${bgFile})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div style={{ position: 'absolute', left: -9999, top: -9999, width: 60, height: 60 }}>
        <Avatar state={avatarState} onReady={() => setIsRobotVisualReady(true)} />
      </div>

      <LoadingScreen isLoading={isLoading} loadingStatus={loadingStatus} />

      {!isLoading && !shouldEnterFocusMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none pb-52">
          {showRobot && (
            selectedStyle === 'style3' ? (
              <div style={{ width: 'min(60vw, 420px)', aspectRatio: '4/5', marginTop: '60px' }}>
                <VideoAvatar avatarState={avatarState} />
              </div>
            ) : (
              <motion.div
                animate={{ scale: isWelcomeView ? 1 : 0.5, opacity: isWelcomeView ? 1 : 0.18 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-[403px] h-[403px] sm:w-[448px] sm:h-[448px] mb-4"
              >
                <DotLottieReact src={LOTTIE_URLS[selectedStyle]} loop autoplay />
              </motion.div>
            )
          )}
          <AnimatePresence>
            {isWelcomeView && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-center px-4 ml-10"
              >
                <div className={isImg ? 'inline-block bg-black/35 backdrop-blur-sm rounded-2xl px-5 py-3' : ''}>
                  <p className={`text-sm sm:text-base mb-1 ${isImg ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
                    Ekologiya bo'yicha maslahat
                  </p>
                  <h1 className={`text-2xl sm:text-3xl font-semibold leading-snug ${isImg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    Savolingizni <span className="text-purple-300">bering</span>
                  </h1>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && (
        <ChatHeader
          isImg={isImg}
          avatarState={avatarState}
          isWelcomeView={isWelcomeView}
          isMenuOpen={isMenuOpen}
          showRobot={showRobot}
          soundEnabled={soundEnabled}
          isDark={isDark}
          selectedStyle={selectedStyle}
          menuRef={menuRef}
          setIsMenuOpen={setIsMenuOpen}
          setIsDark={setIsDark}
          toggleRobot={toggleRobot}
          toggleSound={toggleSound}
          setSelectedStyle={setSelectedStyle}
        />
      )}

      <div
        className="relative z-[11] flex-1 overflow-y-auto px-3 sm:px-6 pb-52 space-y-3"
        style={{ paddingTop: '56px' }}
        onScroll={handleScroll}
      >
        <AnimatePresence>
          {messages.map((msg, i) => {
            if (!msg.text) return null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={i === 0 ? { marginTop: '30px' } : undefined}
              >
                <MessageBubble text={msg.text} role={msg.role} />
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <ChatInputBar
        selectedStyle={selectedStyle}
        isImg={isImg}
        isRecording={isRecording}
        audioStream={audioStream}
        isDark={isDark}
        input={input}
        setInput={setInput}
        avatarState={avatarState}
        isResponseActive={isResponseActive}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        inputRef={inputRef}
        sendMessage={sendMessage}
        startRecording={startRecording}
        stopRecording={stopRecording}
        stopGeneration={stopGeneration}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}
