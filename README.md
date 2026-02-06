# feVttrpgFE

React + TypeScript + Vite frontend for the FeVTTRPG MVP.

## Stack
- React 19 + Vite
- React Router
- Redux Toolkit
- Socket.io client

## Requirements
- Node.js 18+ (20+ recommended)

## Environment

Create a `.env` file in this repo with:

```
VITE_API_BASE="http://localhost:4000/api"
VITE_WS_URL="http://localhost:4000"
```

## Setup
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`

The API server must be running and allow CORS from this frontend origin (default `http://localhost:5173`).

## Scripts
- `npm run dev` — Start Vite dev server
- `npm run start` — Alias for dev
- `npm run build` — Typecheck + build
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build
