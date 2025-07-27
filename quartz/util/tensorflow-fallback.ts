// TensorFlow fallback utility for serverless environments
// This provides a safe way to import TensorFlow that works in both Node.js and serverless environments

let tf: any = null
let tfNode: any = null

// Try to import TensorFlow.js (browser-compatible)
try {
  tf = require("@tensorflow/tfjs")
} catch (error) {
  console.warn("TensorFlow.js not available")
}

// Try to import TensorFlow.js Node.js backend (only in Node.js environments)
if (typeof window === "undefined") {
  try {
    // Only try to import tfjs-node in development or when explicitly needed
    if (process.env.NODE_ENV !== "production" || process.env.ENABLE_TFJS_NODE === "true") {
      tfNode = require("@tensorflow/tfjs-node")
    }
  } catch (error) {
    console.warn("TensorFlow.js Node.js backend not available")
  }
}

export function getTensorFlow() {
  return tf
}

export function getTensorFlowNode() {
  return tfNode
}

export function isTensorFlowAvailable() {
  return tf !== null
}

export function isTensorFlowNodeAvailable() {
  return tfNode !== null
}

export async function initializeTensorFlow() {
  if (!tf) {
    console.warn("TensorFlow not available")
    return false
  }

  try {
    await tf.ready()
    console.log("TensorFlow backend initialized:", tf.getBackend())
    return true
  } catch (error) {
    console.error("Failed to initialize TensorFlow:", error)
    return false
  }
}

export function createPlaceholderEmbedding(size: number = 512): number[] {
  return new Array(size).fill(0)
}
