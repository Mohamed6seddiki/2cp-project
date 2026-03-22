import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Moon, Shield, LogOut, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Moon },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-text-muted">Manage your account preferences and personal information.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                }`}
             >
                <tab.icon size={18} /> {tab.label}
             </button>
          ))}
          <div className="h-px bg-border my-4 mx-4"></div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
             <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          
          {activeTab === 'account' && (
            <>
              <Card className="p-6">
                 <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                 <div className="flex flex-col sm:flex-row gap-8 mb-8">
                    <div className="w-24 h-24 rounded-full bg-surface-hover border-2 border-border flex items-center justify-center text-3xl font-bold text-primary shrink-0 relative group cursor-pointer">
                      A
                      <div className="absolute inset-0 bg-background/60 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-sm text-text">Edit</div>
                    </div>
                    <div className="space-y-4 flex-1">
                       <Input label="Full Name" defaultValue="Alex Student" />
                       <Input label="Username" defaultValue="alex_codes" />
                       <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-sm font-medium text-text-muted">Bio</label>
                          <textarea title="Bio" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:border-primary transition-all resize-none" rows={4} defaultValue="Computer Science student passionate about algorithmic problem solving..."></textarea>
                       </div>
                    </div>
                 </div>
                 <div className="flex justify-end gap-3 border-t border-border pt-6">
                   <Button variant="ghost">Cancel</Button>
                   <Button className="gap-2"><Check size={16} /> Save Changes</Button>
                 </div>
              </Card>

              <Card className="p-6">
                 <h2 className="text-xl font-bold mb-6">Email Addresses</h2>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                       <div>
                         <p className="font-medium flex items-center gap-2">alex@university.edu <Badge variant="success" className="py-0.5 text-[10px]">Primary</Badge></p>
                         <p className="text-sm text-text-muted mt-1">Verified</p>
                       </div>
                       <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10">Remove</Button>
                    </div>
                 </div>
                 <Button variant="secondary" className="mt-4 gap-2 border-dashed border-text-muted/50 text-text-muted w-full"><User size={16} /> Add Email Address</Button>
              </Card>
            </>
          )}

          {activeTab === 'preferences' && (
            <Card className="p-6">
               <h2 className="text-xl font-bold mb-6">Appearance</h2>
               <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-text-muted mb-4">Theme</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                       <button className="border-2 border-primary bg-background rounded-lg p-4 flex flex-col items-center gap-3 relative overflow-hidden">
                          <div className="absolute top-2 right-2 text-primary"><Check size={16} /></div>
                          <div className="w-full h-20 bg-surface rounded border border-border flex items-center justify-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                             <div className="w-16 h-2 bg-text-muted rounded"></div>
                          </div>
                          <span className="font-medium text-sm">Deep Dark (Default)</span>
                       </button>
                       <button className="border-2 border-transparent hover:border-border bg-white rounded-lg p-4 flex flex-col items-center gap-3 relative overflow-hidden">
                          <div className="w-full h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-blue-600/20"></div>
                             <div className="w-16 h-2 bg-gray-400 rounded"></div>
                          </div>
                          <span className="font-medium text-sm text-gray-800">Light</span>
                       </button>
                    </div>
                  </div>

                  <hr className="border-border my-6" />
                  
                  <div>
                    <h3 className="text-sm font-medium text-text-muted mb-4">Language</h3>
                    <select title="Preferred language" className="w-full max-w-sm bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-1 focus:border-primary transition-all">
                       <option>English (US)</option>
                       <option>Spanish</option>
                       <option>French</option>
                    </select>
                  </div>
               </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <>
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Security Settings
                </h2>
                <div className="space-y-4">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="At least 8 characters" />
                  <Input label="Confirm New Password" type="password" placeholder="Repeat new password" />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button className="gap-2"><Check size={16} /> Update Password</Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Two-factor Authentication</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
                  <div>
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-text-muted">Protect your account with a one-time verification code.</p>
                  </div>
                  <Button variant="secondary">Enable 2FA</Button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notification Preferences
              </h2>
              <div className="space-y-5">
                {[
                  { id: 'lesson-updates', title: 'Lesson updates', desc: 'Get notified when new lessons are published.' },
                  { id: 'daily-reminder', title: 'Daily reminder', desc: 'Receive a reminder to keep your streak alive.' },
                  { id: 'ai-tips', title: 'AI learning tips', desc: 'Weekly personalized tips from the AI assistant.' },
                  { id: 'security-alerts', title: 'Security alerts', desc: 'Important login and account activity notifications.' },
                ].map((item, index) => (
                  <label key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4 cursor-pointer">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-text-muted">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={index < 2 || item.id === 'security-alerts'}
                      className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button className="gap-2"><Check size={16} /> Save Preferences</Button>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
