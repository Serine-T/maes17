import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// jsdom lacks these browser APIs used by animation and layout code.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
if (!('IntersectionObserver' in window)) {
  Object.assign(window, { IntersectionObserver: MockObserver });
}
if (!('ResizeObserver' in window)) {
  Object.assign(window, { ResizeObserver: MockObserver });
}
window.scrollTo = () => undefined;
