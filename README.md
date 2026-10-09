# DoubleBrain

An AI-powered body-doubling desktop assistant for focus and accountability. Mimic the productivity boost of working alongside someone by getting proactive check-ins from Claude.

## Features

- **Goal Setting**: Set daily focus goals
- **Floating Window**: Always-on-top companion that stays out of the way
- **Smart Check-ins**: Claude AI checks in every 20 minutes with supportive messages
- **Screen Awareness**: Screenshots for context-aware check-ins
- **Voice Output**: Hear your check-ins spoken aloud (Web Speech API)
- **Focus Mode**: Toggle accountability on/off as needed

## Setup

### Prerequisites
- Node.js 18+
- Claude API key (free tier available at https://console.anthropic.com)

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env.local`
2. Add your Claude API key:
```bash
echo "VITE_CLAUDE_API_KEY=your-key-here" > .env.local
```

**Important**: `.env.local` is gitignored. Never commit your API key.

### Development

```bash
npm run dev
```

This starts the dev server and opens the Electron app.

## Architecture

- **Frontend**: React + Vite
- **Desktop**: Electron
- **AI Brain**: Claude API
- **Storage**: localStorage (goals), JSON files (persistent state)

## Security

- No API keys committed to git
- Screenshots stored locally only (never uploaded)
- All requests use environment variables
- See `.env.example` for required configuration

## Roadmap

- Phase 1: ✅ Floating window + goal persistence
- Phase 2: 🚧 Screenshot capture + Claude check-ins
- Phase 3: Voice interaction
- Phase 4: Data-driven check-in frequency based on focus patterns

## License

MIT
