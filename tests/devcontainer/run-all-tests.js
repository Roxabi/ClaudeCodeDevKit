#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tests = [
  'test-devcontainer-config.js',
  'test-dockerfile-validation.js',
  'test-runtime-environment.js',
  'test-development-tools.js',
  'test-port-forwarding.js'
];

const runTest = (testFile) => {
  return new Promise((resolve, reject) => {
    const testPath = path.join(__dirname, testFile);
    const child = spawn('node', [testPath], { stdio: 'pipe' });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Test ${testFile} failed with code ${code}`));
      }
    });
  });
};

const extractTestSummary = (stdout) => {
  const lines = stdout.split('\n');
  const summary = {};
  
  // Extract test counts from different test files
  const summaryRegex = /(\d+) passed.*(\d+) failed/;
  const passedRegex = /✅ Passed: (\d+)/;
  const failedRegex = /❌ Failed: (\d+)/;
  const totalRegex = /📈 Total:\s+(\d+)|Total tests: (\d+)/;
  
  for (const line of lines) {
    if (line.includes('passed') && line.includes('failed')) {
      const match = line.match(summaryRegex);
      if (match) {
        summary.passed = parseInt(match[1], 10);
        summary.failed = parseInt(match[2], 10);
      }
    }
    
    const passedMatch = line.match(passedRegex);
    if (passedMatch) {
      summary.passed = parseInt(passedMatch[1], 10);
    }
    
    const failedMatch = line.match(failedRegex);
    if (failedMatch) {
      summary.failed = parseInt(failedMatch[1], 10);
    }
    
    const totalMatch = line.match(totalRegex);
    if (totalMatch) {
      summary.total = parseInt(totalMatch[1] || totalMatch[2], 10);
    }
  }
  
  return summary;
};

const extractFailures = (stdout) => {
  const lines = stdout.split('\n');
  const failures = [];
  
  for (const line of lines) {
    if (line.includes('❌') && line.includes(':')) {
      const failure = line.replace('❌', '').trim();
      failures.push(failure);
    }
  }
  
  return failures;
};

const runAllTests = async () => {
  console.log('🚀 Running devcontainer tests...\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  const results = [];
  const allFailures = [];
  
  for (const test of tests) {
    try {
      const { stdout } = await runTest(test);
      const summary = extractTestSummary(stdout);
      const failures = extractFailures(stdout);
      
      const testName = test.replace('test-', '').replace('.js', '');
      
      if (summary.failed > 0) {
        console.log(`❌ ${testName}: ${summary.failed} failed`);
        failures.forEach(failure => {
          console.log(`   • ${failure}`);
          allFailures.push({ test: testName, failure });
        });
      } else {
        console.log(`✅ ${testName}: ${summary.passed || summary.total || 0} passed`);
      }
      
      const passed = summary.passed || 0;
      const failed = summary.failed || 0;
      
      totalPassed += passed;
      totalFailed += failed;
      
      results.push({ 
        test: testName, 
        status: summary.failed > 0 ? 'failed' : 'passed',
        passed: summary.passed || 0,
        failed: summary.failed || 0,
        failures
      });
    } catch (error) {
      console.log(`❌ ${test}: Test execution failed`);
      totalFailed++;
      allFailures.push({ test, failure: 'Test execution failed' });
      results.push({ test, status: 'failed', error: error.message });
    }
  }
  
  const totalTests = totalPassed + totalFailed;
  
  console.log('\n📊 Summary');
  console.log('='.repeat(20));
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0'}%`);
  
  if (allFailures.length > 0) {
    console.log('\n❌ Failed Tests:');
    allFailures.forEach(({ test, failure }) => {
      console.log(`   • ${test}: ${failure}`);
    });
  }
  
  console.log(allFailures.length === 0 ? '\n🎉 All tests passed!' : '\n⚠️  Some tests failed.');
};

runAllTests().catch(console.error);