import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'node:util'

// Polyfill for React Router v7 which requires TextEncoder/TextDecoder
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}
