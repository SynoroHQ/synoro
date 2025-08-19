# AI Providers Configuration

This bot supports both OpenAI and Moonshot AI providers. You can configure which one to use via environment variables.

## Environment Variables

### Required Variables

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `AI_PROVIDER` - Choose between `"openai"` or `"moonshot"` (defaults to `"openai"`)

### OpenAI Configuration

- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_TRANSCRIBE_MODEL` - Transcription model (defaults to `"whisper-1"`)
- `OPENAI_ADVICE_MODEL` - Text generation model (defaults to `"gpt-4o-mini"`)

### Moonshot AI Configuration

- `MOONSHOT_API_KEY` - Your Moonshot AI API key
- `MOONSHOT_TRANSCRIBE_MODEL` - Transcription model (defaults to `"moonshot-v1"`)
- `MOONSHOT_ADVICE_MODEL` - Text generation model (defaults to `"kimi-k2-0711-preview"`)

### Optional Variables

- `LANGFUSE_SECRET_KEY` - Langfuse secret key for prompt management
- `LANGFUSE_PUBLIC_KEY` - Langfuse public key
- `LANGFUSE_BASEURL` - Langfuse base URL

## Example Configuration

### For OpenAI

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_key_here
OPENAI_TRANSCRIBE_MODEL=whisper-1
OPENAI_ADVICE_MODEL=gpt-4o-mini
```

### For Moonshot AI

```bash
AI_PROVIDER=moonshot
MOONSHOT_API_KEY=your_moonshot_key_here
MOONSHOT_TRANSCRIBE_MODEL=moonshot-v1
MOONSHOT_ADVICE_MODEL=kimi-k2-0711-preview
```

## Switching Providers

To switch between providers, simply change the `AI_PROVIDER` environment variable and ensure the corresponding API key is set. The bot will automatically use the appropriate provider for all AI operations.

## Features

Both providers support:

- Text generation (advice, task parsing, relevance classification)
- Audio transcription
- Consistent API interface
- Telemetry and logging

## Notes

- Moonshot AI uses the base URL `https://api.moonshot.ai/v1`
- The bot automatically selects the appropriate models based on the chosen provider
- All existing functionality remains the same regardless of the provider choice
- Moonshot AI is implemented using OpenAI-compatible API interface via `createOpenAI`
