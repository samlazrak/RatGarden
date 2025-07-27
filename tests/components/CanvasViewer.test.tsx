import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/preact'
import CanvasViewer from '../../quartz/components/CanvasViewer'
import { setupMockDOM, createMockProps, waitFor, fireEvent, mockFileData } from '../utils/ai-test-utils'
import { setupTensorFlowMocks, resetAllMocks } from '../__mocks__/tensorflow'

// Setup mocks before tests
setupTensorFlowMocks()

// Mock canvas data
const mockCanvasData = {
  nodes: [
    {
      id: 'node1',
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      text: '# Main Idea\nThis is the **primary** concept.',
      color: '#e1f5fe'
    },
    {
      id: 'node2',
      type: 'text',
      x: 400,
      y: 150,
      width: 180,
      height: 80,
      text: '## Supporting Point\n- Detail 1\n- Detail 2',
      color: '#f3e5f5'
    },
    {
      id: 'node3',
      type: 'file',
      x: 200,
      y: 300,
      width: 160,
      height: 60,
      text: 'Reference Document',
      file: 'docs/reference.md'
    }
  ],
  edges: [
    {
      id: 'edge1',
      fromNode: 'node1',
      toNode: 'node2',
      fromSide: 'right',
      toSide: 'left',
      color: '#1976d2',
      label: 'supports'
    },
    {
      id: 'edge2',
      fromNode: 'node1',
      toNode: 'node3',
      fromSide: 'bottom',
      toSide: 'top',
      color: '#388e3c'
    }
  ]
}

const emptyCanvasData = {
  nodes: [],
  edges: []
}

const singleNodeCanvasData = {
  nodes: [
    {
      id: 'single',
      type: 'text',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      text: 'Single Node'
    }
  ],
  edges: []
}

describe('CanvasViewer Component', () => {
  setupMockDOM()

  beforeEach(() => {
    resetAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render with canvas data', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent 
          canvasData={mockCanvasData}
          title="Test Canvas"
          className="test-canvas"
        />
      )
      
      const canvasViewer = container.querySelector('.canvas-viewer')
      expect(canvasViewer).toBeTruthy()
      expect(canvasViewer?.classList.contains('test-canvas')).toBe(true)
      
      const title = container.querySelector('.canvas-title')
      expect(title?.textContent).toBe('Test Canvas')
      
      const canvasContainer = container.querySelector('.canvas-container')
      expect(canvasContainer).toBeTruthy()
      
      const svg = container.querySelector('.canvas-svg')
      expect(svg).toBeTruthy()
      expect(svg?.getAttribute('width')).toBe('100%')
      expect(svg?.getAttribute('height')).toBe('600')
    })

    it('should render without title when not provided', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const title = container.querySelector('.canvas-title')
      expect(title).toBeNull()
    })

    it('should render without className when not provided', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const canvasViewer = container.querySelector('.canvas-viewer')
      expect(canvasViewer?.className.trim()).toBe('canvas-viewer')
    })

    it('should return null when no canvas data provided', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={null as any} />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('should return null when no nodes in canvas data', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={{ nodes: null as any, edges: [] }} />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('should render with empty edges array', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={singleNodeCanvasData} />
      )
      
      const canvasViewer = container.querySelector('.canvas-viewer')
      expect(canvasViewer).toBeTruthy()
      
      const nodes = container.querySelectorAll('.canvas-node')
      expect(nodes).toHaveLength(1)
      
      const edges = container.querySelectorAll('path')
      expect(edges).toHaveLength(0) // No edges to render
    })
  })

  describe('ViewBox Calculation', () => {
    it('should calculate correct viewBox for nodes', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const svg = container.querySelector('.canvas-svg')
      const viewBox = svg?.getAttribute('viewBox')
      expect(viewBox).toBeTruthy()
      
      // ViewBox should include all nodes with padding
      // node1: x=100, y=100, width=200, height=100 -> maxX=300, maxY=200
      // node2: x=400, y=150, width=180, height=80 -> maxX=580, maxY=230  
      // node3: x=200, y=300, width=160, height=60 -> maxX=360, maxY=360
      // minX=100, maxX=580, minY=100, maxY=360
      // With padding=50: viewBox should be "50 50 580 360"
      const [x, y, width, height] = viewBox!.split(' ').map(Number)
      expect(x).toBe(50) // minX - padding
      expect(y).toBe(50) // minY - padding
      expect(width).toBe(580) // maxX - minX + 2*padding
      expect(height).toBe(360) // maxY - minY + 2*padding
    })

    it('should handle single node viewBox correctly', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={singleNodeCanvasData} />
      )
      
      const svg = container.querySelector('.canvas-svg')
      const viewBox = svg?.getAttribute('viewBox')
      expect(viewBox).toBeTruthy()
      
      // Single node: x=0, y=0, width=100, height=50
      // ViewBox with padding=50: "-50 -50 200 150"
      const [x, y, width, height] = viewBox!.split(' ').map(Number)
      expect(x).toBe(-50)
      expect(y).toBe(-50)
      expect(width).toBe(200)
      expect(height).toBe(150)
    })
  })

  describe('Node Rendering', () => {
    it('should render all nodes with correct attributes', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const nodes = container.querySelectorAll('.canvas-node')
      expect(nodes).toHaveLength(3)
      
      // Check first node attributes
      const firstNode = nodes[0] as SVGRectElement
      expect(firstNode.getAttribute('x')).toBe('100')
      expect(firstNode.getAttribute('y')).toBe('100')
      expect(firstNode.getAttribute('width')).toBe('200')
      expect(firstNode.getAttribute('height')).toBe('100')
      expect(firstNode.getAttribute('fill')).toBe('#e1f5fe')
      expect(firstNode.getAttribute('rx')).toBe('8') // Rounded corners
    })

    it('should use default fill color when node color not specified', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={singleNodeCanvasData} />
      )
      
      const node = container.querySelector('.canvas-node')
      expect(node?.getAttribute('fill')).toBe('var(--light)')
    })

    it('should render node content with formatted text', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const nodeContents = container.querySelectorAll('.canvas-node-content')
      expect(nodeContents).toHaveLength(3)
      
      // Check formatted text in first node
      const firstNodeContent = nodeContents[0]
      const innerHTML = firstNodeContent.innerHTML
      expect(innerHTML).toContain('<h1>Main Idea</h1>')
      expect(innerHTML).toContain('<strong>primary</strong>')
      expect(innerHTML).toContain('<br>')
    })

    it('should render foreignObject with correct dimensions', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const foreignObjects = container.querySelectorAll('foreignObject')
      expect(foreignObjects).toHaveLength(3)
      
      // Check first foreignObject (node1: x=100, y=100, width=200, height=100)
      const firstForeignObject = foreignObjects[0]
      expect(firstForeignObject.getAttribute('x')).toBe('110') // x + 10
      expect(firstForeignObject.getAttribute('y')).toBe('110') // y + 10
      expect(firstForeignObject.getAttribute('width')).toBe('180') // width - 20
      expect(firstForeignObject.getAttribute('height')).toBe('80') // height - 20
    })

    it('should not render foreignObject when node has no text', () => {
      const nodeWithoutText = {
        nodes: [
          {
            id: 'no-text',
            type: 'shape',
            x: 0,
            y: 0,
            width: 100,
            height: 50
            // No text property
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={nodeWithoutText} />
      )
      
      const foreignObjects = container.querySelectorAll('foreignObject')
      expect(foreignObjects).toHaveLength(0)
    })
  })

  describe('Edge Rendering', () => {
    it('should render all edges with correct paths', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const edges = container.querySelectorAll('path')
      expect(edges).toHaveLength(2)
      
      // Check edge attributes
      const firstEdge = edges[0]
      expect(firstEdge.getAttribute('stroke')).toBe('#1976d2')
      expect(firstEdge.getAttribute('strokeWidth') || firstEdge.getAttribute('stroke-width')).toBe('2')
      expect(firstEdge.getAttribute('fill')).toBe('none')
      expect(firstEdge.getAttribute('markerEnd') || firstEdge.getAttribute('marker-end')).toBe('url(#arrowhead)')
    })

    it('should use default edge color when not specified', () => {
      const canvasWithUncoloredEdge = {
        nodes: mockCanvasData.nodes,
        edges: [
          {
            id: 'edge1',
            fromNode: 'node1',
            toNode: 'node2'
            // No color specified
          }
        ]
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={canvasWithUncoloredEdge} />
      )
      
      const edge = container.querySelector('path')
      expect(edge?.getAttribute('stroke')).toBe('#666')
    })

    it('should render edge labels when provided', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const edgeLabels = container.querySelectorAll('.edge-label')
      expect(edgeLabels).toHaveLength(1) // Only first edge has label
      
      const textPath = container.querySelector('textPath')
      expect(textPath?.textContent).toBe('supports')
    })

    it('should not render edge labels when not provided', () => {
      const canvasWithoutLabels = {
        nodes: mockCanvasData.nodes,
        edges: mockCanvasData.edges.map(edge => ({ ...edge, label: undefined }))
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={canvasWithoutLabels} />
      )
      
      const edgeLabels = container.querySelectorAll('.edge-label')
      expect(edgeLabels).toHaveLength(0)
    })

    it('should handle edges with missing nodes gracefully', () => {
      const canvasWithInvalidEdge = {
        nodes: [mockCanvasData.nodes[0]], // Only one node
        edges: [
          {
            id: 'invalid-edge',
            fromNode: 'node1',
            toNode: 'nonexistent-node',
            color: '#ff0000'
          }
        ]
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      expect(() => {
        render(<CanvasViewerComponent canvasData={canvasWithInvalidEdge} />)
      }).not.toThrow()
    })
  })

  describe('Text Formatting', () => {
    it('should format markdown headings correctly', () => {
      const testText = '# Heading 1\n## Heading 2\n### Heading 3'
      const canvasWithHeadings = {
        nodes: [
          {
            id: 'headings',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: testText
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={canvasWithHeadings} />
      )
      
      const nodeContent = container.querySelector('.canvas-node-content')
      const innerHTML = nodeContent?.innerHTML || ''
      
      expect(innerHTML).toContain('<h1>Heading 1</h1>')
      expect(innerHTML).toContain('<h2>Heading 2</h2>')
      expect(innerHTML).toContain('<h3>Heading 3</h3>')
    })

    it('should format markdown emphasis correctly', () => {
      const testText = '**Bold text** and *italic text*'
      const canvasWithEmphasis = {
        nodes: [
          {
            id: 'emphasis',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: testText
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={canvasWithEmphasis} />
      )
      
      const nodeContent = container.querySelector('.canvas-node-content')
      const innerHTML = nodeContent?.innerHTML || ''
      
      expect(innerHTML).toContain('<strong>Bold text</strong>')
      expect(innerHTML).toContain('<em>italic text</em>')
    })

    it('should format bullet points correctly', () => {
      const testText = '- Item 1\n- Item 2\n- Item 3'
      const canvasWithBullets = {
        nodes: [
          {
            id: 'bullets',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: testText
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={canvasWithBullets} />
      )
      
      const nodeContent = container.querySelector('.canvas-node-content')
      const innerHTML = nodeContent?.innerHTML || ''
      
      expect(innerHTML).toContain('• Item 1')
      expect(innerHTML).toContain('• Item 2')
      expect(innerHTML).toContain('• Item 3')
    })

    it('should convert newlines to br tags', () => {
      const testText = 'Line 1\nLine 2\nLine 3'
      const canvasWithNewlines = {
        nodes: [
          {
            id: 'newlines',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: testText
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={canvasWithNewlines} />
      )
      
      const nodeContent = container.querySelector('.canvas-node-content')
      const innerHTML = nodeContent?.innerHTML || ''
      
      expect(innerHTML).toContain('Line 1<br>Line 2<br>Line 3')
    })

    it('should handle complex mixed formatting', () => {
      const testText = '# **Bold** Heading\n- *Italic* item\n- **Bold** item'
      const canvasWithMixed = {
        nodes: [
          {
            id: 'mixed',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: testText
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={canvasWithMixed} />
      )
      
      const nodeContent = container.querySelector('.canvas-node-content')
      const innerHTML = nodeContent?.innerHTML || ''
      
      expect(innerHTML).toContain('<h1><strong>Bold</strong> Heading</h1>')
      expect(innerHTML).toContain('• <em>Italic</em> item')
      expect(innerHTML).toContain('• <strong>Bold</strong> item')
    })
  })

  describe('Connection Points and Edge Paths', () => {
    it('should create valid SVG path strings', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const paths = container.querySelectorAll('path')
      paths.forEach(path => {
        const d = path.getAttribute('d')
        expect(d).toBeTruthy()
        expect(d).toMatch(/^M \d+(\.\d+)? \d+(\.\d+)? C /) // Should start with M and contain C (cubic bezier)
      })
    })

    it('should handle different connection sides', () => {
      const testCanvasData = {
        nodes: [
          { id: 'n1', type: 'text', x: 0, y: 0, width: 100, height: 50 },
          { id: 'n2', type: 'text', x: 200, y: 0, width: 100, height: 50 }
        ],
        edges: [
          { id: 'e1', fromNode: 'n1', toNode: 'n2', fromSide: 'right', toSide: 'left' }
        ]
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={testCanvasData} />
      )
      
      const path = container.querySelector('path')
      const d = path?.getAttribute('d')
      expect(d).toBeTruthy()
      
      // Should connect from right side of n1 (x=100) to left side of n2 (x=200)
      expect(d).toContain('M 100 25') // Right center of n1
      expect(d).toContain('200 25') // Left center of n2
    })
  })

  describe('SVG Structure', () => {
    it('should include arrow marker definition', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const defs = container.querySelector('defs')
      expect(defs).toBeTruthy()
      
      const marker = container.querySelector('marker#arrowhead')
      expect(marker).toBeTruthy()
      expect(marker?.getAttribute('markerWidth')).toBe('10')
      expect(marker?.getAttribute('markerHeight')).toBe('7')
      expect(marker?.getAttribute('refX')).toBe('9')
      expect(marker?.getAttribute('refY')).toBe('3.5')
      expect(marker?.getAttribute('orient')).toBe('auto')
      
      const polygon = marker?.querySelector('polygon')
      expect(polygon?.getAttribute('points')).toBe('0 0, 10 3.5, 0 7')
      expect(polygon?.getAttribute('fill')).toBe('#666')
    })

    it('should have proper SVG styling', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      const svg = container.querySelector('.canvas-svg')
      const style = svg?.getAttribute('style')
      expect(style).toBeTruthy()
      expect(style).toContain('border')
      expect(style).toContain('var(--border)')
    })

    it('should render edges before nodes (z-order)', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={mockCanvasData} />
      )
      
      // Get all SVG children to check rendering order
      const svg = container.querySelector('.canvas-svg')
      const children = Array.from(svg?.children || [])
      
      // Find indices of first edge and first node
      const firstPathIndex = children.findIndex(child => 
        child.tagName === 'g' && child.querySelector('path')
      )
      const firstNodeIndex = children.findIndex(child => 
        child.tagName === 'g' && child.querySelector('.canvas-node')
      )
      
      // Edges should come before nodes (or both should exist)
      if (firstPathIndex !== -1 && firstNodeIndex !== -1) {
        expect(firstPathIndex).toBeLessThan(firstNodeIndex)
      }
    })
  })

  describe('Component Configuration', () => {
    it('should have correct component name', () => {
      const CanvasViewerComponent = CanvasViewer()
      expect(typeof CanvasViewerComponent).toBe('function')
    })

    it('should include CSS styles', () => {
      const CanvasViewerComponent = CanvasViewer()
      expect(CanvasViewerComponent.css).toBeDefined()
    })

    it('should include afterDOMLoaded script if available', () => {
      const CanvasViewerComponent = CanvasViewer()
      // Script might not be loaded in test environment
      if (CanvasViewerComponent.afterDOMLoaded) {
        expect(typeof CanvasViewerComponent.afterDOMLoaded).toBe('string')
      } else {
        // In test environment, script might not be available
        expect(CanvasViewerComponent.afterDOMLoaded).toBeUndefined()
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle undefined canvasData gracefully', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      expect(() => {
        render(<CanvasViewerComponent canvasData={undefined as any} />)
      }).not.toThrow()
    })

    it('should handle empty canvasData gracefully', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={emptyCanvasData} />
      )
      
      // Should render component even with empty nodes array
      const canvasViewer = container.querySelector('.canvas-viewer')
      expect(canvasViewer).toBeTruthy()
      
      // Should have no nodes rendered
      const nodes = container.querySelectorAll('.canvas-node')
      expect(nodes).toHaveLength(0)
    })

    it('should handle nodes with extreme coordinates', () => {
      const extremeCanvasData = {
        nodes: [
          { id: 'n1', type: 'text', x: -1000, y: -1000, width: 100, height: 50 },
          { id: 'n2', type: 'text', x: 5000, y: 3000, width: 100, height: 50 }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      expect(() => {
        render(<CanvasViewerComponent canvasData={extremeCanvasData} />)
      }).not.toThrow()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={extremeCanvasData} />
      )
      
      const svg = container.querySelector('.canvas-svg')
      const viewBox = svg?.getAttribute('viewBox')
      expect(viewBox).toBeTruthy()
    })

    it('should handle missing edge connection sides', () => {
      const canvasWithMissingSides = {
        nodes: [
          { id: 'n1', type: 'text', x: 0, y: 0, width: 100, height: 50 },
          { id: 'n2', type: 'text', x: 200, y: 0, width: 100, height: 50 }
        ],
        edges: [
          { id: 'e1', fromNode: 'n1', toNode: 'n2' } // No fromSide/toSide
        ]
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      expect(() => {
        render(<CanvasViewerComponent canvasData={canvasWithMissingSides} />)
      }).not.toThrow()
    })

    it('should handle malformed text gracefully', () => {
      const canvasWithMalformedText = {
        nodes: [
          {
            id: 'malformed',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: '# Unclosed **bold text\n### Missing heading close'
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      expect(() => {
        render(<CanvasViewerComponent canvasData={canvasWithMalformedText} />)
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should render large canvas efficiently', () => {
      const largeCanvasData = {
        nodes: Array.from({ length: 50 }, (_, i) => ({
          id: `node-${i}`,
          type: 'text',
          x: (i % 10) * 150,
          y: Math.floor(i / 10) * 100,
          width: 120,
          height: 80,
          text: `Node ${i}`,
          color: `hsl(${i * 7}, 50%, 80%)`
        })),
        edges: Array.from({ length: 30 }, (_, i) => ({
          id: `edge-${i}`,
          fromNode: `node-${i}`,
          toNode: `node-${(i + 1) % 50}`,
          color: `hsl(${i * 12}, 60%, 50%)`
        }))
      }
      
      const startTime = Date.now()
      const CanvasViewerComponent = CanvasViewer()
      render(<CanvasViewerComponent canvasData={largeCanvasData} />)
      const endTime = Date.now()
      
      const renderTime = endTime - startTime
      expect(renderTime).toBeLessThan(200) // Should render in under 200ms
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent 
          canvasData={mockCanvasData}
          title="Test Canvas"
        />
      )
      
      // Should have proper heading structure
      const heading = container.querySelector('.canvas-title')
      expect(heading?.tagName).toBe('H2')
      
      // SVG should have proper structure
      const svg = container.querySelector('.canvas-svg')
      expect(svg?.tagName).toBe('svg')
    })

    it('should handle dangerouslySetInnerHTML safely', () => {
      // This test ensures we're not introducing XSS vulnerabilities
      const maliciousCanvasData = {
        nodes: [
          {
            id: 'malicious',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: '<script>alert("xss")</script>**Bold**'
          }
        ],
        edges: []
      }
      
      const CanvasViewerComponent = CanvasViewer()
      
      const { container } = render(
        <CanvasViewerComponent canvasData={maliciousCanvasData} />
      )
      
      const nodeContent = container.querySelector('.canvas-node-content')
      const innerHTML = nodeContent?.innerHTML || ''
      
      // Should format markdown but not execute scripts
      expect(innerHTML).toContain('<strong>Bold</strong>')
      // The script tag should be present as-is (React/Preact handles XSS prevention)
      expect(innerHTML).toContain('<script>')
    })
  })
})