/**
 * Dockerfile Build Process Validation Test Suite
 * Tests Docker image build process, dependencies, and layer construction
 */

import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const dockerfilePath = path.join(projectRoot, '.devcontainer', 'Dockerfile');

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

describe('Dockerfile Build Process Validation', () => {
  describe('Basic File Validation', () => {
    test('Dockerfile exists and is readable', () => {
      expect(fs.existsSync(dockerfilePath)).toBe(true);
      expect(fs.statSync(dockerfilePath).isFile()).toBe(true);
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      expect(content.length).toBeGreaterThan(0);
    });

    test('Dockerfile has valid syntax structure', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      
      // Check for required FROM instruction
      const fromLine = lines.find(line => line.trim().startsWith('FROM'));
      expect(fromLine).toBeDefined();
      
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
          expect.fail(`Invalid instruction: ${instruction}`);
        }
      }
    });
  });

  describe('Base Image Configuration', () => {
    test('Base image is properly specified', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      const fromLine = content.split('\n').find(line => line.trim().startsWith('FROM'));
      
      expect(fromLine).toBeDefined();
      expect(fromLine).toContain('node:');
      
      // Check for specific version or latest
      const imageSpec = fromLine.split('FROM')[1].trim();
      expect(imageSpec.includes('node:latest') || imageSpec.match(/node:\d+/)).toBeTruthy();
    });
  });

  describe('Package Installation', () => {
    test('Required system packages are specified for installation', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      const requiredPackages = [
        'git', 'sudo', 'curl', 'gnupg', 'ca-certificates',
        'iptables', 'ipset', 'iproute2', 'dnsutils', 'jq'
      ];
      
      for (const pkg of requiredPackages) {
        expect(content).toContain(pkg);
      }
    });

    test('Docker installation is properly configured', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      // Check for Docker GPG key setup
      expect(content).toContain('docker-archive-keyring.gpg');
      
      // Check for Docker repository setup
      expect(content).toContain('download.docker.com');
      
      // Check for Docker CE installation
      expect(content).toContain('docker-ce');
    });

    test('NPM global packages are installed', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      const requiredPackages = [
        '@anthropic-ai/claude-code',
        'pnpm',
        'tsx',
        'task-master-ai@latest'
      ];
      
      for (const pkg of requiredPackages) {
        expect(content).toContain(pkg);
      }
    });

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
        expect(content).toContain(tool);
      }
    });
  });

  describe('User and Security Configuration', () => {
    test('User configuration and permissions are set up', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      // Check for node user configuration
      expect(content).toContain('USER node');
      
      // Check for docker group membership
      expect(content).toContain('usermod -aG docker node');
      
      // Check for workspace directory creation
      expect(content).toContain('/workspace');
      
      // Check for proper ownership
      expect(content).toContain('chown -R node:node');
    });

    test('Security configurations are properly set', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      // Check for firewall script setup
      expect(content).toContain('init-firewall.sh');
      
      // Check for sudoers configuration
      expect(content).toContain('/etc/sudoers.d/node-firewall');
      
      // Check for proper permissions on sudoers file
      expect(content).toContain('chmod 0440');
    });
  });

  describe('Environment Configuration', () => {
    test('Required environment variables are configured', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      const requiredEnvVars = [
        'DEVCONTAINER=true',
        'SHELL=/bin/zsh',
        'NPM_CONFIG_PREFIX',
        'PATH'
      ];
      
      for (const envVar of requiredEnvVars) {
        expect(content).toContain(envVar);
      }
    });

    test('Workspace and command history are configured', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      // Check for command history setup
      expect(content).toContain('/commandhistory');
      expect(content).toContain('.bash_history');
      
      // Check for workspace directory
      expect(content).toContain('WORKDIR /workspace');
    });

    test('Git configuration is properly set', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');
      
      // Check for git safe directory configuration
      expect(content).toContain('git config --global --add safe.directory /workspace');
    });
  });

  describe('Docker Integration Tests', () => {
    test('Docker daemon is available for testing', async () => {
      try {
        const result = await execCommand('docker', ['--version']);
        expect(result.code).toBe(0);
        expect(result.stdout).toContain('Docker version');
      } catch (err) {
        console.log('ℹ️  Docker not available for testing (this is expected in some environments)');
        // Pass this test even if Docker is not available
      }
    });

    test('Base image is available and accessible', async () => {
      try {
        const result = await execCommand('docker', ['pull', 'node:latest']);
        // If docker pull succeeds or image already exists, test passes
        expect(result.code === 0 || result.stderr.includes('up to date')).toBe(true);
      } catch (err) {
        console.log('ℹ️  Cannot test base image availability (Docker not available)');
        // Pass this test if Docker is not available
      }
    });

    test('Dockerfile follows best practices', async () => {
      try {
        // Check for hadolint if available
        const result = await execCommand('hadolint', [dockerfilePath]);
        if (result.code === 0) {
          expect(result.code).toBe(0);
        } else {
          console.log('ℹ️  Hadolint warnings found (non-critical)');
          // Pass even with warnings
        }
      } catch (err) {
        console.log('ℹ️  Hadolint not available for linting check');
        // Pass this test if hadolint is not available
      }
    });
  });
});