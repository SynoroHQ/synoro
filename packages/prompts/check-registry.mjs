import { PROMPT_KEYS, registry } from './dist/index.js';

console.log('=== PROMPT_KEYS vs Registry ===');
const promptKeys = Object.values(PROMPT_KEYS);
const registryKeys = Object.keys(registry);

console.log('\n--- Keys in PROMPT_KEYS but missing in registry ---');
promptKeys.forEach(key => {
  if (!(key in registry)) {
    console.log(`✗ ${key}`);
  }
});

console.log('\n--- Keys in registry but missing in PROMPT_KEYS ---');
registryKeys.forEach(key => {
  if (!promptKeys.includes(key)) {
    console.log(`✗ ${key}`);
  }
});

console.log('\n--- Matching keys ---');
promptKeys.forEach(key => {
  if (key in registry) {
    console.log(`✓ ${key}`);
  }
});

console.log(`\nTotal PROMPT_KEYS: ${promptKeys.length}`);
console.log(`Total registry keys: ${registryKeys.length}`);
console.log(`Matching: ${promptKeys.filter(key => key in registry).length}`);

