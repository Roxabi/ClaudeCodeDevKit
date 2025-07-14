#!/usr/bin/env node

import net from 'net';

const hostIP = '172.17.0.1';
const services = [
  { name: 'PostgreSQL', port: 5432 },
  { name: 'Redis', port: 6379 },
  { name: 'MailHog SMTP', port: 1025 },
  { name: 'MailHog Web', port: 8025 },
  { name: 'MinIO API', port: 9000 },
  { name: 'MinIO Console', port: 9001 },
];

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

console.log(`Testing connectivity to services on host IP: ${hostIP}`);
console.log('='.repeat(60));

for (const service of services) {
  const isOpen = await testPort(hostIP, service.port);
  const status = isOpen ? '✅ Open' : '❌ Closed';
  console.log(
    `${service.name.padEnd(20)} Port ${service.port.toString().padEnd(5)} ${status}`
  );
}

console.log('='.repeat(60));
