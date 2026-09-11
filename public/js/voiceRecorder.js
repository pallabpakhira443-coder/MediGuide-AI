/**
 * MediGuide AI - Live Speech Recognition & Audio Waveform Visualizer
 */

class VoiceRecorderService {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.canvasCtx = null;
    this.animationFrameId = null;
    this.initSpeechRecognition();
    this.initStopButton();
  }

  initStopButton() {
    const btnStop = document.getElementById('btnStopVoice');
    if (btnStop) {
      btnStop.addEventListener('click', () => {
        this.stopRecording();
        const inputElem = document.getElementById('symptomInput');
        if (inputElem && inputElem.value.trim().length > 0) {
          // Highlight submit button
          const btnSubmit = document.getElementById('btnSubmitTriage');
          if (btnSubmit) btnSubmit.focus();
        }
      });
    }
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const inputElem = document.getElementById('symptomInput');
        if (inputElem) {
          inputElem.value = transcript;
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('Speech recognition notice:', err.error);
        if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
          this.stopRecording();
        }
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          this.stopRecording();
        }
      };
    }
  }

  async startRecording() {
    if (this.isRecording) {
      this.stopRecording();
      return;
    }

    const btnVoice = document.getElementById('btnVoiceInput');
    const visualizerBox = document.getElementById('voiceVisualizerBox');
    const canvas = document.getElementById('voiceCanvas');

    try {
      // 1. Start Speech Recognition
      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {}
      }

      // 2. Start Audio Waveform Visualizer
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.microphone.connect(this.analyser);

        this.analyser.fftSize = 64;
        if (canvas) this.canvasCtx = canvas.getContext('2d');

        this.isRecording = true;
        if (btnVoice) btnVoice.classList.add('recording');
        if (visualizerBox) visualizerBox.style.display = 'flex';

        this.drawWaveform();
      } else {
        this.simulateVoiceWave();
      }
      if (window.audioFx) window.audioFx.playClick();
    } catch (err) {
      console.warn('Microphone physical access restricted, using simulated visualizer:', err.message);
      this.simulateVoiceWave();
    }
  }

  simulateVoiceWave() {
    const btnVoice = document.getElementById('btnVoiceInput');
    const visualizerBox = document.getElementById('voiceVisualizerBox');
    const canvas = document.getElementById('voiceCanvas');
    if (!canvas) return;

    this.isRecording = true;
    if (btnVoice) btnVoice.classList.add('recording');
    if (visualizerBox) visualizerBox.style.display = 'flex';
    this.canvasCtx = canvas.getContext('2d');

    let step = 0;
    const animateSim = () => {
      if (!this.isRecording) return;
      step += 0.15;
      const ctx = this.canvasCtx;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ef4444';

      const barCount = 18;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.abs(Math.sin(step + i * 0.4)) * (height - 6) + 4;
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
      this.animationFrameId = requestAnimationFrame(animateSim);
    };
    animateSim();
  }

  drawWaveform() {
    if (!this.isRecording || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    const canvas = document.getElementById('voiceCanvas');
    if (!canvas) return;
    const ctx = this.canvasCtx;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;

      // Cyan to Red emergency gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(1, '#06b6d4');
      ctx.fillStyle = gradient;

      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }

    this.animationFrameId = requestAnimationFrame(() => this.drawWaveform());
  }

  stopRecording() {
    this.isRecording = false;
    const btnVoice = document.getElementById('btnVoiceInput');
    const visualizerBox = document.getElementById('voiceVisualizerBox');

    if (btnVoice) btnVoice.classList.remove('recording');
    if (visualizerBox) visualizerBox.style.display = 'none';

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
    }

    if (window.audioFx) window.audioFx.playClick();
  }
}

const voiceRecorder = new VoiceRecorderService();
window.voiceRecorder = voiceRecorder;
