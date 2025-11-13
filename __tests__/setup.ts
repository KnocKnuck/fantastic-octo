import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for Next.js Web APIs
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock Request and Response for Next.js API routes
if (typeof Request === "undefined") {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Map<string, string>;
    body: any;

    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Map();
      this.body = init?.body;

      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value as string);
        });
      }
    }

    async json() {
      return JSON.parse(this.body || "{}");
    }

    async text() {
      return this.body || "";
    }
  } as any;
}

if (typeof Response === "undefined") {
  global.Response = class Response {
    status: number;
    statusText: string;
    headers: Map<string, string>;
    body: any;

    constructor(body?: any, init?: any) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "OK";
      this.headers = new Map();

      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value as string);
        });
      }
    }

    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }

    async text() {
      return typeof this.body === "string"
        ? this.body
        : JSON.stringify(this.body);
    }

    static json(data: any, init?: any) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
      });
    }
  } as any;
}

if (typeof Headers === "undefined") {
  global.Headers = class Headers {
    private map: Map<string, string>;

    constructor(init?: any) {
      this.map = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.map.set(key.toLowerCase(), value as string);
        });
      }
    }

    get(name: string): string | null {
      return this.map.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string): void {
      this.map.set(name.toLowerCase(), value);
    }

    has(name: string): boolean {
      return this.map.has(name.toLowerCase());
    }

    delete(name: string): void {
      this.map.delete(name.toLowerCase());
    }

    forEach(callback: (value: string, key: string) => void): void {
      this.map.forEach(callback);
    }
  } as any;
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: "/",
      query: {},
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Not implemented: HTMLFormElement.prototype.submit"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
