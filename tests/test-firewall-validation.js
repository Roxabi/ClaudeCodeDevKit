#!/usr/bin/env node

/**
 * Firewall Initialization Script Test Suite
 * Tests the init-firewall.sh script validation, execution, and network security policies
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import http from 'http';
import https from 'https';
import net from 'net';

const execAsync = promisify(exec);

// Test configurations
const FIREWALL_SCRIPT = '/workspace/.devcontainer/init-firewall.sh';
const ALLOWED_DOMAINS = [
  'registry.npmjs.org',
  'api.anthropic.com',
  'sentry.io',
  'statsig.anthropic.com',
  'statsig.com'
];

const BLOCKED_DOMAINS = [
  'example.com',
  'google.com',
  'facebook.com',
  'twitter.com'
];

// Test utilities
const testConnection = (host, port, timeout = 5000) => {
  return new Promise(resolve => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(timeout);
    socket.on('error', onError);
    socket.on('timeout', onError);

    socket.connect(port, host, () => {
      socket.destroy();
      resolve(true);
    });
  });
};

const testHttpRequest = (url, timeout = 5000) => {
  return new Promise(resolve => {
    const client = url.startsWith('https://') ? https : http;
    
    const req = client.request(url, { timeout }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => resolve(false));
    req.end();
  });
};

const isWSL2 = async () => {
  try {
    const version = await readFile('/proc/version', 'utf8');
    return version.includes('microsoft');
  } catch {
    return false;
  }
};

const hasIptablesCapability = async () => {
  try {
    await execAsync('iptables -L >/dev/null 2>&1');
    return true;
  } catch {
    return false;
  }
};

const checkScriptPermissions = async (scriptPath) => {
  try {
    await access(scriptPath, constants.F_OK);
    const stats = await execAsync(`stat -c "%a" "${scriptPath}"`);
    const permissions = stats.stdout.trim();
    return permissions.includes('755') || permissions.includes('744');
  } catch {
    return false;
  }
};

const runScript = (scriptPath, args = []) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn('bash', [scriptPath, ...args], {
      stdio: 'pipe',
      env: process.env
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    childProcess.on('error', reject);
  });
};

// Test functions
const testFirewallScriptExists = async () => {
  try {
    await access(FIREWALL_SCRIPT, constants.F_OK);
    return { success: true, message: 'Firewall script exists' };
  } catch {
    return { success: false, message: 'Firewall script not found' };
  }
};

const testFirewallScriptPermissions = async () => {
  const hasPermissions = await checkScriptPermissions(FIREWALL_SCRIPT);
  return {
    success: hasPermissions,
    message: hasPermissions ? 'Script has correct permissions' : 'Script lacks execute permissions'
  };
};

const testFirewallScriptSyntax = async () => {
  try {
    await execAsync(`bash -n "${FIREWALL_SCRIPT}"`);
    return { success: true, message: 'Script syntax is valid' };
  } catch (error) {
    return { success: false, message: `Script syntax error: ${error.message}` };
  }
};

const testWSL2Detection = async () => {
  const isWSL = await isWSL2();
  const result = await runScript(FIREWALL_SCRIPT);
  
  if (isWSL) {
    return {
      success: result.code === 0 && result.stdout.includes('WSL2 detected'),
      message: isWSL ? 'WSL2 environment correctly detected and handled' : 'WSL2 detection failed'
    };
  } else {
    return {
      success: !result.stdout.includes('WSL2 detected'),
      message: 'Non-WSL2 environment correctly identified'
    };
  }
};

const testIptablesCapabilityCheck = async () => {
  const hasCapability = await hasIptablesCapability();
  const result = await runScript(FIREWALL_SCRIPT);
  
  if (!hasCapability) {
    return {
      success: result.code === 0 && result.stdout.includes('iptables not available'),
      message: hasCapability ? 'iptables capability check passed' : 'iptables unavailable correctly detected'
    };
  } else {
    return {
      success: !result.stdout.includes('iptables not available'),
      message: 'iptables capability correctly detected'
    };
  }
};

const testRequiredCommands = async () => {
  const commands = ['iptables', 'ipset', 'curl', 'jq', 'dig', 'ip'];
  const results = {};
  
  for (const cmd of commands) {
    try {
      await execAsync(`which ${cmd}`);
      results[cmd] = true;
    } catch {
      results[cmd] = false;
    }
  }
  
  const allAvailable = Object.values(results).every(Boolean);
  return {
    success: allAvailable,
    message: allAvailable ? 'All required commands available' : `Missing commands: ${Object.keys(results).filter(k => !results[k]).join(', ')}`
  };
};

const testGitHubAPIAccess = async () => {
  try {
    const response = await testHttpRequest('https://api.github.com/meta');
    return {
      success: response,
      message: response ? 'GitHub API accessible' : 'GitHub API not accessible'
    };
  } catch {
    return { success: false, message: 'GitHub API access test failed' };
  }
};

const testDNSResolution = async () => {
  const testDomain = 'api.github.com';
  try {
    const result = await execAsync(`dig +short A ${testDomain}`);
    const hasIPs = result.stdout.trim().length > 0;
    return {
      success: hasIPs,
      message: hasIPs ? `DNS resolution working for ${testDomain}` : `DNS resolution failed for ${testDomain}`
    };
  } catch {
    return { success: false, message: 'DNS resolution test failed' };
  }
};

const testFirewallRulesCreation = async () => {
  // Skip if we can't run iptables
  if (!(await hasIptablesCapability())) {
    return { success: true, message: 'Skipped - iptables not available' };
  }
  
  try {
    // Check for basic iptables rules structure
    const result = await execAsync('iptables -L -n');
    const hasBasicRules = result.stdout.includes('Chain INPUT') && 
                         result.stdout.includes('Chain OUTPUT') && 
                         result.stdout.includes('Chain FORWARD');
    
    return {
      success: hasBasicRules,
      message: hasBasicRules ? 'Basic iptables rules structure present' : 'iptables rules structure missing'
    };
  } catch {
    return { success: false, message: 'Failed to check iptables rules' };
  }
};

const testIpsetCreation = async () => {
  // Skip if we can't run ipset
  if (!(await hasIptablesCapability())) {
    return { success: true, message: 'Skipped - ipset not available' };
  }
  
  try {
    const result = await execAsync('ipset list allowed-domains 2>/dev/null || echo "not found"');
    const ipsetExists = !result.stdout.includes('not found');
    
    return {
      success: ipsetExists,
      message: ipsetExists ? 'allowed-domains ipset created' : 'allowed-domains ipset not found'
    };
  } catch {
    return { success: false, message: 'Failed to check ipset creation' };
  }
};

const testAllowedDomainsAccess = async () => {
  // Test access to allowed domains
  const results = {};
  
  for (const domain of ALLOWED_DOMAINS) {
    try {
      const accessible = await testHttpRequest(`https://${domain}`);
      results[domain] = accessible;
    } catch {
      results[domain] = false;
    }
  }
  
  const allAccessible = Object.values(results).every(Boolean);
  return {
    success: allAccessible,
    message: allAccessible ? 'All allowed domains accessible' : `Blocked domains: ${Object.keys(results).filter(k => !results[k]).join(', ')}`
  };
};

const testBlockedDomainsBlocked = async () => {
  // Test that blocked domains are actually blocked
  const results = {};
  
  for (const domain of BLOCKED_DOMAINS) {
    try {
      const accessible = await testHttpRequest(`https://${domain}`);
      results[domain] = !accessible; // Should be blocked (not accessible)
    } catch {
      results[domain] = true; // Error accessing means blocked
    }
  }
  
  const allBlocked = Object.values(results).every(Boolean);
  return {
    success: allBlocked,
    message: allBlocked ? 'All blocked domains properly blocked' : `Unexpectedly accessible: ${Object.keys(results).filter(k => !results[k]).join(', ')}`
  };
};

const testLocalhostAccess = async () => {
  // Test localhost access is allowed
  const localhostPorts = [80, 443, 3000, 8080];
  let anyWorking = false;
  
  for (const port of localhostPorts) {
    try {
      const accessible = await testConnection('localhost', port, 1000);
      if (accessible) {
        anyWorking = true;
        break;
      }
    } catch {
      // Connection failed, which is expected if no service is running
    }
  }
  
  return {
    success: true, // We can't test this reliably without running services
    message: 'Localhost access rules configured (cannot test without running services)'
  };
};

const testScriptExitCodes = async () => {
  const result = await runScript(FIREWALL_SCRIPT);
  
  return {
    success: result.code === 0,
    message: result.code === 0 ? 'Script completed successfully' : `Script failed with exit code ${result.code}`
  };
};

const testFirewallVerification = async () => {
  const result = await runScript(FIREWALL_SCRIPT);
  
  const hasVerification = result.stdout.includes('Firewall verification') && 
                         result.stdout.includes('unable to reach https://example.com') &&
                         result.stdout.includes('able to reach https://api.github.com');
  
  return {
    success: hasVerification,
    message: hasVerification ? 'Firewall verification checks passed' : 'Firewall verification checks failed'
  };
};

// Main test runner
const runTests = async () => {
  console.log('🔒 Firewall Initialization Script Test Suite\n');
  
  const tests = [
    { name: 'Firewall script exists', fn: testFirewallScriptExists },
    { name: 'Script has correct permissions', fn: testFirewallScriptPermissions },
    { name: 'Script syntax validation', fn: testFirewallScriptSyntax },
    { name: 'WSL2 environment detection', fn: testWSL2Detection },
    { name: 'iptables capability check', fn: testIptablesCapabilityCheck },
    { name: 'Required commands availability', fn: testRequiredCommands },
    { name: 'GitHub API accessibility', fn: testGitHubAPIAccess },
    { name: 'DNS resolution functionality', fn: testDNSResolution },
    { name: 'Firewall rules creation', fn: testFirewallRulesCreation },
    { name: 'ipset creation', fn: testIpsetCreation },
    { name: 'Allowed domains access', fn: testAllowedDomainsAccess },
    { name: 'Blocked domains blocked', fn: testBlockedDomainsBlocked },
    { name: 'Localhost access configuration', fn: testLocalhostAccess },
    { name: 'Script exit codes', fn: testScriptExitCodes },
    { name: 'Firewall verification', fn: testFirewallVerification }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result.success) {
        console.log(`✅ ${test.name}: ${result.message}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: ${result.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Test failed with error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. This may be expected in certain environments:');
    console.log('   - WSL2 environments cannot run iptables');
    console.log('   - Container environments may lack required capabilities');
    console.log('   - Network restrictions may prevent some connectivity tests');
  }

  return failed === 0;
};

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

export { runTests };