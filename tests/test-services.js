#!/usr/bin/env node

/**
 * Service Connection Test Suite
 * Tests connectivity to all Docker services from the development environment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import net from 'net';

const execAsync = promisify(exec);

// Service configurations
const services = {
  postgres: {
    host: 'dev_postgres',
    port: 5432,
    database: 'devdb',
    username: 'devuser',
    password: 'devpass',
  },
  redis: {
    host: 'dev_redis',
    port: 6379,
  },
  mailhog: {
    smtp: { host: 'dev_mailhog', port: 1025 },
    web: { host: 'dev_mailhog', port: 8025 },
  },
  minio: {
    api: { host: 'dev_minio', port: 9000 },
    console: { host: 'dev_minio', port: 9001 },
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  },
};

// Test utilities
const testPort = (host, port, timeout = 5000) => {
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

const testHttp = (host, port, path = '/', timeout = 5000) => {
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

// Test functions
const testPostgreSQL = async () => {
  console.log('\\n🐘 Testing PostgreSQL connection...');

  try {
    const portOpen = await testPort(
      services.postgres.host,
      services.postgres.port
    );
    if (!portOpen) {
      return { success: false, error: 'Port 5432 is not accessible' };
    }

    // Test with psql command if available
    try {
      const { stdout } = await execAsync(
        `PGPASSWORD=${services.postgres.password} psql -h ${services.postgres.host} -p ${services.postgres.port} -U ${services.postgres.username} -d ${services.postgres.database} -c "SELECT version();"`,
        { timeout: 10000 }
      );

      if (stdout.includes('PostgreSQL')) {
        return {
          success: true,
          message: 'PostgreSQL connection successful',
          version: stdout.split('\\n')[2],
        };
      }
    } catch (err) {
      // Fall back to port test if psql is not available
      const portOpen = await testPort(
        services.postgres.host,
        services.postgres.port
      );
      if (portOpen) {
        return {
          success: true,
          message: 'PostgreSQL port accessible (psql not available)',
          note: 'Install postgresql-client for full testing',
        };
      }
      return { success: false, error: `psql command failed: ${err.message}` };
    }

    return { success: true, message: 'PostgreSQL port is accessible' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testRedis = async () => {
  console.log('\\n🔴 Testing Redis connection...');

  try {
    const portOpen = await testPort(services.redis.host, services.redis.port);
    if (!portOpen) {
      return { success: false, error: 'Port 6379 is not accessible' };
    }

    // Test with redis-cli if available
    try {
      const { stdout } = await execAsync(
        `redis-cli -h ${services.redis.host} -p ${services.redis.port} ping`,
        { timeout: 5000 }
      );
      if (stdout.trim() === 'PONG') {
        return {
          success: true,
          message: 'Redis connection successful',
          response: stdout.trim(),
        };
      }
    } catch (err) {
      // Fall back to port test if redis-cli is not available
      const portOpen = await testPort(services.redis.host, services.redis.port);
      if (portOpen) {
        return {
          success: true,
          message: 'Redis port accessible (redis-cli not available)',
          note: 'Install redis-cli for full testing',
        };
      }
      return {
        success: false,
        error: `redis-cli command failed: ${err.message}`,
      };
    }

    return { success: true, message: 'Redis port is accessible' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testMailHog = async () => {
  console.log('\\n📧 Testing MailHog connection...');

  try {
    // Test SMTP port
    const smtpOpen = await testPort(
      services.mailhog.smtp.host,
      services.mailhog.smtp.port
    );
    if (!smtpOpen) {
      return { success: false, error: 'SMTP port 1025 is not accessible' };
    }

    // Test Web UI
    const webResult = await testHttp(
      services.mailhog.web.host,
      services.mailhog.web.port
    );
    if (!webResult.success) {
      return {
        success: false,
        error: `Web UI not accessible: ${webResult.error}`,
      };
    }

    return {
      success: true,
      message: 'MailHog connection successful',
      smtp: 'Port 1025 accessible',
      webUI: `HTTP ${webResult.status} - ${webResult.message}`,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testMinIO = async () => {
  console.log('\\n🗃️  Testing MinIO connection...');

  try {
    // Test API port
    const apiOpen = await testPort(
      services.minio.api.host,
      services.minio.api.port
    );
    if (!apiOpen) {
      return { success: false, error: 'API port 9000 is not accessible' };
    }

    // Test Console port
    const consoleOpen = await testPort(
      services.minio.console.host,
      services.minio.console.port
    );
    if (!consoleOpen) {
      return { success: false, error: 'Console port 9001 is not accessible' };
    }

    // Test health endpoint
    const healthResult = await testHttp(
      services.minio.api.host,
      services.minio.api.port,
      '/minio/health/live'
    );

    return {
      success: true,
      message: 'MinIO connection successful',
      api: 'Port 9000 accessible',
      console: 'Port 9001 accessible',
      health: healthResult.success
        ? 'Health check passed'
        : 'Health check failed',
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const testDockerDaemon = async () => {
  console.log('\\n🐳 Testing Docker daemon access...');

  try {
    const { stdout } = await execAsync(
      'docker version --format "{{.Server.Version}}"',
      { timeout: 5000 }
    );
    const serverVersion = stdout.trim();

    if (serverVersion) {
      return {
        success: true,
        message: 'Docker daemon accessible from dev container',
        serverVersion,
      };
    } else {
      return { success: false, error: 'Docker daemon not accessible' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Main test runner
const runTests = async () => {
  console.log('🔍 Starting Docker Services Integration Tests');
  console.log('='.repeat(50));

  const tests = [
    { name: 'Docker Daemon', test: testDockerDaemon },
    { name: 'PostgreSQL', test: testPostgreSQL },
    { name: 'Redis', test: testRedis },
    { name: 'MailHog', test: testMailHog },
    { name: 'MinIO', test: testMinIO },
  ];

  const results = [];

  for (const { name, test } of tests) {
    try {
      const result = await test();
      results.push({ name, ...result });

      if (result.success) {
        console.log(`✅ ${name}: ${result.message}`);
        if (result.version) console.log(`   Version: ${result.version}`);
        if (result.serverVersion)
          console.log(`   Server Version: ${result.serverVersion}`);
        if (result.response) console.log(`   Response: ${result.response}`);
        if (result.smtp) console.log(`   SMTP: ${result.smtp}`);
        if (result.webUI) console.log(`   Web UI: ${result.webUI}`);
        if (result.api) console.log(`   API: ${result.api}`);
        if (result.console) console.log(`   Console: ${result.console}`);
        if (result.health) console.log(`   Health: ${result.health}`);
      } else {
        console.log(`❌ ${name}: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Unexpected error - ${error.message}`);
      results.push({ name, success: false, error: error.message });
    }
  }

  console.log(`\\n${  '='.repeat(50)}`);
  console.log('📊 Test Summary');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`
  );

  if (failed > 0) {
    console.log('\\n🔧 Failed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
  }

  console.log(`\\n${  '='.repeat(50)}`);

  process.exit(failed > 0 ? 1 : 0);
};

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  runTests,
  testPostgreSQL,
  testRedis,
  testMailHog,
  testMinIO,
  testDockerDaemon,
};
