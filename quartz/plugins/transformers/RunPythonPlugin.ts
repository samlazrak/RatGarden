import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"

let blockCounter = 0
const generateBlockId = () =>
  `py-block-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`

export const RunPythonPlugin: QuartzTransformerPlugin = () => ({
  name: "RunPythonPlugin",

  externalResources() {
    return {
      js: [
        {
          src: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js",
          loadTime: "afterDOMReady",
          moduleType: "script",
        },
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js",
          loadTime: "afterDOMReady",
          moduleType: "script",
        },
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js",
          loadTime: "afterDOMReady",
          moduleType: "script",
        },
        {
          contentType: "inline",
          loadTime: "afterDOMReady",
          script: `
            window.pyodidePromise = null;
            window.pyodideLoaded = false;
            window.loadingPyodide = false;

            async function loadPyodide() {
              if (window.pyodideLoaded) return window.pyodide;
              if (window.pyodidePromise) return window.pyodidePromise;
              if (window.loadingPyodide) return null;

              window.loadingPyodide = true;
              window.pyodidePromise = window.loadPyodide().then(async (pyodide) => {
                await pyodide.loadPackage(["numpy", "pandas", "matplotlib", "scipy", "sympy", "scikit-learn"]);
                await pyodide.runPython(\`
import sys
import io
import contextlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
from io import BytesIO

def capture_output():
    """Capture print statements and return output."""
    old_stdout = sys.stdout
    sys.stdout = buffer = io.StringIO()
    return buffer, old_stdout

def restore_output(old_stdout):
    """Restore stdout and return captured output."""
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
    return output

def capture_plots():
    """Capture matplotlib plots as base64 images."""
    plots = []
    for i in plt.get_fignums():
        fig = plt.figure(i)
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.getvalue()).decode()
        plots.append(img_base64)
        plt.close(fig)
    return plots
                \`);
                window.pyodide = pyodide;
                window.pyodideLoaded = true;
                window.loadingPyodide = false;
                return pyodide;
              });
              return window.pyodidePromise;
            }

            async function runPythonCode(codeToRun, outputElement) {
              try {
                const pyodide = await loadPyodide();
                if (!pyodide) {
                  outputElement.innerHTML = '<div class="python-error">Error: Pyodide is still loading. Please try again.</div>';
                  return;
                }

                // Create the Python execution code dynamically
                const pythonExecCode = \`
buffer, old_stdout = capture_output()
exec("""\` + codeToRun.replace(/"/g, '\\"').replace(/\\/g, '\\\\') + \`""")
text_output = restore_output(old_stdout)
plot_data = capture_plots()
(text_output, plot_data)
                \`;

                const result = pyodide.runPython(pythonExecCode);

                const [textOutput, plotData] = result.toJs();
                
                outputElement.innerHTML = '';
                
                if (textOutput && textOutput.trim()) {
                  const textDiv = document.createElement('div');
                  textDiv.className = 'python-text';
                  textDiv.textContent = textOutput;
                  outputElement.appendChild(textDiv);
                }

                if (plotData && plotData.length > 0) {
                  plotData.forEach((imgData) => {
                    const plotDiv = document.createElement('div');
                    plotDiv.className = 'python-plot';
                    const img = document.createElement('img');
                    img.src = \`data:image/png;base64,\${imgData}\`;
                    img.alt = 'Python Plot';
                    plotDiv.appendChild(img);
                    outputElement.appendChild(plotDiv);
                  });
                }

                if (!textOutput.trim() && (!plotData || plotData.length === 0)) {
                  outputElement.innerHTML = '<div class="python-text">Code executed successfully (no output)</div>';
                }

              } catch (error) {
                outputElement.innerHTML = \`<div class="python-error">Error: \${error.message}</div>\`;
              }
            }

            function copyCode(code) {
              navigator.clipboard.writeText(code).then(() => {
                // Visual feedback for copy action
                const copyButtons = document.querySelectorAll('.copy-btn');
                copyButtons.forEach(btn => {
                  if (btn.onclick.toString().includes(code.substring(0, 20))) {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.style.background = '#22c55e';
                    setTimeout(() => {
                      btn.textContent = originalText;
                      btn.style.background = '';
                    }, 1500);
                  }
                });
              });
            }
          `,
        },
      ],
      css: [
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css",
        },
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material-darker.min.css",
        },
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material.min.css",
        },
      ],
    }
  },

  markdownPlugins() {
    return [
      () => (tree: Root, _file) => {
        blockCounter = 0
        visit(tree, "code", (node, index, parent) => {
          if (
            node.lang === "python-r" &&
            parent?.children &&
            index !== undefined
          ) {
            const id = generateBlockId()
            blockCounter++

            const htmlContent = `
              <div class='code-wrapper' id='wrapper-${id}'>
                <div class='code-header'>
                  <span class='code-lang'>Python</span>
                  <div class='code-actions'>
                    <button class='copy-btn' onclick="copyCode(\`${node.value.replace(/`/g, "\\`").replace(/\$/g, "\\$").replace(/\\/g, "\\\\")}\`)">
                      Copy
                    </button>
                    <button class='run-btn' onclick="
                      const output = document.getElementById('output-${id}');
                      const btn = this;
                      btn.disabled = true;
                      btn.textContent = 'Running...';
                      btn.style.opacity = '0.6';
                      runPythonCode(\`${node.value.replace(/`/g, "\\`").replace(/\$/g, "\\$").replace(/\\/g, "\\\\")}\`, output).finally(() => {
                        btn.disabled = false;
                        btn.textContent = 'Run';
                        btn.style.opacity = '1';
                      });
                    ">
                      Run
                    </button>
                    <button class='expand-btn' onclick="
                      const wrapper = document.getElementById('wrapper-${id}');
                      const content = wrapper.querySelector('.code-content');
                      const btn = this;
                      if (content.style.display === 'none') {
                        content.style.display = 'block';
                        btn.textContent = '▼';
                      } else {
                        content.style.display = 'none';
                        btn.textContent = '▶';
                      }
                    ">
                      ▼
                    </button>
                  </div>
                </div>
                <div class='code-content'>
                  <div class='code-editor'>
                    <pre><code class='language-python'>${node.value}</code></pre>
                  </div>
                  <div class='code-output'>
                    <div class='output-header'>Output:</div>
                    <div class='output-content' id='output-${id}'>
                      <div class='output-placeholder'>Click "Run" to execute the code</div>
                    </div>
                  </div>
                </div>
              </div>

              <script>
                (function() {
                  const wrapper = document.getElementById('wrapper-${id}');
                  const codeElement = wrapper.querySelector('code');
                  
                  // Initialize CodeMirror when available
                  function initCodeMirror() {
                    if (typeof CodeMirror !== 'undefined') {
                      const editor = CodeMirror.fromTextArea(
                        document.createElement('textarea'),
                        {
                          mode: 'python',
                          theme: document.documentElement.classList.contains('darkmode') ? 'material-darker' : 'material',
                          lineNumbers: true,
                          readOnly: true,
                          value: \`${node.value.replace(/`/g, "\\`").replace(/\$/g, "\\$").replace(/\\/g, "\\\\")}\`
                        }
                      );
                      
                      const pre = wrapper.querySelector('pre');
                      if (pre) {
                        pre.style.display = 'none';
                        pre.parentNode.insertBefore(editor.getWrapperElement(), pre.nextSibling);
                      }
                    } else {
                      setTimeout(initCodeMirror, 100);
                    }
                  }
                  
                  // Start loading Pyodide when the page loads
                  if (typeof loadPyodide === 'function') {
                    loadPyodide();
                  }
                  
                  setTimeout(initCodeMirror, 50);
                })();
              </script>
            `

            const newNode = {
              type: "html",
              value: htmlContent,
            } as any

            parent.children.splice(index, 1, newNode)
            return index + 1
          }
        })
      },
    ]
  },
})