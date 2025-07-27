#!/usr/bin/env npx tsx

import { spawn } from 'child_process';
import { createServer } from 'net';

// Function to check if a port is available
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
  });
}

// Find the next available port starting from a given port
async function findAvailablePort(startPort: number = 8080): Promise<number> {
  let port = startPort;
  
  while (port < startPort + 100) { // Check up to 100 ports
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  
  throw new Error(`No available port found in range ${startPort}-${startPort + 99}`);
}

// Find available WebSocket port starting from 3001
async function findAvailableWSPort(): Promise<number> {
  return findAvailablePort(3001);
}

async function main() {
  try {
    const [availablePort, wsPort] = await Promise.all([
      findAvailablePort(),
      findAvailableWSPort()
    ]);
    
    console.log(`🚀 Starting Quartz server on port ${availablePort}`);
    console.log(`🔌 WebSocket will use port ${wsPort}`);
    
    // Set environment variable for WebSocket port
    process.env.QUARTZ_WS_PORT = wsPort.toString();
    
    // Start the Quartz server on the available port
    const quartzProcess = spawn('npx', ['quartz', 'build', '--serve', '--port', availablePort.toString(), '--ws-port', wsPort.toString()], {
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping Quartz server...');
      quartzProcess.kill('SIGINT');
      process.exit(0);
    });
    
    quartzProcess.on('close', (code) => {
      console.log(`\n📝 Quartz server exited with code ${code}`);
      process.exit(code || 0);
    });
    
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

main();