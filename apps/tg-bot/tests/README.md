# Telegram Bot Tests

This directory contains tests for the Telegram bot application.

## Structure

```
tests/
├── telegram-utils.test.ts    # Tests for telegram utility functions
└── README.md                # This file
```

## Running Tests

Tests can be run from the tg-bot app directory:

```bash
cd apps/tg-bot
bun test
```

## Test Organization

- **Utility Tests**: Tests for telegram utility functions like markdown escaping and text formatting
- **Unit Tests**: Individual component tests for isolated functionality testing

## Adding New Tests

1. Create test files with `.test.ts` or `.spec.ts` extension
2. Place them in the appropriate subdirectory
3. Update imports to use relative paths to the source files
4. Run tests to ensure they pass
