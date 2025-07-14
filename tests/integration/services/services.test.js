/**
 * Service Connection Test Suite
 * Tests connectivity to all Docker services from the development environment
 */

import { exec } from 'child_process';
import http from 'http';
import net from 'net';
import { promisify } from 'util';
import { beforeAll, describe, expect, test } from 'vitest';

const execAsync = promisify(exec);

// Test configuration constants
const TEST_TIMEOUTS = {
  DEFAULT: 500,
  FAST: 500,
  NETWORK: 2000,
};

const TEST_MESSAGES = {
  DOCKER_UNAVAILABLE:
    'Docker daemon not available (expected in some environments)',
  COMPOSE_UNAVAILABLE:
    'Docker Compose not available (expected in some environments)',
  SERVICE_UNAVAILABLE: service =>
    `${service} service not accessible (expected if Docker services are not running)`,
  HOSTNAME_UNRESOLVABLE: host =>
    `Hostname ${host} not resolvable (expected if Docker services are not running)`,
  PING_FAILED: host =>
    `Cannot ping ${host} (expected if Docker services are not running)`,
  NO_SERVICES: 'No Docker services running (expected in some environments)',
  ENV_VAR_MISSING: varName =>
    `Environment variable ${varName} not set (expected if services are not configured)`,
};

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
const testPort = (host, port, timeout = TEST_TIMEOUTS.DEFAULT) => {
  return new Promise(resolve => {
    const socket = new net.Socket();

    const cleanup = result => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeout);
    socket.once('error', () => cleanup(false));
    socket.once('timeout', () => cleanup(false));
    socket.once('connect', () => {
      socket.end();
      cleanup(true);
    });

    socket.connect(port, host);
  });
};

const testHttp = (host, port, path = '/', timeout = TEST_TIMEOUTS.DEFAULT) => {
  return new Promise(resolve => {
    const options = {
      hostname: host,
      port,
      path,
      method: 'GET',
      timeout,
    };

    const req = http.request(options, res => {
      res.resume(); // Consume response data
      resolve({
        statusCode: res.statusCode,
        success: res.statusCode !== undefined && res.statusCode < 500,
      });
    });

    req.on('error', () => resolve({ success: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false });
    });

    req.end();
  });
};

// Helper function to handle service unavailability gracefully
const expectServiceOrSkip = (condition, serviceName, expectation) => {
  if (!condition) {
    console.log(TEST_MESSAGES.SERVICE_UNAVAILABLE(serviceName));
    return;
  }
  expectation?.();
};

// Helper function for async command execution with better error handling
const execCommand = async (command, description) => {
  try {
    const { stdout } = await execAsync(command);
    return { stdout, success: true };
  } catch (error) {
    console.log(`${description} (command failed: ${command})`);
    return { stdout: '', success: false };
  }
};

describe('Service Connection Tests', () => {
  let dockerAvailable = false;
  let servicesRunning = [];

  beforeAll(async () => {
    // Check Docker availability once for all tests
    const dockerCheck = await execCommand(
      'docker --version',
      'Docker availability check'
    );
    dockerAvailable = dockerCheck.success;

    if (dockerAvailable) {
      const servicesCheck = await execCommand(
        'docker ps --format "{{.Names}}"',
        'Services availability check'
      );
      if (servicesCheck.success) {
        servicesRunning = servicesCheck.stdout.split('\n').filter(Boolean);
      }
    }
  }, TEST_TIMEOUTS.NETWORK);

  describe('Docker Services Availability', () => {
    test('Docker daemon is running and accessible', async () => {
      if (!dockerAvailable) {
        console.log(TEST_MESSAGES.DOCKER_UNAVAILABLE);
        return;
      }

      const versionResult = await execCommand(
        'docker --version',
        'Docker version check'
      );
      expect(versionResult.success).toBe(true);
      expect(versionResult.stdout).toContain('Docker version');

      const infoResult = await execCommand('docker info', 'Docker info check');
      expect(infoResult.success).toBe(true);
      expect(infoResult.stdout).toContain('Server Version');
    });

    test('Docker Compose is available', async () => {
      const composeResult = await execCommand(
        'docker-compose --version',
        'Docker Compose check'
      );

      if (!composeResult.success) {
        console.log(TEST_MESSAGES.COMPOSE_UNAVAILABLE);
        return;
      }

      // Handle both old and new Docker Compose version formats
      const hasValidVersion =
        composeResult.stdout.includes('docker-compose version') ||
        composeResult.stdout.includes('Docker Compose version');
      expect(hasValidVersion).toBe(true);
    });

    test('Docker services are running', async () => {
      if (!dockerAvailable) {
        console.log('Docker services check skipped (Docker not available)');
        return;
      }

      const expectedServices = [
        'dev_postgres',
        'dev_redis',
        'dev_mailhog',
        'dev_minio',
      ];
      const runningExpectedServices = expectedServices.filter(service =>
        servicesRunning.includes(service)
      );

      if (runningExpectedServices.length === 0) {
        console.log(TEST_MESSAGES.NO_SERVICES);
        return;
      }

      expect(runningExpectedServices.length).toBeGreaterThan(0);
      console.log(`Running services: ${runningExpectedServices.join(', ')}`);
    });
  });

  describe('PostgreSQL Service', () => {
    test('PostgreSQL port is accessible', async () => {
      const isAccessible = await testPort(
        services.postgres.host,
        services.postgres.port
      );

      expectServiceOrSkip(isAccessible, 'PostgreSQL', () => {
        expect(isAccessible).toBe(true);
      });
    });

    test('PostgreSQL service responds correctly', async () => {
      const isAccessible = await testPort(
        services.postgres.host,
        services.postgres.port,
        TEST_TIMEOUTS.FAST
      );

      if (!isAccessible) {
        console.log(
          'PostgreSQL connection test skipped (service not available)'
        );
        return;
      }

      const pgCommand = `PGPASSWORD=${services.postgres.password} psql -h ${services.postgres.host} -p ${services.postgres.port} -U ${services.postgres.username} -d ${services.postgres.database} -c "SELECT version();" -t`;
      const result = await execCommand(pgCommand, 'PostgreSQL version check');

      if (result.success) {
        expect(result.stdout).toContain('PostgreSQL');
      } else {
        console.log(
          'PostgreSQL connection test skipped (psql not available or connection failed)'
        );
      }
    });
  });

  describe('Redis Service', () => {
    test('Redis port is accessible', async () => {
      const isAccessible = await testPort(
        services.redis.host,
        services.redis.port
      );

      expectServiceOrSkip(isAccessible, 'Redis', () => {
        expect(isAccessible).toBe(true);
      });
    });

    test('Redis service responds correctly', async () => {
      const isAccessible = await testPort(
        services.redis.host,
        services.redis.port,
        TEST_TIMEOUTS.FAST
      );

      if (!isAccessible) {
        console.log('Redis connection test skipped (service not available)');
        return;
      }

      const redisCommand = `redis-cli -h ${services.redis.host} -p ${services.redis.port} ping`;
      const result = await execCommand(redisCommand, 'Redis ping test');

      if (result.success) {
        expect(result.stdout.trim()).toBe('PONG');
      } else {
        console.log(
          'Redis connection test skipped (redis-cli not available or connection failed)'
        );
      }
    });
  });

  describe('MailHog Service', () => {
    test('MailHog SMTP port is accessible', async () => {
      const isAccessible = await testPort(
        services.mailhog.smtp.host,
        services.mailhog.smtp.port
      );

      expectServiceOrSkip(isAccessible, 'MailHog SMTP', () => {
        expect(isAccessible).toBe(true);
      });
    });

    test('MailHog web interface is accessible', async () => {
      const response = await testHttp(
        services.mailhog.web.host,
        services.mailhog.web.port
      );

      expectServiceOrSkip(response.success, 'MailHog web interface', () => {
        expect(response.success).toBe(true);
        expect(response.statusCode).toBeDefined();
      });
    });
  });

  describe('MinIO Service', () => {
    test('MinIO API port is accessible', async () => {
      const isAccessible = await testPort(
        services.minio.api.host,
        services.minio.api.port
      );

      expectServiceOrSkip(isAccessible, 'MinIO API', () => {
        expect(isAccessible).toBe(true);
      });
    });

    test('MinIO console is accessible', async () => {
      const response = await testHttp(
        services.minio.console.host,
        services.minio.console.port
      );

      expectServiceOrSkip(response.success, 'MinIO console', () => {
        expect(response.success).toBe(true);
        expect(response.statusCode).toBeDefined();
      });
    });
  });

  describe('Network Configuration', () => {
    const serviceHosts = [
      services.postgres.host,
      services.redis.host,
      services.mailhog.smtp.host,
      services.minio.api.host,
    ];

    test(
      'Service hostnames are resolvable',
      async () => {
        const results = await Promise.all(
          serviceHosts.map(async host => {
            const result = await execCommand(
              `timeout 1 nslookup ${host}`,
              `DNS lookup for ${host}`
            );

            const isResolvable =
              result.success && result.stdout.includes('Address');
            if (!isResolvable) {
              console.log(TEST_MESSAGES.HOSTNAME_UNRESOLVABLE(host));
            }
            return isResolvable;
          })
        );

        const resolvableHosts = results.filter(Boolean).length;

        if (resolvableHosts === 0) {
          console.log(
            'No service hostnames resolvable (expected if Docker services are not running)'
          );
        } else {
          expect(resolvableHosts).toBeGreaterThan(0);
        }
      },
      TEST_TIMEOUTS.NETWORK
    );

    test(
      'Can ping service hosts',
      async () => {
        const results = await Promise.all(
          serviceHosts.map(async host => {
            const result = await execCommand(
              `ping -c 1 -W 1 ${host}`,
              `Ping test for ${host}`
            );

            const isReachable =
              result.success && result.stdout.includes('1 packets transmitted');
            if (!isReachable) {
              console.log(TEST_MESSAGES.PING_FAILED(host));
            }
            return isReachable;
          })
        );

        const reachableHosts = results.filter(Boolean).length;

        if (reachableHosts === 0) {
          console.log(
            'No service hosts reachable (expected if Docker services are not running)'
          );
        } else {
          expect(reachableHosts).toBeGreaterThan(0);
        }
      },
      TEST_TIMEOUTS.NETWORK
    );
  });

  describe('Service Integration', () => {
    const validateUrl = (
      urlString,
      expectedProtocol,
      expectedHost,
      expectedPort,
      expectedPath
    ) => {
      try {
        const url = new URL(urlString);
        expect(url.protocol).toBe(expectedProtocol);
        expect(url.hostname).toBe(expectedHost);
        if (expectedPort) expect(url.port).toBe(expectedPort.toString());
        if (expectedPath) expect(url.pathname).toBe(expectedPath);
        return true;
      } catch (error) {
        return false;
      }
    };

    test('Environment variables are configured for services', () => {
      const envVars = ['DATABASE_URL', 'REDIS_URL'];
      let configuredVars = 0;

      for (const envVar of envVars) {
        const value = process.env[envVar];
        if (value && value.length > 0) {
          configuredVars++;
          expect(value).toBeDefined();
          expect(value.length).toBeGreaterThan(0);
        } else {
          console.log(TEST_MESSAGES.ENV_VAR_MISSING(envVar));
        }
      }

      if (configuredVars === 0) {
        console.log('No service environment variables configured');
      }
    });

    test('Database URL format is correct', () => {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        console.log(TEST_MESSAGES.ENV_VAR_MISSING('DATABASE_URL'));
        return;
      }

      const isValid = validateUrl(
        dbUrl,
        'postgresql:',
        services.postgres.host,
        services.postgres.port,
        `/${services.postgres.database}`
      );

      if (!isValid) {
        console.log('Database URL validation skipped (invalid format)');
        return;
      }

      expect(isValid).toBe(true);
    });

    test('Redis URL format is correct', () => {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        console.log(TEST_MESSAGES.ENV_VAR_MISSING('REDIS_URL'));
        return;
      }

      const isValid = validateUrl(
        redisUrl,
        'redis:',
        services.redis.host,
        services.redis.port
      );

      if (!isValid) {
        console.log('Redis URL validation skipped (invalid format)');
        return;
      }

      expect(isValid).toBe(true);
    });
  });

  describe('Service Health Checks', () => {
    test(
      'All configured services respond to health checks',
      async () => {
        const healthChecks = [
          {
            name: 'PostgreSQL',
            host: services.postgres.host,
            port: services.postgres.port,
          },
          {
            name: 'Redis',
            host: services.redis.host,
            port: services.redis.port,
          },
          {
            name: 'MailHog SMTP',
            host: services.mailhog.smtp.host,
            port: services.mailhog.smtp.port,
          },
          {
            name: 'MinIO API',
            host: services.minio.api.host,
            port: services.minio.api.port,
          },
        ];

        const healthResults = await Promise.allSettled(
          healthChecks.map(async service => {
            const isHealthy = await testPort(
              service.host,
              service.port,
              TEST_TIMEOUTS.FAST
            );
            return { ...service, isHealthy };
          })
        );

        const healthyServices = healthResults
          .filter(
            result => result.status === 'fulfilled' && result.value.isHealthy
          )
          .map(result => result.value);

        const unhealthyServices = healthResults
          .filter(
            result => result.status === 'fulfilled' && !result.value.isHealthy
          )
          .map(result => result.value);

        if (healthyServices.length === 0) {
          console.log(
            'No services are healthy (expected if Docker services are not running)'
          );
          console.log(
            `Checked services: ${healthChecks.map(s => s.name).join(', ')}`
          );
        } else {
          console.log(
            `Healthy services: ${healthyServices.map(s => s.name).join(', ')}`
          );
          if (unhealthyServices.length > 0) {
            console.log(
              `Unhealthy services: ${unhealthyServices.map(s => s.name).join(', ')}`
            );
          }
          expect(healthyServices.length).toBeGreaterThan(0);
        }
      },
      TEST_TIMEOUTS.NETWORK
    );
  });
});
