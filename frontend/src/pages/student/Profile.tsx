import React from 'react';
import { Camera, Edit2, MapPin, Link as LinkIcon, Calendar, Github, Twitter, Award, Medal } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header Profile Card */}
      <Card className="overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 via-tertiary/20 to-surface border-b border-border relative">
           <div className="absolute top-4 right-4">
              <Button size="sm" variant="secondary" className="bg-background/50 backdrop-blur border-border gap-2">
                 <Edit2 size={14} /> Edit Cover
              </Button>
           </div>
        </div>
        
        <div className="px-6 md:px-10 pb-8 relative">
          {/* Avatar */}
          <div className="absolute -top-16 border-4 border-surface bg-surface-hover rounded-2xl w-32 h-32 flex items-center justify-center shadow-lg group">
             <span className="text-4xl font-bold text-primary">A</span>
             <button title="Change avatar" className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
               <Camera size={24} className="text-text" />
             </button>
          </div>
          
          <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-bold">Alex Student</h1>
              <p className="text-text-muted mt-1 font-mono text-sm">@alex_codes</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><MapPin size={16} /> San Francisco, CA</span>
                <span className="flex items-center gap-1.5"><Calendar size={16} /> Joined Sep 2025</span>
              </div>
            </div>
            
            <Button className="gap-2 shrink-0"><Edit2 size={16} /> Edit Profile</Button>
          </div>

          <p className="mt-6 max-w-2xl text-text leading-relaxed">
            Computer Science student passionate about algorithmic problem solving and web development. Learning MyAlgo to prepare for technical interviews and build a solid foundation in graph theory.
          </p>

          <div className="flex gap-3 mt-6">
            <a href="#" title="GitHub profile" className="p-2 bg-surface-hover border border-border rounded-lg text-text-muted hover:text-text hover:border-text-muted transition-colors">
              <Github size={18} />
            </a>
            <a href="#" title="Twitter profile" className="p-2 bg-surface-hover border border-border rounded-lg text-text-muted hover:text-text hover:border-text-muted transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="flex items-center gap-2 px-3 py-2 bg-surface-hover border border-border rounded-lg text-text-muted hover:text-text hover:border-text-muted transition-colors text-sm font-medium">
              <LinkIcon size={16} /> Portfolio
            </a>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Col: Badges & Stats */}
        <div className="space-y-8">
           <Card className="p-6">
             <h3 className="font-bold mb-4 flex items-center gap-2"><Award size={18} className="text-primary" /> Achievements</h3>
             <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Medal, label: 'Fast Solver', color: 'text-warning' },
                  { icon: Medal, label: 'Bug Hunter', color: 'text-primary' },
                  { icon: Medal, label: 'Graph Pro', color: 'text-danger' },
                  { icon: Medal, label: '7-Days', color: 'text-success' },
                  { icon: Medal, label: 'Early Adopter', color: 'text-tertiary' },
                ].map((b, i) => (
                   <div key={i} className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                      <div className={`w-12 h-12 rounded-full bg-surface-hover border border-border flex items-center justify-center ${b.color} group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-glow`}>
                         <b.icon size={20} />
                      </div>
                      <span className="text-xs text-text-muted font-medium leading-tight">{b.label}</span>
                   </div>
                ))}
             </div>
           </Card>

           <Card className="p-6">
             <h3 className="font-bold mb-4">Quick Stats</h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-border">
                 <span className="text-text-muted">Rank</span>
                 <Badge variant="primary">Gold Tier</Badge>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-border">
                 <span className="text-text-muted">Global Position</span>
                 <span className="font-bold">#4,281</span>
               </div>
               <div className="flex justify-between items-center py-2">
                 <span className="text-text-muted">Total Points</span>
                 <span className="font-bold text-success flex items-center gap-1">12,450 xp</span>
               </div>
             </div>
           </Card>
        </div>

        {/* Right Col: Recent Activity */}
        <Card className="md:col-span-2 p-6">
          <h3 className="font-bold mb-6 text-xl">Recent Submissions</h3>
          
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-0 md:before:translate-x-4 before:h-full before:w-px before:bg-border">
            {[
              { status: 'Accepted', date: 'Oct 24, 2025', title: 'Two Sum', time: '14ms', icon: CheckCircle2, color: 'text-success bg-success/10 border-success/20' },
              { status: 'Accepted', date: 'Oct 23, 2025', title: 'Valid Palindrome', time: '32ms', icon: CheckCircle2, color: 'text-success bg-success/10 border-success/20' },
              { status: 'Wrong Answer', date: 'Oct 22, 2025', title: 'Merge Intervals', time: 'N/A', icon: AlertCircle, color: 'text-danger bg-danger/10 border-danger/20' },
              { status: 'Time Limit', date: 'Oct 20, 2025', title: 'Longest Substring', time: '>2000ms', icon: ClockIcon, color: 'text-warning bg-warning/10 border-warning/20' },
            ].map((sub, i) => (
              <div key={i} className="relative flex items-start gap-4 pb-8 last:pb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border z-10 bg-background ${sub.color}`}>
                   <sub.icon size={14} className="fill-current" />
                </div>
                <div className="bg-surface-hover border border-border p-4 rounded-lg w-full flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:-translate-y-1 transition-transform">
                   <div>
                     <h4 className="font-bold mb-1 hover:text-primary cursor-pointer transition-colors max-w-fit">{sub.title}</h4>
                     <p className="text-xs text-text-muted">{sub.date}</p>
                   </div>
                   <div className="flex items-center gap-4 text-sm font-medium">
                     <span className={sub.status.includes('Accepted') ? 'text-success' : sub.status.includes('Wrong') ? 'text-danger' : 'text-warning'}>{sub.status}</span>
                     <span className="text-text-muted bg-surface px-2 py-1 border border-border rounded">{sub.time}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button fullWidth variant="ghost" className="mt-8 border border-border">View Complete History</Button>
        </Card>
      </div>

    </div>
  );
};

// extracted imports missing
import { CheckCircle2, AlertCircle, Clock as ClockIcon } from 'lucide-react';

export default Profile;
