import '@testing-library/jest-dom';
import { vi } from 'vitest';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '../index.css';

// Mock ResizeObserver
(globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock DOMMatrix
(globalThis as any).DOMMatrix = class DOMMatrix {
  a: number = 1;
  b: number = 0;
  c: number = 0;
  d: number = 1;
  e: number = 0;
  f: number = 0;

  constructor(init?: string | number[]) {
    if (Array.isArray(init)) {
      this.a = init[0] || 1;
      this.b = init[1] || 0;
      this.c = init[2] || 0;
      this.d = init[3] || 1;
      this.e = init[4] || 0;
      this.f = init[5] || 0;
    }
  }

  scale(scaleX: number, scaleY: number = scaleX) {
    return new DOMMatrix([
      this.a * scaleX, this.b * scaleX, this.c * scaleY,
      this.d * scaleY, this.e, this.f
    ]);
  }

  translate(tx: number, ty: number) {
    return new DOMMatrix([
      this.a, this.b, this.c, this.d,
      this.e + tx, this.f + ty
    ]);
  }

  toString() {
    return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
  }
};