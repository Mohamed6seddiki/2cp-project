import React from 'react';
import { Code2, BrainCircuit, LineChart, ShieldCheck, ArrowRight, PlayCircle, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Abstract background shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-tertiary/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center z-10 w-full">
          <div className="flex justify-center mb-6">
            <Badge variant="primary" className="py-1 px-3 text-sm">New algorithms added weekly</Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Learn Algorithms <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">Interactively</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            Master computer science concepts through structured lessons, real-time coding practice, and dedicated AI assistance powered by MyAlgo Language.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 text-lg font-bold gap-2 group" to="/auth/register">
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="px-8 text-lg font-bold shadow-soft" to="/lessons">
              Explore Lessons
            </Button>
          </div>
          
          {/* Hero Visual Placeholder */}
          <div className="mt-20 max-w-5xl mx-auto bg-surface-hover rounded-xl border border-border shadow-2xl overflow-hidden aspect-video flex flex-col relative group">
             <div className="h-8 bg-surface border-b border-border flex items-center px-4 gap-2">
               <div className="w-3 h-3 rounded-full bg-danger"></div>
               <div className="w-3 h-3 rounded-full bg-warning"></div>
               <div className="w-3 h-3 rounded-full bg-success"></div>
             </div>
             <div className="flex-1 p-8 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGgxdjQwSDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+CjxwYXRoIGQ9Ik0wIDBoNDB2MUgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPgo8L3N2Zz4=')] text-text-muted text-lg tracking-widest font-mono uppercase">
                [ Interactive Platform Visual ]
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface/50 border-y border-border relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              A comprehensive platform combining theory, practical execution, and intelligent support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Interactive Lessons", desc: "Structured, byte-sized modules designed for cognitive ease." },
              { icon: Code2, title: "Real-time Execution", desc: "Write MyAlgo code and see the visual output instantly." },
              { icon: BrainCircuit, title: "AI Assistant", desc: "Context-aware debugging and step-by-step explanations." },
              { icon: LineChart, title: "Progress Tracking", desc: "Detailed analytics to identify your weak spots and strengths." },
              { icon: PlayCircle, title: "Practical Exercises", desc: "Apply theory immediately to reinforce your learning." },
              { icon: ShieldCheck, title: "Admin Management", desc: "Robust tools for instructors to organize classes and content." },
            ].map((feature, idx) => (
              <div key={idx} className="bg-surface p-8 rounded-xl border border-border shadow-soft hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border border-primary/20">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div>
               <h2 className="text-3xl md:text-4xl font-bold mb-8">Mastery through practice</h2>
               <div className="space-y-8">
                 {[
                   { step: 1, title: 'Learn the theory', desc: 'Read concise explanations and look at visual flowcharts.' },
                   { step: 2, title: 'Write the code', desc: 'Practice immediately using our native MyAlgo editor.' },
                   { step: 3, title: 'Get AI insights', desc: 'Stuck? Our AI assistant will guide you step-by-step without giving away the answer.' },
                 ].map((s) => (
                   <div key={s.step} className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center flex-shrink-0 font-bold text-primary">
                       {s.step}
                     </div>
                     <div>
                       <h4 className="text-xl font-bold mb-1">{s.title}</h4>
                       <p className="text-text-muted">{s.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             <div className="bg-surface border border-border rounded-xl p-8 aspect-square flex items-center justify-center text-text-muted">
                [ Code Editor / Visualizer Illustration ]
             </div>
           </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">
              MyAlgo<span className="text-primary">.</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-text-muted">
             <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
             <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="text-sm text-text-muted">
            &copy; 2026 AlgoNova Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
