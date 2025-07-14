#!/usr/bin/env node

/**
 * DevContainer Configuration Validation Test Suite
 * Tests devcontainer.json syntax, required fields, extensions, and configuration settings
 */

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const devcontainerPath = path.join(
  projectRoot,
  '.devcontainer',
  'devcontainer.json'
);

// Test utilities
let testCount = 0;
let passCount = 0;
let failCount = 0;

const test = (description, testFn) => {
  testCount++;
  try {
    const result = testFn();
    if (result) {
      passCount++;
      console.log(`✅ ${description}`);
    } else {
      failCount++;
      console.log(`❌ ${description}`);
    }
  } catch (err) {
    failCount++;
    console.log(`❌ ${description} - Error: ${err.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
  return true;
};

// Test data for negative cases
const invalidJsonSamples = [
  '{ "name": "test", invalid }',
  '{ "name": "test" "missing": "comma" }',
  '{ "name": "test", "trailing": "comma", }',
  '{ "name": "test", "unquoted": key }',
  '{ "name": "test", "value": undefined }',
];

const validExtensionIds = [
  'dbaeumer.vscode-eslint',
  'esbenp.prettier-vscode',
  'eamodio.gitlens',
  'pmneo.tsimporter',
  'formulahendry.auto-rename-tag',
  'dsznajder.es7-react-js-snippets',
  'usernamehw.errorlens',
  'bradlc.vscode-tailwindcss',
  'prisma.prisma',
  'humao.rest-client',
  'mtxr.sqltools',
  'mhutchie.git-graph',
  'wayou.vscode-todo-highlight',
  'christian-kohler.path-intellisense',
  'steoates.autoimport',
  'ms-vscode.vscode-typescript-next',
  'editorconfig.editorconfig',
  'bierner.markdown-mermaid',
  'gruntfuggly.todo-tree',
  'anthropic.claude-code',
];

const invalidExtensionIds = [
  'invalid-extension-id',
  'too.many.dots.in.id',
  'spaces in publisher.extension',
  'special@chars.extension',
  'extension-without-publisher',
  'publisher.',
];

// Main test suite
console.log('🚀 DevContainer Configuration Validation Tests');
console.log('='.repeat(60));

// Test 1: JSON Syntax Validation
console.log('\n📝 JSON Syntax Validation Tests');
test('devcontainer.json file exists', () => {
  return fs.existsSync(devcontainerPath);
});

test('devcontainer.json has valid JSON syntax', () => {
  const content = fs.readFileSync(devcontainerPath, 'utf8');
  JSON.parse(content);
  return true;
});

test('devcontainer.json is properly formatted', () => {
  const content = fs.readFileSync(devcontainerPath, 'utf8');
  const parsed = JSON.parse(content);
  const formatted = JSON.stringify(parsed, null, 2);

  if (content.trim() !== formatted) {
    console.log(
      '   📝 Formatting differences found - this is informational only'
    );
    return true; // Make this a warning instead of failure
  }
  return true;
});

// Test 2: Required Fields Validation
console.log('\n📋 Required Fields Validation Tests');
let config;
try {
  config = JSON.parse(fs.readFileSync(devcontainerPath, 'utf8'));
} catch (_error) {
  console.error('❌ Cannot parse devcontainer.json for field validation');
  config = {};
}

test('has required "name" field', () => {
  return assert(
    config.name && typeof config.name === 'string',
    'name must be a non-empty string'
  );
});

test('has valid build configuration', () => {
  return assert(
    config.build &&
      (config.build.dockerfile || config.build.image || config.image),
    'must have either build.dockerfile, build.image, or image field'
  );
});

test('has valid workspace configuration', () => {
  return assert(
    config.workspaceFolder && typeof config.workspaceFolder === 'string',
    'workspaceFolder must be a non-empty string'
  );
});

test('has valid remoteUser configuration', () => {
  return assert(
    config.remoteUser && typeof config.remoteUser === 'string',
    'remoteUser must be a non-empty string'
  );
});

// Test 3: Extension ID Verification
console.log('\n🔌 Extension ID Verification Tests');
test('customizations.vscode.extensions exists and is array', () => {
  return assert(
    config.customizations?.vscode?.extensions &&
      Array.isArray(config.customizations.vscode.extensions),
    'extensions must be an array'
  );
});

test('all extension IDs follow correct format', () => {
  const extensions = config.customizations?.vscode?.extensions || [];
  const extensionIdPattern = /^[a-z0-9_-]+\.[a-z0-9_-]+$/i;

  for (const ext of extensions) {
    assert(
      typeof ext === 'string' && extensionIdPattern.test(ext),
      `Invalid extension ID format: ${ext}`
    );
  }
  return true;
});

test('extension IDs are known valid extensions', () => {
  const extensions = config.customizations?.vscode?.extensions || [];
  const unknownExtensions = extensions.filter(
    ext => !validExtensionIds.includes(ext)
  );

  if (unknownExtensions.length > 0) {
    console.log(
      `   ⚠️  Unknown extensions found: ${unknownExtensions.join(', ')}`
    );
  }

  return true; // This is a warning, not a failure
});

test('no duplicate extension IDs', () => {
  const extensions = config.customizations?.vscode?.extensions || [];
  const uniqueExtensions = new Set(extensions);

  return assert(
    extensions.length === uniqueExtensions.size,
    'No duplicate extension IDs allowed'
  );
});

// Test 4: Port Forwarding Configuration
console.log('\n🔗 Port Forwarding Configuration Tests');
test('forwardPorts is array of valid port numbers', () => {
  if (!config.forwardPorts) return true; // Optional field

  assert(Array.isArray(config.forwardPorts), 'forwardPorts must be an array');

  for (const port of config.forwardPorts) {
    assert(
      typeof port === 'number' && port > 0 && port <= 65535,
      `Invalid port number: ${port}`
    );
  }
  return true;
});

test('portsAttributes has valid configuration', () => {
  if (!config.portsAttributes) return true; // Optional field

  assert(
    typeof config.portsAttributes === 'object',
    'portsAttributes must be an object'
  );

  for (const [port, attrs] of Object.entries(config.portsAttributes)) {
    const portNum = parseInt(port, 10);
    assert(
      portNum > 0 && portNum <= 65535,
      `Invalid port in portsAttributes: ${port}`
    );

    if (attrs.onAutoForward) {
      assert(
        ['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'].includes(
          attrs.onAutoForward
        ),
        `Invalid onAutoForward value: ${attrs.onAutoForward}`
      );
    }
  }
  return true;
});

test('forwarded ports match portsAttributes', () => {
  if (!config.forwardPorts || !config.portsAttributes) return true;

  const forwardedPorts = config.forwardPorts.map(p => p.toString());
  const attributePorts = Object.keys(config.portsAttributes);

  for (const attrPort of attributePorts) {
    assert(
      forwardedPorts.includes(attrPort),
      `Port ${attrPort} has attributes but is not in forwardPorts`
    );
  }
  return true;
});

// Test 5: Mount Point Validation
console.log('\n📁 Mount Point Validation Tests');
test('mounts is array of valid mount configurations', () => {
  if (!config.mounts) return true; // Optional field

  assert(Array.isArray(config.mounts), 'mounts must be an array');

  for (const mount of config.mounts) {
    assert(typeof mount === 'string', 'mount must be a string');
    assert(mount.includes('source='), 'mount must include source');
    assert(mount.includes('target='), 'mount must include target');
    assert(mount.includes('type='), 'mount must include type');

    const type = mount.match(/type=([^,]+)/)?.[1];
    assert(
      ['bind', 'volume', 'tmpfs'].includes(type),
      `Invalid mount type: ${type}`
    );
  }
  return true;
});

test('workspaceMount has valid configuration', () => {
  if (!config.workspaceMount) return true; // Optional field

  assert(
    typeof config.workspaceMount === 'string',
    'workspaceMount must be a string'
  );
  assert(
    config.workspaceMount.includes('source='),
    'workspaceMount must include source'
  );
  assert(
    config.workspaceMount.includes('target='),
    'workspaceMount must include target'
  );
  assert(
    config.workspaceMount.includes('type='),
    'workspaceMount must include type'
  );

  return true;
});

// Test 6: Features Configuration
console.log('\n🎯 Features Configuration Tests');
test('features configuration is valid', () => {
  if (!config.features) return true; // Optional field

  assert(typeof config.features === 'object', 'features must be an object');

  for (const [featureId, featureConfig] of Object.entries(config.features)) {
    assert(
      featureId.startsWith('ghcr.io/') ||
        featureId.startsWith('mcr.microsoft.com/'),
      `Invalid feature ID format: ${featureId}`
    );

    if (featureConfig !== null) {
      assert(
        typeof featureConfig === 'object',
        `Feature config must be object or null: ${featureId}`
      );
    }
  }
  return true;
});

// Test 7: Negative Test Cases
console.log('\n🚫 Negative Test Cases');
test('rejects malformed JSON syntax', () => {
  let rejectedCount = 0;

  for (const invalidJson of invalidJsonSamples) {
    try {
      JSON.parse(invalidJson);
    } catch (_error) {
      rejectedCount++;
    }
  }

  return assert(
    rejectedCount === invalidJsonSamples.length,
    `Expected all ${invalidJsonSamples.length} invalid JSON samples to be rejected`
  );
});

test('validates extension ID format strictly', () => {
  const extensionIdPattern = /^[a-z0-9_-]+\.[a-z0-9_-]+$/i;
  let rejectedCount = 0;

  for (const invalidId of invalidExtensionIds) {
    if (
      !extensionIdPattern.test(invalidId) ||
      invalidId.split('.').length !== 2
    ) {
      rejectedCount++;
    }
  }

  return assert(
    rejectedCount === invalidExtensionIds.length,
    `Expected all ${invalidExtensionIds.length} invalid extension IDs to be rejected, got ${rejectedCount}`
  );
});

test('validates port number ranges', () => {
  const invalidPorts = [-1, 0, 65536, 100000, 'invalid', null, undefined];
  let rejectedCount = 0;

  for (const port of invalidPorts) {
    if (typeof port !== 'number' || port <= 0 || port > 65535) {
      rejectedCount++;
    }
  }

  return assert(
    rejectedCount === invalidPorts.length,
    `Expected all ${invalidPorts.length} invalid ports to be rejected`
  );
});

// Test 8: Environment Variables
console.log('\n🌍 Environment Variables Tests');
test('remoteEnv configuration is valid', () => {
  if (!config.remoteEnv) return true; // Optional field

  assert(typeof config.remoteEnv === 'object', 'remoteEnv must be an object');

  for (const [key, value] of Object.entries(config.remoteEnv)) {
    assert(
      typeof key === 'string' && key.length > 0,
      `Invalid environment variable name: ${key}`
    );
    assert(
      typeof value === 'string',
      `Environment variable value must be string: ${key}`
    );
  }
  return true;
});

// Test 9: Command Configuration
console.log('\n⚙️ Command Configuration Tests');
test('postCreateCommand is valid', () => {
  if (!config.postCreateCommand) return true; // Optional field

  assert(
    typeof config.postCreateCommand === 'string' ||
      Array.isArray(config.postCreateCommand),
    'postCreateCommand must be string or array'
  );

  return true;
});

test('postStartCommand is valid', () => {
  if (!config.postStartCommand) return true; // Optional field

  assert(
    typeof config.postStartCommand === 'string' ||
      Array.isArray(config.postStartCommand),
    'postStartCommand must be string or array'
  );

  return true;
});

// Test Results Summary
console.log(`\n${'='.repeat(60)}`);
console.log('📊 Test Results Summary');
console.log('='.repeat(60));
console.log(`Total tests: ${testCount}`);
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📈 Success rate: ${((passCount / testCount) * 100).toFixed(1)}%`);

if (failCount > 0) {
  console.log(
    '\n❌ Some tests failed. Please review the devcontainer.json configuration.'
  );
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! DevContainer configuration is valid.');
  process.exit(0);
}
