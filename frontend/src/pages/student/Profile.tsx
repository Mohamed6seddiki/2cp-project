import React from 'react';
import { Camera, Edit2, MapPin, Link as LinkIcon, Calendar, Github, Twitter, Award, Medal, CheckCircle2, AlertCircle, Clock as ClockIcon } from 'lucide-react';
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
            
            
          </div>

          <p className="mt-6 max-w-2xl text-text leading-relaxed">
            Computer Science student passionate about algorithmic problem solving and web development. Learning MyAlgo to prepare for technical interviews and build a solid foundation in graph theory.
          </p>


        </div>
      </Card>

 

    </div>
  );
};

export default Profile;
