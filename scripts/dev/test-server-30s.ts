#!/usr/bin/env npx tsx

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, createWriteStream } from 'fs';
import { join } from 'path';

async function testServer(timeout: number = 30000) {
  const logFile = join(process.cwd(), 'temp-server-test-30s.log');
  const startTime = Date.now();
  
  console.log(`🧪 Testing server for ${timeout/1000} seconds (extended), logging to ${logFile}`);
  
  // Start the server and redirect output to log file
  const serverProcess = spawn('npm', ['run', 'serve-auto'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });
  
  const logStream = createWriteStream(logFile, { flags: 'w' });
  
  serverProcess.stdout?.pipe(logStream);
  serverProcess.stderr?.pipe(logStream);
  
  // Set timeout to kill the process
  const timer = setTimeout(() => {
    console.log(`⏰ ${timeout/1000}s timeout reached, stopping server...`);
    serverProcess.kill('SIGTERM');
    
    // Give it a moment to clean up, then force kill if needed
    setTimeout(() => {
      if (!serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 2000);
  }, timeout);
  
  return new Promise<void>((resolve) => {
    serverProcess.on('close', (code) => {
      clearTimeout(timer);
      logStream.end();
      
      const endTime = Date.now();
      const actualRunTime = endTime - startTime;
      
      console.log(`📝 Server stopped after ${Math.round(actualRunTime/1000)}s with code ${code}`);
      console.log(`📋 Output logged to: ${logFile}`);
      
      // Read and analyze the log
      try {
        const logContent = readFileSync(logFile, 'utf8');
        const lines = logContent.split('\n');
        const lastFewLines = lines.slice(-10).join('\n');
        
        console.log('\n📊 Last few lines of output:');
        console.log('---');
        console.log(lastFewLines);
        console.log('---');
        
        // More detailed analysis for 30s run
        const hasErrorsNearEnd = lastFewLines.toLowerCase().includes('error') || 
                                 lastFewLines.toLowerCase().includes('failed') ||
                                 lastFewLines.toLowerCase().includes('cannot');
        
        const hasSuccessIndicators = logContent.includes('Started a Quartz server listening') ||
                                    logContent.includes('server listening');
        
        const buildCompleted = logContent.includes('Done processing') || 
                              logContent.includes('Emitted');
        
        console.log('\n📈 Analysis:');
        console.log(`  - Build completed: ${buildCompleted ? '✅' : '❌'}`);
        console.log(`  - Server started: ${hasSuccessIndicators ? '✅' : '❌'}`);
        console.log(`  - Errors detected: ${hasErrorsNearEnd ? '⚠️' : '✅'}`);
        console.log(`  - Runtime: ${Math.round(actualRunTime/1000)}s / ${timeout/1000}s`);
        
        if (hasSuccessIndicators && buildCompleted && !hasErrorsNearEnd) {
          console.log('\n🎉 Server test completed successfully!');
        } else {
          console.log('\n⚠️  Server test completed with issues. Check the log for details.');
        }
        
      } catch (err) {
        console.error('❌ Error reading log file:', err);
      }
      
      resolve();
    });
  });
}

// Run with 30 second timeout
testServer(30000).catch(console.error);