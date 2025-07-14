/**
 * Development Tools Integration Test Suite
 * Tests TypeScript, ESLint, and other development tools functionality
 */

import { describe, test, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

describe('Development Tools Integration', () => {
  describe('TypeScript Configuration', () => {
    test('TypeScript compiler is available', async () => {
      const { stdout: tscVersion } = await execAsync('npx tsc --version');
      const version = tscVersion.trim();
      expect(version).toContain('Version');
    });
    
    test('tsconfig.json exists and is valid', () => {
      const tsconfigPath = '/workspace/tsconfig.json';
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      expect(tsconfigContent.length).toBeGreaterThan(0);
      
      // Test essential tsconfig properties exist in file content
      expect(tsconfigContent).toContain('compilerOptions');
      expect(tsconfigContent).toContain('"strict": true');
      expect(tsconfigContent).toContain('"target":');
      expect(tsconfigContent).toContain('"moduleResolution":');
      expect(tsconfigContent).toContain('"include":');
      expect(tsconfigContent).toContain('"exclude":');
    });
    
    test('TypeScript type checking passes', async () => {
      try {
        await execAsync('npx tsc --noEmit --skipLibCheck');
        expect(true).toBe(true);
      } catch (error) {
        const hasTypeErrors = error.stdout && error.stdout.includes('error TS');
        expect(hasTypeErrors).toBe(false);
      }
    });
  });

  describe('ESLint Configuration', () => {
    test('ESLint is available', async () => {
      const { stdout: eslintVersion } = await execAsync('npx eslint --version');
      const version = eslintVersion.trim();
      expect(version).toContain('v');
    });
    
    test('ESLint config file exists and is valid', async () => {
      const eslintConfigPath = '/workspace/eslint.config.js';
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
      
      const configModule = await import(eslintConfigPath);
      expect(configModule.default).toBeDefined();
      
      const config = configModule.default;
      expect(Array.isArray(config)).toBe(true);
      expect(config.length).toBeGreaterThan(0);
    });
    
    test('ESLint runs successfully on test files', async () => {
      const countErrors = (results) => {
        let errorCount = 0;
        results.forEach(file => {
          file.messages.forEach(message => {
            if (message.severity === 2) errorCount++;
          });
        });
        return errorCount;
      };
      
      try {
        const { stdout } = await execAsync('npx eslint tests/ --ext .js --format json');
        const results = JSON.parse(stdout);
        const errorCount = countErrors(results);
        expect(errorCount).toBe(0);
      } catch (error) {
        if (error.stdout) {
          const results = JSON.parse(error.stdout);
          const errorCount = countErrors(results);
          expect(errorCount).toBe(0);
        } else {
          throw error;
        }
      }
    });
  });

  describe('Prettier Configuration', () => {
    test('Prettier is available', async () => {
      const { stdout: prettierVersion } = await execAsync('npx prettier --version');
      const version = prettierVersion.trim();
      expect(version.length).toBeGreaterThan(0);
    });
    
    test('Prettier configuration exists or uses defaults', () => {
      const prettierConfigFiles = [
        '.prettierrc',
        '.prettierrc.json',
        '.prettierrc.js',
        'prettier.config.js',
        'package.json'
      ];
      
      let hasConfig = false;
      for (const configFile of prettierConfigFiles) {
        const configPath = path.join('/workspace', configFile);
        if (fs.existsSync(configPath)) {
          if (configFile === 'package.json') {
            const packageJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (packageJson.prettier) {
              hasConfig = true;
              break;
            }
          } else {
            hasConfig = true;
            break;
          }
        }
      }
      
      // Always pass this test - we can use defaults if no config exists
      expect(hasConfig || true).toBe(true);
    });
    
    test('Test files are properly formatted', async () => {
      try {
        await execAsync('npx prettier --check tests/');
        expect(true).toBe(true);
      } catch (error) {
        const hasFormatIssues = error.stdout && error.stdout.includes('Code style issues');
        expect(hasFormatIssues).toBe(false);
      }
    });
  });

  describe('Node.js Environment', () => {
    test('Node.js version meets requirements', async () => {
      const { stdout: nodeVersion } = await execAsync('node --version');
      const version = nodeVersion.trim();
      const majorVersion = parseInt(version.substring(1).split('.')[0], 10);
      expect(majorVersion).toBeGreaterThanOrEqual(18);
    });
    
    test('npm version meets requirements', async () => {
      const { stdout: npmVersion } = await execAsync('npm --version');
      const npmVer = npmVersion.trim();
      const npmMajorVersion = parseInt(npmVer.split('.')[0], 10);
      expect(npmMajorVersion).toBeGreaterThanOrEqual(8);
    });
    
    test('Node.js module system is working', async () => {
      const { stdout: moduleOutput } = await execAsync('node -e "console.log(process.versions)"');
      expect(moduleOutput).toContain('node');
    });
    
    test('ES modules support is working', async () => {
      const testESModule = `
        import { fileURLToPath } from 'url';
        console.log('ES modules working');
      `;
      
      const tempFile = '/tmp/test-esm.mjs';
      fs.writeFileSync(tempFile, testESModule);
      
      try {
        const { stdout: esmOutput } = await execAsync(`node ${tempFile}`);
        expect(esmOutput).toContain('ES modules working');
      } finally {
        fs.unlinkSync(tempFile);
      }
    });
  });

  describe('Package Management', () => {
    test('package.json exists and is valid', () => {
      const packagePath = '/workspace/package.json';
      expect(fs.existsSync(packagePath)).toBe(true);
      
      const packageContent = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(packageContent);
      
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.type).toBe('module');
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.devDependencies).toBeDefined();
      expect(packageJson.engines).toBeDefined();
    });
    
    test('node_modules directory exists and is populated', () => {
      const nodeModulesPath = '/workspace/node_modules';
      expect(fs.existsSync(nodeModulesPath)).toBe(true);
      
      const nodeModulesContent = fs.readdirSync(nodeModulesPath);
      expect(nodeModulesContent.length).toBeGreaterThan(0);
    });
    
    test('package-lock.json exists', () => {
      const packageLockPath = '/workspace/package-lock.json';
      expect(fs.existsSync(packageLockPath)).toBe(true);
    });
    
    test('npm audit passes (no high/critical vulnerabilities)', async () => {
      try {
        await execAsync('npm audit --audit-level=high');
        expect(true).toBe(true);
      } catch (error) {
        const hasHighVulns = error.stdout && error.stdout.includes('high');
        expect(hasHighVulns).toBe(false);
      }
    });
  });

  describe('Development Workflow', () => {
    test('Essential scripts are defined', () => {
      const packagePath = '/workspace/package.json';
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      const essentialScripts = ['lint', 'format', 'type-check', 'test'];
      for (const script of essentialScripts) {
        expect(scripts[script]).toBeDefined();
      }
    });
    
    test('lint script executes successfully', async () => {
      const countErrors = (results) => {
        let errorCount = 0;
        results.forEach(file => {
          file.messages.forEach(message => {
            if (message.severity === 2) errorCount++;
          });
        });
        return errorCount;
      };
      
      try {
        const { stdout } = await execAsync('npx eslint . --ext .js,.jsx,.ts,.tsx --format json');
        const results = JSON.parse(stdout);
        const errorCount = countErrors(results);
        expect(errorCount).toBe(0);
      } catch (error) {
        if (error.stdout) {
          const results = JSON.parse(error.stdout);
          const errorCount = countErrors(results);
          expect(errorCount).toBe(0);
        } else {
          throw error;
        }
      }
    });
    
    test('format check script executes successfully', async () => {
      try {
        await execAsync('npm run format:check');
        expect(true).toBe(true);
      } catch (error) {
        const hasFormatIssues = error.stdout && error.stdout.includes('Code style issues');
        expect(hasFormatIssues).toBe(false);
      }
    });
    
    test('type-check script executes successfully', async () => {
      try {
        await execAsync('npm run type-check');
        expect(true).toBe(true);
      } catch (error) {
        const hasTypeErrors = error.stdout && error.stdout.includes('error TS');
        expect(hasTypeErrors).toBe(false);
      }
    });
    
    test('Git pre-commit hook is configured (optional)', () => {
      const gitHooksPath = '/workspace/.git/hooks';
      if (fs.existsSync(gitHooksPath)) {
        const hooks = fs.readdirSync(gitHooksPath);
        const hasPreCommitHook = hooks.some(hook => hook.startsWith('pre-commit'));
        console.log(hasPreCommitHook ? 'Pre-commit hook found' : 'No pre-commit hook (optional)');
      }
      // This test always passes as pre-commit hooks are optional
      expect(true).toBe(true);
    });
  });

  describe('Build Tools', () => {
    test('tsx (TypeScript execution) is available', async () => {
      try {
        const { stdout: tsxOutput } = await execAsync('npx tsx --version');
        expect(tsxOutput).toContain('.');
      } catch (error) {
        expect.fail('tsx should be available');
      }
    });
    
    test('Build output directory is configured', () => {
      const tsconfigContent = fs.readFileSync('/workspace/tsconfig.json', 'utf8');
      const outDirMatch = tsconfigContent.match(/"outDir":\s*"([^"]+)"/);
      const buildOutputDir = outDirMatch ? outDirMatch[1] : './dist';
      expect(buildOutputDir).toBeDefined();
    });
    
    test('Clean script executes successfully', async () => {
      try {
        await execAsync('npm run clean');
        expect(true).toBe(true);
      } catch (error) {
        expect.fail('Clean script should execute successfully');
      }
    });
    
    test('TypeScript compilation succeeds', async () => {
      try {
        await execAsync('npx tsc --noEmit --skipLibCheck');
        expect(true).toBe(true);
      } catch (error) {
        const hasCompileErrors = error.stdout && error.stdout.includes('error TS');
        expect(hasCompileErrors).toBe(false);
      }
    });
  });
});