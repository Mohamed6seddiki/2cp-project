import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, RefreshCcw, Search, Shield, UserCog } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import {
  getAdminUsers,
  type AdminRole,
  type AdminUser,
  updateAdminUserRole,
} from '../../api/adminApi';

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const ManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return `${user.username} ${user.email} ${user.id}`.toLowerCase().includes(normalizedSearch);
    });
  }, [roleFilter, searchTerm, users]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminUsers();
      setUsers(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (user: AdminUser, nextRole: AdminRole) => {
    if (user.role === nextRole) {
      return;
    }

    if (!window.confirm(`Change role for ${user.email} to ${nextRole}?`)) {
      return;
    }

    try {
      setUpdatingUserId(user.id);
      setError('');
      setNotice('');

      await updateAdminUserRole(user.id, { role: nextRole });
      setNotice(`Updated ${user.email} to ${nextRole}.`);
      await loadUsers();
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Failed to update user role.'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-text-muted">Manage platform users and update admin/student roles.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2 shrink-0">
            <Shield size={18} /> Roles & Permissions
          </Button>
          <Button
            variant="secondary"
            className="gap-2 shrink-0"
            onClick={() => {
              void loadUsers();
            }}
          >
            <RefreshCcw size={16} /> Refresh
          </Button>
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
      {notice && <p className="text-success text-sm">{notice}</p>}

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border bg-surface flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Search size={18} />
            </div>
            <Input
              placeholder="Search by username, email, or id..."
              className="pl-10 h-10 w-full"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              title="Filter users by role"
              className="bg-surface border border-border rounded-md text-sm px-3 h-10 outline-none focus:border-primary transition-colors text-text-muted"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as 'all' | AdminRole)}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <Badge variant="default" className="self-center">{filteredUsers.length} users</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="bg-surface-hover text-text-muted text-sm border-b border-border">
                <th className="p-4 font-medium">User Info</th>
                <th className="p-4 font-medium">Joined Date</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">User Id</th>
                <th className="p-4 font-medium text-right w-56">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td className="p-4 text-text-muted" colSpan={5}>Loading users...</td>
                </tr>
              )}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td className="p-4 text-text-muted" colSpan={5}>No users found.</td>
                </tr>
              )}

              {!loading && filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-surface-hover/50 transition-colors last:border-0 group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-text group-hover:text-primary transition-colors cursor-pointer">{user.username}</div>
                        <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-muted whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'danger' : 'default'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-xs text-text-muted">{user.id}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Promote to admin"
                        onClick={() => {
                          void handleRoleChange(user, 'admin');
                        }}
                        disabled={updatingUserId === user.id || user.role === 'admin'}
                      >
                        <UserCog size={16} />
                      </button>
                      <button
                        className="p-1.5 text-text-muted hover:text-warning hover:bg-warning/10 rounded transition-colors"
                        title="Set as student"
                        onClick={() => {
                          void handleRoleChange(user, 'student');
                        }}
                        disabled={updatingUserId === user.id || user.role === 'student'}
                      >
                        <Shield size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageUsers;
