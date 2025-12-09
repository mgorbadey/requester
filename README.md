# Requester - Postman Web Analog

A modern, web-based API testing tool built with React, TypeScript, and Vite.

## Features

- 🚀 Create and manage API requests
- 📦 Organize requests into collections
- 🔍 View request/response details
- 🎨 Modern, intuitive UI
- ✅ Full test coverage with Jest and React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+ (required for React Router v7)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Build

```bash
npm run build
```

## Deployment

The project is configured for AWS deployment via GitHub Actions. See `.github/workflows/deploy.yml` for details.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **React Router v7** - Routing with modern features enabled by default:
  - `v7_startTransition` - Wraps state updates in React.startTransition
  - `v7_relativeSplatPath` - Updated relative route resolution
- **Axios** - HTTP client
- **Jest** - Testing framework
- **React Testing Library** - Component testing

## React Router v7

This project uses React Router v7, which requires Node.js 20+. The v7 features (`v7_startTransition` and `v7_relativeSplatPath`) are enabled by default, providing better performance and more predictable routing behavior.

