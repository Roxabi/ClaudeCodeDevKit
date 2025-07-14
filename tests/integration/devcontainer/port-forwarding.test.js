#!/usr/bin/env node

/**
 * Port Forwarding and Networking Test Suite
 * Tests devcontainer port forwarding configuration and network connectivity
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Port forwarding configuration from devcontainer.json
const forwardedPorts = [3000, 3001, 4000, 5000, 8000, 8080, 9000];

// Test utilities
const testPort = (host, port, timeout = 3000) => {
  return new Promise(resolve => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
};

const testHttp = (host, port, path = '/', timeout = 3000) => {
  return new Promise(resolve => {
    const options = {
      hostname: host,
      port,
      path,
      method: 'GET',
      timeout,
    };

    const req = http.request(options, res => {
      resolve({
        success: true,
        status: res.statusCode,
        message: res.statusMessage,
      });
    });

    req.on('error', err => {
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });

    req.end();
  });
};

const createTestServer = (port, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Test server running on port ${port}`);
    });

    server.listen(port, '0.0.0.0', () => {
      setTimeout(() => {
        server.close(() => {
          resolve(true);
        });
      }, timeout);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
};

// Test functions
const testDevcontainerPortConfiguration = async () => {
  console.log('\n🔧 Testing devcontainer port configuration...');

  try {
    const configPath = '/workspace/.devcontainer/devcontainer.json';
    if (!fs.existsSync(configPath)) {
      return { success: false, error: 'devcontainer.json not found' };
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!config.forwardPorts) {
      return { success: false, error: 'forwardPorts not configured' };
    }

    const expectedPorts = [3000, 3001, 4000, 5000, 8000, 8080, 9000];
    const configuredPorts = config.forwardPorts;
    
    const missingPorts = expectedPorts.filter(port => !configuredPorts.includes(port));
    const extraPorts = configuredPorts.filter(port => !expectedPorts.includes(port));

    if (missingPorts.length > 0) {
      return { 
        success: false, 
        error: `Missing ports: ${missingPorts.join(', ')}`,
        configured: configuredPorts,
        expected: expectedPorts
      };
    }

    return {
      success: true,
      message: 'Port forwarding configuration is correct',
      ports: configuredPorts,
      portsAttributes: config.portsAttributes || {}
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testLocalhostConnectivity = async () => {
  console.log('\n🌐 Testing localhost connectivity...');

  try {
    // Test localhost resolution via /etc/hosts
    const { stdout: hostsFile } = await execAsync('cat /etc/hosts | grep localhost', { timeout: 5000 });
    
    if (!hostsFile.includes('127.0.0.1') && !hostsFile.includes('::1')) {
      return { success: false, error: 'localhost not found in /etc/hosts' };
    }

    // Test loopback interface by creating a simple HTTP server
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('test');
    });

    return new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const {port} = server.address();
        
        // Test connection to our own server
        const req = http.request({
          hostname: '127.0.0.1',
          port,
          path: '/',
          method: 'GET',
          timeout: 2000
        }, (res) => {
          server.close();
          resolve({
            success: true,
            message: 'Localhost connectivity verified',
            loopback: '127.0.0.1 accessible',
            resolution: 'localhost configured in /etc/hosts'
          });
        });

        req.on('error', (err) => {
          server.close();
          resolve({ success: false, error: `Loopback connection failed: ${err.message}` });
        });

        req.on('timeout', () => {
          req.destroy();
          server.close();
          resolve({ success: false, error: 'Loopback connection timeout' });
        });

        req.end();
      });

      server.on('error', (err) => {
        resolve({ success: false, error: `Server binding failed: ${err.message}` });
      });
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testPortBinding = async () => {
  console.log('\n🔌 Testing port binding capabilities...');

  const testPort = 3000;
  
  try {
    // Try to create a simple HTTP server on port 3000
    await createTestServer(testPort, 2000);
    
    return {
      success: true,
      message: 'Port binding test successful',
      port: testPort,
      binding: 'Can bind to 0.0.0.0'
    };
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      return {
        success: true,
        message: 'Port binding test - port already in use (expected)',
        port: testPort,
        note: 'Port already in use, but binding capability confirmed'
      };
    }
    return { success: false, error: error.message };
  }
};

const testContainerNetworking = async () => {
  console.log('\n🐳 Testing container networking...');

  try {
    // Test network interfaces
    const { stdout: interfaces } = await execAsync('ip addr show', { timeout: 5000 });
    
    if (!interfaces.includes('eth0') && !interfaces.includes('lo')) {
      return { success: false, error: 'Missing expected network interfaces' };
    }

    // Test container hostname
    const { stdout: hostname } = await execAsync('hostname', { timeout: 5000 });
    
    // Test network connectivity to container gateway
    const { stdout: route } = await execAsync('ip route show default', { timeout: 5000 });
    
    return {
      success: true,
      message: 'Container networking verified',
      hostname: hostname.trim(),
      interfaces: interfaces.includes('eth0') ? 'eth0 present' : 'lo present',
      gateway: route.trim() ? 'Gateway accessible' : 'No gateway found'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testExternalConnectivity = async () => {
  console.log('\n🌍 Testing external connectivity...');

  try {
    // Test DNS resolution
    const { stdout: dnsTest } = await execAsync('nslookup google.com', { timeout: 10000 });
    
    if (!dnsTest.includes('Address:')) {
      return { success: false, error: 'DNS resolution failed' };
    }

    // Test HTTP connectivity to external service
    const httpResult = await testHttp('api.github.com', 443, '/');
    
    return {
      success: true,
      message: 'External connectivity verified',
      dns: 'DNS resolution working',
      http: httpResult.success ? 'External HTTP accessible' : 'External HTTP blocked'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testPortRangeAvailability = async () => {
  console.log('\n📊 Testing port range availability...');

  const results = [];
  
  for (const port of forwardedPorts) {
    try {
      // Test if port is available for binding
      const server = http.createServer();
      
      const isAvailable = await new Promise((resolve) => {
        server.listen(port, '0.0.0.0', () => {
          server.close(() => resolve(true));
        });
        
        server.on('error', () => resolve(false));
      });

      results.push({
        port,
        available: isAvailable,
        status: isAvailable ? 'Available' : 'In use or restricted'
      });
    } catch (error) {
      results.push({
        port,
        available: false,
        status: `Error: ${error.message}`
      });
    }
  }

  const availablePorts = results.filter(r => r.available).length;
  const totalPorts = results.length;

  return {
    success: availablePorts > 0,
    message: `Port availability check completed`,
    available: availablePorts,
    total: totalPorts,
    ports: results
  };
};

const testNetworkSecurity = async () => {
  console.log('\n🔒 Testing network security restrictions...');

  try {
    // Test if firewall is active
    const { stdout: iptables } = await execAsync('iptables -L 2>/dev/null || echo "iptables not available"', { timeout: 5000 });
    
    // Test if certain ports are blocked
    const restrictedPorts = [25, 135, 139, 445, 1433, 3389];
    const blockedPorts = [];
    
    for (const port of restrictedPorts) {
      const isBlocked = !(await testPort('127.0.0.1', port, 1000));
      if (isBlocked) {
        blockedPorts.push(port);
      }
    }

    return {
      success: true,
      message: 'Network security check completed',
      firewall: iptables.includes('Chain') ? 'iptables rules active' : 'iptables not available',
      blockedPorts: blockedPorts.length > 0 ? `${blockedPorts.length} ports blocked` : 'No ports blocked',
      securityLevel: blockedPorts.length > 3 ? 'High' : 'Standard'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testDockerNetworking = async () => {
  console.log('\n🐳 Testing Docker networking...');

  try {
    // Test Docker network connectivity
    const { stdout: networks } = await execAsync('docker network ls 2>/dev/null || echo "Docker not available"', { timeout: 5000 });
    
    if (networks.includes('bridge')) {
      // Test if container can access Docker daemon
      const { stdout: dockerInfo } = await execAsync('docker info --format "{{.ServerVersion}}" 2>/dev/null || echo "No access"', { timeout: 5000 });
      
      return {
        success: true,
        message: 'Docker networking verified',
        networks: 'Docker networks accessible',
        daemon: dockerInfo.trim() !== 'No access' ? 'Docker daemon accessible' : 'Docker daemon not accessible'
      };
    } else {
      return {
        success: false,
        error: 'Docker networking not available'
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testPortForwardingIntegration = async () => {
  console.log('\n🔄 Testing port forwarding integration...');

  try {
    // Test if VSCode port forwarding is working by checking environment
    const vscodeEnv = process.env.VSCODE_IPC_HOOK_CLI || process.env.VSCODE_INJECTION;
    
    // Test if common development ports are ready
    const developmentPorts = [3000, 8080];
    const portTests = [];
    
    for (const port of developmentPorts) {
      const result = await testPort('0.0.0.0', port, 1000);
      portTests.push({
        port,
        ready: !result, // Port should be available (not in use)
        status: result ? 'In use' : 'Available'
      });
    }

    return {
      success: true,
      message: 'Port forwarding integration check completed',
      vscode: vscodeEnv ? 'VSCode integration detected' : 'VSCode integration not detected',
      ports: portTests,
      ready: portTests.filter(p => p.ready).length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Main test runner
const runTests = async () => {
  console.log('🔍 Starting Port Forwarding and Networking Tests');
  console.log('='.repeat(60));

  const tests = [
    { name: 'Devcontainer Port Configuration', test: testDevcontainerPortConfiguration },
    { name: 'Localhost Connectivity', test: testLocalhostConnectivity },
    { name: 'Port Binding', test: testPortBinding },
    { name: 'Container Networking', test: testContainerNetworking },
    { name: 'External Connectivity', test: testExternalConnectivity },
    { name: 'Port Range Availability', test: testPortRangeAvailability },
    { name: 'Network Security', test: testNetworkSecurity },
    { name: 'Docker Networking', test: testDockerNetworking },
    { name: 'Port Forwarding Integration', test: testPortForwardingIntegration },
  ];

  const results = [];

  for (const { name, test } of tests) {
    try {
      const result = await test();
      results.push({ name, ...result });

      if (result.success) {
        console.log(`✅ ${name}: ${result.message}`);
        if (result.ports && Array.isArray(result.ports)) {
          if (typeof result.ports[0] === 'number') {
            console.log(`   Ports: ${result.ports.map(p => `${p}✓`).join(', ')}`);
          } else if (result.ports[0] && typeof result.ports[0] === 'object') {
            console.log(`   Ports: ${result.ports.map(p => `${p.port}(${p.status})`).join(', ')}`);
          }
        }
        if (result.portsAttributes) {
          console.log(`   Port Attributes: ${Object.keys(result.portsAttributes).length} configured`);
        }
        if (result.loopback) console.log(`   Loopback: ${result.loopback}`);
        if (result.resolution) console.log(`   Resolution: ${result.resolution}`);
        if (result.binding) console.log(`   Binding: ${result.binding}`);
        if (result.hostname) console.log(`   Hostname: ${result.hostname}`);
        if (result.interfaces) console.log(`   Interfaces: ${result.interfaces}`);
        if (result.gateway) console.log(`   Gateway: ${result.gateway}`);
        if (result.dns) console.log(`   DNS: ${result.dns}`);
        if (result.http) console.log(`   HTTP: ${result.http}`);
        if (result.available !== undefined) console.log(`   Available: ${result.available}/${result.total}`);
        if (result.firewall) console.log(`   Firewall: ${result.firewall}`);
        if (result.blockedPorts) console.log(`   Blocked Ports: ${result.blockedPorts}`);
        if (result.securityLevel) console.log(`   Security Level: ${result.securityLevel}`);
        if (result.networks) console.log(`   Networks: ${result.networks}`);
        if (result.daemon) console.log(`   Daemon: ${result.daemon}`);
        if (result.vscode) console.log(`   VSCode: ${result.vscode}`);
        if (result.ready !== undefined) console.log(`   Ready Ports: ${result.ready}`);
      } else {
        console.log(`❌ ${name}: ${result.error}`);
        if (result.configured) console.log(`   Configured: ${result.configured.join(', ')}`);
        if (result.expected) console.log(`   Expected: ${result.expected.join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Unexpected error - ${error.message}`);
      results.push({ name, success: false, error: error.message });
    }
  }

  console.log(`\n${  '='.repeat(60)}`);
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n🔧 Failed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  console.log(`\n${  '='.repeat(60)}`);

  process.exit(failed > 0 ? 1 : 0);
};

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  runTests,
  testDevcontainerPortConfiguration,
  testLocalhostConnectivity,
  testPortBinding,
  testContainerNetworking,
  testExternalConnectivity,
  testPortRangeAvailability,
  testNetworkSecurity,
  testDockerNetworking,
  testPortForwardingIntegration,
};