# Telegram Bot

A Telegram bot that supports both OpenAI and Moonshot AI providers for AI-powered conversations and task management.

## Features

- **Multi-AI Provider Support**: Switch between OpenAI and Moonshot AI
- **Voice Transcription**: Convert voice messages to text
- **Task Parsing**: Extract structured tasks from natural language
- **Relevance Classification**: Determine if messages are relevant for logging
- **Telemetry**: Built-in observability with Langfuse support

## Quick Start

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up environment variables**:

   ```bash
   # Required
   TELEGRAM_BOT_TOKEN=your_bot_token
   AI_PROVIDER=openai  # or "moonshot"

   # OpenAI (if using OpenAI)
   OPENAI_API_KEY=your_openai_key

   # Moonshot AI (if using Moonshot)
   MOONSHOT_API_KEY=your_moonshot_key
   ```

3. **Run the bot**:
   ```bash
   bun run dev    # Development mode
   bun run start  # Production mode
   ```

## AI Providers

### OpenAI

- **Default Provider**: Uses OpenAI's API
- **Models**: GPT-4o-mini, Whisper-1
- **Environment Variables**: `OPENAI_API_KEY`, `OPENAI_TRANSCRIBE_MODEL`, `OPENAI_ADVICE_MODEL`

### Moonshot AI

- **Alternative Provider**: Uses Moonshot AI's API
- **Models**: Kimi K2, Moonshot transcription models
- **Environment Variables**: `MOONSHOT_API_KEY`, `MOONSHOT_TRANSCRIBE_MODEL`, `MOONSHOT_ADVICE_MODEL`
- **Base URL**: `https://api.moonshot.ai/v1`
- **Note**: Audio transcription currently falls back to OpenAI due to API limitations

## Switching Providers

To switch between AI providers, simply change the `AI_PROVIDER` environment variable:

```bash
# For OpenAI
AI_PROVIDER=openai

# For Moonshot AI
AI_PROVIDER=moonshot
```

The bot will automatically use the appropriate provider for all AI operations.

## Development

- **Type Checking**: `bun run typecheck`
- **Linting**: `bun run lint`
- **Build**: `bun run build`

## Architecture

The bot uses a modular architecture with:

- **Handlers**: Process different message types (text, audio, other)
- **Services**: AI operations, database operations, relevance analysis
- **Providers**: Abstracted AI provider interface supporting multiple backends

## Documentation

For detailed configuration information, see [AI_PROVIDERS.md](./AI_PROVIDERS.md).
