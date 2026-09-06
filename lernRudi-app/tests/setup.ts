import { vi } from 'vitest';
import '@testing-library/jest-dom';

// TypeScript declarations for global scope
declare global {
  var speechSynthesis: SpeechSynthesis;
  var SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
  var AudioContext: typeof AudioContext;
}

// Mock Web Speech API
globalThis.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn(() => [
    {
      lang: 'de-DE',
      name: 'German Voice',
      voiceURI: 'de-DE',
      default: false,
      localService: true
    } as SpeechSynthesisVoice
  ]),
  pause: vi.fn(),
  resume: vi.fn(),
  pending: false,
  speaking: false,
  paused: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
} as unknown as SpeechSynthesis;

// Mock SpeechSynthesisUtterance
globalThis.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
  text: string;
  lang = 'de-DE';
  voice: any = null;
  volume = 1;
  rate = 1;
  pitch = 1;
  onend: any = null;
  onerror: any = null;
  onstart: any = null;

  constructor(text: string = '') {
    this.text = text;
  }

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
} as any;

// Mock Web Audio API
const mockOscillator = {
  connect: vi.fn().mockReturnThis(),
  start: vi.fn(),
  stop: vi.fn(),
  frequency: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn()
  },
  type: 'sine'
};

const mockGain = {
  connect: vi.fn().mockReturnThis(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn()
  }
};

globalThis.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined)
})) as unknown as typeof AudioContext;

// Mock canvas for tests
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId: string) => {
  if (contextId === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setLineDash: vi.fn(),
      roundRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      }))
    };
  }
  return null;
});
