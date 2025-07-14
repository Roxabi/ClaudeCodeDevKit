#!/usr/bin/env node

/**
 * Container Runtime Environment Test Suite
 * Tests container startup, user permissions, workspace mounting, and environment configuration
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

// Test utilities
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// Test functions
async function testNodeUser() {
  try {
    const { stdout: whoami } = await execAsync('whoami');
    const currentUser = whoami.trim();
    
    logTest('Current user is "node"', currentUser === 'node', 
      currentUser !== 'node' ? `Expected "node", got "${currentUser}"` : '');
    
    const { stdout: id } = await execAsync('id -u');
    const userId = id.trim();
    
    logTest('User ID is non-root (not 0)', userId !== '0', 
      userId === '0' ? 'Running as root user (security risk)' : `Running as UID ${userId}`);
    
    const { stdout: groups } = await execAsync('groups');
    const userGroups = groups.trim();
    
    logTest('User has proper group membership', userGroups.includes('node'), 
      `User groups: ${userGroups}`);
    
  } catch (error) {
    logTest('Node user validation', false, `Error: ${error.message}`);
  }
}

async function testWorkspaceMount() {
  try {
    const workspaceExists = fs.existsSync('/workspace');
    logTest('Workspace directory exists at /workspace', workspaceExists);
    
    if (workspaceExists) {
      const stats = fs.statSync('/workspace');
      logTest('Workspace is a directory', stats.isDirectory());
      
      // Test write permissions
      const testFile = '/workspace/.runtime-test-temp';
      try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        logTest('Workspace has write permissions', true);
      } catch (error) {
        logTest('Workspace has write permissions', false, `Write test failed: ${error.message}`);
      }
      
      // Check if workspace contains expected files
      const expectedFiles = ['package.json', '.devcontainer'];
      for (const file of expectedFiles) {
        const filePath = path.join('/workspace', file);
        const exists = fs.existsSync(filePath);
        logTest(`Expected file/directory exists: ${file}`, exists);
      }
    }
  } catch (error) {
    logTest('Workspace mount validation', false, `Error: ${error.message}`);
  }
}

async function testEnvironmentVariables() {
  try {
    const requiredEnvVars = {
      'NODE_OPTIONS': '--max-old-space-size=4096',
      'CLAUDE_CONFIG_DIR': '/home/node/.claude',
      'POWERLEVEL9K_DISABLE_GITSTATUS': 'true'
    };
    
    for (const [varName, expectedValue] of Object.entries(requiredEnvVars)) {
      const actualValue = process.env[varName];
      logTest(`Environment variable ${varName} is set correctly`, 
        actualValue === expectedValue, 
        `Expected "${expectedValue}", got "${actualValue}"`);
    }
    
    // Test timezone configuration
    const tz = process.env.TZ;
    logTest('TZ environment variable is set', tz !== undefined, 
      `TZ = ${tz || 'undefined'}`);
    
    // Test HOME directory
    const home = process.env.HOME;
    logTest('HOME directory is set to /home/node', home === '/home/node', 
      `HOME = ${home}`);
    
  } catch (error) {
    logTest('Environment variables validation', false, `Error: ${error.message}`);
  }
}

async function testPersistentVolumes() {
  try {
    // Test Claude config directory
    const claudeConfigDir = '/home/node/.claude';
    const claudeConfigExists = fs.existsSync(claudeConfigDir);
    logTest('Claude config directory exists', claudeConfigExists);
    
    if (claudeConfigExists) {
      const stats = fs.statSync(claudeConfigDir);
      logTest('Claude config directory is writable', stats.isDirectory());
      
      // Test write access
      const testFile = path.join(claudeConfigDir, '.runtime-test-temp');
      try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        logTest('Claude config directory has write permissions', true);
      } catch (error) {
        logTest('Claude config directory has write permissions', false, 
          `Write test failed: ${error.message}`);
      }
    }
    
    // Test command history directory
    const historyDir = '/commandhistory';
    const historyExists = fs.existsSync(historyDir);
    logTest('Command history directory exists', historyExists);
    
    if (historyExists) {
      try {
        const testFile = path.join(historyDir, '.runtime-test-temp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        logTest('Command history directory has write permissions', true);
      } catch (error) {
        logTest('Command history directory has write permissions', false, 
          `Write test failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    logTest('Persistent volumes validation', false, `Error: ${error.message}`);
  }
}

async function testShellConfiguration() {
  try {
    // Test default shell
    const { stdout: shell } = await execAsync('echo $SHELL');
    const defaultShell = shell.trim();
    logTest('Default shell is zsh', defaultShell.endsWith('zsh'), 
      `Default shell: ${defaultShell}`);
    
    // Test zsh availability
    try {
      await execAsync('which zsh');
      logTest('Zsh is available', true);
    } catch (error) {
      logTest('Zsh is available', false, 'Zsh not found in PATH');
    }
    
    // Test bash availability
    try {
      await execAsync('which bash');
      logTest('Bash is available', true);
    } catch (error) {
      logTest('Bash is available', false, 'Bash not found in PATH');
    }
    
    // Test zsh configuration
    const zshrcPath = '/home/node/.zshrc';
    if (fs.existsSync(zshrcPath)) {
      const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
      logTest('Zsh configuration exists', true);
      
      // Check for task-master alias
      const hasTaskMasterAlias = zshrcContent.includes('alias tm="task-master"');
      logTest('Task-master alias is configured', hasTaskMasterAlias);
    } else {
      logTest('Zsh configuration exists', false, '.zshrc not found');
    }
    
  } catch (error) {
    logTest('Shell configuration validation', false, `Error: ${error.message}`);
  }
}

async function testNodeJSEnvironment() {
  try {
    // Test Node.js version
    const { stdout: nodeVersion } = await execAsync('node --version');
    const version = nodeVersion.trim();
    logTest('Node.js is available', version.startsWith('v'), 
      `Node.js version: ${version}`);
    
    // Test npm availability
    try {
      const { stdout: npmVersion } = await execAsync('npm --version');
      logTest('npm is available', true, `npm version: ${npmVersion.trim()}`);
    } catch (error) {
      logTest('npm is available', false, 'npm not found');
    }
    
    // Test global packages
    try {
      const { stdout: globalPackages } = await execAsync('npm list -g --depth=0');
      const hasTaskMaster = globalPackages.includes('task-master');
      logTest('Task-master is globally installed', hasTaskMaster);
      
      const hasCcusage = globalPackages.includes('ccusage');
      logTest('ccusage is globally installed', hasCcusage);
    } catch (error) {
      logTest('Global packages check', false, `Error checking global packages: ${error.message}`);
    }
    
  } catch (error) {
    logTest('Node.js environment validation', false, `Error: ${error.message}`);
  }
}

async function testDockerAccess() {
  try {
    // Test Docker socket access
    const dockerSocket = '/var/run/docker.sock';
    const socketExists = fs.existsSync(dockerSocket);
    logTest('Docker socket is mounted', socketExists);
    
    if (socketExists) {
      try {
        const { stdout } = await execAsync('docker --version');
        logTest('Docker CLI is available', true, `Docker: ${stdout.trim()}`);
      } catch (error) {
        logTest('Docker CLI is available', false, 'Docker command not found');
      }
      
      try {
        await execAsync('docker ps', { timeout: 5000 });
        logTest('Docker daemon is accessible', true);
      } catch (error) {
        logTest('Docker daemon is accessible', false, 
          'Cannot connect to Docker daemon (this may be expected in some environments)');
      }
    }
    
  } catch (error) {
    logTest('Docker access validation', false, `Error: ${error.message}`);
  }
}

async function testSystemResources() {
  try {
    // Test memory limits
    const { stdout: meminfo } = await execAsync('cat /proc/meminfo | head -5');
    logTest('Memory information is accessible', true, 
      `Memory info available: ${meminfo.split('\n')[0]}`);
    
    // Test CPU information
    const { stdout: cpuinfo } = await execAsync('nproc');
    const cpuCount = parseInt(cpuinfo.trim());
    logTest('CPU information is accessible', cpuCount > 0, 
      `CPU cores: ${cpuCount}`);
    
    // Test disk space
    const { stdout: diskSpace } = await execAsync('df -h /workspace');
    logTest('Disk space information is accessible', true, 
      `Workspace disk usage available`);
    
  } catch (error) {
    logTest('System resources validation', false, `Error: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Container Runtime Environment Test Suite');
  console.log('============================================\n');
  
  logInfo('Testing user permissions and configuration...');
  await testNodeUser();
  console.log();
  
  logInfo('Testing workspace mounting and permissions...');
  await testWorkspaceMount();
  console.log();
  
  logInfo('Testing environment variables...');
  await testEnvironmentVariables();
  console.log();
  
  logInfo('Testing persistent volumes...');
  await testPersistentVolumes();
  console.log();
  
  logInfo('Testing shell configuration...');
  await testShellConfiguration();
  console.log();
  
  logInfo('Testing Node.js environment...');
  await testNodeJSEnvironment();
  console.log();
  
  logInfo('Testing Docker access...');
  await testDockerAccess();
  console.log();
  
  logInfo('Testing system resources...');
  await testSystemResources();
  console.log();
  
  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   • ${test.name}${test.details ? `: ${test.details}` : ''}`);
      });
  }
  
  console.log(`\n🎯 Success Rate: ${(testResults.passed / (testResults.passed + testResults.failed) * 100).toFixed(1)}%`);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

export { runTests, testResults };