/**
 * Environment Variables Validation Test Suite
 *
 * This test suite validates that all required environment variables are loaded correctly
 * from the .env file for local development.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { beforeAll, describe, expect, test } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional environment variables to check
const optionalEnvVars = [
  'API_KEY',
  'SECRET_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'ENABLE_FEATURE_X',
  'DEBUG_MODE',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'SENTRY_DSN',
  'ANALYTICS_ID',
];

const envPath = path.join(__dirname, '../../../.env');

beforeAll(() => {
  // Load environment variables from .env file
  dotenv.config();
});

describe('Environment Variables Validation', () => {
  describe('Environment File Existence', () => {
    test('.env file exists', () => {
      expect(fs.existsSync(envPath)).toBe(true);
    });
  });
});
describe('Optional Environment Variables', () => {
  test('optional environment variables are tracked', () => {
    const setOptionalVars = [];
    const unsetOptionalVars = [];

    optionalEnvVars.forEach(envVarName => {
      const value = process.env[envVarName];
      if (value && value !== '') {
        setOptionalVars.push(envVarName);
      } else {
        unsetOptionalVars.push(envVarName);
      }
    });

    console.log(
      `Set optional variables: ${setOptionalVars.join(', ') || 'none'}`
    );
    console.log(
      `Unset optional variables: ${unsetOptionalVars.join(', ') || 'none'}`
    );

    // This test always passes, it's just for tracking
    expect(optionalEnvVars.length).toBeGreaterThan(0);
  });
});

describe('Database URL Validation', () => {
  test('DATABASE_URL is properly formatted', () => {
    const dbUrl = process.env.DATABASE_URL;
    expect(dbUrl).toBeDefined();
    expect(dbUrl).not.toBe('');

    expect(() => {
      const url = new URL(dbUrl);
      expect(url.protocol).toBeDefined();
      expect(url.username).toBeDefined();
      expect(url.hostname).toBeDefined();
      expect(url.port).toBeDefined();
      expect(url.pathname.substring(1)).toBeDefined();
    }).not.toThrow();
  });

  describe('Redis URL Validation', () => {
    test('REDIS_URL is properly formatted', () => {
      const redisUrl = process.env.REDIS_URL;
      expect(redisUrl).toBeDefined();
      expect(redisUrl).not.toBe('');

      expect(() => {
        const url = new URL(redisUrl);
        expect(url.protocol).toBeDefined();
        expect(url.hostname).toBeDefined();
        expect(url.port).toBeDefined();
      }).not.toThrow();
    });
  });
});
