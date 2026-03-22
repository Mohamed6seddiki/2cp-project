import React, { useState } from 'react';
import { Search, Filter, Shield, UserX, UserCheck, MoreVertical, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 1, name: 'Alex Student', email: 'alex@example.com', role: 'Student', status: 'Active', joined: 'Sep 12, 2025', progress: '42%' },
    { id: 2, name: 'Prof. Davis', email: 'davis@uni.edu', role: 'Admin', status: 'Active', joined: 'Jan 05, 2025', progress: '-' },
    { id: 3, name: 'Sarah Connor', email: 'sarah@example.com', role: 'Student', status: 'Suspended', joined: 'Oct 24, 2025', progress: '15%' },
    { id: 4, name: 'John Doe', email: 'john@university.edu', role: 'Student', status: 'Active', joined: 'Oct 23, 2025', progress: '5%' },
    { id: 5, name: 'Jane Smith', email: 'jsmith@dev.org', role: 'Instructor', status: 'Pending', joined: 'Yesterday', progress: '-' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-text-muted">Oversee students, instructors, and system administrators.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="gap-2 shrink-0"><Shield size={18} /> Roles & Permissions</Button>
           <Button className="shrink-0 shadow-glow">Invite User</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border bg-surface flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
               <Search size={18} />
             </div>
             <Input 
               placeholder="Search by name, email, or ID..." 
               className="pl-10 h-10 w-full"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex gap-2">
             <select title="Filter users by role" className="bg-surface border border-border rounded-md text-sm px-3 h-10 outline-none focus:border-primary transition-colors text-text-muted">
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
             </select>
            <Button variant="secondary" className="px-3 gap-2">
              <Filter size={18} /> Filter
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-hover text-text-muted text-sm border-b border-border">
                <th className="p-4 font-medium w-12"><input title="Select all users" type="checkbox" className="rounded border-border focus:ring-primary/50 text-primary bg-background" /></th>
                <th className="p-4 font-medium">User Info</th>
                <th className="p-4 font-medium">Joined Date</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Mastery</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors last:border-0 group">
                   <td className="p-4"><input title={`Select user ${user.name}`} type="checkbox" className="rounded border-border focus:ring-primary/50 text-primary bg-background" /></td>
                   <td className="p-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">{user.name.charAt(0)}</div>
                        <div>
                           <div className="font-bold text-text group-hover:text-primary transition-colors cursor-pointer">{user.name}</div>
                           <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><Mail size={10} /> {user.email}</div>
                        </div>
                     </div>
                   </td>
                   <td className="p-4 text-text-muted whitespace-nowrap">{user.joined}</td>
                   <td className="p-4">
                     <Badge variant={user.role === 'Admin' ? 'danger' : user.role === 'Instructor' ? 'primary' : 'default'} className={user.role === 'Admin' ? 'bg-danger/10 text-danger border-danger/20' : user.role === 'Instructor' ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                       {user.role}
                     </Badge>
                   </td>
                   <td className="p-4 font-mono text-xs">{user.progress !== '-' ? <span className="bg-surface border border-border px-2 py-1 rounded">{user.progress}</span> : <span className="text-text-muted opacity-50">-</span>}</td>
                   <td className="p-4">
                     <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Suspended' ? 'danger' : 'warning'}>
                       {user.status}
                     </Badge>
                   </td>
                   <td className="p-4 text-right">
                     <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors" title={user.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}>
                          {user.status === 'Suspended' ? <UserCheck size={16} /> : <UserX size={16} />}
                       </button>
                       <button className="p-1.5 text-text-muted hover:text-text hover:bg-surface rounded transition-colors" title="More Options"><MoreVertical size={16} /></button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted bg-surface">
           <span>Showing 1 to 5 of 4,281 users</span>
           <div className="flex gap-1">
             <Button variant="ghost" size="sm" disabled>Prev</Button>
             <Button variant="primary" size="sm" className="px-3">1</Button>
             <Button variant="ghost" size="sm" className="px-3">2</Button>
             <Button variant="ghost" size="sm" className="px-3">3</Button>
             <Button variant="ghost" size="sm">Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default ManageUsers;
