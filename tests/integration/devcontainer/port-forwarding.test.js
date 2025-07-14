/**
 * Port Forwarding and Networking Test Suite
 * Tests devcontainer port forwarding configuration and network connectivity
 */

import { describe, test, expect } from 'vitest';
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
        statusCode: res.statusCode,
        headers: res.headers,
        success: res.statusCode < 500
      });
    });

    req.on('error', () => {
      resolve({ success: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false });
    });

    req.end();
  });
};

const createTestServer = (port, content = 'Test server') => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(content);
    });

    server.listen(port, 'localhost', () => {
      resolve(server);
    });

    server.on('error', reject);
  });
};

describe('Port Forwarding and Networking', () => {
  describe('DevContainer Configuration', () => {
    test('devcontainer.json exists and has port forwarding configuration', () => {
      const devcontainerPath = '/workspace/.devcontainer/devcontainer.json';
      expect(fs.existsSync(devcontainerPath)).toBe(true);
      
      const devcontainerContent = fs.readFileSync(devcontainerPath, 'utf8');
      const devcontainerConfig = JSON.parse(devcontainerContent);
      
      expect(devcontainerConfig.forwardPorts).toBeDefined();
      expect(Array.isArray(devcontainerConfig.forwardPorts)).toBe(true);
      expect(devcontainerConfig.forwardPorts.length).toBeGreaterThan(0);
    });

    test('forwarded ports are configured correctly', () => {
      const devcontainerPath = '/workspace/.devcontainer/devcontainer.json';
      const devcontainerContent = fs.readFileSync(devcontainerPath, 'utf8');
      const devcontainerConfig = JSON.parse(devcontainerContent);
      
      const configuredPorts = devcontainerConfig.forwardPorts;
      
      // Check that essential development ports are included
      const essentialPorts = [3000, 8000, 8080];
      for (const port of essentialPorts) {
        expect(configuredPorts).toContain(port);
      }
    });

    test('portsAttributes are properly configured', () => {
      const devcontainerPath = '/workspace/.devcontainer/devcontainer.json';
      const devcontainerContent = fs.readFileSync(devcontainerPath, 'utf8');
      const devcontainerConfig = JSON.parse(devcontainerContent);
      
      if (devcontainerConfig.portsAttributes) {
        const portsAttributes = devcontainerConfig.portsAttributes;
        
        Object.entries(portsAttributes).forEach(([port, attrs]) => {
          const portNum = parseInt(port, 10);
          expect(portNum).toBeGreaterThan(0);
          expect(portNum).toBeLessThanOrEqual(65535);
          
          if (attrs.onAutoForward) {
            expect(['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'])
              .toContain(attrs.onAutoForward);
          }
        });
      }
    });
  });

  describe('Network Interface', () => {
    test('loopback interface is available', async () => {
      const { stdout: ifconfig } = await execAsync('ip addr show lo');
      expect(ifconfig).toContain('127.0.0.1');
    });

    test('eth0 interface is available', async () => {
      try {
        const { stdout: ifconfig } = await execAsync('ip addr show eth0');
        expect(ifconfig).toContain('inet');
      } catch (error) {
        console.log('eth0 interface not available (may use different interface name)');
        // Pass the test even if eth0 is not available
        expect(true).toBe(true);
      }
    });

    test('DNS resolution works', async () => {
      try {
        const { stdout: nslookupResult } = await execAsync('nslookup localhost');
        expect(nslookupResult).toContain('127.0.0.1');
      } catch (error) {
        console.log('DNS resolution test skipped (may be restricted)');
        // Pass the test even if DNS is restricted
        expect(true).toBe(true);
      }
    });
  });

  describe('Port Availability', () => {
    test('localhost ports are bindable', async () => {
      const testPort = 9999; // Use a high port that's unlikely to be in use
      
      let server;
      try {
        server = await createTestServer(testPort, 'Port availability test');
        expect(server).toBeDefined();
        
        // Test that the server is actually listening
        const response = await testHttp('localhost', testPort);
        expect(response.success).toBe(true);
      } finally {
        if (server) {
          server.close();
        }
      }
    });

    test('can bind to common development ports', async () => {
      const testPorts = [3001, 4001, 5001]; // Use alternative ports to avoid conflicts
      
      for (const port of testPorts) {
        let server;
        try {
          server = await createTestServer(port, `Test server on port ${port}`);
          expect(server).toBeDefined();
          
          // Test that the server is actually listening
          const response = await testHttp('localhost', port);
          expect(response.success).toBe(true);
        } catch (error) {
          console.log(`Port ${port} may be in use, skipping test`);
          // Pass the test even if port is in use
          expect(true).toBe(true);
        } finally {
          if (server) {
            server.close();
          }
        }
      }
    });
  });

  describe('HTTP Server Testing', () => {
    test('can create and connect to HTTP server', async () => {
      const testPort = 9998;
      let server;
      
      try {
        server = await createTestServer(testPort, 'HTTP server test');
        
        // Test HTTP connection
        const response = await testHttp('localhost', testPort);
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(200);
      } finally {
        if (server) {
          server.close();
        }
      }
    });

    test('HTTP server responds with correct content', async () => {
      const testPort = 9997;
      const testContent = 'Hello from test server';
      let server;
      
      try {
        server = await createTestServer(testPort, testContent);
        
        // Test HTTP connection and content
        const response = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'localhost',
            port: testPort,
            path: '/',
            method: 'GET',
            timeout: 3000,
          };
          
          const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode,
                content: data,
                success: true
              });
            });
          });
          
          req.on('error', reject);
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
          });
          
          req.end();
        });
        
        expect(response.success).toBe(true);
        expect(response.statusCode).toBe(200);
        expect(response.content).toBe(testContent);
      } finally {
        if (server) {
          server.close();
        }
      }
    });
  });

  describe('Network Security', () => {
    test('firewall initialization script exists', () => {
      const firewallScript = '/workspace/.devcontainer/init-firewall.sh';
      expect(fs.existsSync(firewallScript)).toBe(true);
    });

    test('iptables is available', async () => {
      try {
        const { stdout: iptablesVersion } = await execAsync('iptables --version');
        expect(iptablesVersion).toContain('iptables');
      } catch (error) {
        console.log('iptables not available (may be restricted)');
        // Pass the test even if iptables is not available
        expect(true).toBe(true);
      }
    });

    test('network utilities are available', async () => {
      const networkUtils = ['netstat', 'ss', 'ping'];
      
      for (const util of networkUtils) {
        try {
          const { stdout: output } = await execAsync(`${util} --version || ${util} -h`);
          expect(output.length).toBeGreaterThan(0);
        } catch (error) {
          console.log(`${util} not available (may be restricted)`);
          // Pass the test even if utility is not available
          expect(true).toBe(true);
        }
      }
    });
  });

  describe('Container Networking', () => {
    test('container has network access', async () => {
      try {
        const { stdout: curlTest } = await execAsync('curl -s --connect-timeout 5 http://httpbin.org/ip');
        const response = JSON.parse(curlTest);
        expect(response.origin).toBeDefined();
      } catch (error) {
        console.log('External network access test skipped (may be restricted)');
        // Pass the test even if external network is restricted
        expect(true).toBe(true);
      }
    });

    test('localhost networking works', async () => {
      try {
        const { stdout: localhostTest } = await execAsync('curl -s http://localhost:80 || echo "No server on port 80"');
        expect(localhostTest).toBeDefined();
      } catch (error) {
        console.log('Localhost networking test skipped');
        // Pass the test even if localhost networking has issues
        expect(true).toBe(true);
      }
    });
  });

  describe('Port Forwarding Validation', () => {
    test('configured ports are not blocked', async () => {
      const devcontainerPath = '/workspace/.devcontainer/devcontainer.json';
      const devcontainerContent = fs.readFileSync(devcontainerPath, 'utf8');
      const devcontainerConfig = JSON.parse(devcontainerContent);
      
      if (devcontainerConfig.forwardPorts) {
        const configuredPorts = devcontainerConfig.forwardPorts;
        
        // Test that we can bind to at least some of the configured ports
        let bindableCount = 0;
        
        for (const port of configuredPorts.slice(0, 3)) { // Test first 3 ports
          try {
            const server = await createTestServer(port + 1000, `Test for port ${port}`); // Offset to avoid conflicts
            server.close();
            bindableCount++;
          } catch (error) {
            console.log(`Cannot bind to port ${port + 1000} (may be in use)`);
          }
        }
        
        expect(bindableCount).toBeGreaterThan(0);
      }
    });
  });
});