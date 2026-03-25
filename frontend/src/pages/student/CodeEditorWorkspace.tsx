import React, { useState } from 'react';
import { Play, RotateCcw, Save, Check, AlertCircle, Terminal, FileCode2, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const CodeEditorWorkspace = () => {
  const [code, setCode] = useState('// Determine if a graph is bipartite\n// V = number of vertices\n// adj = adjacency list\n\nfunction isBipartite(V, adj) {\n    // Initialize colors array with -1 (uncolored)\n    let color = new Array(V).fill(-1);\n    \n    // Write your MyAlgo code below\n    \n    \n    return true;\n}');
  
  const [output, setOutput] = useState<{ type: 'idle' | 'running' | 'success' | 'error', msg: string }>({ type: 'idle', msg: 'Run your code to see output here.' });

  const handleRun = () => {
    setOutput({ type: 'running', msg: 'Executing MyAlgo code...' });
    setTimeout(() => {
      setOutput({ 
        type: 'error', 
        msg: 'Runtime Error (Line 12): Cannot read properties of undefined (reading "length"). Check your BFS queue implementation.' 
      });
    }, 800);
  };

  const handleSubmit = () => {
    setOutput({ type: 'running', msg: 'Evaluating test cases...' });
    setTimeout(() => {
      setOutput({ 
        type: 'success', 
        msg: 'All 15 test cases passed! Time: 42ms, Space: 1.2MB. \n\nExcellent solution.' 
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Panel: Problem Statement */}
      <Card className="w-full lg:w-1/3 flex flex-col h-full overflow-hidden border-border bg-surface">
        <div className="p-4 border-b border-border bg-surface-hover flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><FileCode2 size={18} className="text-primary"/> Problem</h2>
          <Badge variant="warning">Medium</Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none text-text">
          <h3 className="text-xl font-bold mb-4">Is Graph Bipartite?</h3>
          <p>
            There is an <strong>undirected</strong> graph with <code>n</code> nodes, where each node is numbered between <code>0</code> and <code>n - 1</code>. You are given a 2D array <code>graph</code>, where <code>graph[u]</code> is an array of nodes that node <code>u</code> is adjacent to.
          </p>
          <p>
            A graph is <strong>bipartite</strong> if the nodes can be partitioned into two independent sets <code>A</code> and <code>B</code> such that every edge in the graph connects a node in set <code>A</code> and a node in set <code>B</code>.
          </p>
          <p>Return <code>true</code> if and only if it is bipartite.</p>

          <h4 className="text-text-heading font-bold mt-6 mb-2">Example 1:</h4>
          <pre className="bg-background border border-border rounded-lg p-3 text-sm text-text-muted">
<code className="text-text">Input:</code> graph = [[1,2,3],[0],[0],[0]]
<code className="text-text">Output:</code> false
<code className="text-text">Explanation:</code> There is no way to partition the nodes into two independent sets.
          </pre>

          <h4 className="text-text-heading font-bold mt-6 mb-2">Constraints:</h4>
          <ul className="list-disc pl-5 space-y-1 text-text-muted">
            <li><code>graph.length == n</code></li>
            <li><code>1 &lt;= n &lt;= 100</code></li>
            <li><code>0 &lt;= graph[u].length &lt; n</code></li>
            <li><code>0 &lt;= graph[u][i] &lt;= n - 1</code></li>
            <li><code>graph[u]</code> does not contain <code>u</code>.</li>
            <li>All the values of <code>graph[u]</code> are unique.</li>
          </ul>
        </div>
        
        {/* Helper Footer */}
        <div className="p-4 border-t border-border bg-surface-hover">
           <Button variant="ghost" fullWidth className="justify-between text-text-muted hover:text-primary transition-colors">
              <span className="text-xs text-text-muted">Use Open Chat for AI help</span>
           </Button>
        </div>
      </Card>

      {/* Right Panel: Editor & Output */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 h-full">
        
        {/* Code Editor */}
        <Card className="flex-1 flex flex-col overflow-hidden border-border bg-background shadow-glow relative">
          {/* Editor Top Bar */}
          <div className="h-12 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-primary">MyAlgo Language</span>
              <div className="h-4 w-px bg-border"></div>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-text-muted" aria-label="Reset Code">
                <RotateCcw size={14} /> Reset
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 gap-1" aria-label="Save Draft">
                <Save size={14} /> Save
              </Button>
              <div className="h-4 w-px bg-border mx-1"></div>
              <Button size="sm" onClick={handleRun} disabled={output.type === 'running'} className="h-8 gap-1.5 shadow-none">
                <Play size={14} /> Run
              </Button>
              <Button size="sm" variant="secondary" onClick={handleSubmit} disabled={output.type === 'running'} className="h-8 gap-1.5 bg-tertiary/20 text-tertiary hover:bg-tertiary/30 border-transparent hover:border-tertiary/50 transition-colors">
                <Check size={14} /> Submit
              </Button>
            </div>
          </div>
          
          {/* Editor Main Area (Mock) */}
          <div className="flex-1 bg-[#0A192F] p-4 font-mono text-sm leading-relaxed overflow-y-auto relative outline-none focus-within:ring-1 focus-within:ring-primary/20 transition-all">
             <div className="absolute left-0 top-0 bottom-0 w-12 bg-surface/50 border-r border-border text-text-muted/50 text-right pr-2 py-4 select-none flex flex-col">
                {[...Array(15)].map((_, i) => <div key={i}>{i+1}</div>)}
             </div>
             <textarea 
               title="Code editor input"
               value={code}
               onChange={(e) => setCode(e.target.value)}
               className="w-full h-full bg-transparent text-[#E2E8F0] resize-none outline-none pl-12 ml-4 whitespace-pre font-mono"
               spellCheck="false"
             />
             
             {/* Floating AI analyze button 
             <button className="absolute bottom-6 right-6 p-2 bg-surface border border-border shadow-lg rounded-lg text-tertiary hover:text-primary hover:border-primary/50 transition-all flex items-center gap-2 text-xs font-semibold group">
               <Sparkles size={16} className="group-hover:animate-spin-slow" />
               <span className="hidden group-hover:inline">Explain Code</span>
             </button>
             */}
          </div>
        </Card>

        {/* Output Panel */}
        <Card className={`h-1/3 shrink-0 flex flex-col overflow-hidden border-border transition-colors duration-300 ${
           output.type === 'error' ? 'border-danger/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
           output.type === 'success' ? 'border-success/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-surface'
        }`}>
          <div className="h-10 border-b border-border bg-surface flex items-center px-4 gap-2">
            <Terminal size={16} className="text-text-muted" />
            <span className="text-sm font-bold text-text-muted">Test Results</span>
            
            {output.type === 'running' && <span className="ml-auto text-xs text-primary animate-pulse">Running...</span>}
            {output.type === 'error' && <span className="ml-auto text-xs text-danger font-bold flex items-center gap-1"><AlertCircle size={14}/> Error</span>}
            {output.type === 'success' && <span className="ml-auto text-xs text-success font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Accepted</span>}
          </div>
          
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
             {output.type === 'idle' && <span className="text-text-muted opacity-50">{output.msg}</span>}
             {output.type === 'running' && <span className="text-text-muted">Compiling MyAlgo Language...<br/>Running internal tests...</span>}
             {output.type === 'error' && <span className="text-danger leading-relaxed">{output.msg}</span>}
             {output.type === 'success' && <span className="text-success leading-relaxed">{output.msg}</span>}
          </div>
        </Card>
      </div>
      
    </div>
  );
};

export default CodeEditorWorkspace;
