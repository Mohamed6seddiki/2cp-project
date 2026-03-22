import React from 'react';
import { Download, Monitor, Terminal } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Downloads = () => {
  const myAlgoPackages = [
    { os: 'Windows', version: 'v1.4.2', size: '82 MB' },
    { os: 'macOS', version: 'v1.4.2', size: '78 MB' },
    { os: 'Linux', version: 'v1.4.2', size: '74 MB' },
  ];

  const desktopAppPackages = [
    { os: 'Windows', version: 'v2.0.1', size: '132 MB' },
    { os: 'macOS', version: 'v2.0.1', size: '128 MB' },
    { os: 'Linux', version: 'v2.0.1', size: '121 MB' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Downloads</h1>
        <p className="text-text-muted">
          Install MyAlgo and the Algonova Desktop App for your platform.
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#00e5cc]/15 p-2 text-[#00e5cc]">
            <Terminal size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Download MyAlgo Language</h2>
            <p className="text-sm text-text-muted">Compiler / interpreter package</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {myAlgoPackages.map((item) => (
            <div key={`myalgo-${item.os}`} className="rounded-lg border border-border bg-background p-4">
              <h3 className="font-semibold">{item.os}</h3>
              <p className="mt-1 text-sm text-text-muted">Version: {item.version}</p>
              <p className="text-sm text-text-muted">Size: {item.size}</p>
              <Button className="mt-4 w-full gap-2 bg-[#00e5cc] text-[#0f1117] hover:bg-[#00cbb4]">
                <Download size={16} />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-[#00e5cc]/15 p-2 text-[#00e5cc]">
            <Monitor size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Download Algonova Desktop App</h2>
            <p className="text-sm text-text-muted">Standalone offline learning app</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {desktopAppPackages.map((item) => (
            <div key={`desktop-${item.os}`} className="rounded-lg border border-border bg-background p-4">
              <h3 className="font-semibold">{item.os}</h3>
              <p className="mt-1 text-sm text-text-muted">Version: {item.version}</p>
              <p className="text-sm text-text-muted">Size: {item.size}</p>
              <Button className="mt-4 w-full gap-2 bg-[#00e5cc] text-[#0f1117] hover:bg-[#00cbb4]">
                <Download size={16} />
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Downloads;
