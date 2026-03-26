import { useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Play, Terminal } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { executeCode, type CodeExecutionResponseDto } from '../../api/codeApi';

type OutputState = {
  type: 'idle' | 'running' | 'success' | 'error';
  message: string;
  result?: CodeExecutionResponseDto;
};

interface Props {
  initialCode: string;
}

const CodeEditorComponent = ({ initialCode }: Props) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<OutputState>({
    type: 'idle',
    message: 'Run your code to see output here.',
  });

  const run = async () => {
    try {
      setOutput({ type: 'running', message: 'Executing MyAlgo code...' });
      const result = await executeCode({ code, language: 'myalgo' });
      setOutput({
        type: result.success ? 'success' : 'error',
        message: result.success ? 'Execution completed successfully.' : 'Execution failed.',
        result,
      });
    } catch (err) {
      setOutput({
        type: 'error',
        message: err instanceof Error ? err.message : 'Execution failed.',
      });
    }
  };

  return (
    <div className="w-full lg:w-2/3 flex flex-col gap-6 h-full">
      <Card className="flex-1 flex flex-col overflow-hidden border-border bg-background shadow-glow relative">
        <div className="h-12 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-primary">MyAlgo Language</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={run} disabled={output.type === 'running'} className="h-8 gap-1.5 shadow-none">
              <Play size={14} /> Run
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={run}
              disabled={output.type === 'running'}
              className="h-8 gap-1.5 bg-tertiary/20 text-tertiary hover:bg-tertiary/30 border-transparent hover:border-tertiary/50 transition-colors"
            >
              <Check size={14} /> Submit
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-[#0A192F] p-4 font-mono text-sm leading-relaxed overflow-y-auto relative outline-none focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <textarea
            title="Code editor input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent text-[#E2E8F0] resize-none outline-none whitespace-pre font-mono"
            spellCheck="false"
          />
        </div>
      </Card>

      <Card className={`h-1/3 shrink-0 flex flex-col overflow-hidden border-border transition-colors duration-300 ${
        output.type === 'error'
          ? 'border-danger/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          : output.type === 'success'
            ? 'border-success/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'bg-surface'
      }`}>
        <div className="h-10 border-b border-border bg-surface flex items-center px-4 gap-2">
          <Terminal size={16} className="text-text-muted" />
          <span className="text-sm font-bold text-text-muted">Execution Results</span>

          {output.type === 'running' && <span className="ml-auto text-xs text-primary animate-pulse">Running...</span>}
          {output.type === 'error' && <span className="ml-auto text-xs text-danger font-bold flex items-center gap-1"><AlertCircle size={14} /> Error</span>}
          {output.type === 'success' && <span className="ml-auto text-xs text-success font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Accepted</span>}
        </div>

        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
          {output.type === 'idle' && <span className="text-text-muted opacity-50">{output.message}</span>}
          {output.type === 'running' && <span className="text-text-muted">Compiling MyAlgo language...{`\n`}Running program...</span>}
          {(output.type === 'error' || output.type === 'success') && (
            <div className="space-y-3">
              <p className={output.type === 'error' ? 'text-danger' : 'text-success'}>{output.message}</p>
              {output.result && (
                <>
                  <p className="text-text-muted">Exit code: {output.result.exitCode} | Time: {output.result.executionTimeMs} ms</p>
                  {output.result.stdout && <p className="text-success">STDOUT:{`\n`}{output.result.stdout}</p>}
                  {output.result.stderr && <p className="text-danger">STDERR:{`\n`}{output.result.stderr}</p>}
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CodeEditorComponent;
