# API Tests

This directory contains tests for the API package.

## Structure

```
tests/
├── agents/            # Agent-related tests
│   ├── agent-manager.test.ts
│   ├── exports.test.ts
│   └── event-processor-agent.test.ts
└── README.md         # This file
```

## Running Tests

Tests can be run from the API package directory:

```bash
cd packages/api
bun test
```

## Test Organization

- **Agent Tests**: Tests for agent functionality including AgentManager, EventProcessorAgent, and exports
- **Unit Tests**: Individual component tests for isolated functionality testing

## Adding New Tests

1. Create test files with `.test.ts` or `.spec.ts` extension
2. Place them in the appropriate subdirectory
3. Update imports to use relative paths to the source files
4. Run tests to ensure they pass
