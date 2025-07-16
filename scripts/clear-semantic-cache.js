#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cacheDir = path.join(__dirname, '..', '.quartz-cache', 'semantic')

async function clearSemanticCache() {
  try {
    // Check if cache directory exists
    const exists = await fs.access(cacheDir).then(() => true).catch(() => false)
    
    if (exists) {
      // Remove the cache directory and all its contents
      await fs.rm(cacheDir, { recursive: true, force: true })
      console.log('✨ Semantic cache cleared successfully')
    } else {
      console.log('ℹ️  No semantic cache found to clear')
    }
  } catch (error) {
    console.error('❌ Error clearing semantic cache:', error)
    process.exit(1)
  }
}

// Run the clear cache function
clearSemanticCache()