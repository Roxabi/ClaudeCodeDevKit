#!/usr/bin/env node

import net from 'net';

const containers = [
  { name: 'PostgreSQL', ip: '172.19.0.2', port: 5432 },
  { name: 'Redis', ip: '172.19.0.4', port: 6379 },
  { name: 'MailHog SMTP', ip: '172.19.0.3', port: 1025 },
  { name: 'MailHog Web', ip: '172.19.0.3', port: 8025 },
  { name: 'MinIO API', ip: '172.19.0.5', port: 9000 },
  { name: 'MinIO Console', ip: '172.19.0.5', port: 9001 }
];

const testPort = (host, port, timeout = 3000) => {
  return new Promise((resolve) => {
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

console.log('Testing connectivity to services via container IPs');
console.log('=' .repeat(60));

for (const container of containers) {
  const isOpen = await testPort(container.ip, container.port);
  const status = isOpen ? '✅ Open' : '❌ Closed';
  console.log(`${container.name.padEnd(20)} ${container.ip}:${container.port.toString().padEnd(5)} ${status}`);
}

console.log('=' .repeat(60));