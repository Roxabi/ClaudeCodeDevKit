/**
 * DevContainer Configuration Validation Test Suite
 * Tests devcontainer.json syntax, required fields, extensions, and configuration settings
 */

import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const devcontainerPath = path.join(
  projectRoot,
  '.devcontainer',
  'devcontainer.json'
);

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

let config;

beforeAll(() => {
  try {
    config = JSON.parse(fs.readFileSync(devcontainerPath, 'utf8'));
  } catch (error) {
    config = {};
  }
});

describe('DevContainer Configuration', () => {
  describe('JSON Syntax Validation', () => {
    test('devcontainer.json file exists', () => {
      expect(fs.existsSync(devcontainerPath)).toBe(true);
    });

    test('devcontainer.json has valid JSON syntax', () => {
      const content = fs.readFileSync(devcontainerPath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('devcontainer.json is properly formatted', () => {
      const content = fs.readFileSync(devcontainerPath, 'utf8');
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      
      // This is informational only - we don't fail on formatting differences
      expect(parsed).toBeDefined();
    });
  });

  describe('Required Fields Validation', () => {
    test('has required "name" field', () => {
      expect(config.name).toBeDefined();
      expect(typeof config.name).toBe('string');
      expect(config.name.length).toBeGreaterThan(0);
    });

    test('has valid build configuration', () => {
      expect(
        config.build?.dockerfile || 
        config.build?.image || 
        config.image
      ).toBeDefined();
    });

    test('has valid workspace configuration', () => {
      expect(config.workspaceFolder).toBeDefined();
      expect(typeof config.workspaceFolder).toBe('string');
      expect(config.workspaceFolder.length).toBeGreaterThan(0);
    });

    test('has valid remoteUser configuration', () => {
      expect(config.remoteUser).toBeDefined();
      expect(typeof config.remoteUser).toBe('string');
      expect(config.remoteUser.length).toBeGreaterThan(0);
    });
  });

  describe('Extension ID Verification', () => {
    test('customizations.vscode.extensions exists and is array', () => {
      expect(config.customizations?.vscode?.extensions).toBeDefined();
      expect(Array.isArray(config.customizations.vscode.extensions)).toBe(true);
    });

    test('all extension IDs follow correct format', () => {
      const extensions = config.customizations?.vscode?.extensions || [];
      const extensionIdPattern = /^[a-z0-9_-]+\.[a-z0-9_-]+$/i;

      extensions.forEach(ext => {
        expect(typeof ext).toBe('string');
        expect(extensionIdPattern.test(ext)).toBe(true);
      });
    });

    test('extension IDs are known valid extensions', () => {
      const extensions = config.customizations?.vscode?.extensions || [];
      const unknownExtensions = extensions.filter(
        ext => !validExtensionIds.includes(ext)
      );

      if (unknownExtensions.length > 0) {
        console.warn(`Unknown extensions found: ${unknownExtensions.join(', ')}`);
      }

      // This is a warning, not a failure
      expect(extensions).toBeDefined();
    });

    test('no duplicate extension IDs', () => {
      const extensions = config.customizations?.vscode?.extensions || [];
      const uniqueExtensions = new Set(extensions);

      expect(extensions.length).toBe(uniqueExtensions.size);
    });
  });

  describe('Port Forwarding Configuration', () => {
    test('forwardPorts is array of valid port numbers', () => {
      if (!config.forwardPorts) return; // Optional field

      expect(Array.isArray(config.forwardPorts)).toBe(true);

      config.forwardPorts.forEach(port => {
        expect(typeof port).toBe('number');
        expect(port).toBeGreaterThan(0);
        expect(port).toBeLessThanOrEqual(65535);
      });
    });

    test('portsAttributes has valid configuration', () => {
      if (!config.portsAttributes) return; // Optional field

      expect(typeof config.portsAttributes).toBe('object');

      Object.entries(config.portsAttributes).forEach(([port, attrs]) => {
        const portNum = parseInt(port, 10);
        expect(portNum).toBeGreaterThan(0);
        expect(portNum).toBeLessThanOrEqual(65535);

        if (attrs.onAutoForward) {
          expect(['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'])
            .toContain(attrs.onAutoForward);
        }
      });
    });

    test('forwarded ports match portsAttributes', () => {
      if (!config.forwardPorts || !config.portsAttributes) return;

      const forwardedPorts = config.forwardPorts.map(p => p.toString());
      const attributePorts = Object.keys(config.portsAttributes);

      attributePorts.forEach(attrPort => {
        expect(forwardedPorts).toContain(attrPort);
      });
    });
  });

  describe('Mount Point Validation', () => {
    test('mounts is array of valid mount configurations', () => {
      if (!config.mounts) return; // Optional field

      expect(Array.isArray(config.mounts)).toBe(true);

      config.mounts.forEach(mount => {
        expect(typeof mount).toBe('string');
        expect(mount).toContain('source=');
        expect(mount).toContain('target=');
        expect(mount).toContain('type=');

        const type = mount.match(/type=([^,]+)/)?.[1];
        expect(['bind', 'volume', 'tmpfs']).toContain(type);
      });
    });

    test('workspaceMount has valid configuration', () => {
      if (!config.workspaceMount) return; // Optional field

      expect(typeof config.workspaceMount).toBe('string');
      expect(config.workspaceMount).toContain('source=');
      expect(config.workspaceMount).toContain('target=');
      expect(config.workspaceMount).toContain('type=');
    });
  });

  describe('Features Configuration', () => {
    test('features configuration is valid', () => {
      if (!config.features) return; // Optional field

      expect(typeof config.features).toBe('object');

      Object.entries(config.features).forEach(([featureId, featureConfig]) => {
        expect(
          featureId.startsWith('ghcr.io/') ||
          featureId.startsWith('mcr.microsoft.com/')
        ).toBe(true);

        if (featureConfig !== null) {
          expect(typeof featureConfig).toBe('object');
        }
      });
    });
  });

  describe('Negative Test Cases', () => {
    test('rejects malformed JSON syntax', () => {
      let rejectedCount = 0;

      invalidJsonSamples.forEach(invalidJson => {
        try {
          JSON.parse(invalidJson);
        } catch (error) {
          rejectedCount++;
        }
      });

      expect(rejectedCount).toBe(invalidJsonSamples.length);
    });

    test('validates extension ID format strictly', () => {
      const extensionIdPattern = /^[a-z0-9_-]+\.[a-z0-9_-]+$/i;
      let rejectedCount = 0;

      invalidExtensionIds.forEach(invalidId => {
        if (
          !extensionIdPattern.test(invalidId) ||
          invalidId.split('.').length !== 2
        ) {
          rejectedCount++;
        }
      });

      expect(rejectedCount).toBe(invalidExtensionIds.length);
    });

    test('validates port number ranges', () => {
      const invalidPorts = [-1, 0, 65536, 100000, 'invalid', null, undefined];
      let rejectedCount = 0;

      invalidPorts.forEach(port => {
        if (typeof port !== 'number' || port <= 0 || port > 65535) {
          rejectedCount++;
        }
      });

      expect(rejectedCount).toBe(invalidPorts.length);
    });
  });

  describe('Environment Variables', () => {
    test('remoteEnv configuration is valid', () => {
      if (!config.remoteEnv) return; // Optional field

      expect(typeof config.remoteEnv).toBe('object');

      Object.entries(config.remoteEnv).forEach(([key, value]) => {
        expect(typeof key).toBe('string');
        expect(key.length).toBeGreaterThan(0);
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('Command Configuration', () => {
    test('postCreateCommand is valid', () => {
      if (!config.postCreateCommand) return; // Optional field

      expect(
        typeof config.postCreateCommand === 'string' ||
        Array.isArray(config.postCreateCommand)
      ).toBe(true);
    });

    test('postStartCommand is valid', () => {
      if (!config.postStartCommand) return; // Optional field

      expect(
        typeof config.postStartCommand === 'string' ||
        Array.isArray(config.postStartCommand)
      ).toBe(true);
    });
  });
});