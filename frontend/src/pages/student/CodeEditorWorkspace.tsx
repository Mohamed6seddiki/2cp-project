import { FileCode2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CodeEditorComponent from '../../components/editor/CodeEditorComponent';

const CodeEditorWorkspace = () => {
  const initialCode = `algorithm Demo
begin
write("Hello from MyAlgo");
end.`;

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

      <CodeEditorComponent initialCode={initialCode} />
      
    </div>
  );
};

export default CodeEditorWorkspace;
