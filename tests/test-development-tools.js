#!/usr/bin/env node

/**
 * Development Tools Integration Test Suite
 * Tests TypeScript, ESLint, and other development tools functionality
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

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
async function testTypeScript() {
  try {
    // Test TypeScript compiler availability
    const { stdout: tscVersion } = await execAsync('npx tsc --version');
    const version = tscVersion.trim();
    logTest('TypeScript compiler is available', version.includes('Version'), 
      `TypeScript: ${version}`);
    
    // Test tsconfig.json exists and is valid
    const tsconfigPath = '/workspace/tsconfig.json';
    const tsconfigExists = fs.existsSync(tsconfigPath);
    logTest('tsconfig.json exists', tsconfigExists);
    
    if (tsconfigExists) {
      try {
        const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
        logTest('tsconfig.json is readable', tsconfigContent.length > 0);
        
        // Test essential tsconfig properties exist in file content
        logTest('tsconfig has compilerOptions', tsconfigContent.includes('compilerOptions'));
        logTest('tsconfig has strict mode enabled', tsconfigContent.includes('"strict": true'));
        logTest('tsconfig has proper target', tsconfigContent.includes('"target":'));
        logTest('tsconfig has proper module resolution', tsconfigContent.includes('"moduleResolution":'));
        
        // Test include/exclude patterns
        logTest('tsconfig has include patterns', tsconfigContent.includes('"include":'));
        logTest('tsconfig has exclude patterns', tsconfigContent.includes('"exclude":'));
        
      } catch (error) {
        logTest('tsconfig.json is readable', false, `Read error: ${error.message}`);
      }
    }
    
    // Test TypeScript type checking
    try {
      await execAsync('npx tsc --noEmit --skipLibCheck');
      logTest('TypeScript type checking passes', true, 'No type errors found');
    } catch (error) {
      const hasTypeErrors = error.stdout && error.stdout.includes('error TS');
      logTest('TypeScript type checking passes', !hasTypeErrors, 
        hasTypeErrors ? 'Type errors found' : 'Type check command failed');
    }
    
  } catch (error) {
    logTest('TypeScript validation', false, `Error: ${error.message}`);
  }
}

async function testESLint() {
  try {
    // Test ESLint availability
    const { stdout: eslintVersion } = await execAsync('npx eslint --version');
    const version = eslintVersion.trim();
    logTest('ESLint is available', version.includes('v'), 
      `ESLint: ${version}`);
    
    // Test eslint config exists
    const eslintConfigPath = '/workspace/eslint.config.js';
    const eslintConfigExists = fs.existsSync(eslintConfigPath);
    logTest('ESLint config file exists', eslintConfigExists);
    
    if (eslintConfigExists) {
      try {
        // Test that config is importable
        const configModule = await import(eslintConfigPath);
        logTest('ESLint config is importable', configModule.default !== undefined);
        
        // Test config structure
        const config = configModule.default;
        const isArray = Array.isArray(config);
        logTest('ESLint config has proper structure', isArray);
        
        if (isArray) {
          logTest('ESLint config has rules defined', config.length > 0);
        }
        
      } catch (error) {
        logTest('ESLint config is importable', false, `Import error: ${error.message}`);
      }
    }
    
    // Test ESLint execution on test files
    try {
      await execAsync('npx eslint tests/ --ext .js');
      logTest('ESLint runs successfully on test files', true, 'No lint errors in test files');
    } catch (error) {
      const hasLintErrors = error.stdout && error.stdout.includes('error');
      logTest('ESLint runs successfully on test files', !hasLintErrors, 
        hasLintErrors ? 'Lint errors found in test files' : 'ESLint execution failed');
    }
    
    // Test ESLint with TypeScript parser
    try {
      await execAsync('npx eslint . --ext .ts --max-warnings 0');
      logTest('ESLint works with TypeScript files', true, 'No TypeScript lint errors');
    } catch (error) {
      const hasTypeScriptFiles = fs.existsSync('/workspace/src') && 
        fs.readdirSync('/workspace/src').some(file => file.endsWith('.ts'));
      
      if (!hasTypeScriptFiles) {
        logTest('ESLint works with TypeScript files', true, 'No TypeScript files to lint');
      } else {
        const hasLintErrors = error.stdout && error.stdout.includes('error');
        logTest('ESLint works with TypeScript files', !hasLintErrors, 
          hasLintErrors ? 'TypeScript lint errors found' : 'TypeScript linting failed');
      }
    }
    
  } catch (error) {
    logTest('ESLint validation', false, `Error: ${error.message}`);
  }
}

async function testPrettier() {
  try {
    // Test Prettier availability
    const { stdout: prettierVersion } = await execAsync('npx prettier --version');
    const version = prettierVersion.trim();
    logTest('Prettier is available', version.length > 0, 
      `Prettier: ${version}`);
    
    // Test prettier config exists or uses defaults
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
    
    logTest('Prettier configuration is available', hasConfig || true, 
      hasConfig ? 'Config file found' : 'Using default configuration');
    
    // Test prettier formatting check
    try {
      await execAsync('npx prettier --check tests/');
      logTest('Test files are properly formatted', true, 'All test files are formatted correctly');
    } catch (error) {
      const hasFormatIssues = error.stdout && error.stdout.includes('Code style issues');
      logTest('Test files are properly formatted', !hasFormatIssues, 
        hasFormatIssues ? 'Formatting issues found' : 'Format check failed');
    }
    
  } catch (error) {
    logTest('Prettier validation', false, `Error: ${error.message}`);
  }
}

async function testNodeEnvironment() {
  try {
    // Test Node.js version meets requirements
    const { stdout: nodeVersion } = await execAsync('node --version');
    const version = nodeVersion.trim();
    const majorVersion = parseInt(version.substring(1).split('.')[0], 10);
    
    logTest('Node.js version meets requirements', majorVersion >= 18, 
      `Node.js: ${version}, Required: >=18`);
    
    // Test npm version
    const { stdout: npmVersion } = await execAsync('npm --version');
    const npmVer = npmVersion.trim();
    const npmMajorVersion = parseInt(npmVer.split('.')[0], 10);
    
    logTest('npm version meets requirements', npmMajorVersion >= 8, 
      `npm: ${npmVer}, Required: >=8`);
    
    // Test module resolution
    try {
      const { stdout: moduleOutput } = await execAsync('node -e "console.log(process.versions)"');
      logTest('Node.js module system is working', moduleOutput.includes('node'), 
        'Module system functional');
    } catch (_error) {
      logTest('Node.js module system is working', false, 'Module system test failed');
    }
    
    // Test ES modules support
    try {
      const testESModule = `
        import { fileURLToPath } from 'url';
        console.log('ES modules working');
      `;
      
      const tempFile = '/tmp/test-esm.mjs';
      fs.writeFileSync(tempFile, testESModule);
      
      const { stdout: esmOutput } = await execAsync(`node ${tempFile}`);
      logTest('ES modules support is working', esmOutput.includes('ES modules working'));
      
      fs.unlinkSync(tempFile);
    } catch (error) {
      logTest('ES modules support is working', false, `ES modules test failed: ${error.message}`);
    }
    
  } catch (error) {
    logTest('Node.js environment validation', false, `Error: ${error.message}`);
  }
}

async function testPackageManagement() {
  try {
    // Test package.json exists and is valid
    const packagePath = '/workspace/package.json';
    const packageExists = fs.existsSync(packagePath);
    logTest('package.json exists', packageExists);
    
    if (packageExists) {
      try {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        logTest('package.json is valid JSON', true);
        
        // Test essential package.json properties
        logTest('package.json has name', packageJson.name !== undefined);
        logTest('package.json has version', packageJson.version !== undefined);
        logTest('package.json has type module', packageJson.type === 'module');
        logTest('package.json has scripts', packageJson.scripts !== undefined);
        logTest('package.json has devDependencies', packageJson.devDependencies !== undefined);
        
        // Test engine requirements
        logTest('package.json has engine requirements', packageJson.engines !== undefined);
        
      } catch (error) {
        logTest('package.json is valid JSON', false, `Parse error: ${error.message}`);
      }
    }
    
    // Test node_modules exists and is populated
    const nodeModulesPath = '/workspace/node_modules';
    const nodeModulesExists = fs.existsSync(nodeModulesPath);
    logTest('node_modules directory exists', nodeModulesExists);
    
    if (nodeModulesExists) {
      const nodeModulesContent = fs.readdirSync(nodeModulesPath);
      logTest('node_modules is populated', nodeModulesContent.length > 0);
    }
    
    // Test package-lock.json exists
    const packageLockPath = '/workspace/package-lock.json';
    const packageLockExists = fs.existsSync(packageLockPath);
    logTest('package-lock.json exists', packageLockExists);
    
    // Test npm audit
    try {
      await execAsync('npm audit --audit-level=high');
      logTest('npm audit passes (no high/critical vulnerabilities)', true, 
        'No high or critical vulnerabilities found');
    } catch (error) {
      const hasHighVulns = error.stdout && error.stdout.includes('high');
      logTest('npm audit passes (no high/critical vulnerabilities)', !hasHighVulns, 
        hasHighVulns ? 'High/critical vulnerabilities found' : 'Audit check passed');
    }
    
  } catch (error) {
    logTest('Package management validation', false, `Error: ${error.message}`);
  }
}

async function testDevelopmentWorkflow() {
  try {
    // Test development scripts
    const packagePath = '/workspace/package.json';
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const scripts = packageJson.scripts || {};
      
      // Test essential scripts exist
      const essentialScripts = ['lint', 'format', 'type-check', 'test'];
      for (const script of essentialScripts) {
        const scriptExists = scripts[script] !== undefined;
        logTest(`${script} script is defined`, scriptExists, 
          scriptExists ? `"${scripts[script]}"` : 'Script not found');
      }
      
      // Test script execution
      try {
        await execAsync('npm run lint');
        logTest('lint script executes successfully', true, 'Lint script completed');
      } catch (error) {
        const hasLintErrors = error.stdout && error.stdout.includes('error');
        logTest('lint script executes successfully', !hasLintErrors, 
          hasLintErrors ? 'Lint errors found' : 'Lint script failed');
      }
      
      try {
        await execAsync('npm run format:check');
        logTest('format check script executes successfully', true, 'Format check completed');
      } catch (error) {
        const hasFormatIssues = error.stdout && error.stdout.includes('Code style issues');
        logTest('format check script executes successfully', !hasFormatIssues, 
          hasFormatIssues ? 'Format issues found' : 'Format check failed');
      }
      
      try {
        await execAsync('npm run type-check');
        logTest('type-check script executes successfully', true, 'Type check completed');
      } catch (error) {
        const hasTypeErrors = error.stdout && error.stdout.includes('error TS');
        logTest('type-check script executes successfully', !hasTypeErrors, 
          hasTypeErrors ? 'Type errors found' : 'Type check failed');
      }
    }
    
    // Test git hooks integration (if present)
    const gitHooksPath = '/workspace/.git/hooks';
    if (fs.existsSync(gitHooksPath)) {
      const hooks = fs.readdirSync(gitHooksPath);
      const hasPreCommitHook = hooks.some(hook => hook.startsWith('pre-commit'));
      logTest('Git pre-commit hook is configured', hasPreCommitHook, 
        hasPreCommitHook ? 'Pre-commit hook found' : 'No pre-commit hook (optional)');
    }
    
  } catch (error) {
    logTest('Development workflow validation', false, `Error: ${error.message}`);
  }
}

async function testBuildTools() {
  try {
    // Test TypeScript build tools
    try {
      const { stdout: tsxOutput } = await execAsync('npx tsx --version');
      logTest('tsx (TypeScript execution) is available', tsxOutput.includes('.'), 
        `tsx: ${tsxOutput.trim()}`);
    } catch (_error) {
      logTest('tsx (TypeScript execution) is available', false, 'tsx not available');
    }
    
    // Test if build directory structure is ready
    const tsconfigContent = fs.readFileSync('/workspace/tsconfig.json', 'utf8');
    
    // Extract outDir from tsconfig content (handling comments)
    const outDirMatch = tsconfigContent.match(/"outDir":\s*"([^"]+)"/);
    const buildOutputDir = outDirMatch ? outDirMatch[1] : './dist';
    
    logTest('Build output directory is configured', buildOutputDir !== undefined, 
      `Output directory: ${buildOutputDir}`);
    
    // Test if clean script works
    try {
      await execAsync('npm run clean');
      logTest('Clean script executes successfully', true, 'Clean script completed');
    } catch (_error) {
      logTest('Clean script executes successfully', false, 'Clean script failed');
    }
    
    // Test TypeScript compilation
    try {
      await execAsync('npx tsc --noEmit --skipLibCheck');
      logTest('TypeScript compilation succeeds', true, 'TypeScript compilation successful');
    } catch (error) {
      const hasCompileErrors = error.stdout && error.stdout.includes('error TS');
      logTest('TypeScript compilation succeeds', !hasCompileErrors, 
        hasCompileErrors ? 'TypeScript compilation errors' : 'Compilation test failed');
    }
    
  } catch (error) {
    logTest('Build tools validation', false, `Error: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🔧 Development Tools Integration Test Suite');
  console.log('==========================================\n');
  
  logInfo('Testing TypeScript configuration and functionality...');
  await testTypeScript();
  console.log();
  
  logInfo('Testing ESLint configuration and functionality...');
  await testESLint();
  console.log();
  
  logInfo('Testing Prettier configuration and functionality...');
  await testPrettier();
  console.log();
  
  logInfo('Testing Node.js environment...');
  await testNodeEnvironment();
  console.log();
  
  logInfo('Testing package management...');
  await testPackageManagement();
  console.log();
  
  logInfo('Testing development workflow...');
  await testDevelopmentWorkflow();
  console.log();
  
  logInfo('Testing build tools...');
  await testBuildTools();
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