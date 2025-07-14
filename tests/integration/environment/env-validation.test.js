#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 *
 * This script validates that all required environment variables are loaded correctly
 * from the .env file for local development.
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import chalk from 'chalk';
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

console.log(chalk.blue.bold('🔍 Environment Variables Validation\n'));

// Check if .env file exists
const envPath = path.join(__dirname, '../../../.env');
if (!fs.existsSync(envPath)) {
  console.error(chalk.red('❌ .env file not found!'));
  process.exit(1);
}

console.log(chalk.green('✅ .env file found'));

let validationErrors = 0;

// Validate required environment variables
console.log(chalk.blue('\n📋 Required Environment Variables:'));
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar.name];

  if (!value) {
    console.log(chalk.red(`❌ ${envVar.name}: NOT SET`));
    validationErrors++;
  } else if (envVar.expected && value !== envVar.expected) {
    console.log(
      chalk.yellow(
        `⚠️  ${envVar.name}: "${value}" (expected: "${envVar.expected}")`
      )
    );
    console.log(chalk.gray(`   Description: ${envVar.description}`));
  } else {
    console.log(chalk.green(`✅ ${envVar.name}: "${value}"`));
    console.log(chalk.gray(`   Description: ${envVar.description}`));
  }
});

// Check optional environment variables
console.log(chalk.blue('\n📋 Optional Environment Variables:'));
optionalEnvVars.forEach(envVarName => {
  const value = process.env[envVarName];

  if (!value || value === '') {
    console.log(chalk.gray(`○  ${envVarName}: NOT SET`));
  } else {
    console.log(chalk.green(`✅ ${envVarName}: "${value}"`));
  }
});

// Test database URL parsing
console.log(chalk.blue('\n🔗 Database URL Validation:'));
try {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const url = new URL(dbUrl);
    console.log(chalk.green(`✅ Database URL parsed successfully:`));
    console.log(chalk.gray(`   Protocol: ${url.protocol}`));
    console.log(chalk.gray(`   Username: ${url.username}`));
    console.log(
      chalk.gray(`   Password: ${url.password ? '[HIDDEN]' : 'NOT SET'}`)
    );
    console.log(chalk.gray(`   Host: ${url.hostname}`));
    console.log(chalk.gray(`   Port: ${url.port}`));
    console.log(chalk.gray(`   Database: ${url.pathname.substring(1)}`));
  } else {
    console.log(chalk.red('❌ DATABASE_URL not set'));
    validationErrors++;
  }
} catch (error) {
  console.log(chalk.red(`❌ Invalid DATABASE_URL format: ${error.message}`));
  validationErrors++;
}

// Test Redis URL parsing
console.log(chalk.blue('\n🔗 Redis URL Validation:'));
try {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const url = new URL(redisUrl);
    console.log(chalk.green(`✅ Redis URL parsed successfully:`));
    console.log(chalk.gray(`   Protocol: ${url.protocol}`));
    console.log(chalk.gray(`   Host: ${url.hostname}`));
    console.log(chalk.gray(`   Port: ${url.port}`));
  } else {
    console.log(chalk.red('❌ REDIS_URL not set'));
    validationErrors++;
  }
} catch (error) {
  console.log(chalk.red(`❌ Invalid REDIS_URL format: ${error.message}`));
  validationErrors++;
}

// Summary
console.log(chalk.blue('\n📊 Validation Summary:'));
if (validationErrors === 0) {
  console.log(
    chalk.green.bold('🎉 All environment variables are configured correctly!')
  );
  console.log(chalk.green('✅ Ready for local development'));
  process.exit(0);
} else {
  console.log(
    chalk.red.bold(`❌ ${validationErrors} validation error(s) found`)
  );
  console.log(chalk.red('Please check your .env file configuration'));
  process.exit(1);
}
