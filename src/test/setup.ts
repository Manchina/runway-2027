import { vi, beforeEach, afterEach } from 'vitest';

// In-Memory LocalStorage Mock to guarantee zero filesystem/browser persistent storage side-effects
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

const localStorageMock = createLocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Canvas-confetti Mock
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Global fetch mock to strictly guarantee NO database or network calls are made during tests
const mockFetch = vi.fn().mockImplementation(async (_url: string, _init?: RequestInit) => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      success: true,
      data: [],
      message: 'Mock response - ZERO live database interactions',
    }),
  };
});

vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
