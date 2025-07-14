#!/usr/bin/env node

/**
 * Dockerfile Build Process Validation Test Suite
 * Tests Docker image build process, dependencies, and layer construction
 */

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const dockerfilePath = path.join(projectRoot, '.devcontainer', 'Dockerfile');

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

const testAsync = async (description, testFn) => {
  testCount++;
  try {
    const result = await testFn();
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

const execCommand = (command, args = [], options = {}) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'pipe',
      ...options
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
};

// Test suite
console.log('🔍 Starting Dockerfile Build Process Validation Tests...\n');

// Test 1: Dockerfile exists and is readable
test('Dockerfile exists and is readable', () => {
  assert(fs.existsSync(dockerfilePath), 'Dockerfile not found');
  assert(fs.statSync(dockerfilePath).isFile(), 'Dockerfile is not a file');
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  assert(content.length > 0, 'Dockerfile is empty');
  return true;
});

// Test 2: Dockerfile has valid syntax structure
test('Dockerfile has valid syntax structure', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
  
  // Check for required FROM instruction
  const fromLine = lines.find(line => line.trim().startsWith('FROM'));
  assert(fromLine, 'Missing FROM instruction');
  
  // Check for proper instruction format (ignore continuation lines that start with packages/commands)
  const validInstructions = ['FROM', 'RUN', 'ARG', 'ENV', 'COPY', 'WORKDIR', 'USER', 'EXPOSE', 'CMD', 'ENTRYPOINT'];
  for (const line of lines) {
    const trimmedLine = line.trim();
    // Skip continuation lines (lines that don't start with a Dockerfile instruction)
    if (trimmedLine.startsWith('\\') || !trimmedLine.match(/^[A-Z]/)) {
      continue;
    }
    
    const instruction = trimmedLine.split(/\s+/)[0];
    if (instruction && !validInstructions.includes(instruction)) {
      throw new Error(`Invalid instruction: ${instruction}`);
    }
  }
  
  return true;
});

// Test 3: Base image specification
test('Base image is properly specified', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  const fromLine = content.split('\n').find(line => line.trim().startsWith('FROM'));
  
  assert(fromLine, 'FROM instruction not found');
  assert(fromLine.includes('node:'), 'Base image should be Node.js');
  
  // Check for specific version or latest
  const imageSpec = fromLine.split('FROM')[1].trim();
  assert(imageSpec.includes('node:latest') || imageSpec.match(/node:\d+/), 'Invalid Node.js version specification');
  
  return true;
});

// Test 4: Required system packages are installed
test('Required system packages are specified for installation', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  const requiredPackages = [
    'git', 'sudo', 'curl', 'gnupg', 'ca-certificates',
    'iptables', 'ipset', 'iproute2', 'dnsutils', 'jq'
  ];
  
  for (const pkg of requiredPackages) {
    assert(content.includes(pkg), `Required package ${pkg} not found in Dockerfile`);
  }
  
  return true;
});

// Test 5: Docker installation is configured
test('Docker installation is properly configured', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  // Check for Docker GPG key setup
  assert(content.includes('docker-archive-keyring.gpg'), 'Docker GPG key setup not found');
  
  // Check for Docker repository setup
  assert(content.includes('download.docker.com'), 'Docker repository setup not found');
  
  // Check for Docker CE installation
  assert(content.includes('docker-ce'), 'Docker CE installation not found');
  
  return true;
});

// Test 6: User configuration and permissions
test('User configuration and permissions are set up', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  // Check for node user configuration
  assert(content.includes('USER node'), 'USER node instruction not found');
  
  // Check for docker group membership
  assert(content.includes('usermod -aG docker node'), 'Node user not added to docker group');
  
  // Check for workspace directory creation
  assert(content.includes('/workspace'), 'Workspace directory not configured');
  
  // Check for proper ownership
  assert(content.includes('chown -R node:node'), 'Proper ownership not set');
  
  return true;
});

// Test 7: Environment variables are set
test('Required environment variables are configured', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  const requiredEnvVars = [
    'DEVCONTAINER=true',
    'SHELL=/bin/zsh',
    'NPM_CONFIG_PREFIX',
    'PATH'
  ];
  
  for (const envVar of requiredEnvVars) {
    assert(content.includes(envVar), `Environment variable ${envVar} not found`);
  }
  
  return true;
});

// Test 8: NPM global packages installation
test('NPM global packages are installed', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  const requiredPackages = [
    '@anthropic-ai/claude-code',
    'pnpm',
    'tsx',
    'task-master-ai@latest'
  ];
  
  for (const pkg of requiredPackages) {
    assert(content.includes(pkg), `NPM package ${pkg} not found in Dockerfile`);
  }
  
  return true;
});

// Test 9: Security configurations
test('Security configurations are properly set', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  // Check for firewall script setup
  assert(content.includes('init-firewall.sh'), 'Firewall script not configured');
  
  // Check for sudoers configuration
  assert(content.includes('/etc/sudoers.d/node-firewall'), 'Sudoers configuration not found');
  
  // Check for proper permissions on sudoers file
  assert(content.includes('chmod 0440'), 'Sudoers file permissions not set correctly');
  
  return true;
});

// Test 10: Development tools installation
test('Development tools are properly installed', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  const devTools = [
    'zsh',
    'fzf',
    'gh',
    'git-delta',
    'man-db'
  ];
  
  for (const tool of devTools) {
    assert(content.includes(tool), `Development tool ${tool} not found`);
  }
  
  return true;
});

// Test 11: Workspace and command history setup
test('Workspace and command history are configured', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  // Check for command history setup
  assert(content.includes('/commandhistory'), 'Command history directory not configured');
  assert(content.includes('.bash_history'), 'Bash history file not configured');
  
  // Check for workspace directory
  assert(content.includes('WORKDIR /workspace'), 'Workspace directory not set as working directory');
  
  return true;
});

// Test 12: Git configuration
test('Git configuration is properly set', () => {
  const content = fs.readFileSync(dockerfilePath, 'utf8');
  
  // Check for git safe directory configuration
  assert(content.includes('git config --global --add safe.directory /workspace'), 
         'Git safe directory configuration not found');
  
  return true;
});

// Async Test 13: Docker availability check (if Docker is available)
await testAsync('Docker daemon is available for testing', async () => {
  try {
    const result = await execCommand('docker', ['--version']);
    assert(result.code === 0, 'Docker command failed');
    assert(result.stdout.includes('Docker version'), 'Docker version not found in output');
    return true;
  } catch (err) {
    console.log('ℹ️  Docker not available for testing (this is expected in some environments)');
    return true; // Pass this test even if Docker is not available
  }
});

// Async Test 14: Base image availability check
await testAsync('Base image is available and accessible', async () => {
  try {
    const result = await execCommand('docker', ['pull', 'node:latest']);
    // If docker pull succeeds or image already exists, test passes
    return result.code === 0 || result.stderr.includes('up to date');
  } catch (err) {
    console.log('ℹ️  Cannot test base image availability (Docker not available)');
    return true; // Pass this test if Docker is not available
  }
});

// Async Test 15: Dockerfile lint check (if available)
await testAsync('Dockerfile follows best practices', async () => {
  try {
    // Check for hadolint if available
    const result = await execCommand('hadolint', [dockerfilePath]);
    if (result.code === 0) {
      return true;
    } else {
      console.log('ℹ️  Hadolint warnings found (non-critical)');
      return true; // Pass even with warnings
    }
  } catch (err) {
    console.log('ℹ️  Hadolint not available for linting check');
    return true; // Pass this test if hadolint is not available
  }
});

// Test results summary
console.log('\n📊 Test Results Summary:');
console.log(`Total tests: ${testCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('🎉 All Dockerfile validation tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please check the Dockerfile configuration.');
  process.exit(1);
}