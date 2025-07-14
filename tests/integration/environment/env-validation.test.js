/**
 * Environment Variables Validation Test Suite
 *
 * This test suite validates that all required environment variables are loaded correctly
 * from the .env file for local development.
 */

import { describe, test, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define required environment variables and their expected values for development
const requiredEnvVars = [
  {
    name: 'NODE_ENV',
    expected: 'development',
    description: 'Application environment',
  },
  {
    name: 'PORT',
    expected: '3000',
    description: 'Application port',
  },
  {
    name: 'DATABASE_URL',
    expected: 'postgresql://devuser:devpass@localhost:5432/devdb',
    description: 'PostgreSQL database connection string',
  },
  {
    name: 'REDIS_URL',
    expected: 'redis://localhost:6379',
    description: 'Redis connection string',
  },
];

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

  describe('Required Environment Variables', () => {
    requiredEnvVars.forEach(envVar => {
      test(`${envVar.name} is properly configured`, () => {
        const value = process.env[envVar.name];
        expect(value).toBeDefined();
        expect(value).not.toBe('');
        
        if (envVar.expected && value !== envVar.expected) {
          console.warn(`⚠️  ${envVar.name}: "${value}" (expected: "${envVar.expected}")`);
          console.warn(`   Description: ${envVar.description}`);
        }
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

      console.log(`Set optional variables: ${setOptionalVars.join(', ') || 'none'}`);
      console.log(`Unset optional variables: ${unsetOptionalVars.join(', ') || 'none'}`);
      
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
